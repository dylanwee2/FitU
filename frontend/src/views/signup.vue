<template>
  <div class="auth-container">
    <div class="auth-card">
      <!-- Header -->
      <div class="auth-header">
        <h1 class="auth-title">Create Account</h1>
        <p class="auth-subtitle">Sign up to get started</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="signup" class="auth-form">
        <!-- Name Input -->
        <div class="input-group">
          <input
            type="text"
            id="name"
            v-model="nameInput"
            class="auth-input"
            placeholder="Full Name"
            required
          />
        </div>

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
            <i class="fas fa-eye"></i>
          </button>
        </div>

        <!-- Terms & Conditions -->
        <div class="terms-section">
          <label class="remember-me">
            <input type="checkbox" class="remember-checkbox" required>
            <span class="checkmark"></span>
            I agree to the <a href="#" class="terms-link">Terms & Conditions</a>
          </label>
        </div>

        <!-- Sign Up Button -->
        <button type="submit" class="auth-button">
          Create Account
        </button>

        <!-- Login Link -->
        <p class="register-link">
          Already have an account? 
          <router-link to="/login" class="register-text">Sign in</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

export default {
  name: 'Signup',
  setup() {
    const router = useRouter();
    const auth = getAuth();
    const emailInput = ref('');
    const nameInput = ref('');
    const passwordInput = ref('');

    const signup = async () => {
      try {
        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
        const user = userCredential.user;
        
        // Update the user's display name in Firebase Auth
        await updateProfile(user, { displayName: nameInput.value });

        // Create user document in Firestore using the user's UID as the document ID
        // This ensures the document ID matches the auth UID
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
          fullName: nameInput.value,
          email: emailInput.value,
          photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(nameInput.value)}&size=150&background=e63946&color=fff`,
          
          // Default profile fields
          gender: '',
          age: null,
          height: null,
          weight: null,
          
          // Default goals - CHANGED: Use dailyCalorieGoal to match home page
          goalType: '',
          dailyGoal: 2000,
          dietaryPreference: '',
          allergies: '',
          workoutFrequency: 3,
          
          // Default preferences
          spotifyConnected: false,
          aiSuggestionsEnabled: true,
          remindersEnabled: true,
          darkMode: false,
          
          // Timestamps
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Navigate to login page
        router.push('/login');
      } catch (error) {
        console.error(error.code, error.message);
        
        // Provide more specific error messages
        let errorMsg = 'Sign Up failed.';
        if (error.code === 'auth/email-already-in-use') {
          errorMsg = 'This email is already registered. Please login instead.';
        } else if (error.code === 'auth/weak-password') {
          errorMsg = 'Password should be at least 6 characters.';
        } else if (error.code === 'auth/invalid-email') {
          errorMsg = 'Please enter a valid email address.';
        }
        
        alert(errorMsg);
      }
    }

    return { emailInput, nameInput, passwordInput, signup };
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
  margin: 0;
  box-sizing: border-box;
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
  border-radius: 16px;
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

.terms-section {
  margin: 0.5rem 0;
}

.remember-me {
  display: flex;
  align-items: flex-start;
  color: rgba(0, 0, 0, 0.7);
  font-size: 0.9rem;
  cursor: pointer;
  user-select: none;
  line-height: 1.4;
}

.remember-checkbox {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  margin-right: 0.5rem;
  margin-top: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.remember-checkbox:checked + .checkmark {
  background: #3b82f6;
  border-color: #3b82f6;
}

.remember-checkbox:checked + .checkmark::after {
  content: '✓';
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.terms-link {
  color: #22d3ee;
  text-decoration: none;
  transition: color 0.3s ease;
}

.terms-link:hover {
  color: #67e8f9;
  text-decoration: underline;
}

.auth-button {
  width: 100%;
  padding: 1.25rem;
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.auth-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
}

.auth-button:active {
  transform: translateY(0);
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