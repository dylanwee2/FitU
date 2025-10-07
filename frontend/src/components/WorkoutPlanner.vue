<template>
  <div class="workout-planner">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Workouts | Diet Plan</h1>
      <button v-if="showBackButton" class="btn btn-outline-secondary" @click="goBack">← Back to Home</button>
    </div>

    <!-- Preset Workout Plans -->
    <div class="row mb-5">
      <div class="col-lg-4 col-md-6 mb-3" v-for="workout in presetWorkouts" :key="workout.id">
        <div 
          class="workout-preset-card" 
          :class="{ active: selectedWorkout?.id === workout.id }"
          @click="selectWorkout(workout)"
        >
          <h3 class="workout-title">{{ workout.name }}</h3>
          <p class="workout-description">{{ workout.description }}</p>
          <div class="muscle-groups">
            <span 
              v-for="muscle in workout.primaryMuscles" 
              :key="muscle" 
              class="badge bg-primary me-1"
            >
              {{ muscle }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Workout Details -->
    <div v-if="selectedWorkout" class="workout-details">
      <div class="row">
        <!-- 3D Muscle Model -->
        <div class="col-lg-6 mb-4">
          <div class="muscle-model-container">
            <h4>Targeted Muscle Groups</h4>
            <div v-if="clickedMuscle" class="clicked-muscle-info mb-2">
              <span class="badge bg-success">Clicked: {{ clickedMuscle }}</span>
            </div>
            <ExternalModel3D 
              :highlighted-muscles="currentHighlightedMuscles"
              :height="280"
              model-path="/models/scene.gltf"
              @muscle-clicked="onMuscleClicked"
            />
            <p class="mt-2 text-muted small">Click on muscle groups in the 3D model to highlight them</p>
          </div>
        </div>

        <!-- Exercise List -->
        <div class="col-lg-6">
          <h4>Exercises</h4>
          <div v-if="loading" class="text-center">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <div v-else-if="exercises.length > 0" class="exercise-list">
            <div 
              v-for="exercise in exercises" 
              :key="exercise.id" 
              class="exercise-card mb-3"
              @click="selectExercise(exercise)"
            >
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h5 class="exercise-name">{{ exercise.name }}</h5>
                  <p class="exercise-target">{{ exercise.target }}</p>
                  <div class="exercise-equipment">
                    <span class="badge bg-secondary">{{ exercise.equipment }}</span>
                  </div>
                </div>
                <button class="btn btn-sm btn-outline-primary" @click.stop="viewExerciseDetails(exercise)">
                  View Details
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-muted">
            No exercises found for this workout plan.
          </div>
          
          <!-- Complete Workout Button -->
          <div v-if="exercises.length > 0" class="mt-4">
            <button 
              class="btn btn-success btn-lg w-100"
              @click="completeWorkout"
            >
              🏋️ Complete Workout
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress Tracker -->
    <!-- Temporarily disabled for debugging -->
    <!-- <div v-if="showProgressTracker" class="mt-5">
      <ProgressTracker />
    </div> -->

    <!-- Exercise Details Modal -->
    <div v-if="selectedExercise" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedExercise.name }}</h5>
            <button type="button" class="btn-close" @click="closeExerciseDetails"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <h6>Target Muscle</h6>
                <p>{{ selectedExercise.target }}</p>
                
                <h6>Equipment</h6>
                <p>{{ selectedExercise.equipment }}</p>
                
                <h6>Body Part</h6>
                <p>{{ selectedExercise.bodyPart }}</p>
              </div>
              <div class="col-md-6">
                <h6>Instructions</h6>
                <ol>
                  <li v-for="instruction in selectedExercise.instructions" :key="instruction">
                    {{ instruction }}
                  </li>
                </ol>
              </div>
            </div>
            <div v-if="selectedExercise.gifUrl" class="mt-3">
              <h6>Exercise Demonstration</h6>
              <img :src="selectedExercise.gifUrl" :alt="selectedExercise.name" class="img-fluid rounded">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeExerciseDetails">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import ExternalModel3D from './ExternalModel3D.vue'
// import ProgressTracker from './ProgressTracker.vue'
// import exerciseService from '../services/exerciseService.js'
// import progressService from '../services/progressService.js'

export default {
  name: 'WorkoutPlanner',
  components: {
    ExternalModel3D
    // ProgressTracker
  },
  props: {
    showBackButton: {
      type: Boolean,
      default: true
    },
    showProgressTracker: {
      type: Boolean,
      default: true
    }
  },
  emits: ['workout-selected', 'exercise-selected', 'workout-completed'],
  setup(props, { emit }) {
    const router = useRouter()
    const selectedWorkout = ref(null)
    const selectedExercise = ref(null)
    const exercises = ref([])
    const loading = ref(false)
    const currentHighlightedMuscles = ref([])
    const clickedMuscle = ref('')

    // Preset workout plans
    const presetWorkouts = ref([
      {
        id: 'push-day',
        name: 'Push Day',
        description: 'Chest, Shoulders, Triceps',
        primaryMuscles: ['Chest', 'Shoulders', 'Triceps'],
        secondaryMuscles: ['Core'],
        exercises: ['bench-press', 'shoulder-press', 'dips', 'push-ups', 'lateral-raises']
      },
      {
        id: 'pull-day',
        name: 'Pull Day',
        description: 'Back, Biceps, Rear Delts',
        primaryMuscles: ['Back', 'Biceps', 'Rear Delts'],
        secondaryMuscles: ['Core'],
        exercises: ['pull-ups', 'bent-over-row', 'bicep-curls', 'face-pulls', 'lat-pulldown']
      },
      {
        id: 'core',
        name: 'Core',
        description: 'Abdominals, Obliques, Lower Back',
        primaryMuscles: ['Abs', 'Obliques', 'Lower Back'],
        secondaryMuscles: ['Hip Flexors'],
        exercises: ['plank', 'crunches', 'russian-twists', 'mountain-climbers', 'dead-bug']
      },
      {
        id: 'legs',
        name: 'Leg Day',
        description: 'Quads, Glutes, Hamstrings, Calves',
        primaryMuscles: ['Quads', 'Glutes', 'Hamstrings', 'Calves'],
        secondaryMuscles: ['Core'],
        exercises: ['squats', 'lunges', 'deadlifts', 'calf-raises', 'leg-press']
      },
      {
        id: 'full-body',
        name: 'Full Body',
        description: 'Complete Body Workout',
        primaryMuscles: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'],
        secondaryMuscles: ['All'],
        exercises: ['burpees', 'mountain-climbers', 'jumping-jacks', 'push-ups', 'squats']
      },
      {
        id: 'cardio',
        name: 'Cardio',
        description: 'High Intensity Cardio',
        primaryMuscles: ['Heart', 'Lungs', 'Core'],
        secondaryMuscles: ['All'],
        exercises: ['jumping-jacks', 'burpees', 'mountain-climbers', 'high-knees', 'jump-squats']
      }
    ])

    // Exercise-specific muscle mapping for detailed highlighting
    const exerciseMuscleMapping = {
      'bench-press': ['Chest'],
      'shoulder-press': ['Shoulders'],
      'dips': ['Triceps', 'Chest'],
      'push-ups': ['Chest', 'Triceps'],
      'lateral-raises': ['Shoulders'],
      'pull-ups': ['Back', 'Biceps'],
      'bent-over-row': ['Back'],
      'bicep-curls': ['Biceps'],
      'face-pulls': ['Rear Delts'],
      'lat-pulldown': ['Back'],
      'plank': ['Core'],
      'crunches': ['Abs'],
      'russian-twists': ['Obliques'],
      'mountain-climbers': ['Core'],
      'dead-bug': ['Core'],
      'squats': ['Quads', 'Glutes'],
      'lunges': ['Quads', 'Glutes'],
      'deadlifts': ['Back', 'Glutes', 'Hamstrings'],
      'calf-raises': ['Calves'],
      'leg-press': ['Quads'],
      'burpees': ['Chest', 'Legs', 'Core'],
      'jumping-jacks': ['Legs', 'Core'],
      'high-knees': ['Legs', 'Core'],
      'jump-squats': ['Quads', 'Glutes']
    }

    const selectWorkout = async (workout) => {
      selectedWorkout.value = workout
      selectedExercise.value = null
      currentHighlightedMuscles.value = workout.primaryMuscles
      emit('workout-selected', workout)
      await fetchExercises(workout)
    }

    const fetchExercises = async (workout) => {
      loading.value = true
      exercises.value = []
      
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        exercises.value = getMockExercises(workout.id)
      } catch (error) {
        console.error('Error fetching exercises:', error)
        exercises.value = getMockExercises(workout.id)
      } finally {
        loading.value = false
      }
    }

    const getMockExercises = (workoutId) => {
      const exerciseDatabase = {
        'push-day': [
          {
            id: 'bench-press',
            name: 'Bench Press',
            target: 'Chest',
            bodyPart: 'chest',
            equipment: 'barbell',
            instructions: [
              'Lie flat on a bench with your feet on the floor',
              'Grip the barbell with hands slightly wider than shoulder-width',
              'Lower the bar to your chest with control',
              'Press the bar back up to starting position'
            ],
            gifUrl: 'https://v2.exercisedb.io/image/bench-press.gif'
          },
          {
            id: 'shoulder-press',
            name: 'Shoulder Press',
            target: 'Delts',
            bodyPart: 'shoulders',
            equipment: 'dumbbell',
            instructions: [
              'Sit or stand with dumbbells at shoulder level',
              'Press the weights straight up overhead',
              'Lower with control back to starting position'
            ],
            gifUrl: 'https://v2.exercisedb.io/image/shoulder-press.gif'
          },
          {
            id: 'dips',
            name: 'Dips',
            target: 'Triceps',
            bodyPart: 'upper arms',
            equipment: 'body weight',
            instructions: [
              'Support yourself on parallel bars',
              'Lower your body by bending your arms',
              'Push back up to starting position'
            ],
            gifUrl: 'https://v2.exercisedb.io/image/dips.gif'
          }
        ],
        'pull-day': [
          {
            id: 'pull-ups',
            name: 'Pull-ups',
            target: 'Lats',
            bodyPart: 'back',
            equipment: 'body weight',
            instructions: [
              'Hang from a pull-up bar with palms facing away',
              'Pull your body up until your chin clears the bar',
              'Lower with control to starting position'
            ],
            gifUrl: 'https://v2.exercisedb.io/image/pull-ups.gif'
          },
          {
            id: 'bent-over-row',
            name: 'Bent Over Row',
            target: 'Middle Back',
            bodyPart: 'back',
            equipment: 'barbell',
            instructions: [
              'Bend forward at the hips with a slight bend in knees',
              'Pull the barbell to your lower chest',
              'Squeeze your shoulder blades together',
              'Lower with control'
            ],
            gifUrl: 'https://v2.exercisedb.io/image/bent-over-row.gif'
          },
          {
            id: 'bicep-curls',
            name: 'Bicep Curls',
            target: 'Biceps',
            bodyPart: 'upper arms',
            equipment: 'dumbbell',
            instructions: [
              'Stand with dumbbells at your sides',
              'Curl the weights up to your shoulders',
              'Lower with control back to starting position'
            ],
            gifUrl: 'https://v2.exercisedb.io/image/bicep-curls.gif'
          }
        ],
        'core': [
          {
            id: 'plank',
            name: 'Plank',
            target: 'Abs',
            bodyPart: 'waist',
            equipment: 'body weight',
            instructions: [
              'Start in a push-up position',
              'Lower to your forearms',
              'Keep your body in a straight line',
              'Hold for the desired time'
            ],
            gifUrl: 'https://v2.exercisedb.io/image/plank.gif'
          },
          {
            id: 'crunches',
            name: 'Crunches',
            target: 'Abs',
            bodyPart: 'waist',
            equipment: 'body weight',
            instructions: [
              'Lie on your back with knees bent',
              'Place hands behind your head',
              'Lift your shoulders off the ground',
              'Lower with control'
            ],
            gifUrl: 'https://v2.exercisedb.io/image/crunches.gif'
          },
          {
            id: 'russian-twists',
            name: 'Russian Twists',
            target: 'Obliques',
            bodyPart: 'waist',
            equipment: 'body weight',
            instructions: [
              'Sit with knees bent and feet off the ground',
              'Lean back slightly and twist your torso',
              'Touch the ground on each side alternately'
            ],
            gifUrl: 'https://v2.exercisedb.io/image/russian-twists.gif'
          }
        ]
      }
      
      return exerciseDatabase[workoutId] || []
    }

    const selectExercise = (exercise) => {
      selectedExercise.value = exercise
      
      // Highlight specific muscles for this exercise
      if (exerciseMuscleMapping[exercise.id]) {
        currentHighlightedMuscles.value = exerciseMuscleMapping[exercise.id]
      } else {
        // Fallback to exercise target or workout muscles
        currentHighlightedMuscles.value = [exercise.target] || selectedWorkout.value.primaryMuscles
      }
      
      emit('exercise-selected', exercise)
    }

    const viewExerciseDetails = (exercise) => {
      selectedExercise.value = exercise
    }

    const closeExerciseDetails = () => {
      selectedExercise.value = null
    }

    const onMuscleClicked = (muscleName) => {
      clickedMuscle.value = muscleName
      console.log('Muscle clicked:', muscleName)
      
      // You can add additional logic here, like showing exercises that target this muscle
      // or highlighting related exercises in the list
    }

    const completeWorkout = () => {
      if (!selectedWorkout.value) return

      // Simple completion without progress tracking for now
      emit('workout-completed', {
        workout: selectedWorkout.value,
        exercises: exercises.value
      })

      // Show success message
      alert(`🎉 ${selectedWorkout.value.name} completed! Great job!`)
    }

    const goBack = () => {
      router.push('/')
    }

    // Initialize with first workout selected
    onMounted(() => {
      if (presetWorkouts.value.length > 0) {
        selectWorkout(presetWorkouts.value[0])
      }
    })

    return {
      selectedWorkout,
      selectedExercise,
      exercises,
      loading,
      currentHighlightedMuscles,
      clickedMuscle,
      presetWorkouts,
      selectWorkout,
      selectExercise,
      viewExerciseDetails,
      closeExerciseDetails,
      completeWorkout,
      onMuscleClicked,
      goBack
    }
  }
}
</script>

<style scoped>
.workout-planner {
  padding: 20px 0;
}

.workout-preset-card {
  border: 2px solid #007bff;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.workout-preset-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 123, 255, 0.15);
}

.workout-preset-card.active {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  border-color: #0056b3;
}

.workout-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #007bff;
}

.workout-preset-card.active .workout-title {
  color: white;
}

.workout-description {
  font-size: 0.9rem;
  margin-bottom: 15px;
  color: #666;
}

.workout-preset-card.active .workout-description {
  color: rgba(255, 255, 255, 0.9);
}

.muscle-groups {
  margin-top: auto;
}

.muscle-model-container {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  height: 400px;
  overflow: hidden;
}

.muscle-model {
  height: 300px;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.model-placeholder {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 20px;
}

.muscle-group {
  background: rgba(0, 123, 255, 0.8);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  margin: 5px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
}

.exercise-card {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.exercise-card:hover {
  border-color: #007bff;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.1);
  transform: translateY(-2px);
}

.exercise-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 5px;
  color: #333;
}

.exercise-target {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
}

.exercise-equipment {
  margin-top: 8px;
}

.workout-details {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  height: 600px;
}

.modal {
  z-index: 1055;
}

.modal-content {
  border-radius: 12px;
  border: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  border-radius: 12px 12px 0 0;
}

.btn-close {
  filter: invert(1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .workout-preset-card {
    min-height: 120px;
    padding: 15px;
  }
  
  .workout-title {
    font-size: 1.2rem;
  }
  
  .muscle-model-container {
    height: 320px;
  }
  
  .muscle-model {
    height: 200px;
  }
}
</style>
