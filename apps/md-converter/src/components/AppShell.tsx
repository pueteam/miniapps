import type { ComponentChildren } from 'preact';
import { InstallButton } from './InstallButton';

export function AppShell({ children }: Readonly<{ children: ComponentChildren }>) {
  return (
    <div class="app-shell">
      <header class="app-shell__header">
        <section class="hero-compact" aria-labelledby="converter-title">
          {/* <p class="hero-compact__eyebrow">MDconvertix</p> */}
          <h2 id="converter-title">MDconvertix</h2>
          <p>Convierte Markdown a DOCX, EPUB y HTML (y al revés)</p>
        </section>
        <InstallButton />
      </header>
      <main>{children}</main>
    </div>
  );
}
