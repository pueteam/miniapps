# Home components

Preact + TypeScript, Vite, vanilla CSS. AppCard is one linked card; AppPreview renders decorative inline SVG, with a generic document for future tools.

## apps/home/src/components/AppCard.tsx

~~~tsx
import { AppPreview } from './AppPreview';

type AppEntry = {
  name: string;
  title: string;
  description: string;
  href: string;
  category?: string;
  tags?: readonly string[];
};

const categoryLabels: Record<string, string> = {
  general: 'General',
  utilities: 'Herramientas',
  productivity: 'Productividad',
};

export function AppCard({ app }: { app: AppEntry }) {
  return (
    <a class="app-card" href={app.href}>
      <div class="app-card__preview" aria-hidden="true">
        <AppPreview name={app.name} />
      </div>
      <div class="app-card__content">
        <span class="app-card__category">{categoryLabels[app.category || 'general'] || app.category}</span>
        <h3>{app.title}</h3>
        <p>{app.description}</p>
        <span class="app-card__action">
          Abrir aplicación
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
            <path d="M5 12h14m-6-6 6 6-6 6" />
          </svg>
        </span>
      </div>
    </a>
  );
}

~~~
## apps/home/src/components/AppPreview.tsx

~~~tsx
import type { ComponentChildren } from 'preact';

const previews: Record<string, ComponentChildren> = {
  'platon-editor': (
    <g>
      <circle cx="20" cy="40" r="6" />
      <circle cx="60" cy="20" r="6" />
      <circle cx="60" cy="60" r="6" />
      <circle cx="100" cy="40" r="6" />
      <path d="M26 38 54 22M26 42 54 58M66 22 94 38M66 58 94 42" />
    </g>
  ),
  'template-mgr': (
    <g>
      <rect x="35" y="10" width="50" height="60" rx="4" />
      <g fill="currentColor" stroke="none">
        <rect x="45" y="25" width="30" height="6" rx="2" />
        <rect x="45" y="40" width="20" height="4" rx="2" fill-opacity="0.5" />
        <rect x="45" y="50" width="25" height="4" rx="2" fill-opacity="0.5" />
      </g>
    </g>
  ),
  'md-converter': (
    <g>
      <rect x="20" y="20" width="24" height="40" rx="2" />
      <path d="M54 40h12" stroke-dasharray="2 2" />
      <rect x="76" y="15" width="20" height="12" rx="2" />
      <rect x="76" y="34" width="20" height="12" rx="2" />
      <rect x="76" y="53" width="20" height="12" rx="2" />
    </g>
  ),
  'sticky-board': (
    <g fill="currentColor" stroke="none">
      <rect x="30" y="15" width="24" height="24" rx="2" fill-opacity="0.5" />
      <rect x="50" y="35" width="24" height="24" rx="2" />
      <rect x="65" y="20" width="24" height="24" rx="2" fill-opacity="0.3" />
    </g>
  ),
  'planning-board': (
    <g>
      <rect x="25" y="20" width="70" height="40" rx="4" />
      <path d="M25 32h70M45 20v40" />
      <g fill="currentColor" stroke="none">
        <rect x="52" y="38" width="16" height="8" rx="2" />
        <rect x="72" y="48" width="16" height="8" rx="2" fill-opacity="0.5" />
      </g>
    </g>
  ),
};

export function AppPreview({ name }: { name: string }) {
  return (
    <svg class="app-preview" width="120" height="80" viewBox="0 0 120 80" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">
      {previews[name] || <rect x="35" y="10" width="50" height="60" rx="4" />}
    </svg>
  );
}

~~~
