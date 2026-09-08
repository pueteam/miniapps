import { defineConfig, devices } from '@playwright/test';
const repo = process.env.PLATON_E2E_REPO || '';
const baseURL = `http://127.0.0.1:4178/${repo ? `${repo}/` : ''}platon-editor/`;
export default defineConfig({
  testDir: './e2e', timeout: 30000, workers: 1,
  use: { baseURL, trace: 'retain-on-failure' },
  webServer: {
    command: process.env.PLATON_E2E_PREBUILT
      ? 'pnpm preview --host 127.0.0.1 --port 4178'
      : 'pnpm build && pnpm preview --host 127.0.0.1 --port 4178',
    url: baseURL, reuseExistingServer: false, timeout: 300000,
    env: { VITE_REPO_NAME: repo, GITHUB_REPOSITORY: '' },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
