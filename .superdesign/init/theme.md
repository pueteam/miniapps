# Token summary

Brand blue #004f87, hover #0a5b95; pink #d10053 / #e5005a available in shared palette. Page #f7f7f5, surface #fff, secondary text #4a4f57, border #e8eaed. Manrope body, Sora headings. Spacing 4/8/12/16/20/24/32/40/48/64px. Radii 8/16/24px. Home max width 1140px, 20–48px gutters. Grid: 3 columns above 1023px, 2 above 767px, 1 below; hero typography changes at 639px. Preview panel 140px, SVG 120×80px. Subtle/soft shadows, 120ms transitions, reduced-motion support.

## styles/base.css

~~~css
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Sora:wght@600;700&display=swap');

/* ── Brand palette ─────────────────────────── */
:root {
  --color-brand-blue-900: #004f87;
  --color-brand-blue-800: #0a5b95;
  --color-brand-blue-700: #1e6bad;
  --color-brand-blue-600: #3278bb;
  --color-brand-blue-500: #4685c9;
  --color-brand-blue-400: #5a92d7;
  --color-brand-blue-300: #6e9fe5;
  --color-brand-pink-600: #d10053;
  --color-brand-pink-500: #e5005a;

  --color-neutral-white: #ffffff;
  --color-neutral-25: #f9fafb;
  --color-neutral-50: #f3f4f6;
  --color-neutral-100: #e8eaed;
  --color-neutral-200: #d2d6db;
  --color-neutral-300: #c8cdd3;
  --color-neutral-500: #8a9099;
  --color-neutral-700: #4a4f57;
  --color-neutral-900: #1b1f26;
  --color-background-soft: #f7f7f5;
  --color-background-default: #ffffff;


  /* ── Semantic page tokens ─────────────────── */
  --color-bg-page: var(--color-background-default);
  --color-bg-surface: var(--color-background-default);
  --color-bg-subtle: var(--color-background-soft);

  --color-text-primary: var(--color-brand-blue-900);
  --color-text-secondary: var(--color-neutral-700);
  --color-text-muted: var(--color-neutral-500);

  --color-border-subtle: var(--color-neutral-100);
  --color-border-default: var(--color-neutral-300);

  --color-accent-primary: var(--color-brand-blue-900);
  --color-accent-hover: var(--color-brand-blue-800);
  --color-accent-active: var(--color-brand-blue-700);

  /* ── Typography ───────────────────────────── */
  --font-display: 'Sora', system-ui, sans-serif; /* headings, hero */
  --font-body: 'Manrope', system-ui, sans-serif; /* body copy, UI  */
  --font-primary: 'Manrope', 'Inter', sans-serif;
  --font-alternate: 'Sora', 'Inter', sans-serif;
  --font-ui: 'Inter', sans-serif;

  /* ── Spacing scale ────────────────────────── */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* ── Radii ────────────────────────────────── */
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-pill: 999px;

  /* ── Shadows ──────────────────────────────── */
  --shadow-subtle:
    0 1px 4px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.04);
  --shadow-soft:
    0 4px 12px rgba(0, 0, 0, 0.08), 0 12px 32px rgba(0, 0, 0, 0.06);
  --shadow-lifted:
    0 8px 24px rgba(0, 79, 135, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06);

  /* ── Component tokens ─────────────────────── */
  --button-height: 44px;
  --input-height: 44px;
  --card-radius: var(--radius-md);
  --card-padding: var(--space-6);

  /* ── Transitions ──────────────────────────── */
  --transition-fast: 120ms ease;
  --transition-normal: 220ms ease;
}

/* ── Reset ─────────────────────────────── */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

html,
body,
#app {
  height: 100%;
  min-height: 100%;
  /* overflow: hidden; */
}

p,
h1,
h2,
h3,
h4,
h5,
h6 {
  overflow-wrap: break-word;
}

/* ── Base body ─────────────────────────────── */
body {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text-primary);
  background: var(--color-bg-page);
}

/* ── Page shell ────────────────────────────── */
.app-shell {
  margin: 0 auto;
  padding: var(--space-10) clamp(var(--space-4), 4vw, var(--space-12));
}

.app-shell__header {
  display: grid;
  gap: var(--space-3);
  margin-bottom: var(--space-8);
  position: relative;
  /* padding-right: calc(var(--space-12) + 56px); */
}

.app-shell__header h1 {
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 3vw, 2.25rem);
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.app-shell__header p {
  color: var(--color-text-secondary);
  font-size: 0.9375rem;
  line-height: 1.65;
  max-width: 56ch;
}

.hero-compact {
  position: relative;
  margin-bottom: 24px;
  padding: 28px;
  overflow: hidden;
  border: 1px solid
    color-mix(
      in srgb,
      var(--color-border-subtle) 78%,
      var(--color-accent-primary)
    );
  border-radius: var(--radius-lg);
  background: linear-gradient(
    135deg,
    var(--color-bg-surface) 0%,
    color-mix(in srgb, var(--color-bg-subtle) 86%, var(--color-accent-primary))
      100%
  );
  box-shadow: var(--shadow-subtle);
  width: 100%;
}

.hero-compact::after {
  content: '';
  position: absolute;
  inset: auto -8% -52% auto;
  width: min(42vw, 420px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-accent-primary) 11%, transparent);
  pointer-events: none;
}

.hero-compact__eyebrow {
  margin: 0 0 var(--space-2);
  color: var(--color-accent-primary);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-compact h2 {
  position: relative;
  margin: 0;
  font-size: clamp(1.8rem, 3.2vw, 2.5rem);
  font-family: var(--font-display);
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
  max-width: 780px;
}

.hero-compact p {
  position: relative;
  margin: 6px 0 0;
  color: var(--color-text-muted);
  max-width: 68ch;
}

/* ── Card ──────────────────────────────────── */
.card {
  display: grid;
  gap: var(--space-4);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--card-radius);
  padding: var(--card-padding);
  box-shadow: var(--shadow-subtle);
  overflow: auto;
}

.card h2 {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
}

.card p {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

/* ── Button ────────────────────────────────── */
button.btn,
a.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--button-height);
  padding: 0 var(--space-5);
  border: none;
  border-radius: var(--radius-pill);
  background: var(--color-accent-primary);
  color: var(--color-neutral-white);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.875rem;
  letter-spacing: 0.01em;
  cursor: pointer;
  text-decoration: none;
  transition:
    background var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

button.btn:hover,
a.btn:hover {
  background: var(--color-accent-hover);
  box-shadow: 0 4px 12px rgba(0, 79, 135, 0.25);
  transform: translateY(-1px);
}

button.btn:active,
a.btn:active {
  background: var(--color-accent-active);
  transform: translateY(0);
  box-shadow: none;
}

button.install-btn,
a.install-btn {
  position: absolute;
  top: 0;
  right: 0;
  display: inline-flex;
  align-items: center;
  gap: 0;
  overflow: hidden;
  width: 48px;
  height: 48px;
  padding: 0 14px;
  border: none;
  border-radius: 9999px;
  background: var(--color-accent-primary);
  color: var(--color-neutral-white);
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 2px 10px rgba(0, 79, 135, 0.28);
  animation: install-beacon 3s ease-out 1.2s infinite;
  transition:
    width 0.32s cubic-bezier(0.34, 1.4, 0.64, 1),
    gap 0.28s ease,
    background 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

@keyframes install-beacon {
  0%, 100% {
    box-shadow: 0 2px 10px rgba(0, 79, 135, 0.28), 0 0 0 0 rgba(0, 79, 135, 0.32);
  }
  55% {
    box-shadow: 0 2px 10px rgba(0, 79, 135, 0.28), 0 0 0 9px rgba(0, 79, 135, 0);
  }
}

button.install-btn:hover,
a.install-btn:hover {
  width: 136px;
  gap: 8px;
  background: var(--color-accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 79, 135, 0.32);
  animation: none;
}

button.install-btn:active,
a.install-btn:active {
  transform: translateY(0) scale(0.96);
  box-shadow: 0 2px 8px rgba(0, 79, 135, 0.22);
  background: var(--color-accent-active);
}

.install-btn__icon {
  flex-shrink: 0;
  transition: transform 0.22s cubic-bezier(0.34, 1.4, 0.64, 1);
}

button.install-btn:hover .install-btn__icon,
a.install-btn:hover .install-btn__icon {
  transform: translateY(1.5px);
}

.install-btn__label {
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  transition:
    max-width 0.28s ease 0.04s,
    opacity 0.18s ease 0.1s;
}

button.install-btn:hover .install-btn__label,
a.install-btn:hover .install-btn__label {
  max-width: 90px;
  opacity: 1;
}

@media (max-width: 640px) {
  .app-shell__header {
    padding-right: 64px;
  }

  button.install-btn,
  a.install-btn {
    width: 48px;
    height: 48px;
  }

  .install-btn__icon {
    font-size: 1.15rem;
  }
}

/* ── Input / Textarea ──────────────────────── */
input,
textarea,
select {
  width: 100%;
  /* min-height: var(--input-height); */
  /* padding: 0 var(--space-4); */
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-default);
  background: var(--color-bg-surface);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: 0.875rem;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: var(--color-accent-primary);
  box-shadow: 0 0 0 3px rgba(0, 79, 135, 0.12);
}

textarea {
  padding-block: var(--space-3);
  min-height: 100px;
  resize: vertical;
}

/* Thin scrollbars — track is invisible, thumb uses board border token */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--board-border-2, #cbd0d8) transparent;
}
*::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
*::-webkit-scrollbar-track {
  background: transparent;
}
*::-webkit-scrollbar-thumb {
  background: var(--board-border-2, #cbd0d8);
  border-radius: 3px;
}

~~~
## apps/home/src/styles/index.css

~~~css
@import "../../../../styles/base.css";

:root {
  --color-bg-page: var(--color-background-soft);
  --color-bg-surface: var(--color-background-default);
  --color-text-primary: var(--color-brand-blue-900);
  --color-border-subtle: var(--color-neutral-100);
  --color-accent-primary: var(--color-brand-blue-900);
}

body {
  background: var(--color-bg-page);
}

.home-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.home-page a:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 4px;
}

.site-header {
  border-bottom: 1px solid var(--color-border-subtle);
  background: color-mix(in srgb, var(--color-bg-surface) 50%, transparent);
  backdrop-filter: blur(12px);
}

.site-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  max-width: 1140px;
  min-height: var(--space-16);
  margin: 0 auto;
  padding-inline: clamp(20px, 4vw, 48px);
}

.wordmark {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.025em;
}

.repository-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-secondary);
  font-weight: 600;
  text-decoration: none;
  transition: color var(--transition-fast);
}

.repository-link:hover {
  color: var(--color-accent-primary);
}

.home-layout {
  flex: 1;
  width: 100%;
  max-width: 1140px;
  margin: 0 auto;
  padding: calc(var(--space-12) + var(--space-2)) clamp(20px, 4vw, 48px);
}

.hero {
  position: relative;
  overflow: hidden;
  margin-bottom: var(--space-10);
  padding: var(--space-8);
  border: 1px solid color-mix(in srgb, var(--color-accent-primary) 10%, transparent);
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--color-bg-surface), color-mix(in srgb, var(--color-accent-primary) 5%, var(--color-bg-page)));
  box-shadow: var(--shadow-subtle);
}

.hero::after {
  position: absolute;
  right: -96px;
  bottom: -96px;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-accent-primary) 6%, transparent);
  filter: blur(64px);
  pointer-events: none;
  content: '';
}

.hero__content {
  position: relative;
  z-index: 1;
  max-width: 672px;
}

.hero__eyebrow {
  margin: 0 0 var(--space-2);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero h1 {
  margin: 0 0 var(--space-3);
  font-family: var(--font-display);
  font-size: 2.25rem;
  line-height: 1.15;
  letter-spacing: -0.025em;
}

.hero__description {
  max-width: 56ch;
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 1rem;
  line-height: 1.65;
}

.hero__decoration {
  position: absolute;
  top: 50%;
  right: var(--space-12);
  width: 96px;
  height: 96px;
  opacity: 0.1;
  transform: translateY(-50%);
  pointer-events: none;
}

.catalog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.catalog__header h2 {
  font-family: var(--font-display);
  font-size: 1.5rem;
  letter-spacing: -0.025em;
}

.catalog__count {
  flex-shrink: 0;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-pill);
  background: var(--color-neutral-100);
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-6);
  margin-top: var(--space-6);
}

.app-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--card-radius);
  color: inherit;
  text-decoration: none;
  box-shadow: var(--shadow-subtle);
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.app-card:hover {
  border-color: var(--color-accent-primary);
  box-shadow: var(--shadow-soft);
  transform: translateY(-2px);
}

.app-card__preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 140px;
  border-bottom: 1px solid var(--color-border-subtle);
  background: var(--color-background-soft);
}

.app-preview {
  opacity: 0.5;
  transition: opacity var(--transition-fast);
}

.app-card:hover .app-preview,
.app-card:focus-visible .app-preview {
  opacity: 0.7;
}

.app-card__content {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  padding: var(--card-padding);
}

.app-card__category {
  padding: var(--space-1) 10px;
  border-radius: var(--radius-sm);
  background: var(--color-background-soft);
  color: var(--color-text-secondary);
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.app-card h3 {
  margin: var(--space-3) 0 var(--space-2);
  font-family: var(--font-display);
  font-size: 1.125rem;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.app-card p {
  flex: 1;
  margin: 0;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.app-card__action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: var(--space-6);
  color: var(--color-accent-primary);
  font-weight: 600;
  opacity: 0.8;
  transition: opacity var(--transition-fast);
}

.app-card__action svg {
  transition: transform var(--transition-fast);
}

.app-card:hover .app-card__action,
.app-card:focus-visible .app-card__action {
  opacity: 1;
}

.app-card:hover .app-card__action svg {
  transform: translateX(4px);
}

.site-footer {
  width: 100%;
  max-width: 1140px;
  margin: 0 auto;
  padding: var(--space-8) clamp(20px, 4vw, 48px);
  border-top: 1px solid var(--color-border-subtle);
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
  text-align: center;
}

.site-footer a {
  color: var(--color-accent-primary);
  font-weight: 600;
  text-decoration: none;
}

.site-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 1023px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .home-layout {
    padding: var(--space-10) 20px;
  }

  .hero {
    margin-bottom: var(--space-8);
    padding: var(--space-6);
  }

  .hero h1 {
    font-size: 1.875rem;
  }

  .hero__decoration {
    display: none;
  }

  .catalog__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .grid {
    gap: var(--space-4);
    margin-top: var(--space-8);
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 639px) {
  .hero h1 {
    font-size: 1.5rem;
  }

  .hero__description {
    font-size: 0.875rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-page *,
  .home-page *::before,
  .home-page *::after {
    transition: none !important;
  }

  .app-card:hover,
  .app-card:hover .app-card__action svg {
    transform: none;
  }
}

~~~
