<template>
  <div 
    v-if="show" 
    class="modal fade show d-block" 
    tabindex="-1" 
    style="background-color: var(--bg); z-index: 9999;"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content" style="background-color: var(--surface-subtle); border: 1px solid var(--border-subtle);">
        <div class="modal-header" style="border-bottom: 1px solid var(--border-subtle);">
          <h5 class="modal-title" style="color: var(--muted);">Authentication Required</h5>
        </div>
        <div class="modal-body" style="color: var(--muted);">
          <p>You need to be logged in to use FitU. Please log in or sign up to continue.</p>
        </div>
        <div class="modal-footer" style="border-top: 1px solid var(--border-subtle);">
          <button type="button" class="u-btn u-btn--primary" @click="handleRedirect">
            Go to Login
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

// Props
defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()

const handleRedirect = () => {
  router.push('/login')
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(2px);
}

.modal-content {
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>