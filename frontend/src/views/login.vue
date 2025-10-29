<template>
  <div class="auth-container">
    <div class="auth-card">
      <!-- Header -->
      <div class="auth-header">
        <h1 class="auth-title">Welcome Back</h1>
        <p class="auth-subtitle">Sign in to your account</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="login" class="auth-form">
        <!-- Email Input -->
        <div class="input-group">
          <input
            type="email"
            id="email"
            v-model="emailInput"
            class="auth-input"
            placeholder="Email Address"
            required
          />
        </div>

        <!-- Password Input -->
        <div class="input-group">
          <input
            type="password"
            id="password"
            v-model="passwordInput"
            class="auth-input"
            placeholder="Password"
            required
          />
          <button type="button" class="password-toggle">
          
          </button>
        </div>

        <!-- Sign In Button -->
        <button type="submit" class="u-btn u-btn--primary" style="height: 50px; display: flex; justify-content: center;">
          Sign In
        </button>

        <!-- Register Link -->
        <p class="register-link">
          Don't have an account? 
          <router-link to="/signup" class="register-text" style="color: black;">Sign up</router-link>
        </p>
      </form>
    </div>

    <!-- Error Modal -->
    <div class="modal fade" id="errorModal" tabindex="-1" aria-labelledby="errorModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content error-modal-content">
          <div class="modal-header error-modal-header border-0 text-center">
            <div class="w-100">
              <div class="error-icon mb-3">
                <div class="error-circle">
                  <span class="error-x">✕</span>
                </div>
              </div>
              <h4 class="modal-title text-danger fw-bold mb-0" id="errorModalLabel">Sign In Failed</h4>
            </div>
            <button type="button" class="btn-close btn-close-white position-absolute" style="top: 15px; right: 15px;" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body text-center px-4 pb-4">
            <p class="error-message mb-4">{{ errorMessage }}</p>
            <div class="d-flex gap-2 justify-content-center">
              <button type="button" class="u-btn u-btn--primary" @click="goToSignup">Create Account</button>
              <button type="button" class="u-btn u-btn--secondary" data-bs-dismiss="modal">Try Again</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { app } from "../firebase";
import { getAuth, signInWithEmailAndPassword} from "firebase/auth";
import { Modal } from 'bootstrap';

export default {
  name: 'login',
  setup() {
    const router = useRouter();
    const auth = getAuth();

    const emailInput = ref('');
    const passwordInput = ref('');
    const errorMessage = ref('');

    const login = async () => {
      try {
        const login = await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
        router.push('/home');
      } catch (error) {
        console.error(error.code, error.message);
        errorMessage.value = 'Invalid email or password. Please try again.';
        
        // Show the modal
        const modal = new Modal(document.getElementById('errorModal'));
        modal.show();
      }
    }

    const goToSignup = () => {
      // Close the modal first
      const modal = Modal.getInstance(document.getElementById('errorModal'));
      if (modal) {
        modal.hide();
      }
      // Navigate to signup
      router.push('/signup');
    }

    return { emailInput, passwordInput, errorMessage, login, goToSignup };
  }
}
</script>

<style scoped>
.auth-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 2rem;
}

.auth-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  padding: 3rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 25px 45px rgba(0, 0, 0, 0.1);
}

.auth-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.auth-title {
  font-size: 2rem;
  font-weight: 700;
  color: black;
  margin-bottom: 0.5rem;
  letter-spacing: -0.025em;
}

.auth-subtitle {
  color: rgba(0, 0, 0, 0.6);
  font-size: 1rem;
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  position: relative;
}

.auth-input {
  width: 100%;
  padding: 1rem 1.25rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 16px !important;
  color: black;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
}

.auth-input::placeholder {
  color: rgba(0, 0, 0, 0.4);
}

.auth-input:focus {
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(0, 0, 0, 0.4);
  cursor: pointer;
  font-size: 1.1rem;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: rgba(0, 0, 0, 0.7);
}

.auth-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.5rem 0;
}

.register-link {
  text-align: center;
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.9rem;
  margin-top: 2rem;
  margin-bottom: 0;
}

.register-text {
  color: #22d3ee;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.register-text:hover {
  color: #67e8f9;
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 480px) {
  .auth-container {
    padding: 1rem;
  }
  
  .auth-card {
    padding: 2rem 1.5rem;
  }
  
  .auth-title {
    font-size: 1.75rem;
  }
}

/* Beautiful Error Modal Styles */
.error-modal-content {
  background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
  border: none;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.error-modal-header {
  background: linear-gradient(135deg, #ff4757 0%, #ff3838 100%);
  padding: 2rem 1.5rem 1.5rem;
  position: relative;
}

.error-icon {
  display: flex;
  justify-content: center;
  align-items: center;
}

.error-circle {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border: 3px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(10px);
  animation: pulse 2s infinite;
}

.error-x {
  color: white;
  font-size: 2rem;
  font-weight: bold;
}

.modal-title {
  color: white !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.error-message {
  color: #e0e0e0;
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
}

.btn-close-white {
  filter: invert(1) grayscale(100%) brightness(200%);
  opacity: 0.8;
}

.btn-close-white:hover {
  opacity: 1;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
}
</style>