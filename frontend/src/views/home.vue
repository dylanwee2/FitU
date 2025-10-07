<template>
  <div class="container mt-4">
    <h1 class="mb-3" style="color: var(--primary)">Today's Calories</h1>

    <!-- Quick Add Form -->
    <form class="row g-2 align-items-end mb-3" @submit.prevent="onAdd">
      <div class="col-sm-3">
        <label class="form-label">Calories</label>
        <input type="number" v-model.number="amount" class="form-control" min="1" step="1" required>
      </div>
      <div class="col-sm-5">
        <label class="form-label">Note (optional)</label>
        <input type="text" v-model="note" class="form-control" placeholder="e.g., Lunch sandwich">
      </div>
      <div class="col-sm-2 d-grid">
        <button class="btn btn-primary" type="submit">Add</button>
      </div>
      <div class="col-sm-2 text-sm-end">
        <small class="text-muted">Daily goal (set in Profile): {{ user.dailyGoal }} kcal</small>
      </div>
    </form>

    <div v-reveal>
      <CalorieProgress :consumed="meals.todayConsumed" :goal="user.dailyGoal" />
    </div>

    <div class="mb-4" v-if="meals.todayConsumed < user.dailyGoal">
      You're <strong>{{ user.dailyGoal - meals.todayConsumed }} kcal</strong> away from today's goal.
    </div>
    <div class="mb-4" v-else>
      Goal met. Great job!
    </div>

    <h5 class="mb-2" style="color: var(--secondary)">Last 7 days</h5>
    <div v-reveal>
      <CalorieChart :series="meals.weekSeries(7)" />
    </div>

    <!-- Workout Planner Toggle -->
    <div class="mb-4 mt-5">
      <button 
        class="btn btn-success btn-lg" 
        @click="toggleWorkoutPlanner"
      >
        {{ showWorkoutPlanner ? 'Hide Workouts' : '🏋️ Show Workouts' }}
      </button>
    </div>

    <!-- Workout Planner Component -->
    <div v-if="showWorkoutPlanner">
      <WorkoutPlanner 
        :show-back-button="false"
        :show-progress-tracker="true"
        @workout-selected="onWorkoutSelected"
        @exercise-selected="onExerciseSelected"
        @workout-completed="onWorkoutCompleted"
      />
    </div>

  </div>

</template>

<script>
import { ref, onMounted } from "vue";
import CalorieProgress from '@/components/CalorieProgress.vue'
import CalorieChart from '@/components/CalorieChart.vue'
import { useUser } from '@/stores/user'
import { useMeals } from '@/stores/meals'
import { useRouter } from "vue-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import WorkoutPlanner from "../components/WorkoutPlanner.vue";

export default {
  components: {
    WorkoutPlanner,
    CalorieProgress,
    CalorieChart
  },
  setup() {
    const router = useRouter();
    const auth = getAuth();

    const username = ref("");

    const user = useUser();

    const meals = useMeals();
    onMounted(async () => {
      await user.loadUser();
      await meals.init();
    })
    // Workout Planner state and handlers
    const showWorkoutPlanner = ref(false)
    const toggleWorkoutPlanner = () => {
      showWorkoutPlanner.value = !showWorkoutPlanner.value
    }
    const onWorkoutSelected = (workout) => {
      console.log('Workout selected:', workout)
    }
    const onExerciseSelected = (exercise) => {
      console.log('Exercise selected:', exercise)
    }
    const onWorkoutCompleted = (data) => {
      console.log('Workout completed:', data)
    }

    const amount = ref(0)
    const note = ref('')
    const onAdd = async () => {
      if (!Number.isFinite(amount.value) || amount.value <= 0) return
      await meals.addCalories(amount.value, note.value)
      amount.value = 0
      note.value = ''
    }

    const signout = async () => {
      try {
        await auth.signOut();
        router.push("/");
      } catch (err) {
        console.error(err);
      }
    };


    onMounted(() => {
      onAuthStateChanged(auth, (user) => {
        username.value = user ? user.displayName : "";
      });
    });

    return { 
      username, 
      signout,
      showWorkoutPlanner,
      toggleWorkoutPlanner,
      onWorkoutSelected,
      onExerciseSelected,
      onWorkoutCompleted,
      user,
      meals,
      amount,
      note,
      onAdd
    };
  }
};
</script>

<style scoped>
input.form-control {
  max-width: 100%;
}
</style>