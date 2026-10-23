import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-23',
  ssr: true,
  devtools: { enabled: false },
  telemetry: false,
  css: [fileURLToPath(new URL('../../shared/styles.css', import.meta.url))],
  dir: {
    public: fileURLToPath(new URL('../../shared/public', import.meta.url)),
  },
  app: {
    head: {
      title: 'Nuxt SSR · v-viewer test',
      htmlAttrs: { lang: 'zh-CN' },
    },
  },
})
