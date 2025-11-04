<template>
  <div class="workout-cart">
    <!-- Cart Toggle Button -->
    <button 
      @click="toggleCart" 
      class="cart-toggle-btn"
      :class="{ 'has-items': cartItemCount > 0 }"
    >
      <img src="../assets/logo.png" width="100%">
      <span v-if="cartItemCount > 0" class="cart-badge">{{ cartItemCount }}</span>
    </button>

    <!-- Cart Sidebar -->
    <div v-if="isOpen" class="cart-sidebar" @click.self="closeCart">
      <div class="cart-content">
        <!-- Cart Header -->
        <div class="cart-header">
          <h5 class="cart-title">
            Workout Cart
          </h5>
          <button @click="closeCart" class="btn-close-white btn-close">
          </button>
        </div>

        <!-- Cart Items -->
        <div class="cart-items">
          <div v-if="cartItemCount === 0" class="empty-cart">
            <div class="empty-cart-icon">
              <i class="fas fa-shopping-cart"></i>
            </div>
            <p class="empty-cart-text">Your cart is empty</p>
            <p class="empty-cart-subtext">Add exercises to create your workout playlist</p>
          </div>

          <div v-else class="cart-item-list">
            <div 
              v-for="item in cartItems" 
              :key="item.id"
              class="cart-item"
            >
              <!-- Exercise Image -->
              <div class="cart-item-image">
                <img 
                  :src="item.gifUrl || '/images/exercise-placeholder.png'" 
                  :alt="item.name"
                  @error="handleImageError"
                >
              </div>

              <!-- Exercise Info -->
              <div class="cart-item-info">
                <h6 class="cart-item-name">{{ capitalizeFirstLetter(item.name) }}</h6>
              </div>

              <!-- Badges: span under image -->
              <div class="cart-item-badges">
                <span class="badge target-muscle-badge">{{ capitalizeFirstLetter(item.target) }}</span>
                <span class="badge body-part-badge">{{ capitalizeFirstLetter(item.bodyPart) }}</span>
                <span class="badge equipment-badge">{{ capitalizeFirstLetter(item.equipment) }}</span>
              </div>

              <!-- Exercise Controls -->
              <div class="cart-item-controls">
                <div class="sets-reps-control">
                  <label class="control-label">Sets</label>
                  <input 
                    v-model.number="item.sets" 
                    type="number" 
                    min="1" 
                    max="10"
                    class="form-control form-control-sm"
                    @change="updateCartItem(item.id, { sets: item.sets })"
                  >
                </div>
                <div class="sets-reps-control">
                  <label class="control-label">Reps</label>
                  <input 
                    v-model.number="item.reps" 
                    type="number" 
                    min="1" 
                    max="100"
                    class="form-control form-control-sm"
                    @change="updateCartItem(item.id, { reps: item.reps })"
                  >
                </div>
                <div class="sets-reps-control">
                  <label class="control-label">Weight</label>
                  <input 
                    v-model.number="item.weight" 
                    type="number" 
                    min="0" 
                    step="0.5"
                    class="form-control form-control-sm"
                    placeholder="lbs"
                    @change="updateCartItem(item.id, { weight: item.weight })"
                  >
                </div>
              </div>

              <!-- Remove Button -->
              <button 
                @click="removeFromCart(item.id)"
                class="btn-remove"
                title="Remove from cart"
              >
                X
              </button>
            </div>
          </div>
        </div>

        <!-- Cart Summary -->
        <div v-if="cartItemCount > 0" class="cart-summary">
          <div class="summary-stats">
            <div class="stat">
              <span class="stat-label">Exercises:</span>
              <span class="stat-value">{{ cartItemCount }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Est. Duration:</span>
              <span class="stat-value">{{ Math.round(cartTotalDuration) }} min</span>
            </div>
            <div class="stat">
              <span class="stat-label">Muscle Groups:</span>
              <span class="stat-value">{{ cartMuscleGroups.length }}</span>
            </div>
          </div>

          <div class="cart-item-badges">
            <span 
              v-for="muscle in cartMuscleGroups" 
              :key="muscle"
              class="badge target-muscle-badge"
            >
              {{ capitalizeFirstLetter(muscle) }}
            </span>
          </div>

          <!-- Equipment Icons Bar -->
          <div v-if="cartEquipment.length > 0" class="equipment-section-container">
            <!-- Pull-up Tab -->
            <div class="equipment-pull-tab u-btn u-btn--secondary" @click="toggleEquipmentSection">
              <div class="pull-tab-content">
                <i class="fas fa-dumbbell pull-tab-icon"></i>
                <span class="pull-tab-text">Equipment ({{ cartEquipment.length }})</span>
                <i 
                  class="fas pull-tab-arrow" 
                  :class="showEquipmentSection ? 'fa-chevron-up' : 'fa-chevron-down'"
                ></i>
              </div>
            </div>
            
            <!-- Collapsible Equipment Content -->
            <div 
              class="equipment-icons-section" 
              :class="{ 'equipment-expanded': showEquipmentSection }"
            >
              <div class="equipment-icons-scroll">
                <div 
                  v-for="equipment in cartEquipment" 
                  :key="equipment"
                  class="equipment-icon-item"
                  :title="capitalizeFirstLetter(equipment)"
                >
                  <img 
                    :src="getEquipmentIcon(equipment)" 
                    :alt="capitalizeFirstLetter(equipment)"
                    class="equipment-icon"
                    @error="handleEquipmentIconError"
                  />
                  <span class="equipment-label">{{ capitalizeFirstLetter(equipment) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cart Actions -->
        <div class="cart-actions">
          <button 
            v-if="cartItemCount > 0"
            @click="clearCart"
            class="btn btn-outline-danger btn-sm"
          >
            Clear Cart
          </button>
          
          <button 
            v-if="cartItemCount > 0 && isAuthenticated"
            @click="showSavePlaylistModal = true"
            class="u-btn u-btn--primary"
          >
            Save Workout
          </button>
          
          <button 
            v-if="cartItemCount > 0 && !isAuthenticated"
            @click="promptLogin"
            class="btn btn-outline-primary btn-sm"
          >
            <i class="fas fa-sign-in-alt me-1"></i>
            Login to Save
          </button>
        </div>
      </div>
    </div>

    <!-- Clear Cart Confirmation Modal -->
    <div v-if="showClearCartConfirm" class="modal-overlay" @click.self="cancelClearCart">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Clear Workout Cart?</h5>
          <button @click="cancelClearCart" class="btn-close-white btn-close"></button>
        </div>
        
        <div class="modal-body">
          <div class="clear-cart-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <p class="clear-cart-message">
            Are you sure you want to clear your workout cart? This will remove all <strong>{{ cartItemCount }}</strong> exercise{{ cartItemCount !== 1 ? 's' : '' }} from your cart.
          </p>
          <p class="clear-cart-warning u-muted">
            This action cannot be undone.
          </p>
        </div>
        
          <!-- AI Add/Remove Modal overlay (shows when user clicks Add/Remove suggestion) -->

        <div class="modal-footer">
          <button 
            @click="cancelClearCart"
            class="u-btn u-btn--secondary"
          >
            Cancel
          </button>
          <button 
            @click="confirmClearCart"
            class="u-btn u-btn--danger"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>

    <!-- Save Workout Modal -->
    <div v-if="showSavePlaylistModal" class="modal-overlay" @click.self="showSavePlaylistModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Save Workout</h5>
          <button @click="showSavePlaylistModal = false" class="btn-close-white btn-close">
          </button>
        </div>
        
        <div class="modal-body">
          <div>
            <div class="form-group">
              <label for="playlistName" class="u-muted">Workout Name</label>
              <input 
                v-model="newPlaylistName"
                type="text" 
                id="playlistName"
                class="form-control"
                placeholder="e.g., Push Day Workout"
                maxlength="50"
              >
            </div>
            
            <div class="form-group">
              <label for="playlistDescription" class="u-muted">Description (Optional)</label>
              <textarea 
                v-model="newPlaylistDescription"
                id="playlistDescription"
                class="form-control"
                rows="3"
                placeholder="Describe your workout routine..."
                maxlength="200"
              ></textarea>
            </div>

            <div class="row">
              <!-- Left: current workout preview and editable list -->
              <div class="col-sm-12 col-md-12 col-lg-6 col-xl-6">
                <div class="playlist-preview">
                  <div class="form-group">
                    <h6>Current Exercises</h6>
                    <div v-if="cartItems.length === 0" class="text-muted">No exercises in cart.</div>
                    <div v-else class="current-exercises">
                      <div v-for="(ex, idx) in cartItems" :key="ex.id || idx" class="exercise-item d-flex align-items-center justify-content-between" style="padding:0.5rem 0; border-bottom:1px solid var(--border-subtle);">
                        <div>
                          <strong>{{ formatExerciseName(ex.name) }}</strong>
                          <div class="small">{{ capitalizeFirstLetter(ex.target) }}{{ ex.bodyPart ? ' · ' + capitalizeFirstLetter(ex.bodyPart) : '' }}</div>
                        </div>
                        <div style="display:flex; gap:0.5rem;">
                          <button @click="removeFromCart(ex.id)" class="u-btn u-btn--danger btn-sm">Remove</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right: AI advice and actionable suggestions -->
              <div class="col-sm-12 col-md-12 col-lg-6 col-xl-6 modal-right-col">
                <h6>AI Coach Advice</h6>
                <div v-if="aiLoading" class="ai-loading-wrap" aria-hidden="true">
                  <div class="loader" aria-hidden="true"></div>
                </div>
                <div v-if="aiError" class="text-danger">{{ aiError }}</div>

                <div v-if="aiAdvice" class="ai-advice-box p-2 mt-2" style="background: rgba(0,0,0,0.04); border-radius:6px; max-height:48vh; overflow:auto;">
                  <div v-html="aiAdvice" class="ai-advice-content"></div>
                </div>
                
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            @click="showSavePlaylistModal = false"
            class="u-btn u-btn--secondary"
          >
            Cancel
          </button>
          <button
            @click="getAICoachAdvice"
            class="u-btn u-btn--outline me-2"
            :disabled="aiLoading || !newPlaylistName.trim() || cartItemCount === 0"
          >
            {{ aiLoading ? 'Generating...' : 'Get AI Coach Advice' }}
          </button>
          <button 
            @click="savePlaylist"
            class="u-btn u-btn--primary"
            :disabled="!newPlaylistName.trim()"
          >
            Save Workout
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- AI Add/Remove Modal overlay (shows when user clicks Add/Remove suggestion) -->
  <div v-if="showAIModal" class="modal-overlay" @click.self="closeAIModal">
    <div class="modal-content" style="max-width:800px;">
      <div class="modal-header">
        <h5 class="modal-title">{{ aiModalMode === 'add' ? 'Add Exercise' : 'Remove Exercise' }}</h5>
        <button @click="closeAIModal" class="btn-close-white btn-close"></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Search</label>
          <input v-model="aiModalQuery" @keyup.enter.prevent="searchExercises(aiModalQuery)" type="text" class="form-control" placeholder="Search exercises...">
        </div>

        <div v-if="aiModalLoading" class="ai-loading-wrap">
          <div class="loader"></div>
        </div>

        <div v-if="!aiModalLoading">
          <div v-if="aiModalResults.length === 0" class="text">No results. Try another keyword.</div>
          <ul v-else class="list-group">
            <li v-for="res in aiModalResults" :key="res.id" class="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>{{ capitalizeFirstLetter(res.name) }}</strong>
                <div class="small text-muted">{{ capitalizeFirstLetter(res.target) }}{{ res.bodyPart ? ' · ' + capitalizeFirstLetter(res.bodyPart) : '' }}</div>
              </div>
              <div>
                <button v-if="aiModalMode === 'add'" @click="addExerciseFromResult(res)" class="u-btn u-btn--primary">Add</button>
                <button v-else @click="removeMatchingFromCart(res.id || res.name)" class="u-btn">Remove</button>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="closeAIModal" class="u-btn u-btn--secondary">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useWorkoutCartStore } from '../stores/workoutCart'
import router from '@/router'
import axios from 'axios'
import { db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { caloriesService } from '@/services/caloriesService.js'

const cartStore = useWorkoutCartStore()

// Local state
const isOpen = ref(false)
const showSavePlaylistModal = ref(false)
const showClearCartConfirm = ref(false)
const newPlaylistName = ref('')
const newPlaylistDescription = ref('')
const showEquipmentSection = ref(false)
const aiAdvice = ref('')
const aiLoading = ref(false)
const aiError = ref('')

// Computed properties from store
const cartItems = computed(() => cartStore.cartItems)
const cartItemCount = computed(() => cartStore.cartItemCount)
const cartTotalDuration = computed(() => cartStore.cartTotalDuration)
const cartMuscleGroups = computed(() => cartStore.cartMuscleGroups)
const isAuthenticated = computed(() => cartStore.isAuthenticated)

// Get unique equipment from cart items
const cartEquipment = computed(() => {
  const equipmentSet = new Set()
  cartItems.value.forEach(item => {
    if (item.equipment) {
      const equipmentList = Array.isArray(item.equipment) 
        ? item.equipment 
        : item.equipment.split(', ')
      equipmentList.forEach(eq => {
        if (eq.trim()) {
          equipmentSet.add(eq.trim().toLowerCase())
        }
      })
    }
  })
  return Array.from(equipmentSet)
})

// Methods
const toggleCart = () => {
  isOpen.value = !isOpen.value
  logCurrentUserData()
}

const closeCart = () => {
  isOpen.value = false
}

const removeFromCart = (exerciseId) => {
  cartStore.removeFromCart(exerciseId)
}

const updateCartItem = (exerciseId, updates) => {
  cartStore.updateCartItem(exerciseId, updates)
}

const clearCart = () => {
  showClearCartConfirm.value = true
}

const confirmClearCart = () => {
  cartStore.clearCart()
  showClearCartConfirm.value = false
  isOpen.value = false
}

const cancelClearCart = () => {
  showClearCartConfirm.value = false
}

const savePlaylist = async () => {
  if (!newPlaylistName.value.trim()) return

  try {
    await cartStore.savePlaylist(newPlaylistName.value.trim(), newPlaylistDescription.value.trim())
    
    // Reset form and close modal
    newPlaylistName.value = ''
    newPlaylistDescription.value = ''
    showSavePlaylistModal.value = false
    
    cartStore.clearCart()
    isOpen.value = false
    router.push('/workout-sets')
  } catch (error) {
    if (error.message.includes('log in')) {
      promptLogin()
    } else {
      alert('Error saving workout set: ' + error.message)
    }
  }
}

const getAICoachAdvice = async () => {
  // Reset
  aiAdvice.value = ''
  aiError.value = ''

  if (!newPlaylistName.value.trim()) {
    aiError.value = 'Please provide a workout name before requesting AI advice.'
    return
  }

  if (cartItems.value.length === 0) {
    aiError.value = 'Your cart is empty. Add exercises to get advice.'
    return
  }

  aiLoading.value = true

  try {
    // Build a prompt summarizing the workout
    const lines = []
    lines.push(`Workout Name: ${newPlaylistName.value.trim()}`)
    if (newPlaylistDescription.value && newPlaylistDescription.value.trim()) {
      lines.push(`Description: ${newPlaylistDescription.value.trim()}`)
    }
    lines.push(`Estimated Duration: ${Math.round(cartTotalDuration.value)} minutes`)
    lines.push('Exercises:')
    cartItems.value.forEach((ex, idx) => {
      const parts = []
      parts.push(`${idx + 1}. ${ex.name}`)
      if (ex.sets) parts.push(`sets: ${ex.sets}`)
      if (ex.reps) parts.push(`reps: ${ex.reps}`)
      if (ex.weight !== undefined && ex.weight !== null) parts.push(`weight: ${ex.weight} lbs`)
      if (ex.target) parts.push(`target: ${ex.target}`)
      lines.push(parts.join(' | '))
    })

    // Try to include the user's goals/profile data in the prompt so the AI can suggest meals
    try {
      const user = cartStore.currentUser
      if (user && user.uid) {
        const userDocRef = doc(db, 'users', user.uid)
        const userDoc = await getDoc(userDocRef)
        if (userDoc && userDoc.exists()) {
          const u = userDoc.data()
          const profileData = {
            fullName: u.fullName || user.displayName || '',
            email: u.email || user.email || '',
            gender: u.gender || '',
            age: u.age || null,
            height: u.height || null,
            weight: u.weight || null
          }
          const goalsData = {
            goalType: u.goalType || '',
            dailyGoal: u.dailyGoal || 2000,
            dietaryPreference: u.dietaryPreference || '',
            allergies: u.allergies || '',
            workoutFrequency: u.workoutFrequency || 3,
            workoutStreakGoal: u.workoutStreakGoal || 3
          }

          lines.push('\nUser profile and goals:')
          // Add a compact JSON block the model can read
          lines.push(JSON.stringify({ profileData, goalsData }, null, 2))
        }
      }
    } catch (userErr) {
      console.warn('Failed to include user goals in AI prompt:', userErr)
    }

  // Strict output requirements: return a single top-level <ul> only, and use
  // specific HTML structure for suggestions so the frontend can parse it.
  lines.push('\nIMPORTANT: DO NOT suggest any exercises that are already listed in the workout above. Only suggest NEW exercises that complement the existing ones.')
  lines.push('\nRETURN ONLY a single TOP-LEVEL HTML unordered list (<ul>) that follows these exact rules:')
  lines.push('1) Use exclusively these tags: <ul>, <li>, <a>, <button>. No other tags or free text outside the required <ul>.')
  lines.push('2) For each exercise, emit one <li> containing the exercise name in Title Case. Optionally include a nested <ul> immediately after the name with 1-2 <li> remarks about volume ("Too little" / "Adequate" / "Too much").')
  lines.push('3) Include exactly one <li> with the literal text "Suggested exercises to add/remove". Inside that <li> include a nested <ul> where each suggestion is a separate <li> containing ONLY the exercise name and a 1-2 sentence rationale. DO NOT include any actionable <button> elements in this section. DO NOT suggest exercises already in the workout.')
  lines.push('4) Include exactly one <li> with the literal text "Suggested meals". Inside that <li> include a nested <ul> with 1-3 items formatted as:')
  lines.push('   Meal Name - <a href="/recipes?q=URL_ENCODED_MEAL">Search for recipe</a>')
  lines.push('5) Include exactly one FINAL <li> with the literal text "Suggestions". This must be the LAST top-level <li> in your response. Inside that <li> include a nested <ul> where each actionable suggestion is one <li> in the format:')
  lines.push('   Exercise Name (search: GENERAL_KEYWORD) <button class="u-btn u-btn--primary d-block" data-action="add">Add</button>')
  lines.push('   The value in parentheses is a concise, general search keyword (e.g., "lat pulldown", "face pull", "dumbbell row"). Choose broad/common keywords that a public exercise API can find.')
  lines.push('   Only include ADD suggestions in this section - no remove buttons. DO NOT suggest exercises already in the workout.')
  lines.push('6) Do NOT add duplicate sections, headings, or extra blocks. Do NOT include plain-text buttons or repeated labels outside the specified <button> tags.')
  lines.push('7) Return no commentary, no JSON, and no code fences — ONLY the single <ul> described above.')
  lines.push('Minimal valid example response:')
  lines.push('<ul>')
  lines.push('<li>Barbell Reverse Grip Incline Bench Row')
  lines.push('<ul>')
  lines.push('<li>Adequate volume for upper back</li>')
  lines.push('</ul>')
  lines.push('</li>')
  lines.push('<li>Suggested exercises to add/remove')
  lines.push('<ul>')
  lines.push('<li>Lat Pulldown: Adding a vertical pulling exercise helps develop the lats.</li>')
  lines.push('<li>Face Pull: Targets rear deltoids and upper traps for shoulder health.</li>')
  lines.push('</ul>')
  lines.push('</li>')
  lines.push('<li>Suggested meals')
  lines.push('<ul>')
  lines.push('<li>Tofu & Quinoa Bowl - <a href="/recipes?q=Tofu%20%26%20Quinoa%20Bowl">Search for recipe</a></li>')
  lines.push('</ul>')
  lines.push('</li>')
  lines.push('<li>Suggestions')
  lines.push('<ul>')
  lines.push('<li>Lat Pulldown (search: lat pulldown) <button class="u-btn u-btn--primary d-block" data-action="add">Add Exercise</button></li>')
  lines.push('<li>Face Pull (search: face pull) <button class="u-btn u-btn--primary d-block" data-action="add">Add Exercise</button></li>')
  lines.push('</ul>')
  lines.push('</li>')
  lines.push('</ul>')

  const prompt = lines.join('\n')

  const resp = await axios.post('http://localhost:3000/api/gemini/generate', { prompt })
  aiAdvice.value = resp?.data?.result || 'No advice returned.'
  // Parse suggestions and attach handlers
  await processAIAdvice(aiAdvice.value)
  } catch (err) {
    console.error('Error fetching AI advice:', err)
    aiError.value = err?.response?.data?.error || err.message || 'Failed to get AI advice.'
  } finally {
    aiLoading.value = false
  }
}

const promptLogin = () => {
  if (confirm('Please log in to save your workout sets. Would you like to go to the login page?')) {
    window.location.href = '/login'
  }
}

const handleImageError = (event) => {
  event.target.src = '/images/exercise-placeholder.png'
}

const capitalizeFirstLetter = (text) => {
  // Defensive: accept strings, numbers, arrays, and simple objects.
  if (text === null || text === undefined) return ''
  // If an array, join with comma + space
  if (Array.isArray(text)) {
    text = text.join(', ')
  }
  // If object with a name field, use that
  if (typeof text === 'object') {
    if (text.name) text = String(text.name)
    else text = JSON.stringify(text)
  }
  // Ensure we have a string now
  text = String(text)
  if (!text) return ''
  return text
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Equipment icon mapping
const getEquipmentIcon = (equipment) => {
  if (!equipment) return '/images/equipment/default.svg'
  
  // Normalize equipment name: lowercase, trim, and handle variations
  let normalized = equipment.toLowerCase().trim()
  
  // Handle variations and synonyms - check compound names first
  // "ez barbell", "ez bar", "ez-bar", "ez barbell" -> "ez-bar"
  if ((normalized.includes('ez') && (normalized.includes('bar') || normalized.includes('barbell'))) || normalized === 'ez-bar') {
    normalized = 'ez-bar'
  }
  // "trap bar" or "trap-bar" -> "trap-bar"
  else if (normalized.includes('trap') && normalized.includes('bar')) {
    normalized = 'trap-bar'
  }
  // "resistance band" or "resistance-band" -> "resistance-band"
  else if (normalized.includes('resistance') && normalized.includes('band')) {
    normalized = 'resistance-band'
  }
  // "exercise band" -> "exercise-band"
  else if (normalized.includes('exercise') && normalized.includes('band')) {
    normalized = 'exercise-band'
  }
  // "mini band" -> "mini-band"
  else if ((normalized.includes('mini') && normalized.includes('band')) || normalized === 'mini-band') {
    normalized = 'mini-band'
  }
  // "pull-up bar", "pull up bar", or "pullup-bar" -> "pullup-bar"
  else if ((normalized.includes('pull') && normalized.includes('up') && normalized.includes('bar')) || 
           (normalized.includes('pullup') && normalized.includes('bar'))) {
    normalized = 'pullup-bar'
  }
  // "medicine ball" or "medicine-ball" -> "medicine-ball"
  else if (normalized.includes('medicine') && normalized.includes('ball')) {
    normalized = 'medicine-ball'
  }
  // "yoga mat" or "yoga-mat" -> "yoga-mat"
  else if (normalized.includes('yoga') && normalized.includes('mat')) {
    normalized = 'yoga-mat'
  }
  // "stability ball" or "stability-ball" -> "stability-ball"
  else if (normalized.includes('stability') && normalized.includes('ball')) {
    normalized = 'stability-ball'
  }
  // "foam roller" or "foam-roller" -> "foam-roller"
  else if (normalized.includes('foam') && normalized.includes('roller')) {
    normalized = 'foam-roller'
  }
  // "weight plate" or "weight-plate" -> "weight-plate"
  else if (normalized.includes('weight') && normalized.includes('plate')) {
    normalized = 'weight-plate'
  }
  // "weighted vest" -> "weighted-vest"
  else if (normalized.includes('weighted') && normalized.includes('vest')) {
    normalized = 'weighted-vest'
  }
  // "weighted ball" -> "weighted-ball" (different from medicine ball)
  else if (normalized.includes('weighted') && normalized.includes('ball')) {
    normalized = 'weighted-ball'
  }
  // "weighted dumbbell" -> "weighted-dumbbell"
  else if (normalized.includes('weighted') && normalized.includes('dumbbell')) {
    normalized = 'weighted-dumbbell'
  }
  // "weighted bar" or "weighted barbell" -> "weighted-bar"
  else if (normalized.includes('weighted') && (normalized.includes('bar') || normalized.includes('barbell'))) {
    normalized = 'weighted-bar'
  }
  // "suspension trainer" or "suspension-trainer" -> "suspension-trainer"
  else if (normalized.includes('suspension') && normalized.includes('trainer')) {
    normalized = 'suspension-trainer'
  }
  // "body weight", "bodyweight", or "body-weight" -> "bodyweight"
  else if ((normalized.includes('body') && normalized.includes('weight')) || normalized === 'bodyweight') {
    normalized = 'bodyweight'
  }
  // Machine-specific mappings
  // "smith machine" or "smith" -> "smith-machine"
  else if (normalized.includes('smith')) {
    normalized = 'smith-machine'
  }
  // "leg press" or "leg press machine" -> "leg-press-machine"
  else if (normalized.includes('leg') && normalized.includes('press')) {
    normalized = 'leg-press-machine'
  }
  // "treadmill" -> "treadmill"
  else if (normalized.includes('treadmill')) {
    normalized = 'treadmill'
  }
  // "stationary bike" or "bike" -> "stationary-bike"
  else if (normalized.includes('stationary') && normalized.includes('bike')) {
    normalized = 'stationary-bike'
  }
  else if (normalized === 'bike') {
    normalized = 'stationary-bike'
  }
  // "lat pulldown" or "lat pulldown machine" -> "lat-pulldown"
  else if (normalized.includes('lat') && normalized.includes('pulldown')) {
    normalized = 'lat-pulldown'
  }
  // "chest press" or "chest press machine" -> "chest-press"
  else if (normalized.includes('chest') && normalized.includes('press')) {
    normalized = 'chest-press'
  }
  // "seated row" or "seated row machine" -> "seated-row"
  else if (normalized.includes('seated') && normalized.includes('row')) {
    normalized = 'seated-row'
  }
  // "cable cross" or "cable crossover" -> "cable-cross"
  else if (normalized.includes('cable') && (normalized.includes('cross') || normalized.includes('crossover'))) {
    normalized = 'cable-cross'
  }
  // "hack squat" or "hack squat machine" -> "hack-squat"
  else if (normalized.includes('hack') && normalized.includes('squat')) {
    normalized = 'hack-squat'
  }
  // "leg curl" or "leg curl machine" -> "leg-curl"
  else if (normalized.includes('leg') && normalized.includes('curl')) {
    normalized = 'leg-curl'
  }
  // "leg extension" or "leg extension machine" -> "leg-extension"
  else if (normalized.includes('leg') && normalized.includes('extension')) {
    normalized = 'leg-extension'
  }
  // "preacher curl" or "preacher curl machine" -> "preacher-curl"
  else if (normalized.includes('preacher') && normalized.includes('curl')) {
    normalized = 'preacher-curl'
  }
  // "shoulder press" or "shoulder press machine" -> "shoulder-press"
  else if (normalized.includes('shoulder') && normalized.includes('press')) {
    normalized = 'shoulder-press'
  }
  // "leverage machine" or "leverage" -> "leverage-machine"
  else if (normalized.includes('leverage')) {
    normalized = 'leverage-machine'
  }
  // Replace remaining spaces with hyphens for consistency
  else {
    normalized = normalized.replace(/\s+/g, '-').replace(/-+/g, '-')
  }
  
  // Map normalized names to icon files
  const equipmentIcons = {
    'bodyweight': '/images/equipment/bodyweight.svg',
    'body-weight': '/images/equipment/bodyweight.svg',
    'dumbbell': '/images/equipment/dumbbell.svg',
    'barbell': '/images/equipment/barbell.svg',
    'kettlebell': '/images/equipment/kettlebell.svg',
    'resistance-band': '/images/equipment/resistance-band.svg',
    'exercise-band': '/images/equipment/exercise-band.svg',
    'mini-band': '/images/equipment/mini-band.svg',
    'cable': '/images/equipment/cable.svg',
    'machine': '/images/equipment/machine.svg',
    'bench': '/images/equipment/bench.svg',
    'pullup-bar': '/images/equipment/pullup-bar.svg',
    'medicine-ball': '/images/equipment/medicine-ball.svg',
    'trx': '/images/equipment/trx.svg',
    'yoga-mat': '/images/equipment/yoga-mat.svg',
    'stability-ball': '/images/equipment/stability-ball.svg',
    'foam-roller': '/images/equipment/foam-roller.svg',
    'weight-plate': '/images/equipment/weight-plate.svg',
    'weighted-vest': '/images/equipment/weighted-vest.svg',
    'weighted-ball': '/images/equipment/weighted-ball.svg',
    'weighted-dumbbell': '/images/equipment/weighted-dumbbell.svg',
    'weighted-bar': '/images/equipment/weighted-bar.svg',
    'ez-bar': '/images/equipment/ez-bar.svg',
    'trap-bar': '/images/equipment/trap-bar.svg',
    'suspension-trainer': '/images/equipment/suspension-trainer.svg',
    'box': '/images/equipment/box.svg',
    'step': '/images/equipment/step.svg',
    // Machine icons
    'smith-machine': '/images/equipment/smith-machine.svg',
    'leg-press-machine': '/images/equipment/leg-press-machine.svg',
    'treadmill': '/images/equipment/treadmill.svg',
    'stationary-bike': '/images/equipment/stationary-bike.svg',
    'lat-pulldown': '/images/equipment/lat-pulldown.svg',
    'chest-press': '/images/equipment/chest-press.svg',
    'seated-row': '/images/equipment/seated-row.svg',
    'cable-cross': '/images/equipment/cable-cross.svg',
    'hack-squat': '/images/equipment/hack-squat.svg',
    'leg-curl': '/images/equipment/leg-curl.svg',
    'leg-extension': '/images/equipment/leg-extension.svg',
    'preacher-curl': '/images/equipment/preacher-curl.svg',
    'shoulder-press': '/images/equipment/shoulder-press.svg',
    'leverage-machine': '/images/equipment/leverage-machine.svg'
  }
  
  return equipmentIcons[normalized] || '/images/equipment/default.svg'
}

const handleEquipmentIconError = (event) => {
  event.target.src = '/images/equipment/default.svg'
}

const toggleEquipmentSection = () => {
  showEquipmentSection.value = !showEquipmentSection.value
}

// Debug helper: load and log the same user data as profile.vue's loadUserData
const logCurrentUserData = async () => {
  try {
    const user = cartStore.currentUser
    if (!user) {
      console.log('No user is currently logged in.')
      return
    }

    const uid = user.uid
    const userDocRef = doc(db, 'users', uid)
    const userDoc = await getDoc(userDocRef)

    if (userDoc.exists()) {
      const data = userDoc.data()

      const profileData = {
        fullName: data.fullName || user.displayName || '',
        email: data.email || user.email || '',
        gender: data.gender || '',
        age: data.age || null,
        height: data.height || null,
        weight: data.weight || null
      }

      const goalsData = {
        goalType: data.goalType || '',
        dailyGoal: data.dailyGoal || 2000,
        dietaryPreference: data.dietaryPreference || '',
        allergies: data.allergies || '',
        workoutFrequency: data.workoutFrequency || 3,
        workoutStreakGoal: data.workoutStreakGoal || 3
      }

      // Attempt to load calorie-related data (same as profile.vue)
      try {
        const calorieData = await caloriesService.getUserCalories(uid)
        const weeklyCalorieData = caloriesService.getWeekSeries(calorieData.entries || [], 7)
        const todayConsumed = caloriesService.getTodayConsumed(calorieData.entries || [])

        console.log('Current user data:', {
          uid,
          profileData,
          goalsData,
          weeklyCalorieData,
          todayConsumed
        })
      } catch (calErr) {
        console.error('Error loading calorie data:', calErr)
        console.log('Current user data (without calories):', {
          uid,
          profileData,
          goalsData
        })
      }
    } else {
      console.log(`No user document found for uid=${uid}.`)
    }
  } catch (err) {
    console.error('Error in logCurrentUserData:', err)
  }
}

// ------------------ AI suggestion parsing & modal logic ------------------
import { nextTick } from 'vue'
const aiSuggestions = ref([])
const showAIModal = ref(false)
const aiModalQuery = ref('')
const aiModalMode = ref('add')
const aiModalLoading = ref(false)
const aiModalResults = ref([])

const parseAISuggestions = (htmlString) => {
  if (!htmlString) return []
  try {
    const temp = document.createElement('div')
    temp.innerHTML = htmlString
    const items = Array.from(temp.querySelectorAll('li'))
    const suggestions = []
    const seen = new Set()
    items.forEach(li => {
      const btnAdd = li.querySelector('[data-action="add"]') || li.querySelector('.add-btn')
      const btnRemove = li.querySelector('[data-action="remove"]') || li.querySelector('.remove-btn')
      if (btnAdd || btnRemove) {
        // Extract name text without button text and optional (search: ...) token
        const clone = li.cloneNode(true)
        const btns = clone.querySelectorAll('button')
        btns.forEach(b => b.remove())
        let text = (clone.textContent || '').trim()
        // Look for (search: keyword) pattern and extract it
        let searchTerm = ''
        const m = text.match(/\(search:\s*([^\)]+)\)/i)
        if (m) {
          searchTerm = (m[1] || '').trim()
          text = text.replace(/\(search:\s*([^\)]+)\)/i, '').trim()
        }
        // Remove labels like 'Add' or 'Remove' if present at start/end
        let name = text.replace(/^(Add|Remove)\s*/i, '').replace(/[-:\s]+$/,'').trim()
        const mode = btnAdd ? 'add' : 'remove'
        const key = `${mode}::${name.toLowerCase()}::${(searchTerm||'').toLowerCase()}`
        if (name && !seen.has(key)) {
          seen.add(key)
          suggestions.push({ mode, name, searchTerm })
        }
      }
    })
    return suggestions
  } catch (e) {
    console.warn('parseAISuggestions error', e)
    return []
  }
}

const openAIModal = async (mode, name = '') => {
  aiModalMode.value = mode
  aiModalQuery.value = name
  showAIModal.value = true
  if (mode === 'add' && name) {
    await searchExercises(name)
  } else if (mode === 'remove') {
    // Prefill removal candidates from cart
    const matches = cartItems.value.filter(it => (it.name || '').toLowerCase().includes((name || '').toLowerCase()))
    aiModalResults.value = matches.map(m => ({ ...m }))
  }
}

const closeAIModal = () => {
  showAIModal.value = false
  aiModalQuery.value = ''
  aiModalResults.value = []
  aiModalLoading.value = false
}

const searchExercises = async (query) => {
  aiModalLoading.value = true
  aiModalResults.value = []
  try {
    const params = new URLSearchParams({ limit: 12 })
    if (query && query.trim()) params.append('search', query.trim())
    const resp = await fetch(`https://www.exercisedb.dev/api/v1/exercises?${params.toString()}`)
    if (!resp.ok) throw new Error(`Exercise API error ${resp.status}`)
    const data = await resp.json()
    const exercises = Array.isArray(data) ? data : (data.data || [])
    aiModalResults.value = exercises.map(ex => ({
      id: ex.id || ex.exerciseId || ex.name,
      name: ex.name || ex.title || '',
      target: ex.targetMuscles || ex.target || ex.muscles || '',
      bodyPart: ex.bodyPart || ex.bodyParts || '',
      equipment: ex.equipments || ex.equipment || '',
      gifUrl: ex.gifUrl || ex.gif || '',
      instructions: ex.instructions || []
    }))
  } catch (err) {
    console.error('Error searching exercises:', err)
    aiModalResults.value = []
  } finally {
    aiModalLoading.value = false
  }
}

const addExerciseFromResult = (exercise) => {
  try {
    const cartEx = {
      id: exercise.id || exercise.name,
      name: exercise.name,
      target: exercise.target,
      bodyPart: exercise.bodyPart,
      equipment: exercise.equipment,
      gifUrl: exercise.gifUrl,
      sets: 3,
      reps: 10,
      weight: null
    }
    cartStore.addToCart(cartEx)
    closeAIModal()
  } catch (e) {
    console.error('Failed to add exercise to cart:', e)
  }
}

const removeMatchingFromCart = (idOrName) => {
  if (!idOrName) return
  const byId = cartItems.value.find(it => it.id === idOrName)
  if (byId) {
    cartStore.removeFromCart(byId.id)
    closeAIModal()
    return
  }
  const matches = cartItems.value.filter(it => (it.name || '').toLowerCase().includes(String(idOrName).toLowerCase()))
  if (matches.length === 0) {
    alert('No matching exercises in your cart to remove.')
    return
  }
  if (matches.length === 1) {
    cartStore.removeFromCart(matches[0].id)
    closeAIModal()
    return
  }
  aiModalResults.value = matches.map(m => ({ ...m }))
}

// Helper to parse suggestions and attach handlers after AI advice is set
const processAIAdvice = async (html) => {
  try {
    aiSuggestions.value = parseAISuggestions(html || '')
    
    // Clean up the HTML to remove (search: ...) text before displaying
    // Create a temporary DOM to manipulate the HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html || ''
    
    // Find all li elements and remove (search: ...) pattern from text nodes
    const allLis = tempDiv.querySelectorAll('li')
    allLis.forEach(li => {
      // Get all text nodes within this li
      const walker = document.createTreeWalker(li, NodeFilter.SHOW_TEXT, null, false)
      const textNodes = []
      let node
      while (node = walker.nextNode()) {
        textNodes.push(node)
      }
      
      // Replace (search: ...) pattern in each text node
      textNodes.forEach(textNode => {
        textNode.textContent = textNode.textContent.replace(/\s*\(search:\s*[^\)]+\)\s*/gi, ' ')
      })
    })
    
    // Update the displayed HTML with cleaned version
    aiAdvice.value = tempDiv.innerHTML
    
    await nextTick()
    // Attach event listeners for any buttons the AI included (fallback)
    const container = document.querySelector('.ai-advice-box')
    if (container) {
      // Support both data-action attribute and old class-based selectors
      const addBtns = container.querySelectorAll('[data-action="add"], .add-btn')
      addBtns.forEach(b => {
        if (b._aiHandlerAttached) return
        b.addEventListener('click', (ev) => { ev.preventDefault();
          const data = extractSuggestionDataFromButton(b)
          openAIModal('add', data.searchTerm || data.name)
        })
        b._aiHandlerAttached = true
      })
      const removeBtns = container.querySelectorAll('[data-action="remove"], .remove-btn')
      removeBtns.forEach(b => {
        if (b._aiHandlerAttached) return
        b.addEventListener('click', (ev) => { ev.preventDefault();
          const data = extractSuggestionDataFromButton(b)
          openAIModal('remove', data.searchTerm || data.name)
        })
        b._aiHandlerAttached = true
      })
    }
  } catch (e) {
    console.warn('processAIAdvice failed', e)
  }
}

// Small helper used by processAIAdvice
const extractNameFromButton = (buttonEl) => {
  try {
    const li = buttonEl.closest('li')
    if (!li) return ''
    const clone = li.cloneNode(true)
    const btns = clone.querySelectorAll('button')
    btns.forEach(b => b.remove())
    let txt = (clone.textContent || '').trim()
    txt = txt.replace(/^(Add|Remove)\s*/i, '').replace(/[-:\s]+$/,'').trim()
    return txt
  } catch (e) {
    return ''
  }
}

// Returns an object { name, searchTerm } by inspecting the closest li to the button
const extractSuggestionDataFromButton = (buttonEl) => {
  try {
    const li = buttonEl.closest('li')
    if (!li) return { name: '', searchTerm: '' }
    const clone = li.cloneNode(true)
    const btns = clone.querySelectorAll('button')
    btns.forEach(b => b.remove())
    let txt = (clone.textContent || '').trim()
    // Look for (search: keyword) pattern and extract it
    let searchTerm = ''
    const m = txt.match(/\(search:\s*([^\)]+)\)/i)
    if (m) {
      searchTerm = (m[1] || '').trim()
      txt = txt.replace(/\(search:\s*([^\)]+)\)/i, '').trim()
    }
    let name = txt.replace(/^(Add|Remove)\s*/i, '').replace(/[-:\s]+$/,'').trim()
    return { name, searchTerm }
  } catch (e) {
    return { name: '', searchTerm: '' }
  }
}

const formatExerciseName = (s) => {
  return capitalizeFirstLetter(s)
}

</script>

<style scoped>
.workout-cart {
  position: relative;
}

/* Cart Toggle Button */
.cart-toggle-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.cart-toggle-btn:hover {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
}

.cart-toggle-btn.has-items {
  background: var(--primary);
  animation: pulse 2s infinite;
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: var(--tertiary);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 0.75rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* Cart Sidebar */
.cart-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  display: flex;
  justify-content: flex-end;
}

.cart-content {
  width: 400px;
  max-width: 90vw;
  height: 100%;
  background: var(--bg);
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

/* Cart Header */
.cart-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg);
}

.cart-title {
  margin: 0;
  font-weight: 600;
}

/* Cart Items */
.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.empty-cart {
  text-align: center;
  padding: 3rem 1rem;
  color: #6c757d;
}

.empty-cart-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-cart-text {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.empty-cart-subtext {
  font-size: 0.9rem;
  margin: 0;
}

.cart-item-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: grid;
  grid-template-columns: 60px 1fr auto;
  grid-template-rows: auto auto;
  column-gap: 1rem;
  row-gap: 0.5rem;
  padding: 1rem;
  background: var(--surface-subtle);
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
  position: relative;
}

.cart-item-image {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  grid-column: 1;
  grid-row: 1 / span 2;
}

.cart-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-item-info {
  min-width: 0;
  grid-column: 2;
  grid-row: 1;
  overflow: hidden;
}

.cart-item-name {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  line-height: 1.2;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.cart-item-target {
  font-size: 0.8rem;
  color: #6c757d;
  margin: 0 0 0.5rem 0;
}

.cart-item-badges {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  grid-column: 1 / 3; /* span under image and name */
  grid-row: 2;
}

.cart-item-badges .badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem 0.25rem 0.9rem;
  width: 120px; /* fixed width for standardised look */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-item-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 80px;
  grid-column: 3;
  grid-row: 1 / span 2;
}

.sets-reps-control {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.control-label {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--muted);
  margin: 0;
}

.sets-reps-control .form-control {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  text-align: center;
}

.btn-remove {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.btn-remove:hover {
  opacity: 1;
}

/* Cart Summary */
.cart-summary {
  padding: 1rem;
  border-top: 1px solid var(--border-subtle);
  background: var(--surface-subtle);
}

.summary-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.stat {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: var(--muted);
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
}

.muscle-groups {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.muscle-badge {
  background: var(--muted);;
  color: rgb(228, 228, 228);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

/* Cart Actions */
.cart-actions {
  padding: 1rem;
  display: flex;
  gap: 0.5rem;
}

.cart-actions .u-btn {
  flex: 1;
  justify-content: center;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1002;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-content {
  background: var(--bg);
  border-radius: 8px;
  width: 100%;
  /* wider modal to comfortably host an expanded layout */
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-weight: 600;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.5rem;
}

.playlist-preview {
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
}

.playlist-preview h6 {
  margin: 0 0 0.5rem 0;
  color: #495057;
}

.preview-stats {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: #6c757d;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* Two-column modal body layout */
.modal-right-col {
  max-height: 60vh;
  overflow-y: auto;
  padding-left: 1rem;
}

@media (min-width: 992px) {
  .modal-right-col {
    border-left: 1px solid var(--border-subtle);
  }
}

.ai-advice-box ul {
  margin: 0;
  padding-left: 1.1rem;
}
.ai-advice-box li {
  margin-bottom: 0.45rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Float buttons to the right in AI suggestions */
.ai-advice-content .float-end {
  float: right;
  margin-left: auto;
}

/* Hide the AI-generated "Suggestions" section since we render it separately with Vue */
.ai-advice-content > ul > li:last-child {
  display: none;
}

/* Hide (search: ...) text in AI suggestions by targeting text nodes containing parentheses */
.ai-advice-content li {
  position: relative;
}

/* Style buttons with data-action attribute and legacy class-based buttons */
.ai-advice-content [data-action],
.ai-advice-content .add-btn,
.ai-advice-content .remove-btn {
  margin-left: 0.5rem;
}

/* Dark theme styling for list-group in modal */
.list-group {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
}

.list-group-item {
  background: var(--surface-subtle);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  color: var(--text);
}

.list-group-item:hover {
  background: var(--muted);
}

.list-group-item .small {
  font-size: 0.85rem;
}

.list-group-item .text-muted {
  color: #a0a0a0 !important;
}

/* Loader placeholder provided by user (monospace gradient text) */
.ai-loading-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90px; /* makes the loader appear in the middle vertically */
  padding: 0.5rem 0;
  background: rgba(255,255,255,0.02);
  border-radius: 6px;
}

/* HTML: <div class="loader"></div> */
.loader {
  width: fit-content;
  font-weight: bold;
  font-family: monospace;
  font-size: 30px;
  background: linear-gradient(135deg,#0000 calc(50% - 0.5em),#000 0 calc(50% + 0.5em),#0000 0) right/300% 100%;
  animation: l22 2s infinite;
}
.loader::before {
  content: "Loading...";
  color: #0000;
  padding: 0 5px;
  background: inherit;
  background-image: linear-gradient(135deg,#000 calc(50% - 0.5em),#fff 0 calc(50% + 0.5em),#000 0);
  -webkit-background-clip:text;
          background-clip:text;
}

@keyframes l22{
  100%{background-position: left}
}

@keyframes l24{
  100%{background-position: left}
}

/* Clear Cart Confirmation Modal Styles */
.clear-cart-icon {
  text-align: center;
  margin-bottom: 1rem;
}

.clear-cart-icon i {
  font-size: 3rem;
  color: #dc3545;
  opacity: 0.9;
}

.clear-cart-message {
  text-align: center;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 0.5rem;
  color: var(--text);
}

.clear-cart-message strong {
  color: var(--primary);
  font-weight: 600;
}

.clear-cart-warning {
  text-align: center;
  font-size: 0.875rem;
  font-style: italic;
  margin-bottom: 0;
}

/* Responsive - Tablet and below (770px and below) */
@media (max-width: 770px) {
  .cart-content {
    width: 100%;
  }

  /* Fix modal scrolling on small screens */
  .modal-content {
    max-height: 95vh;
    display: flex;
    flex-direction: column;
  }

  .modal-body {
    overflow-y: auto;
    flex: 1;
    max-height: calc(95vh - 140px); /* Account for header and footer */
  }

  /* Remove border on small screens */
  .modal-right-col {
    border-left: none;
    padding-left: 0;
    margin-top: 1rem;
  }
  
  /* Switch from grid to flexbox to prevent overlap */
  .cart-item {
    display: flex !important;
    flex-direction: column;
    gap: 0.75rem;
    grid-template-columns: none !important;
    grid-template-rows: none !important;
  }
  
  /* Reset grid positioning when using flexbox */
  .cart-item-image {
    grid-column: auto !important;
    grid-row: auto !important;
    width: 60px;
    height: 60px;
    align-self: flex-start;
    flex-shrink: 0;
  }
  
  .cart-item-info {
    width: 100%;
    min-width: 0;
    grid-column: auto !important;
    grid-row: auto !important;
    overflow: visible;
    flex: 1;
  }
  
  .cart-item-name {
    font-size: 0.85rem;
    line-height: 1.3;
    word-wrap: break-word;
    overflow-wrap: break-word;
    overflow: visible;
    margin-bottom: 0.25rem;
    width: 100%;
  }
  
  .cart-item-target {
    font-size: 0.75rem;
    margin-bottom: 0.5rem;
  }
  
  .cart-item-badges {
    grid-column: auto !important;
    grid-row: auto !important;
    width: 100%;
    flex-wrap: wrap;
  }
  
  .cart-item-controls {
    grid-column: auto !important;
    grid-row: auto !important;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    min-width: 0;
    align-self: stretch;
  }
  
  .sets-reps-control {
    flex: 1;
    min-width: 0;
  }
  
  .summary-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .stat {
    display: flex;
    justify-content: space-between;
  }
  
  .equipment-section-container {
    margin-top: 0.75rem;
  }
  
  .equipment-pull-tab {
    padding: 0.5rem 0.75rem !important;
  }
  
  .pull-tab-text {
    font-size: 0.8rem;
  }
  
  .equipment-icons-section.equipment-expanded {
    max-height: 150px;
    padding: 0.75rem;
  }
}

/* Extra small devices (phones in portrait, less than 576px) */
@media (max-width: 575px) {
  .cart-content {
    width: 100%;
    max-width: 100vw;
  }
  
  .cart-item {
    padding: 0.75rem;
    gap: 0.5rem;
  }
  
  .cart-item-image {
    width: 50px;
    height: 50px;
  }
  
  .cart-item-info {
    width: 100%;
    min-width: 0;
    overflow: visible;
  }
  
  .cart-item-name {
    font-size: 0.8rem;
    line-height: 1.4;
    word-wrap: break-word;
    overflow-wrap: break-word;
    overflow: visible;
    margin-bottom: 0.25rem;
  }
  
  .cart-item-target {
    font-size: 0.7rem;
    margin-bottom: 0.25rem;
  }
  
  .cart-item-badges {
    width: 100%;
  }
  
  .cart-item-badges .badge {
    width: auto;
    min-width: 0;
    flex: 1 1 auto;
    max-width: calc(50% - 0.125rem);
    font-size: 0.65rem;
    padding: 0.2rem 0.4rem 0.2rem 0.75rem;
  }
  
  .cart-item-controls {
    width: 100%;
    gap: 0.375rem;
  }
  
  .sets-reps-control {
    min-width: 0;
    flex: 1;
  }
  
  .sets-reps-control .form-control {
    font-size: 0.75rem;
    padding: 0.2rem 0.3rem;
  }
  
  .control-label {
    font-size: 0.65rem;
  }
  
  .cart-header {
    padding: 1rem;
  }
  
  .cart-title {
    font-size: 1rem;
  }
  
  .cart-items {
    padding: 0.75rem;
  }
  
  .cart-summary {
    padding: 0.75rem;
  }
  
  .summary-stats {
    gap: 0.375rem;
  }
  
  .stat-label {
    font-size: 0.7rem;
  }
  
  .stat-value {
    font-size: 0.95rem;
  }
  
  /* Modal adjustments for extra small */
  .modal-content {
    max-width: 100vw;
    margin: 0;
    border-radius: 0;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .modal-footer .u-btn {
    width: 100%;
    margin: 0;
  }
  
  .cart-toggle-btn {
    bottom: 1rem;
    right: 1rem;
    width: 52px;
    height: 52px;
    font-size: 1rem;
  }
}

/* Nuanced charcoal pill theme with color-coded indicator dots */
.cart-item-badges .badge {
  position: relative;
  background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
  color: #e9e9e9 !important;
  border: 1px solid rgba(201, 162, 39, 0.28) !important;
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.01em;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.25);
  padding-top: 9px;
}

.cart-item-badges .badge::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.cart-item-badges .badge:hover {
  transform: none;
  border-color: rgba(201, 162, 39, 0.42) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.28);
}

/* Subtle top highlight */
.cart-item-badges .badge::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0) 40%);
  pointer-events: none;
}

.target-muscle-badge::before { background: #e74c3c; box-shadow: 0 0 2px rgba(231, 76, 60, 0.28); }
.body-part-badge::before { background: #3498db; box-shadow: 0 0 2px rgba(52, 152, 219, 0.28); }
.equipment-badge::before { background: #27ae60; box-shadow: 0 0 2px rgba(39, 174, 96, 0.28); }

/* Equipment Section Container */
.equipment-section-container {
  margin-top: 1rem;
  border-top: 1px solid var(--border-subtle);
}

/* Pull-up Tab - Override button styles for tab appearance */
.equipment-pull-tab {
  width: 100%;
  border-radius: 8px 8px 0 0 !important;
  border-bottom: none !important;
  margin: 0 !important;
  justify-content: space-between !important;
  padding: 0.75rem 1rem !important;
  background: var(--surface-subtle) !important;
  border: 1px solid var(--border-subtle) !important;
  color: var(--text) !important;
  cursor: pointer;
  user-select: none;
}

.equipment-pull-tab:hover {
  background: var(--muted) !important;
  color: var(--text) !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.pull-tab-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 0.5rem;
}

.pull-tab-icon {
  color: var(--muted);
  font-size: 1rem;
}

.pull-tab-text {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pull-tab-arrow {
  color: var(--muted);
  font-size: 0.875rem;
  transition: transform 0.3s ease;
}

/* Equipment Icons Section */
.equipment-icons-section {
  max-height: 0;
  overflow: hidden;
  background: var(--bg);
  border: 1px solid var(--border-subtle);
  border-top: none;
  border-radius: 0 0 8px 8px;
  transition: max-height 0.3s ease, padding 0.3s ease;
}

.equipment-icons-section.equipment-expanded {
  max-height: 200px;
  padding: 1rem;
}

.equipment-icons-scroll {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--muted) var(--border-subtle);
}

.equipment-icons-scroll::-webkit-scrollbar {
  height: 6px;
}

.equipment-icons-scroll::-webkit-scrollbar-track {
  background: var(--border-subtle);
  border-radius: 3px;
}

.equipment-icons-scroll::-webkit-scrollbar-thumb {
  background: var(--muted);
  border-radius: 3px;
}

.equipment-icons-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--text);
}

.equipment-icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 72px;
  padding: 0.75rem 0.5rem;
  background: linear-gradient(180deg, #1b1b1b 0%, #111 100%);
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.06);
  transition: all 0.3s ease;
  cursor: pointer;
}

.equipment-icon-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.22);
  border-color: rgba(255,255,255,0.12);
}

.equipment-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
  margin-bottom: 0.35rem;
}

.equipment-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #e6e6e6;
  text-align: center;
  line-height: 1.2;
  word-break: break-word;
}
</style>
