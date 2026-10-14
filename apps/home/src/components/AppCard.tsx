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
