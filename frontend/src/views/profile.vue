<template>
  <div class="profile-container">
    <div class="container py-4">
      <h1 class="page-title mb-4">My Profile</h1>

      <!-- Success/Error Messages -->
      <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
        {{ successMessage }}
        <button type="button" class="btn-close" @click="successMessage = ''"></button>
      </div>
      <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
        {{ errorMessage }}
        <button type="button" class="btn-close" @click="errorMessage = ''"></button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else class="row">
        <div class="col-12">
          
          <!-- View Toggle -->
          <div class="view-toggle-container mb-4">
            <div class="view-toggle">
              <button 
                class="toggle-btn"
                :class="{ active: currentView === 'progress' }"
                @click="currentView = 'progress'"
              >
                <i class="bi bi-graph-up me-2"></i>
                Progress Overview
              </button>
              <button 
                class="toggle-btn"
                :class="{ active: currentView === 'profile' }"
                @click="currentView = 'profile'"
              >
                <i class="bi bi-person-circle me-2"></i>
                Profile Details
              </button>
            </div>
          </div>

          <!-- Profile Details View -->
          <div v-show="currentView === 'profile'">
          
          <!-- Personal Information Card -->
          <div class="card mb-4">
            <div class="card-header text-white">
              <h5 class="mb-0"><i class="bi bi-person-circle me-2"></i>Personal Information</h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="saveProfile">
                <!-- Name and Email -->
                <div class="row">
                  <div class="col-sm-12 col-md-6 mb-3">
                    <label for="fullName" class="form-label">Full Name *</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="fullName" 
                      v-model="profileData.fullName" 
                      required
                    >
                  </div>
                  <div class="col-sm-12 col-md-6 mb-3">
                    <label for="email" class="form-label">Email *</label>
                    <input 
                      type="email" 
                      class="form-control" 
                      id="email" 
                      v-model="profileData.email" 
                      required
                    >
                  </div>
                </div>

                <!-- Personal Details -->
                <div class="row">
                  <div class="col-sm-12 col-md-3 mb-3">
                    <label for="gender" class="form-label">Gender</label>
                    <select class="form-select" id="gender" v-model="profileData.gender">
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                  <div class="col-sm-12 col-md-3 mb-3">
                    <label for="age" class="form-label">Age</label>
                    <input 
                      type="number" 
                      class="form-control" 
                      id="age" 
                      v-model.number="profileData.age" 
                      min="16" 
                      max="100"
                    >
                  </div>
                  <div class="col-sm-12 col-md-3 mb-3">
                    <label for="height" class="form-label">Height (cm)</label>
                    <input 
                      type="number" 
                      class="form-control" 
                      id="height" 
                      v-model.number="profileData.height" 
                      min="100" 
                      max="250"
                    >
                  </div>
                  <div class="col-sm-12 col-md-3 mb-3">
                    <label for="weight" class="form-label">Weight (kg)</label>
                    <input 
                      type="number" 
                      class="form-control" 
                      id="weight" 
                      v-model.number="profileData.weight" 
                      min="30" 
                      max="300" 
                      step="0.1"
                    >
                  </div>
                </div>

                <!-- BMI Display -->
                <div v-if="calculatedBMI" class="alert alert-info">
                  <strong>BMI:</strong> {{ calculatedBMI.value }} - {{ calculatedBMI.category }}
                </div>
              </form>
            </div>
          </div>

          <!-- Health & Fitness Goals Card -->
          <div class="card mb-4">
            <div class="card-header text-white">
              <h5 class="mb-0"><i class="bi bi-trophy me-2"></i>Health & Fitness Goals</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="mb-3 col-sm-12 col-md-6">
                  <label for="goalType" class="form-label">Primary Goal</label>
                  <select class="form-select" id="goalType" v-model="goalsData.goalType">
                    <option value="">Select your goal</option>
                    <option value="lose-weight">Lose Weight</option>
                    <option value="maintain">Maintain Weight</option>
                    <option value="gain-muscle">Gain Muscle</option>
                    <option value="improve-fitness">Improve Overall Fitness</option>
                  </select>
                </div>

                <div class="mb-3 col-sm-12 col-md-6">
                  <label for="dailyCalorieGoal" class="form-label">Daily Calorie Target</label>
                  <input
                    type="number"
                    class="form-control"
                    id="dailyCalorieGoal"
                    v-model.number="goalsData.dailyGoal"
                    min="1000"
                    max="5000"
                    placeholder="e.g., 2000"
                  >
                  <small class="input-label">Recommended: 1800-2500 kcal for students</small>
                </div>

                <div class="mb-3 col-sm-12 col-md-6">
                  <label for="dietaryPreference" class="form-label">Dietary Preference</label>
                  <select class="form-select" id="dietaryPreference" v-model="goalsData.dietaryPreference">
                    <option value="">No specific preference</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="halal">Halal</option>
                    <option value="kosher">Kosher</option>
                    <option value="keto">Keto</option>
                    <option value="paleo">Paleo</option>
                    <option value="mediterranean">Mediterranean</option>
                  </select>
                </div>

                <div class="mb-3 col-sm-12 col-md-6">
                  <label for="allergies" class="form-label">Allergies & Food Restrictions</label>
                  <input
                    type="text"
                    class="form-control"
                    id="allergies"
                    v-model="goalsData.allergies"
                    placeholder="e.g., peanuts, shellfish, dairy"
                  >
                  <small class="input-label">Separate multiple items with commas</small>
                </div>

                <div class="mb-3 col-sm-12 col-md-6">
                  <label for="workoutFrequency" class="form-label">Workout Frequency (days/week)</label>
                  <input
                    type="number"
                    class="form-control"
                    id="workoutFrequency"
                    v-model.number="goalsData.workoutFrequency"
                    min="0"
                    max="7"
                  >
                </div>

                <div class="mb-3 col-sm-12 col-md-6">
                  <label for="workoutStreakGoal" class="form-label">Workout Streak Goal (days)</label>
                  <input
                    type="number"
                    class="form-control"
                    id="workoutStreakGoal"
                    v-model.number="goalsData.workoutStreakGoal"
                    min="1"
                    max="7"
                    placeholder="e.g., 3"
                  >
                  <small class="input-label">Set your target consecutive workout days</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Account Actions Card -->
          <div class="card mb-4">
            <div class="card-header text-white">
              <h5 class="mb-0"><i class="bi bi-shield-check me-2"></i>Account Actions</h5>
            </div>
            <div class="card-body d-flex flex-wrap gap-2">
              <button 
                @click="saveAllData" 
                class="btn u-btn--primary u-btn--primary-success" 
                :disabled="isSaving"
                style="flex: 1"
              >
                <i class="bi bi-save me-2"></i>{{ isSaving ? 'Saving...' : 'Save All Changes' }}
              </button>

              <button 
                @click="handleLogout" 
                class="btn u-btn--primary u-btn--primary-danger"
                style="flex: 1"
              >
                <i class="bi bi-box-arrow-right me-2"></i>Logout
              </button>

              <hr class="w-100">
            
              <div class="row">
                <div class="col-12">
                  <button 
                  @click="confirmDeleteAccount" 
                  class="btn btn-outline-danger btn-sm py-2 px-3"
                  :disabled="isSaving"
                >
                  <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  
                  {{ isSaving ? 'Deleting Account...' : 'Delete Account' }}
                </button>
                </div>

                <div class="col-12">
                  <small class="input-label d-block mt-2">
                    Account deletion cannot be undone
                  </small>
                </div>
              </div>
            </div>
          </div>

          </div>
          <!-- End Profile Details View -->

          <!-- Progress Overview View -->
          <div v-show="currentView === 'progress'">
            
            <!-- Progress Overview Card -->
            <div class="card mb-4">
              <div class="card-header text-white">
                <h5 class="mb-0"><i class="bi bi-graph-up me-2"></i>Progress Overview</h5>
              </div>
              <div class="card-body">
                <!-- Weekly Calorie Chart -->
                <div class="chart-placeholder mb-3" style="min-height: 240px; height: 32vh; max-height: 380px;">
                  <CalorieChart :series="weeklyCalorieData" />
                  <p class="text-center input-label mt-2">Weekly Calorie Intake</p>
                </div>

                <!-- Workout Streak Display -->
                <div class="stat-card-full mb-3">
                  <div class="stat-header">
                    <h6>Workout Streak</h6>
                    <h3>{{ goalsData.workoutFrequency || 0 }} days</h3>
                  </div>
                  <div class="progress-full">
                    <div 
                      class="progress-bar" 
                      role="progressbar" 
                      :style="{ 
                        width: Math.min(((goalsData.workoutFrequency || 0) / (goalsData.workoutStreakGoal || 1) * 100), 100) + '%', 
                        background: (goalsData.workoutFrequency || 0) >= (goalsData.workoutStreakGoal || 1) ? '#42b06e' : 'var(--text)',
                        transition: 'all 0.5s ease'
                      }"
                      :aria-valuenow="goalsData.workoutFrequency || 0" 
                      aria-valuemin="0" 
                      :aria-valuemax="goalsData.workoutStreakGoal || 1"
                    ></div>
                  </div>
                  <small class="input-label">Goal: {{ goalsData.workoutStreakGoal || 0 }} days</small>
                </div>

                <!-- Calories Consumed Progress -->
                <div class="stat-card-full">
                  <div class="stat-header">
                    <h6>Calories Consumed</h6>
                    <h3>{{ todayConsumed || 0 }} kcal</h3>
                  </div>
                  <div class="progress-full">
                    <div 
                      class="progress-bar" 
                      role="progressbar" 
                      :style="{ 
                        width: ((todayConsumed || 0) / (goalsData.dailyGoal || 2000) * 100) + '%', 
                        background: (todayConsumed || 0) >= (goalsData.dailyGoal || 2000) ? '#42b06e' : 'var(--text)',
                        transition: 'all 0.5s ease'
                      }"
                      :aria-valuenow="todayConsumed || 0" 
                      aria-valuemin="0" 
                      :aria-valuemax="goalsData.dailyGoal || 2000"
                    ></div>
                  </div>
                  <small class="input-label">
                    {{ (todayConsumed || 0) >= (goalsData.dailyGoal || 2000)
                      ? 'Goal reached! Great job!' 
                      : `${(goalsData.dailyGoal || 2000) - (todayConsumed || 0)} kcal remaining for today` 
                    }}
                  </small>
                </div>

                <small><i class="bi bi-info-circle me-1"></i>Charts will display real data once you log activities</small>
              </div>
            </div>

            <!-- Your Workouts Card -->
            <div class="card mb-4">
              <div class="card-header text-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0"><i class="bi bi-lightning-charge me-2"></i>Your Workouts</h5>
                <button 
                  @click="viewAllWorkouts" 
                  class="btn btn-sm btn-outline-light"
                >
                  View All
                </button>
              </div>
              <div class="card-body">
                <!-- Loading State -->
                <div v-if="loadingWorkouts" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <p class="mt-2 u-muted">Loading your workouts...</p>
                </div>

                <!-- Empty State -->
                <div v-else-if="userWorkoutSets.length === 0" class="text-center py-5">
                  <i class="bi bi-dumbbell" style="font-size: 3rem; color: var(--muted);"></i>
                  <h5 class="mt-3">No Published Workouts Yet</h5>
                  <p class="u-muted">Create and publish your first workout set to see it here</p>
                  <button @click="router.push('/exerciselibrary')" class="btn u-btn--primary mt-2">
                    Create Workout
                  </button>
                </div>

                <!-- Workout List - Simplified -->
                <div v-else class="row g-3">
                  <div
                    v-for="workout in userWorkoutSets.slice(0, 2)"
                    :key="workout.id"
                    class="col-12"
                  >
                    <div class="workout-card-simple">
                      <!-- Delete Button -->
                      <button
                        class="delete-workout-btn btn-close"
                        @click.stop="confirmDeleteWorkout(workout)"
                        title="Delete workout"
                        aria-label="Delete workout"
                      ></button>

                      <!-- Workout Header -->
                      <div class="workout-card-header" @click="openEditModal(workout)">
                        <div class="workout-title-section">
                          <h6 class="workout-name mb-1">{{ workout.name || workout.title || 'Unnamed Workout' }}</h6>
                          <p v-if="workout.description" class="workout-description u-muted mb-0">
                            {{ workout.description }}
                          </p>
                        </div>
                      </div>

                      <!-- Workout Stats -->
                      <div class="workout-stats-simple" @click="openEditModal(workout)">
                        <div class="stat-item-simple">
                          <i class="bi bi-list-check me-1"></i>
                          <span>{{ (workout.exercises && workout.exercises.length) || 0 }} exercises</span>
                        </div>
                        <div class="stat-item-simple">
                          <i class="bi bi-clock me-1"></i>
                          <span>{{ workout.totalDuration || 30 }} min</span>
                        </div>
                      </div>

                      <!-- Exercise Types (First 3 exercises as tags) -->
                      <div v-if="workout.exercises && workout.exercises.length > 0" class="exercise-tags-simple" @click="openEditModal(workout)">
                        <span
                          v-for="exercise in workout.exercises.slice(0, 3)"
                          :key="exercise.id"
                          class="exercise-tag-simple"
                        >
                          {{ formatExerciseName(exercise.name) }}
                        </span>
                        <span
                          v-if="workout.exercises.length > 3"
                          class="exercise-tag-simple more-tag"
                        >
                          +{{ workout.exercises.length - 3 }} more
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- End Progress Overview View -->

        </div>
      </div>
    </div>

    <!-- Edit Workout Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-content-large" style="background-color: var(--bg);">
        <div class="modal-header">
          <h5 class="modal-title">Edit Workout Set</h5>
          <button @click="showEditModal = false" class="btn-close-white btn-close"></button>
        </div>
        
        <div class="modal-body">
          <div class="row">
            <!-- Left Column - Basic Info -->
            <div class="col-sm-12 col-md-6">
              <div class="form-group">
                <label for="editPlaylistName" class="form-label">Set Name</label>
                <input 
                  v-model="editingWorkout.name"
                  type="text" 
                  id="editPlaylistName"
                  class="form-control"
                  maxlength="50"
                >
              </div>
              
              <div class="form-group">
                <label for="editPlaylistDescription" class="form-label">Description</label>
                <textarea 
                  v-model="editingWorkout.description"
                  id="editPlaylistDescription"
                  class="form-control"
                  rows="3"
                  maxlength="200"
                ></textarea>
              </div>

              <!-- Current Exercises -->
              <div class="form-group">
                <label class="form-label">Current Exercises ({{ editingWorkout.exercises?.length || 0 }})</label>
                <div v-if="editingWorkout.exercises && editingWorkout.exercises.length > 0" class="current-exercises">
                  <div 
                    v-for="(exercise, index) in editingWorkout.exercises" 
                    :key="exercise.id || index"
                    class="exercise-item"
                  >
                    <div class="exercise-info">
                      <h6 class="exercise-name">{{ formatExerciseName(exercise.name) }}</h6>
                      <p class="exercise-target">{{ formatTarget(exercise.target) }}</p>
                    </div>
                    <button 
                      @click="removeExerciseFromWorkout(index)"
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
            <div class="col-sm-12 col-md-6">
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
                      <i class="bi bi-x"></i>
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
                      @click="addExerciseToWorkout(exercise)"
                      :disabled="isExerciseInWorkout(exercise.id)"
                      class="btn btn-sm u-btn--primary"
                      type="button"
                    >
                      {{ isExerciseInWorkout(exercise.id) ? 'Added' : 'Add' }}
                    </button>
                  </div>
                  <div v-if="searchedExercises.length > 8" class="text-muted text-center mt-2">
                    Showing first 8 results. Refine search for more specific results.
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
          <button @click="saveWorkoutEdit" class="u-btn u-btn--primary">Save Changes</button>
        </div>
      </div>
    </div>

    <!-- Delete Workout Confirmation Modal -->
    <div v-if="showDeleteWorkoutModal" class="modal-overlay" @click.self="showDeleteWorkoutModal = false">
      <div class="modal-content-small">
        <div class="modal-header-delete">
          <h5 class="modal-title"><i class="bi bi-exclamation-triangle me-2"></i>Delete Workout</h5>
          <button type="button" class="btn-close" @click="showDeleteWorkoutModal = false"></button>
        </div>
        <div class="modal-body-delete">
          <p><strong>Are you sure you want to delete this workout?</strong></p>
          <p v-if="workoutToDelete" class="mb-0">
            <strong>{{ workoutToDelete.name || 'Unnamed Workout' }}</strong>
          </p>
          <p class="input-label mt-3 mb-0">This action cannot be undone.</p>
        </div>
        <div class="modal-footer-delete">
          <button type="button" class="u-btn u-btn--secondary" @click="showDeleteWorkoutModal = false">
            Cancel
          </button>
          <button type="button" class="u-btn u-btn--primary u-btn--primary-danger" @click="deleteWorkout" :disabled="isSaving">
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            <i class="bi bi-trash me-2"></i>{{ isSaving ? 'Deleting...' : 'Delete Workout' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Account Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title"><i class="bi bi-exclamation-triangle me-2"></i>Delete Account</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body">
            <p><strong>This action cannot be undone!</strong></p>
            <p>Deleting your account will permanently remove:</p>
            <ul>
              <li>Your profile and personal information</li>
              <li>All your published workouts</li>
              <li>Your workout sets and progress data</li>
              <li>All reviews you've written</li>
              <li>Your calorie tracking data</li>
            </ul>
            <form @submit.prevent="handlePasswordSubmit">
              <div class="mb-3 mt-4">
                <label for="deletePassword" class="form-label">
                  <strong>Please enter your password to confirm:</strong>
                </label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="deletePassword"
                  v-model="deletePassword" 
                  placeholder="Enter your password"
                  :disabled="isSaving"
                  required
                >
              </div>
              <div v-if="deleteError" class="alert alert-danger mt-3" role="alert">
                {{ deleteError }}
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDeleteModal" :disabled="isSaving">
              Cancel
            </button>
            <button type="button" class="btn btn-danger" @click="handlePasswordSubmit" :disabled="isSaving || !deletePassword">
              <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {{ isSaving ? 'Deleting Account...' : 'Delete My Account' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import caloriesService from '@/services/caloriesService.js';
import CalorieChart from '@/components/CalorieChart.vue';
import { workoutVaultService } from '@/services/workoutVaultService.js';
import { getAuth, onAuthStateChanged, signOut, updateProfile, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const router = useRouter();
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

// Default avatar URL
const defaultAvatar = ref('https://ui-avatars.com/api/?name=User&size=150&background=008280&color=fff');

// State Management
const isLoading = ref(true);
const isSaving = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const currentUser = ref(null);
const currentView = ref('progress'); // 'profile' or 'progress'

// Delete account modal state
const showDeleteModal = ref(false);
const deletePassword = ref('');
const deleteError = ref('');

const profileData = ref({
  fullName: '',
  email: '',
  gender: '',
  age: null,
  height: null,
  weight: null
});

const goalsData = ref({
  goalType: '',
  dailyGoal: 2000,
  dietaryPreference: '',
  allergies: '',
  workoutFrequency: 3,
  workoutStreakGoal: 3
});

const workoutStreak = ref(4);
const timeBalance = ref(65);

// Calorie Goal Editor
const goalInput = ref(2000)
const calorieChartRef = ref(null);
const chartInstance = ref(null);

// Calorie data for weekly chart
const weeklyCalorieData = ref([]);
const todayConsumed = ref(0);

// User's workout sets
const userWorkoutSets = ref([]);
const loadingWorkouts = ref(false);
const workoutUnsubscribe = ref(null);

// Edit modal state
const showEditModal = ref(false);
const editingWorkout = ref({});

// Delete workout modal state
const showDeleteWorkoutModal = ref(false);
const workoutToDelete = ref(null);

// Exercise search state for edit modal
const searchQuery = ref('');
const searchedExercises = ref([]);
const searchLoading = ref(false);
const searchTimeout = ref(null);
const searchError = ref('');

// API Configuration
const API_BASE_URL = 'https://www.exercisedb.dev/api/v1';
const EXERCISES_PER_PAGE = 12;

// Computed Properties
const calculatedBMI = computed(() => {
  try {
    const height = profileData.value.height;
    const weight = profileData.value.weight;
    
    if (height && weight && height > 0 && weight > 0) {
      const heightInMeters = height / 100;
      const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
      
      let category = '';
      if (bmi < 18.5) category = 'Underweight';
      else if (bmi < 25) category = 'Normal';
      else if (bmi < 30) category = 'Overweight';
      else category = 'Obese';
      
      return { value: bmi, category };
    }
    return null;
  } catch (error) {
    console.error('Error calculating BMI:', error);
    return null;
  }
});

// Lifecycle Hooks
onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser.value = user;
      await loadUserData(user.uid);
      // Charts will be initialized after data is loaded in loadUserData
      setTimeout(() => {
        initializeCharts();
      }, 100);
    }
  });
});

async function loadUserData(uid) {
  try {
    isLoading.value = true;

    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      
      // Load profile data
      profileData.value = {
        fullName: data.fullName || currentUser.value.displayName || '',
        email: data.email || currentUser.value.email || '',
        gender: data.gender || '',
        age: data.age || null,
        height: data.height || null,
        weight: data.weight || null
      };

      // Load goals data
      goalsData.value = {
        goalType: data.goalType || '',
        dailyGoal: data.dailyGoal || 2000,
        dietaryPreference: data.dietaryPreference || '',
        allergies: data.allergies || '',
        workoutFrequency: data.workoutFrequency || 3,
        workoutStreakGoal: data.workoutStreakGoal || 3
      };
      
      // Load calorie data from caloriesService
      try {
        const calorieData = await caloriesService.getUserCalories();
        if (calorieData) {
          if (calorieData.dailyGoal) {
            goalsData.value.dailyGoal = calorieData.dailyGoal;
          }
          // Get weekly data for chart
          weeklyCalorieData.value = caloriesService.getWeekSeries(calorieData.entries || [], 7);
          // Calculate today's consumed calories
          todayConsumed.value = caloriesService.getTodayConsumed(calorieData.entries || []);
        }
      } catch (error) {
        console.error('Error loading calorie data:', error);
        // Set default values on error
        weeklyCalorieData.value = [];
        todayConsumed.value = 0;
        
      }
    await setupWorkoutListener(uid);

    } else {
      await createDefaultUserDocument(uid);
    }

  } catch (error) {
    console.error('Error loading user data:', error);
    errorMessage.value = 'Failed to load profile data. Please refresh the page.';
  } finally {
    isLoading.value = false;
  }
}

/**
 * Create default user document in Firestore
 */
async function createDefaultUserDocument(uid) {
  try {
    const userDocRef = doc(db, 'users', uid);
    
    const defaultData = {
      fullName: currentUser.value.displayName || '',
      email: currentUser.value.email || '',
      gender: '',
      age: null,
      height: null,
      weight: null,
      goalType: '',
      dailyGoal: 2000,
      dietaryPreference: '',
      allergies: '',
      workoutFrequency: 3,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(userDocRef, defaultData);
    
    profileData.value.fullName = defaultData.fullName;
    profileData.value.email = defaultData.email;
    profileData.value.photoURL = defaultData.photoURL;
    
  } catch (error) {
    console.error('Error creating default user document:', error);
    errorMessage.value = 'Failed to initialize profile.';
  }
}

/**
 * Save all profile data to Firestore
 */
async function saveAllData() {
  try {
    isSaving.value = true;
    errorMessage.value = '';

    if (!profileData.value.fullName || !profileData.value.email) {
      errorMessage.value = 'Please fill in all required fields';
      isSaving.value = false;
      return;
    }

    // Validate calorie goal
    const calorieGoal = Number(goalsData.value.dailyGoal);
    if (!Number.isFinite(calorieGoal) || calorieGoal < 800 || calorieGoal > 5000) {
      errorMessage.value = 'Daily calorie goal must be between 800 and 5000 kcal.';
      isSaving.value = false;
      return;
    }

    const userDocRef = doc(db, 'users', currentUser.value.uid);
    
    const dataToSave = {
      fullName: profileData.value.fullName,
      email: profileData.value.email,
      gender: profileData.value.gender || '',
      age: profileData.value.age || null,
      height: profileData.value.height || null,
      weight: profileData.value.weight || null,

      // Goals data
      goalType: goalsData.value.goalType || '',
      dailyGoal: calorieGoal,
      dietaryPreference: goalsData.value.dietaryPreference || '',
      allergies: goalsData.value.allergies || '',
      workoutFrequency: goalsData.value.workoutFrequency || 3,
      
      // Metadata
      updatedAt: serverTimestamp()
    };

    // Save to users document
    await setDoc(userDocRef, dataToSave, { merge: true });

    // IMPORTANT: Also update the calorie goal in the calories service
    await caloriesService.updateDailyGoal(calorieGoal);

    // Update display name if changed
    if (currentUser.value.displayName !== profileData.value.fullName) {
      await updateProfile(currentUser.value, {
        displayName: profileData.value.fullName
      });
    }

    successMessage.value = 'All changes saved successfully!';
    
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
    
  } catch (error) {
    console.error('Error saving profile:', error);
    errorMessage.value = `Failed to save changes: ${error.message}`;
  } finally {
    isSaving.value = false;
  }
}

/**
 * Handle user logout
 */
async function handleLogout() {
  try {
    // Clean up subscriptions before logging out
    try {
      caloriesService.unsubscribeAll();
    } catch (e) {
      console.error('Error during cleanup:', e);
    }
    
    try {
      if (workoutUnsubscribe.value) {
        workoutUnsubscribe.value();
        workoutUnsubscribe.value = null;
      }
    } catch (e) {
      console.error('Error during workout cleanup:', e);
    }
    
    await signOut(auth);
    router.push('/login');
  } catch (error) {
    console.error('Error logging out:', error);
    errorMessage.value = 'Failed to logout. Please try again.';
  }
}

/**
 * Show delete account confirmation modal
 */
function confirmDeleteAccount() {
  showDeleteModal.value = true;
  deletePassword.value = '';
  deleteError.value = '';
}

/**
 * Close delete account modal
 */
function closeDeleteModal() {
  showDeleteModal.value = false;
  deletePassword.value = '';
  deleteError.value = '';
}

/**
 * Handle password submission for account deletion
 */
function handlePasswordSubmit() {
  if (deletePassword.value.trim()) {
    deleteError.value = '';
    deleteAccount(currentUser.value.uid, deletePassword.value);
  }
}

/**
 * Delete user account with re-authentication
 */
async function deleteAccount(uid, password) {
  try {
    isSaving.value = true;
    errorMessage.value = '';
    
    // Step 1: Re-authenticate user before deletion
    console.log('Re-authenticating user...');
    const credential = EmailAuthProvider.credential(currentUser.value.email, password);
    await reauthenticateWithCredential(currentUser.value, credential);
    console.log('Re-authentication successful');
    
    // Step 2: Delete user-related data from Firestore
    console.log('Deleting user data from Firestore...');
    
    // Delete main user document
    const userDocRef = doc(db, 'users', uid);
    await deleteDoc(userDocRef);
    console.log('Main user document deleted');
    
    // Delete user calories data
    try {
      const caloriesDocRef = doc(db, 'calories', uid);
      await deleteDoc(caloriesDocRef);
      console.log('User calories data deleted');
    } catch (caloriesError) {
      console.log('No calories data found or error deleting calories:', caloriesError.message);
    }
    
    // Delete user profiles data (if exists)
    try {
      const userProfileDocRef = doc(db, 'userProfiles', uid);
      await deleteDoc(userProfileDocRef);
      console.log('User profile data deleted');
    } catch (profileError) {
      console.log('No user profile data found or error deleting profile:', profileError.message);
    }
    
    // Delete workout sets subcollection (users/{uid}/workoutSets)
    try {
      const workoutSetsRef = collection(db, 'users', uid, 'workoutSets');
      const workoutSetsSnapshot = await getDocs(workoutSetsRef);
      const deletePromises = workoutSetsSnapshot.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      console.log('User workout sets (subcollection) deleted');
    } catch (workoutError) {
      console.log('No workout sets subcollection found or error deleting workout sets:', workoutError.message);
    }

    // Delete top-level workoutSets documents where userId == uid
    try {
      const q = query(collection(db, 'workoutSets'), where('userId', '==', uid));
      const snapshot = await getDocs(q);
      const promises = snapshot.docs.map(d => deleteDoc(doc(db, 'workoutSets', d.id)));
      await Promise.all(promises);
      console.log('Top-level workoutSets documents deleted');
    } catch (topWorkoutError) {
      console.log('No top-level workoutSets found or error deleting them:', topWorkoutError.message);
    }

    // Delete publishedWorkouts (top-level) where userId == uid
    try {
      const pubQ = query(collection(db, 'publishedWorkouts'), where('userId', '==', uid));
      const pubSnap = await getDocs(pubQ);
      const pubPromises = pubSnap.docs.map(d => deleteDoc(doc(db, 'publishedWorkouts', d.id)));
      await Promise.all(pubPromises);
      console.log('Published workouts deleted');
    } catch (pubErr) {
      console.log('No publishedWorkouts found or error deleting them:', pubErr.message);
    }

    // Delete workout reviews authored by the user (top-level collection workoutReviews)
    try {
      const revQ = query(collection(db, 'workoutReviews'), where('userId', '==', uid));
      const revSnap = await getDocs(revQ);
      const revPromises = revSnap.docs.map(d => deleteDoc(doc(db, 'workoutReviews', d.id)));
      await Promise.all(revPromises);
      console.log('User workout reviews deleted');
    } catch (revErr) {
      console.log('No workout reviews found or error deleting them:', revErr.message);
    }

    
    // Step 3: Delete user from Firebase Authentication
    console.log('Deleting user from Authentication...');
    await deleteUser(currentUser.value);
    console.log('User account deleted successfully');
    
    // Step 4: Clear any local storage or session data
    localStorage.clear();
    sessionStorage.clear();
    
    // Close the modal
    closeDeleteModal();
    
    // Redirect to home/login page
    successMessage.value = 'Your account has been successfully deleted. You will now be redirected to the home page.';
    
    // Wait a moment for the user to see the success message
    setTimeout(() => {
      router.push('/');
    }, 2000);
    
  } catch (error) {
    console.error('Error deleting account:', error);
    
    if (error.code === 'auth/wrong-password') {
      deleteError.value = 'Incorrect password. Please try again.';
    } else if (error.code === 'auth/invalid-credential') {
      deleteError.value = 'Invalid credentials. Please check your password and try again.';
    } else if (error.code === 'auth/too-many-requests') {
      deleteError.value = 'Too many failed attempts. Please try again later.';
      closeDeleteModal();
      errorMessage.value = 'Too many failed attempts. Please try again later.';
    } else if (error.code === 'auth/requires-recent-login') {
      deleteError.value = 'This operation requires recent authentication. Please log out and log back in, then try again.';
      closeDeleteModal();
      errorMessage.value = 'This operation requires recent authentication. Please log out and log back in, then try again.';
    } else if (error.code === 'auth/user-not-found') {
      deleteError.value = 'User not found. Please try logging in again.';
      closeDeleteModal();
      errorMessage.value = 'User not found. Please try logging in again.';
    } else {
      deleteError.value = `Failed to delete account: ${error.message}`;
    }
  } finally {
    isSaving.value = false;
  }
}

/**
 * Initialize Chart.js
 */
function initializeCharts() {
  if (!calorieChartRef.value) return
  const ctx = calorieChartRef.value.getContext('2d')
  const series = weeklyCalorieData.value
  const labels = series.map(s => (s.date))
  const values = series.map(s => s.consumed || 0)
  const maxVal = Math.max(0, ...values)
  const paddedMax = maxVal > 0 ? Math.ceil(maxVal * 1.2) : 100

  if (chartInstance.value) {
    chartInstance.value.destroy()
  }

  chartInstance.value = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Calories',
        data: values,
        backgroundColor: 'rgb(0, 130, 128)',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          suggestedMin: 0,
          suggestedMax: paddedMax,
          ticks: { precision: 0 }
        }
      },
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Last 7 days' }
      }
    }
  })
}


async function setupWorkoutListener(uid) {
  console.log('🔵 Loading workouts for user:', uid);
  
  try {
    loadingWorkouts.value = true;
    
    // Get workout sets from workoutSets collection (not publishedWorkouts)
    const workouts = await workoutVaultService.getUserWorkouts(uid);
    console.log('✅ Workouts loaded:', workouts);
    console.log('✅ Count:', workouts?.length || 0);
    
    userWorkoutSets.value = workouts || [];
    
  } catch (error) {
    console.error('❌ Error loading workouts:', error);
    userWorkoutSets.value = [];
  } finally {
    loadingWorkouts.value = false;
  }
}

/**
 * Navigate to workout vault page
 */
function viewAllWorkouts() {
  try {
    router.push('/workout-sets');
  } catch (error) {
    console.error('Error navigating to workout sets:', error);
    errorMessage.value = 'Navigation error. Please try again.';
  }
}

/**
 * Show delete workout confirmation modal
 */
function confirmDeleteWorkout(workout) {
  workoutToDelete.value = workout;
  showDeleteWorkoutModal.value = true;
}

/**
 * Delete workout from Firestore
 */
async function deleteWorkout() {
  if (!workoutToDelete.value) return;

  try {
    isSaving.value = true;
    errorMessage.value = '';

    // Delete from Firestore
    const workoutRef = doc(db, 'workoutSets', workoutToDelete.value.id);
    await deleteDoc(workoutRef);

    // Remove from local array
    const index = userWorkoutSets.value.findIndex(w => w.id === workoutToDelete.value.id);
    if (index !== -1) {
      userWorkoutSets.value.splice(index, 1);
    }

    successMessage.value = 'Workout deleted successfully!';
    showDeleteWorkoutModal.value = false;
    workoutToDelete.value = null;

    setTimeout(() => {
      successMessage.value = '';
    }, 3000);

  } catch (error) {
    console.error('Error deleting workout:', error);
    errorMessage.value = `Failed to delete workout: ${error.message}`;
  } finally {
    isSaving.value = false;
  }
}

/**
 * Truncate text to specified length
 */
function truncateText(text, maxLength) {
  if (!text) return 'No description available';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Format workout rating for display
 */
function formatWorkoutRating(workout) {
  if (!workout.avgRating || workout.avgRating === 0) {
    return 'No ratings yet';
  }
  const rating = workout.avgRating.toFixed(1);
  const count = workout.reviewsCount || 0;
  return `${rating} (${count})`;
}

/**
 * Open edit modal for a workout
 */
function openEditModal(workout) {
  try {
    editingWorkout.value = { 
      ...workout, 
      exercises: [...(workout.exercises || [])] 
    };
    clearSearch();
    fetchExercises(); // Preload exercises
    showEditModal.value = true;
  } catch (error) {
    console.error('Error opening edit modal:', error);
    errorMessage.value = 'Failed to open edit modal. Please try again.';
  }
}

/**
 * Fetch exercises from API
 */
async function fetchExercises(query = '') {
  if (searchLoading.value) return;
  
  searchLoading.value = true;
  searchError.value = '';
  
  try {
    const baseUrl = `${API_BASE_URL}/exercises`;
    const params = new URLSearchParams({
      limit: EXERCISES_PER_PAGE,
      offset: 0
    });
    
    if (query.trim()) {
      params.append('search', query.trim());
    }
    
    const response = await fetch(`${baseUrl}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch exercises: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
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
      }));
      
      searchedExercises.value = mappedExercises;
    } else {
      searchedExercises.value = Array.isArray(data) ? data : (data.exercises || []);
    }
    
  } catch (err) {
    console.error('Error fetching exercises:', err);
    searchError.value = err.message || 'Failed to load exercises. Please check your internet connection and try again.';
    searchedExercises.value = [];
  } finally {
    searchLoading.value = false;
  }
}

/**
 * Handle search input with debounce
 */
function handleSearch() {
  clearTimeout(searchTimeout.value);
  
  searchTimeout.value = setTimeout(() => {
    if (searchQuery.value.trim()) {
      fetchExercises(searchQuery.value.trim());
    } else {
      clearSearch();
    }
  }, 500);
}

/**
 * Clear search state
 */
function clearSearch() {
  searchQuery.value = '';
  searchedExercises.value = [];
  searchError.value = '';
}

/**
 * Format exercise name
 */
function formatExerciseName(name) {
  if (!name) return 'Exercise';
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format target muscles
 */
function formatTarget(target) {
  if (!target) return 'Full Body';
  if (Array.isArray(target)) {
    return target.join(', ');
  }
  return target.toString().replace(/[\[\]"]/g, '').replace(/,/g, ', ');
}

/**
 * Format body part
 */
function formatBodyPart(bodyPart) {
  if (!bodyPart) return 'General';
  if (Array.isArray(bodyPart)) {
    return bodyPart.join(', ');
  }
  return bodyPart.toString().replace(/[\[\]"]/g, '').replace(/,/g, ', ');
}

/**
 * Format equipment
 */
function formatEquipment(equipment) {
  if (!equipment) return 'Bodyweight';
  if (Array.isArray(equipment)) {
    return equipment.join(', ');
  }
  return equipment.toString().replace(/[\[\]"]/g, '').replace(/,/g, ', ');
}

/**
 * Add exercise to workout
 */
function addExerciseToWorkout(exercise) {
  try {
    if (!editingWorkout.value.exercises) {
      editingWorkout.value.exercises = [];
    }
    
    // Check if exercise is already in workout
    const exists = editingWorkout.value.exercises.some(ex => ex.id === exercise.id);
    if (!exists) {
      editingWorkout.value.exercises.push({
        id: exercise.id,
        name: exercise.name,
        target: exercise.target,
        bodyPart: exercise.bodyPart,
        equipment: exercise.equipment,
        gifUrl: exercise.gifUrl,
        instructions: exercise.instructions,
        secondaryMuscles: exercise.secondaryMuscles
      });
    }
  } catch (error) {
    console.error('Error adding exercise:', error);
    errorMessage.value = 'Failed to add exercise. Please try again.';
  }
}

/**
 * Remove exercise from workout
 */
function removeExerciseFromWorkout(index) {
  try {
    if (editingWorkout.value.exercises && index >= 0 && index < editingWorkout.value.exercises.length) {
      editingWorkout.value.exercises.splice(index, 1);
    }
  } catch (error) {
    console.error('Error removing exercise:', error);
    errorMessage.value = 'Failed to remove exercise. Please try again.';
  }
}



/**
 * Check if exercise is in workout
 */
function isExerciseInWorkout(exerciseId) {
  return editingWorkout.value.exercises?.some(ex => ex.id === exerciseId) || false;
}

/**
 * Save workout edits
 */
async function saveWorkoutEdit() {
  try {
    isSaving.value = true;
    errorMessage.value = '';

    if (!editingWorkout.value.name || !editingWorkout.value.name.trim()) {
      errorMessage.value = 'Please enter a workout name';
      isSaving.value = false;
      return;
    }

    // Update workout in Firebase Firestore directly
    const workoutRef = doc(db, 'workoutSets', editingWorkout.value.id);
    await setDoc(workoutRef, {
      name: editingWorkout.value.name,
      description: editingWorkout.value.description || '',
      exercises: editingWorkout.value.exercises || [],
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Manually update the local userWorkoutSets array to reflect changes immediately
    const index = userWorkoutSets.value.findIndex(w => w.id === editingWorkout.value.id);
    if (index !== -1) {
      userWorkoutSets.value[index] = {
        ...userWorkoutSets.value[index],
        name: editingWorkout.value.name,
        description: editingWorkout.value.description || '',
        exercises: editingWorkout.value.exercises || [],
        updatedAt: new Date().toISOString()
      };
    }

    successMessage.value = 'Workout updated successfully!';
    showEditModal.value = false;
    clearSearch();
    editingWorkout.value = {};

    setTimeout(() => {
      successMessage.value = '';
    }, 3000);

  } catch (error) {
    console.error('Error saving workout:', error);
    errorMessage.value = `Failed to save workout: ${error.message}`;
  } finally {
    isSaving.value = false;
  }
}
</script>

<style scoped>
/* Container */
.profile-container {
  min-height: 100vh;
  background-color: var(--surface);
  padding: 20px 0;
}

/* View Toggle */
.view-toggle-container {
  display: flex;
  justify-content: center;
  animation: fadeInDown 0.6s ease-out;
}

.view-toggle {
  display: inline-flex;
  background: var(--surface);
  border: 2px solid var(--border-subtle);
  border-radius: 50px;
  padding: 6px;
  box-shadow: var(--shadow-card);
  gap: 6px;
}

.toggle-btn {
  padding: 12px 32px;
  border: none;
  border-radius: 50px;
  background: transparent;
  color: var(--muted);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  white-space: nowrap;
}

.toggle-btn i {
  transition: transform 0.3s ease;
}

.toggle-btn:hover {
  color: var(--text);
  transform: translateY(-2px);
}

.toggle-btn:hover i {
  transform: scale(1.2);
}

.toggle-btn.active {
  background: linear-gradient(135deg, var(--primary) 0%, #7083eb 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(112, 131, 235, 0.4);
  transform: translateY(-1px);
}

.toggle-btn.active i {
  animation: iconPop 0.4s ease-out;
}

@keyframes iconPop {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
}

.toggle-btn:active {
  transform: translateY(0);
}

.toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@media (max-width: 576px) {
  .view-toggle {
    width: 100%;
  }
  
  .toggle-btn {
    flex: 1;
    padding: 12px 16px;
    font-size: 0.9rem;
  }
}

/* Title with animation */
.page-title {
  color: var(--text);
  font-weight: 800;
  text-align: center;
  animation: fadeInDown 0.6s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Cards */
.card {
  border: 2px solid var(--border-subtle);
  border-radius: 12px;
  transition: all 0.3s ease;
  background: var(--surface);
  box-shadow: var(--shadow-card);
  animation: fadeInUp 0.6s ease-out backwards;
  overflow: hidden;
}

.input-label {
  color: var(--muted);
}

.card:nth-child(1) { animation-delay: 0.1s; }
.card:nth-child(2) { animation-delay: 0.2s; }
.card:nth-child(3) { animation-delay: 0.3s; }
.card:nth-child(4) { animation-delay: 0.4s; }
.card:nth-child(5) { animation-delay: 0.5s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px var(--shadow-card);
}

.card-header {
  background-color: var(--surface-subtle);
  color: #ffffff !important;
  border-radius: 12px 12px 0 0 !important;
  font-weight: 600;
  padding: 1rem 1.5rem;
}

.card-body {
  background: var(--bg);
  border-radius: 0 0 12px 12px;
  border: 2px solid var(--border-subtle);
  border-top: 0px;
}

/* Profile Picture */
.profile-picture-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: scaleIn 0.6s ease-out;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.profile-picture {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: var(--shadow-card);
  transition: all 0.4s ease;
  position: relative;
}

.profile-picture:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 12px 24px var(--shadow-card);
}

.btn-change-photo {
  background-color: var(--surface);
  color: var(--primary);
  border: 1px solid var(--primary);
  border-radius: 8px;
  padding: 10px 20px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-change-photo:hover {
  background-color: var(--primary);
  color: white;
  transform: translateY(-2px) scale(1.05);
  box-shadow: var(--shadow-card);
}

.btn-change-photo:active {
  transform: translateY(1px);
}

/* Forms */
.form-label {
  font-weight: 600;
  color: var(--text);
  transition: color 0.2s ease;
}

.form-check-input {
  cursor: pointer;
  transition: all 0.3s ease;
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-subtle);
  border-radius: 4px;
  background-color: var(--surface-subtle);
  appearance: none;
  position: relative;
}

.form-check-input:hover {
  border-color: var(--primary);
  background-color: var(--surface-hover, #f0f0f0);
}

.form-check-input:checked {
  background-color: var(--primary);
  border-color: var(--primary);
  transform: scale(1.1);
}

.form-check-input:checked::after {
  content: "✔";
  color: var(--on-primary, #fff);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -60%);
  font-size: 0.8rem;
  font-weight: bold;
}

.form-check-input:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--primary-transparent, rgba(0, 123, 255, 0.25));
}

.form-check-label {
  cursor: pointer;
  transition: color 0.2s ease;
  color: var(--text);
}

.form-check-label:hover {
  color: var(--primary);
}

/* Chart Placeholder */
.chart-placeholder {
  border-radius: 10px;
  padding: 0;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.3s ease;
}

/* Full Width Stat Cards */
.stat-card-full {
  background-color: var(--surface);
  color: var(--text);
  border: 2px solid var(--border-subtle);
  padding: 20px;
  border-radius: 12px;
  box-shadow: var(--shadow-card);
  width: 100%;
  transition: all 0.3s ease;
  animation: slideInRight 0.6s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.stat-card-full:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 12px var(--shadow-card);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.stat-header h6 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
}

.stat-header h3 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.progress-full {
  height: 30px;
  border-radius: 15px;
  background-color: var(--surface-subtle);
  overflow: hidden;
  margin-bottom: 10px;
  position: relative;
}

.progress-full .progress-bar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  position: relative;
  overflow: hidden;
}

.progress-full .progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background-color: var(--text);
  animation: shimmer 2s 1;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.stat-card-full small {
  display: block;
  margin-top: 5px;
  font-size: 0.85rem;
  color: var(--muted);
}

/* Buttons */
.u-btn--primary-success::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
  z-index: 0;
}

.u-btn--primary-success:hover::before {
  width: 300px;
  height: 300px;
}

.u-btn--primary-success:hover {
  color: white;
  background-color: rgb(66, 176, 110);
  border-color: rgb(66, 176, 110);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(134, 255, 168, 0.4);
}

.u-btn--primary-success:active {
  transform: translateY(1px);
}

.u-btn--primary-success span,
.u-btn--primary-success i {
  position: relative;
  z-index: 1;
}

.btn-outline-secondary {
  color: red;
  background-color: var(--surface);
  border: 1px solid red;
  transition: all 0.3s ease;
  font-weight: 600;
  position: relative;
  overflow: hidden;
}

.u-btn--primary-danger:hover::before {
  width: 300px;
  height: 300px;
}

.u-btn--primary-danger:hover {
  color: white;
  border-color: rgb(224, 41, 41);
  background-color: rgb(224, 41, 41);
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(255, 91, 91, 0.4);
}

.btn-outline-secondary:active {
  transform: translateY(1px);
}

.btn-outline-secondary span,
.btn-outline-secondary i {
  position: relative;
  z-index: 1;
}

.btn-outline-danger {
  color: rgb(224, 41, 41);
  background-color: var(--surface);
  border: 1px solid rgb(224, 41, 41);
  transition: all 0.3s ease;
  font-weight: 600;
}

.btn-outline-danger:hover::before {
  width: 300px;
  height: 300px;
}

.btn-outline-danger:hover {
  color: white;
  border-color: rgb(224, 41, 41);
  background-color: rgb(224, 41, 41);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 18px rgba(255, 91, 91, 0.4);
}

.btn-outline-danger:active {
  transform: translateY(1px);
}

.btn-primary:disabled,
.btn-outline-secondary:disabled,
.btn-outline-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* Alerts */
.alert {
  border-radius: 12px;
  border: none;
  animation: slideInFromTop 0.4s ease-out;
  background-color: var(--surface);
}

@keyframes slideInFromTop {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert-success {
  background-color: var(--surface);
  color: var(--primary);
  border-left: 4px solid var(--primary);
  box-shadow: var(--shadow-card);
}

.alert-danger {
  background-color: var(--surface);
  color: var(--primary);
  border-left: 4px solid var(--primary);
  box-shadow: var(--shadow-card);
}

.alert-info {
  background-color: var(--surface);
  color: var(--text);
  border: 2px solid var(--border-subtle);
}

.alert-light {
  background-color: var(--surface);
  color: var(--text);
  border: 2px solid var(--border-subtle);
}

.btn-close {
  filter: brightness(0) invert(1);
  transition: transform 0.2s ease;
  opacity: 0.8;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  width: 1em;
  height: 1em;
}

.btn-close:hover {
  transform: scale(1.2) rotate(90deg);
  opacity: 1;
}

.modal-header-delete .btn-close {
  filter: brightness(0) invert(1);
  opacity: 0.9;
}

.modal-header-delete .btn-close:hover {
  opacity: 1;
  transform: scale(1.2) rotate(90deg);
}

/* Loading Spinner */
.spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.3em;
  animation: spin 1s linear infinite, pulse 2s ease-in-out infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.spinner-border.text-primary {
  color: var(--primary) !important;
}

/* BMI Alert */
.alert-info strong {
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

/* Icons */
.bi {
  color: var(--text);
  transition: all 0.3s ease;
}

.card-header .bi {
  color: #ffffff;
}

.card-header .bi:hover {
  transform: scale(1.2) rotate(10deg);
}

/* Form Controls - Consistent Sizing */
.card-body .form-control,
.card-body .form-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  background-color: var(--surface);
  color: var(--text);
  transition: all 0.3s ease;
  box-sizing: border-box;
  height: calc(1.5em + 1rem + 2px);
}

.card-body input[type="number"].form-control {
  -moz-appearance: textfield;
  appearance: textfield;
}

.card-body input[type="number"]::-webkit-outer-spin-button,
.card-body input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.card-body textarea.form-control {
  height: auto;
  min-height: calc(1.5em + 1rem + 2px);
}

/* Input focus */
.form-control:focus,
.form-select:focus {
  animation: inputGlow 0.6s ease-out;
  border-color: var(--primary);
  outline: 0;
}

@keyframes inputGlow {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--ring) 40%, transparent);
  }
  100% {
    box-shadow: 0 0 0 0.2rem color-mix(in srgb, var(--ring) 40%, transparent);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .profile-picture {
    width: 120px;
    height: 120px;
  }

  .stat-header h3 {
    font-size: 1.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .card:hover {
    transform: translateY(-4px);
  }
}

html {
  scroll-behavior: smooth;
}

@keyframes float {
  0%, 100% {
    transform: translateY(-8px);
  }
  50% {
    transform: translateY(-12px);
  }
}

@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css');

/* Workout Mini Cards */
.workout-mini-card {
  background: var(--surface);
  border: 2px solid var(--border-subtle);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-card);
}

.workout-mini-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px var(--shadow-card);
  border-color: var(--primary);
}

.workout-mini-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.workout-mini-title {
  font-weight: 600;
  font-size: 1rem;
  margin: 0;
  color: var(--text);
  flex: 1;
  line-height: 1.3;
}

.workout-mini-count {
  font-size: 0.75rem;
  white-space: nowrap;
  margin-left: 0.5rem;
}

.workout-mini-description {
  font-size: 0.85rem;
  line-height: 1.4;
  margin-bottom: 0.75rem;
  flex-grow: 1;
  min-height: 2.8em;
}

.workout-mini-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-subtle);
}

.workout-mini-stars {
  display: flex;
  align-items: center;
  gap: 2px;
}

.star-mini {
  width: 14px;
  height: 14px;
  opacity: 0.3;
  filter: grayscale(100%);
}

.star-mini.star-filled {
  opacity: 1;
  filter: grayscale(0%);
}

.rating-mini-text {
  font-size: 0.75rem;
  margin-left: 0.25rem;
}

.workout-mini-duration {
  font-size: 0.75rem;
  font-weight: 500;
}

/* Button styling for View All */
.btn-outline-light {
  color: white;
  border-color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
  transition: all 0.3s ease;
}

.btn-outline-light:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: white;
  color: white;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .workout-mini-card {
    margin-bottom: 1rem;
  }
}

/* Edit Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content-large {
  background: var(--bg);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 1200px;
  width: 95%;
  max-height: 95vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
  border: 2px solid var(--border-subtle);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Small Modal for Delete Confirmation */
.modal-content-small {
  background: var(--bg);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 95%;
  animation: slideUp 0.3s ease;
  border: 2px solid var(--border-subtle);
  overflow: hidden;
}

.modal-header-delete {
  padding: 1.5rem 2rem;
  border-bottom: 2px solid var(--border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #2a2a2a;
  color: white;
  border-radius: 20px 20px 0 0;
}

.modal-header-delete .modal-title {
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.modal-body-delete {
  padding: 2rem 2.5rem;
  color: var(--text);
  background: var(--bg);
}

.modal-body-delete p {
  line-height: 1.6;
}

.modal-footer-delete {
  padding: 1.5rem 2rem;
  border-top: 2px solid var(--border-subtle);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  background: var(--bg);
  border-radius: 0 0 20px 20px;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 2px solid var(--border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--surface-subtle);
}

.modal-header.bg-danger {
  background: rgb(224, 41, 41) !important;
  color: white !important;
}

.modal-header.bg-danger .modal-title {
  color: white !important;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--text);
}

.btn-close-white {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text);
  transition: all 0.3s ease;
  opacity: 0.7;
}

.btn-close-white:hover {
  opacity: 1;
  transform: scale(1.1) rotate(90deg);
}

.modal-body {
  max-height: 70vh;
  overflow-y: auto;
  color: white;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 2px solid var(--border-subtle);
  display: flex;
  gap: 1rem;
  justify-content: center;
  background: var(--surface-subtle);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text);
  font-size: 0.95rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border-subtle);
  border-radius: 8px;
  font-size: 1rem;
  line-height: 1.5;
  background: var(--surface);
  color: var(--text);
  transition: all 0.3s ease;
  box-sizing: border-box;
  height: calc(1.5em + 1.5rem + 4px);
}

.form-control[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.form-control[type="number"]::-webkit-outer-spin-button,
.form-control[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 0.2rem rgba(112, 131, 235, 0.25);
}

.form-control::placeholder {
  color: var(--muted);
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
  height: auto;
}

.current-exercises {
  max-height: 400px;
  overflow-y: auto;
  border: 2px solid var(--border-subtle);
  border-radius: 8px;
  padding: 0.75rem;
  background: var(--surface);
}

.exercise-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  margin-bottom: 0.5rem;
  background: var(--bg);
  transition: all 0.3s ease;
}

.exercise-item:last-child {
  margin-bottom: 0;
}

.exercise-item:hover {
  border-color: var(--primary);
  transform: translateX(4px);
}

.exercise-info {
  flex: 1;
}

.exercise-name {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--text);
}

.exercise-target {
  font-size: 0.85rem;
  margin: 0;
  color: var(--muted);
}

.exercise-equipment {
  font-size: 0.8rem;
  color: var(--muted);
  margin: 0.25rem 0 0 0;
}

.search-container {
  margin-bottom: 1rem;
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

.input-group .form-control {
  flex: 1;
}

.input-group .btn {
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-subtle);
  background: var(--surface);
  color: var(--text);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.input-group .btn:hover {
  background: var(--surface-hover);
  border-color: var(--primary);
}

.search-results {
  max-height: 500px;
  overflow-y: auto;
  border: 2px solid var(--border-subtle);
  border-radius: 8px;
  padding: 0.75rem;
  background: var(--surface);
}

.search-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  margin-bottom: 0.5rem;
  background: var(--bg);
  transition: all 0.3s ease;
}

.search-result-item:last-child {
  margin-bottom: 0;
}

.search-result-item:hover {
  border-color: var(--primary);
  transform: translateX(4px);
  background: var(--surface-subtle);
}

.search-loading {
  color: var(--muted);
  font-style: italic;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-danger {
  background-color: rgb(224, 41, 41);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.btn-danger:hover {
  background-color: rgb(200, 35, 35);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(224, 41, 41, 0.3);
}

.btn-danger:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .modal-content-large {
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
  .search-results {
    max-height: 300px;
  }
  
  .modal-title {
    font-size: 1.25rem;
  }
}

/* Delete Modal Specific Styles */
.modal.fade.show.d-block {
  z-index: 9999 !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.modal-dialog-centered {
  z-index: 10000 !important;
}

.modal-content {
  background-color: var(--bg) !important;
  border: 2px solid var(--border-subtle) !important;
  border-radius: 12px !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important;
}

/* Simplified Workout Card */
.workout-card-simple {
  background: var(--surface-subtle);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-subtle);
  position: relative;
}

.workout-card-simple:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: var(--primary);
}

/* Delete Button on Workout Card */
.delete-workout-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  padding: 0;
  opacity: 1;
  background-size: 0.75em;
  background-position: center;
  background-repeat: no-repeat;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23e02929'%3e%3cpath d='M.293.293a1 1 0 0 1 1.414 0L8 6.586 14.293.293a1 1 0 1 1 1.414 1.414L9.414 8l6.293 6.293a1 1 0 0 1-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L6.586 8 .293 1.707a1 1 0 0 1 0-1.414z'/%3e%3c/svg%3e");
}

.delete-workout-btn:hover {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23e02929'%3e%3cpath d='M.293.293a1 1 0 0 1 1.414 0L8 6.586 14.293.293a1 1 0 1 1 1.414 1.414L9.414 8l6.293 6.293a1 1 0 0 1-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L6.586 8 .293 1.707a1 1 0 0 1 0-1.414z'/%3e%3c/svg%3e");
  transform: scale(1.2) rotate(90deg);
  opacity: 1;
}

.workout-card-header {
  margin-bottom: 0.75rem;
}

.workout-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.25rem;
}

.workout-description {
  font-size: 0.85rem;
  color: var(--muted);
  line-height: 1.4;
}

/* Workout Stats - Simplified */
.workout-stats-simple {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.stat-item-simple {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: var(--muted);
}

.stat-item-simple i {
  color: var(--primary);
}

/* Exercise Tags - Simplified */
.exercise-tags-simple {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.exercise-tag-simple {
  background: #171717;
  color: var(--muted);
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  text-transform: capitalize;
}

.exercise-tag-simple.more-tag {
  background: var(--primary);
  color: white;
}

/* Responsive Design for Simplified Workout Cards */
@media (max-width: 768px) {
  .workout-card-simple {
    padding: 0.875rem;
  }

  .workout-name {
    font-size: 0.95rem;
  }

  .stat-item-simple {
    font-size: 0.8rem;
  }

  .exercise-tag-simple {
    font-size: 0.7rem;
    padding: 0.2rem 0.6rem;
  }
}
</style>