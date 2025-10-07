<template>
  <footer role="contentinfo" class="u-surface border-top mt-5" style="border-color: var(--border-subtle) !important;">
    <div class="container py-4">
      <!-- Main footer content -->
      <div class="row">
        <!-- Left: Brand and description -->
        <div class="col-md-4 mb-3">
          <h5 class="fw-bold u-text-primary">FitU</h5>
          <p class="u-muted small mb-0">
            Your personal meal planning companion. Create healthy, personalized meal plans 
            tailored to your dietary preferences and health goals.
          </p>
        </div>

        <!-- Center: Quick links -->
        <div class="col-md-4 mb-3">
          <h6 class="fw-semibold mb-3 u-text">Quick Links</h6>
          <ul class="list-unstyled">
            <li v-for="link in navigationLinks" :key="link.href" class="mb-2">
              <router-link 
                :to="link.href" 
                class="text-decoration-none u-link small"
                @click="scrollToTop"
              >
                <span v-if="link.icon" class="me-2">{{ link.icon }}</span>
                {{ link.label }}
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Right: Social links -->
        <div class="col-md-4 mb-3">
          <h6 class="fw-semibold mb-3 u-text">Follow Us</h6>
          <div class="d-flex gap-3">
            <a 
              v-for="social in socialLinks" 
              :key="social.label"
              :href="social.href" 
              :aria-label="`Follow us on ${social.label}`"
              class="text-decoration-none u-link"
              @click="scrollToTop"
            >
              <span class="fs-5">{{ social.icon }}</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Bottom row: Copyright and back to top -->
      <hr class="my-3" style="border-color: var(--border-subtle);">
      <div class="row align-items-center">
        <div class="col-md-6">
          <p class="u-muted small mb-0">
            © {{ currentYear }} FitU. All rights reserved.
          </p>
        </div>
        <div class="col-md-6 text-md-end">
          <a 
            href="#main" 
            class="text-decoration-none u-link small"
            @click="scrollToTop"
            ref="backToTop"
          >
            ↑ Back to top
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { navigationLinks, socialLinks } from '@/config/nav.config.js'

export default {
  name: 'Footer',
  setup() {
    const backToTop = ref(null)

    // Get current year
    const currentYear = computed(() => {
      return new Date().getFullYear()
    })

    // Scroll to top function
    const scrollToTop = (event) => {
      event.preventDefault()
      
      // Focus management for back to top
      if (event.target === backToTop.value || event.target.closest('a[href="#main"]')) {
        const mainElement = document.getElementById('main')
        if (mainElement) {
          mainElement.scrollIntoView({ behavior: 'smooth' })
          mainElement.focus()
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      } else {
        // For other links, just scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }

    onMounted(() => {
      // Ensure main element exists for focus management
      if (!document.getElementById('main')) {
        console.warn('Footer: No element with id="main" found for focus management')
      }
    })

    return {
      navigationLinks,
      socialLinks,
      currentYear,
      backToTop,
      scrollToTop
    }
  }
}
</script>

<style scoped>
footer {
  margin-top: auto;
  background: var(--surface);
  border-top: 1px solid var(--border-subtle);
  flex-shrink: 0; /* Prevent footer from shrinking */
}

footer a:hover {
  color: var(--primary) !important;
}

footer a:focus {
  outline: 2px solid color-mix(in srgb, var(--ring) 70%, transparent);
  outline-offset: 2px;
  border-radius: 2px;
}

/* Responsive adjustments */
@media (max-width: 767.98px) {
  .col-md-4 {
    text-align: center;
  }
  
  .col-md-6:last-child {
    text-align: center !important;
    margin-top: 1rem;
  }
}

/* Social links hover effect */
footer a[aria-label*="Follow"]:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}

/* Override Bootstrap classes with theme tokens */
.text-primary {
  color: var(--primary) !important;
}

.text-muted {
  color: var(--muted) !important;
}
</style>

