# Components - MD Converter

## UI Components

### App

**File**: `src/app/App.tsx`

Main application component. Handles:

- State management for all inputs (title, author, markdown, css, etc.)
- File import handlers (Markdown, CSS, cover image)
- Conversion trigger and result handling
- Error display and status updates

**State**:
```typescript
{
  title: string;           // Book title
  author: string;          // Book author
  lang: string;           // BCP 47 language code
  toc: boolean;           // Include table of contents
  tocDepth: number;       // TOC depth (1-6)
  splitLevel: number;    // EPUB split level (1-6)
  markdown: string;      // Markdown content
  css: string;           // EPUB CSS
  coverFile: File | null;// Cover image
  isRunning: boolean;   // Conversion in progress
  logs: string;          // Conversion logs
  error: string;         // Error message
  statusState: 'idle' | 'running' | 'success' | 'error';
}
```

**Uses**:
- `useLocalStorage` for persistence
- `runPandocInWorker` for conversion
- `buildMetadataYaml` for metadata
- `slugify` + `downloadBlob` for output

---

### AppShell

**File**: `src/components/AppShell.tsx`

Layout wrapper. Simple container with header.

```tsx
<AppShell>
  {children}
</AppShell>
```

Renders:
- App header with title and description
- InstallButton (PWA install)
- Main content area

---

### InstallButton

**File**: `src/components/InstallButton.tsx`

PWA installation button. Uses `registerSW` functions:

- `getInstallState()` - Check if install is available
- `triggerInstall()` - Trigger native install prompt
- `subscribeInstallState()` - Subscribe to state changes

Only renders when:
- `canInstall` is true (browser supports PWA)
- `isInstalled` is false (not already installed)

---

## Worker Modules

### pandoc.worker.ts

**File**: `src/workers/pandoc.worker.ts`

Web Worker entry point. Simple message handler:

```typescript
self.addEventListener('message', async (event) => {
  const { id, payload } = event.data;
  try {
    const result = await runPandoc(payload);
    self.postMessage({ id, type: 'success', payload: result }, 
      [result.epubBytes.buffer]);
  } catch (error) {
    self.postMessage({ id, type: 'error', error: message });
  }
});
```

Key aspects:
- Transferable `epubBytes.buffer` for efficiency
- Message envelope: `{ id, type, ... }`
- Error handling with string messages

---

## Library Modules

### workerClient.ts

**File**: `src/lib/workerClient.ts`

Manages Web Worker lifecycle and communication.

**Main function**: `runPandocInWorker(input: WorkerJobInput)`

Features:
- Singleton worker instance
- Promise-based API
- Transferable support for large byte arrays
- Unique message IDs for concurrent requests

```typescript
export function runPandocInWorker(input: WorkerJobInput): Promise<WorkerJobResult>
```

---

### pandocRunner.ts

**File**: `src/lib/pandocRunner.ts`

Core WASI execution module. Most complex file.

**Exports**:

| Function | Purpose |
|----------|---------|
| `sanitizeFilename()` | Sanitize filenames for virtual FS |
| `loadWasmBytes()` | Load pandoc.wasm binary |
| `buildArgs()` | Build pandoc CLI arguments |
| `buildPreopenDirectory()` | Create virtual filesystem |
| `runPandoc()` | Execute pandoc and return EPUB |

**Virtual FS structure**:
```
/
├── book.md              # Input markdown
├── epub.css            # Custom CSS
├── metadata.yaml       # YAML metadata
├── book.epub          # Output (created by pandoc)
├── cover.jpg          # Optional cover image
└── ...
```

**Pandoc arguments**:
```
pandoc
  --from=markdown
  --to=epub3
  --standalone
  --metadata-file=metadata.yaml
  --resource-path=.
  --css=epub.css
  --toc-depth=N
  --split-level=N
  [--toc]
  [--epub-cover-image=cover.jpg]
  -o book.epub
  book.md
```

---

### epubMetadata.ts

**File**: `src/lib/epubMetadata.ts`

Simple YAML metadata builder.

```typescript
buildMetadataYaml({
  title: string;
  author: string;
  lang: string;
}): string
```

Output format:
```yaml
---
title: "Book Title"
author: "Author Name"
lang: "es-ES"
...
```

---

### download.ts

**File**: `src/lib/download.ts`

Utility functions:

- `downloadBlob(blob, filename)` - Trigger file download
- `slugify(value)` - Create URL-safe slugs

```typescript
slugify("Hola Mundo") // "hola-mundo"
slugify("Capítulo 1") // "capitulo-1"
```

---

### types.ts

**File**: `src/lib/types.ts`

TypeScript interfaces:

```typescript
type BinaryInput = { name: string; bytes: Uint8Array };
type WorkerJobInput = {
  markdown: string;
  css: string;
  metadataYaml: string;
  toc: boolean;
  tocDepth: number;
  splitLevel: number;
  cover?: BinaryInput | null;
  wasmBytes?: Uint8Array | null;
};
type WorkerJobResult = {
  epubBytes: Uint8Array;
  logs: string;
};
```

---

### registerSW.ts

**File**: `src/app/registerSW.ts`

PWA and Service Worker management.

**Functions**:

- `registerSW()` - Register SW, handle install prompt
- `getInstallState()` - Get current install state
- `subscribeInstallState(listener)` - Subscribe to state changes
- `triggerInstall()` - Trigger native install dialog

**Install states**:
- `canInstall`: true if beforeinstallprompt fired
- `isInstalled`: true if appinstalled fired

---

### useLocalStorage.ts

**File**: `src/hooks/useLocalStorage.ts`

Custom hook for localStorage persistence.

```typescript
function useLocalStorage<T>(key: string, initialValue: T): readonly [T, (value: T) => void]
```

Features:
- Lazy initialization
- JSON parse/stringify
- Graceful error handling
- Returns readonly tuple [value, setValue]

---

## CSS Styles

### index.css

**File**: `src/styles/index.css`

Application styles.

**Design tokens** (CSS variables):
```css
:root {
  --app-accent: #004f87;
  --app-accent-hover: #0a5b95;
  --bg-page: #f4f5f7;
  --bg-surface: #ffffff;
  --text-primary: #004f87;
  --text-body: #1f2937;
  --text-secondary: #4b5563;
  --text-muted: #6b7280;
  --success: #10b981;
  --error: #ef4444;
  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 24px;
}
```

**Layout**:
- Max width: 1280px
- Grid: 12 columns
- Gap: 20px

**Components styled**:
- AppShell (header)
- Converter page
- Panels (meta, editor, status)
- Forms (inputs, textareas, checkboxes)
- Buttons (primary, secondary)
- Status bar and logs
- Error banner

**Responsive**:
- 1024px: Single column layout
- 720px: Reduced padding

---

## Entry Points

### main.tsx

**File**: `src/main.tsx`

Application entry. Renders App to `#app`.

### index.html

**File**: `index.html`

HTML shell. Just `<div id="app"></div>` + script module.