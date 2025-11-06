import { ref, onMounted } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const isAuthenticated = ref(false)
const currentUser = ref(null)
const isLoading = ref(true)

export const useAuth = () => {
  const auth = getAuth()

  onMounted(() => {
    onAuthStateChanged(auth, (user) => {
      currentUser.value = user
      isAuthenticated.value = !!user
      isLoading.value = false
    })
  })

  return {
    isAuthenticated,
    currentUser,
    isLoading,
    auth
  }
}

export { isAuthenticated, currentUser, isLoading }