<template>
  <div id="app">
    <!-- Global NavBar Component -->
    <Navbar></Navbar>

    <!-- Dynamic content (changes based on URL) -->
    <router-view></router-view>
  </div>
</template>

<script>
import Navbar from './components/navbar.vue'

export default {
  name: 'App',
  components:{
    Navbar
  }
}
</script>