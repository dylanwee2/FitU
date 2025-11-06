import { db } from '@/firebase.js'
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc,
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot 
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

class CaloriesService {
  constructor() {
    this.auth = getAuth()
    this.caloriesCollection = 'calories'
    this.userProfilesCollection = 'userProfiles'
    this.listeners = new Map() 
  }

  getCurrentUserId() {
    const user = this.auth.currentUser
    if (!user) {
      throw new Error('No authenticated user found')
    }
    return user.uid
  }

  async ensureUserCaloriesExist(userId = null) {
    try {
      const uid = userId || this.getCurrentUserId()
      const userCaloriesRef = doc(db, this.caloriesCollection, uid)
      const userCaloriesDoc = await getDoc(userCaloriesRef)

      if (!userCaloriesDoc.exists()) {
        const emptyCaloriesData = {
          userId: uid,
          dailyGoal: 2000, 
          entries: [], 
          createdAt: new Date(),
          updatedAt: new Date()
        }

        await setDoc(userCaloriesRef, emptyCaloriesData)
        console.log(`Created empty calories data for user: ${uid}`)
        return emptyCaloriesData
      }

      return userCaloriesDoc.data()
    } catch (error) {
      console.error('Error ensuring user calories exist:', error)
      throw error
    }
  }

  async getUserCalories(userId = null) {
    try {
      const uid = userId || this.getCurrentUserId()
      
      const userData = await this.ensureUserCaloriesExist(uid)
      return userData
    } catch (error) {
      console.error('Error getting user calories:', error)
      return {
        userId: uid,
        dailyGoal: 2000,
        entries: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  }

  async addCalorieEntry(calories, note = '', date = null) {
    try {
      const uid = this.getCurrentUserId()
      const entryDate = date || new Date()
      const userCalories = await this.getUserCalories(uid)
      
      const newEntry = {
        id: Date.now().toString(), 
        calories: Number(calories),
        note: note.trim(),
        date: entryDate,
        createdAt: new Date()
      }

      const updatedEntries = [...(userCalories.entries || []), newEntry]
      
      const userCaloriesRef = doc(db, this.caloriesCollection, uid)
      await updateDoc(userCaloriesRef, {
        entries: updatedEntries,
        updatedAt: new Date()
      })

      console.log('Calorie entry added:', newEntry)
      return newEntry
    } catch (error) {
      console.error('Error adding calorie entry:', error)
      throw error
    }
  }

  async updateDailyGoal(goal) {
    try {
      const uid = this.getCurrentUserId()
      const parsedGoal = Number(goal)
      
      if (!Number.isFinite(parsedGoal) || parsedGoal < 800 || parsedGoal > 5000) {
        throw new Error('Daily goal must be between 800 and 5000 calories')
      }

      await this.ensureUserCaloriesExist(uid)
      
      const userCaloriesRef = doc(db, this.caloriesCollection, uid)
      await updateDoc(userCaloriesRef, {
        dailyGoal: Math.round(parsedGoal),
        updatedAt: new Date()
      })

      console.log('Daily goal updated:', parsedGoal)
      return Math.round(parsedGoal)
    } catch (error) {
      console.error('Error updating daily goal:', error)
      throw error
    }
  }

  getTodayConsumed(entries = []) {
    const today = new Date()
    const todayString = today.toDateString()
    
    return entries
      .filter(entry => {
        const entryDate = entry.date?.toDate ? entry.date.toDate() : new Date(entry.date)
        return entryDate.toDateString() === todayString
      })
      .reduce((total, entry) => total + (Number(entry.calories) || 0), 0)
  }

  getWeekSeries(entries = [], days = 7) {
    const today = new Date()
    const series = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateString = date.toDateString()
      
      const dayTotal = entries
        .filter(entry => {
          const entryDate = entry.date?.toDate ? entry.date.toDate() : new Date(entry.date)
          return entryDate.toDateString() === dateString
        })
        .reduce((total, entry) => total + (Number(entry.calories) || 0), 0)
      
      series.push({
        date: date,
        consumed: dayTotal
      })
    }
    
    return series
  }

  async deleteCalorieEntry(entryId) {
    try {
      const uid = this.getCurrentUserId()
      const userCalories = await this.getUserCalories(uid)
      
      const updatedEntries = userCalories.entries.filter(entry => entry.id !== entryId)
      
      const userCaloriesRef = doc(db, this.caloriesCollection, uid)
      await updateDoc(userCaloriesRef, {
        entries: updatedEntries,
        updatedAt: new Date()
      })

      console.log('Calorie entry deleted:', entryId)
      return true
    } catch (error) {
      console.error('Error deleting calorie entry:', error)
      throw error
    }
  }

  subscribeToUserCalories(callback, userId = null) {
    try {
      const uid = userId || this.getCurrentUserId()
      const userCaloriesRef = doc(db, this.caloriesCollection, uid)
      
      const unsubscribe = onSnapshot(userCaloriesRef, (doc) => {
        if (doc.exists()) {
          callback(doc.data())
        } else {
          this.ensureUserCaloriesExist(uid).then(data => callback(data))
        }
      }, (error) => {
        console.error('Error in calorie data subscription:', error)
        callback(null, error)
      })

      this.listeners.set(uid, unsubscribe)
      return unsubscribe
    } catch (error) {
      console.error('Error setting up calorie subscription:', error)
      throw error
    }
  }

  unsubscribeAll() {
    this.listeners.forEach((unsubscribe) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    })
    this.listeners.clear()
  }

  unsubscribeUser(userId = null) {
    const uid = userId || this.getCurrentUserId()
    const unsubscribe = this.listeners.get(uid)
    if (unsubscribe && typeof unsubscribe === 'function') {
      unsubscribe()
      this.listeners.delete(uid)
    }
  }
}

export const caloriesService = new CaloriesService()
export default caloriesService