<template>
  <div class="profile-container">
    <div class="container py-4">
      <h1 class="page-title mb-4">My Profile</h1>

      <!-- Success/Error Messages -->
      <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
        {{ successMessage }}
        <button type="button" class="btn-close" @click="successMessage = ''">×</button>
      </div>
      <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
        {{ errorMessage }}
        <button type="button" class="btn-close" @click="errorMessage = ''">×</button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else class="row">
        <div class="col-lg-12">
          
          <!-- Calorie Goal Card -->
          <div class="card mb-4">
            <div class="card-header text-white" style="background: var(--primary)">
              <h5 class="mb-0">Calorie Goal</h5>
            </div>
            <div class="card-body">
              <div class="row g-3 align-items-end">
                <div class="col-sm-4">
                  <label class="form-label">Daily Goal (kcal)</label>
                  <input type="number" min="800" max="5000" step="10" class="form-control" v-model.number="goalInput" />
                </div>
                <div class="col-sm-3 d-grid">
                  <button class="btn btn-primary" @click="saveCalorieGoal">Save</button>
                </div>
                <div class="col-sm-5">
                  <small class="text-muted">This goal appears as read-only on Home.</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Personal Information Card -->
          <div class="card mb-4">
            <div class="card-header text-white" style="background: var(--primary)">
              <h5 class="mb-0"><i class="bi bi-person-circle me-2"></i>Personal Information</h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="saveProfile">
                <!-- Profile Picture -->
                <div class="row mb-4">
                  <div class="col-12 text-center">
                    <div class="profile-picture-wrapper">
                      <img 
                        :src="profileData.photoURL || defaultAvatar" 
                        alt="Profile Picture" 
                        class="profile-picture"
                      >
                      <div class="mt-3">
                        <label for="photoUpload" class="btn btn-change-photo">
                          <i class="bi bi-camera me-1"></i>Change Photo
                        </label>
                        <input 
                          type="file" 
                          id="photoUpload" 
                          accept="image/*" 
                          @change="handlePhotoUpload" 
                          class="d-none"
                        >
                      </div>
                      <small class="text-muted d-block mt-2">Max size: 2MB</small>
                    </div>
                  </div>
                </div>

                <!-- Name and Email -->
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="fullName" class="form-label">Full Name *</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="fullName" 
                      v-model="profileData.fullName" 
                      required
                    >
                  </div>
                  <div class="col-md-6 mb-3">
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
                  <div class="col-md-3 mb-3">
                    <label for="gender" class="form-label">Gender</label>
                    <select class="form-select" id="gender" v-model="profileData.gender">
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                  <div class="col-md-3 mb-3">
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
                  <div class="col-md-3 mb-3">
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
                  <div class="col-md-3 mb-3">
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
            <div class="card-header text-white" style="background: var(--primary)">
              <h5 class="mb-0"><i class="bi bi-trophy me-2"></i>Health & Fitness Goals</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label for="goalType" class="form-label">Primary Goal</label>
                <select class="form-select" id="goalType" v-model="goalsData.goalType">
                  <option value="">Select your goal</option>
                  <option value="lose-weight">Lose Weight</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="gain-muscle">Gain Muscle</option>
                  <option value="improve-fitness">Improve Overall Fitness</option>
                </select>
              </div>

              <div class="mb-3">
                <label for="calorieTarget" class="form-label">Daily Calorie Target</label>
                <input 
                  type="number" 
                  class="form-control" 
                  id="calorieTarget" 
                  v-model.number="goalsData.calorieTarget" 
                  min="1000" 
                  max="5000"
                  placeholder="e.g., 2000"
                >
                <small class="text-muted">Recommended: 1800-2500 kcal for students</small>
              </div>

              <div class="mb-3">
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

              <div class="mb-3">
                <label for="allergies" class="form-label">Allergies & Food Restrictions</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="allergies" 
                  v-model="goalsData.allergies" 
                  placeholder="e.g., peanuts, shellfish, dairy"
                >
                <small class="text-muted">Separate multiple items with commas</small>
              </div>

              <div class="mb-3">
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
            </div>
          </div>

          <!-- Preferences & Integrations Card -->
          <div class="card mb-4">
            <div class="card-header text-white" style="background: var(--primary)">
              <h5 class="mb-0"><i class="bi bi-gear me-2"></i>Preferences & Integrations</h5>
            </div>
            <div class="card-body">
              <div class="form-check form-switch mb-3">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  id="spotifyConnect" 
                  v-model="preferences.spotifyConnected"
                >
                <label class="form-check-label" for="spotifyConnect">
                  <i class="bi bi-spotify me-2"></i>Connect Spotify for Workout Playlists
                </label>
              </div>

              <div class="form-check form-switch mb-3">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  id="aiSuggestions" 
                  v-model="preferences.aiSuggestionsEnabled"
                >
                <label class="form-check-label" for="aiSuggestions">
                  <i class="bi bi-robot me-2"></i>Enable AI-Powered Health Suggestions
                </label>
              </div>

              <div class="form-check form-switch mb-3">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  id="reminders" 
                  v-model="preferences.remindersEnabled"
                >
                <label class="form-check-label" for="reminders">
                  <i class="bi bi-bell me-2"></i>Enable Reminders & Notifications
                </label>
              </div>

              <div class="form-check form-switch">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  id="darkMode" 
                  v-model="preferences.darkMode"
                >
                <label class="form-check-label" for="darkMode">
                  <i class="bi bi-moon me-2"></i>Dark Mode
                </label>
              </div>
            </div>
          </div>

          <!-- Progress Overview Card -->
          <div class="card mb-4">
            <div class="card-header text-white" style="background: var(--primary)">
              <h5 class="mb-0"><i class="bi bi-graph-up me-2"></i>Progress Overview</h5>
            </div>
            <div class="card-body">
              <!-- Weekly Calorie Chart -->
              <div v-reveal class="chart-placeholder mb-3" style="min-height: 240px; height: 32vh; max-height: 380px;">
                <canvas id="calorieChart" ref="calorieChartRef" style="width: 100%; height: 100%;"></canvas>
                <p class="text-center text-muted mt-2">Weekly Calorie Intake</p>
              </div>

              <!-- Workout Streak Display -->
              <div class="stat-card-full mb-3">
                <div class="stat-header">
                  <h6>Workout Streak</h6>
                  <h3>{{ workoutStreak }} days</h3>
                </div>
                <div class="progress-full">
                  <div 
                    class="progress-bar" 
                    role="progressbar" 
                    :style="{ width: (workoutStreak / 12 * 100) + '%', background: 'var(--primary)' }"
                    :aria-valuenow="workoutStreak" 
                    aria-valuemin="0" 
                    aria-valuemax="12"
                  ></div>
                </div>
                <small class="text-muted">Goal: 12 days</small>
              </div>

              <!-- Study-Life Balance Progress -->
              <div class="stat-card-full">
                <div class="stat-header">
                  <h6>Study-Life Balance</h6>
                  <h3>{{ timeBalance }}%</h3>
                </div>
                <div class="progress-full">
                  <div 
                    class="progress-bar" 
                    role="progressbar" 
                    :style="{ width: timeBalance + '%', background: 'var(--primary)' }"
                    :aria-valuenow="timeBalance" 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
                <small class="text-muted">Balance between academics and personal life</small>
              </div>

              <div class="alert alert-light mt-3">
                <small><i class="bi bi-info-circle me-1"></i>Charts will display real data once you log activities</small>
              </div>
            </div>
          </div>

          <!-- Account Actions Card -->
          <div class="card mb-4">
            <div class="card-header text-white" style="background: var(--primary)">
              <h5 class="mb-0"><i class="bi bi-shield-check me-2"></i>Account Actions</h5>
            </div>
            <div class="card-body">
              <button 
                @click="saveAllData" 
                class="btn btn-primary w-100 mb-2"
                :disabled="isSaving"
              >
                <i class="bi bi-save me-2"></i>
                {{ isSaving ? 'Saving...' : 'Save All Changes' }}
              </button>

              <button 
                @click="handleLogout" 
                class="btn btn-outline-secondary w-100 mb-2"
              >
                <i class="bi bi-box-arrow-right me-2"></i>Logout
              </button>

              <hr>

              <button 
                @click="confirmDeleteAccount" 
                class="btn btn-outline-danger w-100"
              >
                <i class="bi bi-trash me-2"></i>Delete Account
              </button>
              <small class="text-muted d-block mt-2 text-center">This action cannot be undone</small>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUser } from '@/stores/user'
import { useMeals } from '@/stores/meals'
import Chart from 'chart.js/auto'
import { getAuth, onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const router = useRouter();
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

// Default avatar URL - hosted on a CDN or you can use a local asset
const defaultAvatar = ref('https://ui-avatars.com/api/?name=User&size=150&background=e63946&color=fff');

// State Management
const isLoading = ref(true);
const isSaving = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const currentUser = ref(null);

const profileData = ref({
  fullName: '',
  email: '',
  photoURL: '',
  gender: '',
  age: null,
  height: null,
  weight: null
});

const goalsData = ref({
  goalType: '',
  calorieTarget: 2000,
  dietaryPreference: '',
  allergies: '',
  workoutFrequency: 3
});

const preferences = ref({
  spotifyConnected: false,
  aiSuggestionsEnabled: true,
  remindersEnabled: true,
  darkMode: false
});

const workoutStreak = ref(4);
const timeBalance = ref(65);

// Calorie Goal Editor
const user = useUser()
const goalInput = ref(user.dailyGoal)
async function saveCalorieGoal() {
  const g = Number(goalInput.value)
  if (!Number.isFinite(g) || g < 800 || g > 5000) {
    errorMessage.value = 'Goal must be between 800 and 5000 kcal.'
    return
  }
  try {
    await user.setDailyGoal(g)
    successMessage.value = 'Daily calorie goal saved.'
  } catch (e) {
    errorMessage.value = 'Failed to save goal.'
  }
}
const calorieChartRef = ref(null);
const chartInstance = ref(null);

// Meals store for weekly calories (reuse Home data)
const meals = useMeals();

// Computed Properties
const calculatedBMI = computed(() => {
  if (profileData.value.height && profileData.value.weight) {
    const heightInMeters = profileData.value.height / 100;
    const bmi = (profileData.value.weight / (heightInMeters * heightInMeters)).toFixed(1);
    
    let category = '';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';
    
    return { value: bmi, category };
  }
  return null;
});

// Lifecycle Hooks
onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser.value = user;
      await loadUserData(user.uid);
      await meals.init();
      initializeCharts();
    } else {
      router.push('/login');
    }
  });
});

// Firebase Functions

/**
 * Load user data from Firestore
 */
async function loadUserData(uid) {
  try {
    isLoading.value = true;

    // Get user document from Firestore
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      
      // Load profile data
      profileData.value = {
        fullName: data.fullName || currentUser.value.displayName || '',
        email: data.email || currentUser.value.email || '',
        photoURL: data.photoURL || currentUser.value.photoURL || defaultAvatar.value,
        gender: data.gender || '',
        age: data.age || null,
        height: data.height || null,
        weight: data.weight || null
      };

      // Load goals data
      goalsData.value = {
        goalType: data.goalType || '',
        calorieTarget: data.calorieTarget || 2000,
        dietaryPreference: data.dietaryPreference || '',
        allergies: data.allergies || '',
        workoutFrequency: data.workoutFrequency || 3
      };

      // Load preferences
      preferences.value = {
        spotifyConnected: data.spotifyConnected || false,
        aiSuggestionsEnabled: data.aiSuggestionsEnabled !== undefined ? data.aiSuggestionsEnabled : true,
        remindersEnabled: data.remindersEnabled !== undefined ? data.remindersEnabled : true,
        darkMode: data.darkMode || false
      };
    } else {
      // If document doesn't exist, create it with default values
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
      photoURL: currentUser.value.photoURL || defaultAvatar.value,
      gender: '',
      age: null,
      height: null,
      weight: null,
      goalType: '',
      calorieTarget: 2000,
      dietaryPreference: '',
      allergies: '',
      workoutFrequency: 3,
      spotifyConnected: false,
      aiSuggestionsEnabled: true,
      remindersEnabled: true,
      darkMode: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(userDocRef, defaultData);
    
    // Load the default data into state
    profileData.value.fullName = defaultData.fullName;
    profileData.value.email = defaultData.email;
    profileData.value.photoURL = defaultData.photoURL;
    
  } catch (error) {
    console.error('Error creating default user document:', error);
    errorMessage.value = 'Failed to initialize profile.';
  }
}

/**
 * Handle profile picture upload
 */
async function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Please select an image file';
    return;
  }

  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    errorMessage.value = 'Image size should be less than 2MB';
    return;
  }

  try {
    isSaving.value = true;
    
    // Create storage reference
    const photoStorageRef = storageRef(storage, `profile-photos/${currentUser.value.uid}`);
    
    // Upload file
    await uploadBytes(photoStorageRef, file);
    
    // Get download URL
    const photoURL = await getDownloadURL(photoStorageRef);
    
    // Update Firebase Auth profile
    await updateProfile(currentUser.value, { photoURL });
    
    // Update Firestore
    const userDocRef = doc(db, 'users', currentUser.value.uid);
    await updateDoc(userDocRef, {
      photoURL,
      updatedAt: serverTimestamp()
    });
    
    // Update local state
    profileData.value.photoURL = photoURL;
    
    successMessage.value = 'Profile picture updated successfully!';
    
  } catch (error) {
    console.error('Error uploading photo:', error);
    errorMessage.value = 'Failed to upload photo. Please try again.';
  } finally {
    isSaving.value = false;
  }
}

/**
 * Save all profile data to Firestore
 */
async function saveAllData() {
  try {
    isSaving.value = true;
    errorMessage.value = '';

    // Validate required fields
    if (!profileData.value.fullName || !profileData.value.email) {
      errorMessage.value = 'Please fill in all required fields';
      return;
    }

    const userDocRef = doc(db, 'users', currentUser.value.uid);
    
    // Prepare data to save
    const dataToSave = {
      // Profile data
      fullName: profileData.value.fullName,
      email: profileData.value.email,
      gender: profileData.value.gender,
      age: profileData.value.age,
      height: profileData.value.height,
      weight: profileData.value.weight,
      photoURL: profileData.value.photoURL,
      
      // Goals data
      goalType: goalsData.value.goalType,
      calorieTarget: goalsData.value.calorieTarget,
      dietaryPreference: goalsData.value.dietaryPreference,
      allergies: goalsData.value.allergies,
      workoutFrequency: goalsData.value.workoutFrequency,
      
      // Preferences
      spotifyConnected: preferences.value.spotifyConnected,
      aiSuggestionsEnabled: preferences.value.aiSuggestionsEnabled,
      remindersEnabled: preferences.value.remindersEnabled,
      darkMode: preferences.value.darkMode,
      
      // Metadata
      updatedAt: serverTimestamp()
    };

    // Update Firestore
    await updateDoc(userDocRef, dataToSave);

    // Update Firebase Auth display name if changed
    if (currentUser.value.displayName !== profileData.value.fullName) {
      await updateProfile(currentUser.value, {
        displayName: profileData.value.fullName
      });
    }

    successMessage.value = 'All changes saved successfully!';
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
    
  } catch (error) {
    console.error('Error saving profile:', error);
    errorMessage.value = 'Failed to save changes. Please try again.';
  } finally {
    isSaving.value = false;
  }
}

/**
 * Handle user logout
 */
async function handleLogout() {
  try {
    await signOut(auth);
    router.push('/login');
  } catch (error) {
    console.error('Error logging out:', error);
    errorMessage.value = 'Failed to logout. Please try again.';
  }
}

/**
 * Confirm and delete user account
 */
function confirmDeleteAccount() {
  const confirmed = confirm(
    'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.'
  );
  
  if (confirmed) {
    deleteAccount();
  }
}

/**
 * Delete user account (placeholder - implement with caution)
 */
async function deleteAccount() {
  try {
    // This is a sensitive operation - implement with proper security
    // You may want to require re-authentication before deletion
    
    errorMessage.value = 'Account deletion requires re-authentication. Please contact support.';
    
    // TODO: Implement proper account deletion flow
    // 1. Re-authenticate user
    // 2. Delete Firestore data
    // 3. Delete Storage files
    // 4. Delete Auth account
    
  } catch (error) {
    console.error('Error deleting account:', error);
    errorMessage.value = 'Failed to delete account. Please contact support.';
  }
}

/**
 * Initialize Chart.js (placeholder)
 */
function initializeCharts() {
  if (!calorieChartRef.value) return
  const ctx = calorieChartRef.value.getContext('2d')
  const series = meals.weekSeries(7)
  const labels = series.map(s => formatLabel(s.date))
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
        backgroundColor: 'rgba(230, 57, 70, 0.8)'
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

function formatLabel(ymd) {
  const [y, m, d] = ymd.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
/* Bootstrap Icons */
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css');

/* Container */
.profile-container {
  min-height: 100vh;
  background-color: #FFF7E6;
  padding: 20px 0;
}

/* Title */
.page-title {
  color: #495057;
  font-weight: 700;
  text-align: center;
}

/* Cards */
.card {
  border: none;
  border-radius: 15px;
  transition: transform 0.2s;
  background-color: #FFF7E6;
  
}

.card:hover {
  transform: translateY(-5px);
}

.card-header {
  background-color: #e63946 !important;
  color: #ffffff !important;
  border-radius: 15px 15px 0 0 !important;
  font-weight: 600;
}

.card-body {
  background-color: #FFEBD0;
}

/* Profile Picture */
.profile-picture-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-picture {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #e63946;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-change-photo {
  background-color: #e63946;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-change-photo:hover {
  background-color: #c53030;
  transform: scale(1.05);
}

/* Forms */
.form-label {
  font-weight: 600;
  color: #495057;
}

.form-control,
.form-select {
  border-radius: 8px;
}

.form-control:focus,
.form-select:focus {
  border-color: #e63946;
  box-shadow: 0 0 0 0.2rem rgba(230, 57, 70, 0.25);
}

.form-check-input:checked {
  background-color: #e63946;
  border-color: #e63946;
}

/* Chart Placeholder */
.chart-placeholder {
  background-color: #FFF7E6;
  border-radius: 10px;
  padding: 20px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Full Width Stat Cards */
.stat-card-full {
  background-color: #FFF7E6;
  color: #495057;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
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
}

.stat-header h3 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #e63946;
}

.progress-full {
  height: 30px;
  border-radius: 15px;
  background-color: #e9ecef;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-full .progress-bar {
  height: 100%;
  transition: width 0.6s ease;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  background: var(--primary);
}

.stat-card-full small {
  display: block;
  margin-top: 5px;
  font-size: 0.85rem;
}

/* Buttons */
.btn-primary {
  background-color: #FFF7E6;
  color: rgb(88, 88, 88);
  border: 1px solid #e63946;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #e63946 0%, rgb(253, 222, 172) 100%);
  color: white;
}

.btn-outline-secondary {
  color: rgb(88, 88, 88);
  background-color: #FFF7E6;
  border: 1px solid #6c757d;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-outline-secondary:hover {
  background: linear-gradient(135deg, #e63946 0%, rgb(253, 222, 172) 100%);
  color: white;
}

.btn-outline-danger {
  color: #e63946;
  background-color: #FFF7E6;
  border: 1px solid #e63946;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-outline-danger:hover {
  background: linear-gradient(135deg, #e63946 0%, rgb(253, 222, 172) 100%);
  color: white;
}

/* Alerts */
.alert {
  border-radius: 10px;
  border: none;
}

.alert-success {
  background-color: rgb(255, 239, 212);
  color: #e63946;
  border-left: 4px solid #e63946;
}

.alert-danger {
  background-color: rgb(255, 239, 212);
  color: #e63946;
  border-left: 4px solid #e63946;
}

.alert-info {
  background-color: rgb(255, 239, 212);
  color: #e63946;
}

.alert-light {
  background-color: rgb(255, 239, 212);
  color: #495057;
}

.btn-close {
  filter: invert(0.3) sepia(1) saturate(5) hue-rotate(315deg);
}

/* Loading Spinner */
.spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.3em;
}

.spinner-border.text-primary {
  color: #e63946 !important;
}

.card-body {
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
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
}

</style>