<template>
  <div class="progress-tracker">
    <div class="row">
      <!-- Stats Overview -->
      <div class="col-md-8">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🏋️</div>
            <div class="stat-content">
              <h3>{{ stats.totalWorkoutsCompleted }}</h3>
              <p>Workouts Completed</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">💪</div>
            <div class="stat-content">
              <h3>{{ stats.totalExercisesCompleted }}</h3>
              <p>Exercises Completed</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">🔥</div>
            <div class="stat-content">
              <h3>{{ stats.streak }}</h3>
              <p>Day Streak</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
              <h3>{{ stats.achievements.length }}</h3>
              <p>Achievements</p>
            </div>
          </div>
        </div>

        <!-- Recent Workouts -->
        <div class="recent-workouts mt-4">
          <h5>Recent Workouts</h5>
          <div v-if="recentWorkouts.length > 0" class="workout-list">
            <div 
              v-for="workout in recentWorkouts" 
              :key="workout.completedAt"
              class="workout-item"
            >
              <div class="workout-info">
                <h6>{{ workout.name }}</h6>
                <p class="text-muted">{{ formatDate(workout.completedAt) }}</p>
              </div>
              <div class="workout-stats">
                <span class="badge bg-success">{{ workout.exercises.length }} exercises</span>
                <span v-if="workout.duration" class="badge bg-info">{{ workout.duration }}min</span>
              </div>
            </div>
          </div>
          <div v-else class="text-muted">
            No workouts completed yet. Start your fitness journey!
          </div>
        </div>
      </div>

      <!-- Achievements -->
      <div class="col-md-4">
        <div class="achievements-section">
          <h5>Achievements</h5>
          <div v-if="stats.achievements.length > 0" class="achievements-list">
            <div 
              v-for="achievement in stats.achievements.slice(-5)" 
              :key="achievement.id"
              class="achievement-item"
            >
              <div class="achievement-icon">{{ achievement.icon }}</div>
              <div class="achievement-content">
                <h6>{{ achievement.title }}</h6>
                <p>{{ achievement.description }}</p>
                <small class="text-muted">{{ formatDate(achievement.earnedAt) }}</small>
              </div>
            </div>
          </div>
          <div v-else class="text-muted">
            Complete workouts to earn achievements!
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions mt-4">
          <h6>Quick Actions</h6>
          <div class="d-grid gap-2">
            <button 
              class="btn btn-outline-primary btn-sm"
              @click="exportProgress"
            >
              📤 Export Progress
            </button>
            <button 
              class="btn btn-outline-secondary btn-sm"
              @click="showImportDialog = true"
            >
              📥 Import Progress
            </button>
            <button 
              class="btn btn-outline-danger btn-sm"
              @click="confirmReset"
            >
              🔄 Reset Progress
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Import Dialog -->
    <div v-if="showImportDialog" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Import Progress</h5>
            <button type="button" class="btn-close" @click="showImportDialog = false"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="progressFile" class="form-label">Select Progress File</label>
              <input 
                type="file" 
                class="form-control" 
                id="progressFile"
                accept=".json"
                @change="handleFileImport"
                ref="fileInput"
              >
            </div>
            <div v-if="importError" class="alert alert-danger">
              {{ importError }}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showImportDialog = false">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reset Confirmation -->
    <div v-if="showResetConfirm" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Reset Progress</h5>
            <button type="button" class="btn-close" @click="showResetConfirm = false"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to reset all your progress? This action cannot be undone.</p>
            <div class="alert alert-warning">
              <strong>Warning:</strong> This will delete all your workout history, achievements, and statistics.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showResetConfirm = false">Cancel</button>
            <button type="button" class="btn btn-danger" @click="resetProgress">Reset Progress</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import progressService from '../services/progressService.js'

export default {
  name: 'ProgressTracker',
  setup() {
    const stats = ref({})
    const recentWorkouts = ref([])
    const showImportDialog = ref(false)
    const showResetConfirm = ref(false)
    const importError = ref('')
    const fileInput = ref(null)

    // Load progress data
    const loadProgress = () => {
      stats.value = progressService.getUserStats() || {}
      recentWorkouts.value = progressService.getWorkoutHistory(5)
    }

    // Format date for display
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Export progress
    const exportProgress = () => {
      progressService.exportProgress()
    }

    // Handle file import
    const handleFileImport = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      try {
        await progressService.importProgress(file)
        loadProgress()
        showImportDialog.value = false
        importError.value = ''
        
        // Reset file input
        if (fileInput.value) {
          fileInput.value.value = ''
        }
      } catch (error) {
        importError.value = 'Invalid file format. Please select a valid progress file.'
        console.error('Import error:', error)
      }
    }

    // Confirm reset
    const confirmReset = () => {
      showResetConfirm.value = true
    }

    // Reset progress
    const resetProgress = () => {
      progressService.clearProgress()
      loadProgress()
      showResetConfirm.value = false
    }

    // Check for new achievements
    const checkAchievements = () => {
      const newAchievements = progressService.checkAchievements()
      if (newAchievements.length > 0) {
        // Emit event or show notification
        console.log('New achievements earned:', newAchievements)
        loadProgress()
      }
    }

    onMounted(() => {
      loadProgress()
      checkAchievements()
    })

    return {
      stats,
      recentWorkouts,
      showImportDialog,
      showResetConfirm,
      importError,
      fileInput,
      formatDate,
      exportProgress,
      handleFileImport,
      confirmReset,
      resetProgress
    }
  }
}
</script>

<style scoped>
.progress-tracker {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.stat-icon {
  font-size: 2rem;
  opacity: 0.8;
}

.stat-content h3 {
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
}

.stat-content p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.workout-list {
  max-height: 300px;
  overflow-y: auto;
}

.workout-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  margin-bottom: 10px;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.workout-item:hover {
  background: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.workout-info h6 {
  margin: 0;
  color: #333;
}

.workout-info p {
  margin: 0;
  font-size: 0.85rem;
}

.workout-stats {
  display: flex;
  gap: 5px;
}

.achievements-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  height: fit-content;
}

.achievements-list {
  max-height: 300px;
  overflow-y: auto;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  margin-bottom: 10px;
  border: 1px solid #dee2e6;
}

.achievement-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.achievement-content h6 {
  margin: 0;
  color: #333;
  font-size: 0.9rem;
}

.achievement-content p {
  margin: 5px 0;
  font-size: 0.8rem;
  color: #666;
}

.achievement-content small {
  font-size: 0.75rem;
}

.quick-actions {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
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
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .stat-card {
    padding: 15px;
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
  
  .stat-content h3 {
    font-size: 1.5rem;
  }
  
  .workout-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .workout-stats {
    align-self: stretch;
    justify-content: flex-start;
  }
}
</style>
