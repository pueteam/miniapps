import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
    getRequiredAppFiles,
    isValidSlug,
    readAllAppConfigs,
    readJson,
    REQUIRED_APP_CONFIG_FIELDS,
    RESERVED_APP_NAMES
} from './lib/miniapps.mjs';

const errors = [];
const seen = new Set();
const styleReports = [];

const STYLE_ALIAS_ALLOWLIST = new Set(
  (process.env.STYLE_ALIAS_ALLOWLIST || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
);

function readText(filePath) {
  return readFileSync(filePath, 'utf8');
}

function collectCssFiles(dirPath) {
  const files = [];
  if (!existsSync(dirPath)) return files;
  for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
    const entryPath = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectCssFiles(entryPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.css')) files.push(entryPath);
  }
  return files;
}

function collectDefinedTokensFromCss(cssText) {
  const definitions = new Set();
  const definitionRegex = /(--[a-zA-Z0-9_-]+)\s*:/g;
  let match;
  while ((match = definitionRegex.exec(cssText)) !== null) {
    definitions.add(match[1]);
  }
  return definitions;
}

function collectVarUsages(cssText) {
  const usages = [];
  const usageRegex = /var\(\s*(--[a-zA-Z0-9_-]+)\s*(?:,([^\)]*))?\)/g;
  let match;
  while ((match = usageRegex.exec(cssText)) !== null) {
    usages.push({ token: match[1], hasFallback: Boolean(match[2] && match[2].trim()) });
  }
  return usages;
}

function getComponentAdjustmentDecision(appName, appDir) {
  if (appName === 'planning-board') {
    const uiDir = join(appDir, 'src', 'features', 'board', 'ui');
    const aliasUsageRegex = /--(?:color|spacing|font|radius|transition)-/;
    const uiCssFiles = collectCssFiles(uiDir);
    const hasAliasUsage = uiCssFiles.some((cssFile) => aliasUsageRegex.test(readText(cssFile)));

    return hasAliasUsage
      ? {
          needed: true,
          rationale: 'Uses mixed style token vocabularies and requires staged component migration.'
        }
      : {
          needed: false,
          rationale: 'UI components now use board tokens directly and no staged component migration is required.'
        };
  }
  return {
    needed: false,
    rationale: 'No mandatory component migration expected for scaffold alignment in this phase.'
  };
}

const sharedBasePath = join(process.cwd(), 'styles', 'base.css');
const sharedBaseStyles = existsSync(sharedBasePath) ? readText(sharedBasePath) : '';
const sharedBaseTokens = collectDefinedTokensFromCss(sharedBaseStyles);

for (const { appName, appDir, configPath, config } of readAllAppConfigs()) {
  const styleViolations = [];

  if (!isValidSlug(config.name)) {
    errors.push(`Slug inválido en ${configPath}`);
  }

  if (config.name !== appName) {
    errors.push(`El directorio ${appName} no coincide con el nombre configurado ${config.name}`);
  }

  if (RESERVED_APP_NAMES.has(config.name) && config.name !== 'home') {
    errors.push(`Slug reservado en ${configPath}`);
  }

  if (seen.has(config.name)) {
    errors.push(`Slug duplicado: ${config.name}`);
  }
  seen.add(config.name);

  for (const field of REQUIRED_APP_CONFIG_FIELDS) {
    if (!(field in config)) {
      errors.push(`Falta campo requerido ${field} en ${configPath}`);
    }
  }

  for (const relativeFile of getRequiredAppFiles(config)) {
    const filePath = join(appDir, relativeFile);
    if (!existsSync(filePath)) {
      errors.push(`Falta ${filePath}`);
    }
  }

  if (config.router && !existsSync(join(appDir, 'public/404.html'))) {
    errors.push(`La app ${config.name} usa router pero no tiene public/404.html`);
  }

  if (!config.router && existsSync(join(appDir, 'public/404.html'))) {
    errors.push(`La app ${config.name} no usa router y no debería tener public/404.html`);
  }

  const pkg = readJson(join(appDir, 'package.json'));
  if (pkg.name !== `@miniapps/${config.name}`) {
    errors.push(`Inconsistencia entre package.json y app.config.json en ${config.name}`);
  }

  const indexHtml = readFileSync(join(appDir, 'index.html'), 'utf8');
  if (!config.router) {
    // Buscar el contenido de scripts inline y detectar restauración de redirect de forma más robusta
    const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    let found = false;
    while ((match = scriptRegex.exec(indexHtml)) !== null) {
      const scriptContent = match[1];
      if (/qs\.get\(\s*['"]redirect['"]\s*\)/.test(scriptContent)) {
        found = true;
        break;
      }
    }
    if (found) {
      errors.push(`La app ${config.name} no usa router y no debería incluir restauración de redirect en index.html`);
    }
  }

  const styleEntrypoint = join(appDir, 'src', 'styles', 'index.css');
  if (!existsSync(styleEntrypoint)) {
    const message = `La app ${config.name} no tiene src/styles/index.css`;
    errors.push(message);
    styleViolations.push(message);
  } else {
    const styleText = readText(styleEntrypoint);
    const hasBaseImport = /@import\s+["']\.\.\/\.\.\/\.\.\/\.\.\/styles\/base\.css["']\s*;?/m.test(styleText);
    if (!hasBaseImport) {
      const message = `La app ${config.name} no importa styles/base.css en src/styles/index.css`;
      errors.push(message);
      styleViolations.push(message);
    }
  }

  const appCssFiles = collectCssFiles(join(appDir, 'src'));
  const appDefinedTokens = new Set(sharedBaseTokens);
  for (const cssFile of appCssFiles) {
    const cssText = readText(cssFile);
    for (const token of collectDefinedTokensFromCss(cssText)) {
      appDefinedTokens.add(token);
    }
  }

  for (const cssFile of appCssFiles) {
    const cssText = readText(cssFile);
    for (const usage of collectVarUsages(cssText)) {
      if (usage.hasFallback) continue;
      if (STYLE_ALIAS_ALLOWLIST.has(usage.token)) continue;
      if (appDefinedTokens.has(usage.token)) continue;

      const message = `La app ${config.name} usa token no resuelto ${usage.token} en ${cssFile}`;
      errors.push(message);
      styleViolations.push(message);
    }
  }

  const adjustment = getComponentAdjustmentDecision(config.name, appDir);
  styleReports.push({
    app: config.name,
    status: styleViolations.length === 0 ? 'compliant' : 'non-compliant',
    violations: styleViolations,
    recommendations: styleViolations.length === 0
      ? ['No immediate style action required.']
      : ['Align style entrypoint and unresolved token usage with scaffold contract.'],
    componentAdjustmentNeeded: adjustment.needed,
    componentAdjustmentRationale: adjustment.rationale
  });
}

console.log('Style compliance report:');
for (const report of styleReports.sort((a, b) => a.app.localeCompare(b.app))) {
  console.log(
    `- ${report.app}: ${report.status}; component-adjustment-needed: ${report.componentAdjustmentNeeded}; rationale: ${report.componentAdjustmentRationale}`
  );
  if (report.violations.length > 0) {
    for (const violation of report.violations) {
      console.log(`  violation: ${violation}`);
    }
  }
}

if (errors.length > 0) {
  console.error('Errores de validación:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('Validación correcta.');
