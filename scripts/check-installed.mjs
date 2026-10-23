import { createRequire } from 'node:module'
import { readFileSync, mkdirSync, writeFileSync, realpathSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
const results = []
for (const [app, expected] of [
  ['vue2', '4.0.0'],
  ['vue3', '5.0.0'],
  ['nuxt', '5.0.0'],
]) {
  const require = createRequire(resolve(`apps/${app}/package.json`))
  const entry = realpathSync(require.resolve('v-viewer'))
  const manifest = JSON.parse(
    readFileSync(join(dirname(entry), 'package.json'), 'utf8'),
  )
  const consumer = JSON.parse(readFileSync(`apps/${app}/package.json`, 'utf8'))
  if (
    manifest.version !== expected ||
    !entry.includes('node_modules') ||
    consumer.dependencies['v-viewer'] !== expected
  )
    throw new Error(`Invalid registry dependency: ${app}`)
  if (consumer.dependencies.viewerjs)
    throw new Error('Consumer must not need to install viewerjs explicitly')
  const library = require('v-viewer')
  if (
    !library.Viewer ||
    !library.vViewer ||
    !(app === 'vue2' ? library.viewerApi : library.useViewer)
  )
    throw new Error(`Missing SSR CommonJS exports: ${app}`)
  const libraryRequire = createRequire(entry)
  const viewerjsVersion = libraryRequire('viewerjs/package.json').version
  const result = {
    app,
    vue: require('vue/package.json').version,
    package: `v-viewer@${manifest.version}`,
    viewerjs: viewerjsVersion,
    entry,
  }
  results.push(result)
  console.log(JSON.stringify(result))
}
mkdirSync('output', { recursive: true })
writeFileSync(
  'output/installed-packages.json',
  JSON.stringify(results, null, 2) + '\n',
)
