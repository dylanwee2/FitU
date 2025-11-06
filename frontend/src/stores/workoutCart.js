import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { db } from '@/firebase'
import { collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import { workoutVaultService } from '@/services/workoutVaultService.js'
import { formatDuration } from '@/types/workout.js'

export const useWorkoutCartStore = defineStore('workoutCart', () => {
  const cartItems = ref([])
  const savedPlaylists = ref([])
  const isAuthenticated = ref(false)
  const currentUser = ref(null)

  // Getters
  const cartItemCount = computed(() => cartItems.value.length)
  const cartTotalDuration = computed(() => {
    return cartItems.value.reduce((total, item) => {
      const sets = item.sets || 3 
      return total + (sets * 5) 
    }, 0)
  })

  const cartTotalDurationFormatted = computed(() => {
    return formatDuration(cartTotalDuration.value)
  })

  const cartMuscleGroups = computed(() => {
    const muscles = new Set()
    cartItems.value.forEach(item => {
      if (item.target) {
        const targetMuscles = Array.isArray(item.target) ? item.target : item.target.split(', ')
        targetMuscles.forEach(muscle => muscles.add(muscle.trim()))
      }
    })
    return Array.from(muscles)
  })

  // Actions
  const addToCart = (exercise) => {
    const existingItem = cartItems.value.find(item => item.id === exercise.id)
    
    if (existingItem) {
      console.log('Exercise already in cart')
      return false
    }

    const cartItem = {
      ...exercise,
      addedAt: new Date().toISOString(),
      sets: 3, 
      reps: 10, 
      weight: null, 
      notes: ''
    }

    cartItems.value.push(cartItem)
    saveToLocalStorage()
    return true
  }

  const removeFromCart = (exerciseId) => {
    const index = cartItems.value.findIndex(item => item.id === exerciseId)
    if (index > -1) {
      cartItems.value.splice(index, 1)
      saveToLocalStorage()
      return true
    }
    return false
  }

  const updateCartItem = (exerciseId, updates) => {
    const item = cartItems.value.find(item => item.id === exerciseId)
    if (item) {
      Object.assign(item, updates)
      saveToLocalStorage()
      return true
    }
    return false
  }

  const clearCart = () => {
    cartItems.value = []
    saveToLocalStorage()
  }

  const savePlaylist = async (playlistName, description = '') => {
    if (cartItems.value.length === 0) {
      throw new Error('Cannot save empty playlist')
    }

    if (!isAuthenticated.value || !currentUser.value) {
      throw new Error('Please log in to save workout sets')
    }

    try {
      const docRef = await addDoc(collection(db, "workoutSets"), {
        userId: currentUser.value.uid,
        name: playlistName,
        description,
        exercises: [...cartItems.value],
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        totalDuration: cartTotalDuration.value,
        muscleGroups: [...cartMuscleGroups.value]
      })

      const playlist = {
        id: docRef.id, 
        userId: currentUser.value.uid,
        name: playlistName,
        description,
        exercises: [...cartItems.value],
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        totalDuration: cartTotalDuration.value,
        muscleGroups: [...cartMuscleGroups.value]
      }

      savedPlaylists.value.push(playlist)
      return playlist
    } catch (error) {
      console.error('Error saving workout set to Firebase:', error)
      throw new Error('Failed to save workout set. Please try again.')
    }
  }

  const loadPlaylist = async (playlistId) => {
    const playlist = savedPlaylists.value.find(p => p.id === playlistId)
    if (playlist) {
      try {
        const playlistRef = doc(db, "workoutSets", playlistId)
        await updateDoc(playlistRef, {
          lastUsed: new Date().toISOString()
        })
        
        playlist.lastUsed = new Date().toISOString()
      } catch (error) {
        console.error('Error updating last used timestamp:', error)
      }
      
      cartItems.value = [...playlist.exercises]
      saveToLocalStorage()
      return true
    }
    return false
  }

  const deletePlaylist = async (playlistId) => {
    if (!currentUser.value) {
      throw new Error('User must be authenticated to delete workout sets')
    }

    try {
      const playlist = savedPlaylists.value.find(p => p.id === playlistId)
      
      if (playlist && playlist.isPublished && playlist.publishedId) {
        try {
          await workoutVaultService.unpublishWorkout(playlist.publishedId, currentUser.value.uid)
          console.log('Successfully deleted published workout from vault')
        } catch (error) {
          console.error('Error deleting from published workouts:', error)
        }
      }
      
      const playlistRef = doc(db, "workoutSets", playlistId)
      await deleteDoc(playlistRef)
      
      const index = savedPlaylists.value.findIndex(p => p.id === playlistId)
      if (index > -1) {
        savedPlaylists.value.splice(index, 1)
      }
      
      return true
    } catch (error) {
      console.error('Error deleting workout set from Firebase:', error)
      throw new Error('Failed to delete workout set. Please try again.')
    }
  }

  const getPlaylistById = async (playlistId) => {
    if (!currentUser.value) {
      throw new Error('User must be authenticated to get workout sets')
    }

    try {
      const localPlaylist = savedPlaylists.value.find(p => p.id === playlistId)
      if (localPlaylist) {
        return localPlaylist
      }

      const docRef = doc(db, "workoutSets", playlistId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const workoutData = { id: docSnap.id, ...docSnap.data() }
        
        if (workoutData.userId === currentUser.value.uid) {
          return workoutData
        } else {
          throw new Error('Unauthorized: You can only access your own workouts')
        }
      } else {
        return null
      }
    } catch (error) {
      console.error('Error getting workout set:', error)
      throw error
    }
  }

  const updatePlaylist = async (playlistId, updates) => {
    if (!currentUser.value) {
      throw new Error('User must be authenticated to update workout sets')
    }

    try {
      const playlist = savedPlaylists.value.find(p => p.id === playlistId)
      
      const playlistRef = doc(db, "workoutSets", playlistId)
      const firebaseUpdates = {
        ...updates,
        lastUsed: new Date().toISOString()
      }
      
      await updateDoc(playlistRef, firebaseUpdates)
      
      if (playlist) {
        Object.assign(playlist, updates)
        playlist.updatedAt = new Date().toISOString()
      }
      
      if (playlist && playlist.isPublished && playlist.publishedId) {
        try {
          await workoutVaultService.updatePublishedWorkout(playlist.publishedId, updates, currentUser.value.uid)
        } catch (vaultError) {
          console.error('Error updating published workout in vault:', vaultError)
          console.warn('Published workout in vault could not be updated. Local workout was updated successfully.')
        }
      }
      
      return true
    } catch (error) {
      console.error('Error updating workout set in Firebase:', error)
      console.error('Error details:', error.message, error.code)
      throw new Error('Failed to update workout set. Please try again.')
    }
  }

  const duplicatePlaylist = async (playlistId) => {
    const originalPlaylist = savedPlaylists.value.find(p => p.id === playlistId)
    if (originalPlaylist) {
      try {
        const docRef = await addDoc(collection(db, "workoutSets"), {
          userId: currentUser.value.uid,
          name: `${originalPlaylist.name} (Copy)`,
          description: originalPlaylist.description,
          exercises: [...originalPlaylist.exercises],
          createdAt: new Date().toISOString(),
          lastUsed: new Date().toISOString(),
          totalDuration: originalPlaylist.totalDuration,
          muscleGroups: [...originalPlaylist.muscleGroups]
        })

        const duplicatedPlaylist = {
          id: docRef.id, 
          userId: currentUser.value.uid,
          name: `${originalPlaylist.name} (Copy)`,
          description: originalPlaylist.description,
          exercises: [...originalPlaylist.exercises],
          createdAt: new Date().toISOString(),
          lastUsed: new Date().toISOString(),
          totalDuration: originalPlaylist.totalDuration,
          muscleGroups: [...originalPlaylist.muscleGroups]
        }
        
        savedPlaylists.value.push(duplicatedPlaylist)
        return duplicatedPlaylist
      } catch (error) {
        console.error('Error duplicating workout set in Firebase:', error)
        throw new Error('Failed to duplicate workout set. Please try again.')
      }
    }
    return null
  }

  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('fitU_workout_cart', JSON.stringify(cartItems.value))
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('fitU_workout_cart')
      if (saved) {
        cartItems.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error)
    }
  }

  const loadPlaylistsFromStorage = async () => {
    if (!currentUser.value) {
      savedPlaylists.value = []
      return
    }

    try {
      const q = query(
        collection(db, "workoutSets"), 
        where("userId", "==", currentUser.value.uid)
      )
      const querySnapshot = await getDocs(q)
      
      savedPlaylists.value = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        savedPlaylists.value.push({
          id: doc.id, 
          userId: data.userId,
          name: data.name,
          description: data.description,
          exercises: data.exercises,
          createdAt: data.createdAt,
          lastUsed: data.lastUsed,
          totalDuration: data.totalDuration,
          muscleGroups: data.muscleGroups
        })
      })
      
      savedPlaylists.value.sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
      
    } catch (error) {
      console.error('Failed to load workout sets from Firebase:', error)
      savedPlaylists.value = []
    }
  }

  const initializeAuth = () => {
    const auth = getAuth()
    onAuthStateChanged(auth, async (user) => {
      isAuthenticated.value = !!user
      currentUser.value = user
      
      if (user) {
        await loadPlaylistsFromStorage()
      } else {
        savedPlaylists.value = []
      }
    })
  }

  const initializeStore = () => {
    loadFromLocalStorage() 
    initializeAuth()
  }

  initializeStore()

  return {
    cartItems,
    savedPlaylists,
    isAuthenticated,
    currentUser,
    
    cartItemCount,
    cartTotalDuration,
    cartTotalDurationFormatted,
    cartMuscleGroups,
    
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    savePlaylist,
    loadPlaylist,
    deletePlaylist,
    getPlaylistById,
    updatePlaylist,
    duplicatePlaylist,
    initializeStore
  }
})
