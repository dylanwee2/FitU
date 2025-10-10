import { defineStore } from 'pinia'
import { readUserProfile, writeUserProfile } from '@/services/persistence'
import { getAuth } from 'firebase/auth'

function getLocalUid() {
  const key = 'fitu:uid'
  let uid = localStorage.getItem(key)
  if (!uid) {
    uid = 'local-' + Math.random().toString(36).slice(2, 10)
    localStorage.setItem(key, uid)
  }
  return uid
}

export const useUser = defineStore('user', {
  state: () => ({
    uid: null,
    profile: { dailyGoal: 2000 },
    lastSyncedAt: undefined
  }),
  getters: {
    dailyGoal: (state) => {
      const goal = state.profile?.dailyGoal
      return Number.isFinite(goal) && goal > 0 ? goal : 2000
    }
  },
  actions: {
    async loadUser() {
      // Get authenticated user ID from Firebase Auth
      const auth = getAuth()
      const user = auth.currentUser
      const uid = user ? user.uid : getLocalUid()
      
      this.uid = uid
      const data = await readUserProfile(uid)
      
      if (data) {
        // Load dailyGoal from root level (matching Profile page structure)
        this.profile = { 
          dailyGoal: data.dailyGoal || 2000
        }
      }
      this.lastSyncedAt = Date.now()
    },
    
    async setDailyGoal(goal) {
      const parsed = Number(goal)
      if (!Number.isFinite(parsed) || parsed < 800 || parsed > 5000) return
      
      // Get authenticated user ID
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) {
        console.error('No authenticated user')
        return
      }
      
      this.uid = user.uid
      this.profile = { ...this.profile, dailyGoal: Math.round(parsed) }
      
      // Save at root level (matching Profile page structure)
      // Only update dailyGoal field, don't overwrite other fields
      await writeUserProfile(this.uid, { 
        dailyGoal: Math.round(parsed),
        updatedAt: Date.now() 
      })
      
      this.lastSyncedAt = Date.now()
    }
  }
})
