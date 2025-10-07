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

    <div class="mb-3">
        <label class="form-label">Gemini Prompt</label>
        <input type="text" class="form-control" v-model="geminiPrompt">
      </div>

    <!-- GEMINI button -->
      <button type="submit" class="btn btn-primary" @click.prevent="gemini_response">Gemini Button</button>
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
    const geminiPrompt = ref('');

    const login = async () => {
      try {
        const login = await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
        router.push('/');
      } catch (error) {
        console.error(error.code, error.message);
        alert('Sign In failed.')
      }
    }

    const gemini_response = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/gemini/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: geminiPrompt.value }),
        });

        const data = await response.json();
        console.log(data)
      } catch (err) {
        console.error("Error calling Gemini API:", err);
        alert("Something went wrong! Check console.");
    }}

    return { emailInput, passwordInput, geminiPrompt, login, gemini_response };
  }
}
</script>