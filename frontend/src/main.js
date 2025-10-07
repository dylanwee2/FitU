import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'

// (Optional) Import Bootstrap JS if you want modals, tooltips, etc.
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Import global theme system
import '@/assets/theme.css'
import '@/assets/base.css'

createApp(App).use(router).mount('#app')
