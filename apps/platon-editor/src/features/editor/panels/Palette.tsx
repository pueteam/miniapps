import type { Kind, Point } from '../model/types';

type PaletteProps = { onAdd: (kind: Kind, point?: Point) => void };

const tiles: ReadonlyArray<{ kind: Kind; label: string; symbol: string }> = [
  { kind: 'job', label: 'JOB', symbol: '▢' },
  { kind: 'action', label: 'Actuación', symbol: '◇' },
  { kind: 'text', label: 'Texto', symbol: 'T' },
  { kind: 'group', label: 'Grupo', symbol: '▤' },
  { kind: 'header', label: 'Cabecera', symbol: '☰' },
];

export function Palette({ onAdd }: PaletteProps) {
  return (
    <div className="palette" aria-label="Paleta de elementos">
      {tiles.map(({ kind, label, symbol }) => (
        <button
          key={kind}
          className="palette-tile"
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
          <span className="tile-icon" aria-hidden="true">{symbol}</span>
          {label}
        </button>
      ))}
    </div>
  );
}
