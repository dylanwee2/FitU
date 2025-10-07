import { createRouter, createWebHistory } from 'vue-router'

// Import the pages (views)
import Home from '../views/home.vue'
import Signup from '../views/signup.vue'
import Login from '../views/login.vue'
import Profile from '../views/profile.vue'
import Recipes from '../views/recipes.vue'
import ExerciseDetail from '../views/ExerciseDetail.vue'
import CommentsAdmin from '../views/CommentsAdmin.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/recipes', name: 'Recipes', component: Recipes },
  { path: '/signup', name: 'Signup', component: Signup },
  { path: '/login', name: 'Login', component: Login },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/exercise/:id', name: 'ExerciseDetail', component: ExerciseDetail },
  { path: '/admin/comments', name: 'CommentsAdmin', component: CommentsAdmin }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router