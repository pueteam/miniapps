import type { Diagram } from '../model/types';

/** Aplica la edición inline de texto sobre la escena dada (borrador activo o
 *  documento), eligiendo el campo según el kind del elemento. */
export function applyTextEdit(scene: Diagram, id: string, text: string): Diagram {
  return {
    ...scene,
    elements: scene.elements.map((e) =>
      e.id === id
        ? { ...e, data: { ...e.data, [e.kind === 'text' ? 'text' : e.kind === 'header' ? 'description' : 'name']: text } }
        : e,
    ),
  };
}
