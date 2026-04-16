import assert from 'node:assert';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

function readAppStyles(appName) {
  return readFileSync(join('apps', appName, 'src', 'styles', 'index.css'), 'utf8');
}

function readPlanningBoardTokens() {
  return readFileSync(join('apps', 'planning-board', 'src', 'styles', 'tokens.css'), 'utf8');
}

function readPlanningBoardCss(fileName) {
  return readFileSync(join('apps', 'planning-board', 'src', 'features', 'board', 'ui', fileName), 'utf8');
}

function listPlanningBoardUiCssFiles() {
  const uiDir = join('apps', 'planning-board', 'src', 'features', 'board', 'ui');
  return readdirSync(uiDir).filter((fileName) => fileName.endsWith('.css'));
}

test('planning-board ui stylesheets use board-* tokens only', () => {
  const uiCssFiles = listPlanningBoardUiCssFiles();
  const aliasTokenPattern = /--(?:color|spacing|font|radius|transition)-/;

  for (const fileName of uiCssFiles) {
    const css = readPlanningBoardCss(fileName);

    assert.doesNotMatch(css, aliasTokenPattern, `${fileName} should not reference legacy alias tokens`);
  }
});
