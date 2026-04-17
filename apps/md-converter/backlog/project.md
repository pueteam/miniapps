# MD Converter - Project Overview

## Basic Information

| Field | Value |
|-------|-------|
| **Name** | md-converter |
| **Title** | MDconvertix |
| **Version** | 0.1.0 |
| **Type** | PWA (Progressive Web App) |
| **Language** | Spanish (es) |

## Description

Convert Markdown files to EPUB3 directly in the browser using pandoc.wasm. No server required - all conversion happens locally via WebAssembly.

## Tech Stack

| Category | Technology |
|----------|------------|
| UI Framework | Preact 10.29.1 |
| Build Tool | Vite 8.0.8 |
| Language | TypeScript 5.8.3 |
| WASI Runtime | @bjorn3/browser_wasi_shim 0.4.2 |
| PWA Plugin | vite-plugin-pwa 1.1.0 |

## Project Structure

```
md-converter/
├── src/
│   ├── app/
│   │   ├── App.tsx           # Main component
│   │   └── registerSW.ts     # Service Worker registration
│   ├── components/
│   │   ├── AppShell.tsx     # Layout wrapper
│   │   └── InstallButton.tsx # PWA install button
│   ├── lib/
│   │   ├── workerClient.ts  # Worker communication
│   │   ├── pandocRunner.ts  # WASI pandoc execution
│   │   ├── epubMetadata.ts  # YAML metadata builder
│   │   ├── download.ts      # Download utilities
│   │   ├── types.ts         # TypeScript types
│   │   └── constants.ts     # App constants
│   ├── workers/
│   │   └── pandoc.worker.ts # Web Worker entry point
│   ├── hooks/
│   │   └── useLocalStorage.ts
│   ├── styles/
│   │   └── index.css
│   └── main.tsx
├── public/
│   ├── pandoc.wasm          # Pandoc WebAssembly binary
│   ├── pwa-*.png            # PWA icons
│   └── screenshots/          # Screenshots for PWA
├── openspec/
│   └── specs/
├── package.json
├── vite.config.ts
├── app.config.json
└── index.html
```

## Configuration

### app.config.json

- `name`: "md-converter"
- `title`: "MDconvertix"
- `listed`: false (not published)
- `pwa`: true
- `router`: false (single page)
- `themeColor`: "#004F87"
- `backgroundColor`: "#FFFFFF"
- `category`: "utilities"

### vite.config.ts

- Base path calculation from GitHub repository
- Preact plugin
- VitePWA with:
  - Auto-update registration
  - PWA manifest with icons and screenshots
  - Workbox configuration

## Dependencies

### Runtime

| Package | Version | Purpose |
|--------|---------|---------|
| preact | ^10.29.1 | UI framework |
| @bjorn3/browser_wasi_shim | ^0.4.2 | WASI runtime for pandoc.wasm |

### Development

| Package | Version | Purpose |
|--------|---------|---------|
| vite | ^8.0.8 | Build tool |
| typescript | ^5.8.3 | Language |
| @preact/preset-vite | ^2.10.5 | Preact Vite integration |
| vite-plugin-pwa | ^1.1.0 | PWA generation |

## Key Features

- [x] Markdown → EPUB3 conversion in browser
- [x] Web Worker for non-blocking conversion
- [x] Configurable metadata (title, author, language)
- [x] Customizable table of contents (TOC)
- [x] Custom CSS for EPUB
- [x] Cover image support
- [x] PWA with Service Worker
- [x] LocalStorage persistence
- [x] File import for .md and .css

## Notes

- pandoc.wasm binary is loaded from `public/pandoc.wasm`
- Conversion uses WASI (WebAssembly System Interface)
- Virtual filesystem is built using @bjorn3/browser_wasi_shim
- CSS is imported from shared base: `@import "../../../../styles/base.css";`
- Only EPUB output is currently implemented (AppShell mentions DOCX/HTML which may be roadmap)