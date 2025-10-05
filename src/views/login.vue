<template>
  <div class="container">
    <h1>Login</h1>
    <form>
      <!-- Text input -->
      <div class="mb-3">
        <label class="form-label">Email address</label>
        <input type="email" class="form-control" placeholder="name@example.com" v-model="emailInput">
      </div>
  
      <!-- Password -->
      <div class="mb-3">
        <label class="form-label">Password</label>
        <input type="password" class="form-control" v-model="passwordInput">
      </div>
      
      <!-- Submit button -->
      <button type="submit" class="btn btn-primary" @click.prevent="login">Submit</button>
    </form>
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

    const login = async () => {
      try {
        const login = await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
        router.push('/');
      } catch (error) {
        console.error(error.code, error.message);
        alert('Sign In failed.')
      }
    }
    return { emailInput, passwordInput, login };
  }
}
</script>