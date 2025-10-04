<template>
  <div class="container">
    <h1>Sign In</h1>
    <form>
      <!-- Text input -->
      <div class="mb-3">
        <label for="exampleInputEmail" class="form-label">Email address</label>
        <input type="email" class="form-control" placeholder="name@example.com" v-model="emailInput">
      </div>
  
      <!-- Password -->
      <div class="mb-3">
        <label for="exampleInputPassword" class="form-label">Password</label>
        <input type="password" class="form-control" v-model="passwordInput">
      </div>
      
      <!-- Submit button -->
      <button type="submit" class="btn btn-primary" @click.prevent="signin">Submit</button>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue';
import { app } from "../firebase";
import { useRouter } from 'vue-router';
import { getAuth, signInWithEmailAndPassword} from "firebase/auth";

export default {
  name: 'signin',
  setup() {
    const router = useRouter();
    const emailInput = ref('');
    const passwordInput = ref('');

    const signin = async () => {
      const auth = getAuth(); 

      try {
        const signIn = await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
        console.log('Sign in successfully:', signIn);
        alert('Sign in successfully')
        // Move back to home page after successful signup 
        router.push('/');

      } catch (error) {
        console.error(error.code, error.message);
        alert('Sign In failed.')
      }
    }

    return { emailInput, passwordInput, signin };
  }
}
</script>