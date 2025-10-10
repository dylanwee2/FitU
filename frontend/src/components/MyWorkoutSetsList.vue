<template>
  <div class="my-workout-sets">
    <div class="container mt-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>My Workout Sets</h2>
          <p class="text-muted">Manage your personal workout collections</p>
        </div>
        <button @click="showCreateModal = true" class="btn btn-primary">
          <i class="fas fa-plus me-2"></i>Create New Set
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary mb-3"></div>
        <p>Loading your workout sets...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-5">
        <i class="fas fa-exclamation-triangle text-warning mb-3" style="font-size: 3rem;"></i>
        <h4>Unable to Load Workout Sets</h4>
        <p class="text-muted">{{ error }}</p>
        <button @click="loadWorkoutSets" class="btn btn-primary">Try Again</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="workoutSets.length === 0" class="text-center py-5">
        <i class="fas fa-dumbbell text-muted mb-3" style="font-size: 4rem;"></i>
        <h4>No workout sets yet</h4>
        <p class="text-muted">Create your first workout set to get started.</p>
        <button @click="showCreateModal = true" class="btn btn-primary">
          <i class="fas fa-plus me-2"></i>Create Your First Set
        </button>
      </div>

      <!-- Workout Sets List -->
      <div v-else class="row g-3">
        <div v-for="set in workoutSets" :key="set.id" class="col-sm-6 col-lg-4">
          <div class="card h-100">
            <!-- Card Header with badges -->
            <div class="card-header d-flex justify-content-between align-items-start">
              <div>
                <span v-if="set.origin === 'created'" class="badge bg-primary me-1">
                  <i class="fas fa-user me-1"></i>Created
                </span>
                <span v-else class="badge bg-info me-1">
                  <i class="fas fa-download me-1"></i>Imported
                </span>
                <span v-if="set.isPublished" class="badge bg-success">
                  <i class="fas fa-globe me-1"></i>Published
                </span>
              </div>
              
              <!-- Actions dropdown -->
              <div class="dropdown">
                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                <ul class="dropdown-menu">
                  <li><button class="dropdown-item" @click="editWorkoutSet(set)">
                    <i class="fas fa-edit me-2"></i>Edit
                  </button></li>
                  <li><button class="dropdown-item" @click="duplicateWorkoutSet(set)">
                    <i class="fas fa-copy me-2"></i>Duplicate
                  </button></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><button class="dropdown-item text-danger" @click="deleteWorkoutSet(set)">
                    <i class="fas fa-trash me-2"></i>Delete
                  </button></li>
                </ul>
              </div>
            </div>

            <!-- Card Body -->
            <div class="card-body">
              <h5 class="card-title">{{ set.title }}</h5>
              <p class="card-text text-muted">{{ truncateText(set.description, 80) }}</p>
              
              <div class="small text-muted mb-3">
                <div><i class="fas fa-dumbbell me-1"></i>{{ set.exercises.length }} exercises</div>
                <div><i class="fas fa-clock me-1"></i>{{ set.totalDuration || 0 }}min</div>
              </div>
            </div>

            <!-- Card Footer -->
            <div class="card-footer d-flex justify-content-between">
              <div>
                <button v-if="canPublish(set, currentUser?.uid || '')" @click="publishWorkoutSet(set)" 
                        class="btn btn-success btn-sm me-2" :disabled="publishingIds.has(set.id)">
                  <span v-if="publishingIds.has(set.id)">
                    <i class="fas fa-spinner fa-spin me-1"></i>Publishing...
                  </span>
                  <span v-else>
                    <i class="fas fa-upload me-1"></i>Publish
                  </span>
                </button>
                <button @click="viewWorkoutSet(set)" class="btn btn-outline-primary btn-sm">
                  <i class="fas fa-eye me-1"></i>View
                </button>
              </div>
              <small class="text-muted align-self-center">{{ formatDate(set.updatedAt) }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Create New Workout Set</h5>
            <button @click="showCreateModal = false" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Title</label>
              <input v-model="newSet.title" type="text" class="form-control" 
                     placeholder="Enter workout set title" maxlength="100">
            </div>
            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea v-model="newSet.description" class="form-control" rows="3"
                        placeholder="Describe your workout set" maxlength="500"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="showCreateModal = false" class="btn btn-secondary">Cancel</button>
            <button @click="createWorkoutSet" class="btn btn-primary" 
                    :disabled="!newSet.title.trim() || creating">
              <span v-if="creating">
                <i class="fas fa-spinner fa-spin me-1"></i>Creating...
              </span>
              <span v-else>
                <i class="fas fa-plus me-1"></i>Create Set
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/firebase'
import { workoutSetsService } from '@/services/workoutSetsService.js'
import { vaultService } from '@/services/vaultService.js'
import { canPublish } from '@/types/workout.js'

const router = useRouter()

// Reactive state
const workoutSets = ref([])
const loading = ref(false)
const error = ref('')
const showCreateModal = ref(false)
const creating = ref(false)
const publishingIds = ref(new Set())
const newSet = ref({ title: '', description: '' })

// Real-time subscription
let unsubscribe = null

// Computed properties
const currentUser = computed(() => auth.currentUser)

// Methods
const loadWorkoutSets = async () => {
  if (!currentUser.value) return
  loading.value = true
  error.value = ''
  try {
    const sets = await workoutSetsService.getMyWorkoutSets(currentUser.value.uid)
    workoutSets.value = sets
  } catch (err) {
    console.error('Error loading workout sets:', err)
    error.value = err.message || 'Failed to load workout sets'
  } finally {
    loading.value = false
  }
}

const setupRealtimeListener = () => {
  if (!currentUser.value || unsubscribe) return
  unsubscribe = workoutSetsService.subscribeToWorkoutSets(
    currentUser.value.uid,
    (sets) => {
      workoutSets.value = sets
      loading.value = false
    }
  )
}

const createWorkoutSet = async () => {
  if (!currentUser.value || !newSet.value.title.trim()) return
  creating.value = true
  try {
    const setId = await workoutSetsService.createWorkoutSet(currentUser.value.uid, {
      title: newSet.value.title.trim(),
      description: newSet.value.description.trim(),
      exercises: []
    })
    showCreateModal.value = false
    newSet.value = { title: '', description: '' }
    router.push(`/workout-sets/${setId}/edit`)
  } catch (err) {
    console.error('Error creating workout set:', err)
    alert('Failed to create workout set: ' + err.message)
  } finally {
    creating.value = false
  }
}

const editWorkoutSet = (set) => {
  router.push(`/workout-sets/${set.id}/edit`)
}

const viewWorkoutSet = (set) => {
  router.push(`/workout-sets/${set.id}`)
}

const duplicateWorkoutSet = async (set) => {
  if (!currentUser.value) return
  try {
    const setId = await workoutSetsService.createWorkoutSet(currentUser.value.uid, {
      title: `${set.title} (Copy)`,
      description: set.description,
      exercises: [...set.exercises]
    })
    router.push(`/workout-sets/${setId}/edit`)
  } catch (err) {
    console.error('Error duplicating workout set:', err)
    alert('Failed to duplicate workout set: ' + err.message)
  }
}

const publishWorkoutSet = async (set) => {
  if (!currentUser.value || !canPublish(set, currentUser.value.uid)) return
  if (!confirm(`Publish "${set.title}" to the community vault?`)) return
  publishingIds.value.add(set.id)
  try {
    await vaultService.publishWorkoutSet(currentUser.value.uid, set.id)
  } catch (err) {
    console.error('Error publishing workout set:', err)
    alert('Failed to publish workout set: ' + err.message)
  } finally {
    publishingIds.value.delete(set.id)
  }
}

const deleteWorkoutSet = async (set) => {
  if (!currentUser.value) return
  if (!confirm(`Are you sure you want to delete "${set.title}"?`)) return
  try {
    await workoutSetsService.deleteWorkoutSet(currentUser.value.uid, set.id)
  } catch (err) {
    console.error('Error deleting workout set:', err)
    alert('Failed to delete workout set: ' + err.message)
  }
}

// Utility functions
const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  return date.toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  if (currentUser.value) {
    setupRealtimeListener()
  } else {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setupRealtimeListener()
      }
    })
    onUnmounted(() => unsubscribeAuth())
  }
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>

<style scoped>
.card {
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
}

.modal.show {
  display: block !important;
}
</style>