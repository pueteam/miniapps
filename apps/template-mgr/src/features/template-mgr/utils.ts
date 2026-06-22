export function getCurrentDate(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

export function sanitizeHTML(html: string): string {
  const allowed = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'BR', 'P', 'SPAN']);
  const template = document.createElement('template');
  template.innerHTML = String(html);

  const walk = (node: Node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as Element;
        if (!allowed.has(el.tagName)) {
          child.replaceWith(document.createTextNode(child.textContent ?? ''));
          return;
        }
        [...el.attributes].forEach((attr) => el.removeAttribute(attr.name));
        walk(child);
      }
    });
  };

  walk(template.content);
  return template.innerHTML;
}
