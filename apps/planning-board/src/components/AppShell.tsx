import type { ComponentChildren } from 'preact';
import { InstallButton } from './InstallButton';

export function AppShell(props: { children: ComponentChildren }) {
  return (
    <div class="app-shell">
      <header class="app-shell__header">
        {/* <div>
          <h1>ResPlanner</h1>
          <p>Resource planning board</p>
        </div>
        <InstallButton /> */}
        <section class="hero-compact" aria-labelledby="converter-title">
          <h2 id="converter-title">ResPlanner</h2>
          <p>Resource planning board</p>
        </section>
        <InstallButton />
      </header>
      <main>{props.children}</main>
    </div>
  );
}
