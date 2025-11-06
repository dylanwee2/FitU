import { createRouter, createWebHistory } from 'vue-router'


import Home from '../views/home.vue'
import Landing from '../views/landing.vue'
import Signup from '../views/signup.vue'
import Login from '../views/login.vue'
import Profile from '../views/profile.vue'
import Recipes from '../views/recipes.vue'
import ExerciseDetail from '../views/ExerciseDetail.vue'
import ExerciseBrowser from '../views/ExerciseBrowser.vue'
import CommentsAdmin from '../views/CommentsAdmin.vue'
import VirtualGym from '../views/VirtualGym.vue'
import WorkoutPlaylists from '../views/WorkoutPlaylists.vue'
import Vault from '../views/Vault.vue'

const routes = [
  { path: '/', name: 'Landing', component: Landing },
  { path: '/home', name: 'Home', component: Home },
  { path: '/signup', name: 'Signup', component: Signup },
  { path: '/login', name: 'Login', component: Login },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/recipes', name: 'Recipes', component: Recipes },
  { path: '/exerciselibrary', name: 'ExerciseBrowser', component: ExerciseBrowser },
  { path: '/exercise/:id', name: 'ExerciseDetail', component: ExerciseDetail },
  { path: '/admin/comments', name: 'CommentsAdmin', component: CommentsAdmin },
  { path: '/virtual-gym', name: 'VirtualGym', component: VirtualGym },
  { path: '/workout-sets', name: 'WorkoutPlaylists', component: WorkoutPlaylists },
  { path: '/vault', name: 'Vault', component: Vault },  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router