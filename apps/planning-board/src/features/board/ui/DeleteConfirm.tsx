import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import './DeleteConfirm.css';

interface Props { onConfirm: () => void; onCancel: () => void; }

export function DeleteConfirm({ onConfirm, onCancel }: Props): h.JSX.Element {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { cancelRef.current?.focus(); }, []);
  return (
    <div className="delete-confirm" role="alertdialog" aria-modal={true} aria-label="Delete profile confirmation" aria-describedby="delete-confirm-text"
      onKeyDown={(e) => { if (e.key === 'Escape') { e.preventDefault(); onCancel(); } }}>
      <span id="delete-confirm-text" className="delete-confirm__text">Delete profile?</span>
      <button className="delete-confirm__yes" onClick={onConfirm}>Yes</button>
      <button ref={cancelRef} className="delete-confirm__no" onClick={onCancel}>No</button>
    </div>
  );
}
