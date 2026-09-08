import { describe, expect, it } from 'vitest';
import { emptyDiagram } from './document';
import { parseDiagram, serializeDiagram } from './validation';
import { createElement } from '../presets/elements';

describe('documento portable', () => {
  it('conserva campos, horario y apariencia', () => {
    const doc = emptyDiagram();
    const node = createElement('action', 'a', { x: -80, y: 40 });
    node.data.schedule = '21:00-20:00+1'; node.style.shape = 'hexagon';
    doc.elements.push(node);
    expect(parseDiagram(serializeDiagram(doc))).toEqual(doc);
  });
  it.each([
    (d: any) => { d.version = 2; },
    (d: any) => { d.elements.push(d.elements[0]); },
    (d: any) => { d.elements[0].width = 0; },
    (d: any) => { d.elements[0].position.x = null; },
    (d: any) => { d.elements[0].data.url = 'javascript:alert(1)'; },
    (d: any) => { d.elements[0].parentId = 'missing'; },
    (d: any) => { d.elements[0].style.fill = 'url(https://bad)'; },
    (d: any) => { d.elements[0].data.repetitive = 'true'; },
    (d: any) => { d.elements[0].style.align = 'justify'; },
  ])('rechaza datos inválidos sin modificar entrada', mutate => {
    const doc = emptyDiagram(); doc.elements.push(createElement('job', 'a', { x: 0, y: 0 }));
    mutate(doc); expect(() => parseDiagram(JSON.stringify(doc))).toThrow();
  });
  it('rechaza ciclos de padres y extremos no conectables', () => {
    const doc = emptyDiagram(); const g = createElement('group', 'g', { x: 0, y: 0 });
    g.parentId = 'g'; doc.elements.push(g);
    expect(() => serializeDiagram(doc)).toThrow();
    delete g.parentId;
    doc.edges.push({ id: 'e', source: 'g', target: 'g', sourcePort: 'bottom', targetPort: 'top', routing: 'straight', waypoints: [], color: '#000000', width: 1 });
    expect(() => serializeDiagram(doc)).toThrow();
  });
});
