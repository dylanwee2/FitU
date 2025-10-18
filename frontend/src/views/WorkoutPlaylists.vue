<template>
  <div class="workout-playlists">
    <div class="container mt-4">
      <!-- Header -->
      <div class="header-section mb-4">
        <h1 class="">My Workout Sets</h1>
        <p class="u-muted">Manage your saved workout collections</p>
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
          <router-link to="/signup" class="u-btn u-btn--primary">
          Sign Up
          </router-link>
          <router-link to="/login" class="u-btn" style="border: 1px solid grey;">
            Login
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
        <router-link to="/exerciselibrary" class="u-btn u-btn--primary">
          Browse Exercises
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
            <div class="playlist-card u-card">
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
                    Edit Workout
                  </button>
                  <div class="dropdown">
                    <button 
                      class="btn btn-sm btn-outline-secondary dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                      title="More options"
                    >
                    </button>
                    <ul class="dropdown-menu u-card">
                      <li>
                        <button 
                          @click="duplicatePlaylist(playlist.id)"
                          class="dropdown-item u-muted"
                        >
                          Duplicate
                        </button>
                      </li>
                      <li>
                        <button 
                          @click="showDeleteConfirmation(playlist)"
                          class="dropdown-item text-danger"
                        >
                          Delete
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
                    class="u-btn u-btn--primary"
                  >
                    <p class="text-center">View</p>
                  </button>
                  <button 
                    v-if="!playlist.isPublished"
                    @click="publishToVault(playlist)"
                    class="u-btn"
                    title="Publish to Community Vault"
                  >
                    <p class="text-center">Publish</p>
                  </button>
                  <button 
                    v-else
                    @click="unpublishFromVault(playlist)"
                    class="u-btn u-btn--secondary"
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
    </div>

    <!-- Edit Playlist Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-content large-modal" style="background-color: var(--bg);">
        <div class="modal-header">
          <h5 class="modal-title">Edit Workout Set</h5>
          <button @click="showEditModal = false" class="btn-close-white btn-close">
          </button>
        </div>
        
        <div class="modal-body">
          <div class="row">
            <!-- Left Column - Basic Info -->
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

              <!-- Current Exercises -->
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
          <button 
            @click="showEditModal = false"
            class="u-btn u-btn--secondary"
          >
            Cancel
          </button>
          <button 
            @click="savePlaylistChanges"
            class="u-btn u-btn--primary"
            :disabled="!editingPlaylist.name.trim()"
          >Save Changes
          </button>
        </div>
      </div>
    </div>

    <!-- View Playlist Modal -->
    <div v-if="showViewModal" class="modal-overlay" @click.self="showViewModal = false">
      <div class="modal-content large" style="background-color: var(--bg);">
        <div class="modal-header">
          <h5 class="modal-title">{{ viewingPlaylist.name }}</h5>
          <button @click="showViewModal = false" class="btn-close-white btn-close">
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

          <div class="muscle-groups u-muted mb-4">
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
                    <span class="badge target-muscle-badge">{{ exercise.target }}</span>
                    <span class="badge body-part-badge">{{ exercise.bodyPart }}</span>
                    <span class="badge equipment-badge">{{ exercise.equipment }}</span>
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
            class="u-btn u-btn--secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Publish to Vault Modal -->
    <div v-if="showPublishModal" class="modal-overlay" @click.self="showPublishModal = false">
      <div class="modal-content" style="background-color: var(--bg);">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="fas fa-upload me-2 text-success"></i>
            Publish to Community Vault
          </h5>
          <button @click="showPublishModal = false" class="btn-close-white btn-close">
          </button>
        </div>
        
        <div class="modal-body">
          <div class="publish-preview">
            <div class="workout-preview-card">
              <h6 class="workout-title">{{ publishingPlaylist.name }}</h6>
              <p class="workout-description" v-if="publishingPlaylist.description">
                {{ publishingPlaylist.description }}
              </p>
              <div class="workout-stats-preview">
                <div class="stat">
                  
                  {{ publishingPlaylist.exercises?.length || 0 }} exercises
                </div>
                <div class="stat">
                  
                  {{ Math.round(publishingPlaylist.totalDuration || 0) }} min
                </div>
                <div class="stat">
                  
                  {{ publishingPlaylist.muscleGroups?.length || 0 }} muscle groups
                </div>
              </div>
            </div>
          </div>
          
          <div class="publish-info">
            <h6>What happens when you publish?</h6>
            <ul class="publish-benefits">
              <li>Your workout becomes visible to the entire FitU community</li>
              <li>Other users can discover, rate, and review your workout</li>
              <li>You'll still own the workout and can unpublish it anytime</li>
              <li>Your original workout set remains in your personal collection</li>
            </ul>
          </div>

          <div class="confirmation-section">
            <div class="form-check align-checkbox">
              <input 
                class="" 
                type="checkbox" 
                id="confirmPublish"
                v-model="confirmPublish"
              >
              <label class="form-check-label" for="confirmPublish">
                I confirm that I want to publish "<strong>{{ publishingPlaylist.name }}</strong>" to the community vault
              </label>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            @click="showPublishModal = false"
            class="u-btn u-btn--secondary"
          >
            Cancel
          </button>
          <button 
            @click="confirmPublishToVault"
            class="btn btn-success"
            :disabled="!confirmPublish || publishingInProgress"
          >
            <span v-if="publishingInProgress">
              Publishing...
            </span>
            <span v-else>
              Publish to Vault
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Unpublish Confirmation Modal -->
    <div v-if="showUnpublishModal" class="modal-overlay" @click.self="showUnpublishModal = false">
      <div class="modal-content" style="background-color: var(--bg);">
        <div class="modal-header">
          <h5 class="modal-title">
            Remove from Community Vault
          </h5>
          <button @click="showUnpublishModal = false" class="btn-close btn-close-white">
          </button>
        </div>
        
        <div class="modal-body">
          <div class="unpublish-warning">
            <div class="alert alert-warning u-card text-white">
              <strong>Are you sure you want to remove "{{ unpublishingPlaylist.name }}" from the community vault?</strong>
            </div>
            
            <div class="unpublish-consequences">
              <h6>What will happen:</h6>
              <ul>
                <li>Your workout will no longer be visible to other users</li>
                <li>Existing reviews and ratings will be preserved but hidden</li>
                <li>Your original workout set will remain in your personal collection</li>
                <li>You can republish it later if you change your mind</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            @click="showUnpublishModal = false"
            class="u-btn u-btn--secondary"
          >
            Cancel
          </button>
          <button 
            @click="confirmUnpublishFromVault"
            class="u-btn u-btn--danger"
            :disabled="unpublishingInProgress"
          >
            <span v-if="unpublishingInProgress">
              Removing...
            </span>
            <span v-else>
              Remove from Vault
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Exercises Modal -->
    <div v-if="showEditExercisesModal" class="modal-overlay" @click.self="showEditExercisesModal = false">
      <div class="modal-content large" style="background-color: var(--bg);">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="fas fa-edit me-2"></i>
            Edit Exercises - {{ editingExercisesPlaylist.name }}
          </h5>
          <button @click="showEditExercisesModal = false" class="btn-close-white btn-close">
          </button>
        </div>
        
        <div class="modal-body">
          <div class="exercise-editor">
            <!-- Current Exercises -->
            <div class="current-exercises-section mb-4">
              <h6><i class="fas fa-list me-2"></i>Current Exercises</h6>
              <div v-if="editingExercises.length === 0" class="text-muted text-center py-3">
                No exercises in this workout set yet. Add some exercises below!
              </div>
              <div v-else class="exercise-list">
                <div 
                  v-for="(exercise, index) in editingExercises" 
                  :key="exercise.id"
                  class="exercise-edit-item"
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
                      <span class="badge target-muscle-badge">{{ capitalizeFirstLetter(exercise.target) }}</span>
                      <span class="badge body-part-badge">{{ capitalizeFirstLetter(exercise.bodyPart) }}</span>
                      <span class="badge equipment-badge">{{ capitalizeFirstLetter(exercise.equipment) }}</span>
                    </div>
                  </div>
                  <div class="exercise-controls">
                    <div class="sets-reps-controls">
                      <div class="control-group">
                        <label>Sets:</label>
                        <input 
                          v-model.number="exercise.sets" 
                          type="number" 
                          min="1" 
                          max="20"
                          class="form-control form-control-sm"
                        >
                      </div>
                      <div class="control-group">
                        <label>Reps:</label>
                        <input 
                          v-model.number="exercise.reps" 
                          type="number" 
                          min="1" 
                          max="100"
                          class="form-control form-control-sm"
                        >
                      </div>
                      <div class="control-group">
                        <label>Weight (lbs):</label>
                        <input 
                          v-model.number="exercise.weight" 
                          type="number" 
                          min="0" 
                          step="0.5"
                          class="form-control form-control-sm"
                          placeholder="Optional"
                        >
                      </div>
                    </div>
                    <button 
                      @click="removeExerciseFromEdit(index)"
                      class="btn btn-sm btn-outline-danger"
                      title="Remove exercise"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Add New Exercises -->
            <div class="add-exercises-section">
              <h6><i class="fas fa-plus me-2"></i>Add New Exercises</h6>
              <div class="exercise-search">
                <div class="search-input-group">
                  <input 
                    v-model="exerciseSearchQuery"
                    @input="searchExercises"
                    type="text" 
                    class="form-control"
                    placeholder="Search exercises by name, muscle group, or equipment..."
                  >
                  <button 
                    v-if="exerciseSearchQuery"
                    @click="clearExerciseSearch"
                    class="btn btn-outline-secondary"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <div v-if="exerciseSearchResults.length > 0" class="search-results mt-3">
                <div class="exercise-search-list">
                  <div 
                    v-for="exercise in exerciseSearchResults.slice(0, 10)" 
                    :key="exercise.id"
                    class="exercise-search-item"
                  >
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
                    <button 
                      @click="addExerciseToEdit(exercise)"
                      class="btn btn-sm btn-success"
                      :disabled="isExerciseInEdit(exercise.id)"
                    >
                      <i class="fas fa-plus me-1"></i>
                      {{ isExerciseInEdit(exercise.id) ? 'Added' : 'Add' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            @click="showEditExercisesModal = false"
            class="btn btn-secondary"
          >
            <i class="fas fa-times me-1"></i>Cancel
          </button>
          <button 
            @click="saveExerciseChanges"
            class="btn btn-primary"
            :disabled="savingChanges"
          >
            <span v-if="savingChanges">
              <i class="fas fa-spinner fa-spin me-1"></i>Saving...
            </span>
            <span v-else>
              <i class="fas fa-save me-1"></i>Save Changes
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-content" style="background-color: var(--bg);">
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
            class="u-btn u-btn--danger"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkoutCartStore } from '../stores/workoutCart'
import { workoutVaultService } from '@/services/workoutVaultService.js'
import { auth } from '@/firebase.js'

const router = useRouter()
const cartStore = useWorkoutCartStore()

// Local state
const showEditModal = ref(false)
const showViewModal = ref(false)
const showPublishModal = ref(false)
const showUnpublishModal = ref(false)
const showDeleteModal = ref(false)
const showEditExercisesModal = ref(false)
const editingPlaylist = ref({})
const viewingPlaylist = ref({})
const publishingPlaylist = ref({})
const unpublishingPlaylist = ref({})
const deletingPlaylist = ref({})
const editingExercisesPlaylist = ref({})
const editingExercises = ref([])
const exerciseSearchQuery = ref('')
const exerciseSearchResults = ref([])
const confirmPublish = ref(false)
const publishingInProgress = ref(false)
const unpublishingInProgress = ref(false)
const savingChanges = ref(false)

// New exercise search state for edit modal
const searchQuery = ref('')
const searchedExercises = ref([])
const searchLoading = ref(false)
const searchTimeout = ref(null)
const searchError = ref('')

// API Configuration
const API_BASE_URL = 'https://www.exercisedb.dev/api/v1'
const EXERCISES_PER_PAGE = 12

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

const viewPlaylist = (playlist) => {
  viewingPlaylist.value = { ...playlist }
  showViewModal.value = true
}

const editPlaylist = (playlist) => {
  editingPlaylist.value = { ...playlist, exercises: [...(playlist.exercises || [])] }
  clearSearch() // Clear any previous search state
  fetchExercises() // Preload popular exercises
  showEditModal.value = true
}

const savePlaylistChanges = async () => {
  if (!editingPlaylist.value.name.trim()) return

  try {
    // Calculate updated duration based on exercises
    const updatedDuration = calculateWorkoutDuration(editingPlaylist.value.exercises || [])
    
    await cartStore.updatePlaylist(editingPlaylist.value.id, {
      name: editingPlaylist.value.name.trim(),
      description: editingPlaylist.value.description.trim(),
      exercises: editingPlaylist.value.exercises || [],
      totalDuration: updatedDuration
    })
    showEditModal.value = false
    clearSearch() // Clear search state
    editingPlaylist.value = {}
  } catch (error) {
    console.error('Error updating playlist:', error)
    alert('Error updating workout set: ' + error.message)
  }
}

// New exercise search functions for edit modal
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
    
    // Handle ExerciseDB API response structure
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

// Exercise management functions for edit modal
const addExerciseToPlaylist = (exercise) => {
  if (!editingPlaylist.value.exercises) {
    editingPlaylist.value.exercises = []
  }
  
  // Check if exercise is already in playlist
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

// Format functions for exercise data
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
  } catch (error) {
    console.error('Error unpublishing workout:', error)
    alert('Failed to remove workout from vault: ' + error.message)
  } finally {
    unpublishingInProgress.value = false
  }
}

const editPlaylistExercises = (playlist) => {
  editingExercisesPlaylist.value = { ...playlist }
  editingExercises.value = [...(playlist.exercises || [])]
  exerciseSearchQuery.value = ''
  exerciseSearchResults.value = []
  showEditExercisesModal.value = true
}

const removeExerciseFromEdit = (index) => {
  editingExercises.value.splice(index, 1)
}

const addExerciseToEdit = (exercise) => {
  if (!isExerciseInEdit(exercise.id)) {
    const exerciseWithDefaults = {
      ...exercise,
      sets: 3,
      reps: 10,
      weight: null
    }
    editingExercises.value.push(exerciseWithDefaults)
  }
}

const isExerciseInEdit = (exerciseId) => {
  return editingExercises.value.some(ex => ex.id === exerciseId)
}

const searchExercises = async () => {
  if (!exerciseSearchQuery.value.trim()) {
    exerciseSearchResults.value = []
    return
  }

  try {
    // This assumes you have an exercise API service available
    // You might need to import this from your existing exercise service
    const response = await fetch(`https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(exerciseSearchQuery.value)}`, {
      headers: {
        'X-RapidAPI-Key': 'your-api-key', // You'll need to use your actual API key
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
      }
    })
    
    if (response.ok) {
      const exercises = await response.json()
      exerciseSearchResults.value = exercises.slice(0, 10)
    }
  } catch (error) {
    console.error('Error searching exercises:', error)
    exerciseSearchResults.value = []
  }
}

const clearExerciseSearch = () => {
  exerciseSearchQuery.value = ''
  exerciseSearchResults.value = []
}

// Calculate total duration based on sets (5 minutes per set)
const calculateWorkoutDuration = (exercises) => {
  if (!exercises || exercises.length === 0) return 0
  
  return exercises.reduce((total, exercise) => {
    const sets = exercise.sets || 3 // Default to 3 sets if not specified
    return total + (sets * 5) // 5 minutes per set
  }, 0)
}

const saveExerciseChanges = async () => {
  if (savingChanges.value) return

  savingChanges.value = true

  try {
    // Calculate updated workout stats
    const muscleGroups = [...new Set(editingExercises.value.map(ex => ex.target))].filter(Boolean)
    const totalDuration = calculateWorkoutDuration(editingExercises.value)

    const updatedPlaylist = {
      ...editingExercisesPlaylist.value,
      exercises: editingExercises.value,
      muscleGroups,
      totalDuration,
      updatedAt: new Date().toISOString()
    }

    await cartStore.updatePlaylist(editingExercisesPlaylist.value.id, updatedPlaylist)
    
    showEditExercisesModal.value = false
    editingExercisesPlaylist.value = {}
    editingExercises.value = []
    exerciseSearchQuery.value = ''
    exerciseSearchResults.value = []
  } catch (error) {
    console.error('Error saving exercise changes:', error)
    alert('Failed to save changes: ' + error.message)
  } finally {
    savingChanges.value = false
  }
}

const handleImageError = (event) => {
  event.target.src = '/images/exercise-placeholder.png'
}

onMounted(() => {
  // Initialize store to load saved playlists
  cartStore.initializeStore()
})

// Add method to check published status from Firebase
const checkPublishedStatus = async () => {
  if (!auth.currentUser) {
    console.log('No current user, skipping published status check')
    return
  }

  // console.log('Checking published status for user:', auth.currentUser.uid)

  try {
    // Get user's workout sets from 'workoutSets' collection
    const userWorkouts = await workoutVaultService.getUserWorkouts(auth.currentUser.uid)
    // console.log('User workouts from workoutSets:', userWorkouts)
    
    // Get user's published workouts from 'publishedWorkouts' collection
    const publishedWorkouts = await workoutVaultService.getPublishedWorkoutsByUser(auth.currentUser.uid)
    // console.log('Published workouts from publishedWorkouts:', publishedWorkouts)
    
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
         
        // Update the status based on whether it's actually in the publishedWorkouts collection
        if (localPlaylist.isPublished !== isActuallyPublished) {
          // console.log(`Updating playlist ${userWorkout.id} published status to ${isActuallyPublished}`)
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
</script>

<style scoped>
.workout-playlists {
  min-height: 100vh;
}

.container {
  max-width: 1200px;
}

/* Header */
.header-section {
  text-align: center;
  padding: 2rem 0;
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

.playlist-title-section {
  flex: 1;
  margin-right: 1rem;
}

.playlist-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.status-badges {
  display: flex;
  gap: 0.5rem;
}

.status-badges .badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.playlist-actions {
  display: flex;
  gap: 0.5rem;
}

.playlist-description {
  color: var(--muted);
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
  width: 100%;
}

.playlist-buttons .u-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
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
  background: var(--bg);
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.large {
  max-width: 800px;
}

.modal-content.large-modal {
  max-width: 1200px;
  width: 95%;
  max-height: 95vh;
  overflow-y: auto;
}

.large-modal .modal-body {
  max-height: 80vh;
  overflow-y: auto;
  padding: 2rem;
}

/* Exercise Search Styles for Edit Modal */
.current-exercises {
  max-height: 400px;
  overflow-y: auto;
  border-radius: 8px;
  padding: 0.5rem;
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
  color: #2c3e50;
}

.exercise-target {
  font-size: 0.8rem;
  color: #6c757d;
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

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-weight: 600;
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
  background: var(--surface-subtle);
  border-radius: 8px;
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
  color: white;
  margin: 0 0 0.25rem 0;
}

.exercise-info .exercise-target {
  font-size: 0.9rem;
  color: var(--muted);
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
  color: var(--muted);
}

.sets, .reps, .weight {
  font-weight: 500;
}

/* Publish/Unpublish Modal Styles */
.publish-preview {
  margin-bottom: 1.5rem;
}

.workout-preview-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  border: 2px dashed #dee2e6;
}

.workout-title {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.workout-description {
  color: #6c757d;
  margin-bottom: 1rem;
  font-style: italic;
}

.workout-stats-preview {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.workout-stats-preview .stat {
  color: #495057;
  font-size: 0.9rem;
}

.publish-info {
  margin-bottom: 1.5rem;
}

.publish-info h6 {
  margin-bottom: 0.75rem;
}

.publish-benefits {
  margin: 0;
  padding-left: 1.25rem;
}

.publish-benefits li {
  margin-bottom: 0.5rem;
  color: var(--muted);
}

.confirmation-section {
  background: var(--surface-subtle);
  border-radius: 8px;
  padding: 1rem;
  border-left: 4px solid #28a745;
}

.form-check-label {
  color: var(--muted);
  cursor: pointer;
}

.unpublish-warning {
  margin-bottom: 1rem;
}

.unpublish-consequences h6 {
  margin-bottom: 0.75rem;
}

.unpublish-consequences ul {
  margin: 0;
  padding-left: 1.25rem;
}

.unpublish-consequences li {
  margin-bottom: 0.5rem;
  color: var(--muted);
}

/* Exercise Editing Modal Styles */
.exercise-editor {
  max-height: 70vh;
  overflow-y: auto;
}

.current-exercises-section {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
}

.exercise-edit-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  margin-bottom: 1rem;
  background: white;
}

.exercise-edit-item:last-child {
  margin-bottom: 0;
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
  font-weight: bold;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.exercise-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
}

.sets-reps-controls {
  display: flex;
  gap: 0.75rem;
  align-items: end;
}

.control-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.control-group label {
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: #6c757d;
}

.control-group .form-control {
  width: 70px;
  text-align: center;
}

.add-exercises-section {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
}

.exercise-search {
  margin-bottom: 1rem;
}

.search-input-group {
  display: flex;
  gap: 0.5rem;
}

.exercise-search-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 8px;
}

.exercise-search-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  background: white;
  transition: background-color 0.2s ease;
}

.exercise-search-item:hover {
  background: #f8f9fa;
}

.exercise-search-item:last-child {
  border-bottom: none;
}

.exercise-search-item .exercise-info {
  flex-grow: 1;
}

.exercise-search-item .btn {
  margin-left: auto;
  flex-shrink: 0;
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

  .modal-content.large-modal {
    margin: 0.5rem;
    width: calc(100% - 1rem);
    max-width: none;
  }

  .large-modal .modal-body {
    padding: 1rem;
  }

  .large-modal .modal-body .row > .col-md-6 {
    margin-bottom: 2rem;
  }

  .current-exercises,
  .search-results,
  .default-exercises {
    max-height: 300px;
  }
  
  .playlist-buttons .u-btn {
    width: 100%;
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

.dropdown-item:hover {
  background-color:  rgb(80, 80, 80);;
}

.align-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* Adjust spacing between checkbox and label */
}

.align-checkbox .form-check-input {
  margin-top: 0; /* Remove default margin */
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
