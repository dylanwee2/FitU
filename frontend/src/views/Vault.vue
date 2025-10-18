<template>
  <div class="vault-page">
    <div class="container mt-4">
      <!-- Header -->
      <div class="vault-header mb-4">
        <div class="row align-items-center">
          <div class="col-12">
            <h1 class="page-title mb-2">Workout Vault</h1>
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
              placeholder="Search by workout name..."
            >
          </div>
        </div>
      </div>

      <!-- View Playlist Modal -->
      <div 
        v-if="showViewModal" 
        class="modal fade show d-block" 
        tabindex="-1" 
        style="background-color: rgba(0,0,0,0.5);"
        @click.self="showViewModal = false"
      >
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ viewingPlaylist?.name || 'Workout Details' }}</h5>
              <button 
                type="button" 
                class="btn-close" 
                @click="showViewModal = false"
              ></button>
            </div>
            
            <div class="modal-body">
              <div v-if="viewingPlaylist?.description" class="playlist-description mb-3">
                <p>{{ viewingPlaylist.description }}</p>
              </div>

              <div class="playlist-stats mb-4">
                <div class="row text-center">
                  <div class="col-4">
                    <div class="stat-item">
                      <div class="stat-number">{{ viewingPlaylist?.exercises?.length || 0 }}</div>
                      <div class="stat-label">Exercises</div>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="stat-item">
                      <div class="stat-number">{{ Math.round(viewingPlaylist?.totalDuration || 0) }}</div>
                      <div class="stat-label">Minutes</div>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="stat-item">
                      <div class="stat-number">{{ viewingPlaylist?.reviewsCount || 0 }}</div>
                      <div class="stat-label">Reviews</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="muscle-groups mb-4" v-if="viewingPlaylist?.muscleGroups?.length">
                <h6>Targeted Muscle Groups:</h6>
                <div class="muscle-badges">
                  <span 
                    v-for="muscle in viewingPlaylist.muscleGroups" 
                    :key="muscle"
                    class="badge bg-primary me-1 mb-1"
                  >
                    {{ muscle }}
                  </span>
                </div>
              </div>

              <div class="exercises-list" v-if="viewingPlaylist?.exercises?.length">
                <h6>Exercises in this set:</h6>
                <div class="exercise-detail-list">
                  <div 
                    v-for="(exercise, index) in viewingPlaylist.exercises" 
                    :key="exercise.id"
                    class="exercise-detail-item mb-3 p-3 border rounded"
                  >
                    <div class="row align-items-center">
                      <div class="col-1">
                        <div class="exercise-number badge bg-secondary">{{ index + 1 }}</div>
                      </div>
                      <div class="col-2">
                        <div class="exercise-image">
                          <img 
                            :src="exercise.gifUrl || '/images/exercise-placeholder.png'" 
                            :alt="exercise.name"
                            @error="handleImageError"
                            class="img-fluid rounded"
                            style="max-height: 60px; object-fit: cover;"
                          >
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="exercise-info">
                          <h6 class="exercise-name mb-1">{{ exercise.name }}</h6>
                          <p class="exercise-target mb-1 text-muted">{{ exercise.target }}</p>
                          <div class="exercise-badges">
                            <span class="badge target-muscle-badge me-1">{{ capitalizeFirstLetter(exercise.target) }}</span>
                            <span class="badge body-part-badge me-1">{{ capitalizeFirstLetter(exercise.bodyPart) }}</span>
                            <span class="badge equipment-badge">{{ capitalizeFirstLetter(exercise.equipment) }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="col-3">
                        <div class="exercise-sets text-end">
                          <div class="set-info">
                            <div class="sets"><strong>{{ exercise.sets || 3 }}</strong> sets</div>
                            <div class="reps"><strong>{{ exercise.reps || 10 }}</strong> reps</div>
                            <div v-if="exercise.weight" class="weight"><strong>{{ exercise.weight }}</strong> lbs</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="modal-footer">
              <button 
                type="button"
                class="btn btn-secondary"
                @click="showViewModal = false"
              >
                Close
              </button>
              <button 
                type="button"
                class="btn btn-primary"
                @click="openRatingModal"
              >
                <i class="fas fa-star me-1"></i>Rate Workout
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Rating Modal -->
      <div 
        v-if="showRatingModal" 
        class="modal fade show d-block" 
        tabindex="-1" 
        style="background-color: rgba(0,0,0,0.7); z-index: 1060;"
        @click.self="showRatingModal = false"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Rate "{{ viewingPlaylist?.name || 'Workout' }}"</h5>
              <button 
                type="button" 
                class="btn-close" 
                @click="showRatingModal = false"
              ></button>
            </div>
            
            <div class="modal-body text-center py-4">
              <p class="mb-4 text-muted">How would you rate this workout?</p>
              
              <div class="stars-rating-container mb-4">
                <img 
                  v-for="star in 5" 
                  :key="star"
                  src="/star.png"
                  alt="star"
                  class="star-rating"
                  :class="{ 
                    'star-filled': star <= userRating,
                    'star-hover': star <= hoverRating && hoverRating > 0
                  }"
                  @click="setRating(star)"
                  @mouseenter="hoverRating = star"
                  @mouseleave="hoverRating = 0"
                />
              </div>
              
              <div class="rating-feedback mb-3">
                <span class="rating-label">
                  {{ userRating > 0 ? userRating : 'Click a star to rate' }}
                </span>
              </div>
            </div>
            
            <div class="modal-footer justify-content-center">
              <button 
                type="button"
                class="btn btn-secondary me-2"
                @click="showRatingModal = false"
              >
                Cancel
              </button>
              <button 
                type="button"
                class="btn btn-primary"
                @click="submitRating"
                :disabled="userRating === 0 || submittingRating"
              >
                {{ submittingRating ? 'Submitting...' : 'Submit Rating' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Thank You Modal -->
      <div 
        class="modal fade show d-block" 
        v-if="showThankYouModal" 
        tabindex="-1" 
        style="background-color: rgba(0,0,0,0.5); z-index: 1055;"
        @click.self="showThankYouModal = false"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header border-0">
              <h5 class="modal-title">Thank You!</h5>
              <button 
                type="button" 
                class="btn-close" 
                @click="showThankYouModal = false"
              ></button>
            </div>
            <div class="modal-body text-center py-4">
              <div class="mb-3">
                <i class="fas fa-check-circle text-success" style="font-size: 3rem;"></i>
              </div>
              <h6 class="mb-3">Thank you for rating this workout!</h6>
              <p class="text-muted mb-0">Your feedback helps the community discover great workouts.</p>
            </div>
            <div class="modal-footer border-0 justify-content-center">
              <button 
                type="button"
                class="btn btn-primary"
                @click="showThankYouModal = false"
              >
                Close
              </button>
            </div>
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
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="workout-title mb-0">{{ workoutSet.name || workoutSet.title || 'Unnamed Workout' }}</h5>
                <div class="exercise-count text-end">
                    <i class="fas fa-list me-1"></i>
                    {{ workoutSet.exercises?.length || 0 }} exercises
                </div>
              </div>

              <!-- Card Body -->
              <div class="card-body d-flex flex-column justify-content-start">
                
                <p class="workout-description mb-3 text-muted">{{ truncateText(workoutSet.description, 100) }}</p>
                
                <div class="workout-meta mb-3">
                  <div class="creator d-flex align-items-center">
                    <i class="text-secondary"></i>
                    <span class="text-muted">{{ getUserName(workoutSet) }}</span>
                  </div>
                </div>

                <div class="workout-stats">
                  <div class="rating-display">
                    <div class="stars">
                      <img 
                        v-for="star in 5" 
                        :key="star"
                        src="/star.png"
                        alt="star"
                        class="star-display"
                        :class="{ 'star-filled': star <= Math.round(workoutSet.avgRating || 0) }"
                      />
                    </div>
                    <span class="rating-text">{{ formatRating(workoutSet) }}</span>
                  </div>

                  <div class="stat">
                    <i class="fas fa-clock me-1"></i>
                    <span>{{ workoutSet.estimatedDuration || 30 }}min</span>
                  </div>
                </div>

                
              </div>

              <!-- Card Footer -->
              <div class="card-footer d-flex gap-2">
                <button 
                  @click.stop="viewWorkoutSet(workoutSet)"
                  class="u-btn u-btn--primary flex-fill d-flex align-items-center justify-content-center"
                >
                  <p class="text-center footerBtn">View</p>
                </button>
                <button 
                  v-if="isOwner(workoutSet)"
                  @click.stop="editWorkout(workoutSet)"
                  class="u-btn flex-fill d-flex align-items-center justify-content-center"
                >
                  <p class="text-center footerBtn">Edit</p>
                </button>
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
const showViewModal = ref(false)
const showRatingModal = ref(false)
const showThankYouModal = ref(false)
const viewingPlaylist = ref(null)
const userRating = ref(0)
const hoverRating = ref(0)
const submittingRating = ref(false)

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

const viewWorkoutSet = (workoutSet) => {
  // Convert workoutSet to playlist format for the modal
  const playlist = {
    ...workoutSet,
    id: workoutSet.id, // Ensure ID is preserved
    name: workoutSet.name || workoutSet.title || 'Unnamed Workout',
    exercises: workoutSet.exercises || [],
    muscleGroups: workoutSet.muscleGroups || [],
    totalDuration: workoutSet.estimatedDuration || 30,
    reviewsCount: workoutSet.reviewsCount || 0,
    totalRating: workoutSet.totalRating || 0,
    avgRating: workoutSet.avgRating || 0
  }
  // console.log('Opening workout with ID:', workoutSet.id) // Debug log
  // console.log(playlist)
  viewingPlaylist.value = playlist
  userRating.value = 0
  hoverRating.value = 0
  showViewModal.value = true
}

const openRatingModal = () => {
  if (!currentUser.value) {
    alert('Please log in to rate workouts')
    return
  }
  // console.log('Opening rating modal for workout ID:', viewingPlaylist.value?.id) // Debug log
  userRating.value = 0
  hoverRating.value = 0
  showRatingModal.value = true
}

const setRating = (rating) => {
  if (!currentUser.value) {
    alert('Please log in to rate workouts')
    return
  }
  userRating.value = rating
}

const submitRating = async () => {
  if (!currentUser.value || !viewingPlaylist.value || userRating.value === 0) {
    console.error('Missing data for rating submission:', {
      user: !!currentUser.value,
      workout: !!viewingPlaylist.value,
      workoutId: viewingPlaylist.value?.id,
      rating: userRating.value
    })
    return
  }

  submittingRating.value = true
  
  try {
    // console.log('Submitting rating:', {
    //   workoutId: viewingPlaylist.value.id,
    //   userId: currentUser.value.id,
    //   userName: currentUser.value.name,
    //   rating: userRating.value
    // })
    
    // Add the review/rating using the vault service - this will automatically update the workout's rating statistics
    await workoutVaultService.addReview(
      viewingPlaylist.value.id, 
      currentUser.value.id,
      currentUser.value.name,
      userRating.value,
      '' // Empty comment for now, since we're just doing ratings
    )
    
    // Refresh the workout data from Firebase to get the updated rating statistics
    const updatedWorkoutData = await workoutVaultService.getWorkoutById(viewingPlaylist.value.id)
    
    // Update the local data with the fresh data from Firebase
    const updatedWorkout = workoutSets.value.find(w => w.id === viewingPlaylist.value.id)
    if (updatedWorkout && updatedWorkoutData) {
      updatedWorkout.reviewsCount = updatedWorkoutData.reviewsCount
      updatedWorkout.totalRating = updatedWorkoutData.totalRating
      updatedWorkout.avgRating = updatedWorkoutData.avgRating
      
      // Update the viewing playlist as well
      viewingPlaylist.value.reviewsCount = updatedWorkoutData.reviewsCount
      viewingPlaylist.value.totalRating = updatedWorkoutData.totalRating
      viewingPlaylist.value.avgRating = updatedWorkoutData.avgRating
      
      // console.log('Updated workout data from Firebase:', {
      //   id: updatedWorkout.id,
      //   reviewsCount: updatedWorkoutData.reviewsCount,
      //   totalRating: updatedWorkoutData.totalRating,
      //   avgRating: updatedWorkoutData.avgRating
      // })
    }
    
    // Close all modals and show thank you message
    showViewModal.value = false
    showRatingModal.value = false
    userRating.value = 0
    showThankYouModal.value = true
    
  } catch (error) {
    console.error('Error submitting rating:', error)
    alert('Failed to submit rating. Please try again.')
  } finally {
    submittingRating.value = false
  }
}

const editWorkout = (workoutSet) => {
  // Navigate to workout-sets page for editing
  router.push('/workout-sets')
}

const handleImageError = (event) => {
  event.target.src = '/images/exercise-placeholder.png'
}

const capitalizeFirstLetter = (text) => {
  if (!text) return ''
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const filteredWorkoutSets = computed(() => {
  let filtered = [...workoutSets.value]

  // Apply search filter - search by title only
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(set => {
      const title = set.name || set.title || ''
      return title.toLowerCase().includes(query)
    })
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

const isOwner = (workoutSet) => {
  return currentUser.value && workoutSet.userId === currentUser.value.id
}

const getUserName = (workoutSet) => {
  // Try to get user name from workout data
  return workoutSet.userName || workoutSet.creatorName || 'Anonymous'
}

// Utility functions
const formatRating = (workoutSet) => {
  if (!workoutSet || !workoutSet.reviewsCount || workoutSet.reviewsCount === 0) {
    return 'No ratings'
  }
  
  // Use the avgRating that Firebase calculates for us, rounded up to whole number
  const avgRating = Math.ceil(workoutSet.avgRating || 0)
  return `${avgRating}/5 (${workoutSet.reviewsCount} review${workoutSet.reviewsCount !== 1 ? 's' : ''})`
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

.card-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  /* Remove conflicting flex properties - let Bootstrap handle them */
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

.star-display {
  width: 16px;
  height: 16px;
  opacity: 0.3;
  filter: grayscale(100%);
}

.star-display.star-filled {
  opacity: 1;
  filter: grayscale(0%);
}

.rating-text {
  font-size: 0.8rem;
  color: #666;
  margin-left: 0.25rem;
}

.card-body {
  padding: 1rem;
  flex-grow: 1;
  /* Remove conflicting flex properties - let Bootstrap handle them */
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

.creator {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.exercise-count {
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
  /* Remove conflicting flex properties - let Bootstrap handle them */
}

/* Remove conflicting button styles - let Bootstrap handle them */

.loading-section, .error-section, .empty-state {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Modal specific styles */
.stars-rating-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 20px 0;
}

.star-rating {
  width: 40px;
  height: 40px;
  cursor: pointer;
  opacity: 0.3;
  transition: opacity 0.2s ease;
  filter: grayscale(100%);
}

.star-rating.star-filled,
.star-rating.star-hover {
  opacity: 1;
  filter: grayscale(0%);
}

.star-rating:hover {
  opacity: 1;
  filter: grayscale(0%);
}

.rating-feedback {
  min-height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.rating-label {
  font-size: 1.1rem;
  font-weight: 500;
  color: #495057;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary, #007bff);
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.exercise-detail-item {
  background: #f8f9fa;
  transition: all 0.2s ease;
}

.exercise-detail-item:hover {
  background: #e9ecef;
}

.exercise-number {
  font-size: 0.875rem;
  font-weight: bold;
}

.exercise-name {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.exercise-target {
  font-size: 0.875rem;
  text-transform: capitalize;
}

.set-info {
  font-size: 0.875rem;
}

.set-info div {
  margin-bottom: 0.25rem;
}

.footerBtn{
  height: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
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

/* Color-coded badge styles */
.target-muscle-badge {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%) !important;
  color: white !important;
  border: none;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
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
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
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
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
}

.equipment-badge:hover {
  background: linear-gradient(135deg, #229954 0%, #1e8449 100%) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}
</style>