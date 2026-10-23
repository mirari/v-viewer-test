import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const environments = [
  { name: 'Vue 2', url: 'http://127.0.0.1:4302', version: '4.0.0' },
  { name: 'Vue 3', url: 'http://127.0.0.1:4303', version: '5.0.0' },
  { name: 'Nuxt SSR', url: 'http://127.0.0.1:4304', version: '5.0.0' },
]
const kinds = ['component', 'directive', 'api'] as const
function errorsFor(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (e) => {
    if (e.type() === 'error' || /hydration.*mismatch/i.test(e.text()))
      errors.push(e.text())
  })
  page.on('response', (response) => {
    if (response.status() >= 400)
      errors.push(`${response.status()} ${response.url()}`)
  })
  return errors
}
const modal = (page: Page) => page.locator('.viewer-container.viewer-in')
async function ready(page: Page, url: string) {
  await page.goto(url)
  await expect(page.getByTestId('render-state')).toHaveText('客户端已挂载')
}
async function close(page: Page) {
  // Viewer.js ignores hide requests while its opening transition is running.
  await expect(modal(page)).toHaveCSS('opacity', '1')
  await modal(page).locator('.viewer-close').click()
  await expect(modal(page)).toHaveCount(0)
  await expect(page.locator('body')).not.toHaveClass(/viewer-open/)
}

for (const env of environments) {
  for (const kind of kinds) {
    test(`${env.name} / ${kind} / published package, full-page modal, original image, navigation, rotation`, async ({
      page,
    }) => {
      const errors = errorsFor(page)
      await ready(page, env.url)
      await expect(page.locator('.package-badge')).toContainText(env.version)
      await page.getByTestId(`${kind}-show`).click()
      const viewer = modal(page)
      await expect(viewer).toBeVisible()
      await expect(viewer).toHaveCSS('position', 'fixed')
      const index = kind === 'api' ? 1 : 0
      await expect(page.getByTestId(`${kind}-event`)).toHaveText(
        `viewed: ${index}`,
      )
      const fullImage = viewer.locator('.viewer-canvas img')
      await expect(fullImage).toHaveAttribute(
        'src',
        new RegExp(`/images/photo-0${index + 1}\\.jpg$`),
      )
      await expect
        .poll(() =>
          fullImage.evaluate((img) => (img as HTMLImageElement).naturalWidth),
        )
        .toBe(960)
      await expect
        .poll(() =>
          viewer.evaluate((el) => {
            const r = el.getBoundingClientRect()
            return (
              Math.abs(r.width - innerWidth) < 2 &&
              Math.abs(r.height - innerHeight) < 2
            )
          }),
        )
        .toBe(true)
      await viewer.getByRole('button', { name: 'Next', exact: true }).click()
      await expect(page.getByTestId(`${kind}-event`)).toHaveText(
        `viewed: ${index + 1}`,
      )
      await viewer
        .getByRole('button', { name: 'Rotate Right', exact: true })
        .click()
      await expect(fullImage).toHaveAttribute('style', /rotate\(90deg\)/)
      await viewer.getByRole('button', { name: 'Zoom In', exact: true }).click()
      await close(page)
      if (kind === 'api') {
        await expect(page.getByTestId('api-state')).toHaveText('未打开')
        await expect(page.getByTestId('api-hidden')).toHaveText('hidden: 1')
        // Modal markup is lazy: neither source gallery has been opened in this test.
        await expect(page.locator('.viewer-container')).toHaveCount(0)
      }
      expect(errors).toEqual([])
    })
  }

  for (const kind of ['component', 'directive'] as const) {
    test(`${env.name} / ${kind} / dynamic img DOM and thumbnail click`, async ({
      page,
    }) => {
      const errors = errorsFor(page)
      await ready(page, env.url)
      await page.getByTestId(`${kind}-show`).click()
      await expect(page.getByTestId(`${kind}-event`)).toHaveText('viewed: 0')
      await close(page)
      await page.getByTestId('add-image').click()
      await expect(
        page.getByTestId(`${kind}-images`).locator('img'),
      ).toHaveCount(6)
      // Wait for the documented observe debounce, using the rendered navigation.
      await expect(page.locator('.viewer-list li')).toHaveCount(6)
      await page.getByTestId(`${kind}-images`).locator('img').last().click()
      await expect(page.getByTestId(`${kind}-event`)).toHaveText('viewed: 5')
      await expect(modal(page).locator('.viewer-list li')).toHaveCount(6)
      await close(page)
      await page.getByTestId('remove-image').click()
      await page.getByTestId(`${kind}-show`).click()
      await expect(modal(page).locator('.viewer-list li')).toHaveCount(5)
      await close(page)
      await page.getByTestId('toolbar-toggle').uncheck()
      await page.getByTestId(`${kind}-show`).click()
      await expect(modal(page).locator('.viewer-toolbar')).toBeHidden()
      await close(page)
      expect(errors).toEqual([])
    })
  }

  test(`${env.name} / component / inline, appended slot and replaced toolbar`, async ({
    page,
  }) => {
    const errors = errorsFor(page)
    await ready(page, env.url)
    await page.getByTestId('inline-toggle').check()
    const inline = page.locator('[data-case="component"] .viewer-container')
    await expect(inline).toBeVisible()
    await expect(inline).not.toHaveClass(/viewer-fixed/)
    await expect(inline).toHaveCSS('position', 'absolute')
    await expect
      .poll(() =>
        inline.evaluate((el) => el.getBoundingClientRect().width < innerWidth),
      )
      .toBe(true)
    await expect(page.getByTestId('component-event')).toHaveText('viewed: 0')
    await page.getByTestId('append-rotate').click()
    await expect(inline.locator('.viewer-canvas img')).toHaveAttribute(
      'style',
      /rotate\(90deg\)/,
    )
    await page.getByTestId('custom-toolbar').check()
    await page.getByRole('button', { name: '自定义重置', exact: true }).click()
    await page.getByRole('button', { name: '自定义旋转', exact: true }).click()
    await expect(inline.locator('.viewer-canvas img')).toHaveAttribute(
      'style',
      /rotate\(90deg\)/,
    )
    await expect(
      inline.getByRole('button', { name: 'Zoom In', exact: true }),
    ).toHaveCount(0)
    await expect(page.getByTestId('append-rotate')).toBeVisible()
    await page.getByTestId('inline-toggle').uncheck()
    await page.getByTestId('component-show').click()
    await expect(
      page.getByRole('button', { name: '自定义旋转', exact: true }),
    ).toBeVisible()
    await close(page)
    expect(errors).toEqual([])
  })

  test(`${env.name} / API / hide versus destroy and next-open options snapshot`, async ({
    page,
  }) => {
    const errors = errorsFor(page)
    await ready(page, env.url)
    await page.getByTestId('api-show').click()
    await expect(page.getByTestId('api-state')).toHaveText('正在预览')
    await page.getByTestId('add-image').dispatchEvent('click')
    await page.getByTestId('toolbar-toggle').dispatchEvent('click')
    await expect(modal(page).locator('.viewer-list li')).toHaveCount(5)
    await expect(modal(page).locator('.viewer-toolbar')).toBeVisible()
    await page.getByTestId('api-hide').click()
    await expect(modal(page)).toHaveCount(0)
    await expect(page.getByTestId('api-hidden')).toHaveText('hidden: 1')
    await page.getByTestId('api-show').click()
    await expect(modal(page).locator('.viewer-list li')).toHaveCount(6)
    await expect(modal(page).locator('.viewer-toolbar')).toBeHidden()
    await expect(page.getByTestId('api-event')).toHaveText('viewed: 1')
    await page.getByTestId('api-destroy').click()
    await expect(modal(page)).toHaveCount(0)
    await expect(page.getByTestId('api-state')).toHaveText('未打开')
    await expect(page.getByTestId('api-hidden')).toHaveText('hidden: 1')
    await expect(page.locator('.viewer-container')).toHaveCount(0)
    expect(errors).toEqual([])
  })

  test(`${env.name} / ten-image limit and mobile layout`, async ({ page }) => {
    const errors = errorsFor(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await ready(page, env.url)
    for (let i = 0; i < 5; i++) await page.getByTestId('add-image').click()
    await expect(page.getByTestId('image-count')).toHaveText('10 / 10 张')
    await expect(page.getByTestId('add-image')).toBeDisabled()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await page.screenshot({
      path: `output/playwright/${env.name.replaceAll(' ', '-').toLowerCase()}-mobile.png`,
      fullPage: true,
    })
    for (let i = 0; i < 10; i++) await page.getByTestId('remove-image').click()
    for (const kind of kinds)
      await expect(page.getByTestId(`${kind}-show`)).toBeDisabled()
    await expect(page.getByTestId('remove-image')).toBeDisabled()
    expect(errors).toEqual([])
  })
}

test('Nuxt / real server HTML includes component, directive images and fetched data', async ({
  request,
}) => {
  const response = await request.get('http://127.0.0.1:4304/')
  expect(response.status()).toBe(200)
  const html = (await response.text()).replace(
    /<script\b[^>]*>[\s\S]*?<\/script>/gi,
    '',
  )
  expect(html).toContain('这段数据由 Nuxt 服务端生成')
  expect(html).toContain('服务端 HTML 已生成')
  expect(html).toContain('data-testid="component-images"')
  expect(html).toContain('data-testid="directive-images"')
  expect(html.match(/data-source="\/images\/photo-/g)).toHaveLength(10)
})
test('Nuxt / JavaScript-disabled browser receives the actual gallery', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('http://127.0.0.1:4304/')
    await expect(page.getByTestId('render-state')).toHaveText(
      '服务端 HTML 已生成',
    )
    await expect(page.getByTestId('server-data')).toContainText(
      'Nuxt 服务端生成',
    )
    await expect(
      page.getByTestId('component-images').locator('img'),
    ).toHaveCount(5)
    await expect(
      page.getByTestId('directive-images').locator('img'),
    ).toHaveCount(5)
  } finally {
    await context.close()
  }
})
for (const kind of kinds) {
  test(`Nuxt / route unmount cleans ${kind} modal and allows re-entry`, async ({
    page,
  }) => {
    const errors = errorsFor(page)
    await ready(page, 'http://127.0.0.1:4304/')
    await page.getByTestId(`${kind}-show`).click()
    await expect(modal(page)).toBeVisible()
    // Trigger the real NuxtLink while the viewer covers it.
    await page.getByTestId('leave-route').dispatchEvent('click')
    await expect(
      page.getByRole('heading', { name: '已离开图片浏览用例' }),
    ).toBeVisible()
    await expect(page.locator('.viewer-container')).toHaveCount(0)
    await expect(page.locator('body')).not.toHaveClass(/viewer-open/)
    await page.getByRole('link', { name: '返回图库' }).click()
    await expect(page.getByTestId('render-state')).toHaveText('客户端已挂载')
    await page.getByTestId(`${kind}-show`).click()
    await expect(modal(page)).toBeVisible()
    await close(page)
    expect(errors).toEqual([])
  })
}
