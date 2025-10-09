<template>
  <div id="app" class="u-bg u-text d-flex flex-column min-vh-100">
    <!-- Global NavBar Component -->
    <Navbar />

    <!-- Main content area -->
    <main id="main" class="flex-grow-1" tabindex="-1">
      <!-- Route transitions -->
      <transition name="route" mode="out-in">
        <router-view />
      </transition>
    </main>

    <!-- Global Footer Component -->
    <Footer />

    <!-- Global Workout Cart Component -->
    <WorkoutCart />
  </div>
</template>

<script>
import Navbar from './components/navbar.vue'
import Footer from './components/Footer.vue'
import WorkoutCart from './components/WorkoutCart.vue'

export default {
  name: 'App',
  components: {
    Navbar,
    Footer,
    WorkoutCart
  }
}
</script>

<style>
/* Ensure main element is focusable for accessibility */
#main:focus {
  outline: none;
}

#main:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--ring) 70%, transparent);
  outline-offset: 2px;
}

/* Ensure proper flexbox layout for footer positioning */
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

/* Route transition animations */
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