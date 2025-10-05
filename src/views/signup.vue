<template>
  <div class="container">
    <h1>Sign Up</h1>
    <form>
      <!-- Text input -->
      <div class="mb-3">
        <label class="form-label">Email address</label>
        <input type="email" class="form-control" placeholder="name@example.com" v-model="emailInput">
      </div>

      <!-- Text input -->
      <div class="mb-3">
        <label class="form-label">Name</label>
        <input type="text" class="form-control" v-model="nameInput">
      </div>
  
      <!-- Password -->
      <div class="mb-3">
        <label class="form-label">Password</label>
        <input type="password" class="form-control" v-model="passwordInput">
      </div>
      
      <!-- Submit button -->
      <button type="submit" class="btn btn-primary" @click.prevent="signup">Submit</button>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { app } from "../firebase";
import { getAuth, createUserWithEmailAndPassword, updateProfile} from "firebase/auth";

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
        const userCredential = await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
        const user = auth.currentUser;
        updateProfile(user, {displayName: nameInput.value})
        router.push('/login');
      } catch (error) {
        console.error(error.code, error.message);
        alert('Sign Up failed.')
      }
    }

    return { emailInput, nameInput, passwordInput, signup };
  }
}
</script>