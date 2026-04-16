import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { getRepoName } from './lib/miniapps.mjs';

const repoName = getRepoName();
const dist = join(process.cwd(), 'dist-pages');

if (repoName) {
	const target = join(dist, repoName);
	if (existsSync(target)) rmSync(target, { recursive: true, force: true });
	mkdirSync(target, { recursive: true });
	for (const name of readdirSync(dist)) {
		if (name === repoName) continue;
		cpSync(join(dist, name), join(target, name), { recursive: true });
	}
	console.log(`Previewing at /${repoName}/ — serving ${dist}`);
} else {
	console.log('Previewing at / — serving dist-pages');
}

execSync('pnpm exec serve dist-pages -l 4173', { stdio: 'inherit' });
