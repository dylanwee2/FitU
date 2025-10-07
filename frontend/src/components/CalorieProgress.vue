<template>
  <div class="card mb-4" aria-label="Calorie progress for today">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-end mb-2">
        <div>
          <div class="text-muted">Consumed</div>
          <div class="display-6 fw-bold">{{ consumed }} kcal</div>
        </div>
        <div class="text-end">
          <div class="text-muted">Left to hit today's goal</div>
          <div class="h4 m-0">{{ left }} kcal</div>
        </div>
      </div>
      <div 
        class="progress" 
        role="progressbar" 
        :aria-valuenow="clamped"
        aria-valuemin="0" 
        aria-valuemax="100"
      >
        <div 
          class="progress-bar" 
          :style="{ width: clamped + '%', background: 'var(--primary)' }"
        ></div>
      </div>
      <small class="text-muted d-block mt-2">Daily goal (set in Profile): {{ goalToUse }} kcal</small>
    </div>
  </div>
  <div v-if="showGoalHint" class="alert alert-warning alert-dismissible fade show" role="alert">
    Set your daily goal in Profile. Using default 2000 kcal for now.
    <button type="button" class="btn-close" @click="dismissHint = true"></button>
  </div>
</template>

<script>
export default {
  name: 'CalorieProgress',
  props: {
    consumed: { type: Number, required: true },
    goal: { type: Number, required: true }
  },
  data() {
    return { dismissHint: false }
  },
  computed: {
    goalToUse() {
      const g = Number(this.goal)
      return Number.isFinite(g) && g > 0 ? g : 2000
    },
    left() {
      return Math.max(this.goalToUse - (this.consumed || 0), 0)
    },
    clamped() {
      const denom = this.goalToUse || 2000
      const pct = denom > 0 ? (Math.min((this.consumed || 0) / denom, 1) * 100) : 0
      return Math.round(pct)
    },
    showGoalHint() {
      return !this.dismissHint && (!this.goal || this.goal <= 0)
    }
  }
}
</script>

<style scoped>
.progress {
  height: 28px;
}
</style>


