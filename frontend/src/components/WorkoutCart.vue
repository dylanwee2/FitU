<template>
  <div class="workout-cart">
    <!-- Cart Toggle Button -->
    <button 
      @click="toggleCart" 
      class="cart-toggle-btn"
      :class="{ 'has-items': cartItemCount > 0 }"
    >
      <i class="fas fa-shopping-cart"></i>
      <span v-if="cartItemCount > 0" class="cart-badge">{{ cartItemCount }}</span>
    </button>

    <!-- Cart Sidebar -->
    <div v-if="isOpen" class="cart-sidebar" @click.self="closeCart">
      <div class="cart-content">
        <!-- Cart Header -->
        <div class="cart-header">
          <h5 class="cart-title">
            <i class="fas fa-shopping-cart me-2"></i>
            Workout Cart
          </h5>
          <button @click="closeCart" class="btn-close">
            <i class="fas fa-times"></i>
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
                <h6 class="cart-item-name">{{ item.name }}</h6>
                <p class="cart-item-target">{{ item.target }}</p>
                <div class="cart-item-badges">
                  <span class="badge bg-primary">{{ item.bodyPart }}</span>
                  <span class="badge bg-secondary">{{ item.equipment }}</span>
                </div>
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
                <i class="fas fa-trash"></i>
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

          <div class="muscle-groups">
            <span 
              v-for="muscle in cartMuscleGroups" 
              :key="muscle"
              class="muscle-badge"
            >
              {{ muscle }}
            </span>
          </div>
        </div>

        <!-- Cart Actions -->
        <div class="cart-actions">
          <button 
            v-if="cartItemCount > 0"
            @click="clearCart"
            class="btn btn-outline-danger btn-sm"
          >
            <i class="fas fa-trash me-1"></i>
            Clear Cart
          </button>
          
          <button 
            v-if="cartItemCount > 0 && isAuthenticated"
            @click="showSavePlaylistModal = true"
            class="btn btn-primary btn-sm"
          >
            <i class="fas fa-save me-1"></i>
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

    <!-- Save Workout Modal -->
    <div v-if="showSavePlaylistModal" class="modal-overlay" @click.self="showSavePlaylistModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Save Workout</h5>
          <button @click="showSavePlaylistModal = false" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="playlistName" class="form-label">Workout Name</label>
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
            <label for="playlistDescription" class="form-label">Description (Optional)</label>
            <textarea 
              v-model="newPlaylistDescription"
              id="playlistDescription"
              class="form-control"
              rows="3"
              placeholder="Describe your workout routine..."
              maxlength="200"
            ></textarea>
          </div>

          <div class="playlist-preview">
            <h6>Preview:</h6>
            <div class="preview-stats">
              <span>{{ cartItemCount }} exercises</span>
              <span>{{ Math.round(cartTotalDuration) }} min</span>
              <span>{{ cartMuscleGroups.join(', ') }}</span>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            @click="showSavePlaylistModal = false"
            class="btn btn-secondary"
          >
            Cancel
          </button>
          <button 
            @click="savePlaylist"
            class="btn btn-primary"
            :disabled="!newPlaylistName.trim()"
          >
            <i class="fas fa-save me-1"></i>
            Save Workout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useWorkoutCartStore } from '../stores/workoutCart'
import router from '@/router'

const cartStore = useWorkoutCartStore()

// Local state
const isOpen = ref(false)
const showSavePlaylistModal = ref(false)
const newPlaylistName = ref('')
const newPlaylistDescription = ref('')

// Computed properties from store
const cartItems = computed(() => cartStore.cartItems)
const cartItemCount = computed(() => cartStore.cartItemCount)
const cartTotalDuration = computed(() => cartStore.cartTotalDuration)
const cartMuscleGroups = computed(() => cartStore.cartMuscleGroups)
const isAuthenticated = computed(() => cartStore.isAuthenticated)

// Methods
const toggleCart = () => {
  isOpen.value = !isOpen.value
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
  if (confirm('Are you sure you want to clear your workout cart?')) {
    cartStore.clearCart()
  }
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

const promptLogin = () => {
  if (confirm('Please log in to save your workout sets. Would you like to go to the login page?')) {
    window.location.href = '/login'
  }
}

const handleImageError = (event) => {
  event.target.src = '/images/exercise-placeholder.png'
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
  background: #28a745;
  animation: pulse 2s infinite;
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #dc3545;
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
  background: white;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

/* Cart Header */
.cart-header {
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
}

.cart-title {
  margin: 0;
  color: #2c3e50;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0.25rem;
}

.btn-close:hover {
  color: #dc3545;
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
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  position: relative;
}

.cart-item-image {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.cart-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-item-info {
  flex: 1;
  min-width: 0;
}

.cart-item-name {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
  line-height: 1.2;
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
}

.cart-item-badges .badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
}

.cart-item-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 80px;
}

.sets-reps-control {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.control-label {
  font-size: 0.7rem;
  font-weight: 500;
  color: #495057;
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
  border-top: 1px solid #dee2e6;
  background: #f8f9fa;
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
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.muscle-groups {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.muscle-badge {
  background: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

/* Cart Actions */
.cart-actions {
  padding: 1rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  gap: 0.5rem;
}

.cart-actions .btn {
  flex: 1;
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
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  color: #2c3e50;
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
  background: #f8f9fa;
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
  border-top: 1px solid #dee2e6;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* Responsive */
@media (max-width: 768px) {
  .cart-content {
    width: 100%;
  }
  
  .cart-item {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .cart-item-controls {
    flex-direction: row;
    justify-content: space-between;
  }
  
  .sets-reps-control {
    flex: 1;
  }
  
  .summary-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .stat {
    display: flex;
    justify-content: space-between;
  }
}
</style>
