<template>
  <div class="exercise-detail">
    <div class="container">
      <button @click="goBack" class="u-btn u-btn--secondary mb-3">Back</button>
      
      <div v-if="loading">Loading...</div>
      <div v-else-if="error">Error: {{ error }}</div>
      <div v-else>
        <div class="exercise-header mb-4">
          <h1>{{ exercise.name }}</h1>
          <div class="exercise-badges mb-4 d-flex justify-content-between align-items-center">
            <div>
              <span class="badge target-muscle-badge me-1 clickable-badge">{{ formatTarget(exercise.target) }}</span>
              <span class="badge body-part-badge me-1 clickable-badge">{{ formatBodyPart(exercise.bodyPart) }}</span>
              <span class="badge equipment-badge clickable-badge">{{ formatEquipment(exercise.equipment) }}</span>
            </div>
            <div>
              <button
                @click="toggleCartDetail"
                class="u-btn"
                :class="isInCart ? 'u-btn--danger' : 'u-btn--primary'"
                :title="isInCart ? 'Remove from workout cart' : 'Add to workout cart'"
              >
                {{ isInCart ? 'Remove from Cart' : 'Add to Cart' }}
              </button>
            </div>
          </div>
        </div>

        <div class="row mb-4">
          <div class="col-lg-6 col-md-12 mb-3 mb-lg-0">
            <div class="exercise-image-container">
              <img
                v-if="exercise.gifUrl"
                :src="exercise.gifUrl"
                :alt="exercise.name"
                class="exercise-main-img img-fluid rounded shadow"
                :style="{ transform: `translateY(${parallaxY}px)` }"
              >
            </div>
          </div>

          <div class="col-lg-6 col-md-12">
            <div class="exercise-details u-card">
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
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <div v-if="exercise.instructions && exercise.instructions.length" class="instructions-section u-card">
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
    console.log('Added to cart:', exercise.value.name)
  }
}

const toggleCartDetail = () => {
  if (isInCart.value) {
    cartStore.removeFromCart(exercise.value.id)
    console.log('Removed from cart:', exercise.value.name)
  } else {
    const success = cartStore.addToCart(exercise.value)
    if (success) {
      console.log('Added to cart:', exercise.value.name)
    }
  }
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

onMounted(() => {
  if (exerciseId.value) {
    loadExercise()
  }
})
const mediaRef = ref(null)
const parallaxY = ref(0)
const onScroll = () => {
  if (!mediaRef.value) return
  const rect = mediaRef.value.getBoundingClientRect()
  const viewportAnchor = 100 
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

.exercise-badges .badge {
  position: relative;
  background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
  color: #e9e9e9 !important;
  border: 1px solid rgba(201, 162, 39, 0.28) !important;
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.01em;
  padding: 0.25rem 0.6rem 0.25rem 1.2rem; 
  width: auto;  
  max-width: 100%;
  justify-self: start; 
  white-space: nowrap; 
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.25);
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  display: inline-block;
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

.target-muscle-badge::before { 
  background: #e74c3c; 
  box-shadow: 0 0 2px rgba(231, 76, 60, 0.28); 
}

.body-part-badge::before { 
  background: #3498db; 
  box-shadow: 0 0 2px rgba(52, 152, 219, 0.28); 
}

.equipment-badge::before { 
  background: #27ae60; 
  box-shadow: 0 0 2px rgba(39, 174, 96, 0.28); 
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

.exercise-image-container {
  position: relative;
  height: 100%;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.exercise-main-img {
  width: 100%;
  max-width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: contain;
  will-change: transform;
  transition: transform 0.1s ease-out;
}

.media-sticky { 
  position: sticky; 
  top: 100px; 
  height: auto; 
  display: flex; 
  align-items: flex-start; 
  justify-content: center; 
}

.media-img { 
  width: 100%; 
  max-width: 420px; 
  max-height: 60vh; 
  object-fit: contain; 
  display: block; 
  margin-inline: auto; 
  will-change: transform; 
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

@media (max-width: 992px) {
  .exercise-image-container {
    min-height: 250px;
    margin-bottom: 1rem;
  }
  
  .exercise-main-img {
    max-height: 300px;
  }
  
  .exercise-details {
    margin-bottom: 1.5rem;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0.5rem;
    margin: 1rem auto;
  }
  
  .exercise-header h1 {
    font-size: 1.75rem;
  }
  
  .exercise-badges {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
    align-items: stretch;
  }
  
  .exercise-badges > div:first-child {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
  }
  
  .exercise-badges > div:last-child {
    display: flex;
    justify-content: center;
  }
  
  .exercise-badges .badge {
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem 0.2rem 1rem;
  }
  
  .exercise-image-container {
    min-height: 200px;
    margin-bottom: 1.5rem;
  }
  
  .exercise-main-img {
    max-height: 250px;
  }
  
  .exercise-details,
  .instructions-section {
    padding: 1rem;
  }
}

@media (max-width: 576px) {
  .exercise-header h1 {
    font-size: 1.5rem;
  }
  
  .exercise-details h5,
  .instructions-section h5 {
    font-size: 1.1rem;
  }
  
  .exercise-details li {
    font-size: 0.9rem;
  }
  
  .exercise-image-container {
    min-height: 180px;
  }
  
  .exercise-main-img {
    max-height: 200px;
  }
}
</style>
