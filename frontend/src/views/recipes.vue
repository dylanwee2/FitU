<template>
  <div class="container mt-4">
    <h1>Find Recipes by Ingredients</h1>

    <form @submit.prevent="searchRecipes" class="row g-3 align-items-center mt-3">
      <div class="col-12 col-md-9">
        <input
          v-model="ingredients"
          type="text"
          placeholder="Enter ingredients (comma separated) e.g. apples, flour, sugar"
          class="form-control"
          aria-label="Ingredients"
        />
      </div>

      <div class="col-auto">
        <input v-model.number="number" type="number" min="1" class="form-control" style="width:100px" />
      </div>

      <div class="col-auto">
        <button type="submit" class="btn btn-primary">Search</button>
      </div>
    </form>

    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>

    <div v-if="recipes.length" class="row mt-4">
      <div v-for="recipe in recipes" :key="recipe.id" class="col-12 col-md-6 col-lg-4 mb-3">
        <div class="card h-100">
          <img :src="recipe.image" class="card-img-top" :alt="recipe.title" />
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">{{ recipe.title }}</h5>
            <p class="card-text text-muted mb-2">Used ingredients: {{ recipe.usedIngredientCount }} / {{ recipe.missedIngredientCount + recipe.usedIngredientCount }}</p>
            <a :href="getSpoonacularUrl(recipe.id)" target="_blank" class="mt-auto btn btn-outline-secondary">View on Spoonacular</a>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="mt-4 text-muted">No recipes yet. Enter ingredients and click Search.</div>
  </div>
</template>

<script>
import { ref } from 'vue'
import axios from 'axios'

export default {
  setup() {
    const ingredients = ref('')
    const number = ref(5)
    const recipes = ref([])
    const error = ref('')

    const searchRecipes = async () => {
      error.value = ''
      recipes.value = []

      if (!ingredients.value.trim()) {
        error.value = 'Please enter at least one ingredient.'
        return
      }

      try {
        const API_URL = 'http://localhost:3000/api/recipes'
        const resp = await axios.get(API_URL, {
          params: {
            ingredients: ingredients.value,
            number: number.value
          }
        })

        recipes.value = resp.data
      } catch (err) {
        console.error('Error fetching recipes:', err)
        error.value = err?.response?.data?.error || err.message || 'Failed to fetch recipes.'
      }
    }

    const getSpoonacularUrl = (id) => `https://spoonacular.com/recipes/${id}`

    return { ingredients, number, recipes, error, searchRecipes, getSpoonacularUrl }
  }
}
</script>

<style scoped>
.card-img-top { object-fit: cover; height: 180px; }
</style>
