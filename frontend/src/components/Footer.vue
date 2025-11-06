<template>
  <footer style="background-color: rgb(14, 14, 14); position: relative; z-index: 2;">
    <div class="container">
      <div class="row footer-logo-row mb-0">
        <router-link to="/home" class="footer-logo-link">
          <img src="../assets/logo.png" class="footer-logo-img" />
          <span class="footer-logo-text">FitU</span>
        </router-link>
      </div>
      <div class="row u-muted">
        <div class="col">
          Unlock your fitness potential with personalized workout plans, meal tracking, and expert guidance. 
        </div>
        
      </div>

      <div class="row mt-3">
        <div class="col-sm-4 col-12 footer-list-col-align">
          <h4>PLANNER</h4>
          <ul>
            <li><router-link to="/home" class="u-muted">Home</router-link></li>
            <li><router-link to="/workout-sets" class="u-muted">Workout Sets</router-link></li>
          </ul>
        </div>
        <div class="col-sm-4 col-12 footer-list-col-align">
          <h4>RESOURCES</h4>
          <ul>
            <li><router-link to="/exerciselibrary" class="u-muted">Library</router-link></li>
            <li><router-link to="/vault" class="u-muted">Vault</router-link></li>
            <li><router-link to="/virtual-gym" class="u-muted">Virtual Gym</router-link></li>
            <li><router-link to="/recipes" class="u-muted">Recipes</router-link></li>
          </ul>
        </div>
        <div class="col-sm-4 col-12 footer-list-col-align">
          <h4>SOCIAL</h4>
          <ul>
            <li><router-link to="/" class="u-muted">Instagram</router-link></li>
            <li><router-link to="/" class="u-muted">Twitter</router-link></li>
            <li><router-link to="/" class="u-muted">Facebook</router-link></li>
          </ul>
        </div>
      </div>
    </div>

    <hr class="">
    <div class="footer-bottom-center mb-3 mt-0">
      <p class="u-muted small mb-0">
        © {{ currentYear }} FitU. All rights reserved.
      </p>
    </div>
  </footer>
</template>

<script>
import {computed } from 'vue'

export default {
  name: 'Footer',
  setup() {
    const currentYear = computed(() => {
      return new Date().getFullYear()
    })

    return {
      currentYear
    }
  }
}
</script>

<style scoped>

@media (max-width: 575px) {
  .footer-list-col-align,
  .footer-list-col-align ul,
  .footer-list-col-align h4 {
    align-items: center !important;
    text-align: center !important;
    justify-content: center !important;
    margin-left: auto;
    margin-right: auto;
  }
  .row.mt-3 {
    justify-content: center !important;
    flex-direction: column !important;
    align-items: center !important;
  }
}


.footer-logo-row {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}
.footer-logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
}
.footer-logo-img {
  max-width: 100px;
  filter: brightness(0) invert(1);
  margin-right: 0.75rem;
}
.footer-logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: 1px;
  color: white;
}


.footer-bottom-center {
  width: 100%;
  text-align: center;
  margin-top: 1.5rem;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-list-col-align {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.footer-list-col-align h4 {
  margin-bottom: 0.5em;
  font-size: 1.1rem;
  letter-spacing: 1px;
}
.footer-list-col-align li {
  margin-bottom: 0.3em;
}

hr {
  opacity: 5%;
}
</style>

