// Persistence helpers for Firebase (if available) or localStorage fallback

// Load Firebase using ESM-safe dynamic imports under Vite
async function getFirebaseServices() {
  try {
    const fb = await import('@/firebase.js')
    const app = fb.app
    if (!app) return { app: null }
    const dbApi = await import('firebase/firestore')
    const authApi = await import('firebase/auth')
    return { app, dbApi, authApi }
  } catch (e) {
    return { app: null }
  }
}

function lsGet(key, def = null) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : def
  } catch {
    return def
  }
}

function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

export async function readUserProfile(uid) {
  const fb = await getFirebaseServices()
  if (fb.app && fb.dbApi) {
    const db = fb.dbApi.getFirestore()
    const { doc, getDoc } = fb.dbApi
    const ref = doc(db, 'users', uid)
    const snap = await getDoc(ref)
    return snap.exists() ? snap.data() : null
  }
  return lsGet(`fitu:user:${uid}`, null)
}

export async function writeUserProfile(uid, data) {
  const fb = await getFirebaseServices()
  if (fb.app && fb.dbApi) {
    const db = fb.dbApi.getFirestore()
    const { doc, setDoc } = fb.dbApi
    const ref = doc(db, 'users', uid)
    await setDoc(ref, data, { merge: true })
    return
  }
  lsSet(`fitu:user:${uid}`, data)
}

export async function readCalories(uid, date) {
  const fb = await getFirebaseServices()
  if (fb.app && fb.dbApi) {
    const db = fb.dbApi.getFirestore()
    const { doc, getDoc } = fb.dbApi
    const ref = doc(db, 'calories', uid, 'days', date)
    const snap = await getDoc(ref)
    return snap.exists() ? snap.data() : null
  }
  return lsGet(`fitu:calories:${uid}:${date}`, null)
}

export async function writeCalories(uid, date, data) {
  const fb = await getFirebaseServices()
  if (fb.app && fb.dbApi) {
    const db = fb.dbApi.getFirestore()
    const { doc, setDoc } = fb.dbApi
    const ref = doc(db, 'calories', uid, 'days', date)
    await setDoc(ref, data, { merge: true })
    return
  }
  lsSet(`fitu:calories:${uid}:${date}`, data)
}


