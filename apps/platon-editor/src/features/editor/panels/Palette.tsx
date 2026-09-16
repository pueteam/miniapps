import type { Kind } from '../model/types';

type PaletteProps = { onAdd: (kind: Kind) => void };

const tiles: ReadonlyArray<{ kind: Kind; label: string }> = [
  { kind: 'job', label: 'JOB' },
  { kind: 'action', label: 'Actuación' },
  { kind: 'text', label: 'Texto' },
  { kind: 'group', label: 'Grupo' },
  { kind: 'header', label: 'Cabecera' },
];

export function Palette({ onAdd }: PaletteProps) {
  return (
    <div class="palette" aria-label="Paleta de elementos">
      {tiles.map(({ kind, label }) => (
        <button
          key={kind}
          class="palette-tile"
          type="button"
          draggable
          aria-label={`Añadir ${label}`}
          onClick={() => onAdd(kind)}
          onDragStart={(event) => {
            if (!event.dataTransfer) return;
            event.dataTransfer.setData('application/platon-kind', kind);
            event.dataTransfer.setData('text/plain', kind);
            event.dataTransfer.effectAllowed = 'copy';
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
