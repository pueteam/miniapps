const shortcuts: ReadonlyArray<{ keys: string; action: string }> = [
  { keys: 'Supr', action: 'Eliminar selección' },
  { keys: 'Ctrl+Z', action: 'Deshacer' },
  { keys: 'Ctrl+Y', action: 'Rehacer' },
  { keys: 'Ctrl+D', action: 'Duplicar selección' },
  { keys: 'Escape', action: 'Cancelar / limpiar selección' },
  { keys: 'Espacio + arrastrar', action: 'Desplazar el lienzo' },
];

export function ShortcutsDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop">
      <section className="export-dialog" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title">
        <span className="section-label">AYUDA RÁPIDA</span>
        <h2 id="shortcuts-title">Atajos de teclado</h2>
        <ul>
          {shortcuts.map(({ keys, action }) => (
            <li key={keys}><strong>{keys}</strong> · {action}</li>
          ))}
        </ul>
        <div className="dialog-actions">
          <button type="button" className="primary" onClick={onClose}>Cerrar</button>
        </div>
      </section>
    </div>
  );
}
