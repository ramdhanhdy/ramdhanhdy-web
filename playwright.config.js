import { defineConfig, devices } from '@playwright/test';

const isCI = Boolean(globalThis.process?.env?.CI);

export default defineConfig({
  testDir: './tests/e2e',
  retries: isCI ? 1 : 0,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    viewport: { width: 1440, height: 900 },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !isCI,
  },
});
