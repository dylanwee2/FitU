<template>
  <div>
    <h1>Home Page</h1>
    <p> {{ username }}</p>
  </div>

  <!-- Sign Out button -->
  <button type="submit" class="btn btn-primary" @click.prevent="signout">Signout</button>

</template>

<script>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { app } from "../firebase";
  import { getAuth, onAuthStateChanged } from "firebase/auth";

export default {
  setup() {
    const router = useRouter();
    const auth = getAuth();

    const username = ref('');

    const signout = async () => {
      try {
        auth.signOut()
        router.push('/');
      } catch (error) {
        console.error(error.code, error.message);
      }
    }

    onMounted(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          username.value = user.displayName
        } else {
          username.value = ''
        }
      });
    });

    return { username, signout };
  }
}
</script>