<template>
  <div class="exercise-detail-page">
    <div class="container mt-4">
      <!-- Back Button -->
      <button @click="goBack" class="btn btn-outline-secondary mb-4">
        ← Back to Workouts
      </button>

      <!-- Exercise Header -->
      <div class="exercise-header mb-5">
        <h1>{{ exercise.name }}</h1>
        <div class="exercise-meta">
          <span class="badge bg-primary me-2">{{ exercise.category }}</span>
          <span class="badge bg-secondary me-2">{{ exercise.difficulty }}</span>
          <span class="text-muted">{{ exercise.duration }} minutes</span>
        </div>
      </div>

      <!-- Exercise Content -->
      <div class="row">
        <div class="col-lg-8">
          <!-- Exercise Instructions -->
          <div class="card mb-4">
            <div class="card-header">
              <h5>Instructions</h5>
            </div>
            <div class="card-body">
              <p>{{ exercise.instructions }}</p>
              
              <!-- Exercise Steps -->
              <ol v-if="exercise.steps">
                <li v-for="step in exercise.steps" :key="step">{{ step }}</li>
              </ol>
            </div>
          </div>

          <!-- Video/Image Section -->
          <div class="card mb-4" v-if="exercise.videoUrl || exercise.imageUrl">
            <div class="card-header">
              <h5>Demonstration</h5>
            </div>
            <div class="card-body">
              <video v-if="exercise.videoUrl" :src="exercise.videoUrl" controls class="w-100 mb-3"></video>
              <img v-else-if="exercise.imageUrl" :src="exercise.imageUrl" :alt="exercise.name" class="img-fluid">
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <!-- Exercise Stats -->
          <div class="card mb-4">
            <div class="card-header">
              <h5>Exercise Details</h5>
            </div>
            <div class="card-body">
              <div class="row text-center">
                <div class="col-6">
                  <h6>{{ exercise.sets || 3 }}</h6>
                  <small class="text-muted">Sets</small>
                </div>
                <div class="col-6">
                  <h6>{{ exercise.reps || 12 }}</h6>
                  <small class="text-muted">Reps</small>
                </div>
              </div>
              <hr>
              <div class="text-center">
                <h6>{{ exercise.targetMuscles?.join(', ') || 'Full Body' }}</h6>
                <small class="text-muted">Target Muscles</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Discussion Forum Component -->
      <div class="discussion-section mt-5">
        <discussion_forum
          :exercise-id="exercise.id"
          :current-user="currentUser"
          :initial-open="false"
          @created-post="onPostCreated"
          @updated-post="onPostUpdated"
          @deleted-post="onPostDeleted"
          @created-comment="onCommentCreated"
          @deleted-comment="onCommentDeleted"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import discussion_forum from '../components/discussion_forum.vue'

const route = useRoute()
const router = useRouter()
const auth = getAuth()

// Get exercise ID from route params
const exerciseId = computed(() => route.params.id)

// Current user state
const currentUser = ref(null)

// Exercise data - will be loaded based on route parameter
const exercise = ref({
  id: 1,
  name: 'Loading...',
  category: 'Loading...',
  difficulty: 'Loading...',
  duration: 0,
  instructions: 'Loading exercise details...',
  steps: [],
  sets: 0,
  reps: 0,
  targetMuscles: [],
  imageUrl: null,
  videoUrl: null
})

// Methods
const goBack = () => {
  router.push('/') // Go directly to home/workout page
}

const onPostCreated = (post) => {
  console.log('New post created:', post)
  // You can add success notifications here
}

const onPostUpdated = (post) => {
  console.log('Post updated:', post)
}

const onPostDeleted = (postId) => {
  console.log('Post deleted:', postId)
}

const onCommentCreated = (postId, comment) => {
  console.log('New comment created:', comment)
}

const onCommentDeleted = (postId, commentId) => {
  console.log('Comment deleted:', commentId)
}

// Load exercise data (replace with real API call)
const loadExercise = async () => {
  console.log('=== LOADING EXERCISE DATA ===')
  console.log('Route exercise ID:', exerciseId.value)
  console.log('Exercise ID type:', typeof exerciseId.value)
  
  // In the future, replace with:
  // const response = await fetch(`/api/exercises/${exerciseId.value}`)
  // exercise.value = await response.json()
  
  // Exercise database with both numeric and string IDs for compatibility
  const exercises = {
    // Original numeric exercises
    1: {
      id: 1,
      name: 'Push-ups',
      category: 'Strength',
      difficulty: 'Beginner',
      duration: 15,
      instructions: 'A classic upper body exercise that targets chest, shoulders, and triceps.',
      steps: [
        'Start in a plank position with hands slightly wider than shoulders',
        'Lower your body until chest nearly touches the floor',
        'Push back up to starting position',
        'Repeat for desired number of reps'
      ],
      sets: 3,
      reps: 12,
      targetMuscles: ['Chest', 'Shoulders', 'Triceps']
    },
    2: {
      id: 2,
      name: 'Squats',
      category: 'Strength',
      difficulty: 'Beginner',
      duration: 10,
      instructions: 'A fundamental lower body exercise that targets glutes, quads, and hamstrings.',
      steps: [
        'Stand with feet shoulder-width apart',
        'Lower your body by bending knees and hips',
        'Keep chest up and weight on heels',
        'Return to starting position'
      ],
      sets: 3,
      reps: 15,
      targetMuscles: ['Glutes', 'Quadriceps', 'Hamstrings']
    },
    3: {
      id: 3,
      name: 'Plank',
      category: 'Core',
      difficulty: 'Intermediate',
      duration: 5,
      instructions: 'An isometric core exercise that strengthens the entire core region.',
      steps: [
        'Start in a push-up position',
        'Lower to forearms, keeping body straight',
        'Hold position, engaging core muscles',
        'Breathe normally throughout'
      ],
      sets: 3,
      reps: '30 seconds',
      targetMuscles: ['Core', 'Shoulders', 'Glutes']
    },
    4: {
      id: 4,
      name: 'Burpees',
      category: 'Cardio',
      difficulty: 'Advanced',
      duration: 12,
      instructions: 'A full-body exercise that combines strength and cardio for maximum impact.',
      steps: [
        'Start in standing position',
        'Drop into squat with hands on ground',
        'Jump feet back into plank position',
        'Do a push-up (optional)',
        'Jump feet back to squat',
        'Jump up with arms overhead'
      ],
      sets: 3,
      reps: 10,
      targetMuscles: ['Full Body', 'Core', 'Legs', 'Arms']
    },
    5: {
      id: 5,
      name: 'Mountain Climbers',
      category: 'Cardio',
      difficulty: 'Intermediate',
      duration: 8,
      instructions: 'A dynamic cardio exercise that targets core while getting your heart rate up.',
      steps: [
        'Start in plank position',
        'Bring right knee toward chest',
        'Quickly switch legs',
        'Continue alternating at fast pace',
        'Keep core engaged throughout'
      ],
      sets: 3,
      reps: '30 seconds',
      targetMuscles: ['Core', 'Shoulders', 'Legs']
    },
    // WorkoutPlanner exercises (string IDs)
    'bench-press': {
      id: 'bench-press',
      name: 'Bench Press',
      category: 'Strength',
      difficulty: 'Intermediate',
      duration: 20,
      instructions: 'A fundamental chest exercise that targets pectorals, shoulders, and triceps.',
      steps: [
        'Lie flat on a bench with your feet on the floor',
        'Grip the barbell with hands slightly wider than shoulder-width',
        'Lower the bar to your chest with control',
        'Press the bar back up to starting position'
      ],
      sets: 4,
      reps: 8,
      targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
      equipment: 'barbell'
    },
    'shoulder-press': {
      id: 'shoulder-press',
      name: 'Shoulder Press',
      category: 'Strength',
      difficulty: 'Intermediate',
      duration: 15,
      instructions: 'An effective shoulder exercise that builds deltoid strength and stability.',
      steps: [
        'Sit or stand with dumbbells at shoulder level',
        'Press the weights straight up overhead',
        'Lower with control back to starting position',
        'Keep core engaged throughout the movement'
      ],
      sets: 3,
      reps: 10,
      targetMuscles: ['Delts', 'Triceps', 'Core'],
      equipment: 'dumbbell'
    },
    'dips': {
      id: 'dips',
      name: 'Dips',
      category: 'Strength',
      difficulty: 'Intermediate',
      duration: 12,
      instructions: 'A bodyweight exercise that targets triceps and chest muscles.',
      steps: [
        'Support yourself on parallel bars',
        'Lower your body by bending your arms',
        'Keep your body straight and core engaged',
        'Push back up to starting position'
      ],
      sets: 3,
      reps: 12,
      targetMuscles: ['Triceps', 'Chest', 'Shoulders'],
      equipment: 'body weight'
    },
    'push-ups': {
      id: 'push-ups',
      name: 'Push-ups',
      category: 'Strength',
      difficulty: 'Beginner',
      duration: 15,
      instructions: 'A classic upper body exercise that targets chest, shoulders, and triceps.',
      steps: [
        'Start in a plank position with hands slightly wider than shoulders',
        'Lower your body until chest nearly touches the floor',
        'Push back up to starting position',
        'Repeat for desired number of reps'
      ],
      sets: 3,
      reps: 12,
      targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
      equipment: 'body weight'
    },
    'pull-ups': {
      id: 'pull-ups',
      name: 'Pull-ups',
      category: 'Strength',
      difficulty: 'Advanced',
      duration: 15,
      instructions: 'A challenging upper body exercise that targets back and biceps.',
      steps: [
        'Hang from a pull-up bar with palms facing away',
        'Pull your body up until your chin clears the bar',
        'Lower with control to starting position',
        'Keep core engaged and avoid swinging'
      ],
      sets: 3,
      reps: 8,
      targetMuscles: ['Lats', 'Biceps', 'Core'],
      equipment: 'pull-up bar'
    },
    'bent-over-row': {
      id: 'bent-over-row',
      name: 'Bent Over Row',
      category: 'Strength',
      difficulty: 'Intermediate',
      duration: 15,
      instructions: 'A compound back exercise that targets the middle back and rhomboids.',
      steps: [
        'Bend forward at the hips with a slight bend in knees',
        'Pull the barbell to your lower chest',
        'Squeeze shoulder blades together',
        'Lower with control back to starting position'
      ],
      sets: 4,
      reps: 10,
      targetMuscles: ['Middle Back', 'Rhomboids', 'Biceps'],
      equipment: 'barbell'
    },
    'lateral-raises': {
      id: 'lateral-raises',
      name: 'Lateral Raises',
      category: 'Strength',
      difficulty: 'Beginner',
      duration: 10,
      instructions: 'An isolation exercise that targets the lateral deltoids.',
      steps: [
        'Stand with dumbbells at your sides',
        'Raise arms out to the sides until parallel to floor',
        'Lower with control back to starting position',
        'Keep slight bend in elbows'
      ],
      sets: 3,
      reps: 12,
      targetMuscles: ['Delts', 'Traps'],
      equipment: 'dumbbell'
    },
    'bicep-curls': {
      id: 'bicep-curls',
      name: 'Bicep Curls',
      category: 'Strength',
      difficulty: 'Beginner',
      duration: 10,
      instructions: 'A classic arm exercise that targets the biceps.',
      steps: [
        'Stand with dumbbells at your sides',
        'Curl the weights up to your shoulders',
        'Squeeze biceps at the top',
        'Lower with control back to starting position'
      ],
      sets: 3,
      reps: 12,
      targetMuscles: ['Biceps', 'Forearms'],
      equipment: 'dumbbell'
    },
    'face-pulls': {
      id: 'face-pulls',
      name: 'Face Pulls',
      category: 'Strength',
      difficulty: 'Intermediate',
      duration: 12,
      instructions: 'A rear deltoid exercise that improves posture and shoulder health.',
      steps: [
        'Set cable at face height with rope attachment',
        'Pull rope toward your face',
        'Separate rope ends at your ears',
        'Squeeze shoulder blades together'
      ],
      sets: 3,
      reps: 15,
      targetMuscles: ['Rear Delts', 'Rhomboids', 'Middle Traps'],
      equipment: 'cable'
    },
    'lat-pulldown': {
      id: 'lat-pulldown',
      name: 'Lat Pulldown',
      category: 'Strength',
      difficulty: 'Intermediate',
      duration: 15,
      instructions: 'A machine exercise that targets the latissimus dorsi.',
      steps: [
        'Sit at lat pulldown machine',
        'Grip bar wider than shoulder width',
        'Pull bar down to upper chest',
        'Control the weight back up'
      ],
      sets: 3,
      reps: 10,
      targetMuscles: ['Lats', 'Rhomboids', 'Biceps'],
      equipment: 'machine'
    },
    'plank': {
      id: 'plank',
      name: 'Plank',
      category: 'Core',
      difficulty: 'Intermediate',
      duration: 5,
      instructions: 'An isometric core exercise that strengthens the entire core region.',
      steps: [
        'Start in a push-up position',
        'Lower to your forearms',
        'Keep your body in a straight line',
        'Hold for the desired time'
      ],
      sets: 3,
      reps: '30 seconds',
      targetMuscles: ['Core', 'Shoulders', 'Glutes'],
      equipment: 'body weight'
    },
    'crunches': {
      id: 'crunches',
      name: 'Crunches',
      category: 'Core',
      difficulty: 'Beginner',
      duration: 8,
      instructions: 'A basic abdominal exercise that targets the rectus abdominis.',
      steps: [
        'Lie on your back with knees bent',
        'Place hands behind your head',
        'Lift your shoulders off the ground',
        'Lower with control'
      ],
      sets: 3,
      reps: 15,
      targetMuscles: ['Abs', 'Core'],
      equipment: 'body weight'
    },
    'russian-twists': {
      id: 'russian-twists',
      name: 'Russian Twists',
      category: 'Core',
      difficulty: 'Intermediate',
      duration: 8,
      instructions: 'A rotational core exercise that targets the obliques.',
      steps: [
        'Sit with knees bent and feet off the ground',
        'Lean back slightly and twist your torso',
        'Touch the ground on each side alternately',
        'Keep core engaged throughout'
      ],
      sets: 3,
      reps: '30 seconds',
      targetMuscles: ['Obliques', 'Core'],
      equipment: 'body weight'
    },
    'dead-bug': {
      id: 'dead-bug',
      name: 'Dead Bug',
      category: 'Core',
      difficulty: 'Beginner',
      duration: 10,
      instructions: 'A core stability exercise that teaches proper core engagement.',
      steps: [
        'Lie on back with arms straight up',
        'Bring knees to 90 degrees',
        'Lower opposite arm and leg',
        'Return to start and switch sides'
      ],
      sets: 3,
      reps: 10,
      targetMuscles: ['Core', 'Hip Flexors'],
      equipment: 'body weight'
    },
    'mountain-climbers': {
      id: 'mountain-climbers',
      name: 'Mountain Climbers',
      category: 'Cardio',
      difficulty: 'Intermediate',
      duration: 8,
      instructions: 'A dynamic cardio exercise that targets core while getting your heart rate up.',
      steps: [
        'Start in plank position',
        'Bring right knee toward chest',
        'Quickly switch legs',
        'Continue alternating at fast pace',
        'Keep core engaged throughout'
      ],
      sets: 3,
      reps: '30 seconds',
      targetMuscles: ['Core', 'Shoulders', 'Legs'],
      equipment: 'body weight'
    },
    'squats': {
      id: 'squats',
      name: 'Squats',
      category: 'Strength',
      difficulty: 'Beginner',
      duration: 10,
      instructions: 'A fundamental lower body exercise that targets glutes, quads, and hamstrings.',
      steps: [
        'Stand with feet shoulder-width apart',
        'Lower your body by bending knees and hips',
        'Keep chest up and weight on heels',
        'Return to starting position'
      ],
      sets: 3,
      reps: 15,
      targetMuscles: ['Glutes', 'Quadriceps', 'Hamstrings'],
      equipment: 'body weight'
    },
    'lunges': {
      id: 'lunges',
      name: 'Lunges',
      category: 'Strength',
      difficulty: 'Beginner',
      duration: 12,
      instructions: 'A unilateral leg exercise that improves balance and strength.',
      steps: [
        'Step forward with one leg',
        'Lower your hips until both knees are bent at 90 degrees',
        'Push back to starting position',
        'Repeat with other leg'
      ],
      sets: 3,
      reps: 12,
      targetMuscles: ['Glutes', 'Quadriceps', 'Hamstrings'],
      equipment: 'body weight'
    },
    'deadlifts': {
      id: 'deadlifts',
      name: 'Deadlifts',
      category: 'Strength',
      difficulty: 'Advanced',
      duration: 20,
      instructions: 'A compound exercise that targets the posterior chain.',
      steps: [
        'Stand with feet hip-width apart',
        'Bend at hips and knees to grab bar',
        'Keep chest up and back straight',
        'Drive through heels to stand up'
      ],
      sets: 4,
      reps: 6,
      targetMuscles: ['Hamstrings', 'Glutes', 'Lower Back'],
      equipment: 'barbell'
    },
    'calf-raises': {
      id: 'calf-raises',
      name: 'Calf Raises',
      category: 'Strength',
      difficulty: 'Beginner',
      duration: 8,
      instructions: 'An isolation exercise that targets the calf muscles.',
      steps: [
        'Stand with feet hip-width apart',
        'Rise up onto your toes',
        'Hold for a moment at the top',
        'Lower with control'
      ],
      sets: 3,
      reps: 20,
      targetMuscles: ['Calves'],
      equipment: 'body weight'
    },
    'leg-press': {
      id: 'leg-press',
      name: 'Leg Press',
      category: 'Strength',
      difficulty: 'Intermediate',
      duration: 15,
      instructions: 'A machine exercise that targets the quadriceps and glutes.',
      steps: [
        'Sit in leg press machine',
        'Place feet shoulder-width apart on platform',
        'Lower weight until knees reach 90 degrees',
        'Press weight back up'
      ],
      sets: 3,
      reps: 12,
      targetMuscles: ['Quadriceps', 'Glutes'],
      equipment: 'machine'
    },
    'burpees': {
      id: 'burpees',
      name: 'Burpees',
      category: 'Cardio',
      difficulty: 'Advanced',
      duration: 12,
      instructions: 'A full-body exercise that combines strength and cardio for maximum impact.',
      steps: [
        'Start in standing position',
        'Drop into squat with hands on ground',
        'Jump feet back into plank position',
        'Do a push-up (optional)',
        'Jump feet back to squat',
        'Jump up with arms overhead'
      ],
      sets: 3,
      reps: 10,
      targetMuscles: ['Full Body', 'Core', 'Legs', 'Arms'],
      equipment: 'body weight'
    },
    'jumping-jacks': {
      id: 'jumping-jacks',
      name: 'Jumping Jacks',
      category: 'Cardio',
      difficulty: 'Beginner',
      duration: 10,
      instructions: 'A classic cardio exercise that gets your heart rate up.',
      steps: [
        'Start with feet together and arms at sides',
        'Jump feet apart while raising arms overhead',
        'Jump back to starting position',
        'Continue at a steady pace'
      ],
      sets: 3,
      reps: '30 seconds',
      targetMuscles: ['Legs', 'Core', 'Shoulders'],
      equipment: 'body weight'
    },
    'high-knees': {
      id: 'high-knees',
      name: 'High Knees',
      category: 'Cardio',
      difficulty: 'Beginner',
      duration: 5,
      instructions: 'A dynamic cardio exercise that improves coordination.',
      steps: [
        'Stand with feet hip-width apart',
        'Run in place lifting knees high',
        'Aim to bring knees to waist level',
        'Pump arms naturally'
      ],
      sets: 3,
      reps: '30 seconds',
      targetMuscles: ['Legs', 'Core'],
      equipment: 'body weight'
    },
    'jump-squats': {
      id: 'jump-squats',
      name: 'Jump Squats',
      category: 'Cardio',
      difficulty: 'Intermediate',
      duration: 10,
      instructions: 'A plyometric exercise that combines squats with explosive jumping.',
      steps: [
        'Start in squat position',
        'Jump up explosively',
        'Land softly back in squat',
        'Repeat immediately'
      ],
      sets: 3,
      reps: 12,
      targetMuscles: ['Glutes', 'Quadriceps', 'Calves'],
      equipment: 'body weight'
    }
  }
  
  const selectedExercise = exercises[exerciseId.value] || exercises[1]
  console.log('Selected exercise:', selectedExercise)
  
  exercise.value = selectedExercise
  console.log('✅ Exercise loaded:', exercise.value.name)
}

// Check authentication
onAuthStateChanged(auth, (user) => {
  console.log('=== AUTH STATE CHANGED ===')
  console.log('Firebase user:', user)
  
  if (user) {
    currentUser.value = {
      id: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'User'
    }
    console.log('✅ User logged in:', currentUser.value)
  } else {
    currentUser.value = null
    console.log('❌ No user logged in')
  }
})

// Lifecycle
onMounted(() => {
  loadExercise()
})

// Watch for route changes
watch(() => route.params.id, (newId, oldId) => {
  console.log('🔄 Route changed! Exercise ID:', { from: oldId, to: newId })
  if (newId !== oldId) {
    loadExercise()
  }
}, { immediate: false })
</script>

<style scoped>
.exercise-detail-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.exercise-header {
  text-align: center;
  padding: 2rem 0;
}

.exercise-header h1 {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.exercise-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.discussion-section {
  background: white;
  border-radius: 0.5rem;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

@media (max-width: 768px) {
  .exercise-header h1 {
    font-size: 2rem;
  }
  
  .discussion-section {
    padding: 1rem;
  }
}
</style>