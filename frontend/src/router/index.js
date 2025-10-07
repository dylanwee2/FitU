import { createRouter, createWebHistory } from 'vue-router'

// Import the pages (views)
import Home from '../views/home.vue'
import Signup from '../views/signup.vue'
import Login from '../views/login.vue'
import Calendar from '../views/calendar.vue'


const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/signup', name: 'Signup', component: Signup },
  { path: '/login', name: 'Login', component: Login },
  { path: '/calendar', name: 'Calendar', component: Calendar }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router