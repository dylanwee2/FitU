<template>
  <div class="comments-admin-page">
    <div class="container mt-4">
      <div class="header-section mb-4">
        <h1>Comments Administration</h1>
        <p class="text-muted">View all comments across all exercises in the database</p>
      </div>

      <div class="controls-section mb-4">
        <div class="row">
          <div class="col-md-6">
            <button @click="loadAllComments" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading ? 'Loading...' : 'Refresh All Comments' }}
            </button>
          </div>
          <div class="col-md-6 text-end">
            <span class="badge bg-info fs-6">Total Comments: {{ stats.totalComments }}</span>
          </div>
        </div>
      </div>

      <div class="stats-section mb-4" v-if="stats.totalComments > 0">
        <div class="row">
          <div class="col-md-4">
            <div class="card">
              <div class="card-body">
                <h6>Comments by Exercise</h6>
                <div v-for="(exercise, id) in stats.commentsByExercise" :key="id" class="mb-2">
                  <div class="d-flex justify-content-between">
                    <span>{{ exercise.exerciseName }}</span>
                    <span class="badge bg-secondary">{{ exercise.count }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card">
              <div class="card-body">
                <h6>Top Authors</h6>
                <div v-for="(count, author) in stats.topAuthors" :key="author" class="mb-2">
                  <div class="d-flex justify-content-between">
                    <span>{{ author }}</span>
                    <span class="badge bg-primary">{{ count }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card">
              <div class="card-body">
                <h6>Recent Activity</h6>
                <div v-for="comment in stats.recentActivity.slice(0, 3)" :key="comment.id" class="mb-2">
                  <small class="text-muted">{{ comment.exerciseName }}</small>
                  <div>{{ comment.content.substring(0, 50) }}...</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading all comments from Firebase...</p>
      </div>

      <div v-else-if="error" class="alert alert-danger">
        <h5>Error Loading Comments</h5>
        <p>{{ error }}</p>
        <button @click="loadAllComments" class="btn btn-outline-danger">Try Again</button>
      </div>

      <div v-else-if="allComments.length === 0" class="text-center py-5">
        <h5>No Comments Found</h5>
        <p class="text-muted">There are no comments in the database yet.</p>
      </div>

      <div v-else class="comments-list">
        <h4 class="mb-3">All Comments ({{ allComments.length }})</h4>
        
        <div class="filter-section mb-3">
          <div class="row">
            <div class="col-md-4">
              <select v-model="selectedExercise" class="form-select">
                <option value="">All Exercises</option>
                <option v-for="(exercise, id) in stats.commentsByExercise" :key="id" :value="id">
                  {{ exercise.exerciseName }} ({{ exercise.count }})
                </option>
              </select>
            </div>
            <div class="col-md-8">
              <input 
                v-model="searchText" 
                type="text" 
                class="form-control" 
                placeholder="Search comments by content or author..."
              >
            </div>
          </div>
        </div>

        <div class="row">
          <div 
            v-for="comment in filteredComments" 
            :key="comment.id" 
            class="col-12 mb-3"
          >
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <span class="badge bg-primary me-2">{{ comment.exerciseName }}</span>
                    <small class="text-muted">{{ formatTime(comment.createdAt) }}</small>
                  </div>
                  <span class="badge bg-outline-secondary">{{ comment.author.name || comment.author }}</span>
                </div>
                
                <p class="mb-2">{{ comment.content }}</p>
                
                <div class="comment-meta">
                  <small class="text-muted">
                    <strong>Post:</strong> {{ comment.postContent }}<br>
                    <strong>Author:</strong> {{ comment.postAuthor.name || comment.postAuthor }}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { firebaseForumService } from '../services/firebaseForumService.js'

const loading = ref(false)
const error = ref(null)
const allComments = ref([])
const stats = ref({
  totalComments: 0,
  commentsByExercise: {},
  topAuthors: {},
  recentActivity: []
})

const selectedExercise = ref('')
const searchText = ref('')

const filteredComments = computed(() => {
  let filtered = allComments.value

  if (selectedExercise.value) {
    filtered = filtered.filter(comment => comment.exerciseId === selectedExercise.value)
  }

  if (searchText.value.trim()) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(comment => 
      comment.content.toLowerCase().includes(search) ||
      (comment.author.name || comment.author).toLowerCase().includes(search) ||
      comment.exerciseName.toLowerCase().includes(search)
    )
  }

  return filtered
})

const loadAllComments = async () => {
  try {
    loading.value = true
    error.value = null
    
    console.log('Loading all comments from database...')
    
    const commentsData = await firebaseForumService.getAllComments()
    allComments.value = commentsData.items
    
    const statsData = await firebaseForumService.getCommentStats()
    stats.value = statsData
    
    console.log('✅ Successfully loaded all comments:', commentsData.total)
    console.log('Comments by exercise:', statsData.commentsByExercise)
    
  } catch (err) {
    console.error('❌ Error loading all comments:', err)
    error.value = err.message || 'Failed to load comments'
  } finally {
    loading.value = false
  }
}

const formatTime = (date) => {
  if (!date) return 'Unknown time'
  
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return date.toLocaleDateString()
}

onMounted(() => {
  loadAllComments()
})
</script>

<style scoped>
.comments-admin-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.header-section {
  text-align: center;
  padding: 2rem 0;
}

.header-section h1 {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stats-section .card {
  height: 100%;
}

.comments-list .card {
  transition: transform 0.2s ease-in-out;
}

.comments-list .card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.comment-meta {
  background-color: #f8f9fa;
  padding: 0.5rem;
  border-radius: 0.25rem;
  margin-top: 0.5rem;
}

.filter-section {
  background: white;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

@media (max-width: 768px) {
  .header-section h1 {
    font-size: 2rem;
  }
  
  .stats-section .col-md-4 {
    margin-bottom: 1rem;
  }
}
</style>