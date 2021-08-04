<template>
  <div class="hello">
    <viewer
      :options="options"
      :images="images"
      class="viewer"
      ref="viewer"
    >
      <template #default="scope">
        <img v-for="src in scope.images" :src="src" :key="src" :alt="src" />
        <div>{{ scope.options }}</div>
      </template>
    </viewer>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import 'viewerjs/dist/viewer.css'
import { component as Viewer } from 'v-viewer'

export default Vue.extend({
  name: 'HelloWorld',
  components: {
    Viewer
  },
  data () {
    return {
      options: {
        toolbar: false
      },
      images: [
        'https://picsum.photos/200/200',
        'https://picsum.photos/300/200',
        'https://picsum.photos/250/200'
      ]
    }
  },
  methods: {
  }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
