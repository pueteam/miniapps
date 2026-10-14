# Home routes
Root / or /miniapps/ depending on Vite base. No client router. Cards navigate to sibling PWAs. Registry is generated; preserve all hrefs.
## apps/home/src/generated/apps-registry.ts
~~~ts
// GENERATED — no editar a mano
// Ejecuta scripts/generate-home-registry.mjs para regenerar
export const appsRegistry = [
  {
    "name": "platon-editor",
    "title": "Editor PLATON",
    "description": "Dibuja, edita y exporta cadenas PLATON",
    "href": "/miniapps/platon-editor/",
    "tags": [
      "platon",
      "grafos",
      "diagramas"
    ]
  },
  {
    "name": "template-mgr",
    "title": "Gestor de Plantillas",
    "description": "Genera documentos .docx y .pptx rellenando plantillas con variables",
    "href": "/miniapps/template-mgr/",
    "category": "utilities",
    "tags": [
      "templates",
      "docx",
      "pptx",
      "offline"
    ]
  },
  {
    "name": "md-converter",
    "title": "MDconvertix",
    "description": "Convert Markdown files to DOCX, EPUB, HTML",
    "href": "/miniapps/md-converter/",
    "category": "utilities"
  },
  {
    "name": "sticky-board",
    "title": "Post-ix",
    "description": "Post-it notes board to organize your ideas and tasks visually",
    "href": "/miniapps/sticky-board/",
    "category": "productivity",
    "tags": [
      "notes"
    ]
  },
  {
    "name": "planning-board",
    "title": "ResPlanner",
    "description": "Resource planning board",
    "href": "/miniapps/planning-board/",
    "category": "utilities"
  }
] as const;

~~~
