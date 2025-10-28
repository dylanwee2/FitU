<template>
  <div class="exercise-detail">
    <div class="container">
      <button @click="goBack" class="u-btn u-btn--secondary mb-3">Back</button>
      
      <div v-if="loading">Loading...</div>
      <div v-else-if="error">Error: {{ error }}</div>
      <div v-else>
        <div class="exercise-header mb-4">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h1>{{ exercise.name }}</h1>
              <div class="exercise-badges mb-3">
                <span class="badge target-muscle-badge me-2">{{ exercise.target }}</span>
                <span class="badge body-part-badge me-2">{{ exercise.bodyPart }}</span>
                <span class="badge equipment-badge">{{ exercise.equipment }}</span>
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
          <div class="col-md-6" style="text-align: center;">
              <img 
                v-if="exercise.gifUrl" 
                :src="exercise.gifUrl" 
                :alt="exercise.name" 
                class="img-fluid rounded shadow"
                style="width: 65%;"
              >
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
  font-weight: 700;
  text-transform: capitalize;
  margin-bottom: 1rem;
}

.exercise-badges .badge {
  position: relative;
  font-size: 0.85rem;
  padding: 0.25rem 0.6rem 0.25rem 1.2rem;
  background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
  color: #e9e9e9 !important;
  border: 1px solid rgba(201, 162, 39, 0.28) !important;
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.01em;
  width: auto;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.25);
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
  padding: 1.5rem;
  border-radius: 8px;
  height: 100%;
}

.exercise-details h5 {
  color: var(--muted);
  margin-bottom: 1rem;
  font-weight: 600;
}

.exercise-details li {
  margin-bottom: 0.5rem;
  padding: 0.25rem 0;
}

.instructions-section {
  background: var(--surface-subtle);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 2rem;
}

.instructions-section h5 {
  color: var(--muted);
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
