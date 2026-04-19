// import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { vFocus } from '@/directives/vFocus'
import { vHighlight } from '@/directives/vHighlight'
const app = createApp(App)
app.use(createPinia())
app.use(router)
app.directive('focus', vFocus)
app.directive('highlight', vHighlight)
app.mount('#app')