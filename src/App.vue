<template>
  <div id="app">
    <nav>
      <!-- Static navigation (always here) -->
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </nav>

    <!-- Dynamic content (changes based on URL) -->
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>