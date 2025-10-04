import { createRouter, createWebHistory } from 'vue-router'

// Import the pages (views)
import Home from '../views/Home.vue'
import Signup from '../views/signup.vue'
import Signin from '../views/signin.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/signup', name: 'Signup', component: Signup },
  { path: '/signin', name: 'Signin', component: Signin }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router