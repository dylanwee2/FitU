import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import reveal from '@/directives/reveal'

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'

// (Optional) Import Bootstrap JS if you want modals, tooltips, etc.
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Import global theme system
import '@/assets/theme.css'
import '@/assets/base.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.directive('reveal', reveal)
app.mount('#app')
