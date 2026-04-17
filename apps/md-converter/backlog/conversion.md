# EPUB Conversion - MD Converter

## Conversion Pipeline

```
INPUT                              OUTPUT
─────────────────────────────────────────────────────

Markdown                    EPUB (ZIP with XHTML + media)
┌─────────────────┐         ┌─────────────────────────┐
│ # Título        │         │ mimetype                │
│                 │         │ META-INF/container.xml │
│ ## Capítulo 1  │───┐     │ OEBPS/content.opf       │
│                 │   │     │ OEBPS/toc.ncx          │
│ Texto...        │   │     │ OEBPS/title.xhtml      │
│                 │   │     │ OEBPS/chap1.xhtml     │
│ ```            │   │     │ OEBPS/epub.css        │
│ código         │   │     │ (images if included)  │
│ ```            │   │     │                        │
│                 │   │     └─────────────────────────┘
└─────────────────┘   │
                      │     ┌─────────────────────────┐
CSS                   │     │ META-INF/                │
┌─────────────────┐   │     │ OEBPS/                  │
│ html, body {    │───┼────▶│   ├── content.opf       │
│   font: serif;  │   │     │   ├── toc.ncx           │
│ }               │   │     │   ├── *.xhtml           │
└─────────────────┘   │     │   └── epub.css           │
                      │     └─────────────────────────┘
                      │
                      │     ┌─────────────────────────┐
YAML Metadata         │     │ EPUB is a ZIP file:    │
┌─────────────────┐   │     │ zip -r book.epub *     │
│ ---             │───┼────▶│ # or use zipfromdir    │
│ title: "..."    │   │     └─────────────────────────┘
│ author: "..."   │   │
│ lang: es-ES     │   │
│ ...             │   │
└─────────────────┘   │
                      │
    cover.jpg (optional)──┘
```

## Pandoc Arguments

The conversion uses these pandoc arguments:

```bash
pandoc \
  --from=markdown \
  --to=epub3 \
  --standalone \
  --metadata-file=metadata.yaml \
  --resource-path=. \
  --css=epub.css \
  --toc-depth=3 \
  --split-level=1 \
  --toc \
  [--epub-cover-image=cover.jpg] \
  -o book.epub \
  book.md
```

### Argument Reference

| Argument | Description | Default |
|----------|-------------|---------|
| `--from=markdown` | Input format | - |
| `--to=epub3` | Output format (EPUB3) | - |
| `--standalone` | Include all files in one EPUB | - |
| `--metadata-file` | YAML metadata file | - |
| `--resource-path` | Path for resource resolution | `.` |
| `--css` | CSS file to include | - |
| `--toc` | Generate table of contents | No |
| `--toc-depth` | TOC depth (1-6) | 3 |
| `--split-level` | Split level for chapters | 1 |
| `--epub-cover-image` | Cover image file | - |

## EPUB3 Structure

Generated EPUB3 follows this structure:

```
book.epub (ZIP)
├── mimetype
│   └── application/epub+zip
├── META-INF/
│   └── container.xml
│       └──Points to OEBPS/content.opf
└── OEBPS/
    ├── content.opf
    │   ├── Metadata (title, author, language)
    │   └── Manifest (all files)
    │   └── Spine (reading order)
    ├── toc.ncx
    │   └── Navigation center (TOC for older readers)
    ├── nav.xhtml
    │   └── Navigation document (EPUB3)
    ├── *.xhtml
    │   └── Chapter content
    ├── epub.css
    │   └── Custom CSS
    └── images/
        └── (embedded images)
```

## Supported Markdown

Pandoc's extended Markdown is supported:

- Headers (`#`, `##`, `###`)
- Bold (`**text**`) and italic (`*text*`)
- Code blocks with syntax highlighting
- Blockquotes (`> quote`)
- Lists (ordered and unordered)
- Links (`[text](url)`)
- Images (`![alt](url)`)
- Tables
- Horizontal rules (`---`)
- Footnotes
- Definition lists
- Task lists

## CSS for EPUB

Custom CSS is embedded in the EPUB. Example base template:

```css
html, body {
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
```

## Metadata Fields

| Field | YAML key | Required | Example |
|-------|----------|----------|---------|
| Title | `title` | Yes | "Mi Libro" |
| Author | `author` | No | "Autor/a" |
| Language | `lang` | No | "es-ES" |
| Cover | (image file) | No | cover.jpg |

## Limitations

- Limited image support (only cover currently)
- No embedded fonts
- CSS may have limited compatibility across readers
- Complex layouts may not render consistently

## Output

The generated EPUB is:
- Downloaded via Blob URL
- Named after the book title: `{slugified-title}.epub`
- Standard EPUB3 format
- Compatible with most EPUB readers