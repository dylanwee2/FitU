<template>
  <div class="my-workouts">
    <div class="container mt-4">
      <!-- Header -->
      <div class="page-header mb-4">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h1 class="page-title">💪 My Workout Sets</h1>
            <p class="page-subtitle text-muted">Create, manage, and publish your custom workout sets</p>
          </div>
          <div class="col-md-4 text-md-end">
            <button @click="openCreateModal" class="btn btn-primary">
              <i class="fas fa-plus me-2"></i>Create New Workout
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-section text-center py-5">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p>Loading your workouts...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-section text-center py-5">
        <div class="error-icon mb-3">
          <i class="fas fa-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
        </div>
        <h4>Unable to Load Workouts</h4>
        <p class="text-muted">{{ error }}</p>
        <button @click="loadWorkouts" class="btn btn-primary">Try Again</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="workouts.length === 0" class="empty-state text-center py-5">
        <div class="empty-icon mb-3">
          <i class="fas fa-dumbbell text-muted" style="font-size: 4rem;"></i>
        </div>
        <h4>No Workout Sets Yet</h4>
        <p class="text-muted">Create your first custom workout set to get started!</p>
        <button @click="openCreateModal" class="btn btn-primary mt-3">
          <i class="fas fa-plus me-2"></i>Create Your First Workout
        </button>
      </div>

      <!-- Workouts Grid -->
      <div v-else class="workouts-grid">
        <div class="row g-4">
          <div 
            v-for="workout in workouts" 
            :key="workout.id"
            class="col-sm-6 col-lg-4"
          >
            <div class="workout-card">
              <!-- Status Badge -->
              <div class="workout-status">
                <span v-if="workout.isPublished" class="badge bg-success">
                  <i class="fas fa-globe me-1"></i>Published
                </span>
                <span v-else class="badge bg-secondary">
                  <i class="fas fa-lock me-1"></i>Private
                </span>
              </div>

              <!-- Card Content -->
              <div class="card-body">
                <h5 class="workout-title">{{ workout.title }}</h5>
                <p class="workout-description">{{ truncateText(workout.description, 100) }}</p>
                
                <div class="workout-meta">
                  <div class="exercise-count">
                    <i class="fas fa-list me-1"></i>
                    {{ workout.exercises?.length || 0 }} exercises
                  </div>
                  <div class="difficulty">
                    <span class="badge" :class="getDifficultyBadgeClass(workout.difficulty)">
                      {{ workout.difficulty || 'Medium' }}
                    </span>
                  </div>
                </div>

                <div class="workout-stats">
                  <div class="stat">
                    <i class="fas fa-clock me-1"></i>
                    <span>{{ workout.estimatedDuration || 30 }}min</span>
                  </div>
                  <div class="stat">
                    <i class="fas fa-calendar me-1"></i>
                    <span>{{ formatDate(workout.createdAt) }}</span>
                  </div>
                </div>
              </div>

              <!-- Card Actions -->
              <div class="card-actions">
                <div class="btn-group w-100" role="group">
                  <button @click="editWorkout(workout)" class="btn btn-outline-primary btn-sm">
                    <i class="fas fa-edit me-1"></i>Edit
                  </button>
                  <button @click="viewWorkout(workout)" class="btn btn-outline-secondary btn-sm">
                    <i class="fas fa-eye me-1"></i>View
                  </button>
                  <button @click="deleteWorkout(workout)" class="btn btn-outline-danger btn-sm">
                    <i class="fas fa-trash me-1"></i>Delete
                  </button>
                </div>
                
                <!-- Publish/Unpublish Button -->
                <div class="publish-section mt-2">
                  <button 
                    v-if="!workout.isPublished"
                    @click="publishWorkout(workout)"
                    :disabled="publishing === workout.id"
                    class="btn btn-success btn-sm w-100"
                  >
                    <span v-if="publishing === workout.id" class="spinner-border spinner-border-sm me-2"></span>
                    <i v-else class="fas fa-share me-2"></i>
                    {{ publishing === workout.id ? 'Publishing...' : 'Publish to Vault' }}
                  </button>
                  <button 
                    v-else
                    @click="unpublishWorkout(workout)"
                    :disabled="unpublishing === workout.id"
                    class="btn btn-warning btn-sm w-100"
                  >
                    <span v-if="unpublishing === workout.id" class="spinner-border spinner-border-sm me-2"></span>
                    <i v-else class="fas fa-undo me-2"></i>
                    {{ unpublishing === workout.id ? 'Unpublishing...' : 'Unpublish from Vault' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Workout Modal -->
    <div v-if="showWorkoutModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ editingWorkout ? 'Edit Workout Set' : 'Create New Workout Set' }}
            </h5>
            <button @click="closeWorkoutModal" type="button" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <WorkoutForm 
              :workout="editingWorkout"
              @workout-saved="handleWorkoutSaved"
              @cancel="closeWorkoutModal"
            />
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show"></div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Delete Workout Set</h5>
            <button @click="closeDeleteModal" type="button" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete "<strong>{{ workoutToDelete?.title }}</strong>"?</p>
            <p v-if="workoutToDelete?.isPublished" class="text-warning">
              <i class="fas fa-exclamation-triangle me-1"></i>
              This workout is published to the Vault. Deleting it will also remove it from the Vault.
            </p>
            <p class="text-muted">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button @click="closeDeleteModal" class="btn btn-secondary">Cancel</button>
            <button 
              @click="confirmDelete" 
              :disabled="deleting"
              class="btn btn-danger"
            >
              <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
              {{ deleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/firebase.js'
import { workoutVaultService } from '@/services/workoutVaultService.js'
import WorkoutForm from '@/components/WorkoutForm.vue'

const router = useRouter()

// Reactive data
const workouts = ref([])
const loading = ref(false)
const error = ref('')
const showWorkoutModal = ref(false)
const editingWorkout = ref(null)
const publishing = ref(null)
const unpublishing = ref(null)
const showDeleteModal = ref(false)
const workoutToDelete = ref(null)
const deleting = ref(false)
const unsubscribe = ref(null)

// Computed
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
const loadWorkouts = async () => {
  if (!currentUser.value) {
    error.value = 'Please log in to view your workouts'
    return
  }

  loading.value = true
  error.value = ''
  
  try {
    const userWorkouts = await workoutVaultService.getUserWorkouts(currentUser.value.id)
    workouts.value = userWorkouts
  } catch (err) {
    console.error('Error loading workouts:', err)
    error.value = err.message || 'Failed to load workouts'
  } finally {
    loading.value = false
  }
}

const setupRealtimeListener = () => {
  if (!currentUser.value) return

  unsubscribe.value = workoutVaultService.subscribeToUserWorkouts(
    currentUser.value.id,
    (updatedWorkouts) => {
      workouts.value = updatedWorkouts
    }
  )
}

const openCreateModal = () => {
  editingWorkout.value = null
  showWorkoutModal.value = true
}

const editWorkout = (workout) => {
  editingWorkout.value = workout
  showWorkoutModal.value = true
}

const closeWorkoutModal = () => {
  showWorkoutModal.value = false
  editingWorkout.value = null
}

const handleWorkoutSaved = (workout) => {
  closeWorkoutModal()
  // The real-time listener will update the list automatically
}

const viewWorkout = (workout) => {
  if (workout.isPublished && workout.publishedId) {
    router.push(`/vault/${workout.publishedId}`)
  } else {
    router.push(`/my-workouts/${workout.id}`)
  }
}

const publishWorkout = async (workout) => {
  if (!currentUser.value) {
    alert('Please log in to publish workouts')
    return
  }

  publishing.value = workout.id
  
  try {
    await workoutVaultService.publishWorkout(workout.id, currentUser.value.id)
    // Success notification
    alert('Workout published to Vault successfully!')
  } catch (error) {
    console.error('Error publishing workout:', error)
    alert('Failed to publish workout: ' + error.message)
  } finally {
    publishing.value = null
  }
}

const unpublishWorkout = async (workout) => {
  if (!currentUser.value) return

  if (!confirm('Are you sure you want to remove this workout from the Vault?')) {
    return
  }

  unpublishing.value = workout.id
  
  try {
    await workoutVaultService.unpublishWorkout(workout.publishedId, currentUser.value.id)
    alert('Workout removed from Vault successfully!')
  } catch (error) {
    console.error('Error unpublishing workout:', error)
    alert('Failed to unpublish workout: ' + error.message)
  } finally {
    unpublishing.value = null
  }
}

const deleteWorkout = (workout) => {
  workoutToDelete.value = workout
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  workoutToDelete.value = null
}

const confirmDelete = async () => {
  if (!workoutToDelete.value || !currentUser.value) return

  deleting.value = true
  
  try {
    // If published, unpublish first
    if (workoutToDelete.value.isPublished && workoutToDelete.value.publishedId) {
      await workoutVaultService.unpublishWorkout(workoutToDelete.value.publishedId, currentUser.value.id)
    }
    
    // Delete the user workout
    await workoutVaultService.deleteUserWorkout(workoutToDelete.value.id)
    
    closeDeleteModal()
    alert('Workout deleted successfully!')
  } catch (error) {
    console.error('Error deleting workout:', error)
    alert('Failed to delete workout: ' + error.message)
  } finally {
    deleting.value = false
  }
}

// Utility functions
const getDifficultyBadgeClass = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'beginner': return 'bg-success'
    case 'intermediate': return 'bg-warning'
    case 'advanced': return 'bg-danger'
    default: return 'bg-secondary'
  }
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const formatDate = (date) => {
  if (!date) return ''
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  loadWorkouts()
  setupRealtimeListener()
})

onUnmounted(() => {
  if (unsubscribe.value) {
    unsubscribe.value()
  }
})
</script>

<style scoped>
.my-workouts {
  min-height: 100vh;
  background: #f8f9fa;
}

.page-title {
  color: #2c3e50;
  font-weight: 700;
  font-size: 2.5rem;
}

.page-subtitle {
  font-size: 1.1rem;
}

.workouts-grid {
  margin-top: 2rem;
}

.workout-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.workout-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.workout-status {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1;
}

.card-body {
  padding: 1.5rem;
  flex-grow: 1;
}

.workout-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.75rem;
  line-height: 1.3;
  padding-right: 80px; /* Space for status badge */
}

.workout-description {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 1rem;
}

.workout-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.exercise-count {
  font-size: 0.85rem;
  color: #666;
}

.workout-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #666;
}

.card-actions {
  padding: 1rem 1.5rem;
  border-top: 1px solid #f1f3f4;
  background: #f8f9fa;
}

.publish-section {
  margin-top: 0.75rem;
}

.loading-section, .error-section, .empty-state {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Modal styles */
.modal {
  background: rgba(0,0,0,0.5);
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1040;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  opacity: 0.5;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .page-header .col-md-4 {
    margin-top: 1rem;
  }
  
  .workout-title {
    padding-right: 0;
    margin-bottom: 0.5rem;
  }
  
  .workout-status {
    position: static;
    margin-bottom: 0.75rem;
    text-align: left;
  }
}
</style>