import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { getRepoName, HOME_REGISTRY_PATH, readAllAppConfigs } from './lib/miniapps.mjs';

const repoName = getRepoName();
const base = repoName ? `/${repoName}` : '';

const entries = readAllAppConfigs()
  .map(({ config }) => config)
  .filter((app) => app.name !== 'home' && app.listed)
  .sort((a, b) => a.title.localeCompare(b.title))
  .map((app) => ({
    name: app.name,
    title: app.title,
    description: app.description,
    href: `${base}/${app.name}/`,
    ...(app.category ? { category: app.category } : {}),
    ...(Array.isArray(app.tags) ? { tags: app.tags } : {})
  }));

mkdirSync(dirname(HOME_REGISTRY_PATH), { recursive: true });
writeFileSync(
  HOME_REGISTRY_PATH,
  `// GENERATED — no editar a mano\n// Ejecuta scripts/generate-home-registry.mjs para regenerar\nexport const appsRegistry = ${JSON.stringify(entries, null, 2)} as const;\n`,
  'utf8'
);
console.log(`Generated ${HOME_REGISTRY_PATH}`);
