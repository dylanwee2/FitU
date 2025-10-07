// User Progress Tracking Service
class ProgressService {
  constructor() {
    this.storageKey = 'fitu_workout_progress'
    this.initializeProgress()
  }

  // Initialize progress data structure
  initializeProgress() {
    if (!this.getProgress()) {
      const initialProgress = {
        workouts: {},
        exercises: {},
        stats: {
          totalWorkoutsCompleted: 0,
          totalExercisesCompleted: 0,
          streak: 0,
          lastWorkoutDate: null,
          favoriteWorkouts: [],
          achievements: []
        }
      }
      this.saveProgress(initialProgress)
    }
  }

  // Get all progress data
  getProgress() {
    try {
      const progress = localStorage.getItem(this.storageKey)
      return progress ? JSON.parse(progress) : null
    } catch (error) {
      console.error('Error getting progress:', error)
      return null
    }
  }

  // Save progress data
  saveProgress(progress) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(progress))
    } catch (error) {
      console.error('Error saving progress:', error)
    }
  }

  // Mark workout as completed
  completeWorkout(workoutId, workoutData) {
    const progress = this.getProgress()
    if (!progress) return

    const workoutKey = `${workoutId}_${Date.now()}`
    progress.workouts[workoutKey] = {
      id: workoutId,
      name: workoutData.name,
      completedAt: new Date().toISOString(),
      exercises: workoutData.exercises || [],
      duration: workoutData.duration || 0,
      notes: workoutData.notes || ''
    }

    // Update stats
    progress.stats.totalWorkoutsCompleted++
    progress.stats.lastWorkoutDate = new Date().toISOString()
    
    // Update streak
    this.updateStreak(progress)

    this.saveProgress(progress)
    return workoutKey
  }

  // Mark exercise as completed
  completeExercise(exerciseId, exerciseData) {
    const progress = this.getProgress()
    if (!progress) return

    const exerciseKey = `${exerciseId}_${Date.now()}`
    progress.exercises[exerciseKey] = {
      id: exerciseId,
      name: exerciseData.name,
      completedAt: new Date().toISOString(),
      sets: exerciseData.sets || 0,
      reps: exerciseData.reps || 0,
      weight: exerciseData.weight || 0,
      duration: exerciseData.duration || 0,
      notes: exerciseData.notes || ''
    }

    // Update stats
    progress.stats.totalExercisesCompleted++

    this.saveProgress(progress)
    return exerciseKey
  }

  // Update workout streak
  updateStreak(progress) {
    const today = new Date()
    const lastWorkoutDate = progress.stats.lastWorkoutDate ? new Date(progress.stats.lastWorkoutDate) : null
    
    if (!lastWorkoutDate) {
      progress.stats.streak = 1
      return
    }

    const daysDiff = Math.floor((today - lastWorkoutDate) / (1000 * 60 * 60 * 24))
    
    if (daysDiff === 0) {
      // Same day, don't change streak
      return
    } else if (daysDiff === 1) {
      // Consecutive day, increment streak
      progress.stats.streak++
    } else {
      // Streak broken, reset to 1
      progress.stats.streak = 1
    }
  }

  // Get workout history
  getWorkoutHistory(limit = 10) {
    const progress = this.getProgress()
    if (!progress) return []

    return Object.values(progress.workouts)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, limit)
  }

  // Get exercise history
  getExerciseHistory(exerciseId, limit = 10) {
    const progress = this.getProgress()
    if (!progress) return []

    return Object.values(progress.exercises)
      .filter(exercise => exercise.id === exerciseId)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, limit)
  }

  // Get user stats
  getUserStats() {
    const progress = this.getProgress()
    return progress ? progress.stats : null
  }

  // Add favorite workout
  addFavoriteWorkout(workoutId) {
    const progress = this.getProgress()
    if (!progress) return

    if (!progress.stats.favoriteWorkouts.includes(workoutId)) {
      progress.stats.favoriteWorkouts.push(workoutId)
      this.saveProgress(progress)
    }
  }

  // Remove favorite workout
  removeFavoriteWorkout(workoutId) {
    const progress = this.getProgress()
    if (!progress) return

    progress.stats.favoriteWorkouts = progress.stats.favoriteWorkouts.filter(id => id !== workoutId)
    this.saveProgress(progress)
  }

  // Check if workout is favorite
  isFavoriteWorkout(workoutId) {
    const progress = this.getProgress()
    return progress ? progress.stats.favoriteWorkouts.includes(workoutId) : false
  }

  // Add achievement
  addAchievement(achievement) {
    const progress = this.getProgress()
    if (!progress) return

    const achievementKey = `${achievement.id}_${Date.now()}`
    progress.stats.achievements.push({
      ...achievement,
      earnedAt: new Date().toISOString()
    })

    this.saveProgress(progress)
    return achievementKey
  }

  // Get achievements
  getAchievements() {
    const progress = this.getProgress()
    return progress ? progress.stats.achievements : []
  }

  // Check for new achievements
  checkAchievements() {
    const progress = this.getProgress()
    if (!progress) return []

    const newAchievements = []
    const stats = progress.stats

    // First workout achievement
    if (stats.totalWorkoutsCompleted === 1 && !this.hasAchievement('first_workout')) {
      newAchievements.push({
        id: 'first_workout',
        title: 'First Steps',
        description: 'Completed your first workout!',
        icon: '🏋️',
        type: 'milestone'
      })
    }

    // 10 workouts achievement
    if (stats.totalWorkoutsCompleted === 10 && !this.hasAchievement('ten_workouts')) {
      newAchievements.push({
        id: 'ten_workouts',
        title: 'Getting Stronger',
        description: 'Completed 10 workouts!',
        icon: '💪',
        type: 'milestone'
      })
    }

    // 7-day streak achievement
    if (stats.streak === 7 && !this.hasAchievement('week_streak')) {
      newAchievements.push({
        id: 'week_streak',
        title: 'Week Warrior',
        description: '7-day workout streak!',
        icon: '🔥',
        type: 'streak'
      })
    }

    // 30-day streak achievement
    if (stats.streak === 30 && !this.hasAchievement('month_streak')) {
      newAchievements.push({
        id: 'month_streak',
        title: 'Consistency King',
        description: '30-day workout streak!',
        icon: '👑',
        type: 'streak'
      })
    }

    // Add new achievements
    newAchievements.forEach(achievement => {
      this.addAchievement(achievement)
    })

    return newAchievements
  }

  // Check if user has specific achievement
  hasAchievement(achievementId) {
    const achievements = this.getAchievements()
    return achievements.some(achievement => achievement.id === achievementId)
  }

  // Clear all progress (for testing/reset)
  clearProgress() {
    localStorage.removeItem(this.storageKey)
    this.initializeProgress()
  }

  // Export progress data
  exportProgress() {
    const progress = this.getProgress()
    const dataStr = JSON.stringify(progress, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `fitu-progress-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  // Import progress data
  importProgress(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const progress = JSON.parse(e.target.result)
          this.saveProgress(progress)
          resolve(progress)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = reject
      reader.readAsText(file)
    })
  }
}

export default new ProgressService()
