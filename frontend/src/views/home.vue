<template>
  <div class="container mt-4">
    <h1>Meal Planner</h1>
    <p>Welcome, {{ username }}</p>
    <button class="btn btn-primary mb-4" @click.prevent="signout">Sign Out</button>

    <!-- Plan Size -->
    <div class="mb-3">
      <label class="form-label">Number of Meals</label>
      <input type="number" v-model.number="plan.size" class="form-control" min="1" />
    </div>

    <!-- Health Preferences -->
    <div class="mb-3">
      <label class="form-label">Health Preferences</label>
      <div class="form-check" v-for="option in healthOptions" :key="option">
        <input
          class="form-check-input"
          type="checkbox"
          :value="option"
          v-model="plan.plan.accept.all[0].health"
        />
        <label class="form-check-label">{{ option }}</label>
      </div>
    </div>

    <!-- Calories -->
    <div class="mb-3">
      <label class="form-label">Calories Range (kcal)</label>
      <div class="d-flex gap-2">
        <input type="number" v-model.number="plan.plan.fit.ENERC_KCAL.min" class="form-control" placeholder="Min" />
        <input type="number" v-model.number="plan.plan.fit.ENERC_KCAL.max" class="form-control" placeholder="Max" />
      </div>
    </div>

    <!-- Sugar -->
    <div class="mb-3">
      <label class="form-label">Max Added Sugar (g)</label>
      <input type="number" v-model.number="plan.plan.fit['SUGAR.added'].max" class="form-control" />
    </div>

    <!-- Excluded Recipes -->
    <div class="mb-3">
      <label class="form-label">Exclude Recipes</label>
      <div v-for="(item, index) in plan.plan.exclude" :key="index" class="input-group mb-2">
        <input v-model="plan.plan.exclude[index]" class="form-control" placeholder="Recipe name or URL" />
        <button class="btn btn-danger" @click="removeExclude(index)">×</button>
      </div>
      <button class="btn btn-secondary btn-sm" @click="addExclude">+ Add Exclude</button>
    </div>

    <!-- Meal Sections -->
    <div class="mb-4">
      <h4>Meal Sections</h4>
      <div v-for="(section, name) in plan.plan.sections" :key="name" class="border rounded p-3 mb-3">
        <h5>{{ name }}</h5>

        <div class="mb-2">
          <label class="form-label">Dishes (comma-separated)</label>
          <input
            type="text"
            v-model="section.dishesString"
            class="form-control"
            placeholder="e.g. egg, salad, pasta"
          />
        </div>

        <div class="mb-2">
          <label class="form-label">Meal Types (comma-separated)</label>
          <input
            type="text"
            v-model="section.mealsString"
            class="form-control"
            placeholder="e.g. breakfast, lunch/dinner"
          />
        </div>

        <div class="mb-2">
          <label class="form-label">Calories Range</label>
          <div class="d-flex gap-2">
            <input type="number" v-model.number="section.fit.ENERC_KCAL.min" class="form-control" placeholder="Min" />
            <input type="number" v-model.number="section.fit.ENERC_KCAL.max" class="form-control" placeholder="Max" />
          </div>
        </div>
      </div>
    </div>

    <button class="btn btn-primary" @click="submitPlan">Generate Plan</button>

    <pre class="mt-4 bg-light p-3 rounded">{{ formattedPlan }}</pre>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default {
  setup() {
    const router = useRouter();
    const auth = getAuth();
    const username = ref("");

    const healthOptions = ["SOY_FREE", "FISH_FREE", "MEDITERRANEAN"];

    // Reactive plan
    const plan = ref({
      size: 7,
      plan: {
        accept: { all: [{ health: [] }] },
        fit: { ENERC_KCAL: { min: 1000, max: 2000 }, "SUGAR.added": { max: 20 } },
        exclude: [],
        sections: {
          Breakfast: { fit: { ENERC_KCAL: { min: 100, max: 600 } }, dishesString: "", mealsString: "breakfast" },
          Lunch: { fit: { ENERC_KCAL: { min: 300, max: 900 } }, dishesString: "", mealsString: "lunch/dinner" },
          Dinner: { fit: { ENERC_KCAL: { min: 200, max: 900 } }, dishesString: "", mealsString: "lunch/dinner" }
        }
      }
    });

    const addExclude = () => plan.value.plan.exclude.push("");
    const removeExclude = (index) => plan.value.plan.exclude.splice(index, 1);

    // Computed property to generate API-ready JSON string
    const formattedPlan = computed(() => {
      const apiPlan = {
        size: plan.value.size,
        plan: {
          accept: { all: [{ health: plan.value.plan.accept.all[0].health }] },
          fit: plan.value.plan.fit,
          exclude: plan.value.plan.exclude,
          sections: {}
        }
      };

      Object.entries(plan.value.plan.sections).forEach(([name, section]) => {
        apiPlan.plan.sections[name] = {
          accept: {
            all: [
              { dish: section.dishesString.split(",").map(s => s.trim()).filter(Boolean) },
              { meal: section.mealsString.split(",").map(s => s.trim()).filter(Boolean) }
            ]
          },
          fit: section.fit
        };
      });

      // Convert to formatted JSON string
      return JSON.stringify(apiPlan, null, 2);
    });

    const submitPlan = async () => {
      try {
        console.log(formattedPlan.value)
        const recipes = await getDietPlan(formattedPlan.value);
        console.log("Recipes returned:", recipes);
      } catch (err) {
        console.error("Error fetching plan:", err);
      }
    };

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

    return { plan, healthOptions, addExclude, removeExclude, submitPlan, formattedPlan, username, signout };
  }
};
</script>

<style scoped>
input.form-control {
  max-width: 100%;
}
</style>