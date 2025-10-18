<template>
  <div class="home-page">
    <div class="container-fluid">
      <!-- Example 3: Full Calendar Component -->
      <div class="row mb-5">
        <div class="col-12 col-xxl-6 mb-3 mb-xxl-0">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="mb-0">Timetable</h5>
            </div>
            <div class="card-body">
              <CalendarComponent 
                :show-controls="true"
                :show-add-event="true"
                :show-file-upload="true"
                :show-department-field="true"
              />
            </div>
          </div>
        </div>

         <div class="col-12 col-xxl-6">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="mb-0">My Workouts</h5>
            </div>
            <div class="card-body workout-scrollable">
              <WorkoutPlaylistsComponent/>
            </div>
          </div>
        </div>
      </div>
    </div> 

    <div class="container mt-4">
      <!-- Authentication Required Modal -->
      <div v-if="showAuthModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Authentication Required</h5>
            </div>
          <div class="modal-body">
            <p>You need to be logged in to use FitU. Please log in or sign up to continue.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="u-btn u-btn--primary" @click="redirectToLanding">OK</button>
          </div>
        </div>
      </div>
    </div>

    
  
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
    const showAuthModal = ref(false);

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

    const redirectToLanding = () => {
      showAuthModal.value = false;
      router.push('/');
    };

    onMounted(async () => {
      onAuthStateChanged(auth, async (userCredential) => {
          if (userCredential) {
            // User is logged in, hide modal and load data
            showAuthModal.value = false;
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
            // User is not logged in, show modal
            showAuthModal.value = true;
            // Clean up listeners
            caloriesService.unsubscribeAll();
          }
      });
    })
    

    const amount = ref(0)
    const note = ref('')
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

    return { 
      calorieData,
      todayConsumed,
      weekSeries,
      amount,
      note,
      onAdd,
      showAuthModal,
      redirectToLanding,
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