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
                <span class="badge target-muscle-badge me-1">{{ formatTarget(exercise.target) }}</span>
                <span class="badge body-part-badge me-1">{{ formatBodyPart(exercise.bodyPart) }}</span>
                <span class="badge equipment-badge">{{ formatEquipment(exercise.equipment) }}</span>
              </div>
            </div>
            <div class="exercise-details u-card mb-3">
              <h5>Exercise Information</h5>
              <ul class="list-unstyled">
                <li><strong>Primary Target:</strong> {{ formatTarget(exercise.target) }}</li>
                <li><strong>Body Part:</strong> {{ formatBodyPart(exercise.bodyPart) }}</li>
                <li><strong>Equipment:</strong> {{ formatEquipment(exercise.equipment) }}</li>
                <li v-if="exercise.secondaryMuscles && exercise.secondaryMuscles.length">
                  <strong>Secondary Muscles:</strong> {{ exercise.secondaryMuscles.map(muscle => capitalizeFirstLetter(muscle)).join(', ') }}
                </li>
              </ul>
            </div>

            <div v-if="exercise.instructions && exercise.instructions.length" class="instructions-section u-card">
              <h5>Instructions</h5>
              <ol class="instructions-list">
                <li v-for="(instruction, index) in exercise.instructions" :key="index">
                  {{ instruction }}
                </li>
              </ol>
            </div>
          </div>

          <!-- Right: add-to-cart above sticky media -->
          <div class="col-md-6">
            <div class="d-none d-md-flex justify-content-end mb-2">
              <button
                @click="toggleCartDetail"
                class="u-btn"
                :class="isInCart ? 'u-btn--danger' : 'u-btn--primary'"
                :title="isInCart ? 'Remove from workout cart' : 'Add to workout cart'"
              >
                {{ isInCart ? 'Remove from Cart' : 'Add to Cart' }}
              </button>
            </div>
            <div class="media-sticky" ref="mediaRef">
              <img
                v-if="exercise.gifUrl"
                :src="exercise.gifUrl"
                :alt="exercise.name"
                class="media-img img-fluid rounded shadow"
                :style="{ transform: `translateY(${parallaxY}px)` }"
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
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

// Format functions to clean up and capitalize text
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

onMounted(() => {
  if (exerciseId.value) {
    loadExercise()
  }
})
// Subtle parallax for media to move with scroll while staying aligned
const mediaRef = ref(null)
const parallaxY = ref(0)
const onScroll = () => {
  if (!mediaRef.value) return
  const rect = mediaRef.value.getBoundingClientRect()
  const viewportAnchor = 100 // pixels from top after sticky
  const elementAnchor = rect.top
  const delta = elementAnchor - viewportAnchor
  parallaxY.value = Math.max(-18, Math.min(18, delta * 0.08))
}
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.container {
  max-width: 1200px;
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

/* Color-coded badge styles */
.target-muscle-badge {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%) !important;
  color: white !important;
  border: none;
}

.target-muscle-badge:hover {
  background: linear-gradient(135deg, #c0392b 0%, #a93226 100%) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.body-part-badge {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%) !important;
  color: white !important;
  border: none;
}

.body-part-badge:hover {
  background: linear-gradient(135deg, #2980b9 0%, #21618c 100%) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.equipment-badge {
  background: linear-gradient(135deg, #27ae60 0%, #229954 100%) !important;
  color: white !important;
  border: none;
}

.equipment-badge:hover {
  background: linear-gradient(135deg, #229954 0%, #1e8449 100%) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
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

/* Sticky media + subtle parallax */
.media-sticky { position: sticky; top: 100px; height: auto; display: flex; align-items: flex-start; justify-content: center; }
.media-img { width: 100%; max-width: 420px; max-height: 60vh; object-fit: contain; display: block; margin-inline: auto; will-change: transform; }

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

/* Remove old floating styles now that button sits above media */

@media (max-width: 768px) {
  .container {
    padding: 0.5rem;
  }
  
  .exercise-details {
    margin-top: 1rem;
  }
  .media-sticky { position: static; height: auto; }
  .media-img { max-width: 100%; max-height: 60vh; }
}
</style>
