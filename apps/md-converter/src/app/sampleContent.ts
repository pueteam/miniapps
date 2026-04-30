export const sampleMarkdown = `# Capítulo 1

Este libro se genera completamente en el navegador con **pandoc.wasm**.

## Qué incluye

- Entrada en Markdown
- Salida EPUB3
- TOC opcional
- CSS específico para EPUB
- Metadatos mínimos en YAML

> La conversión ocurre en un worker para no bloquear la interfaz.

# Capítulo 2

## Código

\`\`\`ts
console.log("Hola, EPUB");
\`\`\`
`;

export const sampleCss = `html, body {
  font-family: serif;
  line-height: 1.55;
}

h1, h2, h3 {
  font-family: system-ui, sans-serif;
}

code, pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

blockquote {
  border-left: 0.25rem solid #999;
  margin-left: 0;
  padding-left: 1rem;
  color: #444;
}
`;
