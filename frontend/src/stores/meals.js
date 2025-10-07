import { defineStore } from 'pinia'
import { useUser } from './user'
import { readCalories, writeCalories } from '@/services/persistence'

function ymd(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const useMeals = defineStore('meals', {
  state: () => ({
    byDate: {},
    lastOpenedDate: ''
  }),
  getters: {
    todayKey: () => ymd(),
    todayConsumed: (state) => {
      const key = ymd()
      return state.byDate[key]?.consumed || 0
    },
    weekSeries: (state) => {
      return (lookback = 7) => {
        const series = []
        const base = new Date()
        for (let i = lookback - 1; i >= 0; i--) {
          const d = new Date(base)
          d.setDate(base.getDate() - i)
          const key = ymd(d)
          series.push({ date: key, consumed: state.byDate[key]?.consumed || 0 })
        }
        return series
      }
    }
  },
  actions: {
    async init() {
      const user = useUser()
      if (!user.uid) await user.loadUser()
      const key = ymd()
      // Ensure today exists and handle daily reset
      if (this.lastOpenedDate !== key) {
        if (!this.byDate[key]) this.byDate[key] = { consumed: 0, entries: [] }
        this.lastOpenedDate = key
      }
      // Load persisted for the last 7 days
      const days = this._lastNDates(7)
      for (const d of days) {
        const doc = await readCalories(user.uid, d)
        if (doc) this.byDate[d] = doc
      }
      // Ensure today exists after load
      if (!this.byDate[key]) this.byDate[key] = { consumed: 0, entries: [] }
    },
    async addCalories(amount, note = '') {
      const value = Number(amount)
      if (!Number.isFinite(value) || value <= 0) return
      const user = useUser()
      if (!user.uid) await user.loadUser()
      const key = ymd()
      if (!this.byDate[key]) this.byDate[key] = { consumed: 0, entries: [] }
      this.byDate[key].consumed += Math.round(value)
      this.byDate[key].entries.push({ id: crypto.randomUUID?.() || String(Date.now()), amount: Math.round(value), note, ts: Date.now() })
      await this.persist(key)
    },
    async removeEntry(id) {
      const key = ymd()
      const day = this.byDate[key]
      if (!day) return
      const idx = day.entries.findIndex(e => e.id === id)
      if (idx >= 0) {
        const entry = day.entries[idx]
        day.entries.splice(idx, 1)
        day.consumed = Math.max(0, (day.consumed || 0) - (entry?.amount || 0))
        await this.persist(key)
      }
    },
    async persist(dateKey) {
      const user = useUser()
      if (!user.uid) await user.loadUser()
      const key = dateKey || ymd()
      const doc = this.byDate[key] || { consumed: 0, entries: [] }
      await writeCalories(user.uid, key, doc)
    },
    _lastNDates(n) {
      const out = []
      const base = new Date()
      for (let i = 0; i < n; i++) {
        const d = new Date(base)
        d.setDate(base.getDate() - i)
        out.push(ymd(d))
      }
      return out
    }
  }
})


