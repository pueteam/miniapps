import { h } from 'preact';
import { AppShell } from '../components/AppShell';
import { useEffect } from 'preact/hooks';
import { Toolbar } from '../features/board/ui/Toolbar';
import { SchedulerPane } from '../features/board/ui/SchedulerPane';
import { ContextMenu } from '../features/board/ui/ContextMenu';
import { HoverPopover } from '../features/board/ui/HoverPopover';
import { StatsBar } from '../features/board/ui/StatsBar';
import { clearTransientUi, loadAll } from '../features/board/state/actions';
import { registerSW } from './registerSW';
import './App.css';

export function App(): h.JSX.Element {
  useEffect(() => {
    loadAll();
    registerSW();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearTransientUi();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AppShell>
      <div className="app">
        <section class="grid">
        <div class="card">
        <div className="app__toolbar">
          <Toolbar />
        </div>
        <div className="app__scheduler">
          <SchedulerPane />
        </div>
        <div className="app__statsbar">
          <StatsBar />
        </div>
        <HoverPopover />
        <ContextMenu />
         </div>
      </section>
      </div>
    </AppShell>
  );
}
