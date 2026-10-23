<script setup lang="ts">
const { data } = await useFetch('/api/environment')
</script>
<template>
  <ViewerDemo environment="Nuxt SSR">
    <template #server
      ><p class="server-note" data-testid="server-data">
        {{ data?.message }}
      </p></template
    >
    <template #route
      ><NuxtLink to="/other" class="route-link" data-testid="leave-route"
        >切换路由，验证卸载清理 →</NuxtLink
      ></template
    >
  </ViewerDemo>
</template>
