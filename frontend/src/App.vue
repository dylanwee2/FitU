<template>
  <div id="app" class="u-bg u-text d-flex flex-column min-vh-100">
    <Navbar />

    <main id="main" class="flex-grow-1" tabindex="-1">
      <!-- Route transitions -->
      <router-view v-slot="{ Component }">
        <transition name="route" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <Footer />

    <WorkoutCart />

    <AuthModal :show="showAuthModal" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from './composables/useAuth'
import Navbar from './components/navbar.vue'
import Footer from './components/Footer.vue'
import WorkoutCart from './components/WorkoutCart.vue'
import AuthModal from './components/AuthModal.vue'

const route = useRoute()
const { isAuthenticated, isLoading } = useAuth()

const publicRoutes = ['/', '/login', '/signup']
const showAuthModal = computed(() => {
  if (isLoading.value) return false 
  const requiresAuth = !publicRoutes.includes(route.path)
  return !isAuthenticated.value && requiresAuth
})
</script>

<style>
#main:focus {
  outline: none;
}

#main:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--ring) 70%, transparent);
  outline-offset: 2px;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

#main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.route-enter-active,
.route-leave-active {
  transition: opacity .25s ease, transform .25s ease;
}
.route-enter-from,
.route-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>