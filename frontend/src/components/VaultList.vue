<template>
  <div class="vault-list">
    <div class="container mt-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>🏆 Community Vault</h2>
          <p class="text-muted">Discover and import workout sets from the community</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="row g-3 mb-4">
        <div class="col-md-6">
          <select v-model="sortBy" @change="loadVaultPosts" class="form-select">
            <option value="newest">Newest</option>
            <option value="highestRating">Highest Rating</option>
            <option value="mostReviewed">Most Reviewed</option>
          </select>
        </div>
        <div class="col-md-6">
          <input v-model="searchQuery" @input="handleSearch" type="text" 
                 class="form-control" placeholder="Search workout sets...">
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary mb-3"></div>
        <p>Loading community workout sets...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-5">
        <i class="fas fa-exclamation-triangle text-warning mb-3" style="font-size: 3rem;"></i>
        <h4>Unable to Load Vault</h4>
        <p class="text-muted">{{ error }}</p>
        <button @click="loadVaultPosts" class="btn btn-primary">Try Again</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredPosts.length === 0" class="text-center py-5">
        <i class="fas fa-search text-muted mb-3" style="font-size: 4rem;"></i>
        <h4>No workout sets found</h4>
        <p class="text-muted">
          {{ searchQuery ? 'Try adjusting your search terms.' : 'Be the first to publish a workout set!' }}
        </p>
      </div>

      <!-- Vault Posts List -->
      <div v-else class="row g-3">
        <div v-for="post in filteredPosts" :key="post.id" class="col-sm-6 col-lg-4">
          <div class="card h-100">
            <!-- Card Header -->
            <div class="card-header d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <span class="badge bg-info me-2">
                  <i class="fas fa-star me-1"></i>{{ post.avgRating.toFixed(1) }}
                </span>
                <small class="text-muted">{{ post.reviewsCount }} reviews</small>
              </div>
              <small class="text-muted">by {{ post.createdBy }}</small>
            </div>

            <!-- Card Body -->
            <div class="card-body">
              <h5 class="card-title">{{ post.title }}</h5>
              <p class="card-text text-muted">{{ truncateText(post.description, 80) }}</p>
              
              <div class="small text-muted mb-3">
                <div><i class="fas fa-dumbbell me-1"></i>{{ post.exercises.length }} exercises</div>
                <div><i class="fas fa-clock me-1"></i>{{ post.totalDuration || 0 }}min</div>
              </div>
            </div>

            <!-- Card Footer -->
            <div class="card-footer d-flex justify-content-between">
              <div>
                <button v-if="!isImported(post.id)" @click="importPost(post)" 
                        class="btn btn-primary btn-sm me-2" :disabled="importingIds.has(post.id)">
                  <span v-if="importingIds.has(post.id)">
                    <i class="fas fa-spinner fa-spin me-1"></i>Importing...
                  </span>
                  <span v-else>
                    <i class="fas fa-download me-1"></i>Import
                  </span>
                </button>
                <span v-else class="badge bg-success">
                  <i class="fas fa-check me-1"></i>Imported
                </span>
                <button @click="viewPost(post)" class="btn btn-outline-secondary btn-sm">
                  <i class="fas fa-eye me-1"></i>View
                </button>
              </div>
              <small class="text-muted align-self-center">{{ formatDate(post.createdAt) }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/firebase'
import { vaultService } from '@/services/vaultService.js'

const router = useRouter()

// Reactive state
const vaultPosts = ref([])
const loading = ref(false)
const error = ref('')
const sortBy = ref('newest')
const searchQuery = ref('')
const importingIds = ref(new Set())
const importedPostIds = ref(new Set())

// Real-time subscription
let unsubscribe = null

// Computed properties
const currentUser = computed(() => auth.currentUser)

const filteredPosts = computed(() => {
  if (!searchQuery.value) return vaultPosts.value
  
  const query = searchQuery.value.toLowerCase()
  return vaultPosts.value.filter(post => 
    post.title.toLowerCase().includes(query) ||
    post.description.toLowerCase().includes(query)
  )
})

// Methods
const loadVaultPosts = async () => {
  loading.value = true
  error.value = ''
  try {
    const posts = await vaultService.listVaultPosts({ sort: sortBy.value })
    vaultPosts.value = posts
  } catch (err) {
    console.error('Error loading vault posts:', err)
    error.value = err.message || 'Failed to load vault posts'
  } finally {
    loading.value = false
  }
}

const setupRealtimeListener = () => {
  if (unsubscribe) return
  unsubscribe = vaultService.subscribeToVaultPosts(
    (posts) => {
      vaultPosts.value = posts
      loading.value = false
    },
    { sort: sortBy.value }
  )
}

const loadImportStatus = async () => {
  if (!currentUser.value) return
  try {
    const promises = vaultPosts.value.map(async (post) => {
      const imported = await vaultService.alreadyImported(currentUser.value.uid, post.id)
      if (imported) {
        importedPostIds.value.add(post.id)
      }
    })
    await Promise.all(promises)
  } catch (err) {
    console.error('Error checking import status:', err)
  }
}

const importPost = async (post) => {
  if (!currentUser.value) return
  importingIds.value.add(post.id)
  try {
    await vaultService.importFromVault(currentUser.value.uid, post.id)
    importedPostIds.value.add(post.id)
  } catch (err) {
    console.error('Error importing post:', err)
    alert('Failed to import workout set: ' + err.message)
  } finally {
    importingIds.value.delete(post.id)
  }
}

const viewPost = (post) => {
  router.push(`/vault/${post.id}`)
}

const isImported = (postId) => {
  return importedPostIds.value.has(postId)
}

const handleSearch = () => {
  // Debounce search if needed in future
}

// Utility functions
const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  return date.toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  setupRealtimeListener()
  if (currentUser.value) {
    loadImportStatus()
  } else {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        loadImportStatus()
      }
    })
    onUnmounted(() => unsubscribeAuth())
  }
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>

<style scoped>
.card {
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
}
</style>