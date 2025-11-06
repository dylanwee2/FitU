<template>
  <div class="container mt-4">

    

     <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>

    <h1>AI Diet Planner</h1>

    <form @submit.prevent="suggestAndSearch" class="search-form mt-3">
      <div class="search-input-wrap">
        <input
          v-model="userPrompt"
          type="text"
          placeholder="Describe your needs (e.g. I am a vegan and I want to bulk)"
          class="form-control"
          aria-label="Diet prompt"
        />
      </div>

      <div class="col-auto">
        <input v-model.number="number" type="number" min="1" class="form-control" style="width:100px" />
      </div>

      <div class="col-auto">
        <button type="submit" class="btn btn-primary">Search</button>
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

    <div v-else style="color: var(--muted);">No recipes yet. Enter prompt and click search.</div>

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
              <img :src="selectedRecipe.image" :alt="selectedRecipe.title" class="img-fluid rounded mb-3" style="width: 100%; max-height: 300px; object-fit: cover;">
              
              <div v-if="selectedRecipe.summary" class="mb-3">
                <h5><b><u>Summary</u></b></h5>
                <div v-html="selectedRecipe.summary"></div>
              </div>

              <div class="row mb-3">
                

                <div class="col-4">
                  <div v-if="selectedRecipe.extendedIngredients?.length" class="mb-3">
                    <h5><b><u>Ingredients</u></b></h5>
                    <ul class="list-unstyled">
                      <li v-for="ingredient in selectedRecipe.extendedIngredients" :key="ingredient.id" class="mb-1">
                        <strong>{{ ingredient.amount }} {{ ingredient.unit }}</strong> {{ ingredient.name }}
                      </li>
                    </ul>
                  </div>
                </div>

                <div class="col-4">
                  <!-- Nutrition (if available) -->
                  <div v-if="selectedRecipe.nutrition?.nutrients?.length">
                    <h5><b><u>Nutrition (per serving)</u></b></h5>
                    <div class="row">
                      <div v-for="nutrient in selectedRecipe.nutrition.nutrients.slice(0, 1)" :key="nutrient.name" class="col-md-6 mb-2">
                        <small><strong>{{ nutrient.name }}:</strong> {{ nutrient.amount }}{{ nutrient.unit }}</small>
                      </div>
                    </div>

                    <!-- Macros breakdown (grams + kcal) -->
                    <div class="mt-2">
                      <h6 class="mb-1"><b>Macros (per serving)</b></h6>
                      <div v-if="macroTotals">
                        <small class="d-block"><strong>Fat:</strong> {{ macroTotals.fat_g }} g — {{ macroTotals.fat_kcal }} kcal</small>
                        <small class="d-block"><strong>Protein:</strong> {{ macroTotals.protein_g }} g — {{ macroTotals.protein_kcal }} kcal</small>
                        <small class="d-block"><strong>Carbs:</strong> {{ macroTotals.carbs_g }} g — {{ macroTotals.carbs_kcal }} kcal</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-4">
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
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

export default {
  setup() {
    const ingredients = ref('')
    const number = ref(5)
    const showMealIdeas = ref(true)
    const userPrompt = ref('')
    const geminiLoading = ref(false)
    const geminiError = ref('')
    const suggestedIngredients = ref([])
    
  const mealIdeas = ref([])
  const mealIdeasLoading = ref(false)
  const mealIdeasError = ref('')

    const getMealImage = (meal) => {
      if (!meal) return '/images/recipe-placeholder.png'
      if (meal.image) {
        if (/^https?:\/\//i.test(meal.image)) return meal.image
        return `https://img.spoonacular.com/recipes/${meal.image}`
      }

      const imageType = meal.imageType || 'jpg'
      if (meal.id) return `https://spoonacular.com/recipeImages/${meal.id}-312x231.${imageType}`
      return '/images/recipe-placeholder.png'
    }

    const capitalize = (s) => s ? (s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()) : s
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

    const route = useRoute()
    const router = useRouter()

    onMounted(() => {
      fetchMealIdeas()
    })
    
    const recipes = ref([])
    const selectedRecipe = ref(null)

    
    const error = ref('')
    
    const showModal = ref(false)
    
    const loadingRecipe = ref(false)

    const macroTotals = computed(() => {
      const r = selectedRecipe.value
      if (!r || !r.nutrition || !Array.isArray(r.nutrition.nutrients)) return null
      const nutrients = r.nutrition.nutrients
      const findAmount = (candidates) => {
        const lower = candidates.map(s => s.toLowerCase())
        const found = nutrients.find(n => lower.includes((n.name || '').toLowerCase()))
        return found ? Number(found.amount || 0) : 0
      }
      const fat_g = findAmount(['Fat'])
      const protein_g = findAmount(['Protein'])
      const carbs_g = findAmount(['Carbohydrates', 'Carbs', 'Carbohydrate'])
      const fat_kcal = Math.round(fat_g * 9)
      const protein_kcal = Math.round(protein_g * 4)
      const carbs_kcal = Math.round(carbs_g * 4)
      return {
        fat_g, protein_g, carbs_g,
        fat_kcal, protein_kcal, carbs_kcal,
        macro_kcal_total: fat_kcal + protein_kcal + carbs_kcal
      }
    })

    const mealIdeasList = computed(() => {
      const flat = mealIdeas.value.flatMap(d => (d.meals && Array.isArray(d.meals)) ? d.meals : [])
      return dedupeMeals(flat)
    })

    const mealIdeasTotal = computed(() => mealIdeasList.value.length)

    const mealIdeaCards = computed(() => {
      return mealIdeasList.value.slice(0, 4)
    })

    const searchRecipes = async (ingredientList) => {
      
      error.value = ''
      recipes.value = []

      const ingredientSource = ingredientList || ingredients.value
      if (!ingredientSource || !ingredientSource.trim()) {
        error.value = 'Please enter at least one ingredient or use the "Suggest ingredients & Search" button.'
        return
      }
      ingredients.value = ingredientSource

      try {
        const API_URL = 'http://18.139.200.231:3000/api/recipes'
        const resp = await axios.get(API_URL, {
          params: {
            ingredients: ingredients.value,
            number: number.value
          }
        })
        console.log('Frontend received response:', resp)
        console.log('Response data:', resp.data)
        console.log('Number of recipes:', resp.data?.length)
        recipes.value = resp.data

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
          console.warn('Could not enrich recipes with readyInMinutes:', e?.message || e)
        }
      } catch (err) {
        console.error('Error fetching recipes:', err)
        error.value = err?.response?.data?.error || err.message || 'Failed to fetch recipes.'
      }
      
    }

    const viewRecipeDetails = async (recipeId) => {
      
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

    const suggestAndSearch = async () => {
      geminiError.value = ''
      if (!userPrompt.value || !userPrompt.value.trim()) {
        geminiError.value = 'Please enter a prompt describing your diet and goal.'
        return
      }

      geminiLoading.value = true
      try {
        const promptText = `You are a helpful assistant. Given the user's request: "${userPrompt.value.trim()}". Reply with a short, comma-separated list of ingredients (no extra explanation). Example: "chickpeas, oats, almond milk".`

        const resp = await axios.post('http://18.139.200.231:3000/api/gemini/generate', { prompt: promptText })
        const resultText = resp?.data?.result || resp?.data || ''

        const parsed = parseIngredients(resultText)
        if (!parsed || parsed.length === 0) {
          geminiError.value = 'Could not parse ingredient suggestions. Please refine your prompt or enter ingredients manually.'
          suggestedIngredients.value = ''
          return
        }

        suggestedIngredients.value = parsed.join(', ')
        await searchRecipes(suggestedIngredients.value)
      } catch (err) {
        console.error('Gemini error:', err)
        geminiError.value = err?.response?.data?.error || err?.message || 'Failed to get suggestions from AI.'
      } finally {
        geminiLoading.value = false
      }
    }

    const parseIngredients = (text) => {
      if (!text) return []
      try {
        const maybe = JSON.parse(text)
        if (Array.isArray(maybe)) return maybe.map(i => String(i).trim()).filter(Boolean)
      } catch (e) {
      }

      const listMatch = text.match(/\[([^\]]+)\]/)
      if (listMatch && listMatch[1]) {
        return listMatch[1].split(/,|\n/).map(s => s.trim()).filter(Boolean)
      }

      const parts = text.split(/,|\n|;| and /i).map(s => s.replace(/^[0-9]+\.|^[\-\*]\s*/,'').trim()).filter(Boolean)
      const cleaned = parts.map(p => p.replace(/\(.*?\)/g, '').trim()).filter(Boolean)
      return cleaned
    }

    const closeModal = () => {
      showModal.value = false
      selectedRecipe.value = null
      loadingRecipe.value = false
    }

    return { 
      ingredients, 
      number, 
      userPrompt,
      geminiLoading,
      geminiError,
      suggestedIngredients,
      macroTotals,
      recipes, 
      error, 
      showModal,
      selectedRecipe,
      loadingRecipe,
      searchRecipes, 
      suggestAndSearch,
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
  padding-right: 8px;
}

.meal-ideas .meal-card .card-body {
  padding: 0.6rem;
}

.placeholder-card .card-body { 
  min-height: 120px;
}

.meal-ideas {
  overflow-x: hidden;
}

.meal-ideas .row {
  margin-left: 0;
  margin-right: 0;
}

.meal-ideas .card,
.meal-ideas .meal-card,
.meal-ideas .placeholder-card {
  min-width: 0;
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

.card.h-100,
.meal-ideas .card,
.meal-card {
  background-color: var(--surface-subtle) !important;
}

.placeholder-card {
  background-color: var(--surface-subtle);
  border: 1px dashed var(--border-subtle);
}

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

.card.h-100:focus-within,
.meal-ideas .card:focus-within {
  outline: 3px solid rgba(100, 149, 237, 0.15);
  outline-offset: 4px;
}

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

.modal-header {
  border-bottom: none !important;
}

.modal-footer {
  border-top: none !important;
}

.u-btn {
  display: block;
}


.viewRecipe{
  justify-self: center;
  width: 100%;
}

.card .card-body .u-btn {
  display: block;
  width: 100%;
  text-align: center;
}

.card .card-body .u-special-btn {
  display: block;
  width: 100%;
  text-align: center;
}

.search-form {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 12px;
}
.search-input-wrap {
  flex: 1 1 auto;
  min-width: 0;
}
.search-input-wrap .form-control {
  width: 100%;
}
.number-input-wrap {
  flex: 0 0 60px;
  max-width: 60px;
}
.number-input-wrap .form-control {
  width: 100%;
}
.search-button-wrap {
  flex: 0 0 auto;
}

.search-form input[type="number"] {
  color-scheme: dark;
}
.search-form input[type="number"]::-webkit-inner-spin-button,
.search-form input[type="number"]::-webkit-outer-spin-button {
  filter: brightness(0.7);
}

@media (max-width: 768px) {
  .meal-ideas {
    max-height: none;
    overflow-y: visible;
    padding-right: 0;
  }
}
</style>
