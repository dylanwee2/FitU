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

      <div class="row">
        <!-- Left Column: Personal Info & Goals -->
        <div class="col-lg-12">
          
          <!-- Personal Information Card -->
          <div class="card mb-4">
            <div class="card-header bg-success text-white">
              <h5 class="mb-0"><i class="bi bi-person-circle me-2"></i>Personal Information</h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="saveProfile">
                <div class="row mb-3">
                  <div class="col-md-12 text-center mb-3">
                    <!-- Profile Picture Upload -->
                    <div class="profile-picture-wrapper">
                      <img 
                        :src="profileData.photoURL || defaultAvatar" 
                        alt="Profile Picture" 
                        class="profile-picture"
                      >
                      <div class="mt-2">
                        <label for="photoUpload" class="btn btn-sm btn-outline-primary">
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
                    </div>
                  </div>
                </div>

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
                    <label for="email" class="form-label">Email</label>
                    <input 
                      type="email" 
                      class="form-control" 
                      id="email" 
                      v-model="profileData.email" 
                      disabled
                    >
                    <small class="text-muted">Email cannot be changed</small>
                  </div>
                </div>

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

                <!-- BMI Display (calculated) -->
                <div v-if="calculatedBMI" class="alert alert-info">
                  <strong>BMI:</strong> {{ calculatedBMI.value }} - {{ calculatedBMI.category }}
                </div>
              </form>
            </div>
          </div>

          <!-- Health & Fitness Goals Card -->
          <div class="card mb-4">
            <div class="card-header bg-success text-white">
              <h5 class="mb-0"><i class="bi bi-trophy me-2"></i>Health & Fitness Goals</h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="saveGoals">
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
              </form>
            </div>
          </div>

          <!-- Preferences & Integrations Card -->
          <div class="card mb-4">
            <div class="card-header bg-success text-white">
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

        </div>

        <!-- Right Column: Progress & Actions -->
        <div class="col-lg-12">
          
          <!-- Fitness Progress Overview Card -->
          <div class="card mb-4">
            <div class="card-header bg-success text-white">
              <h5 class="mb-0"><i class="bi bi-graph-up me-2"></i>Progress Overview</h5>
            </div>
            <div class="card-body">
              <!-- Placeholder for Chart.js Weekly Calorie Chart -->
              <div class="chart-placeholder mb-3">
                <canvas id="calorieChart" ref="calorieChartRef"></canvas>
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
                class="progress-bar bg-success" 
                role="progressbar" 
                :style="{ width: (workoutStreak / 12 * 100) + '%' }"
                :aria-valuenow="workoutStreak" 
                aria-valuemin="0" 
                aria-valuemax="7"
                >
                </div>
            </div>
            <small class="text-muted">Goal: 12 days</small>
            </div>

            <!-- Time Management Balance - Full Width Progress Bar -->
            <div class="stat-card-full">
            <div class="stat-header">
                <h6>Study-Life Balance</h6>
                <h3>{{ timeBalance }}%</h3>
            </div>
            <div class="progress-full">
                <div 
                class="progress-bar bg-success" 
                role="progressbar" 
                :style="{ width: timeBalance + '%' }"
                :aria-valuenow="timeBalance" 
                aria-valuemin="0" 
                aria-valuemax="100"
                >
                </div>
            </div>
            <small class="text-muted">Balance between academics and personal life</small>
            </div>

              <!-- Placeholder note for future Chart.js integration -->
              <div class="alert alert-light mt-3">
                <small><i class="bi bi-info-circle me-1"></i>Charts will display real data once you log activities</small>
              </div>
            </div>
          </div>

          <!-- Account Actions Card -->
          <div class="card">
            <div class="card-header bg-success text-white">
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
              <small class="text-muted d-block mt-2">This action cannot be undone</small>
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
// TODO: Import Firebase modules
// import { getAuth, signOut, updateProfile } from 'firebase/auth';
// import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
// import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const router = useRouter();

// State Management
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

const workoutStreak = ref(4); // Dummy data
const timeBalance = ref(65); // Dummy data (percentage)
const defaultAvatar = ref('https://via.placeholder.com/150?text=User');

const successMessage = ref('');
const errorMessage = ref('');
const isSaving = ref(false);

// Chart.js reference
const calorieChartRef = ref(null);

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
  loadUserData();
  initializeCharts();
});

// Methods

/**
 * Load user data from Firebase Auth and Firestore
 */
async function loadUserData() {
  try {
    // TODO: Replace with actual Firebase Auth integration
    // const auth = getAuth();
    // const user = auth.currentUser;
    
    // if (!user) {
    //   router.push('/login');
    //   return;
    // }

    // Load from Firebase Auth
    // profileData.value.email = user.email;
    // profileData.value.photoURL = user.photoURL || defaultAvatar.value;
    // profileData.value.fullName = user.displayName || '';

    // Load from Firestore - Personal Info
    // const db = getFirestore();
    // const userDocRef = doc(db, 'users', user.uid);
    // const userDoc = await getDoc(userDocRef);
    
    // if (userDoc.exists()) {
    //   const data = userDoc.data();
    //   profileData.value = { ...profileData.value, ...data.profile };
    // }

    // Load from Firestore - Goals
    // const goalsDocRef = doc(db, 'users', user.uid, 'goals', 'current');
    // const goalsDoc = await getDoc(goalsDocRef);
    
    // if (goalsDoc.exists()) {
    //   goalsData.value = { ...goalsData.value, ...goalsDoc.data() };
    // }

    // Load preferences
    // const prefsDocRef = doc(db, 'users', user.uid, 'preferences', 'settings');
    // const prefsDoc = await getDoc(prefsDocRef);
    
    // if (prefsDoc.exists()) {
    //   preferences.value = { ...preferences.value, ...prefsDoc.data() };
    // }

    // DUMMY DATA for testing
    profileData.value = {
      fullName: 'John Doe',
      email: 'johndoe@university.edu',
      photoURL: defaultAvatar.value,
      gender: 'male',
      age: 21,
      height: 175,
      weight: 70
    };

    goalsData.value = {
      goalType: 'maintain',
      calorieTarget: 2200,
      dietaryPreference: 'vegetarian',
      allergies: 'peanuts, shellfish',
      workoutFrequency: 4
    };

  } catch (error) {
    console.error('Error loading user data:', error);
    errorMessage.value = 'Failed to load profile data. Please refresh the page.';
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
    // TODO: Upload to Firebase Storage
    // const auth = getAuth();
    // const storage = getStorage();
    // const photoRef = storageRef(storage, `profile-photos/${auth.currentUser.uid}`);
    // await uploadBytes(photoRef, file);
    // const photoURL = await getDownloadURL(photoRef);
    
    // Update profile
    // await updateProfile(auth.currentUser, { photoURL });
    // profileData.value.photoURL = photoURL;

    // DUMMY: Show preview locally
    const reader = new FileReader();
    reader.onload = (e) => {
      profileData.value.photoURL = e.target.result;
    };
    reader.readAsDataURL(file);

    successMessage.value = 'Profile picture updated successfully!';
  } catch (error) {
    console.error('Error uploading photo:', error);
    errorMessage.value = 'Failed to upload photo. Please try again.';
  }
}

/**
 * Save profile data to Firebase
 */
async function saveProfile() {
  try {
    isSaving.value = true;

    // TODO: Update Firebase Auth displayName
    // const auth = getAuth();
    // await updateProfile(auth.currentUser, {
    //   displayName: profileData.value.fullName
    // });

    // TODO: Update Firestore
    // const db = getFirestore();
    // const userDocRef = doc(db, 'users', auth.currentUser.uid);
    // await updateDoc(userDocRef, {
    //   profile: profileData.value,
    //   updatedAt: new Date()
    // });

    successMessage.value = 'Profile updated successfully!';
    console.log('Profile saved:', profileData.value);
  } catch (error) {
    console.error('Error saving profile:', error);
    errorMessage.value = 'Failed to save profile. Please try again.';
  } finally {
    isSaving.value = false;
  }
}

/**
 * Save goals data to Firestore
 */
async function saveGoals() {
  try {
    isSaving.value = true;

    // TODO: Save to Firestore subcollection
    // const auth = getAuth();
    // const db = getFirestore();
    // const goalsDocRef = doc(db, 'users', auth.currentUser.uid, 'goals', 'current');
    // await setDoc(goalsDocRef, {
    //   ...goalsData.value,
    //   updatedAt: new Date()
    // }, { merge: true });

    successMessage.value = 'Goals updated successfully!';
    console.log('Goals saved:', goalsData.value);
  } catch (error) {
    console.error('Error saving goals:', error);
    errorMessage.value = 'Failed to save goals. Please try again.';
  } finally {
    isSaving.value = false;
  }
}

/**
 * Save all data (profile + goals + preferences)
 */
async function saveAllData() {
  try {
    isSaving.value = true;
    
    await saveProfile();
    await saveGoals();

    // TODO: Save preferences
    // const auth = getAuth();
    // const db = getFirestore();
    // const prefsDocRef = doc(db, 'users', auth.currentUser.uid, 'preferences', 'settings');
    // await setDoc(prefsDocRef, preferences.value, { merge: true });

    successMessage.value = 'All changes saved successfully!';
    console.log('All data saved');
  } catch (error) {
    console.error('Error saving all data:', error);
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
    // TODO: Firebase sign out
    // const auth = getAuth();
    // await signOut(auth);
    
    router.push('/login');
    console.log('User logged out');
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
 * Delete user account from Firebase
 */
async function deleteAccount() {
  try {
    // TODO: Delete user data from Firestore
    // const auth = getAuth();
    // const db = getFirestore();
    // const userDocRef = doc(db, 'users', auth.currentUser.uid);
    // await deleteDoc(userDocRef);

    // TODO: Delete Firebase Auth account
    // await auth.currentUser.delete();

    router.push('/login');
    console.log('Account deleted');
  } catch (error) {
    console.error('Error deleting account:', error);
    errorMessage.value = 'Failed to delete account. Please contact support.';
  }
}

/**
 * Initialize Chart.js for progress visualization
 */
function initializeCharts() {
  // TODO: Initialize Chart.js when ready
  // This is a placeholder for Chart.js integration
  
  // Example Chart.js initialization:
  // import Chart from 'chart.js/auto';
  // 
  // if (calorieChartRef.value) {
  //   const ctx = calorieChartRef.value.getContext('2d');
  //   new Chart(ctx, {
  //     type: 'line',
  //     data: {
  //       labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  //       datasets: [{
  //         label: 'Calories',
  //         data: [2100, 1950, 2200, 2050, 2300, 1900, 2150],
  //         borderColor: 'rgb(75, 192, 192)',
  //         tension: 0.1
  //       }]
  //     },
  //     options: {
  //       responsive: true,
  //       maintainAspectRatio: true
  //     }
  //   });
  // }

  console.log('Charts initialized (placeholder)');
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: white;
  padding: 20px 0;
}

.page-title {
  color: white;
  font-weight: 700;
  text-align: center;
}

.card {
  border: none;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-5px);
}

.card-header {
  border-radius: 15px 15px 0 0 !important;
  font-weight: 600;
}

/* Profile Picture Styles */
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
  border: 5px solid grey;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Chart Placeholder */
.chart-placeholder {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Stat Cards */
.stat-card {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  color: #495057;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2.5rem;
  margin-right: 15px;
}

.stat-content h6 {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.stat-content h3 {
  margin: 5px 0 0 0;
  font-size: 1.8rem;
  font-weight: 700;
}

/* Progress Bar Styling */
.progress {
  height: 45px;
  border-radius: 10px;
  margin-top: 10px;
}

.progress-bar {
  font-weight: 600;
  line-height: 25px;
}

/* Form Styling */
.form-label {
  font-weight: 600;
  color: #495057;
}

.form-control:focus,
.form-select:focus {
  border-color: #005d6c;
  box-shadow: 0 0 0 0.2rem #005d6c;
}

.form-check-input:checked {
  background-color: #005d6c;
  border-color: #005d6c;
}

/* Button Styling */
.btn-primary {
  background: linear-gradient(135deg, #005d6c 0%, green 100%);
  border: none;
  font-weight: 600;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #005d6c 0%, #005d6c 100%);
}

/* Alert Styling */
.alert {
  border-radius: 10px;
  border: none;
  background-color: rgb(206, 255, 222);
}

.btn-outline-secondary:hover {
    background: linear-gradient(135deg, #005d6c 0%, #005d6c 100%);
}

/* Responsive Design */
@media (max-width: 768px) {
  .profile-picture {
    width: 120px;
    height: 120px;
  }

  .stat-icon {
    font-size: 2rem;
  }

  .stat-content h3 {
    font-size: 1.5rem;
  }
}

.stat-card-full {
  background-color: #f8f9fa;
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
  color: #198754;
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
  background: linear-gradient(135deg, #005d6c 0%, green 100%);
}

.stat-card-full small {
  display: block;
  margin-top: 5px;
  font-size: 0.85rem;
}

/* Bootstrap Icons (ensure you have Bootstrap Icons loaded) */
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css');
</style>