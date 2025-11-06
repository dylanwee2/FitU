<template>
  <div class="home-page">
    <div class="container-fluid">
      <!-- Example 3: Full Calendar Component -->
      <div class="row mb-5">
        <div class="col-12 col-xxl-6 mb-3 mb-xxl-0">
          <div class="card h-100">
            <div class="card-header">
              <h1 class="mb-0">Timetable</h1>
            </div>
            <div class="card-body">
              <CalendarComponent 
                ref="calendarRef"
                :show-controls="true"
                :show-add-event="true"
                :show-file-upload="true"
                :show-department-field="true"
                @workout-dropped="handleWorkoutDropped"
              />
            </div>
          </div>
        </div>

         <div class="col-12 col-xxl-6">
          <div class="card h-100">
            <div class="card-header">
              <h1 class="mb-0">My Workouts</h1>
            </div>
            <div class="card-body workout-scrollable">
              <WorkoutPlaylistsComponent
                @workout-scheduled="handleWorkoutScheduled"
              />
            </div>
          </div>
        </div>
      </div>
    </div> 



    <div class="container">
      <h1 class="mb-1" >Today's Calories</h1>
    <p class="u-muted mb-4">Quickly log your intake and visualize your last 7 days.</p>

    <!-- Quick Add Form -->
    <div class="card p-3 mb-3 home-card">
      <form class="row g-2 align-items-end" @submit.prevent="onAdd">
        <div class="col-sm-3">
          <label class="form-label">Calories</label>
          <input type="number" v-model.number="amount" class="form-control" min="1" step="1" required>
        </div>
        <div class="col-sm-5">
          <label class="form-label">Note (optional)</label>
          <input type="text" v-model="note" class="form-control" placeholder="e.g., Lunch sandwich">
        </div>
        <div class="col-sm-2 d-grid">
          <button class="u-btn u-btn--primary" type="submit">Add</button>
        </div>
        <div class="col-sm-2 text-sm-end">
          <small class="u-muted">Daily goal (set in Profile): {{ calorieData.dailyGoal }} kcal</small>
        </div>
      </form>
    </div>

    <div class="card p-3 mb-3 home-card" v-reveal>
      <CalorieProgress :consumed="todayConsumed" :goal="calorieData.dailyGoal" />
    </div>

    <div class="mb-4" v-if="todayConsumed < calorieData.dailyGoal">
      You're <strong>{{ calorieData.dailyGoal - todayConsumed }} kcal</strong> away from today's goal.
    </div>
    <div class="mb-4" v-else>
      Goal met. Great job!
    </div>

    <h5 class="mb-2 u-muted">Last 7 days</h5>
      <div class="card p-3 mb-4 home-card" v-reveal>
        <CalorieChart :series="weekSeries" />
      </div>
    </div>
  </div>

</template>

<script>
import { ref, onMounted, reactive, computed } from "vue";
import CalorieProgress from '@/components/CalorieProgress.vue'
import CalorieChart from '@/components/CalorieChart.vue'
import caloriesService from '@/services/caloriesService.js'
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'vue-router'
import WorkoutPlaylistsComponent from '@/components/WorkoutPlaylistsComponent.vue'
import CalendarComponent from '@/components/CalendarComponent.vue'


export default {
  components: {
    CalorieProgress,
    CalorieChart,
    WorkoutPlaylistsComponent,
    CalendarComponent
  },
  setup() {
    const router = useRouter()
    const auth = getAuth();

    // Reactive state for calorie data
    const calorieData = reactive({
      dailyGoal: 2000,
      entries: [],
      todayConsumed: 0,
      weekSeries: []
    });

    // Computed properties
    const todayConsumed = computed(() => {
      return caloriesService.getTodayConsumed(calorieData.entries);
    });

    const weekSeries = computed(() => {
      return caloriesService.getWeekSeries(calorieData.entries, 7);
    });

    // Load user calorie data
    const loadCalorieData = async () => {
      try {
        const data = await caloriesService.getUserCalories();
        calorieData.dailyGoal = data.dailyGoal || 2000;
        calorieData.entries = data.entries || [];
        calorieData.todayConsumed = todayConsumed.value;
        calorieData.weekSeries = weekSeries.value;
      } catch (error) {
        console.error('Error loading calorie data:', error);
      }
    };

    onMounted(async () => {
      onAuthStateChanged(auth, async (userCredential) => {
          if (userCredential) {
            // User is logged in, load data
            await loadCalorieData();
            
            // Set up real-time listener for calorie data
            caloriesService.subscribeToUserCalories((data) => {
              if (data) {
                calorieData.dailyGoal = data.dailyGoal || 2000;
                calorieData.entries = data.entries || [];
                calorieData.todayConsumed = todayConsumed.value;
                calorieData.weekSeries = weekSeries.value;
              }
            });
          } else {
            // User is not logged in, clean up listeners
            caloriesService.unsubscribeAll();
          }
      });
    })
    

    const amount = ref(0)
    const note = ref('')
    const calendarRef = ref(null)
    
    const onAdd = async () => {
      if (!Number.isFinite(amount.value) || amount.value <= 0) return
      try {
        await caloriesService.addCalorieEntry(amount.value, note.value)
        amount.value = 0
        note.value = ''
        // Data will be updated automatically via the real-time listener
      } catch (error) {
        console.error('Error adding calorie entry:', error);
      }
    }

    // Handle workout dropped on calendar
    const handleWorkoutDropped = async ({ workout, date, allDay }) => {
      // Open the workout playlists component's schedule modal
      // We need to communicate this back to the WorkoutPlaylistsComponent
      // For now, let's use a simple approach
      
      const formatDate = (date) => {
        return date.toISOString().split('T')[0]
      }
      
      const formatTime = (date) => {
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
      }
      
      // If all day, set a default time, otherwise use the dropped time
      const dropDate = new Date(date)
      const scheduleDate = formatDate(dropDate)
      const scheduleTime = allDay ? '09:00' : formatTime(dropDate)
      
      // We need a way to trigger the schedule modal in WorkoutPlaylistsComponent
      // For now, let's add the event directly to the calendar
      await handleWorkoutScheduled({
        workout,
        event: {
          title: `Workout: ${workout.name}`,
          start: allDay ? scheduleDate : dropDate.toISOString(),
          end: allDay ? null : calculateWorkoutEndTime(dropDate, workout),
          allDay: allDay,
          description: `${workout.description || ''}\n\nExercises: ${workout.exercises?.length || 0}`,
          extendedProps: {
            workoutId: workout.id,
            workoutType: 'scheduled',
            exercises: workout.exercises
          }
        }
      })
    }
    
    // Calculate end time for workout
    const calculateWorkoutEndTime = (startDate, workout) => {
      if (!workout.exercises) return startDate.toISOString()
      
      // Calculate duration (5 minutes per set, 3 sets per exercise by default)
      const durationMinutes = workout.exercises.reduce((total, exercise) => {
        const sets = exercise.sets || 3
        return total + (sets * 5)
      }, 0)
      
      const endDate = new Date(startDate.getTime() + (durationMinutes * 60 * 1000))
      return endDate.toISOString()
    }

    // Handle scheduled workout from modal
    const handleWorkoutScheduled = async ({ workout, event }) => {
      if (calendarRef.value && calendarRef.value.addEvent) {
        try {
          await calendarRef.value.addEvent(event)
          console.log('Workout scheduled successfully:', workout.name)
          
          // Show success message
          // You could add a toast notification here if you have one implemented
          
        } catch (error) {
          console.error('Error scheduling workout:', error)
          alert('Failed to schedule workout. Please try again.')
        }
      }
    }

    return { 
      calorieData,
      todayConsumed,
      weekSeries,
      amount,
      note,
      onAdd,
      calendarRef,
      handleWorkoutDropped,
      handleWorkoutScheduled,
    };
  }
};
</script>

<style scoped>
.workout-scrollable {
  max-height: 700px;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Custom scrollbar styling */
.workout-scrollable::-webkit-scrollbar {
  width: 6px;
}

.workout-scrollable::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.workout-scrollable::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.workout-scrollable::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Ensure equal height cards */
.card.h-100 {
  min-height: 700px;
}
</style>