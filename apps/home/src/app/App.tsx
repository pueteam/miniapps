import { appsRegistry } from '../generated/apps-registry';
import { AppCard } from '../components/AppCard';

export function App() {
  return (
    <div class="home-page">
      <header class="site-header">
        <div class="site-header__inner">
          <span class="wordmark">Miniapps</span>
          <a class="repository-link" href="https://github.com/pueteam/miniapps" target="_blank" rel="noopener noreferrer">
            Ver en GitHub
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
              <path d="M15 3h6v6M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
            </svg>
          </a>
        </div>
      </header>

      <main class="home-layout">
        <header class="hero" aria-labelledby="home-heading">
          <div class="hero__content">
            {/* <p class="hero__eyebrow">Miniapps: espacio de herramientas</p> */}
            <h1 id="home-heading">MINIAPPS - Espacio de Herramientas</h1>
            <p class="hero__description">Aplicaciones locales y ligeras para editar documentos, planificar recursos y organizar tus ideas.</p>
          </div>
          <svg class="hero__decoration" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
            <rect x="3" y="3" width="18" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </header>

        <section class="catalog" aria-labelledby="applications-heading">
          <div class="catalog__header">
            <h2 id="applications-heading">Todas las aplicaciones</h2>
            <span class="catalog__count">{appsRegistry.length} aplicaciones</span>
          </div>
          <div class="grid">
            {appsRegistry.map((app) => (
              <AppCard key={app.name} app={app} />
            ))}
          </div>
        </section>
      </main>

      <footer class="site-footer">
        Miniapps · <a href="https://github.com/pueteam/miniapps" target="_blank" rel="noopener noreferrer">Repositorio de herramientas</a>.
      </footer>
    </div>
  );
}
