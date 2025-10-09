<template>
  <div class="workout-form">
    <form @submit.prevent="saveWorkout">
      <!-- Basic Information -->
      <div class="section mb-4">
        <h6 class="section-title">Basic Information</h6>
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label">Workout Set Title *</label>
            <input 
              v-model="formData.title"
              type="text" 
              class="form-control"
              :class="{ 'is-invalid': errors.title }"
              placeholder="e.g., Upper Body Strength Training"
              required
            >
            <div v-if="errors.title" class="invalid-feedback">{{ errors.title }}</div>
          </div>
          
          <div class="col-12">
            <label class="form-label">Description *</label>
            <textarea 
              v-model="formData.description"
              class="form-control"
              :class="{ 'is-invalid': errors.description }"
              rows="3"
              placeholder="Describe your workout set, its goals, and what makes it effective..."
              required
            ></textarea>
            <div v-if="errors.description" class="invalid-feedback">{{ errors.description }}</div>
          </div>
          
          <div class="col-md-6">
            <label class="form-label">Difficulty Level *</label>
            <select 
              v-model="formData.difficulty"
              class="form-select"
              :class="{ 'is-invalid': errors.difficulty }"
              required
            >
              <option value="">Select difficulty...</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <div v-if="errors.difficulty" class="invalid-feedback">{{ errors.difficulty }}</div>
          </div>
          
          <div class="col-md-6">
            <label class="form-label">Estimated Duration (minutes)</label>
            <input 
              v-model.number="formData.estimatedDuration"
              type="number" 
              class="form-control"
              min="10"
              max="180"
              placeholder="30"
            >
          </div>
        </div>
      </div>

      <!-- Exercise Search and Selection -->
      <div class="section mb-4">
        <h6 class="section-title">Add Exercises</h6>
        
        <!-- Exercise Search -->
        <div class="exercise-search mb-3">
          <div class="input-group">
            <input 
              v-model="exerciseSearchQuery"
              @input="searchExercises"
              type="text" 
              class="form-control"
              placeholder="Search for exercises to add..."
            >
            <button type="button" class="btn btn-outline-secondary" @click="searchExercises">
              <i class="fas fa-search"></i>
            </button>
          </div>
        </div>

        <!-- Search Results -->
        <div v-if="searchResults.length > 0" class="search-results mb-3">
          <div class="results-header">
            <small class="text-muted">{{ searchResults.length }} exercises found</small>
          </div>
          <div class="results-list">
            <div 
              v-for="exercise in searchResults" 
              :key="exercise.id"
              class="exercise-search-item"
              @click="addExercise(exercise)"
            >
              <div class="exercise-info">
                <img 
                  v-if="exercise.gifUrl" 
                  :src="exercise.gifUrl" 
                  :alt="exercise.name"
                  class="exercise-gif"
                  loading="lazy"
                >
                <div class="exercise-details">
                  <h6 class="exercise-name">{{ exercise.name }}</h6>
                  <div class="exercise-meta">
                    <span class="badge bg-primary">{{ exercise.bodyPart }}</span>
                    <span class="badge bg-secondary">{{ exercise.target }}</span>
                  </div>
                </div>
              </div>
              <button type="button" class="btn btn-sm btn-outline-primary">
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Selected Exercises -->
        <div class="selected-exercises">
          <div class="exercises-header">
            <h6>Selected Exercises ({{ formData.exercises.length }})</h6>
            <small v-if="errors.exercises" class="text-danger">{{ errors.exercises }}</small>
          </div>
          
          <div v-if="formData.exercises.length === 0" class="empty-exercises">
            <div class="text-center py-4">
              <i class="fas fa-dumbbell text-muted mb-2" style="font-size: 2rem;"></i>
              <p class="text-muted">No exercises added yet. Search and add exercises above.</p>
            </div>
          </div>
          
          <div v-else class="exercises-list">
            <div 
              v-for="(exercise, index) in formData.exercises" 
              :key="exercise.id"
              class="selected-exercise-item"
            >
              <div class="exercise-info">
                <img 
                  v-if="exercise.gifUrl" 
                  :src="exercise.gifUrl" 
                  :alt="exercise.name"
                  class="exercise-gif"
                >
                <div class="exercise-details">
                  <h6 class="exercise-name">{{ exercise.name }}</h6>
                  <div class="exercise-meta">
                    <span class="badge bg-primary">{{ exercise.bodyPart }}</span>
                    <span class="badge bg-secondary">{{ exercise.target }}</span>
                  </div>
                </div>
              </div>
              
              <div class="exercise-config">
                <div class="config-inputs">
                  <div class="input-group input-group-sm">
                    <span class="input-group-text">Sets</span>
                    <input 
                      v-model.number="exercise.sets"
                      type="number" 
                      class="form-control"
                      min="1"
                      max="10"
                      placeholder="3"
                    >
                  </div>
                  <div class="input-group input-group-sm">
                    <span class="input-group-text">Reps</span>
                    <input 
                      v-model="exercise.reps"
                      type="text" 
                      class="form-control"
                      placeholder="10-12"
                    >
                  </div>
                </div>
                <button 
                  type="button" 
                  class="btn btn-sm btn-outline-danger"
                  @click="removeExercise(index)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" @click="$emit('cancel')" class="btn btn-secondary me-2">
          Cancel
        </button>
        <button 
          type="submit" 
          class="btn btn-primary"
          :disabled="saving || !isFormValid"
        >
          <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="fas fa-save me-2"></i>
          {{ saving ? 'Saving...' : (isEditing ? 'Update Workout' : 'Create Workout') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { workoutVaultService } from '@/services/workoutVaultService.js'
import { exerciseAPI } from '@/services/exerciseAPI.js'
import { auth } from '@/firebase.js'

const props = defineProps({
  workout: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['workout-saved', 'cancel'])

// Reactive data
const formData = ref({
  title: '',
  description: '',
  difficulty: '',
  estimatedDuration: 30,
  exercises: []
})

const exerciseSearchQuery = ref('')
const searchResults = ref([])
const searchTimeout = ref(null)
const saving = ref(false)
const errors = ref({})

// Computed properties
const isEditing = computed(() => !!props.workout)

const isFormValid = computed(() => {
  return formData.value.title.trim() && 
         formData.value.description.trim() && 
         formData.value.difficulty && 
         formData.value.exercises.length > 0
})

const currentUser = computed(() => {
  const user = auth.currentUser
  if (user) {
    return {
      id: user.uid,
      name: user.displayName || user.email,
      email: user.email
    }
  }
  return null
})

// Methods
const initializeForm = () => {
  if (props.workout) {
    formData.value = {
      title: props.workout.title || '',
      description: props.workout.description || '',
      difficulty: props.workout.difficulty || '',
      estimatedDuration: props.workout.estimatedDuration || 30,
      exercises: props.workout.exercises ? [...props.workout.exercises] : []
    }
  }
}

const validateForm = () => {
  errors.value = {}
  
  if (!formData.value.title.trim()) {
    errors.value.title = 'Title is required'
  }
  
  if (!formData.value.description.trim()) {
    errors.value.description = 'Description is required'
  }
  
  if (!formData.value.difficulty) {
    errors.value.difficulty = 'Difficulty level is required'
  }
  
  if (formData.value.exercises.length === 0) {
    errors.value.exercises = 'At least one exercise is required'
  }
  
  return Object.keys(errors.value).length === 0
}

const searchExercises = () => {
  clearTimeout(searchTimeout.value)
  
  if (!exerciseSearchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  
  searchTimeout.value = setTimeout(async () => {
    try {
      const results = await exerciseAPI.searchExercises(exerciseSearchQuery.value, 10)
      searchResults.value = results
    } catch (error) {
      console.error('Error searching exercises:', error)
      searchResults.value = []
    }
  }, 300)
}

const addExercise = (exercise) => {
  // Check if exercise is already added
  const exists = formData.value.exercises.find(e => e.id === exercise.id)
  if (exists) {
    return
  }
  
  // Add exercise with default sets/reps
  const exerciseToAdd = {
    ...exercise,
    sets: 3,
    reps: '10-12'
  }
  
  formData.value.exercises.push(exerciseToAdd)
  
  // Clear search
  exerciseSearchQuery.value = ''
  searchResults.value = []
}

const removeExercise = (index) => {
  formData.value.exercises.splice(index, 1)
}

const saveWorkout = async () => {
  if (!validateForm() || !currentUser.value) {
    return
  }
  
  saving.value = true
  
  try {
    if (isEditing.value) {
      // Update existing workout
      await workoutVaultService.updateUserWorkout(props.workout.id, formData.value)
    } else {
      // Create new workout
      await workoutVaultService.createUserWorkout(currentUser.value.id, formData.value)
    }
    
    emit('workout-saved', formData.value)
  } catch (error) {
    console.error('Error saving workout:', error)
    alert('Failed to save workout. Please try again.')
  } finally {
    saving.value = false
  }
}

// Watch for form changes to clear errors
watch(() => formData.value.title, () => {
  if (errors.value.title) delete errors.value.title
})

watch(() => formData.value.description, () => {
  if (errors.value.description) delete errors.value.description
})

watch(() => formData.value.difficulty, () => {
  if (errors.value.difficulty) delete errors.value.difficulty
})

watch(() => formData.value.exercises.length, () => {
  if (errors.value.exercises) delete errors.value.exercises
})

// Lifecycle
onMounted(() => {
  initializeForm()
})

// Watch for prop changes
watch(() => props.workout, () => {
  initializeForm()
}, { immediate: true })
</script>

<style scoped>
.workout-form {
  max-height: 70vh;
  overflow-y: auto;
}

.section-title {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
}

.exercise-search .input-group {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-radius: 8px;
  overflow: hidden;
}

.search-results {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: white;
}

.results-header {
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.exercise-search-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #f1f3f4;
  cursor: pointer;
  transition: background-color 0.2s;
}

.exercise-search-item:hover {
  background-color: #f8f9fa;
}

.exercise-search-item:last-child {
  border-bottom: none;
}

.exercise-info {
  display: flex;
  align-items: center;
  flex-grow: 1;
}

.exercise-gif {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 1rem;
}

.exercise-details {
  flex-grow: 1;
}

.exercise-name {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
}

.exercise-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.exercise-meta .badge {
  font-size: 0.7rem;
}

.selected-exercises {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: white;
}

.exercises-header {
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  border-radius: 8px 8px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.exercises-header h6 {
  margin: 0;
  color: #2c3e50;
}

.empty-exercises {
  padding: 1rem;
}

.exercises-list {
  max-height: 400px;
  overflow-y: auto;
}

.selected-exercise-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #f1f3f4;
}

.selected-exercise-item:last-child {
  border-bottom: none;
}

.exercise-config {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.config-inputs {
  display: flex;
  gap: 0.5rem;
}

.config-inputs .input-group {
  width: auto;
  min-width: 100px;
}

.config-inputs .form-control {
  width: 60px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
  margin-top: 1rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .exercise-info {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .exercise-gif {
    margin-bottom: 0.5rem;
    margin-right: 0;
  }
  
  .exercise-config {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .config-inputs {
    flex-direction: column;
  }
}
</style>