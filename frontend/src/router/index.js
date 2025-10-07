import { createRouter, createWebHistory } from 'vue-router'

// Import the pages (views)
import Home from '../views/home.vue'
import Signup from '../views/signup.vue'
import Login from '../views/login.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/signup', name: 'Signup', component: Signup },
  { path: '/login', name: 'Login', component: Login }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router