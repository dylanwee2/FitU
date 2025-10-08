<template>
  <nav 
    role="navigation" 
    aria-label="Main navigation"
    class="navbar navbar-expand-lg sticky-top u-surface"
    :class="{ 'navbar-shadow': isScrolled }"
  >
    <div class="container-fluid">
      <!-- Skip to content link -->
      <a href="#main" class="visually-hidden-focusable">Skip to content</a>
      
      <!-- Brand -->
      <router-link class="navbar-brand fw-bold" to="/" style="color: var(--primary)">
        FitU
      </router-link>

      <!-- Mobile menu toggle -->
      <button 
        class="navbar-toggler u-btn" 
        type="button" 
        :aria-expanded="isMobileMenuOpen"
        aria-controls="navbarNav"
        aria-label="Toggle navigation menu"
        @click="toggleMobileMenu"
        ref="mobileToggle"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Navigation menu -->
      <div 
        class="collapse navbar-collapse" 
        id="navbarNav"
        :class="{ 'show': isMobileMenuOpen }"
        ref="mobileMenu"
      >
        <!-- Centered nav links (unchanged across auth state) -->
        <ul class="navbar-nav mx-auto gap-lg-1">
          <li 
            v-for="link in navigationLinks" 
            :key="link.href" 
            class="nav-item"
          >
            <router-link 
              :to="link.href"
              class="nav-link d-flex align-items-center"
              style="color: var(--muted)"
              :class="{ 'active': isActiveRoute(link.href) }"
              :aria-current="isActiveRoute(link.href) ? 'page' : undefined"
              @click="closeMobileMenu"
            >
              <span v-if="link.icon" class="me-2">{{ link.icon }}</span>
              <span style="color: var(--primary)">{{ link.label }}</span>
            </router-link>
          </li>
        </ul>

        <!-- Right CTA: Profile when authed, else Login/Sign Up -->
        <div class="d-none d-lg-flex align-items-center gap-2">
          <router-link v-if="isAuthed" to="/profile" class="btn btn-primary px-3 py-2" @click="closeMobileMenu">Profile</router-link>
          <template v-else>
            <router-link to="/login" class="btn btn-secondary px-3 py-2" @click="closeMobileMenu">Login</router-link>
            <router-link to="/signup" class="btn btn-primary px-3 py-2" @click="closeMobileMenu">Sign Up</router-link>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { navigationLinks } from '@/config/nav.config.js'
import { useUser } from '@/stores/user'

export default {
  name: 'Navbar',
  setup() {
    const route = useRoute()
    const user = useUser()
    const isMobileMenuOpen = ref(false)
    const isScrolled = ref(false)
    const mobileToggle = ref(null)
    const mobileMenu = ref(null)

    const isAuthed = computed(() => !!user.uid)

    // Check if current route matches the link
    const isActiveRoute = (href) => route.path === href

    // Toggle mobile menu
    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value
    }

    // Close mobile menu
    const closeMobileMenu = () => {
      isMobileMenuOpen.value = false
    }

    // Handle scroll for shadow effect
    const handleScroll = () => {
      isScrolled.value = window.scrollY > 10
    }

    // Handle escape key to close mobile menu
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isMobileMenuOpen.value) {
        closeMobileMenu()
        mobileToggle.value?.focus()
      }
    }

    // Handle outside click to close mobile menu
    const handleOutsideClick = (event) => {
      if (isMobileMenuOpen.value && 
          !mobileMenu.value?.contains(event.target) && 
          !mobileToggle.value?.contains(event.target)) {
        closeMobileMenu()
      }
    }

    // Focus trap for mobile menu
    const trapFocus = (event) => {
      if (!isMobileMenuOpen.value) return

      const focusableElements = mobileMenu.value?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )

      if (!focusableElements || focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.key === 'Tab') {
        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    onMounted(async () => {
      if (!user.uid) {
        try { await user.loadUser() } catch {}
      }
      window.addEventListener('scroll', handleScroll)
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('click', handleOutsideClick)
      document.addEventListener('keydown', trapFocus)
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('click', handleOutsideClick)
      document.removeEventListener('keydown', trapFocus)
    })

    return {
      navigationLinks,
      isAuthed,
      isMobileMenuOpen,
      isScrolled,
      mobileToggle,
      mobileMenu,
      isActiveRoute,
      toggleMobileMenu,
      closeMobileMenu
    }
  }
}
</script>

<style scoped>
.navbar-shadow {
  box-shadow: var(--shadow-card);
  transition: box-shadow 0.3s ease;
}

.nav-link.active {
  font-weight: 600;
  color: var(--primary) !important;
}

.navbar-brand {
  font-size: 1.5rem;
  color: var(--primary) !important;
}

.navbar-brand:hover {
  color: var(--primary) !important;
}

/* Focus styles for accessibility */
.nav-link:focus,
.navbar-brand:focus,
.navbar-toggler:focus {
  outline: 2px solid color-mix(in srgb, var(--ring) 70%, transparent);
  outline-offset: 2px;
}

/* Skip to content link */
.visually-hidden-focusable {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

.visually-hidden-focusable:focus {
  position: fixed !important;
  top: 10px !important;
  left: 10px !important;
  z-index: 9999 !important;
  width: auto !important;
  height: auto !important;
  padding: 8px 16px !important;
  margin: 0 !important;
  overflow: visible !important;
  clip: auto !important;
  white-space: normal !important;
  background: var(--primary) !important;
  color: #FFF7E6 !important;
  text-decoration: none !important;
  border-radius: 4px !important;
}

/* Mobile menu improvements */
@media (max-width: 991.98px) {
  .navbar-collapse {
    border-top: 1px solid var(--border-subtle);
    margin-top: 0.5rem;
    padding-top: 0.5rem;
  }

  .nav-link {
    padding: 0.75rem 1rem;
  }
}

/* Override Bootstrap navbar styles with theme tokens */
.navbar {
  background: var(--surface) !important;
  border-bottom: 1px solid var(--border-subtle);
}

.navbar-toggler {
  border: 1px solid var(--border-subtle);
  background: transparent;
}

.navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%2830, 27, 22, 0.75%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
}

/* Micro-interactions */
.nav-link { transition: transform .12s ease, color .2s ease, background-color .2s ease; }
.nav-link:active { transform: translateY(1px) scale(0.99); }
</style>