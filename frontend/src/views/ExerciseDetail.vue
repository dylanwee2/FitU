<template>
  <div class="exercise-detail">
    <div class="container">
      <button @click="goBack" class="btn btn-secondary mb-3"> Back</button>
      
      <div v-if="loading">Loading...</div>
      <div v-else-if="error">Error: {{ error }}</div>
      <div v-else>
        <div class="exercise-header mb-4">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h1>{{ exercise.name }}</h1>
              <div class="exercise-badges mb-3">
                <span class="badge bg-primary me-2">{{ exercise.target }}</span>
                <span class="badge bg-secondary me-2">{{ exercise.bodyPart }}</span>
                <span class="badge bg-info">{{ exercise.equipment }}</span>
              </div>
            </div>
            <div class="exercise-actions">
              <button 
                @click="addToCart"
                class="u-btn u-btn--primary"
                :disabled="isInCart"
                :title="isInCart ? 'Already in cart' : 'Add to workout cart'"
              >
              
                {{ isInCart ? 'In Cart' : 'Add to Cart' }}
              </button>
            </div>
          </div>
        </div>
        
        <div class="row">
          <div class="col-md-6">
            <div class="exercise-image-section mb-4">
              <img 
                v-if="exercise.gifUrl" 
                :src="exercise.gifUrl" 
                :alt="exercise.name" 
                class="img-fluid rounded shadow"
                style="max-width: 100%; height: auto;"
              >
              <div v-else class="no-image-placeholder">
                <i class="fas fa-image"></i>
                <p>No demonstration available</p>
              </div>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="exercise-details">
              <h5>Exercise Information</h5>
              <ul class="list-unstyled">
                <li><strong>Primary Target:</strong> {{ exercise.target }}</li>
                <li><strong>Body Part:</strong> {{ exercise.bodyPart }}</li>
                <li><strong>Equipment:</strong> {{ exercise.equipment }}</li>
                <li v-if="exercise.secondaryMuscles && exercise.secondaryMuscles.length">
                  <strong>Secondary Muscles:</strong> {{ exercise.secondaryMuscles.join(', ') }}
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div v-if="exercise.instructions && exercise.instructions.length" class="instructions-section mt-4">
          <h5>Instructions</h5>
          <ol class="instructions-list">
            <li v-for="(instruction, index) in exercise.instructions" :key="index">
              {{ instruction }}
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkoutCartStore } from '../stores/workoutCart'

const route = useRoute()
const router = useRouter()
const cartStore = useWorkoutCartStore()

const exerciseId = computed(() => route.params.id)
const exercise = ref({})
const loading = ref(false)
const error = ref('')

// Cart computed properties
const isInCart = computed(() => {
  return cartStore.cartItems.some(item => item.id === exercise.value.id)
})

const goBack = () => {
  router.push('/exerciselibrary')
}

const loadExercise = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await fetch(`https://www.exercisedb.dev/api/v1/exercises/${exerciseId.value}`)
    if (!response.ok) throw new Error('Exercise not found')
    
    const data = await response.json()
    
    // Handle ExerciseDB API response structure
    if (data.success && data.data) {
      const exerciseData = data.data
      exercise.value = {
        id: exerciseData.exerciseId,
        name: exerciseData.name,
        target: Array.isArray(exerciseData.targetMuscles) ? exerciseData.targetMuscles.join(', ') : exerciseData.targetMuscles,
        bodyPart: Array.isArray(exerciseData.bodyParts) ? exerciseData.bodyParts.join(', ') : exerciseData.bodyParts,
        equipment: Array.isArray(exerciseData.equipments) ? exerciseData.equipments.join(', ') : exerciseData.equipments,
        gifUrl: exerciseData.gifUrl,
        instructions: Array.isArray(exerciseData.instructions) ? exerciseData.instructions.map(inst => inst.replace(/^Step:\d+\s*/, '')) : [],
        secondaryMuscles: Array.isArray(exerciseData.secondaryMuscles) ? exerciseData.secondaryMuscles : []
      }
    } else {
      // Fallback mapping for direct response
      exercise.value = data
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const addToCart = () => {
  const success = cartStore.addToCart(exercise.value)
  if (success) {
    // You could add a toast notification here
    console.log('Added to cart:', exercise.value.name)
  }
}

onMounted(() => {
  if (exerciseId.value) {
    loadExercise()
  }
})
</script>

<style scoped>
.container {
  max-width: 1000px;
  margin: 2rem auto;
  padding: 1rem;
}

.exercise-header h1 {
  color: #2c3e50;
  font-weight: 700;
  text-transform: capitalize;
  margin-bottom: 1rem;
}

.exercise-badges .badge {
  font-size: 0.9rem;
  padding: 0.5rem 0.75rem;
}

.exercise-image-section {
  text-align: center;
}

.no-image-placeholder {
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 3rem;
  text-align: center;
  color: #6c757d;
}

.no-image-placeholder i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.exercise-details {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  height: 100%;
}

.exercise-details h5 {
  color: #495057;
  margin-bottom: 1rem;
  font-weight: 600;
}

.exercise-details li {
  margin-bottom: 0.5rem;
  padding: 0.25rem 0;
}

.instructions-section {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 2rem;
}

.instructions-section h5 {
  color: #495057;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.instructions-list {
  padding-left: 1.5rem;
}

.instructions-list li {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.btn {
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

@media (max-width: 768px) {
  .container {
    padding: 0.5rem;
  }
  
  .exercise-details {
    margin-top: 1rem;
  }
}
</style>
