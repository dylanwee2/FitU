<template>
  <div class="auth-page">
    <video class="bg-video" autoplay muted loop playsinline preload="auto">
      <source src="/videos/UserLoginPageAnimation.mp4" type="video/mp4" />
    </video>
    <div class="auth-card">
      <!-- Header -->
      <div class="auth-header">
        <h1 >Welcome Back</h1>
        <p class="u-muted">Sign in to your account</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="login" class="auth-form">
        <!-- Email Input -->
        <div class="input-group">
          Email
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
          Password
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
        <button type="submit" class="u-special-btn" style="height: 50px; display: flex; justify-content: center;">
          Sign In
        </button>

        <!-- Inline Error Message -->
        <p v-if="errorMessage" class="text-center" style="color: #dc3545; margin-top: 0.5rem;">
          {{ errorMessage }}
        </p>

        <!-- Register Link -->
        <p class="u-muted text-center">
          Don't have an account? 
          <router-link to="/signup" style="color: var(--secondary); text-decoration: underline;">Sign up</router-link>
        </p>
      </form>
      </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { app } from "../firebase";
import { getAuth, signInWithEmailAndPassword} from "firebase/auth";

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
        let message = 'Sign in failed.';
        if (error.code === 'auth/invalid-email') {
          message = 'Please enter a valid email address.';
        } else if (error.code === 'auth/user-not-found') {
          message = 'No account found with this email.';
        } else if (error.code === 'auth/wrong-password') {
          message = 'Incorrect password. Please try again.';
        } else if (error.code === 'auth/too-many-requests') {
          message = 'Too many attempts. Please try again later.';
        }
        errorMessage.value = message;
      }
    }

    return { emailInput, passwordInput, login, errorMessage };
  }
}
</script>

<style scoped>
.auth-page {
  position: relative;
  min-height: 100vh;
  padding-top: 60px;
  padding-bottom: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-video {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  z-index: 0;
  pointer-events: none;
}




.auth-card {
  width: 100%;
  max-width: 420px;
  border-radius: 24px;
  padding: 2.5rem;
  background: var(--surface-subtle);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.15);
  backdrop-filter: blur(10px) saturate(140%);
  -webkit-backdrop-filter: blur(10px) saturate(140%);
  position: relative;
  z-index: 1;
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
</style>