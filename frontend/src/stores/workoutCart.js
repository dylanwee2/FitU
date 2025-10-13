import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { db } from '@/firebase'
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import { workoutVaultService } from '@/services/workoutVaultService.js'

export const useWorkoutCartStore = defineStore('workoutCart', () => {
  // State
  const cartItems = ref([])
  const savedPlaylists = ref([])
  const isAuthenticated = ref(false)
  const currentUser = ref(null)

  // Getters
  const cartItemCount = computed(() => cartItems.value.length)
  const cartTotalDuration = computed(() => {
    return cartItems.value.reduce((total, item) => {
      const sets = item.sets || 3 // Default to 3 sets if not specified
      return total + (sets * 5) // 5 minutes per set
    }, 0)
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
    // Check if exercise is already in cart
    const existingItem = cartItems.value.find(item => item.id === exercise.id)
    
    if (existingItem) {
      // If already in cart, show notification or update quantity
      console.log('Exercise already in cart')
      return false
    }

    // Add exercise to cart with additional metadata
    const cartItem = {
      ...exercise,
      addedAt: new Date().toISOString(),
      sets: 3, // Default sets
      reps: 10, // Default reps
      weight: null, // User can set this later
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
      // Create workout set document in Firebase
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

      // Create local playlist object with Firebase document ID
      const playlist = {
        id: docRef.id, // Use Firebase document ID
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
      // Update last used timestamp in Firebase
      try {
        const playlistRef = doc(db, "workoutSets", playlistId)
        await updateDoc(playlistRef, {
          lastUsed: new Date().toISOString()
        })
        
        // Update local playlist
        playlist.lastUsed = new Date().toISOString()
      } catch (error) {
        console.error('Error updating last used timestamp:', error)
      }
      
      // Load exercises into cart
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
      // Find the playlist to check if it's published
      const playlist = savedPlaylists.value.find(p => p.id === playlistId)
      
      // If the workout is published, delete it from the vault first
      if (playlist && playlist.isPublished && playlist.publishedId) {
        try {
          await workoutVaultService.unpublishWorkout(playlist.publishedId, currentUser.value.uid)
          console.log('Successfully deleted published workout from vault')
        } catch (error) {
          console.error('Error deleting from published workouts:', error)
          // Continue with deletion even if unpublishing fails
        }
      }
      
      // Delete the document from Firebase
      const playlistRef = doc(db, "workoutSets", playlistId)
      await deleteDoc(playlistRef)
      
      // Remove from local array
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

  const updatePlaylist = async (playlistId, updates) => {
    if (!currentUser.value) {
      throw new Error('User must be authenticated to update workout sets')
    }

    try {
      // Find the local playlist to check if it's published
      const playlist = savedPlaylists.value.find(p => p.id === playlistId)
      
      // Update in Firebase
      const playlistRef = doc(db, "workoutSets", playlistId)
      const firebaseUpdates = {
        ...updates,
        lastUsed: new Date().toISOString()
      }
      await updateDoc(playlistRef, firebaseUpdates)
      
      // If the workout is published, update the published version as well
      if (playlist && playlist.isPublished && playlist.publishedId) {
        try {
          const publishedRef = doc(db, "publishedWorkouts", playlist.publishedId)
          // Update the published workout with the same changes
          const publishedUpdates = {
            ...updates,
            updatedAt: new Date().toISOString()
          }
          await updateDoc(publishedRef, publishedUpdates)
          console.log('Successfully updated published workout in vault')
        } catch (error) {
          console.error('Error updating published workout:', error)
          // Continue even if published update fails
        }
      }
      
      // Update local playlist
      if (playlist) {
        Object.assign(playlist, updates)
        playlist.updatedAt = new Date().toISOString()
      }
      
      return true
    } catch (error) {
      console.error('Error updating workout set in Firebase:', error)
      throw new Error('Failed to update workout set. Please try again.')
    }
  }

  const duplicatePlaylist = async (playlistId) => {
    const originalPlaylist = savedPlaylists.value.find(p => p.id === playlistId)
    if (originalPlaylist) {
      try {
        // Create new document in Firebase
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

        // Create local playlist object with Firebase document ID
        const duplicatedPlaylist = {
          id: docRef.id, // Use Firebase document ID
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

  // Storage persistence (Firebase for authenticated users, localStorage for guests)
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
      // Clear playlists for non-authenticated users
      savedPlaylists.value = []
      return
    }

    try {
      // Load workout sets from Firebase for authenticated users
      const q = query(
        collection(db, "workoutSets"), 
        where("userId", "==", currentUser.value.uid)
      )
      const querySnapshot = await getDocs(q)
      
      savedPlaylists.value = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        savedPlaylists.value.push({
          id: doc.id, // Firebase document ID
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
      
      // Sort by last used date (most recent first)
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
        // User is logged in, load their workout sets from Firebase
        await loadPlaylistsFromStorage()
      } else {
        // User is not logged in, clear playlists (they're stored locally in cart only)
        savedPlaylists.value = []
      }
    })
  }

  const initializeStore = () => {
    loadFromLocalStorage() // Cart is always local
    initializeAuth()
  }

  // Initialize store when created
  initializeStore()

  return {
    // State
    cartItems,
    savedPlaylists,
    isAuthenticated,
    currentUser,
    
    // Getters
    cartItemCount,
    cartTotalDuration,
    cartMuscleGroups,
    
    // Actions
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    savePlaylist,
    loadPlaylist,
    deletePlaylist,
    updatePlaylist,
    duplicatePlaylist,
    initializeStore
  }
})
