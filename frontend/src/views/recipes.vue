<template>
  <div class="container mt-4">

    <!-- Weekly Meal Plan (generated from Spoonacular) -->
    <h2 class="mb-3">Meal Ideas for the Week</h2>
    <div class="weekly-meal-plan mb-4">
    
      <div v-if="weeklyLoading" class="text-center py-3">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Generating weekly meal plan...</p>
      </div>

      <div v-else-if="weeklyError" class="alert alert-danger">{{ weeklyError }}</div>

      <div v-else-if="weeklyDays.length">
        <div class="row g-3">
          <div v-for="(day, idx) in weeklyDays" :key="idx" class="col-12">
            <div class="card p-3" style="background-color: var(--surface-subtle);">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <h5 class="mb-0">{{ day.day }}</h5>
                <small class="text-muted">{{ day.meals.length }} meals</small>
              </div>

              <div class="row">
                <!-- Render up to 3 meals per day: breakfast, lunch, dinner -->
                <div v-for="(meal, midx) in (day.meals.slice(0,3))" :key="meal.id || midx" class="col-4">
                  <div class="meal-card card h-100 position-relative">
                    <img :src="getMealImage(meal)" class="card-img-top" :alt="meal.title" />
                    <div class="card-body p-2 d-flex flex-column justify-content-between" style="min-height:120px">
                      <div>
                        <h6 class="card-title mb-1" style="font-size:0.95rem">{{ meal.title }}</h6>
                        <p class="mb-1 u-muted" style="font-size:0.8rem">Ready in: {{ meal.readyInMinutes || 'N/A' }} min</p>
                      </div>
                      <div class="text-end">
                        <a :href="meal.sourceUrl || ('https://spoonacular.com/recipes/' + (meal.id || ''))" target="_blank" class="u-btn  u-btn--primary text-center">View Recipe</a>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- If less than 3 meals, show placeholders to keep layout consistent -->
                <div v-for="n in (3 - Math.min(3, day.meals.length))" :key="'ph-' + n" class="col-4">
                  <div class="card h-100 placeholder-card" style="background: rgba(255,255,255,0.02); border: 1px dashed var(--border-subtle); height:100%;">
                    <div class="card-body d-flex align-items-center justify-content-center">
                      <small class="text-muted">No meal</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

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
        <div class="card h-100" style="background-color: var(--surface-subtle);">
          <img :src="recipe.image" class="card-img-top" :alt="recipe.title" />
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">{{ recipe.title }}</h5>
            <div class="text-center mt-auto">
              <button @click="viewRecipeDetails(recipe.id)" class="u-btn u-btn--primary viewRecipe">View Recipe</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else style="color: var(--muted);">No recipes yet. Enter ingredients and click Search.</div>

    <!-- Recipe Details Modal -->
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedRecipe?.title || 'Recipe Details' }}</h5>
            <button type="button" class="u-btn u-btn--danger" @click="closeModal">Close</button>
          </div>
          <div class="modal-body">
            <div v-if="loadingRecipe" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2">Loading recipe details...</p>
            </div>
            <div v-else-if="selectedRecipe">
              <!-- Recipe Image -->
              <img :src="selectedRecipe.image" :alt="selectedRecipe.title" class="img-fluid rounded mb-3" style="width: 100%; max-height: 300px; object-fit: cover;">
              
              <!-- Recipe Summary -->
              <div v-if="selectedRecipe.summary" class="mb-3">
                <h5><b><u>Summary</u></b></h5>
                <div v-html="selectedRecipe.summary"></div>
              </div>

              <!-- Recipe Summary -->
              <div class="row mb-3">
                

                <div class="col-3">
                  <!-- Ingredients -->
                  <div v-if="selectedRecipe.extendedIngredients?.length" class="mb-3">
                    <h5><b><u>Ingredients</u></b></h5>
                    <ul class="list-unstyled">
                      <li v-for="ingredient in selectedRecipe.extendedIngredients" :key="ingredient.id" class="mb-1">
                        <strong>{{ ingredient.amount }} {{ ingredient.unit }}</strong> {{ ingredient.name }}
                      </li>
                    </ul>
                  </div>
                </div>

                <div class="col-6">
                  <!-- Nutrition (if available) -->
                  <div v-if="selectedRecipe.nutrition?.nutrients?.length">
                    <h5><b><u>Nutrition (per serving)</u></b></h5>
                    <div class="row">
                      <div v-for="nutrient in selectedRecipe.nutrition.nutrients.slice(0, 6)" :key="nutrient.name" class="col-md-6 mb-2">
                        <small><strong>{{ nutrient.name }}:</strong> {{ nutrient.amount }}{{ nutrient.unit }}</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-3">
                  <h5><b><u>Prep & Servings</u></b></h5>
                  <p><strong>Ready in:</strong> {{ selectedRecipe.readyInMinutes }} minutes</p>
                  <p><strong>Servings:</strong> {{ selectedRecipe.servings }}</p>
                </div>
              </div>

              <!-- Instructions -->
              <div v-if="selectedRecipe.instructions" class="mb-3">
                <h6>Instructions</h6>
                <div v-html="selectedRecipe.instructions"></div>
              </div>

              <!-- Analyzed Instructions -->
              <div v-else-if="selectedRecipe.analyzedInstructions?.length" class="mb-3">
                <h6>Instructions</h6>
                <div v-for="(instruction, index) in selectedRecipe.analyzedInstructions" :key="index">
                  <ol>
                    <li v-for="step in instruction.steps" :key="step.number" class="mb-2">
                      {{ step.step }}
                    </li>
                  </ol>
                </div>
              </div>

              <!-- Source -->
              <div v-if="selectedRecipe.sourceUrl" class="mt-3 text-center">
                <a :href="selectedRecipe.sourceUrl" target="_blank" class="u-btn u-btn--primary originalButton">
                  View Original Recipe
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'

export default {
  setup() {
    const ingredients = ref('')
    const number = ref(5)
    
    // Weekly meal plan state (Spoonacular)
    const weeklyDays = ref([])
    const weeklyLoading = ref(false)
    const weeklyError = ref('')

    const getMealImage = (meal) => {
      // Prefer meal.image. If it's already a full URL, use it.
      // Otherwise build the Spoonacular image host URL using the filename returned in `image`.
      if (!meal) return '/images/recipe-placeholder.png'
      if (meal.image) {
        if (/^https?:\/\//i.test(meal.image)) return meal.image
        // Build URL: https://img.spoonacular.com/recipes/{image}
        return `https://img.spoonacular.com/recipes/${meal.image}`
      }

      // Fallback to legacy pattern by id if no image filename provided
      const imageType = meal.imageType || 'jpg'
      if (meal.id) return `https://spoonacular.com/recipeImages/${meal.id}-312x231.${imageType}`
      return '/images/recipe-placeholder.png'
    }

    const capitalize = (s) => s ? (s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()) : s


    const fetchDayMealPlan = async () => {
      weeklyLoading.value = true
      weeklyError.value = ''
      weeklyDays.value = []
      try {
        const apiKey = import.meta.env.VITE_SPOONACULAR_API_KEY
        if (!apiKey) {
          weeklyError.value = 'Spoonacular API key not configured (VITE_SPOONACULAR_API_KEY)'
          weeklyLoading.value = false
          return
        }

        const resp = await axios.get('https://api.spoonacular.com/mealplanner/generate', {
          params: {
            timeFrame: 'week',
            apiKey: apiKey
          }
        })

        const data = resp.data || {}

        // Spoonacular returns a 'week' object mapping day names to meals
        if (data.week && typeof data.week === 'object') {
          const order = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
          const days = []
          order.forEach(d => {
            if (data.week[d]) {
              days.push({
                day: capitalize(d),
                meals: data.week[d].meals ? data.week[d].meals : []
              })
            }
          })
          // include any additional keys not in order
          Object.keys(data.week).forEach(k => {
            if (!order.includes(k.toLowerCase())) {
              days.push({ day: capitalize(k), meals: data.week[k].meals || [] })
            }
          })
          weeklyDays.value = days
        } else if (Array.isArray(data.meals)) {
          // Fallback: a single array of meals (treat as one entry)
          weeklyDays.value = [{ day: 'Week', meals: data.meals }]
        } else {
          weeklyDays.value = []
        }

      } catch (err) {
        console.error('Error fetching weekly meal plan:', err)
        weeklyError.value = err?.response?.data?.message || err.message || 'Failed to fetch weekly meal plan.'
      } finally {
        weeklyLoading.value = false
      }
    }

    onMounted(() => {
      fetchDayMealPlan()
    })
    
    // =============================================================================
    // HARDCODED DATA FOR DEVELOPMENT/CSS STYLING
    // =============================================================================
    // TO SWITCH TO API CALLS:
    // 1. Change this to: const recipes = ref([])
    // 2. Uncomment the API code in searchRecipes() function below
    // 3. Uncomment the API code in viewRecipeDetails() function below
    
    // API Call 
    const recipes = ref([])
    const selectedRecipe = ref(null)

  // =============================================================================
  // Sample data removed — using live API calls by default
  // =============================================================================
    
    const error = ref('')
    
    // Modal state
    const showModal = ref(false)
    
    // Hardcoded detailed recipe data for modal
    // const selectedRecipe = ref({
    //   id: 631807,
    //   title: "Toasted Agnolotti (or Ravioli)",
    //   image: "https://img.spoonacular.com/recipes/631807-556x370.jpg",
    //   readyInMinutes: 45,
    //   servings: 2,
    //   healthScore: 61,
    //   vegetarian: false,
    //   vegan: false,
    //   glutenFree: false,
    //   dairyFree: true,
    //   summary: "Toasted Agnolotti (or Ravioli) requires around <b>45 minutes</b> from start to finish. This recipe serves 2 and costs $1.95 per serving. This main course has <b>965 calories</b>, <b>41g of protein</b>, and <b>28g of fat</b> per serving.",
    //   extendedIngredients: [
    //     {
    //       id: 93832,
    //       name: "pre-made agnolotti/ravioli",
    //       amount: 13.0,
    //       unit: "oz"
    //     },
    //     {
    //       id: 1123,
    //       name: "egg",
    //       amount: 1.0,
    //       unit: ""
    //     },
    //     {
    //       id: 18079,
    //       name: "breadcrumbs",
    //       amount: 1.5,
    //       unit: "cup"
    //     }
    //   ],
    //   analyzedInstructions: [
    //     {
    //       steps: [
    //         {
    //           number: 1,
    //           step: "Preheat oven to 180 degrees Celsius (350 F) for a fan-forced oven or 200 degrees Celsius (392 F) for a convection oven."
    //         },
    //         {
    //           number: 2,
    //           step: "Line a baking tray with baking paper."
    //         },
    //         {
    //           number: 3,
    //           step: "Spray a thin layer of olive oil on the baking paper. Set aside."
    //         },
    //         {
    //           number: 4,
    //           step: "Crack and beat an egg on a plate. On a separate plate add breadcrumbs."
    //         },
    //         {
    //           number: 5,
    //           step: "Dip agnolotti in the beaten egg first, then coat it with breadcrumbs."
    //         },
    //         {
    //           number: 6,
    //           step: "Place the crumbed agnolotti onto a baking tray and spray another thin layer of oil over them."
    //         },
    //         {
    //           number: 7,
    //           step: "Bake the crumbed agnolotti for 25 minutes or until golden brown."
    //         },
    //         {
    //           number: 8,
    //           step: "Serve immediately with pasta sauce or ketchup."
    //         }
    //       ]
    //     }
    //   ],
    //   nutrition: {
    //     nutrients: [
    //       { name: "Calories", amount: 965, unit: "kcal" },
    //       { name: "Protein", amount: 41, unit: "g" },
    //       { name: "Fat", amount: 28, unit: "g" },
    //       { name: "Carbohydrates", amount: 142, unit: "g" },
    //       { name: "Fiber", amount: 8, unit: "g" },
    //       { name: "Sugar", amount: 12, unit: "g" }
    //     ]
    //   },
    //   sourceUrl: "https://www.foodista.com/recipe/HR6QS422/toasted-agnolotti-or-ravioli"
    // })
    
    const loadingRecipe = ref(false)

    const searchRecipes = async () => {
      // =============================================================================
      // NOTE: Recipe data is currently HARDCODED above for CSS styling/development
      // The recipes.ref([...]) contains 6 sample recipes that display immediately
      // =============================================================================
      
      // =============================================================================
      // API CALL VERSION (uncomment this section to use real backend API)
      // =============================================================================
      
      error.value = ''
      recipes.value = []

      if (!ingredients.value.trim()) {
        error.value = 'Please enter at least one ingredient.'
        return
      }

      try {
        const API_URL = 'http://18.139.200.231:3000/api/recipes'
        const resp = await axios.get(API_URL, {
          params: {
            ingredients: ingredients.value,
            number: number.value
            // API key is handled by the backend via environment variable
          }
        })
        console.log('Frontend received response:', resp)
        console.log('Response data:', resp.data)
        console.log('Number of recipes:', resp.data?.length)
        recipes.value = resp.data
      } catch (err) {
        console.error('Error fetching recipes:', err)
        error.value = err?.response?.data?.error || err.message || 'Failed to fetch recipes.'
      }
      
    }

    const viewRecipeDetails = async (recipeId) => {
      // =============================================================================
      // HARDCODED DATA VERSION (for CSS styling/development)
      // =============================================================================
      // Using fake data - modal opens instantly with hardcoded recipe details
      // (uncomment this) showModal.value = true
      // selectedRecipe.value already contains hardcoded detailed recipe data from above
      
      // =============================================================================
      // API CALL VERSION (uncomment this section to use real Spoonacular API)
      // =============================================================================
      
      try {
        loadingRecipe.value = true
        showModal.value = true
        selectedRecipe.value = null

        const apiKey = import.meta.env.VITE_SPOONACULAR_API_KEY
        const response = await axios.get(`https://api.spoonacular.com/recipes/${recipeId}/information`, {
          params: {
            apiKey: apiKey,
            includeNutrition: true
          }
        })

        selectedRecipe.value = response.data
        console.log('Recipe details:', response.data)
      } catch (err) {
        console.error('Error fetching recipe details:', err)
        error.value = 'Failed to load recipe details.'
        closeModal()
      } finally {
        loadingRecipe.value = false
      }
      
    }

    const closeModal = () => {
      showModal.value = false
      selectedRecipe.value = null
      loadingRecipe.value = false
    }

    return { 
      ingredients, 
      number, 
      recipes, 
      error, 
      showModal,
      selectedRecipe,
      loadingRecipe,
      searchRecipes, 
      viewRecipeDetails,
      closeModal,
      // weekly meal plan
      weeklyDays,
      weeklyLoading,
      weeklyError,
      getMealImage
    }
  }
}
</script>

<style scoped>
.card-img-top { 
  object-fit: cover; 
  height: 180px; 
}

.weekly-meal-plan .card-img-top {
  height: 180px;
  object-fit: cover;
}

.meal-badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.45rem;
}

.weekly-meal-plan {
  max-height: 850px;
  overflow-y: auto;
  padding-right: 8px; /* avoid scrollbar overlapping content */
}

.weekly-meal-plan .meal-card .card-body {
  padding: 0.6rem;
}

.placeholder-card .card-body { 
  min-height: 120px;
}

/* Modal Styles */
.modal.fade.show.d-block {
  z-index: 9999;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex !important;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: var(--bg);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  color: var(--muted);
  border-color: var(--border-subtle);
}

.modal-dialog-scrollable {
  max-height: 90vh;
}

.modal-dialog-scrollable .modal-content {
  max-height: 100%;
}

.modal-dialog-scrollable .modal-body {
  overflow-y: auto;
  max-height: calc(90vh - 120px);
}

.badge {
  font-size: 0.75rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  font-weight: bold;
  color: #000;
  opacity: 0.5;
  cursor: pointer;
}

.btn-close:hover {
  opacity: 0.75;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

/* Remove modal header and footer borders */
.modal-header {
  border-bottom: none !important;
}

.modal-footer {
  border-top: none !important;
}

/* Center button text properly */
.u-btn {
  display: block;
}


.viewRecipe{
  justify-self: center;
  width: 100%;
}
</style>
