<template>
  <div class="workout-playlists-component">
    <div v-if="!isAuthenticated" class="empty-state text-center py-5">
      <div class="empty-state-icon mb-3">
        <i class="fas fa-sign-in-alt text-muted" style="font-size: 4rem;"></i>
      </div>
      <h4 class="empty-state-title">Please log in to view your workout sets</h4>
      <p class="empty-state-message">
        You need to be logged in to save and manage your workout sets.
      </p>
      <div class="d-flex gap-2 justify-content-center">
        <router-link to="/signup" class="u-btn u-btn--primary">
          Sign Up
        </router-link>
        <router-link to="/login" class="u-btn" style="border: 1px solid grey;">
          Login
        </router-link>
      </div>
    </div>

    <div v-else-if="savedPlaylists.length === 0" class="empty-state text-center py-5">
      <div class="empty-state-icon mb-3">
        <i class="fas fa-dumbbell text-muted" style="font-size: 4rem;"></i>
      </div>
      <h4 class="empty-state-title">No workout sets yet</h4>
      <p class="empty-state-message">
        Create your first workout set by adding exercises to your cart and saving them as a playlist.
      </p>
      <router-link to="/exerciselibrary" class="u-btn u-btn--primary">
        Browse Exercises
      </router-link>
    </div>

    <div v-else class="playlists-section">
      <div class="row g-4">
        <div 
          v-for="playlist in savedPlaylists" 
          :key="playlist.id"
          class="col-md-12 col-lg-12 col-xl-12"
        >
          <div 
            class="playlist-card"
            draggable="true"
            @dragstart="handleDragStart($event, playlist)"
            @dragend="handleDragEnd"
          >
            <div 
              data-transfer 
              :data-transfer="JSON.stringify({ type: 'workout', workout: playlist })" 
              style="display: none;"
            ></div>
            <div class="playlist-header">
              <div class="playlist-title-section">
                <div class="title-with-drag">
                  <i class="fas fa-grip-vertical drag-handle" title="Drag to calendar to schedule"></i>
                  <h5 class="playlist-name">{{ playlist.name }}</h5>
                </div>
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
                  class="u-btn u-btn--secondary"
                  title="Edit playlist"
                  aria-label="Edit workout"
                  style="padding:8px;"
                >
                  <i class="bi bi-pencil" aria-hidden="true"></i>
                  <span class="visually-hidden">Edit Workout</span>
                </button>
                <div class="dropdown">
                  <button 
                    class="btn btn-sm btn-outline-secondary dropdown-toggle"
                    type="button"
                    title="More options"
                    @click.stop="toggleActions(playlist)"
                  >
                    
                    <span class="visually-hidden">More options</span>
                  </button>
                  <ul 
                    class="dropdown-menu u-card" 
                    :class="{ show: openMenuForId === playlist.id }" 
                    style="position: absolute;"
                    @keydown.esc.stop.prevent="closeActions()"
                  >
                    <li>
                      <button 
                        @click.stop="handleDuplicate(playlist.id); closeActions()"
                        class="dropdown-item u-muted"
                        type="button"
                      >
                        Duplicate
                      </button>
                    </li>
                    <li>
                      <button 
                        @click.stop="showDeleteConfirmation(playlist); closeActions()"
                        class="dropdown-item text-danger"
                        type="button"
                      >
                        Delete
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

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
                  <span>{{ formatPlaylistDuration(playlist) }}</span>
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
                      {{ formatExerciseName(exercise.name) }}
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

            <div class="playlist-footer">
              <div class="playlist-buttons">
                <button 
                  @click="viewPlaylist(playlist)"
                  class="u-btn u-btn--primary"
                >
                  View
                </button>
                <button 
                  @click="openScheduleModal(playlist)"
                  class="u-btn u-btn--secondary"
                  title="Schedule this workout"
                >
                  Schedule
                </button>
                <button 
                  v-if="!playlist.isPublished"
                  @click="publishToVault(playlist)"
                  class="u-btn u-btn--close"
                  title="Publish to Community Vault"
                >
                  Publish
                </button>
                <button 
                  v-else
                  @click="unpublishFromVault(playlist)"
                  class="u-btn u-btn--danger"
                  title="Remove from Community Vault"
                >
                  Unpublish
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-content" style="background-color: var(--bg);">
        <div class="modal-header">
          <h5 class="modal-title">Edit Workout Set</h5>
          <button @click="showEditModal = false" class="btn-close-white btn-close">
          </button>
        </div>
        
        <div class="modal-body">
          <div class="row">
            <div class="col-md-6">
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
                <label class="form-label">Current Exercises ({{ editingPlaylist.exercises?.length || 0 }})</label>
                <div v-if="editingPlaylist.exercises && editingPlaylist.exercises.length > 0" class="current-exercises">
                  <div 
                    v-for="(exercise, index) in editingPlaylist.exercises" 
                    :key="exercise.id || index"
                    class="exercise-item"
                  >
                    <div class="exercise-info">
                      <h6 class="exercise-name">{{ formatExerciseName(exercise.name) }}</h6>
                      <p class="exercise-target">{{ formatTarget(exercise.target) }}</p>
                    </div>
                    <button 
                      @click="removeExerciseFromPlaylist(index)"
                      class="btn btn-sm btn-danger"
                      type="button"
                    >
                    Remove 
                    </button>
                  </div>
                </div>
                <div v-else class="text-muted">
                  No exercises in this workout set yet.
                </div>
              </div>
            </div>

            <!-- Right Column - Exercise Search -->
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label">Add Exercises</label>
                <div class="search-container">
                  <div class="input-group">
                    <input
                      v-model="searchQuery"
                      @input="handleSearch"
                      type="text"
                      class="form-control"
                      placeholder="Search exercises by name (e.g., push-up, squat, bicep)..."
                    >
                    <button 
                      v-if="searchQuery" 
                      @click="clearSearch" 
                      class="btn btn-outline-secondary"
                      type="button"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>

                <!-- Search Results -->
                <div v-if="searchLoading" class="search-loading text-center py-3">
                  <div class="spinner-border spinner-border-sm me-2"></div>
                  Searching exercises...
                </div>

                <div v-else-if="searchError" class="alert alert-danger mt-2">
                  {{ searchError }}
                </div>

                <div v-else-if="searchedExercises.length > 0" class="search-results mt-3">
                  <div 
                    v-for="exercise in searchedExercises.slice(0, 8)" 
                    :key="exercise.id"
                    class="search-result-item"
                  >
                    <div class="exercise-info">
                      <h6 class="exercise-name">{{ formatExerciseName(exercise.name) }}</h6>
                      <p class="exercise-target">{{ formatTarget(exercise.target) }} • {{ formatBodyPart(exercise.bodyPart) }}</p>
                      <p class="exercise-equipment">{{ formatEquipment(exercise.equipment) }}</p>
                    </div>
                    <button 
                      @click="addExerciseToPlaylist(exercise)"
                      :disabled="isExerciseInPlaylist(exercise.id)"
                      class="btn btn-sm u-btn--primary"
                      type="button"
                    >
                      {{ isExerciseInPlaylist(exercise.id) ? 'Added' : 'Add' }}
                    </button>
                  </div>
                  <div v-if="searchedExercises.length > 8" class="text-muted text-center mt-2">
                    Showing first 8 results. Refine search for more specific results.
                  </div>
                </div>

                <div v-else-if="!searchQuery && !searchLoading && searchedExercises.length === 0" class="default-exercises">
                  <h6 class="text-muted">Popular Exercises</h6>
                  <div 
                    v-for="exercise in searchedExercises.slice(0, 8)" 
                    :key="exercise.id"
                    class="search-result-item"
                  >
                    <div class="exercise-info">
                      <h6 class="exercise-name">{{ formatExerciseName(exercise.name) }}</h6>
                      <p class="exercise-target">{{ formatTarget(exercise.target) }} • {{ formatBodyPart(exercise.bodyPart) }}</p>
                      <p class="exercise-equipment">{{ formatEquipment(exercise.equipment) }}</p>
                    </div>
                    <button 
                      @click="addExerciseToPlaylist(exercise)"
                      :disabled="isExerciseInPlaylist(exercise.id)"
                      class="btn btn-sm btn-primary"
                      type="button"
                    >
                      <i class="fas fa-plus me-1"></i>
                      {{ isExerciseInPlaylist(exercise.id) ? 'Added' : 'Add' }}
                    </button>
                  </div>
                </div>

                <div v-else-if="searchQuery && !searchLoading && searchedExercises.length === 0" class="text-muted text-center py-3">
                  No exercises found for "{{ searchQuery }}". Try different keywords.
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="showEditModal = false" class="u-btn u-btn--secondary">Cancel</button>
          <button @click="savePlaylistEdit" class="u-btn u-btn--primary">Save Changes</button>
        </div>
      </div>
    </div>

    <!-- Publish Confirmation Modal -->
    <div v-if="showPublishModal" class="modal-overlay" @click.self="showPublishModal = false">
      <div class="modal-content" style="background-color: var(--bg);">
        <div class="modal-header">
          <h5 class="modal-title">Publish to Community Vault</h5>
          <button @click="showPublishModal = false" class="btn-close-white btn-close">
          </button>
        </div>
        
        <div class="modal-body">
          <p>Are you sure you want to publish "<strong>{{ publishingPlaylist.name }}</strong>" to the Community Vault?</p>
          <p class="u-muted">Other users will be able to see and copy your workout set.</p>
          
          <div class="form-check">
            <input 
              v-model="confirmPublish"
              class="" 
              type="checkbox" 
              id="confirmPublishCheck"
            >
            <label class="form-check-label" for="confirmPublishCheck">
              I confirm that I want to publish this workout set
            </label>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="showPublishModal = false" class="u-btn u-btn--secondary">Cancel</button>
          <button 
            @click="confirmPublishToVault"
            class="btn btn-success"
            :disabled="!confirmPublish || publishingInProgress"
          >
            <span v-if="publishingInProgress">
              Publishing...
            </span>
            <span v-else>
              Publish
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Unpublish Confirmation Modal -->
    <div v-if="showUnpublishModal" class="modal-overlay" @click.self="showUnpublishModal = false">
      <div class="modal-content" style="background-color: var(--bg);">
        <div class="modal-header">
          <h5 class="modal-title">Remove from Community Vault</h5>
          <button @click="showUnpublishModal = false" class="btn-close-white btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <p>Are you sure you want to remove "<strong>{{ unpublishingPlaylist.name }}</strong>" from the Community Vault?</p>
          <p class="u-muted">This action will make your workout set private again.</p>
        </div>
        
        <div class="modal-footer">
          <button @click="showUnpublishModal = false" class="u-btn u-btn--secondary">Cancel</button>
          <button 
            @click="confirmUnpublishFromVault"
            class="u-btn u-btn--danger"
            :disabled="unpublishingInProgress"
          >
            <span v-if="unpublishingInProgress">
              Removing...
            </span>
            <span v-else>
              Remove
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false" style="position: fixed; inset: 0; z-index: 1056;">
      <div class="modal-content" style="background-color: var(--bg); position: relative; z-index: 1057;">
        <div class="modal-header">
          <h5 class="modal-title">Delete Workout Set</h5>
          <button @click="showDeleteModal = false" class="btn-close-white btn-close">
          </button>
        </div>
        
        <div class="modal-body">
          <p>Are you sure you want to delete "<strong>{{ deletingPlaylist.name }}</strong>"?</p>
          <p class="text-danger">
            This action cannot be undone.
          </p>
        </div>
        
        <div class="modal-footer">
          <button @click="showDeleteModal = false" class="u-btn u-btn--secondary">Cancel</button>
          <button 
            @click="confirmDeletePlaylist"
            class="btn btn-danger"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Schedule Workout Modal -->
    <div v-if="showScheduleModal" class="modal-overlay" @click.self="closeScheduleModal">
      <div class="modal-content" style="background-color: var(--bg);">
        <div class="modal-header">
          <h5 class="modal-title">Schedule Workout</h5>
          <button @click="closeScheduleModal" class="btn-close-white btn-close">
          </button>
        </div>
        
        <div class="modal-body">
          <div class="workout-info mb-3">
            <h6 class="text-primary">{{ schedulingWorkout.name }}</h6>
            <p class="u-muted mb-1">{{ schedulingWorkout.exercises?.length || 0 }} exercises</p>
            <p class="u-muted">Estimated duration: {{ formatWorkoutDuration(workoutScheduleData.duration) }}</p>
          </div>
          
          <div class="form-group mb-3">
            <label for="workoutDate" class="form-label text-white">Date</label>
            <input 
              v-model="workoutScheduleData.date"
              type="date" 
              id="workoutDate"
              class="form-control"
              required 
            />
          </div>
          
          <div class="form-group mb-3">
            <label for="workoutStartTime" class="form-label text-white">Start Time</label>
            <input 
              v-model="workoutScheduleData.startTime"
              type="time" 
              id="workoutStartTime"
              class="form-control"
              required 
            />
          </div>
          
          <div class="info-box">
            <p class="mb-1"><strong>End time will be:</strong></p>
            <p class="text-info">{{ calculateEndTime() }}</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeScheduleModal" class="u-btn u-btn--secondary" :disabled="schedulingInProgress">Cancel</button>
          <button 
            @click="scheduleWorkout"
            class="u-btn u-btn--primary"
            :disabled="schedulingInProgress"
          >
            <span v-if="schedulingInProgress">
              <i class="fas fa-spinner fa-spin me-1"></i>
              Scheduling...
            </span>
            <span v-else>
              Schedule Workout
            </span>
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
import { formatDuration as formatWorkoutDuration } from '@/types/workout.js'

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

const emit = defineEmits(['playlist-selected', 'playlist-edited', 'playlist-published', 'playlist-unpublished', 'workout-scheduled'])

const router = useRouter()
const cartStore = useWorkoutCartStore()
const openMenuForId = ref(null)
const toggleActions = (playlist) => {
  openMenuForId.value = openMenuForId.value === playlist.id ? null : playlist.id
}
const closeActions = () => { openMenuForId.value = null }

onMounted(() => {
  const onBodyClick = () => closeActions()
  document.addEventListener('click', onBodyClick)
  onUnmounted(() => document.removeEventListener('click', onBodyClick))
})

const handleDuplicate = async (playlistId) => {
  try {
    await cartStore.duplicatePlaylist(playlistId)
  } catch (error) {
    console.error('Error duplicating playlist:', error)
    alert('Error duplicating workout set: ' + (error?.message || 'Unknown error'))
  }
}


const showEditModal = ref(false)
const showPublishModal = ref(false)
const showUnpublishModal = ref(false)
const showDeleteModal = ref(false)
const showScheduleModal = ref(false)
const editingPlaylist = ref({})
const publishingPlaylist = ref({})
const unpublishingPlaylist = ref({})
const deletingPlaylist = ref({})
const schedulingWorkout = ref({})
const workoutScheduleData = ref({
  startTime: '',
  date: '',
  duration: 0
})
const confirmPublish = ref(false)
const publishingInProgress = ref(false)
const unpublishingInProgress = ref(false)
const schedulingInProgress = ref(false)
const isAuthenticated = ref(!!auth.currentUser)
const authUnsubscribe = ref(null)

const searchQuery = ref('')
const searchedExercises = ref([])
const searchLoading = ref(false)
const searchTimeout = ref(null)
const searchError = ref('')

const API_BASE_URL = 'https://www.exercisedb.dev/api/v1'
const EXERCISES_PER_PAGE = 12

const savedPlaylists = computed(() => {
  const playlists = cartStore.savedPlaylists || []
  return props.maxItems ? playlists.slice(0, props.maxItems) : playlists
})

const checkPublishedStatus = async () => {
  if (!auth.currentUser) {
    console.log('No current user, skipping published status check')
    return
  }

  // console.log('Checking published status for user:', auth.currentUser.uid)

  try {
    const userWorkouts = await workoutVaultService.getUserWorkouts(auth.currentUser.uid)
    const publishedWorkouts = await workoutVaultService.getPublishedWorkoutsByUser(auth.currentUser.uid)
    const publishedMap = new Map()
    publishedWorkouts.forEach(published => {
      if (published.originalId) {
        publishedMap.set(published.originalId, published)
      }
    })
    
    for (const userWorkout of userWorkouts) {
      const localPlaylist = savedPlaylists.value.find(p => p.id === userWorkout.id)
      if (localPlaylist) {
        const isActuallyPublished = publishedMap.has(userWorkout.id)
        const publishedWorkout = publishedMap.get(userWorkout.id)
        
        if (localPlaylist.isPublished !== isActuallyPublished) {
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

watch([() => auth.currentUser, savedPlaylists], async ([user, playlists]) => {
  if (user && playlists.length > 0) {
    await checkPublishedStatus()
    await updateWorkoutDurations(playlists)
  }
}, { immediate: true })

const updateWorkoutDurations = async (playlists) => {
  for (const playlist of playlists) {
    if (playlist.exercises && playlist.exercises.length > 0) {
      const currentDuration = playlist.totalDuration || 0
      const calculatedDuration = calculateWorkoutDuration(playlist.exercises)
      
      if (Math.abs(currentDuration - calculatedDuration) > 5) {
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

const formatPlaylistDuration = (playlist) => {
  let totalMinutes = 0;
  if (playlist.exercises && playlist.exercises.length > 0) {
    totalMinutes = playlist.exercises.reduce((total, exercise) => {
      const sets = exercise.sets || 3; 
      return total + (sets * 5); 
    }, 0);
  } else if (playlist.totalDuration) {
    totalMinutes = playlist.totalDuration;
  }
  
  if (totalMinutes === 0 && playlist.exercises && playlist.exercises.length > 0) {
    totalMinutes = playlist.exercises.length * 3 * 5;
  }
  
  return formatWorkoutDuration(totalMinutes);
}

const formatWorkoutDays = (days) => {
  if (!days || days.length === 0) return 'No schedule'
  if (days.length === 7) return 'Daily'
  if (days.length === 1) return days[0]
  return `${days.length} days/week`
}

const calculateWorkoutDuration = (exercises) => {
  if (!exercises || exercises.length === 0) return 0
  return exercises.reduce((total, exercise) => {
    const sets = exercise.sets || 3; 
    return total + (sets * 5); 
  }, 0);
}

const fetchExercises = async (query = '') => {
  if (searchLoading.value) return
  
  searchLoading.value = true
  searchError.value = ''
  
  try {
    const baseUrl = `${API_BASE_URL}/exercises`
    const params = new URLSearchParams({
      limit: EXERCISES_PER_PAGE,
      offset: 0
    })
    
    if (query.trim()) {
      params.append('search', query.trim())
    }
    
    const response = await fetch(`${baseUrl}?${params}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch exercises: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    if (data.success && data.data) {
      const mappedExercises = data.data.map(exercise => ({
        id: exercise.exerciseId,
        name: exercise.name,
        target: exercise.targetMuscles,
        bodyPart: exercise.bodyParts,
        equipment: exercise.equipments,
        gifUrl: exercise.gifUrl,
        instructions: exercise.instructions ? (
          typeof exercise.instructions === 'string' 
            ? exercise.instructions.split('Step:').filter(step => step.trim()).map(step => step.trim())
            : exercise.instructions
        ) : [],
        secondaryMuscles: exercise.secondaryMuscles ? (
          typeof exercise.secondaryMuscles === 'string'
            ? exercise.secondaryMuscles.split(' ')
            : exercise.secondaryMuscles
        ) : []
      }))
      
      searchedExercises.value = mappedExercises
    } else {
      searchedExercises.value = Array.isArray(data) ? data : (data.exercises || [])
    }
    
  } catch (err) {
    console.error('Error fetching exercises:', err)
    searchError.value = err.message || 'Failed to load exercises. Please check your internet connection and try again.'
    searchedExercises.value = []
  } finally {
    searchLoading.value = false
  }
}

const handleSearch = () => {
  clearTimeout(searchTimeout.value)
  
  searchTimeout.value = setTimeout(() => {
    if (searchQuery.value.trim()) {
      fetchExercises(searchQuery.value.trim())
    } else {
      clearSearch()
    }
  }, 500)
}

const clearSearch = () => {
  searchQuery.value = ''
  searchedExercises.value = []
  searchError.value = ''
}

const formatExerciseName = (name) => {
  if (!name) return 'Exercise'
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const formatTarget = (target) => {
  if (!target) return 'Full Body'
  if (Array.isArray(target)) {
    return target.join(', ')
  }
  return target.toString().replace(/[\[\]"]/g, '').replace(/,/g, ', ')
}

const formatBodyPart = (bodyPart) => {
  if (!bodyPart) return 'General'
  if (Array.isArray(bodyPart)) {
    return bodyPart.join(', ')
  }
  return bodyPart.toString().replace(/[\[\]"]/g, '').replace(/,/g, ', ')
}

const formatEquipment = (equipment) => {
  if (!equipment) return 'Bodyweight'
  if (Array.isArray(equipment)) {
    return equipment.join(', ')
  }
  return equipment.toString().replace(/[\[\]"]/g, '').replace(/,/g, ', ')
}

const addExerciseToPlaylist = (exercise) => {
  if (!editingPlaylist.value.exercises) {
    editingPlaylist.value.exercises = []
  }
  
  const exists = editingPlaylist.value.exercises.some(ex => ex.id === exercise.id)
  if (!exists) {
    editingPlaylist.value.exercises.push({
      id: exercise.id,
      name: exercise.name,
      target: exercise.target,
      bodyPart: exercise.bodyPart,
      equipment: exercise.equipment,
      gifUrl: exercise.gifUrl,
      instructions: exercise.instructions,
      secondaryMuscles: exercise.secondaryMuscles
    })
  }
}

const removeExerciseFromPlaylist = (index) => {
  if (editingPlaylist.value.exercises && index >= 0 && index < editingPlaylist.value.exercises.length) {
    editingPlaylist.value.exercises.splice(index, 1)
  }
}

const isExerciseInPlaylist = (exerciseId) => {
  return editingPlaylist.value.exercises?.some(ex => ex.id === exerciseId) || false
}

const editPlaylist = (playlist) => {
  editingPlaylist.value = { ...playlist, exercises: [...(playlist.exercises || [])] }
  clearSearch() 
  fetchExercises() 
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
    const updatedDuration = calculateWorkoutDuration(editingPlaylist.value.exercises || [])
    
    await cartStore.updatePlaylist(editingPlaylist.value.id, {
      name: editingPlaylist.value.name,
      description: editingPlaylist.value.description,
      exercises: editingPlaylist.value.exercises || [],
      totalDuration: updatedDuration
    })
    showEditModal.value = false
    clearSearch() 
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
    const userDisplayName = auth.currentUser?.displayName || 'Anonymous'
    
    const result = await workoutVaultService.publishWorkout(
      publishingPlaylist.value.id, 
      auth.currentUser.uid, 
      userDisplayName
    )
    
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
    if (unpublishingPlaylist.value.publishedId) {
      await workoutVaultService.unpublishWorkout(unpublishingPlaylist.value.publishedId, auth.currentUser.uid)
    }
    
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

const handleDragStart = (event, playlist) => {
  const workoutData = {
    type: 'workout',
    workout: playlist
  }
  
  event.dataTransfer.setData('text/plain', JSON.stringify(workoutData))
  event.dataTransfer.effectAllowed = 'copy'
  
  event.target.setAttribute('data-workout', JSON.stringify(playlist))
  
  event.target.classList.add('dragging')
}

const handleDragEnd = (event) => {
  event.target.classList.remove('dragging')
  
  event.target.removeAttribute('data-workout')
}

const openScheduleModal = (workout, date = null, time = null) => {
  schedulingWorkout.value = workout
  
  const durationMinutes = calculateWorkoutDuration(workout.exercises)
  
  const now = new Date()
  const defaultDate = date || now.toISOString().split('T')[0]
  const defaultTime = time || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  
  workoutScheduleData.value = {
    startTime: defaultTime,
    date: defaultDate,
    duration: durationMinutes
  }
  
  showScheduleModal.value = true
}

const closeScheduleModal = () => {
  showScheduleModal.value = false
  schedulingInProgress.value = false
  schedulingWorkout.value = {}
  workoutScheduleData.value = {
    startTime: '',
    date: '',
    duration: 0
  }
}

const calculateEndTime = () => {
  const { date, startTime, duration } = workoutScheduleData.value
  
  if (!date || !startTime || !duration) {
    return 'Please select date and time'
  }
  
  try {
    const startDateTime = `${date}T${startTime}`
    const startDate = new Date(startDateTime)
    const endDate = new Date(startDate.getTime() + (duration * 60 * 1000))
    
    return endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch (error) {
    return 'Invalid date/time'
  }
}

const scheduleWorkout = async () => {
  const { date, startTime, duration } = workoutScheduleData.value
  
  if (!date || !startTime) {
    alert('Please select both date and time')
    return
  }
  
  if (!schedulingWorkout.value || !schedulingWorkout.value.name) {
    alert('Invalid workout data')
    return
  }
  
  schedulingInProgress.value = true
  
  try {
    const startDateTime = `${date}T${startTime}`
    const startDate = new Date(startDateTime)
    
    if (isNaN(startDate.getTime())) {
      throw new Error('Invalid date or time')
    }
    
    const endDate = new Date(startDate.getTime() + (duration * 60 * 1000)) 
    
    emit('workout-scheduled', {
      workout: schedulingWorkout.value,
      event: {
        title: `Workout: ${schedulingWorkout.value.name}`,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        description: `${schedulingWorkout.value.description || ''}\n\nExercises: ${schedulingWorkout.value.exercises?.length || 0}\nDuration: ${formatWorkoutDuration(duration)}`,
        extendedProps: {
          workoutId: schedulingWorkout.value.id,
          workoutType: 'scheduled',
          exercises: schedulingWorkout.value.exercises
        }
      }
    })
    
    closeScheduleModal()
  } catch (error) {
    console.error('Error scheduling workout:', error)
    alert('Failed to schedule workout: ' + (error.message || 'Unknown error'))
  } finally {
    schedulingInProgress.value = false
  }
}

onMounted(() => {
  cartStore.initializeStore()
  
  authUnsubscribe.value = onAuthStateChanged(auth, (user) => {
    isAuthenticated.value = !!user
    if (user) {
      checkPublishedStatus()
    }
  })
})

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

.playlist-card {
  background: var(--surface-subtle);
  border-radius: 12px;
  overflow: visible;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.playlist-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.playlist-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-subtle);
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
  line-height: 1.3;
}

.status-badges {
  margin-bottom: 0.5rem;
}

.playlist-actions {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  position: relative;
}

.dropdown-menu.u-card {
  z-index: 1060;
}

.dropdown-menu.u-card.show {
  display: block;
  right: 0;
  left: auto;
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
  color: var(--muted);
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
  background: #171717;
  color: var(--muted);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
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
  border-top: 1px solid var(--border-subtle);
  background: var(--surface-subtle);
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
  align-items: center;
  justify-content: center;
}

.playlist-buttons .u-btn {
  flex: 1;
  min-width: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

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
  margin: 0;
}

.dropdown-item:hover {
  background-color:  rgb(80, 80, 80);;
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


.exercise-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.exercise-item:last-child {
  margin-bottom: 0;
}

.exercise-info {
  flex: 1;
}

.exercise-name {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.exercise-target {
  font-size: 0.8rem;
  margin: 0;
}

.exercise-equipment {
  font-size: 0.75rem;
  color: #868e96;
  margin: 0;
}

.search-container {
  margin-bottom: 1rem;
}

.search-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;
}

.search-result-item:hover {
  background: grey;
  border-color: #007bff;
}

.search-result-item:last-child {
  margin-bottom: 0;
}

.search-loading {
  color: #6c757d;
  font-style: italic;
}

.modal-content {
  max-width: 1200px;
  width: 95%;
  max-height: 95vh;
  overflow-y: auto;
}

.modal-body {
  max-height: 80vh;
  overflow-y: auto;
  padding: 2rem;
}

.current-exercises {
  max-height: 400px;
  overflow-y: auto;
  border-radius: 8px;
  padding: 0.5rem;
}

.search-results {
  max-height: 500px;
  overflow-y: auto;
  border-radius: 8px;
  padding: 0.5rem;
}

.default-exercises {
  max-height: 500px;
  overflow-y: auto;
  border-radius: 8px;
  padding: 0.5rem;
}

@media (max-width: 768px) {
  .playlist-buttons {
    flex-direction: column;
  }
  
  .playlist-buttons .u-btn {
    width: 100%;
  }
  
  .modal-content {
    margin: 0.5rem;
    width: calc(100% - 1rem);
    max-width: none;
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-body .row > .col-md-6 {
    margin-bottom: 2rem;
  }

  .current-exercises,
  .search-results,
  .default-exercises {
    max-height: 300px;
  }
}

.playlist-card[draggable="true"] {
  cursor: grab;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.playlist-card[draggable="true"]:active {
  cursor: grabbing;
}

.playlist-card[draggable="true"]:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.playlist-card.dragging {
  opacity: 0.6;
  transform: scale(0.98);
}

.info-box {
  background: var(--surface-subtle);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 1rem;
  margin-top: 1rem;
}

.info-box .text-info {
  color: #17a2b8 !important;
  font-weight: 500;
}

.title-with-drag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.drag-handle {
  color: var(--muted);
  font-size: 0.9rem;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  cursor: grab;
}

.playlist-card:hover .drag-handle {
  opacity: 1;
}

.playlist-card[draggable="true"]:active .drag-handle {
  cursor: grabbing;
}
</style>