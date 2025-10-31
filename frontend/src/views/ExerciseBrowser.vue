<template>
  <div class="exercise-browser">
    <div class="container mt-4">
      <!-- Header -->
      <div class="text-center mb-4 pt-4">
        <h1 >Exercise Library</h1>
        <p class="u-muted">Discover thousands of exercises to reach your fitness goals</p>
      </div>

      <!-- Search Bar -->
      <div class="search-section mb-4">
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6">
            <div class="search-container">
              <input
                v-model="searchQuery"
                @input="handleSearch"
                type="text"
                class="form-control search-input"
                placeholder="Search exercises by name (e.g., push-up, squat, bicep)..."
                :disabled="loading"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-section text-center py-5">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="loading-text">Loading exercises...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-section text-center py-5">
        <div class="error-icon mb-3">
          <i class="fas fa-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
        </div>
        <h4 class="error-title">Oops! Something went wrong</h4>
        <p class="error-message">{{ error }}</p>
        <button @click="fetchExercises" class="btn btn-primary">
          <i class="fas fa-redo me-2"></i>Try Again
        </button>
      </div>

      <!-- Exercise Grid -->
      <div v-else class="exercises-section">
        <!-- Results Info -->
        <div class="results-info mb-4">
          <div class="row align-items-center">
            <div class="col">
              <p class="u-muted mb-0">
                {{ exercises.length }} exercise{{ exercises.length !== 1 ? 's' : '' }} found
                <span v-if="totalExercises > 0" class="u-muted">
                  ({{ totalExercises }} total available)
                </span>
                <span v-if="searchQuery" class="search-query">for "{{ searchQuery }}"</span>
              </p>
            </div>
            <div class="col-auto" v-if="searchQuery">
              <button @click="clearSearch" class="btn btn-outline-secondary btn-sm">
                Clear Search
              </button>
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div v-if="exercises.length === 0" class="no-results text-center py-5">
          <div class="no-results-icon mb-3">
          </div>
          <h4 class="no-results-title">No exercises found</h4>
          <p class="no-results-message">Try adjusting your search terms or browse all exercises</p>
          <button @click="clearSearch" class="btn btn-primary">Browse All Exercises</button>
        </div>

        <!-- Exercise Cards Grid -->
        <div v-else class="exercise-grid">
          <div class="row g-4">
            <div 
              v-for="exercise in exercises" 
              :key="exercise.id"
              class="col-sm-6 col-md-4 col-lg-3"
            >
              <div class="exercise-card u-card" @click="viewExercise(exercise)">
                <!-- Exercise Image -->
                <div class="exercise-image-container">
                  <img 
                    :src="exercise.gifUrl || '/images/exercise-placeholder.png'" 
                    :alt="exercise.name"
                    class="exercise-image"
                    @error="handleImageError"
                    loading="lazy"
                  >
                </div>

                <!-- Exercise Info -->
                <div class="exercise-info">
                  <h5 class="exercise-name">{{ formatExerciseName(exercise.name) }}</h5>
                  
                  <div class="exercise-badges">
                    <div 
                    class="badge target-muscle-badge me-1 clickable-badge" 
                    @click.stop="searchByTarget(exercise.target)"
                    :title="`Search for ${formatTarget(exercise.target)} exercises`"
                    >
                      <span class="target-muscle">{{ formatTarget(exercise.target) || 'Full Body' }}</span>
                    </div>
                    <span 
                      class="badge body-part-badge me-1 clickable-badge" 
                      @click.stop="searchByBodyPart(exercise.bodyPart)"
                      :title="`Search for ${formatBodyPart(exercise.bodyPart)} exercises`"
                    >
                      {{ formatBodyPart(exercise.bodyPart) || 'General' }}
                    </span>
                    <span 
                      class="badge equipment-badge clickable-badge" 
                      @click.stop="searchByEquipment(exercise.equipment)"
                      :title="`Search for ${formatEquipment(exercise.equipment)} exercises`"
                    >
                      {{ formatEquipment(exercise.equipment) || 'Bodyweight' }}
                    </span>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="exercise-actions">
                  <button 
                    @click.stop="toggleCart(exercise)"
                    class="u-btn"
                    :class="isInCart(exercise.id) ? 'u-btn--danger' : 'u-special-btn'"
                    :title="isInCart(exercise.id) ? 'Remove from workout cart' : 'Add to workout cart'"
                    style="width: 100%; text-align: center; justify-content: center;"
                  >
                    {{ isInCart(exercise.id) ? 'Remove from Cart' : 'Add to Cart' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div v-if="hasMorePages" class="load-more-section text-center mt-5">
          <button @click="loadMoreExercises" class="btn btn-outline-primary" :disabled="loadingMore">
            <span v-if="loadingMore" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="fas fa-plus me-2"></i>
            {{ loadingMore ? 'Loading...' : 'Load More Exercises' }}
          </button>
        </div>
        
        <!-- End of Results Indicator -->
        <div v-else-if="exercises.length > 0" class="text-center mt-5 mb-4">
          <p class="text-muted">
            <i class="fas fa-check me-2"></i>
            You've seen all {{ totalExercises }} exercises!
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkoutCartStore } from '../stores/workoutCart'

// Router
const router = useRouter()

// Cart store
const cartStore = useWorkoutCartStore()

// Reactive state
const exercises = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const error = ref('')
const searchQuery = ref('')
const searchTimeout = ref(null)
const totalExercises = ref(0)
const currentPage = ref(1)
const hasMorePages = ref(false)

// API Configuration
const API_BASE_URL = 'https://www.exercisedb.dev/api/v1'
const EXERCISES_PER_PAGE = 12

// Methods
const fetchExercises = async (query = '', append = false) => {
  if (!append) {
    loading.value = true
    currentPage.value = 1
  } else {
    loadingMore.value = true
  }
  
  error.value = ''
  
  try {
    const offset = append ? (currentPage.value - 1) * EXERCISES_PER_PAGE : 0
    const url = query 
      ? `${API_BASE_URL}/exercises/search?q=${encodeURIComponent(query)}&limit=${EXERCISES_PER_PAGE}&offset=${offset}`
      : `${API_BASE_URL}/exercises?limit=${EXERCISES_PER_PAGE}&offset=${offset}`
    
    // console.log('Fetching exercises from:', url)
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch exercises: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Handle ExerciseDB API response structure
    if (data.success && data.data) {
      // Map the API response to our expected format
      const mappedExercises = data.data.map(exercise => ({
        id: exercise.exerciseId,
        name: exercise.name,
        target: Array.isArray(exercise.targetMuscles) ? exercise.targetMuscles.join(', ') : exercise.targetMuscles,
        bodyPart: Array.isArray(exercise.bodyParts) ? exercise.bodyParts.join(', ') : exercise.bodyParts,
        equipment: Array.isArray(exercise.equipments) ? exercise.equipments.join(', ') : exercise.equipments,
        gifUrl: exercise.gifUrl,
        instructions: exercise.instructions ? (
          typeof exercise.instructions === 'string' 
            ? exercise.instructions.split('Step:').filter(step => step.trim()).map(step => step.trim())
            : exercise.instructions
        ) : [],
        secondaryMuscles: exercise.secondaryMuscles ? (
          typeof exercise.secondaryMuscles === 'string'
            ? exercise.secondaryMuscles.split(' ')
            : exercise.secondaryMuscles
        ) : []
      }))
      
      // Handle pagination
      if (append) {
        exercises.value = [...exercises.value, ...mappedExercises]
        currentPage.value += 1
      } else {
        exercises.value = mappedExercises
        currentPage.value = 1
      }
      
      // Update pagination info from metadata
      if (data.metadata) {
        totalExercises.value = data.metadata.totalExercises || 0
        hasMorePages.value = !!data.metadata.nextPage
      }
      
    } else {
      // Fallback for other API structures
      exercises.value = Array.isArray(data) ? data : (data.exercises || [])
    }
    
    // console.log(`Loaded ${exercises.value.length} exercises (${totalExercises.value} total available)`)
    
  } catch (err) {
    console.error('Error fetching exercises:', err)
    error.value = err.message || 'Failed to load exercises. Please check your internet connection and try again.'
    if (!append) {
      exercises.value = []
    }
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// Load more exercises (pagination)
const loadMoreExercises = async () => {
  if (!hasMorePages.value || loadingMore.value) return
  await fetchExercises(searchQuery.value, true)
}

const handleSearch = () => {
  // Debounce search to avoid too many API calls
  clearTimeout(searchTimeout.value)
  
  searchTimeout.value = setTimeout(() => {
    if (searchQuery.value.trim()) {
      fetchExercises(searchQuery.value.trim())
    } else {
      fetchExercises()
    }
  }, 500)
}

const clearSearch = () => {
  searchQuery.value = ''
  fetchExercises()
}

const viewExercise = (exercise) => {
  // Navigate to exercise detail page
  router.push(`/exercise/${exercise.id}`)
}

const handleImageError = (event) => {
  // Fallback for broken images
  event.target.src = '/images/exercise-placeholder.png'
}

// Cart methods
const addToCart = (exercise) => {
  cartStore.addToCart(exercise)
}

const removeFromCart = (exercise) => {
  cartStore.removeFromCart(exercise.id)
}

const toggleCart = (exercise) => {
  if (isInCart(exercise.id)) {
    removeFromCart(exercise)
  } else {
    addToCart(exercise)
  }
}

const isInCart = (exerciseId) => {
  return cartStore.cartItems.some(item => item.id === exerciseId)
}

// Search by category methods
const searchByTarget = (target) => {
  const cleanTarget = formatTarget(target)
  searchQuery.value = cleanTarget
  fetchExercises(cleanTarget)
}

const searchByBodyPart = (bodyPart) => {
  const cleanBodyPart = formatBodyPart(bodyPart)
  searchQuery.value = cleanBodyPart
  fetchExercises(cleanBodyPart)
}

const searchByEquipment = (equipment) => {
  const cleanEquipment = formatEquipment(equipment)
  searchQuery.value = cleanEquipment
  fetchExercises(cleanEquipment)
}

// Format functions to clean up array data
const formatExerciseName = (name) => {
  if (!name) return 'Exercise'
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const formatTarget = (target) => {
  if (!target) return 'Full Body'
  if (Array.isArray(target)) {
    return target.map(item => capitalizeFirstLetter(item)).join(', ')
  }
  return capitalizeFirstLetter(target.toString().replace(/[\[\]"]/g, '').replace(/,/g, ', '))
}

const formatBodyPart = (bodyPart) => {
  if (!bodyPart) return 'General'
  if (Array.isArray(bodyPart)) {
    return bodyPart.map(item => capitalizeFirstLetter(item)).join(', ')
  }
  return capitalizeFirstLetter(bodyPart.toString().replace(/[\[\]"]/g, '').replace(/,/g, ', '))
}

const formatEquipment = (equipment) => {
  if (!equipment) return 'Bodyweight'
  if (Array.isArray(equipment)) {
    return equipment.map(item => capitalizeFirstLetter(item)).join(', ')
  }
  return capitalizeFirstLetter(equipment.toString().replace(/[\[\]"]/g, '').replace(/,/g, ', '))
}

const capitalizeFirstLetter = (text) => {
  if (!text) return ''
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Lifecycle
onMounted(() => {
  fetchExercises()
})

</script>

<style scoped>
.exercise-browser {
  min-height: 100vh;
}

.container {
  max-width: 1200px;
}


/* Search */
.search-container {
  position: relative;
}

.search-input {
  padding: 1rem 1rem 1rem 3rem;
  border-radius: 50px;
  border: 2px solid #e9ecef;
  font-size: 1rem;
  transition: all 0.3s ease;
}


/* Loading */
.loading-section {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.loading-text {
  color: #6c757d;
  font-size: 1.1rem;
}

/* Error */
.error-section {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.error-title {
  color: #dc3545;
  margin-bottom: 1rem;
}

.error-message {
  color: #6c757d;
  margin-bottom: 2rem;
  max-width: 500px;
}

/* Results */

.search-query {
  color: #007bff;
  font-weight: 600;
}

/* Exercise Grid */
.exercise-grid {
  margin-bottom: 3rem;
}

.exercise-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.exercise-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.exercise-image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
  background: #f8f9fa;
}

.exercise-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.exercise-card:hover .exercise-image {
  transform: scale(1.05);
}



.exercise-card:hover {
  opacity: 1;
}

.exercise-info {
  padding: 1.5rem;
  flex-grow: 1;
}

.exercise-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.75rem;
  line-height: 1.4;
  letter-spacing: -0.025em;
  text-transform: capitalize;
}

.exercise-target {
  display: flex;
  align-items: center;
  color: #495057;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
  background: linear-gradient(135deg, var(--primary) 0%, #7083eb 100%);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 25px;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.exercise-target:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, var(--primary) 0%, #7083eb 100%);
}

.exercise-target:active {
  transform: translateY(0);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.exercise-target::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.exercise-target:hover::before {
  left: 100%;
}


.target-muscle {
  font-weight: 600;
  color: white;
  text-transform: capitalize;
  flex-grow: 1;
}

.search-hint {
  font-size: 0.8rem;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.exercise-target:hover .search-hint {
  opacity: 1;
}

.exercise-badges {
  margin-bottom: 1rem;
}

.clickable-badge {
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.clickable-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.clickable-badge:active {
  transform: translateY(0);
}

.clickable-badge.bg-primary:hover {
  background-color: #0056b3 !important;
}

.clickable-badge.bg-secondary:hover {
  background-color: #495057 !important;
}

/* Nuanced charcoal pill theme for badges with color-coded dots */
.exercise-badges .badge {
  position: relative;
  background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
  color: #e9e9e9 !important;
  border: 1px solid rgba(201, 162, 39, 0.28) !important;
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.01em;
  padding: 0.25rem 0.6rem 0.25rem 1.2rem; /* extra space between dot and text */
  width: auto; /* let content decide */
  max-width: 100%;
  justify-self: start; /* prevent grid stretch */
  white-space: nowrap; /* single line */
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.25);
}

@media (max-width: 420px) {
  .exercise-badges {
    grid-template-columns: 1fr;
  }
}

.exercise-badges .badge:hover {
  transform: none;
  border-color: rgba(201, 162, 39, 0.42) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.28);
}

.exercise-badges .badge::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0) 40%);
  pointer-events: none;
}

.exercise-badges .badge::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.target-muscle-badge::before { background: #e74c3c; box-shadow: 0 0 2px rgba(231, 76, 60, 0.28); }
.body-part-badge::before { background: #3498db; box-shadow: 0 0 2px rgba(52, 152, 219, 0.28); }
.equipment-badge::before { background: #27ae60; box-shadow: 0 0 2px rgba(39, 174, 96, 0.28); }

.exercise-actions {
  padding: 0 1.5rem 1.5rem;
}

.cart-toggle-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: none;
}

.cart-toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cart-toggle-btn:active {
  transform: translateY(0);
}

.cart-toggle-btn.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
}

.cart-toggle-btn.btn-primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

.cart-toggle-btn.btn-danger {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.cart-toggle-btn.btn-danger:hover {
  background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%);
}

/* No Results */
.no-results {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.no-results-title {
  color: #495057;
  margin-bottom: 1rem;
}

.no-results-message {
  color: #6c757d;
  margin-bottom: 2rem;
}

/* Load More */
.load-more-section {
  padding: 2rem 0;
}

/* Responsive */
@media (max-width: 768px) {

  
  .exercise-image-container {
    height: 150px;
  }
  
  .exercise-info {
    padding: 1rem;
  }
  
  .exercise-actions {
    padding: 0 1rem 1rem;
  }
}

@media (max-width: 576px) {
  .header-section {
    padding: 1rem 0;
  }
  
  
  .search-input {
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  }
}
</style>