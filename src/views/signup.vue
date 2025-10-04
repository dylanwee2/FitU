<template>
  <div class="container">
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
      <button type="submit" class="btn btn-primary" @click.prevent="signup">Submit</button>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue';
import { app } from "../firebase";
import { getAuth, createUserWithEmailAndPassword} from "firebase/auth";

export default {
  name: 'Signup',
  setup() {
    const emailInput = ref('');
    const passwordInput = ref('');

    const signup = async () => {
      const auth = getAuth(); 

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
        setTimeout(() => {
          console.log('Do something after user is signed in');
        }, 10000);

        console.log('Signed up user:', userCredential.user);
        alert('Sign Up Successful.')
      } catch (error) {
        console.error(error.code, error.message);
        alert('Sign Up failed.')
      }
    }

    return { emailInput, passwordInput, signup };
  }
}
</script>