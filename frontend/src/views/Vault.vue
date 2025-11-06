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
                      <div class="stat-number text-white">{{ formatWorkoutDuration(viewingPlaylist) }}</div>
                      <div class="stat-label">Duration</div>
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
                <div class="exercise-badges">
                  <span 
                    v-for="muscle in viewingPlaylist.muscleGroups" 
                    :key="muscle"
                    class="badge target-muscle-badge me-1 clickable-badge"
                  >
                    {{ formatMuscleGroup(muscle) }}
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
                            <span class="badge target-muscle-badge me-1 clickable-badge">{{ formatTarget(exercise.target) }}</span>
                            <span class="badge body-part-badge me-1 clickable-badge">{{ formatBodyPart(exercise.bodyPart) }}</span>
                            <span class="badge equipment-badge clickable-badge">{{ formatEquipment(exercise.equipment) }}</span>
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
                <div v-if="workoutReviews.length === 0" class="text-center py-3">
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
                type="button"
                class="u-btn u-btn--primary"
                @click="openRatingModal"
              >
                Rate Workout
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
          <div class="modal-content u-bg">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ isUpdatingReview ? 'Update Your Rating' : 'Rate' }} "{{ viewingPlaylist?.name || 'Workout' }}"
              </h5>
              <button 
                type="button" 
                class="btn-close btn-close-white" 
                @click="showRatingModal = false"
              ></button>
            </div>
            
            <div class="modal-body text-center py-4">
              <p v-if="isUpdatingReview" class="mb-2 u-muted">
                You previously rated this workout {{ existingUserReview?.rating }} star{{ existingUserReview?.rating !== 1 ? 's' : '' }}.
              </p>
              <p class="mb-4 u-muted">
                {{ isUpdatingReview ? 'Update your rating:' : 'How would you rate this workout?' }}
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
                {{ submittingRating ? 'Submitting...' : (isUpdatingReview ? 'Update Rating' : 'Submit Rating') }}
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

      <!-- Update Confirmation Modal -->
      <div 
        v-if="showUpdateConfirmModal" 
        class="modal fade show d-block" 
        tabindex="-1" 
        style="background-color: rgba(0,0,0,0.7); z-index: 1060;"
        @click.self="cancelUpdate"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content u-bg">
            <div class="modal-header">
              <h5 class="modal-title">Update Your Review?</h5>
              <button 
                type="button" 
                class="btn-close btn-close-white" 
                @click="cancelUpdate"
              ></button>
            </div>
            
            <div class="modal-body text-center py-4">
              <h6 class="mb-3">You've already reviewed this workout</h6>
              <p class="mb-3 u-muted">
                You previously gave "{{ viewingPlaylist?.name || 'this workout' }}" 
                {{ existingUserReview?.rating }} star{{ existingUserReview?.rating !== 1 ? 's' : '' }}.
              </p>
              <p class="mb-0 u-muted">
                Would you like to update your rating?
              </p>
            </div>
            
            <div class="modal-footer justify-content-center">
              <button 
                type="button"
                class="u-btn u-btn--secondary me-2"
                @click="cancelUpdate"
              >
                Cancel
              </button>
              <button 
                type="button"
                class="u-btn u-btn--primary"
                @click="proceedWithUpdate"
              >
                Update Rating
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
                    </div>
                  </div>
                </div>
              </div>

              <!-- Reviews List -->
              <div class="reviews-container">
                <div v-if="workoutReviews.length === 0" class="no-reviews text-center py-4">
                  <h6 class="mt-3 text-muted">No reviews yet</h6>
                  <p class="text-muted">Be the first to review this workout!</p>
                </div>
                <div v-else class="reviews-list">
                  <div 
                    v-for="review in workoutReviews" 
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
                type="button"
                class="u-btn u-btn--primary"
                @click="openRatingModalFromReviews"
              >
                {{ hasUserReviewed ? 'Edit Your Review' : 'Write a Review' }}
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
        </div>
        <h4>Unable to Load Workout Sets</h4>
        <p class="text-muted">{{ error }}</p>
        <button @click="loadWorkouts" class="btn btn-primary">Try Again</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredWorkoutSets.length === 0" class="empty-state text-center py-5">
        <div class="empty-icon mb-3">
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
            class="col-sm-6 col-lg-4 col-xl-3 vault-item"
          >
            <div class="workout-set-card u-card" @click="viewWorkoutSet(workoutSet)">
              <!-- Media header (first exercise image if available) -->
              <div class="card-media" v-if="(workoutSet.exercises && workoutSet.exercises[0]?.gifUrl)" >
                <img :src="workoutSet.exercises[0].gifUrl" :alt="workoutSet.name || 'Workout image'" loading="lazy" @error="handleImageError">
                <div class="media-gradient"></div>
              </div>
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
                    <span class="">Created by: {{ getUserName(workoutSet) }}</span>
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
                        :class="{ 'star-filled': star <= Math.ceil(workoutSet.avgRating || 0) }"
                      />
                    </div>
                    <span class="rating-text">{{ formatRating(workoutSet) }}</span>
                  </div>

                  <div class="stat">
                    <span class="u-muted">{{ formatWorkoutDuration(workoutSet) }}</span>
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
import { formatDuration } from '@/types/workout.js'

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
const showUpdateConfirmModal = ref(false)
const viewingPlaylist = ref(null)
const userRating = ref(0)
const userComment = ref('')
const hoverRating = ref(0)
const submittingRating = ref(false)
const existingUserReview = ref(null)
const isUpdatingReview = ref(false)
const workoutReviews = ref([])
const isEditingReview = ref(false)
const showReviewsModal = ref(false)
const selectedWorkoutForReviews = ref(null)
const userHasReviewedSelected = ref(false)

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
  if (!currentUser.value) return false
  
  // For reviews modal, use the dedicated reactive variable that checks the database
  if (selectedWorkoutForReviews.value) {
    return userHasReviewedSelected.value
  }
  
  // For view modal context, check the loaded reviews
  if (viewingPlaylist.value) {
    return workoutReviews.value.some(review => review.userId === currentUser.value.id)
  }
  
  return false
})



const viewWorkoutSet = async (workoutSet) => {
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
  
  viewingPlaylist.value = playlist
  userRating.value = 0
  hoverRating.value = 0
  showViewModal.value = true
  
  // Load reviews for this workout
  await loadWorkoutReviews(workoutSet.id)
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
    workoutReviews.value = await workoutVaultService.getWorkoutReviews(workoutSet.id)
    console.log(`Loaded ${workoutReviews.value.length} reviews for workout:`, workoutSet.name)
    
    // Check if current user has already reviewed this workout
    if (currentUser.value) {
      const userReview = await workoutVaultService.getUserReviewForWorkout(
        workoutSet.id, 
        currentUser.value.id
      )
      userHasReviewedSelected.value = !!userReview
    } else {
      userHasReviewedSelected.value = false
    }
  } catch (error) {
    console.error('Error loading reviews for modal:', error)
    workoutReviews.value = []
    userHasReviewedSelected.value = false
  }
}

const getInitials = (name) => {
  if (!name) return '?'
  const names = name.split(' ')
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
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

const formatWorkoutDuration = (workoutSet) => {
  let totalMinutes = 0;
  
  // Calculate duration from exercises using 5 minutes per set rule
  if (workoutSet.exercises && workoutSet.exercises.length > 0) {
    totalMinutes = workoutSet.exercises.reduce((total, exercise) => {
      const sets = exercise.sets || 3; // Default to 3 sets
      return total + (sets * 5); // 5 minutes per set
    }, 0);
  } else if (workoutSet.estimatedDuration || workoutSet.totalDuration) {
    // Use stored duration as fallback
    totalMinutes = workoutSet.estimatedDuration || workoutSet.totalDuration;
  }
  
  // If we still have 0 and there are exercises, use a basic fallback
  if (totalMinutes === 0 && workoutSet.exercises && workoutSet.exercises.length > 0) {
    // Each exercise gets 3 sets by default = 15 minutes per exercise
    totalMinutes = workoutSet.exercises.length * 3 * 5;
  }
  
  return formatDuration(totalMinutes);
}

const openRatingModalFromReviews = async () => {
  // Close reviews modal and open rating modal with the selected workout
  showReviewsModal.value = false
  
  // Set the viewing playlist to the selected workout
  viewingPlaylist.value = selectedWorkoutForReviews.value
  
  // Open the rating modal
  await openRatingModal()
}
const openRatingModal = async () => { 
  try {
    // Check if user has already reviewed this workout
    existingUserReview.value = await workoutVaultService.getUserReviewForWorkout(
      viewingPlaylist.value.id, 
      currentUser.value.id
    )
    
    if (existingUserReview.value) {
      // User has already reviewed, show update confirmation modal
      isUpdatingReview.value = true
      userRating.value = existingUserReview.value.rating
      userComment.value = existingUserReview.value.comment || ''
      showUpdateConfirmModal.value = true
    } else {
      // New review
      isUpdatingReview.value = false
      userRating.value = 0
      userComment.value = ''
      hoverRating.value = 0
      showRatingModal.value = true
    }
  } catch (error) {
    console.error('Error checking existing review:', error)
    // If there's an error checking, proceed as if it's a new review
    isUpdatingReview.value = false
    userRating.value = 0
    userComment.value = ''
    hoverRating.value = 0
    showRatingModal.value = true
  }
}

const proceedWithUpdate = () => {
  showUpdateConfirmModal.value = false
  showRatingModal.value = true
}

const cancelUpdate = () => {
  showUpdateConfirmModal.value = false
  userRating.value = 0
  hoverRating.value = 0
  existingUserReview.value = null
  isUpdatingReview.value = false
  userHasReviewedSelected.value = false
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
    // Add/update the review using the vault service
    const result = await workoutVaultService.addReview(
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
    }
    
    // Refresh the reviews list to show the new/updated review
    await loadWorkoutReviews(viewingPlaylist.value.id)
    
    // Close modals and show appropriate thank you message
    showViewModal.value = false
    showRatingModal.value = false
    userRating.value = 0
    isUpdatingReview.value = false
    existingUserReview.value = null
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
  return workoutSet.authorDisplayName  
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

const formatMuscleGroup = (muscleGroup) => {
  if (!muscleGroup) return 'General'
  if (Array.isArray(muscleGroup)) {
    return muscleGroup.map(item => capitalizeFirstLetter(item)).join(', ')
  }
  return capitalizeFirstLetter(muscleGroup.toString().replace(/[\[\]"]/g, '').replace(/,/g, ', '))
}

const capitalizeFirstLetter = (text) => {
  if (!text) return ''
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
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

/* Media header */
.card-media { position: relative; height: 160px; overflow: hidden; border-radius: 12px 12px 0 0; }
.card-media img { width: 100%; height: 100%; object-fit: cover; display: block; filter: brightness(.9); transition: transform .35s ease, filter .35s ease; }
.workout-set-card:hover .card-media img { transform: scale(1.05); filter: brightness(1); }
.media-gradient { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.0), rgba(0,0,0,0.35)); }
/* Removed quick action overlay buttons over media */

/* Staggered reveal */
.vault-item { animation: vault-fade-up .5s ease both; }
.vault-item:nth-child(1) { animation-delay: .02s; }
.vault-item:nth-child(2) { animation-delay: .06s; }
.vault-item:nth-child(3) { animation-delay: .1s; }
.vault-item:nth-child(4) { animation-delay: .14s; }
@keyframes vault-fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.card-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-subtle);
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  width: 150px;
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
  margin-top: 10px;
}

.workout-stats {
  display: flex;
  flex-direction: column; /* stack rating and duration vertically */
  align-items: flex-start;
  gap: 0.35rem;
  font-size: 0.8rem;
}

.workout-stats .stat span {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text, #fff);
}

.exercise-count {
  white-space: nowrap;
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
  color: white;
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

/* Exercise Badge Styling - Matching Exercise Detail */
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

/* Nuanced charcoal pill theme for badges with color-coded dots */
.exercise-badges .badge {
  position: relative;
  background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
  color: #e9e9e9 !important;
  border: 1px solid rgba(201, 162, 39, 0.28) !important;
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.01em;
  padding: 0.25rem 0.6rem 0.25rem 1.2rem; /* extra space between dot and text */
  width: auto; /* let content decide */
  max-width: 100%;
  justify-self: start; /* prevent grid stretch */
  white-space: nowrap; /* single line */
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
</style>