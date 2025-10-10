<template>
  <div class="vault-page">
    <div class="container mt-4">
      <!-- Header -->
      <div class="vault-header mb-4">
        <div class="row align-items-center">
          <div class="col-12">
            <h1 class="page-title mb-2">🏆 Workout Vault</h1>
            <p class="page-subtitle text-muted">Discover and review community-created workout sets</p>
          </div>
        </div>
      </div>

      <!-- Filters and Sorting -->
      <div class="filters-section mb-4">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Sort by:</label>
            <select v-model="sortBy" @change="loadWorkouts" class="form-select">
              <option value="newest">Newest</option>
              <option value="rating">Highest Rating</option>
              <option value="reviews">Most Reviewed</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Search:</label>
            <input 
              v-model="searchQuery" 
              @input="handleSearch"
              type="text" 
              class="form-control" 
              placeholder="Search workout sets..."
            >
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-section text-center py-5">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p>Loading workout sets...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-section text-center py-5">
        <div class="error-icon mb-3">
          <i class="fas fa-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
        </div>
        <h4>Unable to Load Workout Sets</h4>
        <p class="text-muted">{{ error }}</p>
        <button @click="loadWorkouts" class="btn btn-primary">Try Again</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredWorkoutSets.length === 0" class="empty-state text-center py-5">
        <div class="empty-icon mb-3">
          <i class="fas fa-dumbbell text-muted" style="font-size: 4rem;"></i>
        </div>
        <h4>No Workout Sets Found</h4>
        <p class="text-muted" v-if="searchQuery">Try adjusting your search criteria</p>
        <p class="text-muted" v-else>No published workout sets available yet</p>
      </div>

      <!-- Workout Sets Grid -->
      <div v-else class="workout-sets-grid">
        <div class="row g-4">
          <div 
            v-for="workoutSet in filteredWorkoutSets" 
            :key="workoutSet.id"
            class="col-sm-6 col-lg-4 col-xl-3"
          >
            <div class="workout-set-card" @click="viewWorkoutSet(workoutSet)">
              <!-- Card Header -->
              <div class="card-header">
                <div class="difficulty-badge">
                  <span class="badge" :class="getDifficultyBadgeClass(workoutSet.difficulty)">
                    {{ workoutSet.difficulty || 'Medium' }}
                  </span>
                </div>
                <div class="rating-display">
                  <div class="stars">
                    <i 
                      v-for="star in 5" 
                      :key="star"
                      class="fas fa-star"
                      :class="{ 'filled': star <= Math.round(workoutSet.avgRating || 0) }"
                    ></i>
                  </div>
                  <span class="rating-text">{{ formatRating(workoutSet.avgRating) }}</span>
                </div>
              </div>

              <!-- Card Body -->
              <div class="card-body">
                <h5 class="workout-title">{{ workoutSet.title }}</h5>
                <p class="workout-description">{{ truncateText(workoutSet.description, 100) }}</p>
                
                <div class="workout-meta">
                  <div class="creator">
                    <i class="fas fa-user me-1"></i>
                    {{ getUserName(workoutSet) }}
                  </div>
                  <div class="exercise-count">
                    <i class="fas fa-list me-1"></i>
                    {{ workoutSet.exercises?.length || 0 }} exercises
                  </div>
                </div>

                <div class="workout-stats">
                  <div class="stat">
                    <i class="fas fa-comments me-1"></i>
                    <span>{{ workoutSet.reviewsCount || 0 }} reviews</span>
                  </div>
                  <div class="stat">
                    <i class="fas fa-clock me-1"></i>
                    <span>{{ workoutSet.estimatedDuration || 30 }}min</span>
                  </div>
                </div>
              </div>

              <!-- Card Footer -->
              <div class="card-footer">
                <button class="btn btn-outline-primary btn-sm w-100">
                  <i class="fas fa-eye me-1"></i>View Details
                </button>
              </div>

              <!-- Owner Actions -->
              <div v-if="isOwner(workoutSet)" class="owner-actions">
                <div class="dropdown">
                  <button 
                    class="btn btn-link btn-sm dropdown-toggle" 
                    type="button" 
                    :id="`dropdown-${workoutSet.id}`"
                    data-bs-toggle="dropdown"
                    @click.stop
                  >
                    <i class="fas fa-ellipsis-v"></i>
                  </button>
                  <ul class="dropdown-menu" :aria-labelledby="`dropdown-${workoutSet.id}`">
                    <li>
                      <button 
                        class="dropdown-item" 
                        @click.stop="editWorkout(workoutSet)"
                      >
                        <i class="fas fa-edit me-2"></i>Edit
                      </button>
                    </li>
                    <li>
                      <button 
                        class="dropdown-item text-danger" 
                        @click.stop="unpublishWorkout(workoutSet)"
                      >
                        <i class="fas fa-trash me-2"></i>Unpublish
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { workoutVaultService } from '@/services/workoutVaultService.js'
import { auth } from '@/firebase.js'

const router = useRouter()

// Reactive data
const workoutSets = ref([])
const loading = ref(false)
const error = ref('')
const sortBy = ref('newest')
const searchQuery = ref('')
const searchTimeout = ref(null)
const unsubscribe = ref(null)

// Computed properties
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

const filteredWorkoutSets = computed(() => {
  let filtered = [...workoutSets.value]

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(set => 
      set.title?.toLowerCase().includes(query) ||
      set.description?.toLowerCase().includes(query) ||
      getUserName(set).toLowerCase().includes(query)
    )
  }

  return filtered
})

// Methods
const loadWorkouts = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const vaultWorkouts = await workoutVaultService.getVaultWorkouts(sortBy.value)
    workoutSets.value = vaultWorkouts
  } catch (err) {
    console.error('Error loading vault workouts:', err)
    error.value = err.message || 'Failed to load workout sets'
    workoutSets.value = []
  } finally {
    loading.value = false
  }
}

const setupRealtimeListener = () => {
  unsubscribe.value = workoutVaultService.subscribeToVaultWorkouts(
    (updatedWorkouts) => {
      workoutSets.value = updatedWorkouts
    },
    sortBy.value
  )
}

const handleSearch = () => {
  clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    // Search is done client-side for now
  }, 300)
}

const viewWorkoutSet = (workoutSet) => {
  router.push(`/vault/${workoutSet.id}`)
}

const editWorkout = (workoutSet) => {
  // Navigate to workout sets page to edit the original workout
  if (workoutSet.originalId) {
    router.push(`/workout-sets?edit=${workoutSet.originalId}`)
  }
}

const unpublishWorkout = async (workoutSet) => {
  if (!currentUser.value || !confirm('Are you sure you want to unpublish this workout?')) {
    return
  }

  try {
    await workoutVaultService.unpublishWorkout(workoutSet.id, currentUser.value.id)
    // The real-time listener will update the list automatically
  } catch (error) {
    console.error('Error unpublishing workout:', error)
    alert('Failed to unpublish workout: ' + error.message)
  }
}

const isOwner = (workoutSet) => {
  return currentUser.value && workoutSet.userId === currentUser.value.id
}

const getUserName = (workoutSet) => {
  // Try to get user name from workout data
  return workoutSet.userName || workoutSet.creatorName || 'Anonymous'
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

const formatRating = (rating) => {
  if (!rating || rating === 0) return 'No rating'
  return `${rating.toFixed(1)}/5`
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Watch for sort changes
watch(() => sortBy.value, () => {
  if (unsubscribe.value) {
    unsubscribe.value()
  }
  setupRealtimeListener()
})

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
.vault-page {
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

.filters-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.workout-sets-grid {
  margin-top: 2rem;
}

.workout-set-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.workout-set-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.owner-actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.owner-actions .btn {
  background: rgba(255,255,255,0.9);
  border: none;
  color: #666;
}

.card-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.difficulty-badge .badge {
  font-size: 0.75rem;
  padding: 0.5rem 0.75rem;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stars {
  display: flex;
  gap: 2px;
}

.stars .fa-star {
  color: #ddd;
  font-size: 0.8rem;
}

.stars .fa-star.filled {
  color: #ffc107;
}

.rating-text {
  font-size: 0.8rem;
  color: #666;
  margin-left: 0.25rem;
}

.card-body {
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.workout-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.workout-description {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 1rem;
  flex-grow: 1;
}

.workout-meta {
  margin-bottom: 1rem;
}

.creator, .exercise-count {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.workout-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #666;
}

.card-footer {
  padding: 1rem;
  border-top: 1px solid #eee;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

.loading-section, .error-section, .empty-state {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .vault-header .col-md-4 {
    margin-top: 1rem;
  }
  
  .filters-section .row {
    gap: 1rem;
  }
}
</style>