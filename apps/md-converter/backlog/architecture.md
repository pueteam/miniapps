# Architecture - MD Converter

## Overview

The application converts Markdown to EPUB3 entirely in the browser using pandoc.wasm (WebAssembly). The core innovation is running a typical CLI tool (pandoc) in a browser via WASI simulation.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          MARKDOWN → EPUB FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

   ┌─────────┐     ┌─────────┐     ┌─────────────┐     ┌─────────┐
   │ Markdown│     │  CSS   │     │ YAML       │     │ Cover  │
   │ (text)  │     │ (text) │     │ metadata  │     │ (image)│
   └────┬────┘     └────┬────┘     └──────┬──────┘     └────┬────┘
        │               │                │                │
        └───────────────┴────────────────┴────────────────┘
                                   │
                                   ▼
                         ┌─────────────────┐
                         │ WorkerClient   │
                         │ (src/lib/)     │
                         └────────┬────────┘
                                  │ postMessage()
                                  ▼
                         ┌─────────────────┐
                         │ Web Worker      │
                         │ (pandoc.worker)│
                         └────────┬────────┘
                                  │ runPandoc()
                                  ▼
                         ┌─────────────────┐
                         │ PandocRunner    │
                         │ + WASI shim     │
                         └────────┬────────┘
                                  │
              ┌─────────────────┴─────────────────┐
              ▼                                       ▼
     ┌─────────────────┐                    ┌─────────────┐
     │ Virtual FS     │                    │ WebAssembly│
     │ (WASI)       │                    │ (pandoc)   │
     └────────┬────────┘                    └─────────────┘
              │                                     │
              │ instantiate + start()              │
              └─────────────────┬─────────────────┘
                                ▼
                      ┌─────────────────┐
                      │ EPUB binary     │
                      │ (.epub file)  │
                      └────��───┬────────┘
                               │
                               ▼ (transfer via postMessage)
                      ┌─────────────────┐
                      │ Main Thread    │
                      └────────┬────────┘
                               │ Blob download
                               ▼
                      ┌─────────────────┐
                      │ User downloads│
                      │ book.epub    │
                      └──────────────┘
```

## Thread Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MAIN THREAD                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   App (Preact)                                                   │
│   ├── State management                                           │
│   │   ├── title, author, lang                                    │
│   │   ├── markdown, css                                          │
│   │   ├── cover file                                            │
│   │   └── conversion state                                       │
│   │                                                              │
│   ├── useLocalStorage hooks                                      │
│   │   └── Persists all state to localStorage                      │
│   │                                                              │
│   └── Conversion handling                                        │
│       └── runPandocInWorker()                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                       postMessage
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     WEB WORKER THREAD                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   pandoc.worker.ts                                              │
│   └── runPandoc(payload)                                        │
│       ├── loadWasmBytes()                                       │
│       │   └── Fetches pandoc.wasm from public/                 │
│       │                                                          │
│       ├── buildPreopenDirectory()                              │
│       │   └── Creates virtual filesystem:                      │
│       │       - book.md (input)                                │
│       │       - epub.css                                       │
│       │       - metadata.yaml                                  │
│       │       - book.epub (output)                             │
│       │       - cover image (if provided)                       │
│       │                                                          │
│       ├── buildArgs()                                           │
│       │   └── Builds pandoc CLI arguments:                      │
│       │       - --from=markdown --to=epub3                    │
│       │       - --standalone --toc                             │
│       │       - --metadata-file, --css, etc.                  │
│       │                                                          │
│       └── WebAssembly.instantiate()                             │
│           ├── Load WASI (browser_wasi_shim)                    │
│           ├── Start pandoc execution                           │
│           └── Return EPUB bytes                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## State Management

All state is persisted to localStorage via custom hooks:

```
┌─────────────────────────────────────────────────────────────────┐
│                    STORAGE KEYS                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Prefix: "miniapps:md-converter:"                              │
│                                                                 │
│   ├── title         → miniapps:md-converter:title              │
│   ├── author       → miniapps:md-converter:author             │
│   ├── lang         → miniapps:md-converter:lang              │
│   ├── toc          → miniapps:md-converter:toc               │
│   ├── tocDepth     → miniapps:md-converter:tocDepth          │
│   ├── splitLevel   → miniapps:md-converter:splitLevel        │
│   ├── markdown    → miniapps:md-converter:markdown          │
│   └── css          → miniapps:md-converter:css                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
└── AppShell
    ├── InstallButton (PWA)
    └── converter-page
        ├── panel--meta (Metadatos)
        │   ├── Identificación (title, author, lang, splitLevel)
        │   ├── TOC (tocDepth, toc checkbox)
        │   └── Archivos (cover)
        ├── panel--editor (Markdown)
        ├── panel--editor (CSS)
        └── panel--status (Estado + botón de conversión)
```

## File Modules

| Module | Responsibility |
|--------|---------------|
| `workerClient.ts` | Manages Web Worker lifecycle, message passing |
| `pandocRunner.ts` | WASI execution, virtual FS, pandoc CLI |
| `epubMetadata.ts` | Builds YAML metadata block |
| `download.ts` | Blob download, slugify utility |
| `types.ts` | TypeScript interfaces |
| `constants.ts` | App constants (storage prefix) |

## Security Considerations

- Pandoc runs in Web Worker (no DOM access)
- Files are created in virtual filesystem only
- No network requests during conversion
- Only fetch() for pandoc.wasm on initial load
- Blob downloads are handled safely via createObjectURL