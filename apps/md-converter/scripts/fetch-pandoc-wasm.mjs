// Descarga verificada de pandoc.wasm oficial (jgm/pandoc 3.11).
// El binario NO vive en git: este script lo materializa en public/pandoc.wasm
// (gitignorado) antes del build. Idempotente: si el fichero existe y coincide
// en tamaño+sha256, no descarga nada.
//
// El binario 3.11 usa la propuesta exnref de WebAssembly (soportada por todos
// los navegadores evergreen desde ~2025); la validación de imports/exports de
// este script parsea las secciones del módulo a mano para no depender del
// motor que ejecute el script.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateRawSync } from 'node:zlib';
import https from 'node:https';

const URL = 'https://github.com/jgm/pandoc/releases/download/3.11/pandoc-3.11.wasm.zip';
const ZIP_SHA256 = 'bd856c19094f5333ee92f239dd93d288a05429f1d957efef1c37e7bb97ac14bd';
const WASM_SHA256 = '44829227ac8f74fb57387d12ac7e347e89fa851510e089263d27f5af2e266332';
const WASM_SIZE = 59163604;

const EXPECTED_IMPORTS = [
  'args_get', 'args_sizes_get', 'clock_res_get', 'clock_time_get', 'environ_get',
  'environ_sizes_get', 'fd_close', 'fd_fdstat_get', 'fd_fdstat_set_flags',
  'fd_filestat_get', 'fd_filestat_set_size', 'fd_prestat_dir_name', 'fd_prestat_get',
  'fd_read', 'fd_readdir', 'fd_renumber', 'fd_seek', 'fd_write', 'path_create_directory',
  'path_filestat_get', 'path_filestat_set_times', 'path_open', 'path_readlink',
  'path_remove_directory', 'path_rename', 'path_symlink', 'path_unlink_file',
  'poll_oneoff', 'proc_exit', 'random_get'
];

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const target = join(appDir, 'public', 'pandoc.wasm');

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function download(url, redirects = 5) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'md-converter-fetch-script' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          if (redirects === 0) return reject(new Error('Demasiadas redirecciones'));
          res.resume();
          return resolve(download(res.headers.location, redirects - 1));
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode} en ${url}`));
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      })
      .on('error', reject);
  });
}

// Lector LEB128 unsigned sobre Buffer con offset mutable.
function readUleb(buf, off) {
  let result = 0;
  let shift = 0;
  let len = 0;
  for (;;) {
    const byte = buf[off + len];
    len += 1;
    result |= (byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) break;
    shift += 7;
  }
  return [result, len];
}

function readName(buf, off) {
  const [len, lenSize] = readUleb(buf, off);
  const start = off + lenSize;
  return [buf.subarray(start, start + len).toString('utf8'), lenSize + len];
}

// Extracción dirigida: localiza la entrada por central directory y corta los
// bytes exactos usando el tamaño comprimido del central directory.
function extractWasmExact(zip) {
  const eocd = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (eocd < 0) throw new Error('ZIP sin End Of Central Directory');
  const count = zip.readUInt16LE(eocd + 10);
  let off = zip.readUInt32LE(eocd + 16);
  let best = null;
  for (let i = 0; i < count; i += 1) {
    if (zip.readUInt32LE(off) !== 0x02014b50) throw new Error('Central directory corrupto');
    const method = zip.readUInt16LE(off + 10);
    const compSize = zip.readUInt32LE(off + 20);
    const nameLen = zip.readUInt16LE(off + 28);
    const extraLen = zip.readUInt16LE(off + 30);
    const commentLen = zip.readUInt16LE(off + 32);
    const headerOff = zip.readUInt32LE(off + 42);
    const name = zip.subarray(off + 46, off + 46 + nameLen).toString('utf8');
    if (name.endsWith('.wasm') && (!best || compSize > best.compSize)) {
      best = { method, compSize, headerOff };
    }
    off += 46 + nameLen + extraLen + commentLen;
  }
  if (!best) throw new Error('ZIP sin entrada .wasm');
  if (best.method !== 0 && best.method !== 8) throw new Error(`Método ZIP ${best.method} no soportado`);
  const lh = best.headerOff;
  if (zip.readUInt32LE(lh) !== 0x04034b50) throw new Error('Local header corrupto');
  const dataOff = lh + 30 + zip.readUInt16LE(lh + 26) + zip.readUInt16LE(lh + 28);
  const data = zip.subarray(dataOff, dataOff + best.compSize);
  if (data.length !== best.compSize) throw new Error('ZIP truncado');
  return best.method === 8 ? inflateRawSync(data) : Buffer.from(data);
}

// Valida sección de imports (id 2) y exports (id 7) sin compilar el módulo.
function validateWasmInterface(bytes) {
  if (bytes[0] !== 0x00 || bytes[1] !== 0x61 || bytes[2] !== 0x73 || bytes[3] !== 0x6d) {
    throw new Error('Magic wasm inválido');
  }
  let off = 8;
  const imports = [];
  const exports = [];
  while (off < bytes.length) {
    const id = bytes[off];
    off += 1;
    const [size, sizeLen] = readUleb(bytes, off);
    off += sizeLen;
    const end = off + size;
    if (id === 2) {
      const [count, countLen] = readUleb(bytes, off);
      let p = off + countLen;
      for (let i = 0; i < count; i += 1) {
        const [mod, modLen] = readName(bytes, p);
        p += modLen;
        const [name, nameLen] = readName(bytes, p);
        p += nameLen;
        const kind = bytes[p];
        p += 1;
        if (kind !== 0x00) throw new Error(`Import ${mod}.${name} no-función no soportado por el shim`);
        const [, typeLen] = readUleb(bytes, p);
        p += typeLen; // índice de tipo func
        imports.push(`${mod}.${name}`);
      }
    } else if (id === 7) {
      const [count, countLen] = readUleb(bytes, off);
      let p = off + countLen;
      for (let i = 0; i < count; i += 1) {
        const [name, nameLen] = readName(bytes, p);
        p += nameLen;
        p += 1; // kind
        const [idx, idxLen] = readUleb(bytes, p);
        void idx;
        p += idxLen;
        exports.push(name);
      }
    }
    off = end;
  }
  const expected = EXPECTED_IMPORTS.map((n) => `wasi_snapshot_preview1.${n}`).sort();
  const got = [...imports].sort();
  const missing = expected.filter((x) => !got.includes(x));
  const extra = got.filter((x) => !expected.includes(x));
  if (missing.length > 0) throw new Error(`Imports WASI ausentes: ${missing.join(',')}`);
  if (extra.length > 0) throw new Error(`Imports fuera del shim: ${extra.join(',')}`);
  for (const need of ['memory', '_start']) {
    if (!exports.includes(need)) throw new Error(`Export ausente: ${need}`);
  }
}

async function main() {  if (existsSync(target)) {
    const current = readFileSync(target);
    if (current.length === WASM_SIZE && sha256(current) === WASM_SHA256) {
      console.log(`pandoc.wasm ya presente y verificado (${current.length} bytes).`);
      return;
    }
    console.log('pandoc.wasm existente no coincide, se descarga de nuevo…');
  }
  console.log(`Descargando ${URL} …`);
  const zip = await download(URL);
  if (sha256(zip) !== ZIP_SHA256) throw new Error('SHA256 del ZIP no coincide con el release oficial');
  console.log(`ZIP verificado (${zip.length} bytes). Extrayendo…`);
  const wasm = extractWasmExact(zip);
  if (wasm.length !== WASM_SIZE || sha256(wasm) !== WASM_SHA256) {
    throw new Error('El .wasm extraído no coincide con el digest esperado');
  }
  validateWasmInterface(wasm);
  console.log('Interfaz WASI validada (30 imports wasi_snapshot_preview1, exports memory+_start).');
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, wasm);
  console.log(`Escrito ${target} (${wasm.length} bytes).`);
}

main().catch((err) => {
  console.error(`fetch:pandoc falló: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});