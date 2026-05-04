import { useEffect } from 'preact/hooks';
import { registerSW } from './registerSW';
import { AppShell } from '../components/AppShell';
import { StickyBoard } from '../features/sticky-board/components/StickyBoard';

export function App() {
  useEffect(() => {
    registerSW();
  }, []);

  return (
    <AppShell>
      <StickyBoard />
    </AppShell>
  );
}
