import Vue from 'vue'
import VueViewer from 'v-viewer'
import App from './App.vue'
import '../../../shared/styles.css'
Vue.use(VueViewer)
new Vue({ render: (h) => h(App) }).$mount('#app')
