<template>
  <div class="workout-playlists">
    <div class="container mt-4">
      <!-- Header -->
      <div class="header-section mb-4">
        <h1 class="page-title">My Workout Sets</h1>
        <p class="page-subtitle">Manage your saved workout collections</p>
      </div>

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
        <router-link to="/exercises" class="btn btn-primary">
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
                <h5 class="playlist-name">{{ playlist.name }}</h5>
                <div class="playlist-actions">
                  <button 
                    @click="editPlaylist(playlist)"
                    class="btn btn-sm btn-outline-secondary"
                    title="Edit playlist"
                  >
                    <i class="fas fa-edit"></i>
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
                          @click="deletePlaylist(playlist.id)"
                          class="dropdown-item text-danger"
                        >
                          <i class="fas fa-trash me-2"></i>Delete
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Playlist Description -->
              <p v-if="playlist.description" class="playlist-description">
                {{ playlist.description }}
              </p>

              <!-- Playlist Stats -->
              <div class="playlist-stats">
                <div class="stat">
                  <i class="fas fa-dumbbell"></i>
                  <span>{{ playlist.exercises.length }} exercises</span>
                </div>
                <div class="stat">
                  <i class="fas fa-clock"></i>
                  <span>{{ Math.round(playlist.totalDuration) }} min</span>
                </div>
                <div class="stat">
                  <i class="fas fa-muscle"></i>
                  <span>{{ playlist.muscleGroups.length }} muscle groups</span>
                </div>
              </div>

              <!-- Muscle Groups -->
              <div class="muscle-groups">
                <span 
                  v-for="muscle in playlist.muscleGroups.slice(0, 4)" 
                  :key="muscle"
                  class="muscle-badge"
                >
                  {{ muscle }}
                </span>
                <span 
                  v-if="playlist.muscleGroups.length > 4"
                  class="muscle-badge more"
                >
                  +{{ playlist.muscleGroups.length - 4 }} more
                </span>
              </div>

              <!-- Exercise Preview -->
              <div class="exercise-preview">
                <h6 class="preview-title">Exercises:</h6>
                <div class="exercise-list">
                  <div 
                    v-for="exercise in playlist.exercises.slice(0, 3)" 
                    :key="exercise.id"
                    class="exercise-item"
                  >
                    <img 
                      :src="exercise.gifUrl || '/images/exercise-placeholder.png'" 
                      :alt="exercise.name"
                      class="exercise-thumb"
                      @error="handleImageError"
                    >
                    <span class="exercise-name">{{ exercise.name }}</span>
                  </div>
                  <div 
                    v-if="playlist.exercises.length > 3"
                    class="exercise-item more"
                  >
                    <div class="more-exercises">
                      <i class="fas fa-plus"></i>
                      <span>{{ playlist.exercises.length - 3 }} more</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Playlist Footer -->
              <div class="playlist-footer">
                <div class="playlist-meta">
                  <small class="text-muted">
                    Created {{ formatDate(playlist.createdAt) }}
                  </small>
                  <small class="text-muted">
                    Last used {{ formatDate(playlist.lastUsed) }}
                  </small>
                </div>
                <div class="playlist-buttons">
                  <button 
                    @click="loadPlaylist(playlist.id)"
                    class="btn btn-primary btn-sm"
                  >
                    <i class="fas fa-play me-1"></i>Load
                  </button>
                  <button 
                    @click="viewPlaylist(playlist)"
                    class="btn btn-outline-primary btn-sm"
                  >
                    <i class="fas fa-eye me-1"></i>View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

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
        </div>
        
        <div class="modal-footer">
          <button 
            @click="showEditModal = false"
            class="btn btn-secondary"
          >
            Cancel
          </button>
          <button 
            @click="savePlaylistChanges"
            class="btn btn-primary"
            :disabled="!editingPlaylist.name.trim()"
          >
            <i class="fas fa-save me-1"></i>Save Changes
          </button>
        </div>
      </div>
    </div>

    <!-- View Playlist Modal -->
    <div v-if="showViewModal" class="modal-overlay" @click.self="showViewModal = false">
      <div class="modal-content large">
        <div class="modal-header">
          <h5 class="modal-title">{{ viewingPlaylist.name }}</h5>
          <button @click="showViewModal = false" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div v-if="viewingPlaylist.description" class="playlist-description mb-3">
            <p>{{ viewingPlaylist.description }}</p>
          </div>

          <div class="playlist-stats mb-4">
            <div class="row text-center">
              <div class="col-4">
                <div class="stat-item">
                  <div class="stat-number">{{ viewingPlaylist.exercises.length }}</div>
                  <div class="stat-label">Exercises</div>
                </div>
              </div>
              <div class="col-4">
                <div class="stat-item">
                  <div class="stat-number">{{ Math.round(viewingPlaylist.totalDuration) }}</div>
                  <div class="stat-label">Minutes</div>
                </div>
              </div>
              <div class="col-4">
                <div class="stat-item">
                  <div class="stat-number">{{ viewingPlaylist.muscleGroups.length }}</div>
                  <div class="stat-label">Muscle Groups</div>
                </div>
              </div>
            </div>
          </div>

          <div class="muscle-groups mb-4">
            <h6>Targeted Muscle Groups:</h6>
            <div class="muscle-badges">
              <span 
                v-for="muscle in viewingPlaylist.muscleGroups" 
                :key="muscle"
                class="muscle-badge"
              >
                {{ muscle }}
              </span>
            </div>
          </div>

          <div class="exercises-list">
            <h6>Exercises in this set:</h6>
            <div class="exercise-detail-list">
              <div 
                v-for="(exercise, index) in viewingPlaylist.exercises" 
                :key="exercise.id"
                class="exercise-detail-item"
              >
                <div class="exercise-number">{{ index + 1 }}</div>
                <div class="exercise-image">
                  <img 
                    :src="exercise.gifUrl || '/images/exercise-placeholder.png'" 
                    :alt="exercise.name"
                    @error="handleImageError"
                  >
                </div>
                <div class="exercise-info">
                  <h6 class="exercise-name">{{ exercise.name }}</h6>
                  <p class="exercise-target">{{ exercise.target }}</p>
                  <div class="exercise-badges">
                    <span class="badge bg-primary">{{ exercise.bodyPart }}</span>
                    <span class="badge bg-secondary">{{ exercise.equipment }}</span>
                  </div>
                </div>
                <div class="exercise-sets">
                  <div class="set-info">
                    <span class="sets">{{ exercise.sets || 3 }} sets</span>
                    <span class="reps">{{ exercise.reps || 10 }} reps</span>
                    <span v-if="exercise.weight" class="weight">{{ exercise.weight }} lbs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            @click="showViewModal = false"
            class="btn btn-secondary"
          >
            Close
          </button>
          <button 
            @click="loadPlaylist(viewingPlaylist.id)"
            class="btn btn-primary"
          >
            <i class="fas fa-play me-1"></i>Load into Cart
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkoutCartStore } from '../stores/workoutCart'

const router = useRouter()
const cartStore = useWorkoutCartStore()

// Local state
const showEditModal = ref(false)
const showViewModal = ref(false)
const editingPlaylist = ref({})
const viewingPlaylist = ref({})

// Computed properties from store
const savedPlaylists = computed(() => cartStore.savedPlaylists)
const isAuthenticated = computed(() => cartStore.isAuthenticated)

// Methods
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  return date.toLocaleDateString()
}

const loadPlaylist = (playlistId) => {
  const success = cartStore.loadPlaylist(playlistId)
  if (success) {
    // Navigate to exercises page to show the loaded cart
    router.push('/exercises')
  }
}

const viewPlaylist = (playlist) => {
  viewingPlaylist.value = { ...playlist }
  showViewModal.value = true
}

const editPlaylist = (playlist) => {
  editingPlaylist.value = { ...playlist }
  showEditModal.value = true
}

const savePlaylistChanges = async () => {
  if (!editingPlaylist.value.name.trim()) return

  try {
    await cartStore.updatePlaylist(editingPlaylist.value.id, {
      name: editingPlaylist.value.name.trim(),
      description: editingPlaylist.value.description.trim()
    })
    showEditModal.value = false
    editingPlaylist.value = {}
  } catch (error) {
    console.error('Error updating playlist:', error)
    alert('Error updating workout set: ' + error.message)
  }
}

const duplicatePlaylist = async (playlistId) => {
  try {
    const duplicated = await cartStore.duplicatePlaylist(playlistId)
    if (duplicated) {
      console.log('Playlist duplicated:', duplicated.name)
    }
  } catch (error) {
    console.error('Error duplicating playlist:', error)
    alert('Error duplicating workout set: ' + error.message)
  }
}

const deletePlaylist = async (playlistId) => {
  const playlist = savedPlaylists.value.find(p => p.id === playlistId)
  if (playlist && confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
    try {
      await cartStore.deletePlaylist(playlistId)
    } catch (error) {
      console.error('Error deleting playlist:', error)
      alert('Error deleting workout set: ' + error.message)
    }
  }
}

const handleImageError = (event) => {
  event.target.src = '/images/exercise-placeholder.png'
}

onMounted(() => {
  // Initialize store to load saved playlists
  cartStore.initializeStore()
})
</script>

<style scoped>
.workout-playlists {
  min-height: 100vh;
  background: #f8f9fa;
}

.container {
  max-width: 1200px;
}

/* Header */
.header-section {
  text-align: center;
  padding: 2rem 0;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #6c757d;
  margin-bottom: 0;
}

/* Empty State */
.empty-state {
  min-height: 400px;
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
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.playlist-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.playlist-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  flex: 1;
  margin-right: 1rem;
}

.playlist-actions {
  display: flex;
  gap: 0.5rem;
}

.playlist-description {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.4;
}

/* Stats */
.playlist-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #495057;
}

.stat i {
  color: #007bff;
}

/* Muscle Groups */
.muscle-groups {
  margin-bottom: 1rem;
}

.muscle-badge {
  background: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  display: inline-block;
}

.muscle-badge.more {
  background: #dee2e6;
  color: #6c757d;
}

/* Exercise Preview */
.exercise-preview {
  flex: 1;
  margin-bottom: 1rem;
}

.preview-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.75rem;
}

.exercise-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.exercise-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.exercise-thumb {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.exercise-name {
  font-size: 0.85rem;
  color: #495057;
  flex: 1;
}

.exercise-item.more {
  justify-content: center;
  background: #e9ecef;
}

.more-exercises {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.8rem;
}

/* Footer */
.playlist-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.playlist-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.8rem;
}

.playlist-buttons {
  display: flex;
  gap: 0.5rem;
}

.playlist-buttons .btn {
  flex: 1;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.large {
  max-width: 800px;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  color: #2c3e50;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0.25rem;
}

.btn-close:hover {
  color: #dc3545;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* View Modal Specific */
.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #007bff;
}

.stat-label {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.muscle-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.exercise-detail-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.exercise-detail-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.exercise-number {
  background: #007bff;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.exercise-image {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
}

.exercise-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.exercise-info {
  flex: 1;
}

.exercise-info .exercise-name {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
}

.exercise-info .exercise-target {
  font-size: 0.9rem;
  color: #6c757d;
  margin: 0 0 0.5rem 0;
}

.exercise-info .badge {
  font-size: 0.75rem;
  margin-right: 0.5rem;
}

.exercise-sets {
  text-align: right;
}

.set-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: #495057;
}

.sets, .reps, .weight {
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .playlist-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .stat {
    justify-content: center;
  }
  
  .playlist-meta {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .exercise-detail-item {
    flex-direction: column;
    text-align: center;
  }
  
  .exercise-sets {
    text-align: center;
  }
  
  .set-info {
    flex-direction: row;
    justify-content: center;
    gap: 1rem;
  }
}
</style>
