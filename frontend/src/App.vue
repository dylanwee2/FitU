<template>
  <div id="app" class="d-flex flex-column min-vh-100">
    <!-- Global NavBar Component -->
    <Navbar />

    <!-- Main content area -->
    <main id="main" class="flex-grow-1">
      <!-- Dynamic content (changes based on URL) -->
      <router-view />
    </main>

    <!-- Global Footer Component -->
    <Footer />
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'

export default {
  name: 'App',
  components: {
    Navbar,
    Footer
  }
}
</script>

<style>
/* Global styles for the app */
.min-vh-100 {
  min-height: 100vh;
}

.flex-grow-1 {
  flex-grow: 1;
}

/* Ensure main element is focusable for accessibility */
#main:focus {
  outline: none;
}

#main:focus-visible {
  outline: 2px solid var(--bs-primary);
  outline-offset: 2px;
}
</style>