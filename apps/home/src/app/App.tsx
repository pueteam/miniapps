import { appsRegistry } from '../generated/apps-registry';
import { AppCard } from '../components/AppCard';

export function App() {
  return (
    <div class="home-layout">
      <header class="hero">
        <h1>Miniapps</h1>
        <p>Launcher de miniapps PWA del monorepo.</p>
      </header>

      <section class="grid">
        {appsRegistry.map((app) => (
          <AppCard key={app.name} app={app} />
        ))}
      </section>
    </div>
  );
}
