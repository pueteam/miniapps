import { useLayoutEffect, useRef } from 'preact/hooks';

function getTabStops(dialog: HTMLElement) {
  return Array.from(dialog.querySelectorAll<HTMLElement>(':is(button, select):not(:disabled)'));
}

export function useDialogFocus(onClose: () => void, busy = false) {
  const dialogRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const opener = document.activeElement;
    (getTabStops(dialog)[0] ?? dialog).focus();

    return () => {
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, []);

  function onBackdropClick(event: MouseEvent) {
    if (event.target !== event.currentTarget) return;
    if (!busy) {
      onClose();
      return;
    }

    const dialog = dialogRef.current;
    if (dialog && !dialog.contains(document.activeElement)) dialog.focus();
  }

  function onDialogKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      if (!busy) onClose();
      return;
    }

    const dialog = dialogRef.current;
    if (event.key !== 'Tab' || !dialog) return;

    const tabStops = getTabStops(dialog);
    const index = tabStops.indexOf(document.activeElement as HTMLElement);
    const nextIndex = event.shiftKey ? index - 1 : index + 1;
    if (index >= 0 && nextIndex >= 0 && nextIndex < tabStops.length) return;

    event.preventDefault();
    const next = event.shiftKey ? tabStops.at(-1) : tabStops[0];
    (next ?? dialog).focus();
  }

  return { dialogRef, onBackdropClick, onDialogKeyDown };
}
