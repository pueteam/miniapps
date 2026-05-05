import { useRef } from 'preact/hooks';

type ToolbarProps = {
  noteCount: number;
  query: string;
  status: string;
  onCreate: () => void;
  onSearch: (value: string) => void;
  onExport: () => string;
  onImport: (text: string) => Promise<void>;
};

export function Toolbar({ noteCount, query, status, onCreate, onSearch, onExport, onImport }: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function downloadJson() {
    const url = URL.createObjectURL(new Blob([onExport()], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `sticky-board-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    await onImport(await file.text());
    input.value = '';
  }

  return (
    <section class="sticky-toolbar" aria-label="Herramientas del tablero">
      <div class="sticky-toolbar__actions">
        <button class="button-primary" type="button" onClick={onCreate}>Nueva nota</button>
        <button type="button" onClick={downloadJson}>Exportar JSON</button>
        <button type="button" onClick={() => fileInputRef.current?.click()}>Importar JSON</button>
        <input ref={fileInputRef} class="visually-hidden" type="file" accept="application/json" onChange={handleImport} />
      </div>
      <label class="search-box">
        <input value={query} type="search" aria-label="Buscar notas" placeholder="Buscar notas" onInput={(event) => onSearch((event.currentTarget as HTMLInputElement).value)} />
      </label>
      <p class="board-status" aria-live="polite">{status}<br />{noteCount} notas en el tablero.</p>
    </section>
  );
}
