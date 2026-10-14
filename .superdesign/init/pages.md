# Home dependency tree

## / — Home
- apps/home/src/main.tsx
  - apps/home/src/app/App.tsx
    - apps/home/src/generated/apps-registry.ts (generated data)
    - apps/home/src/components/AppCard.tsx
      - apps/home/src/components/AppPreview.tsx
  - apps/home/src/styles/index.css
    - styles/base.css (Manrope, Sora)

Vite configuration imports app.config.json. Sibling PWAs are linked destinations, not dependencies. No router or external icon library.
