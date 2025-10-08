<template>
  <div class="discussion-forum">
    <!-- Header -->
    <div class="forum-header">
      <div class="d-flex justify-content-between align-items-center">
        <h3 class="forum-title">Discussion Forum</h3>
        <div class="forum-controls">
          <span class="badge bg-info me-2">Exercise ID: {{ exerciseId }}</span>
          <button @click="loadPosts" class="btn btn-sm btn-outline-secondary" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
            {{ loading ? 'Loading...' : 'Refresh' }}
          </button>
        </div>
      </div>
      <small class="text-muted">{{ posts.length }} discussion{{ posts.length !== 1 ? 's' : '' }}</small>
    </div>

    <!-- New Post Section -->
    <div class="new-post-section">
      <div class="new-post-form">
        <textarea
          v-model="newPostContent"
          placeholder="Share your thoughts about this exercise..."
          class="new-post-textarea"
          rows="3"
        ></textarea>
        <div class="new-post-actions">
          <button
            @click="createPost"
            :disabled="!newPostContent.trim()"
            class="btn btn-primary"
          >
            Post
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading discussions from Firebase...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="posts.length === 0" class="empty-state">
      <p>No discussions yet. Be the first to share your thoughts!</p>
    </div>

    <!-- Posts List -->
    <div v-else class="posts-list">
      <div
        v-for="post in posts"
        :key="post.id"
        class="post-card"
      >
        <!-- Post Content -->
        <div class="post-content">
          <div class="post-main">
            <div class="post-info">
              <span class="post-author">{{ post.author.name }}</span>
              <span class="post-time">{{ formatTime(post.createdAt) }}</span>
            </div>
            
            <!-- Edit Mode -->
            <div v-if="editingPost === post.id" class="edit-form">
              <textarea
                v-model="editPostContent"
                class="edit-textarea"
                rows="3"
              ></textarea>
              <div class="edit-actions">
                <button @click="updatePost(post.id)" class="btn btn-primary btn-sm">
                  Save
                </button>
                <button @click="cancelEdit" class="btn btn-secondary btn-sm">
                  Cancel
                </button>
              </div>
            </div>
            
            <!-- View Mode -->
            <div v-else class="post-message">
              {{ post.content }}
            </div>
          </div>

          <!-- Post Actions -->
          <div v-if="canEdit(post)" class="post-actions">
            <button
              @click="startEdit(post)"
              class="btn btn-ghost btn-sm"
              v-if="editingPost !== post.id"
            >
              Update
            </button>
            <button
              @click="deletePost(post.id)"
              class="btn btn-ghost btn-sm btn-delete"
            >
              Delete
            </button>
          </div>
        </div>

        <!-- Comments Toggle -->
        <div class="comments-toggle">
          <button
            @click="toggleComments(post.id)"
            class="comments-toggle-btn"
          >
            {{ post.comments.length }} comment{{ post.comments.length !== 1 ? 's' : '' }}
            {{ expandedPosts.has(post.id) ? '(collapsed)' : '(when pressed)' }}
          </button>
        </div>

        <!-- Comments Section -->
        <div v-if="expandedPosts.has(post.id)" class="comments-section">
          <!-- Existing Comments -->
          <div
            v-for="comment in post.comments"
            :key="comment.id"
            class="comment-card"
          >
            <div class="comment-content">
              <div class="comment-info">
                <span class="comment-author">{{ comment.author.name }}</span>
                <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
              </div>
              <div class="comment-message">{{ comment.content }}</div>
            </div>
            <div v-if="canEdit(comment)" class="comment-actions">
              <button
                @click="deleteComment(post.id, comment.id)"
                class="btn btn-ghost btn-xs btn-delete"
              >
                Delete
              </button>
            </div>
          </div>

          <!-- New Comment Form -->
          <div class="new-comment-form">
            <textarea
              v-model="newCommentContent[post.id]"
              placeholder="Add a comment..."
              class="new-comment-textarea"
              rows="2"
            ></textarea>
            <div class="new-comment-actions">
              <button
                @click="createComment(post.id)"
                :disabled="!newCommentContent[post.id]?.trim()"
                class="btn btn-primary btn-sm"
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div v-if="showDeleteConfirm" class="delete-confirm-overlay" @click="cancelDelete">
    <div class="delete-confirm-modal" @click.stop>
      <div class="delete-confirm-header">
        <h5>{{ deleteModalTitle }}</h5>
      </div>
      <div class="delete-confirm-body">
        <p>{{ deleteModalMessage }}</p>
        <p class="text-warning"><small>{{ deleteModalWarning }}</small></p>
      </div>
      <div class="delete-confirm-actions">
        <button @click="cancelDelete" class="btn btn-secondary me-2">No, Cancel</button>
        <button @click="confirmDelete" class="btn btn-danger">Yes, Delete</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { firebaseForumService } from '../services/firebaseForumService.js'

// Types
interface User {
  id: string | number
  name: string
}

interface Comment {
  id: string | number
  content: string
  author: User
  createdAt: Date
}

interface Post {
  id: string | number
  content: string
  author: User
  createdAt: Date
  comments: Comment[]
}

// Props
interface Props {
  exerciseId: string | number
  currentUser?: User
  initialOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialOpen: false
})

// Emits
const emit = defineEmits<{
  'created-post': [post: Post]
  'updated-post': [post: Post]
  'deleted-post': [postId: string | number]
  'created-comment': [postId: string | number, comment: Comment]
  'deleted-comment': [postId: string | number, commentId: string | number]
}>()

// State
const loading = ref(false)
const posts = ref<Post[]>([])
const expandedPosts = ref(new Set<string | number>())
const newPostContent = ref('')
const newCommentContent = reactive<Record<string | number, string>>({})
const editingPost = ref<string | number | null>(null)
const editPostContent = ref('')

// Delete confirmation modal state
const showDeleteConfirm = ref(false)
const postToDelete = ref<string | number | null>(null)
const commentToDelete = ref<{ postId: string | number; commentId: string | number } | null>(null)

// Computed
const canEdit = computed(() => (item: Post | Comment) => {
  return props.currentUser && item.author.id === props.currentUser.id
})

// Delete modal computed properties
const isPostDeletion = computed(() => !!postToDelete.value)
const isCommentDeletion = computed(() => !!commentToDelete.value)
const deleteModalTitle = computed(() => isPostDeletion.value ? 'Delete Post' : 'Delete Comment')
const deleteModalMessage = computed(() => 
  isPostDeletion.value 
    ? 'Are you sure you want to delete this post?' 
    : 'Are you sure you want to delete this comment?'
)
const deleteModalWarning = computed(() => 
  isPostDeletion.value 
    ? 'This will also delete all comments and cannot be undone.' 
    : 'This action cannot be undone.'
)

// Methods
const loadPosts = async () => {
  loading.value = true
  try {
    console.log('=== LOADING POSTS FROM FIREBASE ===')
    console.log('Exercise ID received from props:', props.exerciseId)
    console.log('Exercise ID type:', typeof props.exerciseId)
    console.log('Loading posts from Firebase for exercise:', props.exerciseId)
    const fetchedPosts = await firebaseForumService.fetchPosts(props.exerciseId)
    console.log('✅ Successfully fetched posts:', fetchedPosts.length)
    posts.value = fetchedPosts
    
    // Auto-expand if initialOpen is true
    if (props.initialOpen && posts.value.length > 0) {
      expandedPosts.value.add(posts.value[0].id)
    }
  } catch (error) {
    console.error('❌ Failed to load posts:', error)
    // Show user-friendly error
    alert('Failed to load discussions. Please check your connection.')
  } finally {
    loading.value = false
  }
}

const createPost = async () => {
  console.log('=== CREATE POST DEBUG ===')
  console.log('Current user:', props.currentUser)
  console.log('Post content:', newPostContent.value)
  console.log('Content trimmed:', newPostContent.value.trim())
  console.log('Exercise ID:', props.exerciseId)
  
  if (!props.currentUser) {
    console.error('❌ No current user - user not logged in!')
    alert('You must be logged in to create a post.')
    return
  }
  
  if (!newPostContent.value.trim()) {
    console.error('❌ Post content is empty!')
    alert('Please enter some content for your post.')
    return
  }
  
  try {
    console.log('✅ Starting post creation...')
    const newPost = await firebaseForumService.createPost(
      props.exerciseId,
      newPostContent.value.trim(),
      props.currentUser
    )
    
    console.log('✅ Post created successfully:', newPost)
    posts.value.unshift(newPost)
    newPostContent.value = ''
    emit('created-post', newPost)
    
    console.log('✅ Post added to UI and form cleared')
  } catch (error) {
    console.error('❌ Failed to create post:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    alert('Failed to create post: ' + errorMessage)
  }
}

const startEdit = (post: Post) => {
  editingPost.value = post.id
  editPostContent.value = post.content
}

const cancelEdit = () => {
  editingPost.value = null
  editPostContent.value = ''
}

const updatePost = async (postId: string | number) => {
  if (!editPostContent.value.trim()) return
  
  try {
    console.log('Updating post...')
    await firebaseForumService.updatePost(postId.toString(), editPostContent.value.trim())
    
    // Update local state
    const index = posts.value.findIndex(p => p.id === postId)
    if (index !== -1) {
      posts.value[index].content = editPostContent.value.trim()
    }
    
    cancelEdit()
    emit('updated-post', posts.value[index])
    
    console.log('Post updated successfully!')
  } catch (error) {
    console.error('Failed to update post:', error)
    alert('Failed to update post. Please try again.')
  }
}

const deletePost = async (postId: string | number) => {
  // Show confirmation modal instead of browser confirm
  postToDelete.value = postId
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  postToDelete.value = null
  commentToDelete.value = null
}

const confirmDelete = async () => {
  try {
    // Delete post
    if (postToDelete.value) {
      console.log('Deleting post...')
      await firebaseForumService.deletePost(postToDelete.value.toString())
      
      // Update local state
      const index = posts.value.findIndex(p => p.id === postToDelete.value)
      if (index !== -1) {
        posts.value.splice(index, 1)
      }
      
      expandedPosts.value.delete(postToDelete.value)
      emit('deleted-post', postToDelete.value)
      
      console.log('Post deleted successfully!')
    }
    // Delete comment
    else if (commentToDelete.value) {
      console.log('Deleting comment...')
      await firebaseForumService.deleteComment(commentToDelete.value.commentId.toString())
      
      // Update local state
      const post = posts.value.find(p => p.id === commentToDelete.value!.postId)
      if (post) {
        const index = post.comments.findIndex(c => c.id === commentToDelete.value!.commentId)
        if (index !== -1) {
          post.comments.splice(index, 1)
        }
      }
      
      emit('deleted-comment', commentToDelete.value.postId, commentToDelete.value.commentId)
      
      console.log('Comment deleted successfully!')
    }
    
    // Close modal
    showDeleteConfirm.value = false
    postToDelete.value = null
    commentToDelete.value = null
  } catch (error) {
    console.error('Failed to delete:', error)
    alert('Failed to delete. Please try again.')
    // Close modal even on error
    showDeleteConfirm.value = false
    postToDelete.value = null
    commentToDelete.value = null
  }
}

const toggleComments = (postId: string | number) => {
  if (expandedPosts.value.has(postId)) {
    expandedPosts.value.delete(postId)
  } else {
    expandedPosts.value.add(postId)
  }
}

const createComment = async (postId: string | number) => {
  if (!props.currentUser || !newCommentContent[postId]?.trim()) return
  
  try {
    console.log('Creating comment...')
    const newComment = await firebaseForumService.createComment(
      postId.toString(),
      newCommentContent[postId].trim(),
      props.currentUser
    )
    
    // Update local state
    const post = posts.value.find(p => p.id === postId)
    if (post) {
      post.comments.push(newComment)
    }
    
    newCommentContent[postId] = ''
    emit('created-comment', postId, newComment)
    
    console.log('Comment created successfully!')
  } catch (error) {
    console.error('Failed to create comment:', error)
    alert('Failed to create comment. Please try again.')
  }
}

const deleteComment = async (postId: string | number, commentId: string | number) => {
  // Show confirmation modal instead of browser confirm
  commentToDelete.value = { postId, commentId }
  showDeleteConfirm.value = true
}

const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

// Lifecycle
onMounted(() => {
  console.log('🚀 Discussion forum component mounted for exercise:', props.exerciseId)
  loadPosts()
})

// Watch for exercise ID changes (when navigating between exercises)
watch(() => props.exerciseId, (newExerciseId, oldExerciseId) => {
  console.log('🔄 Exercise ID changed!', { from: oldExerciseId, to: newExerciseId })
  if (newExerciseId !== oldExerciseId) {
    console.log('📥 Reloading posts for new exercise ID...')
    loadPosts()
  }
}, { immediate: false })
</script>

<style scoped>
.discussion-forum {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.forum-header {
  margin-bottom: 1.5rem;
}

.forum-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

/* New Post Section */
.new-post-section {
  margin-bottom: 2rem;
}

/* Delete Confirmation Modal */
.delete-confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.delete-confirm-modal {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
}

.delete-confirm-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.delete-confirm-header h5 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.delete-confirm-body {
  padding: 1.5rem;
}

.delete-confirm-body p {
  margin: 0 0 1rem 0;
  color: #374151;
}

.delete-confirm-body p:last-child {
  margin-bottom: 0;
}

.delete-confirm-actions {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.new-post-form {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
}

.new-post-textarea {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  resize: vertical;
  outline: none;
  transition: border-color 0.15s ease-in-out;
}

.new-post-textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.new-post-actions {
  margin-top: 0.75rem;
  display: flex;
  justify-content: flex-end;
}

/* States */
.loading-state, .empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

/* Posts */

.post-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.post-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.post-main {
  flex: 1;
}

.post-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.post-author {
  font-weight: 600;
  color: #1f2937;
}

.post-time {
  font-size: 0.75rem;
  color: #6b7280;
}

.post-message {
  color: #374151;
  line-height: 1.5;
}

.post-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: 1rem;
}

/* Edit Form */
.edit-form {
  margin-top: 0.5rem;
}

.edit-textarea {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.75rem;
  font-size: 0.875rem;
  resize: vertical;
  outline: none;
}

.edit-textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.edit-actions {
  margin-top: 0.75rem;
  display: flex;
  gap: 0.5rem;
}

/* Comments */
.comments-toggle {
  margin-bottom: 1rem;
}

.comments-toggle-btn {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.comments-toggle-btn:hover {
  color: #1d4ed8;
}

.comments-section {
  border-left: 3px solid #e5e7eb;
  padding-left: 1rem;
  margin-left: 0.5rem;
}

.comment-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 1rem;
  margin-bottom: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.comment-content {
  flex: 1;
}

.comment-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.comment-author {
  font-weight: 500;
  font-size: 0.875rem;
  color: #1f2937;
}

.comment-time {
  font-size: 0.75rem;
  color: #6b7280;
}

.comment-message {
  color: #374151;
  font-size: 0.875rem;
  line-height: 1.4;
}

.comment-actions {
  margin-left: 0.75rem;
}

/* New Comment Form */
.new-comment-form {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 1rem;
}

.new-comment-textarea {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem;
  font-size: 0.875rem;
  resize: vertical;
  outline: none;
}

.new-comment-textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.new-comment-actions {
  margin-top: 0.5rem;
  display: flex;
  justify-content: flex-end;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
  border-color: #2563eb;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
  border-color: #6b7280;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #4b5563;
  border-color: #4b5563;
}

.btn-ghost {
  background-color: transparent;
  color: #6b7280;
  border-color: #e5e7eb;
}

.btn-ghost:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-delete {
  color: #dc2626;
}

.btn-delete:hover {
  background-color: #fef2f2;
  color: #b91c1c;
  border-color: #fecaca;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.btn-xs {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

/* Responsive */
@media (max-width: 640px) {
  .discussion-forum {
    padding: 0.5rem;
  }
  
  .post-card {
    padding: 1rem;
  }
  
  .post-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .post-actions {
    margin-left: 0;
    align-self: flex-start;
  }
  
  .comment-card {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .comment-actions {
    margin-left: 0;
    align-self: flex-start;
  }
}
</style>

<!-- Example Usage:
<discussion_forum
  :exercise-id="101"
  :current-user="{ id: 1, name: 'Dylan' }"
  :initial-open="true"
  @created-post="handlePostCreated"
  @updated-post="handlePostUpdated"
  @deleted-post="handlePostDeleted"
  @created-comment="handleCommentCreated"
  @deleted-comment="handleCommentDeleted"
/>
-->