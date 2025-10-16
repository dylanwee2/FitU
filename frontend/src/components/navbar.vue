<template>
  <nav class="navbar">
    <a href="/" style="text-decoration: none; color: inherit;">
      <div class="logo">
        <img src="../assets/logo.png" />
        <span style="margin-left: 20px;">FitU</span>
      </div>
    </a>

  <button class="toggle" @click="toggleMenu">&#9776</button>

  <div class="menu-items" :class="{ active: isMenuOpen }">
    <router-link to="/home" :class="{ active: $route.path === '/home' }" @click.native="closeMenu">Home</router-link>
    <router-link to="/exerciselibrary" :class="{ active: $route.path === '/exerciselibrary' }" @click.native="closeMenu">Library</router-link>
    <router-link to="/vault" :class="{ active: $route.path === '/vault' }" @click.native="closeMenu">Workouts</router-link>
    <router-link to="/recipes" :class="{ active: $route.path === '/recipes' }" @click.native="closeMenu">Recipes</router-link>
    <router-link to="/virtual-gym" :class="{ active: $route.path === '/virtual-gym' }" @click.native="closeMenu">Virtual Gym</router-link>
    <router-link to="/profile" :class="{ active: $route.path === '/profile' }" @click.native="closeMenu">Profile</router-link>
  </div>

  </nav>
    
</template>

<script>

import { ref } from 'vue';
import { RouterLink } from 'vue-router';

export default {
  name: 'Navbar',
  setup() {
    const isMenuOpen = ref(false);
    function toggleMenu() {
      isMenuOpen.value = !isMenuOpen.value;
    }
    function closeMenu() {
      isMenuOpen.value = false;
    }
    return { isMenuOpen, toggleMenu, closeMenu };
  }
}
</script>

<style scoped>


.navbar {
  display:flex;
  align-items: center;
  justify-content: space-between; 
  background-color: rgb(14, 14, 14);
  color: white;
  padding: 10px 40px;
}

.navbar .logo {
  font-weight: bold;
  color: white;
}

.navbar .logo img {
  max-width: 50px;
  filter: brightness(0) invert(1);
}

.navbar .menu-items {
  display:flex;
  gap:20px;
  align-items:center;
}

.navbar .menu-items a {
  text-decoration: none;
  color: white;
  padding: 10px 15px;
  font-weight: bold;
  border-radius: 5px;
  transition: background 0.3s ease;
}

.navbar .menu-items a.active {
  background: var(--primary)
}

.navbar .menu-items a:hover {
  background: var(--secondary)
}

.navbar .toggle {
  font-size: 25px;
  background: none;
  color: white;
  border: 0;
  font-weight: bold;
  display: none;
}

@media only screen and (max-width: 1024px) {
  .navbar .menu-items {
    display:none;
    position: absolute;
    top: 60px;
    background: #3b536b;
    padding: 20px 0;
    width: 100%;
    left: 0;
    flex-direction: column;
    border-top: 1px solid #3b536b; 
    z-index: 1000;
  }
  .navbar .toggle {
    display: block;
  }

  .navbar .menu-items.active {
    display: flex;
  }
}

</style>