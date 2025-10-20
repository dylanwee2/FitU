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
        <div class="col-12">
          
          <!-- Calorie Goal Card -->

          <!-- Personal Information Card -->
          <div class="card mb-4">
            <div class="card-header text-white" style="background: var(--primary)">
              <h5 class="mb-0"><i class="bi bi-person-circle me-2"></i>Personal Information</h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="saveProfile">
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
              <div class="card-body row">
                <div class="mb-3 col-6">
                  <label for="goalType" class="form-label">Primary Goal</label>
                  <select class="form-select" id="goalType" v-model="goalsData.goalType">
                    <option value="">Select your goal</option>
                    <option value="lose-weight">Lose Weight</option>
                    <option value="maintain">Maintain Weight</option>
                    <option value="gain-muscle">Gain Muscle</option>
                    <option value="improve-fitness">Improve Overall Fitness</option>
                  </select>
                </div>

                <div class="mb-3 col-6">
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
                  <small class="text-muted">Recommended: 1800-2500 kcal for students</small>
                </div>

              <div class="mb-3 col-6">
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

              <div class="mb-3 col-6">
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

              <div class="mb-3 col-6">
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

          
                <small><i class="bi bi-info-circle me-1"></i>Charts will display real data once you log activities</small>
          
            </div>
          </div>

          <!-- Account Actions Card -->
          <div class="card mb-4">
            <div class="card-header text-white" style="background: var(--primary)">
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
                  <i v-else class="bi bi-trash me-2"></i>
                  {{ isSaving ? 'Deleting Account...' : 'Delete Account' }}
                </button>
                </div>

                <div class="col-12">
                  <small class="text-muted d-block mt-2">
                    Account deletion cannot be undone
                  </small>
                </div>
              </div>
                
              </div>
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
                <i v-else class="bi bi-trash me-2"></i>
                {{ isSaving ? 'Deleting Account...' : 'Delete My Account' }}
              </button>
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
import caloriesService from '@/services/caloriesService.js';
import Chart from 'chart.js/auto';
import { getAuth, onAuthStateChanged, signOut, updateProfile, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const router = useRouter();
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

// Default avatar URL - hosted on a CDN or you can use a local asset
const defaultAvatar = ref('https://ui-avatars.com/api/?name=User&size=150&background=008280&color=fff');

// State Management
const isLoading = ref(true);
const isSaving = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const currentUser = ref(null);

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
  workoutFrequency: 3
});

const workoutStreak = ref(4);
const timeBalance = ref(65);

// Calorie Goal Editor
const goalInput = ref(2000)
const calorieChartRef = ref(null);
const chartInstance = ref(null);

// Calorie data for weekly chart
const weeklyCalorieData = ref([]);

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

    // Get user document from Firestore using the user's UID
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
        workoutFrequency: data.workoutFrequency || 3
      };
      
      // Load calorie data from caloriesService to get the actual daily goal
      try {
        const calorieData = await caloriesService.getUserCalories();
        if (calorieData && calorieData.dailyGoal) {
          goalsData.value.dailyGoal = calorieData.dailyGoal;
          goalInput.value = calorieData.dailyGoal;
          // Get weekly data for chart
          weeklyCalorieData.value = caloriesService.getWeekSeries(calorieData.entries || [], 7);
        } else {
          goalInput.value = data.dailyGoal || 2000;
        }
      } catch (error) {
        console.error('Error loading calorie data:', error);
        goalInput.value = data.dailyGoal || 2000;
      }

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
    // CRITICAL: Use doc() to specify the exact document ID (the user's UID)
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

    // Use setDoc to create the document with the specific UID
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
 * Save all profile data to Firestore
 */
async function saveAllData() {
  try {
    isSaving.value = true;
    errorMessage.value = '';

    // Validate required fields
    if (!profileData.value.fullName || !profileData.value.email) {
      errorMessage.value = 'Please fill in all required fields';
      isSaving.value = false;
      return;
    }

    // CRITICAL: Always use the current user's UID as the document ID
    const userDocRef = doc(db, 'users', currentUser.value.uid);
    
    // Prepare data to save
    const dataToSave = {
      // Profile data
      fullName: profileData.value.fullName,
      email: profileData.value.email,
      gender: profileData.value.gender || '',
      age: profileData.value.age || null,
      height: profileData.value.height || null,
      weight: profileData.value.weight || null,

      // Goals data
      goalType: goalsData.value.goalType || '',
      dailyGoal: goalsData.value.dailyGoal || 2000,
      dietaryPreference: goalsData.value.dietaryPreference || '',
      allergies: goalsData.value.allergies || '',
      workoutFrequency: goalsData.value.workoutFrequency || 3,
      
      // Metadata
      updatedAt: serverTimestamp()
    };

    // Use setDoc with merge:true to update the existing document
    // This will update fields or create the document if it doesn't exist
    await setDoc(userDocRef, dataToSave, { merge: true });

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
    
    // Provide specific error messages
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


</script>

<style scoped>
/* Container */
.profile-container {
  min-height: 100vh;
  background-color: white;
  padding: 20px 0;
}

/* Title with animation */
.page-title {
  color: var(--primary);
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

/* Cards - matching home page style */
.card {
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  transition: all 0.3s ease;
  background: var(--surface);
  box-shadow: var(--shadow-card);
  animation: fadeInUp 0.6s ease-out backwards;
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
  box-shadow: 0 12px 24px rgba(34, 170, 255, 0.4);
}

.card-header {
  background-color: var(--primary);
  color: #ffffff !important;
  border-radius: 12px 12px 0 0 !important;
  font-weight: 600;
  padding: 1rem 1.5rem;
}

.card-body {
  background-color: white;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Profile Picture with enhanced animation */
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
  box-shadow: 0 8px 16px rgba(120, 135, 145, 0.4);
  transition: all 0.4s ease;
  position: relative;
}

.profile-picture:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 12px 24px rgba(194, 224, 255, 0.4);
}

.btn-change-photo {
  background-color: white;
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
  box-shadow: 0 8px 24px rgba(34, 170, 255, 0.4);
}

.btn-change-photo:active {
  transform: translateY(1px);
}

/* Forms with smooth transitions */
.form-label {
  font-weight: 600;
  color: #495057;
  transition: color 0.2s ease;
}

.form-control,
.form-select {
  border-radius: 8px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.form-control:focus,
.form-select:focus {
  border-color: var(--primary);

  transform: translateY(-2px);
}

.form-control:hover,
.form-select:hover {
  border-color: var(--primary);
}

.form-check-input {
  cursor: pointer;
  transition: all 0.3s ease;
}

.form-check-input:checked {
  background-color: var(--primary);
  border-color: var(--primary);
  transform: scale(1.1);
}

.form-check-label {
  cursor: pointer;
  transition: color 0.2s ease;
}

.form-check-label:hover {
  color: var(--primary);
}

/* Chart Placeholder */
.chart-placeholder {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.chart-placeholder:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Full Width Stat Cards with pulse animation */
.stat-card-full {
  background-color: white;
  color: #495057;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
  box-shadow: 0 4px 12px rgba(34, 170, 255, 0.4);
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
  color: var(--primary);
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
  background-color: #e9ecef;
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
  background-color: rgb(0, 130, 128);
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
}

/* Buttons - matching home page style */
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
  background-color: white;
  border: 1px solid red;
  transition: all 0.3s ease;;
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
  background-color: white;
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
  box-shadow: rgb(255, 77, 77);
}

.btn-outline-danger:active {
  transform: translateY(1px);
}

/* Disabled button state */
.btn-primary:disabled,
.btn-outline-secondary:disabled,
.btn-outline-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* Alerts with slide-in animation */
.alert {
  border-radius: 12px;
  border: none;
  animation: slideInFromTop 0.4s ease-out;
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
  background-color: white;
  color: var(--primary);
  border-left: 4px solid var(--primary);
  box-shadow: 0 4px 12px rgba(213, 239, 255, 0.4);
}

.alert-danger {
  background-color: white;
  color: var(--primary);
  border-left: 4px solid var(--primary);
  box-shadow: 0 4px 12px rgba(213, 239, 255, 0.4);
}

.alert-info {
  background-color: white;
  color: var(--primary);
  border: 2px solid #e9ecef;
}

.alert-light {
  background-color: rgb(255, 239, 212);
  color: #495057;
  border: 2px solid #e9ecef;
}

.btn-close {
  filter: invert(0.3) sepia(1) saturate(5) hue-rotate(315deg);
  transition: transform 0.2s ease;
}

.btn-close:hover {
  transform: scale(1.2) rotate(90deg);
}

/* Loading Spinner with enhanced animation */
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

/* BMI Alert with icon animation */
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

/* Icon animations */
.bi {
  color: rgb(221, 221, 221);
  transition: all 0.3s ease;
}

.card-header .bi:hover {
  transform: scale(1.2) rotate(10deg);
}

/* Input focus glow effect */
.form-control:focus,
.form-select:focus {
  animation: inputGlow 0.6s ease-out;
}

@keyframes inputGlow {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 170, 255, 0.4);
  }
  100% {
    box-shadow: 0 0 0 0.2rem rgba(34, 170, 255, 0.4);
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

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Add floating animation to cards on hover */
@keyframes float {
  0%, 100% {
    transform: translateY(-8px);
  }
  50% {
    transform: translateY(-12px);
  }
}



/* Bootstrap Icons */
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css');
</style>