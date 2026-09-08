import { render } from '@testing-library/preact';
import { expect, it } from 'vitest';
import { emptyDiagram } from '../model/document';
import { createElement } from '../presets/elements';
import { ExportScene } from './ExportScene';
import { diagramBounds } from './bounds';

it('pinta el padre antes del grupo hijo aunque el JSON esté en otro orden', () => {
  const doc = emptyDiagram();
  const child = createElement('group', 'child', {x: 20, y: 40});
  child.parentId = 'parent'; child.data.name = 'Hijo';
  const parent = createElement('group', 'parent', {x: 0, y: 0});
  parent.data.name = 'Padre';
  doc.elements = [child, parent];
  const {container} = render(<ExportScene doc={doc} bounds={diagramBounds(doc)} />);
  expect([...container.querySelectorAll('[data-element-kind="group"]')].map(node => node.textContent)).toEqual(['Padre', 'Hijo']);
});
