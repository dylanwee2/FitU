<template>
  <div class="container mt-4">

    

    <!-- Weekly Meal Plan (generated from Spoonacular) -->
     <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>

    <h1>Find Recipes by Ingredients</h1>

    <form @submit.prevent="searchRecipes" class="search-form mt-3">
      <div class="search-input-wrap">
        <input
          v-model="ingredients"
          type="text"
          placeholder="Enter ingredients (comma separated) e.g. apples, flour, sugar"
          class="form-control"
          aria-label="Ingredients"
        />
      </div>

      <div class="number-input-wrap">
        <input v-model.number="number" type="number" min="1" class="form-control"/>
      </div>

      <div class="search-button-wrap mt-3">
        <button type="submit" class="u-special-btn">Search</button>
      </div>
    </form>

    <div v-if="recipes.length" class="row mt-4">
      <div v-for="recipe in recipes" :key="recipe.id" class="col-6 col-lg-4 mb-3">
        <div class="card h-100" style="background-color: var(--surface-subtle);">
          <img :src="recipe.image" class="card-img-top" :alt="recipe.title" />
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">{{ recipe.title }}</h5>
            <p class="mb-1 u-muted" style="font-size:0.8rem">Ready in: {{ recipe.readyInMinutes ?? 'N/A' }} min</p>
            <div class="text-center mt-auto">
              <button @click="viewRecipeDetails(recipe.id)" class="u-special-btn viewRecipe">View Recipe</button>
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
                <a :href="selectedRecipe.sourceUrl" target="_blank" class="u-special-btn originalButton">
                  View Original Recipe
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  <template v-if="showMealIdeas">
  <h2 class="mb-3">Meal Ideas</h2>
  <div class="meal-ideas mb-4 pt-4">

      <div v-if="mealIdeasLoading" class="text-center py-3">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Generating meal ideas...</p>
      </div>

      <div v-else-if="mealIdeasError" class="alert alert-danger">{{ mealIdeasError }}</div>

      <!-- Render up to 4 meal idea cards. Prefer `recipes` (search results) when available, otherwise fall back to fetched meal ideas -->
      <div class="row g-3">
          <div v-for="(meal, i) in mealIdeaCards" :key="meal.id || i" class="col-6 col-lg-3">
          <div class="card h-100">
            <img :src="getMealImage(meal)" class="card-img-top" :alt="meal.title || 'Meal'" />
            <div class="card-body d-flex flex-column">
              <h6 class="card-title mb-1" style="font-size:0.95rem">{{ meal.title }}</h6>
              <p class="mb-1 u-muted" style="font-size:0.8rem">Ready in: {{ meal.readyInMinutes || 'N/A' }} min</p>
              <div class="mt-auto text-end">
                <button class="u-special-btn" @click="viewRecipeDetails(meal.id)" v-if="meal.id">View Recipe</button>
                <a v-else :href="meal.sourceUrl || '#'" class="u-special-btn">View Recipe</a>
              </div>
            </div>
          </div>
        </div>

          <div v-for="n in (4 - mealIdeaCards.length)" :key="'ph-' + n" class="col-6 col-lg-3">
          <div class="card h-100 placeholder-card d-flex align-items-center justify-content-center">
            <div class="card-body text-center">
              <small class="text-muted">No meal</small>
            </div>
          </div>
        </div>
      </div>

  </div>
  </template>

  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

export default {
  setup() {
    const ingredients = ref('')
  const number = ref(5)
  const showMealIdeas = ref(true)
    
  // Meal ideas state (Spoonacular)
  const mealIdeas = ref([])
  const mealIdeasLoading = ref(false)
  const mealIdeasError = ref('')

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

    // Deduplicate meal suggestions to avoid repeated items across days
    const dedupeMeals = (list) => {
      const seen = new Set()
      const unique = []
      const makeKey = (m) => {
        if (!m) return 'null'
        if (m.id) return `id:${m.id}`
        const t = (m.title || '').trim().toLowerCase()
        const s = (m.sourceUrl || '').trim().toLowerCase()
        const i = (m.image || '').trim().toLowerCase()
        return `t:${t}|s:${s}|i:${i}`
      }
      for (const m of Array.isArray(list) ? list : []) {
        const key = makeKey(m)
        if (!seen.has(key)) {
          seen.add(key)
          unique.push(m)
        }
      }
      return unique
    }


    const fetchMealIdeas = async () => {
      mealIdeasLoading.value = true
      mealIdeasError.value = ''
      mealIdeas.value = []
      try {
        const apiKey = import.meta.env.VITE_SPOONACULAR_API_KEY
        if (!apiKey) {
          mealIdeasError.value = 'Spoonacular API key not configured (VITE_SPOONACULAR_API_KEY)'
          mealIdeasLoading.value = false
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
          mealIdeas.value = days
        } else if (Array.isArray(data.meals)) {
          // Fallback: a single array of meals (treat as one entry)
          mealIdeas.value = [{ day: 'Suggestions', meals: data.meals }]
        } else {
          mealIdeas.value = []
        }

      } catch (err) {
        console.error('Error fetching meal ideas:', err)
        mealIdeasError.value = err?.response?.data?.message || err.message || 'Failed to fetch meal ideas.'
      } finally {
        mealIdeasLoading.value = false
      }
    }

    onMounted(() => {
      fetchMealIdeas()
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

    // Flatten all meals from mealIdeas into a single array for simplified display
    const mealIdeasList = computed(() => {
      // mealIdeas is an array of { day, meals } (or suggestions)
      const flat = mealIdeas.value.flatMap(d => (d.meals && Array.isArray(d.meals)) ? d.meals : [])
      return dedupeMeals(flat)
    })

    const mealIdeasTotal = computed(() => mealIdeasList.value.length)

    // Up to 4 cards for meal ideas — always use curated meal ideas, even after search
    const mealIdeaCards = computed(() => {
      return mealIdeasList.value.slice(0, 4)
    })

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
  // Keep meal ideas visible below search results
  showMealIdeas.value = true
        //const API_URL = 'http://18.139.200.231:3000/api/recipes'
        const API_URL = 'http://localhost:3000/api/recipes'
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

        // Enrich search results with readyInMinutes via Spoonacular bulk info (if API key is configured)
        try {
          const apiKey = import.meta.env.VITE_SPOONACULAR_API_KEY
          const ids = (recipes.value || []).map(r => r.id).filter(Boolean)
          if (apiKey && ids.length) {
            const bulk = await axios.get('https://api.spoonacular.com/recipes/informationBulk', {
              params: { ids: ids.join(','), apiKey, includeNutrition: false }
            })
            const byId = new Map((bulk.data || []).map(item => [item.id, item]))
            recipes.value = recipes.value.map(r => {
              const info = byId.get(r.id)
              return info ? { ...r, readyInMinutes: info.readyInMinutes } : r
            })
          }
        } catch (e) {
          // Non-fatal: keep showing results without time if the enrichment fails
          console.warn('Could not enrich recipes with readyInMinutes:', e?.message || e)
        }
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
      // meal ideas
      mealIdeas,
      mealIdeasLoading,
      mealIdeasError,
      getMealImage,
      mealIdeasList,
      mealIdeasTotal
      ,
      mealIdeaCards,
      showMealIdeas
    }
  }
}
</script>

<style scoped>
.card-img-top { 
  object-fit: cover; 
  height: 180px; 
}

.meal-ideas .card-img-top {
  height: 180px;
  object-fit: cover;
}

.meal-badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.45rem;
}

.meal-ideas {
  max-height: 850px;
  overflow-y: auto;
  padding-right: 8px; /* avoid scrollbar overlapping content */
}

.meal-ideas .meal-card .card-body {
  padding: 0.6rem;
}

.placeholder-card .card-body { 
  min-height: 120px;
}

/* Prevent horizontal scroll originating from the Meal Ideas block */
.meal-ideas {
  overflow-x: hidden; /* disallow horizontal scroll */
}

/* Ensure row/columns and cards don't force overflow */
.meal-ideas .row {
  margin-left: 0;
  margin-right: 0;
}

.meal-ideas .card,
.meal-ideas .meal-card,
.meal-ideas .placeholder-card {
  min-width: 0; /* allow columns to shrink correctly in flex layout */
}

.meal-ideas img.card-img-top {
  max-width: 100%;
  display: block;
  height: 180px;
  object-fit: cover;
}

.meal-ideas .card-body {
  min-width: 0;
  overflow-wrap: break-word;
}

/* Ensure cards use the subtle surface background for consistency */
.card.h-100,
.meal-ideas .card,
.meal-card {
  background-color: var(--surface-subtle) !important;
}

/* Placeholder styling (uses subtle background and dashed border) */
.placeholder-card {
  background-color: var(--surface-subtle);
  border: 1px dashed var(--border-subtle);
}

/* Card pop-up on hover/focus for meal ideas and search result cards */
.card.h-100,
.meal-ideas .card,
.meal-ideas .meal-card,
.meal-ideas .placeholder-card {
  transition: transform 180ms ease, box-shadow 180ms ease;
  will-change: transform;
}

@media (hover: hover) and (pointer: fine) {
  .card.h-100:hover,
  .card.h-100:focus-within,
  .meal-ideas .card:hover,
  .meal-ideas .card:focus-within {
    transform: translateY(-8px) scale(1.01);
    box-shadow: 0 14px 30px rgba(0,0,0,0.15);
    z-index: 2;
  }
}

/* Provide accessible focus outline when keyboard navigating */
.card.h-100:focus-within,
.meal-ideas .card:focus-within {
  outline: 3px solid rgba(100, 149, 237, 0.15);
  outline-offset: 4px;
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

/* Make card action buttons stretch full width of the card body */
.card .card-body .u-btn {
  display: block;
  width: 100%;
  text-align: center;
}

/* Ensure u-special-btn behaves the same and centers text */
.card .card-body .u-special-btn {
  display: block;
  width: 100%;
  text-align: center;
}

/* Search form layout: keep controls on one row; shrink inputs if needed */
.search-form {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 12px;
}
.search-input-wrap {
  flex: 1 1 auto;
  min-width: 0; /* allow input to shrink on small screens */
}
.search-input-wrap .form-control {
  width: 100%;
}
.number-input-wrap {
  flex: 0 0 60px; /* fixed width per request */
  max-width: 60px;
}
.number-input-wrap .form-control {
  width: 100%;
}
.search-button-wrap {
  flex: 0 0 auto; /* button stays visible, no shrinking beyond content */
}

/* Dark-theme the number input spinner and ensure compact width */
.search-form input[type="number"] {
  color-scheme: dark; /* use dark UI controls (affects spinner) where supported */
}
.search-form input[type="number"]::-webkit-inner-spin-button,
.search-form input[type="number"]::-webkit-outer-spin-button {
  filter: brightness(0.7); /* darken spinner arrows in WebKit */
}

/* On small screens, avoid inner scrollbars for the cards section; let the page scroll instead */
@media (max-width: 768px) {
  .meal-ideas {
    max-height: none;
    overflow-y: visible;
    padding-right: 0; /* remove extra padding that accounted for scrollbar */
  }
}
</style>
