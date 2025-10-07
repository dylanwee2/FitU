<template>
  <div class="container mt-4">
    <h1>Meal Planner</h1>
    <p>Welcome, {{ username }}</p>
    <button class="btn btn-primary mb-4" @click.prevent="signout">Sign Out</button>
  </div>

</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import WorkoutPlanner from "../components/WorkoutPlanner.vue";

export default {
  components: { WorkoutPlanner },

  setup() {
    const router = useRouter();
    const auth = getAuth();

    const username = ref("");
    const ingredients = ref("");
    const recipes = ref([]);

    const signout = async () => {
      try {
        await auth.signOut();
        router.push("/");
      } catch (err) {
        console.error(err);
      }
    };

    const searchRecipes = async () => {
      if (!ingredients.value.trim()) {
        alert("Please enter ingredients!");
        return;
      }

      try {
        // ✅ Your backend route (which calls Spoonacular)
        const API_URL = "http://localhost:3000/api/recipes";

        const response = await axios.get(API_URL, {
          params: {
            ingredients: ingredients.value, // e.g. "apples,flour,sugar"
            number: 5, // optional - number of recipes to fetch
          },
        });

        recipes.value = response.data;
        console.log("Recipes fetched:", response.data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
        alert("Failed to fetch recipes.");
      }
    };

    onMounted(() => {
      onAuthStateChanged(auth, (user) => {
        username.value = user ? user.displayName : "";
      });
    });

    return { username, signout, ingredients, recipes, searchRecipes };
  },
};
</script>

<style scoped>
input.form-control {
  max-width: 100%;
}
</style>