import type { ComponentChildren } from 'preact';
import { InstallButton } from './InstallButton';

export function AppShell(props: { children: ComponentChildren }) {
  return (
    <div class="app-shell">
      <header class="app-shell__header">
        <div>
          <h1>MDconvertix</h1>
          <p>Convert Markdown files to DOCX, EPUB, HTML</p>
        </div>
        <InstallButton />
      </header>
      <main>{props.children}</main>
    </div>
  );
}
