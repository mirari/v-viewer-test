import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  reporter: [['list'], ['html', { open: 'never' }]],
  outputDir: 'output/playwright/results',
  use: {
    browserName: 'chromium',
    viewport: { width: 1440, height: 960 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'pnpm --filter @viewer-test/vue2 preview',
      url: 'http://127.0.0.1:4302',
      reuseExistingServer: false,
    },
    {
      command: 'pnpm --filter @viewer-test/vue3 preview',
      url: 'http://127.0.0.1:4303',
      reuseExistingServer: false,
    },
    {
      command: 'pnpm --filter @viewer-test/nuxt preview',
      url: 'http://127.0.0.1:4304',
      reuseExistingServer: false,
    },
  ],
})
