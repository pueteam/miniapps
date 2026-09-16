export function getAppElement(doc: Document = document): HTMLElement {
  const el = doc.getElementById('app');
  if (!el) throw new Error('No se encontró el contenedor #app en index.html');
  return el;
}
