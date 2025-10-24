<template>
  <div class="vault-page">
    <div class="container mt-4">
      <!-- Header -->
      <div class="vault-header mb-4">
        <div class="row align-items-center">
          <div class="col-12">
            <h1 class="mb-2">Workout Vault</h1>
            <p class="u-muted">Discover and review community-created workout sets</p>
          </div>
        </div>
      </div>

      <!-- Filters and Sorting -->
      <div class="filters-section mb-4">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label u-muted">Sort by:</label>
            <select v-model="sortBy" @change="loadWorkouts" class="form-select">
              <option value="newest">Newest</option>
              <option value="rating">Highest Rating</option>
              <option value="reviews">Most Reviewed</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label u-muted">Search:</label>
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
          <div class="modal-content u-bg">
            <div class="modal-header">
              <h5 class="modal-title">{{ viewingPlaylist?.name || 'Workout Details' }}</h5>
              <button 
                type="button" 
                class="btn-close-white btn-close" 
                @click="showViewModal = false"
              ></button>
            </div>
            
            <div class="modal-body">
              <div v-if="viewingPlaylist?.description" class="playlist-description mb-3 text-white">
                <p>{{ viewingPlaylist.description }}</p>
              </div>

              <div class="playlist-stats mb-4">
                <div class="row text-center">
                  <div class="col-4">
                    <div class="stat-item">
                      <div class="stat-number text-white">{{ viewingPlaylist?.exercises?.length || 0 }}</div>
                      <div class="stat-label">Exercises</div>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="stat-item">
                      <div class="stat-number text-white">{{ Math.round(viewingPlaylist?.totalDuration || 0) }}</div>
                      <div class="stat-label">Minutes</div>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="stat-item">
                      <div class="stat-number text-white">{{ viewingPlaylist?.reviewsCount || 0 }}</div>
                      <div class="stat-label">Reviews</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="muscle-groups mb-4" v-if="viewingPlaylist?.muscleGroups?.length">
                <h6 class="u-muted">Targeted Muscle Groups:</h6>
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
                <h6 class="u-muted">Exercises in this set:</h6>
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
                          <h6 class="exercise-name mb-1" style="text-transform: capitalize;">{{ exercise.name }}</h6>
                          <p class="exercise-target mb-1 u-muted">{{ exercise.target }}</p>
                          <div class="exercise-badges">
                            <span class="badge bg-primary me-1">{{ exercise.bodyPart }}</span>
                            <span class="badge bg-secondary">{{ exercise.equipment }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="col-3">
                        <div class="exercise-sets text-end">
                          <div class="set-info u-muted">
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

              <!-- Comments Section -->
              <div class="comments-section mt-4">
                <h6 class="mb-3">Reviews & Comments</h6>
                <div v-if="workoutReviews.length === 0" class="text-muted text-center py-3">
                  No reviews yet. Be the first to rate this workout!
                </div>
                <div v-else class="reviews-list">
                  <div 
                    v-for="review in workoutReviews" 
                    :key="review.id" 
                    class="review-item mb-3 p-3 border rounded"
                    :class="{ 'user-own-review': review.userId === currentUser?.id }"
                  >
                    <!-- Reviewer Header -->
                    <div class="reviewer-header d-flex align-items-center gap-2 mb-2">
                      <div class="reviewer-avatar">
                        <div class="avatar-circle">
                          {{ getInitials(review.userName) }}
                        </div>
                      </div>
                      <div class="reviewer-details">
                        <div class="reviewer-name-row d-flex align-items-center gap-2">
                          <strong class="reviewer-name">{{ review.userName }}</strong>
                          <span v-if="review.userId === currentUser?.id" class="badge bg-primary">Your Review</span>
                        </div>
                        <div class="review-meta d-flex align-items-center gap-2">
                          <div class="rating-stars">
                            <img 
                              v-for="star in 5" 
                              :key="star"
                              src="/star.png"
                              alt="star"
                              class="star-display"
                              :class="{ 'star-filled': star <= review.rating }"
                            />
                          </div>
                          <small class="text-muted">{{ formatDate(review.createdAt) }}</small>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Review Content -->
                    <div class="review-content">
                      <p v-if="review.comment && review.comment.trim()" class="review-comment mb-0">
                        {{ review.comment }}
                      </p>
                      <p v-else class="review-comment mb-0 text-muted font-italic">
                        This user provided a rating without a written review.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="modal-footer">
              <button 
                type="button"
                class="u-btn u-btn--secondary"
                @click="showViewModal = false"
              >
                Close
              </button>
              <button 
                v-if="!isOwner(viewingPlaylist) && currentUser"
                type="button"
                class="u-btn u-btn--primary"
                @click="openRatingModal"
              >
                {{ hasUserReviewed ? 'Edit Review' : 'Rate Workout' }}
              </button>
              <span 
                v-else-if="isOwner(viewingPlaylist)"
                class="text-muted"
              >
                You cannot rate your own workout
              </span>
              <span 
                v-else
                class="text-muted"
              >
                Log in to rate this workout
              </span>
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
          <div class="modal-content u-bg">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ isEditingReview ? 'Edit Review' : 'Rate' }} "{{ viewingPlaylist?.name || 'Workout' }}"
              </h5>
              <button 
                type="button" 
                class="btn-close btn-close-white" 
                @click="showRatingModal = false"
              ></button>
            </div>
            
            <div class="modal-body py-4">
              <p class="mb-4 u-muted text-center">
                {{ isEditingReview ? 'Update your rating and review:' : 'How would you rate this workout?' }}
              </p>
              
              <div class="stars-rating-container mb-4 text-center">
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
              
              <div class="rating-feedback mb-4 text-center">
                <span class="rating-label">
                  {{ userRating > 0 ? userRating : 'Click a star to rate' }}
                </span>
              </div>

              <!-- Comment Section -->
              <div class="comment-section">
                <label for="reviewComment" class="form-label u-muted">Share your thoughts (optional):</label>
                <textarea
                  id="reviewComment"
                  v-model="userComment"
                  class="form-control"
                  rows="4"
                  placeholder="What did you think about this workout? Share your experience..."
                  maxlength="500"
                ></textarea>
                <div class="text-end mt-1">
                  <small class="text-muted">{{ userComment.length }}/500</small>
                </div>
              </div>
            </div>
            
            <div class="modal-footer justify-content-center">
              <button 
                type="button"
                class="u-btn u-btn--secondary me-2"
                @click="showRatingModal = false"
              >
                Cancel
              </button>
              <button 
                type="button"
                class="u-btn u-btn--primary"
                @click="submitRating"
                :disabled="userRating === 0 || submittingRating"
              >
                {{ submittingRating ? (isEditingReview ? 'Updating...' : 'Submitting...') : (isEditingReview ? 'Update Review' : 'Submit Rating') }}
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
          <div class="modal-content u-bg u-muted">
            <div class="modal-header border-0">
              <h5 class="modal-title">Thank You!</h5>
              <button 
                type="button" 
                class="btn-close btn-close-white" 
                @click="showThankYouModal = false"
              ></button>
            </div>
            <div class="modal-body text-center py-4">
              <div class="mb-3">
                <i class="fas fa-check-circle text-success" style="font-size: 3rem;"></i>
              </div>
              <h6 class="mb-3">
                {{ isEditingReview ? 'Review updated successfully!' : 'Thank you for rating this workout!' }}
              </h6>
              <p class="mb-0">
                {{ isEditingReview ? 'Your updated feedback is now live.' : 'Your feedback helps the community discover great workouts.' }}
              </p>
            </div>
            <div class="modal-footer border-0 justify-content-center">
              <button 
                type="button"
                class="u-btn u-btn--primary"
                @click="showThankYouModal = false"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Reviews Modal -->
      <div 
        v-if="showReviewsModal" 
        class="modal fade show d-block" 
        tabindex="-1" 
        style="background-color: rgba(0,0,0,0.7); z-index: 1060;"
        @click.self="showReviewsModal = false"
      >
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
          <div class="modal-content u-bg">
            <div class="modal-header">
              <h5 class="modal-title">
                Reviews for "{{ selectedWorkoutForReviews?.name || 'Workout' }}"
              </h5>
              <button 
                type="button" 
                class="btn-close btn-close-white" 
                @click="showReviewsModal = false"
              ></button>
            </div>
            
            <div class="modal-body">
              <!-- Rating Summary -->
              <div class="rating-summary mb-4 p-3 border rounded">
                <div class="row align-items-center">
                  <div class="col-md-4 text-center">
                    <div class="overall-rating">
                      <div class="rating-number">
                        {{ selectedWorkoutForReviews?.avgRating ? selectedWorkoutForReviews.avgRating.toFixed(1) : '0.0' }}
                      </div>
                      <div class="rating-stars-large mb-2">
                        <img 
                          v-for="star in 5" 
                          :key="star"
                          src="/star.png"
                          alt="star"
                          class="star-display-large"
                          :class="{ 'star-filled': star <= Math.round(selectedWorkoutForReviews?.avgRating || 0) }"
                        />
                      </div>
                      <div class="rating-text">out of 5</div>
                    </div>
                  </div>
                  <div class="col-md-8">
                    <div class="rating-breakdown">
                      <div class="total-reviews mb-2">
                        <strong>{{ selectedWorkoutForReviews?.reviewsCount || 0 }}</strong> total reviews
                      </div>
                      <!-- You can add star breakdown here if needed -->
                    </div>
                  </div>
                </div>
              </div>

              <!-- Reviews List -->
              <div class="reviews-container">
                <div v-if="reviewsModalData.length === 0" class="no-reviews text-center py-4">
                  <i class="fas fa-star text-muted" style="font-size: 3rem; opacity: 0.3;"></i>
                  <h6 class="mt-3 text-muted">No reviews yet</h6>
                  <p class="text-muted">Be the first to review this workout!</p>
                </div>
                <div v-else class="reviews-list">
                  <div 
                    v-for="review in reviewsModalData" 
                    :key="review.id" 
                    class="review-item-modal mb-3 p-3 border rounded"
                    :class="{ 'user-own-review': review.userId === currentUser?.id }"
                  >
                    <!-- Reviewer Header -->
                    <div class="reviewer-header d-flex align-items-center gap-2 mb-2">
                      <div class="reviewer-avatar">
                        <div class="avatar-circle">
                          {{ getInitials(review.userName) }}
                        </div>
                      </div>
                      <div class="reviewer-details">
                        <div class="reviewer-name-row d-flex align-items-center gap-2">
                          <strong class="reviewer-name">{{ review.userName }}</strong>
                          <span v-if="review.userId === currentUser?.id" class="badge bg-primary">Your Review</span>
                        </div>
                        <div class="review-meta d-flex align-items-center gap-2">
                          <div class="rating-stars">
                            <img 
                              v-for="star in 5" 
                              :key="star"
                              src="/star.png"
                              alt="star"
                              class="star-display"
                              :class="{ 'star-filled': star <= review.rating }"
                            />
                          </div>
                          <small class="text-muted">{{ formatDate(review.createdAt) }}</small>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Review Content -->
                    <div class="review-content">
                      <p v-if="review.comment && review.comment.trim()" class="review-comment mb-0">
                        {{ review.comment }}
                      </p>
                      <p v-else class="review-comment mb-0 text-muted font-italic">
                        This user provided a rating without a written review.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="modal-footer">
              <button 
                type="button"
                class="u-btn u-btn--secondary"
                @click="showReviewsModal = false"
              >
                Close
              </button>
              <button 
                v-if="!isOwner(selectedWorkoutForReviews) && currentUser"
                type="button"
                class="u-btn u-btn--primary"
                @click="openRatingModalFromReviews"
              >
                {{ hasUserReviewedSelected ? 'Edit Your Review' : 'Write a Review' }}
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
            <div class="workout-set-card u-card" @click="viewWorkoutSet(workoutSet)">
              <!-- Card Header -->
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="workout-title mb-0">{{ workoutSet.name || workoutSet.title || 'Unnamed Workout' }}</h5>
                <div class="exercise-count u-muted text-end">
                    {{ workoutSet.exercises?.length || 0 }} exercises
                </div>
              </div>

              <!-- Card Body -->
              <div class="card-body d-flex flex-column justify-content-start">
                
                <p class="workout-description mb-3 u-muted">{{ truncateText(workoutSet.description, 100) }}</p>
                
                <div class="workout-meta mb-3">
                  <div class="creator d-flex align-items-center">
                    <span class="">{{ getUserName(workoutSet) }}</span>
                  </div>
                </div>

                <div class="workout-stats">
                  <div class="rating-display u-muted">
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
                    <span class="u-muted">{{ workoutSet.estimatedDuration || 30 }}min</span>
                  </div>
                </div>

                
              </div>

              <!-- Card Footer -->
              <div class="card-footer d-flex gap-2">
                <button 
                  v-if="!isOwner(workoutSet)"
                  @click.stop="viewWorkoutSet(workoutSet)"
                  class="u-btn u-btn--primary flex-fill d-flex align-items-center justify-content-center"
                >
                  <p class="text-center footerBtn">View</p>
                </button>
                <button 
                  v-if="isOwner(workoutSet)"
                  @click.stop="editWorkout(workoutSet)"
                  class="u-btn u-btn--primary flex-fill d-flex align-items-center justify-content-center"
                >
                  <p class="text-center footerBtn">Edit</p>
                </button>
                <button 
                  @click.stop="openReviewsModal(workoutSet)"
                  class="u-btn u-btn--secondary flex-fill d-flex align-items-center justify-content-center"
                >
                  <p class="text-center footerBtn">Reviews ({{ workoutSet.reviewsCount || 0 }})</p>
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
const userComment = ref('')
const hoverRating = ref(0)
const submittingRating = ref(false)
const workoutReviews = ref([])
const isEditingReview = ref(false)
const existingReview = ref(null)
const showReviewsModal = ref(false)
const selectedWorkoutForReviews = ref(null)
const reviewsModalData = ref([])

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

const hasUserReviewed = computed(() => {
  if (!currentUser.value || !viewingPlaylist.value) return false
  return workoutReviews.value.some(review => review.userId === currentUser.value.id)
})

const hasUserReviewedSelected = computed(() => {
  if (!currentUser.value || !selectedWorkoutForReviews.value) return false
  return reviewsModalData.value.some(review => review.userId === currentUser.value.id)
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
  
  // Load reviews for this workout
  loadWorkoutReviews(workoutSet.id)
}

const loadWorkoutReviews = async (workoutId) => {
  try {
    workoutReviews.value = await workoutVaultService.getWorkoutReviews(workoutId)
  } catch (error) {
    console.error('Error loading reviews:', error)
    workoutReviews.value = []
  }
}

const openReviewsModal = async (workoutSet) => {
  selectedWorkoutForReviews.value = workoutSet
  showReviewsModal.value = true
  
  // Load reviews for this workout
  try {
    const reviews = await workoutVaultService.getWorkoutReviews(workoutSet.id)
    console.log(`Loaded ${reviews.length} reviews for workout:`, workoutSet.name)
    reviewsModalData.value = reviews
  } catch (error) {
    console.error('Error loading reviews for modal:', error)
    reviewsModalData.value = []
  }
}

const openRatingModalFromReviews = async () => {
  // Close reviews modal and open rating modal with the selected workout
  showReviewsModal.value = false
  
  // Set the viewing playlist to the selected workout
  viewingPlaylist.value = selectedWorkoutForReviews.value
  
  // Open the rating modal
  await openRatingModal()
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown date'
  
  // Handle Firebase timestamp
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getInitials = (name) => {
  if (!name) return '?'
  const names = name.split(' ')
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

const openRatingModal = async () => {
  if (!currentUser.value) {
    alert('Please log in to rate workouts')
    return
  }

  // Check if user is trying to rate their own workout
  if (isOwner(viewingPlaylist.value)) {
    alert('You cannot rate your own workout')
    return
  }

  // Check if user has already rated this workout
  try {
    const userReview = await workoutVaultService.getUserReview(
      viewingPlaylist.value.id, 
      currentUser.value.id
    )
    
    if (userReview) {
      // User has existing review - load it for editing
      isEditingReview.value = true
      existingReview.value = userReview
      userRating.value = userReview.rating
      userComment.value = userReview.comment || ''
    } else {
      // No existing review - create new one
      isEditingReview.value = false
      existingReview.value = null
      userRating.value = 0
      userComment.value = ''
    }
  } catch (error) {
    console.error('Error checking user review:', error)
    alert('Error loading review data. Please try again.')
    return
  }

  // Reset other states and open modal
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
      userComment.value || '' // Include the comment
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
      
      // Update selectedWorkoutForReviews if it's the same workout
      if (selectedWorkoutForReviews.value?.id === viewingPlaylist.value.id) {
        selectedWorkoutForReviews.value.reviewsCount = updatedWorkoutData.reviewsCount
        selectedWorkoutForReviews.value.totalRating = updatedWorkoutData.totalRating
        selectedWorkoutForReviews.value.avgRating = updatedWorkoutData.avgRating
      }
      
      // console.log('Updated workout data from Firebase:', {
      //   id: updatedWorkout.id,
      //   reviewsCount: updatedWorkoutData.reviewsCount,
      //   totalRating: updatedWorkoutData.totalRating,
      //   avgRating: updatedWorkoutData.avgRating
      // })
    }
    
    // Refresh the reviews list
    await loadWorkoutReviews(viewingPlaylist.value.id)
    
    // Refresh reviews modal data if it's open for the same workout
    if (selectedWorkoutForReviews.value?.id === viewingPlaylist.value.id) {
      reviewsModalData.value = await workoutVaultService.getWorkoutReviews(viewingPlaylist.value.id)
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
  // Navigate to workout-sets page for editing with the workout ID
  router.push({
    path: '/workout-sets',
    query: { 
      edit: workoutSet.id,
      name: workoutSet.name || workoutSet.title
    }
  })
}

const handleImageError = (event) => {
  event.target.src = '/images/exercise-placeholder.png'
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
}

.filters-section {
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-subtle);
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.workout-sets-grid {
  margin-top: 2rem;
}

.workout-set-card {
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
  border-bottom: 1px solid var(--border-subtle);
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
  opacity: 0.3; /* Unfilled stars are dim */
  filter: grayscale(100%); /* Gray out unfilled stars */
  transition: all 0.2s ease;
}

.star-display.star-filled {
  opacity: 1; /* Filled stars are fully visible */
  filter: grayscale(0%) hue-rotate(20deg) saturate(1.5); /* Make filled stars yellow */
}

.rating-text {
  font-size: 0.8rem;
  margin-left: 0.25rem;
  color: white !important; /* Make rating text white and visible */
}

.card-body {
  padding: 1rem;
  flex-grow: 1;
  /* Remove conflicting flex properties - let Bootstrap handle them */
}

.workout-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.workout-description {
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
  margin-bottom: 0.25rem;
}

.exercise-count {
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

.workout-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.card-footer {
  padding: 1rem;
  border-top: 1px solid var(--border-subtle);
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
  background: var(--surface-subtle);
  transition: all 0.2s ease;
  border: 1px solid var(--border-subtle) !important;
}

.exercise-detail-item:hover {
  background: #4c4c4c;
}

.exercise-number {
  font-size: 0.875rem;
  font-weight: bold;
}

.exercise-name {
  font-size: 1rem;
  font-weight: 600;
  color: white;
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

.modal-header {
  border-bottom: black;
}

.modal-footer {
  border-top: black !important;
}

/* Comments Section Styles */
.comments-section {
  border-top: 1px solid var(--border-subtle);
  padding-top: 1rem;
}

.review-item {
  background: var(--surface-subtle);
  border: 1px solid var(--border-subtle) !important;
  transition: all 0.2s ease;
}

.review-item:hover {
  background: #4c4c4c;
}

.user-own-review {
  border-color: var(--primary) !important;
  background: rgba(59, 130, 246, 0.1) !important;
}

.user-own-review:hover {
  background: rgba(59, 130, 246, 0.15) !important;
}

.reviewer-info {
  display: flex;
  flex-direction: column;
  color: white;
  gap: 0.25rem;
}

.reviewer-name {
  color: white !important; /* Make reviewer name bright white */
  font-size: 0.95rem;
}

.rating-stars {
  display: flex;
  gap: 2px;
  font-size: 1rem;
}

.star-display {
  margin-right: 2px;
}

.review-comment {
  color: white !important; /* Make review text bright white */
  font-size: 0.9rem;
  line-height: 1.4;
  margin-top: 0.5rem;
}

/* Comment form styles */
.comment-section textarea {
  background: var(--surface-subtle);
  border: 1px solid var(--border-subtle);
  color: white;
  resize: vertical;
  min-height: 100px;
}

.comment-section textarea:focus {
  background: var(--surface-subtle);
  border-color: var(--primary);
  color: white;
}

.comment-section textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

/* Reviews Modal Styles */
.rating-summary {
  background: var(--surface-subtle);
  border: 1px solid var(--border-subtle) !important;
}

.overall-rating .rating-number {
  font-size: 3rem;
  font-weight: bold;
  color: #ffc107 !important; /* Force yellow color for rating number */
}

.rating-stars-large {
  display: flex;
  gap: 3px;
  justify-content: center;
  font-size: 1.5rem;
}

.star-display-large {
  width: 24px;
  height: 24px;
  margin-right: 3px;
  opacity: 0.3; /* Unfilled stars are dim */
  filter: grayscale(100%); /* Gray out unfilled stars */
  transition: all 0.2s ease;
}

.star-display-large.star-filled {
  opacity: 1; /* Filled stars are fully visible */
  filter: grayscale(0%) hue-rotate(20deg) saturate(1.5); /* Make filled stars yellow */
}

.rating-text {
  color: white !important; /* Make rating text bright white */
  font-size: 0.9rem;
}

.total-reviews {
  color: white;
  font-size: 1.1rem;
}

.review-item-modal {
  background: var(--surface-subtle);
  border: 1px solid var(--border-subtle) !important;
  transition: all 0.2s ease;
}

.review-item-modal:hover {
  background: #4c4c4c;
}

.review-item-modal.user-own-review {
  border-color: var(--primary) !important;
  background: rgba(59, 130, 246, 0.1) !important;
}

.review-item-modal.user-own-review:hover {
  background: rgba(59, 130, 246, 0.15) !important;
}

.reviewer-header {
  margin-bottom: 0.75rem;
}

.reviewer-avatar {
  flex-shrink: 0;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.875rem;
}

.reviewer-details {
  flex: 1;
  min-width: 0;
}

.reviewer-name-row {
  margin-bottom: 0.25rem;
}

.reviewer-name {
  color: white !important; /* Make reviewer name bright white */
  font-size: 1rem;
  margin: 0;
}

.review-meta {
  align-items: center;
}

/* Make dates white in review sections */
.review-meta .text-muted,
.reviewer-details .text-muted,
.review-comment.text-muted {
  color: rgba(255, 255, 255, 0.8) !important;
}

.rating-stars {
  display: flex;
  gap: 2px;
  font-size: 0.9rem;
}

.star-display {
  margin-right: 1px;
}

.review-content {
  margin-left: 48px; /* Align with reviewer details */
}

.review-comment {
  color: white !important; /* Make review text bright white */
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

.no-reviews {
  color: rgba(255, 255, 255, 0.5);
}

.font-italic {
  font-style: italic;
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