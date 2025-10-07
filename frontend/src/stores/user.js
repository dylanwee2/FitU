import { defineStore } from 'pinia'
import { readUserProfile, writeUserProfile } from '@/services/persistence'

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
    profile: { dailyCalorieGoal: 2000 },
    lastSyncedAt: undefined
  }),
  getters: {
    dailyGoal: (state) => {
      const goal = state.profile?.dailyCalorieGoal
      return Number.isFinite(goal) && goal > 0 ? goal : 2000
    }
  },
  actions: {
    async loadUser() {
      // If Firebase Auth exists, you could wire it here; fallback to local uid
      const uid = getLocalUid()
      this.uid = uid
      const profile = await readUserProfile(uid)
      if (profile && profile.profile) {
        this.profile = { ...this.profile, ...profile.profile }
      }
      this.lastSyncedAt = Date.now()
    },
    async setDailyGoal(goal) {
      const parsed = Number(goal)
      if (!Number.isFinite(parsed) || parsed < 800 || parsed > 5000) return
      this.profile = { ...this.profile, dailyCalorieGoal: Math.round(parsed) }
      if (!this.uid) this.uid = getLocalUid()
      await writeUserProfile(this.uid, { profile: this.profile, updatedAt: Date.now() })
      this.lastSyncedAt = Date.now()
    }
  }
})


