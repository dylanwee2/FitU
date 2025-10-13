<template>
  <div class="workout-playlists-component">
    <!-- Not Authenticated State -->
    <div v-if="!isAuthenticated" class="empty-state text-center py-5">
      <div class="empty-state-icon mb-3">
        <i class="fas fa-sign-in-alt text-muted" style="font-size: 4rem;"></i>
      </div>
      <h4 class="empty-state-title">Please log in to view your workout sets</h4>
      <p class="empty-state-message">
        You need to be logged in to save and manage your workout sets.
      </p>
      <div class="d-flex gap-2 justify-content-center">
        <router-link to="/login" class="btn btn-primary">
          <i class="fas fa-sign-in-alt me-2"></i>Login
        </router-link>
        <router-link to="/signup" class="btn btn-outline-primary">
          <i class="fas fa-user-plus me-2"></i>Sign Up
        </router-link>
      </div>
    </div>

    <!-- Empty State (Authenticated but no sets) -->
    <div v-else-if="savedPlaylists.length === 0" class="empty-state text-center py-5">
      <div class="empty-state-icon mb-3">
        <i class="fas fa-dumbbell text-muted" style="font-size: 4rem;"></i>
      </div>
      <h4 class="empty-state-title">No workout sets yet</h4>
      <p class="empty-state-message">
        Create your first workout set by adding exercises to your cart and saving them as a playlist.
      </p>
      <router-link to="/exerciselibrary" class="btn btn-primary">
        <i class="fas fa-plus me-2"></i>Browse Exercises
      </router-link>
    </div>

    <!-- Playlists Grid -->
    <div v-else class="playlists-section">
      <div class="row g-4">
        <div 
          v-for="playlist in savedPlaylists" 
          :key="playlist.id"
          class="col-md-6 col-lg-4"
        >
          <div class="playlist-card">
            <!-- Playlist Header -->
            <div class="playlist-header">
              <div class="playlist-title-section">
                <h5 class="playlist-name">{{ playlist.name }}</h5>
                <div class="status-badges">
                  <span 
                    v-if="playlist.isPublished" 
                    class="badge bg-success"
                    title="Published to Community Vault"
                  >
                    Published
                  </span>
                  <span 
                    v-else 
                    class="badge bg-secondary"
                    title="Private workout set"
                  >
                    Private
                  </span>
                </div>
              </div>
              <div class="playlist-actions">
                <button 
                  @click="editPlaylist(playlist)"
                  class="btn btn-sm btn-outline-secondary"
                  title="Edit playlist"
                >
                  <i class="fas fa-edit"></i>Edit Workout
                </button>
                <div class="dropdown">
                  <button 
                    class="btn btn-sm btn-outline-secondary dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    title="More options"
                  >
                    <i class="fas fa-ellipsis-v"></i>
                  </button>
                  <ul class="dropdown-menu">
                    <li>
                      <button 
                        @click="duplicatePlaylist(playlist.id)"
                        class="dropdown-item"
                      >
                        <i class="fas fa-copy me-2"></i>Duplicate
                      </button>
                    </li>
                    <li>
                      <button 
                        @click="showDeleteConfirmation(playlist)"
                        class="dropdown-item text-danger"
                      >
                        <i class="fas fa-trash me-2"></i>Delete
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Playlist Content -->
            <div class="playlist-content">
              <div class="playlist-description">
                <p class="playlist-desc-text">{{ playlist.description || 'No description' }}</p>
              </div>
              
              <div class="playlist-stats">
                <div class="stat-item">
                  <i class="fas fa-dumbbell text-primary"></i>
                  <span>{{ playlist.exercises?.length || 0 }} exercises</span>
                </div>
                <div class="stat-item">
                  <i class="fas fa-clock text-info"></i>
                  <span>{{ formatDuration(playlist.totalDuration) }}</span>
                </div>
                <div class="stat-item">
                  <i class="fas fa-calendar text-success"></i>
                  <span>{{ formatWorkoutDays(playlist.workoutDays) }}</span>
                </div>
              </div>

              <div class="playlist-exercises">
                <div v-if="playlist.exercises && playlist.exercises.length > 0" class="exercise-preview">
                  <div class="exercise-tags">
                    <span 
                      v-for="exercise in playlist.exercises.slice(0, 3)" 
                      :key="exercise.id"
                      class="exercise-tag"
                    >
                      {{ exercise.name }}
                    </span>
                    <span 
                      v-if="playlist.exercises.length > 3" 
                      class="exercise-tag more-exercises"
                    >
                      +{{ playlist.exercises.length - 3 }} more
                    </span>
                  </div>
                </div>
                <div v-else class="no-exercises">
                  <small class="text-muted">No exercises added yet</small>
                </div>
              </div>
            </div>

            <!-- Playlist Footer -->
            <div class="playlist-footer">
              <div class="playlist-buttons">
                <button 
                  @click="viewPlaylist(playlist)"
                  class="btn btn-outline-primary btn-sm"
                >
                  <p class="text-center">View</p>
                </button>
                <button 
                  v-if="!playlist.isPublished"
                  @click="publishToVault(playlist)"
                  class="btn btn-success btn-sm"
                  title="Publish to Community Vault"
                >
                  <p class="text-center">Publish</p>
                </button>
                <button 
                  v-else
                  @click="unpublishFromVault(playlist)"
                  class="btn btn-warning btn-sm"
                  title="Remove from Community Vault"
                >
                  <p class="text-center">Unpublish</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- All the modals from the original component would go here -->
    <!-- Edit Playlist Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Edit Workout Set</h5>
          <button @click="showEditModal = false" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="editPlaylistName" class="form-label">Set Name</label>
            <input 
              v-model="editingPlaylist.name"
              type="text" 
              id="editPlaylistName"
              class="form-control"
              maxlength="50"
            >
          </div>
          
          <div class="form-group">
            <label for="editPlaylistDescription" class="form-label">Description</label>
            <textarea 
              v-model="editingPlaylist.description"
              id="editPlaylistDescription"
              class="form-control"
              rows="3"
              maxlength="200"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Workout Days</label>
            <div class="workout-days-selection">
              <div 
                v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']" 
                :key="day"
                class="day-toggle"
                :class="{ active: editingPlaylist.workoutDays?.includes(day) }"
                @click="toggleWorkoutDay(day)"
              >
                {{ day }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="showEditModal = false" class="btn btn-secondary">Cancel</button>
          <button @click="savePlaylistEdit" class="btn btn-primary">Save Changes</button>
        </div>
      </div>
    </div>

    <!-- Publish Confirmation Modal -->
    <div v-if="showPublishModal" class="modal-overlay" @click.self="showPublishModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Publish to Community Vault</h5>
          <button @click="showPublishModal = false" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <p>Are you sure you want to publish "<strong>{{ publishingPlaylist.name }}</strong>" to the Community Vault?</p>
          <p class="text-muted">Other users will be able to see and copy your workout set.</p>
          
          <div class="form-check">
            <input 
              v-model="confirmPublish"
              class="form-check-input" 
              type="checkbox" 
              id="confirmPublishCheck"
            >
            <label class="form-check-label" for="confirmPublishCheck">
              I confirm that I want to publish this workout set
            </label>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="showPublishModal = false" class="btn btn-secondary">Cancel</button>
          <button 
            @click="confirmPublishToVault"
            class="btn btn-success"
            :disabled="!confirmPublish || publishingInProgress"
          >
            <span v-if="publishingInProgress">
              <i class="fas fa-spinner fa-spin me-2"></i>Publishing...
            </span>
            <span v-else>
              <i class="fas fa-upload me-2"></i>Publish
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Unpublish Confirmation Modal -->
    <div v-if="showUnpublishModal" class="modal-overlay" @click.self="showUnpublishModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Remove from Community Vault</h5>
          <button @click="showUnpublishModal = false" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <p>Are you sure you want to remove "<strong>{{ unpublishingPlaylist.name }}</strong>" from the Community Vault?</p>
          <p class="text-muted">This action will make your workout set private again.</p>
        </div>
        
        <div class="modal-footer">
          <button @click="showUnpublishModal = false" class="btn btn-secondary">Cancel</button>
          <button 
            @click="confirmUnpublishFromVault"
            class="btn btn-warning"
            :disabled="unpublishingInProgress"
          >
            <span v-if="unpublishingInProgress">
              <i class="fas fa-spinner fa-spin me-2"></i>Removing...
            </span>
            <span v-else>
              <i class="fas fa-download me-2"></i>Remove
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Delete Workout Set</h5>
          <button @click="showDeleteModal = false" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <p>Are you sure you want to delete "<strong>{{ deletingPlaylist.name }}</strong>"?</p>
          <p class="text-danger">
            <i class="fas fa-exclamation-triangle me-2"></i>
            This action cannot be undone.
          </p>
        </div>
        
        <div class="modal-footer">
          <button @click="showDeleteModal = false" class="btn btn-secondary">Cancel</button>
          <button 
            @click="confirmDeletePlaylist"
            class="btn btn-danger"
          >
            <i class="fas fa-trash me-2"></i>Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkoutCartStore } from '../stores/workoutCart'
import { workoutVaultService } from '@/services/workoutVaultService.js'
import { auth } from '@/firebase.js'
import { onAuthStateChanged } from 'firebase/auth'

// Props
const props = defineProps({
  title: {
    type: String,
    default: 'My Workout Sets'
  },
  subtitle: {
    type: String,
    default: 'Manage your saved workout collections'
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  maxItems: {
    type: Number,
    default: null
  }
})

// Emits
const emit = defineEmits(['playlist-selected', 'playlist-edited', 'playlist-published', 'playlist-unpublished'])

const router = useRouter()
const cartStore = useWorkoutCartStore()

// Local state
const showEditModal = ref(false)
const showPublishModal = ref(false)
const showUnpublishModal = ref(false)
const showDeleteModal = ref(false)
const editingPlaylist = ref({})
const publishingPlaylist = ref({})
const unpublishingPlaylist = ref({})
const deletingPlaylist = ref({})
const confirmPublish = ref(false)
const publishingInProgress = ref(false)
const unpublishingInProgress = ref(false)
const isAuthenticated = ref(!!auth.currentUser)
const authUnsubscribe = ref(null)

// Computed properties
const savedPlaylists = computed(() => {
  const playlists = cartStore.savedPlaylists || []
  return props.maxItems ? playlists.slice(0, props.maxItems) : playlists
})

// Authentication check method
const checkPublishedStatus = async () => {
  if (!auth.currentUser) {
    console.log('No current user, skipping published status check')
    return
  }

  console.log('Checking published status for user:', auth.currentUser.uid)

  try {
    // Get user's workout sets from 'workoutSets' collection
    const userWorkouts = await workoutVaultService.getUserWorkouts(auth.currentUser.uid)
    console.log('User workouts from workoutSets:', userWorkouts)
    
    // Get user's published workouts from 'publishedWorkouts' collection
    const publishedWorkouts = await workoutVaultService.getPublishedWorkoutsByUser(auth.currentUser.uid)
    console.log('Published workouts from publishedWorkouts:', publishedWorkouts)
    
    // Create a map of originalId -> publishedWorkout for quick lookup
    const publishedMap = new Map()
    publishedWorkouts.forEach(published => {
      if (published.originalId) {
        publishedMap.set(published.originalId, published)
      }
    })
    
    // Update local playlist status based on Firebase data
    for (const userWorkout of userWorkouts) {
      const localPlaylist = savedPlaylists.value.find(p => p.id === userWorkout.id)
      if (localPlaylist) {
        // Check if this workout is published by looking for it in publishedWorkouts
        const isActuallyPublished = publishedMap.has(userWorkout.id)
        const publishedWorkout = publishedMap.get(userWorkout.id)
        
        console.log(`Checking workout ${userWorkout.id}:`, {
          localPublished: localPlaylist.isPublished,
          firebaseUserWorkoutPublished: userWorkout.isPublished,
          actuallyPublished: isActuallyPublished,
          publishedWorkout: publishedWorkout
        })
        
        // Update the status based on whether it's actually in the publishedWorkouts collection
        if (localPlaylist.isPublished !== isActuallyPublished) {
          console.log(`Updating playlist ${userWorkout.id} published status to ${isActuallyPublished}`)
          await cartStore.updatePlaylist(userWorkout.id, {
            isPublished: isActuallyPublished,
            publishedId: publishedWorkout?.id || null,
            publishedAt: publishedWorkout?.publishedAt || null
          })
        }
      }
    }
  } catch (error) {
    console.error('Error checking published status:', error)
  }
}

// Watch for both auth state and saved playlists to check published status
watch([() => auth.currentUser, savedPlaylists], async ([user, playlists]) => {
  if (user && playlists.length > 0) {
    await checkPublishedStatus()
    await updateWorkoutDurations(playlists)
  }
}, { immediate: true })

// Update workout durations for existing workouts
const updateWorkoutDurations = async (playlists) => {
  for (const playlist of playlists) {
    if (playlist.exercises && playlist.exercises.length > 0) {
      const currentDuration = playlist.totalDuration || 0
      const calculatedDuration = calculateWorkoutDuration(playlist.exercises)
      
      // Update if duration is significantly different (accounting for old calculation method)
      if (Math.abs(currentDuration - calculatedDuration) > 5) {
        console.log(`Updating duration for ${playlist.name}: ${currentDuration} -> ${calculatedDuration}`)
        try {
          await cartStore.updatePlaylist(playlist.id, {
            totalDuration: calculatedDuration
          })
        } catch (error) {
          console.error('Error updating workout duration:', error)
        }
      }
    }
  }
}

const formatDuration = (minutes) => {
  if (!minutes || minutes === 0) return '0 min'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

const formatWorkoutDays = (days) => {
  if (!days || days.length === 0) return 'No schedule'
  if (days.length === 7) return 'Daily'
  if (days.length === 1) return days[0]
  return `${days.length} days/week`
}

const calculateWorkoutDuration = (exercises) => {
  if (!exercises || exercises.length === 0) return 0
  // Simple calculation: assume 3 minutes per exercise plus 1 minute rest
  return exercises.length * 4
}

// CRUD operations
const editPlaylist = (playlist) => {
  editingPlaylist.value = { ...playlist }
  showEditModal.value = true
}

const toggleWorkoutDay = (day) => {
  if (!editingPlaylist.value.workoutDays) {
    editingPlaylist.value.workoutDays = []
  }
  const index = editingPlaylist.value.workoutDays.indexOf(day)
  if (index > -1) {
    editingPlaylist.value.workoutDays.splice(index, 1)
  } else {
    editingPlaylist.value.workoutDays.push(day)
  }
}

const savePlaylistEdit = async () => {
  try {
    await cartStore.updatePlaylist(editingPlaylist.value.id, {
      name: editingPlaylist.value.name,
      description: editingPlaylist.value.description,
    })
    showEditModal.value = false
    editingPlaylist.value = {}
    emit('playlist-edited', editingPlaylist.value)
  } catch (error) {
    console.error('Error updating playlist:', error)
    alert('Error updating workout set: ' + error.message)
  }
}

const viewPlaylist = (playlist) => {
  router.push(`/workout-sets`)
  emit('playlist-selected', playlist)
}

const duplicatePlaylist = async (playlistId) => {
  try {
    await cartStore.duplicatePlaylist(playlistId)
  } catch (error) {
    console.error('Error duplicating playlist:', error)
    alert('Error duplicating workout set: ' + error.message)
  }
}

const showDeleteConfirmation = (playlist) => {
  deletingPlaylist.value = { ...playlist }
  showDeleteModal.value = true
}

const confirmDeletePlaylist = async () => {
  try {
    await cartStore.deletePlaylist(deletingPlaylist.value.id)
    showDeleteModal.value = false
    deletingPlaylist.value = {}
  } catch (error) {
    console.error('Error deleting playlist:', error)
    alert('Error deleting workout set: ' + error.message)
  }
}

// Publish/Unpublish operations
const publishToVault = async (playlist) => {
  if (!auth.currentUser) {
    alert('You must be logged in to publish workouts')
    return
  }

  publishingPlaylist.value = { ...playlist }
  confirmPublish.value = false
  showPublishModal.value = true
}

const confirmPublishToVault = async () => {
  if (!confirmPublish.value || publishingInProgress.value) return

  publishingInProgress.value = true

  try {
    const result = await workoutVaultService.publishWorkout(publishingPlaylist.value.id, auth.currentUser.uid)
    
    // Update the local playlist to reflect published status
    await cartStore.updatePlaylist(publishingPlaylist.value.id, {
      isPublished: true,
      publishedId: result.id,
      publishedAt: new Date().toISOString()
    })
    
    showPublishModal.value = false
    publishingPlaylist.value = {}
    confirmPublish.value = false
    emit('playlist-published', result)
  } catch (error) {
    console.error('Error publishing workout:', error)
    alert('Failed to publish workout: ' + error.message)
  } finally {
    publishingInProgress.value = false
  }
}

const unpublishFromVault = async (playlist) => {
  if (!auth.currentUser) {
    alert('You must be logged in to unpublish workouts')
    return
  }

  unpublishingPlaylist.value = { ...playlist }
  showUnpublishModal.value = true
}

const confirmUnpublishFromVault = async () => {
  if (unpublishingInProgress.value) return

  unpublishingInProgress.value = true

  try {
    // We need the published workout ID, which should be stored in the playlist
    if (unpublishingPlaylist.value.publishedId) {
      await workoutVaultService.unpublishWorkout(unpublishingPlaylist.value.publishedId, auth.currentUser.uid)
    }
    
    // Update the local playlist to reflect unpublished status
    await cartStore.updatePlaylist(unpublishingPlaylist.value.id, {
      isPublished: false,
      publishedAt: null,
      publishedId: null
    })
    
    showUnpublishModal.value = false
    unpublishingPlaylist.value = {}
    emit('playlist-unpublished', unpublishingPlaylist.value)
  } catch (error) {
    console.error('Error unpublishing workout:', error)
    alert('Failed to remove workout from vault: ' + error.message)
  } finally {
    unpublishingInProgress.value = false
  }
}

// Initialize
onMounted(() => {
  cartStore.initializeStore()
  
  // Listen for authentication state changes
  authUnsubscribe.value = onAuthStateChanged(auth, (user) => {
    isAuthenticated.value = !!user
    if (user) {
      // User is signed in, check published status
      checkPublishedStatus()
    }
  })
})

// Cleanup on unmount
onUnmounted(() => {
  if (authUnsubscribe.value) {
    authUnsubscribe.value()
  }
})
</script>

<style scoped>
.workout-playlists-component {
  min-height: 400px;
}

/* Header */
.header-section {
  text-align: center;
  padding: 1rem 0;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1rem;
  color: #6c757d;
  margin-bottom: 0;
}

/* Empty State */
.empty-state {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.empty-state-title {
  color: #495057;
  margin-bottom: 1rem;
}

.empty-state-message {
  color: #6c757d;
  margin-bottom: 2rem;
  max-width: 500px;
}

/* Playlist Cards */
.playlist-card {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.playlist-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #007bff;
}

.playlist-header {
  padding: 1rem;
  border-bottom: 1px solid #f1f3f4;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.playlist-title-section {
  flex: 1;
}

.playlist-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  line-height: 1.3;
}

.status-badges {
  margin-bottom: 0.5rem;
}

.playlist-actions {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.playlist-content {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.playlist-desc-text {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.playlist-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #495057;
}

.stat-item i {
  width: 16px;
  text-align: center;
}

.exercise-preview {
  margin-top: auto;
}

.exercise-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.exercise-tag {
  background: #f8f9fa;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  border: 1px solid #e9ecef;
}

.exercise-tag.more-exercises {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.no-exercises {
  margin-top: auto;
  text-align: center;
  padding: 1rem 0;
}

.playlist-footer {
  padding: 1rem;
  border-top: 1px solid #f1f3f4;
  background: #f8f9fa;
}

.playlist-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.75rem;
}

.playlist-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.playlist-buttons .btn {
  flex: 1;
  min-width: 70px;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem 1.5rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #adb5bd;
  cursor: pointer;
  padding: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #495057;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 0 1.5rem 1.5rem;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.form-control {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.9rem;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.workout-days-selection {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.day-toggle {
  padding: 0.5rem 1rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
  user-select: none;
}

.day-toggle:hover {
  border-color: #007bff;
  background: #f8f9fa;
}

.day-toggle.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.form-check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.form-check-input {
  width: 1rem;
  height: 1rem;
}

.form-check-label {
  font-size: 0.9rem;
  color: #495057;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 768px) {
  .playlist-buttons {
    flex-direction: column;
  }
  
  .playlist-buttons .btn {
    width: 100%;
  }
  
  .modal-content {
    margin: 1rem;
    width: calc(100% - 2rem);
  }
}
</style>