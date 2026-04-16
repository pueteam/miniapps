type AppEntry = {
  name: string;
  title: string;
  description: string;
  href: string;
  category?: string;
  tags?: readonly string[];
};

export function AppCard({ app }: { app: AppEntry }) {
  return (
    <a class="app-card" href={app.href}>
      <h2>{app.title}</h2>
      <p>{app.description}</p>
      <small>{app.category || 'general'}</small>
    </a>
  );
}
