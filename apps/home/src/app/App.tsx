import { appsRegistry } from '../generated/apps-registry';
import { AppCard } from '../components/AppCard';

export function App() {
  return (
    <div class="home-layout">
      <header class="hero">
        <h1>Miniapps</h1>
        <p>Launcher de miniapps PWA del monorepo <a href="https://github.com/pueteam/miniapps" target="_blank" rel="noopener noreferrer">https://github.com/pueteam/miniapps</a></p>
      </header>

      <section class="grid">
        {appsRegistry.map((app) => (
          <AppCard key={app.name} app={app} />
        ))}
      </section>
    </div>
  );
}
