// ExerciseDB API Service
const EXERCISEDB_API_URL = 'https://exercisedb.p.rapidapi.com'
const API_KEY = '4ec2a43493msh99508b142970754p12e5adjsnbe7e3fd95b2d' // Replace with your actual API key

class ExerciseService {
  constructor() {
    this.baseURL = EXERCISEDB_API_URL
    this.headers = {
      'X-RapidAPI-Key': API_KEY,
      'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
    }
  }

  // Get all exercises
  async getAllExercises() {
    try {
      const response = await fetch(`${this.baseURL}/exercises`, {
        headers: this.headers
      })
      if (!response.ok) throw new Error('Failed to fetch exercises')
      return await response.json()
    } catch (error) {
      console.error('Error fetching exercises:', error)
      throw error
    }
  }

  // Get exercises by body part
  async getExercisesByBodyPart(bodyPart) {
    try {
      const response = await fetch(`${this.baseURL}/exercises/bodyPart/${bodyPart}`, {
        headers: this.headers
      })
      if (!response.ok) throw new Error(`Failed to fetch exercises for ${bodyPart}`)
      return await response.json()
    } catch (error) {
      console.error(`Error fetching exercises for ${bodyPart}:`, error)
      throw error
    }
  }

  // Get exercises by target muscle
  async getExercisesByTarget(target) {
    try {
      const response = await fetch(`${this.baseURL}/exercises/target/${target}`, {
        headers: this.headers
      })
      if (!response.ok) throw new Error(`Failed to fetch exercises for target ${target}`)
      return await response.json()
    } catch (error) {
      console.error(`Error fetching exercises for target ${target}:`, error)
      throw error
    }
  }

  // Get exercises by equipment
  async getExercisesByEquipment(equipment) {
    try {
      const response = await fetch(`${this.baseURL}/exercises/equipment/${equipment}`, {
        headers: this.headers
      })
      if (!response.ok) throw new Error(`Failed to fetch exercises for equipment ${equipment}`)
      return await response.json()
    } catch (error) {
      console.error(`Error fetching exercises for equipment ${equipment}:`, error)
      throw error
    }
  }

  // Get specific exercise by ID
  async getExerciseById(id) {
    try {
      const response = await fetch(`${this.baseURL}/exercises/exercise/${id}`, {
        headers: this.headers
      })
      if (!response.ok) throw new Error(`Failed to fetch exercise ${id}`)
      return await response.json()
    } catch (error) {
      console.error(`Error fetching exercise ${id}:`, error)
      throw error
    }
  }

  // Get body parts list
  async getBodyParts() {
    try {
      const response = await fetch(`${this.baseURL}/exercises/bodyPartList`, {
        headers: this.headers
      })
      if (!response.ok) throw new Error('Failed to fetch body parts')
      return await response.json()
    } catch (error) {
      console.error('Error fetching body parts:', error)
      throw error
    }
  }

  // Get target muscles list
  async getTargetMuscles() {
    try {
      const response = await fetch(`${this.baseURL}/exercises/targetList`, {
        headers: this.headers
      })
      if (!response.ok) throw new Error('Failed to fetch target muscles')
      return await response.json()
    } catch (error) {
      console.error('Error fetching target muscles:', error)
      throw error
    }
  }

  // Get equipment list
  async getEquipmentList() {
    try {
      const response = await fetch(`${this.baseURL}/exercises/equipmentList`, {
        headers: this.headers
      })
      if (!response.ok) throw new Error('Failed to fetch equipment list')
      return await response.json()
    } catch (error) {
      console.error('Error fetching equipment list:', error)
      throw error
    }
  }

  // Search exercises by name
  async searchExercises(query) {
    try {
      const response = await fetch(`${this.baseURL}/exercises/name/${query}`, {
        headers: this.headers
      })
      if (!response.ok) throw new Error(`Failed to search exercises for ${query}`)
      return await response.json()
    } catch (error) {
      console.error(`Error searching exercises for ${query}:`, error)
      throw error
    }
  }

  // Get exercises for a specific workout plan
  async getExercisesForWorkout(workoutType) {
    const workoutMappings = {
      'push-day': {
        bodyParts: ['chest', 'shoulders', 'upper arms'],
        targets: ['pectorals', 'delts', 'triceps']
      },
      'pull-day': {
        bodyParts: ['back', 'upper arms'],
        targets: ['lats', 'middle back', 'biceps']
      },
      'core': {
        bodyParts: ['waist'],
        targets: ['abs', 'obliques', 'lower back']
      },
      'legs': {
        bodyParts: ['upper legs', 'lower legs'],
        targets: ['quads', 'glutes', 'calves', 'hamstrings']
      }
    }

    const mapping = workoutMappings[workoutType]
    if (!mapping) return []

    try {
      const allExercises = []
      
      // Fetch exercises for each body part
      for (const bodyPart of mapping.bodyParts) {
        const exercises = await this.getExercisesByBodyPart(bodyPart)
        allExercises.push(...exercises)
      }

      // Fetch exercises for each target muscle
      for (const target of mapping.targets) {
        const exercises = await this.getExercisesByTarget(target)
        allExercises.push(...exercises)
      }

      // Remove duplicates and return
      const uniqueExercises = allExercises.filter((exercise, index, self) => 
        index === self.findIndex(e => e.id === exercise.id)
      )

      return uniqueExercises.slice(0, 10) // Limit to 10 exercises per workout
    } catch (error) {
      console.error(`Error fetching exercises for ${workoutType}:`, error)
      return []
    }
  }
}

export default new ExerciseService()
