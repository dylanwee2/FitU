<template>
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
              @event-added="handleEventAdded"
              @event-updated="handleEventUpdated"
              @event-deleted="handleEventDeleted"
              @events-imported="handleEventsImported"
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
            <WorkoutPlaylistsComponent 
              @playlist-selected="handlePlaylistSelected"
              @playlist-edited="handlePlaylistEdited"
              @playlist-published="handlePlaylistPublished"
              @playlist-unpublished="handlePlaylistUnpublished"
            />
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
          <small class="u-muted">Daily goal (set in Profile): {{ user.dailyGoal }} kcal</small>
        </div>
      </form>
    </div>

    <div class="card p-3 mb-3 home-card" v-reveal>
      <CalorieProgress :consumed="meals.todayConsumed" :goal="user.dailyGoal" />
    </div>

    <div class="mb-4" v-if="meals.todayConsumed < user.dailyGoal">
      You're <strong>{{ user.dailyGoal - meals.todayConsumed }} kcal</strong> away from today's goal.
    </div>
    <div class="mb-4" v-else>
      Goal met. Great job!
    </div>

    <h5 class="mb-2 u-muted">Last 7 days</h5>
    <div class="card p-3 mb-4 home-card" v-reveal>
      <CalorieChart :series="meals.weekSeries(7)" />
    </div>
  </div>

</template>

<script>
import { ref, onMounted } from "vue";
import CalorieProgress from '@/components/CalorieProgress.vue'
import CalorieChart from '@/components/CalorieChart.vue'
import { useUser } from '@/stores/user'
import { useMeals } from '@/stores/meals'
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

    const user = useUser();
    const meals = useMeals();
    const router = useRouter()
    const auth = getAuth();
    const showAuthModal = ref(false);

    const redirectToLanding = () => {
      showAuthModal.value = false;
      router.push('/');
    };

    onMounted(async () => {
      await user.loadUser();
      await meals.init();

      onAuthStateChanged(auth, async (userCredential) => {
          if (userCredential) {
            // User is logged in, hide modal if it was shown
            showAuthModal.value = false;
          } else {
            // User is not logged in, show modal
            showAuthModal.value = true;
          }
      });
    })
    

    const amount = ref(0)
    const note = ref('')
    const onAdd = async () => {
      if (!Number.isFinite(amount.value) || amount.value <= 0) return
      await meals.addCalories(amount.value, note.value)
      amount.value = 0
      note.value = ''
    }

    return { 
      user,
      meals,
      amount,
      note,
      onAdd,
      showAuthModal,
      redirectToLanding
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