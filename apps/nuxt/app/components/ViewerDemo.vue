<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Viewer, vViewer, useViewer } from 'v-viewer'
import type { ViewerElement, ViewerOptions } from 'v-viewer'
import { sourceImages, imageHtml } from '../../../../shared/images'
import type { Kind } from '../../../../shared/images'

withDefaults(defineProps<{ environment?: string }>(), {
  environment: 'Nuxt SSR',
})
const packageVersion = '5.0.0'
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})
const images = ref(sourceImages.slice(0, 5))
const toolbar = ref(true)
const inline = ref(false)
const custom = ref(false)
const events = ref<Record<Kind, number>>({
  component: -1,
  directive: -1,
  api: -1,
})
const hiddenCount = ref(0)
const gallery = ref<InstanceType<typeof Viewer>>()
const directiveGallery = ref<ViewerElement>()
const options = computed<ViewerOptions>(() => ({
  toolbar: toolbar.value,
  url: 'data-source',
}))
const html = computed(() => imageHtml(images.value))
function onViewed(kind: Kind, event: Event) {
  events.value[kind] = (event as CustomEvent<{ index: number }>).detail.index
}
const apiOptions = computed<ViewerOptions>(() => ({
  ...options.value,
  initialViewIndex: 1,
  viewed(event) {
    onViewed('api', event)
  },
  hidden() {
    hiddenCount.value++
  },
}))
const {
  show: showApi,
  hide: hideApi,
  destroy: destroyApi,
  isShown,
} = useViewer({ images, options: apiOptions })
function showComponent() {
  gallery.value?.show()
}
function showDirective() {
  directiveGallery.value?.$viewer?.show()
}
function add() {
  if (images.value.length < sourceImages.length)
    images.value.push(sourceImages[images.value.length]!)
}
function remove() {
  images.value.pop()
}
</script>

<template>
  <main>
    <header class="masthead">
      <a class="wordmark" href="/">v-viewer <span>/ consumer lab</span></a>
      <nav aria-label="测试环境">
        <a href="http://127.0.0.1:5202">Vue 2</a>
        <a href="http://127.0.0.1:5203">Vue 3</a>
        <a href="http://127.0.0.1:5204">Nuxt SSR</a>
      </nav>
    </header>
    <section class="intro">
      <p class="eyebrow">{{ environment }} · TypeScript · npm 发布包</p>
      <h1>图片浏览，放进真实项目。</h1>
      <p class="lede">
        组件定制、动态 HTML 和图片数组。三种方式，共用一组真实图片。
      </p>
      <div class="status-line">
        <span class="package-badge">v-viewer {{ packageVersion }}</span>
        <span data-testid="render-state">{{
          mounted ? '客户端已挂载' : '服务端 HTML 已生成'
        }}</span>
      </div>
      <slot name="server" />
      <slot name="route" />
    </section>

    <section class="source-controls" aria-label="图库数据">
      <div>
        <strong>图库数据</strong
        ><span data-testid="image-count">{{ images.length }} / 10 张</span>
      </div>
      <button
        data-testid="add-image"
        :disabled="images.length === 10"
        @click="add"
      >
        添加图片
      </button>
      <button
        data-testid="remove-image"
        :disabled="images.length === 0"
        @click="remove"
      >
        删除图片
      </button>
      <label class="switch"
        ><input
          v-model="toolbar"
          data-testid="toolbar-toggle"
          type="checkbox"
        />工具栏</label
      >
    </section>

    <section class="case" data-case="component">
      <header class="case-heading">
        <div>
          <span class="number">01</span>
          <h2>组件</h2>
          <p>直接属性、Vue 事件、组件方法与工具栏插槽。</p>
        </div>
        <button
          class="primary"
          data-testid="component-show"
          :disabled="!images.length || inline"
          @click="showComponent"
        >
          显示 viewer
        </button>
      </header>
      <div class="case-options">
        <label
          ><input
            v-model="inline"
            data-testid="inline-toggle"
            type="checkbox"
          />inline · 容器内预览</label
        >
        <label
          ><input
            v-model="custom"
            data-testid="custom-toolbar"
            type="checkbox"
          />替换工具栏</label
        >
        <output data-testid="component-event"
          >viewed: {{ events.component }}</output
        >
      </div>
      <div :class="{ 'inline-stage': inline }">
        <Viewer
          ref="gallery"
          :inline="inline"
          :toolbar="toolbar"
          :focus="!inline"
          :min-height="340"
          url="data-source"
          @viewed="onViewed('component', $event)"
        >
          <div v-show="!inline" class="gallery" data-testid="component-images">
            <img
              v-for="image in images"
              :key="image.src"
              :src="image.src"
              :data-source="image['data-source']"
              :alt="image.alt"
            />
          </div>
          <template v-if="custom" #toolbar="{ zoom, rotate, reset }">
            <button
              class="slot-button custom-button"
              aria-label="自定义放大"
              @click="zoom(0.1)"
            >
              ＋
            </button>
            <button
              class="slot-button custom-button"
              aria-label="自定义旋转"
              @click="rotate(90)"
            >
              ↻
            </button>
            <button
              class="slot-button custom-button"
              aria-label="自定义重置"
              @click="reset()"
            >
              ↺
            </button>
          </template>
          <template #toolbar-append="{ rotate }">
            <button
              class="slot-button"
              data-testid="append-rotate"
              aria-label="追加旋转"
              @click="rotate(90)"
            >
              ↻
            </button>
          </template>
        </Viewer>
      </div>
    </section>

    <section class="case" data-case="directive">
      <header class="case-heading">
        <div>
          <span class="number">02</span>
          <h2>指令</h2>
          <p>模拟 Markdown 渲染：自动监听 HTML 内的 img 元素。</p>
        </div>
        <button
          class="primary"
          data-testid="directive-show"
          :disabled="!images.length"
          @click="showDirective"
        >
          显示 viewer
        </button>
      </header>
      <div class="case-options">
        <output data-testid="directive-event"
          >viewed: {{ events.directive }}</output
        >
      </div>
      <div
        ref="directiveGallery"
        v-viewer="options"
        class="gallery"
        data-testid="directive-images"
        @viewed="onViewed('directive', $event)"
        v-html="html"
      ></div>
    </section>

    <section class="case" data-case="api">
      <header class="case-heading">
        <div>
          <span class="number">03</span>
          <h2>API</h2>
          <p>按钮打开图片数组；第二张起始，关闭后释放临时图库。</p>
        </div>
        <button
          class="primary"
          data-testid="api-show"
          :disabled="!images.length"
          @click="showApi()"
        >
          显示 viewer
        </button>
      </header>
      <div class="api-panel">
        <div class="api-controls" :class="{ 'is-open': isShown }">
          <button data-testid="api-hide" @click="hideApi">hide()</button>
          <button data-testid="api-destroy" @click="destroyApi">
            destroy()
          </button>
          <output data-testid="api-state">{{
            isShown ? '正在预览' : '未打开'
          }}</output>
          <output data-testid="api-event">viewed: {{ events.api }}</output>
          <output data-testid="api-hidden">hidden: {{ hiddenCount }}</output>
        </div>
        <p>缩略图 240 × 160 → 原图 960 × 640 · initialViewIndex: 1</p>
        <p>API 的图片和配置在每次新建图库时读取。</p>
      </div>
    </section>
    <footer>
      默认样式随 v-viewer 自动加载。图片来自本地文件，不依赖外部图床。
    </footer>
  </main>
</template>
