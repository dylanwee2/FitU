<template>
  <div class="external-model-3d">
    <div class="model-controls mb-3">
      <button 
        class="btn btn-sm btn-outline-primary me-2" 
        @click="resetView"
      >
        Reset View
      </button>
      <button 
        class="btn btn-sm btn-outline-secondary me-2" 
        @click="toggleWireframe"
      >
        {{ wireframe ? 'Solid' : 'Wireframe' }}
      </button>
      <button 
        class="btn btn-sm btn-outline-info me-2" 
        @click="toggleSkeleton"
      >
        {{ showSkeleton ? 'Hide' : 'Show' }} Skeleton
      </button>
      <div class="form-check form-check-inline">
        <input 
          class="form-check-input" 
          type="checkbox" 
          id="autoRotate" 
          v-model="autoRotate"
        >
        <label class="form-check-label" for="autoRotate">
          Auto Rotate
        </label>
      </div>
    </div>
    
    <div 
      ref="modelContainer" 
      class="model-container"
      :style="{ height: height + 'px' }"
    >
      <div v-if="loading" class="loading-overlay">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading 3D Model...</span>
        </div>
        <p class="mt-2">Loading 3D Model...</p>
      </div>
      <div v-if="error" class="error-overlay">
        <div class="alert alert-warning">
          <h6>Model Loading Error</h6>
          <p>{{ error }}</p>
          <button class="btn btn-sm btn-primary" @click="loadModel">Retry</button>
        </div>
      </div>
    </div>
    
    <div class="muscle-info mt-3">
      <h6>Highlighted Muscles:</h6>
      <div class="muscle-tags">
        <span 
          v-for="muscle in highlightedMuscles" 
          :key="muscle"
          class="badge bg-primary me-1 mb-1"
        >
          {{ muscle }}
        </span>
      </div>
    </div>

    <!-- Model Selection -->
    <div class="model-selection mt-3">
      <h6>Select Model:</h6>
      <div class="btn-group" role="group">
        <button 
          class="btn btn-sm btn-outline-secondary"
          :class="{ active: currentModel === 'built-in' }"
          @click="switchModel('built-in')"
        >
          Built-in Model
        </button>
        <button 
          class="btn btn-sm btn-outline-secondary"
          :class="{ active: currentModel === 'external' }"
          @click="switchModel('external')"
        >
          External Model
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

export default {
  name: 'ExternalModel3D',
  emits: ['muscle-clicked'],
  props: {
    highlightedMuscles: {
      type: Array,
      default: () => []
    },
    height: {
      type: Number,
      default: 500
    },
    modelPath: {
      type: String,
      default: '/models/scene.gltf' // Path to your 3D model
    }
  },
  setup(props, { emit }) {
    const modelContainer = ref(null)
    const wireframe = ref(false)
    const autoRotate = ref(true)
    const showSkeleton = ref(false)
    const loading = ref(false)
    const error = ref('')
    const currentModel = ref('external')
    
    let scene, camera, renderer, controls
    let humanModel, muscleGroups = {}
    let animationId, raycaster, mouse
    let selectedMuscle = ref('')

    // Initialize Three.js scene
    const initThreeJS = async () => {
      if (!modelContainer.value) return

      try {
        // Import Three.js dynamically
        const THREE = await import('three')
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')

        // Scene setup
        scene = new THREE.Scene()
        scene.background = new THREE.Color(0x1a1a1a)

        // Camera setup
        camera = new THREE.PerspectiveCamera(
          45,
          modelContainer.value.clientWidth / props.height,
          0.1,
          1000
        )
        camera.position.set(0, 0, 6)

        // Renderer setup
        renderer = new THREE.WebGLRenderer({ 
          antialias: true,
          alpha: true
        })
        renderer.setSize(modelContainer.value.clientWidth, props.height)
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        renderer.setClearColor(0x1a1a1a, 1)
        modelContainer.value.appendChild(renderer.domElement)

        // Controls setup
        controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.05
        controls.autoRotate = autoRotate.value
        controls.autoRotateSpeed = 0.5
        controls.enableZoom = true
        controls.enablePan = true
        controls.minDistance = 3
        controls.maxDistance = 15

        // Raycasting setup for mouse interaction
        raycaster = new THREE.Raycaster()
        mouse = new THREE.Vector2()

        // Add click event listener
        renderer.domElement.addEventListener('click', onMouseClick, false)

        // Lighting setup
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4)
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
        directionalLight.position.set(5, 5, 5)
        directionalLight.castShadow = true
        scene.add(directionalLight)

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
        fillLight.position.set(-5, 0, -5)
        scene.add(fillLight)

        // Load the initial model
        await loadModel()

        // Start animation loop
        animate()

        // Handle window resize
        window.addEventListener('resize', onWindowResize)

      } catch (error) {
        console.error('Error initializing Three.js:', error)
        showFallbackMessage()
      }
    }

    // Load 3D model
    const loadModel = async () => {
      if (!scene) return

      loading.value = true
      error.value = ''

      try {
        const THREE = await import('three')
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')

        // Clear existing model
        if (humanModel) {
          scene.remove(humanModel)
        }

        if (currentModel.value === 'external') {
          await loadExternalModel(THREE, GLTFLoader)
        } else {
          createBuiltInModel(THREE)
        }

      } catch (err) {
        console.error('Error loading model:', err)
        error.value = err.message || 'Failed to load 3D model'
      } finally {
        loading.value = false
      }
    }

    // Load external 3D model (anatomy study model)
    const loadExternalModel = async (THREE, GLTFLoader) => {
      return new Promise((resolve, reject) => {
        const loader = new GLTFLoader()
        
        loader.load(
          props.modelPath,
          (gltf) => {
            humanModel = gltf.scene
            
            // Calculate bounding box to center the model
            const box = new THREE.Box3().setFromObject(humanModel)
            const center = box.getCenter(new THREE.Vector3())
            const size = box.getSize(new THREE.Vector3())
            
            // Scale the model to fit nicely in the viewport
            const maxDimension = Math.max(size.x, size.y, size.z)
            const scale = 4 / maxDimension // Adjust this value to control model size
            humanModel.scale.setScalar(scale)
            
            // Center the model
            humanModel.position.sub(center.multiplyScalar(scale))
            humanModel.position.y -= size.y * scale * 0.3 // Lower the model slightly
            
            // Enable shadows and improve materials
            humanModel.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
                
                // Improve material properties for better rendering
                if (child.material) {
                  child.material.transparent = true
                  child.material.opacity = 0.9
                  
                  // Add some emissive properties for better visibility
                  if (child.material.emissive) {
                    child.material.emissive.setHex(0x111111)
                  }
                }
                
                // Store reference for muscle highlighting based on object names
                const objectName = child.name.toLowerCase()
                if (objectName.includes('object') || objectName.includes('mesh')) {
                  // Map object indices to muscle groups for the anatomy study
                  const objectIndex = child.name.match(/\d+/)?.[0]
                  if (objectIndex) {
                    const muscleMapping = {
                      '0': 'Chest',
                      '1': 'Back', 
                      '2': 'Arms',
                      '3': 'Core',
                      '4': 'Legs',
                      '5': 'Head'
                    }
                    const muscleName = muscleMapping[objectIndex] || `Muscle_${objectIndex}`
                    muscleGroups[muscleName] = child
                  }
                }
              }
            })
            
            scene.add(humanModel)
            console.log('Anatomy study model loaded successfully')
            resolve()
          },
          (progress) => {
            console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%')
          },
          (error) => {
            console.error('Error loading external model:', error)
            reject(new Error('Failed to load anatomy study model. Please check the file path and format.'))
          }
        )
      })
    }

    // Create built-in model as fallback
    const createBuiltInModel = (THREE) => {
      const group = new THREE.Group()

      // Create a simple human figure
      const skinMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xffdbac,
        transparent: true,
        opacity: 0.8
      })

      // Head
      const headGeometry = new THREE.SphereGeometry(0.3, 32, 32)
      const head = new THREE.Mesh(headGeometry, skinMaterial)
      head.position.set(0, 1.5, 0)
      group.add(head)

      // Torso
      const torsoGeometry = new THREE.CylinderGeometry(0.4, 0.5, 1.6, 8)
      const torso = new THREE.Mesh(torsoGeometry, skinMaterial)
      torso.position.set(0, 0.4, 0)
      group.add(torso)

      // Arms
      const armGeometry = new THREE.CylinderGeometry(0.1, 0.12, 1.1, 8)
      const leftArm = new THREE.Mesh(armGeometry, skinMaterial)
      leftArm.position.set(-0.6, 0.2, 0)
      leftArm.rotation.z = Math.PI / 6
      group.add(leftArm)
      
      const rightArm = new THREE.Mesh(armGeometry, skinMaterial)
      rightArm.position.set(0.6, 0.2, 0)
      rightArm.rotation.z = -Math.PI / 6
      group.add(rightArm)

      // Legs
      const legGeometry = new THREE.CylinderGeometry(0.13, 0.16, 1.4, 8)
      const leftLeg = new THREE.Mesh(legGeometry, skinMaterial)
      leftLeg.position.set(-0.15, -0.7, 0)
      group.add(leftLeg)
      
      const rightLeg = new THREE.Mesh(legGeometry, skinMaterial)
      rightLeg.position.set(0.15, -0.7, 0)
      group.add(rightLeg)

      scene.add(group)
      humanModel = group
    }

    // Switch between models
    const switchModel = async (modelType) => {
      currentModel.value = modelType
      await loadModel()
    }

    // Show fallback message
    const showFallbackMessage = () => {
      if (modelContainer.value) {
        modelContainer.value.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #1a1a1a; border-radius: 8px; flex-direction: column; color: white;">
            <h5 style="margin-bottom: 10px;">3D Model Loading...</h5>
            <p style="text-align: center; opacity: 0.7;">If this persists, please refresh the page.</p>
            <button onclick="location.reload()" style="margin-top: 15px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Refresh Page</button>
          </div>
        `
      }
    }

    // Animation loop
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      
      if (controls) {
        controls.update()
      }
      
      if (renderer && scene && camera) {
        renderer.render(scene, camera)
      }
    }

    // Handle mouse click for muscle selection
    const onMouseClick = (event) => {
      if (!humanModel || !raycaster || !camera) return

      // Calculate mouse position in normalized device coordinates
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      // Update the picking ray with the camera and mouse position
      raycaster.setFromCamera(mouse, camera)

      // Calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(humanModel.children, true)

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object
        
        // Find which muscle group this object belongs to
        let muscleName = ''
        Object.entries(muscleGroups).forEach(([name, mesh]) => {
          if (mesh === clickedObject || mesh.children.includes(clickedObject)) {
            muscleName = name
          }
        })

        // If not found in muscle groups, try to determine from object name
        if (!muscleName) {
          const objectName = clickedObject.name.toLowerCase()
          if (objectName.includes('object_0')) muscleName = 'Chest'
          else if (objectName.includes('object_1')) muscleName = 'Back'
          else if (objectName.includes('object_2')) muscleName = 'Arms'
          else if (objectName.includes('object_3')) muscleName = 'Core'
          else if (objectName.includes('object_4')) muscleName = 'Legs'
          else if (objectName.includes('object_5')) muscleName = 'Head'
        }

        if (muscleName) {
          selectedMuscle.value = muscleName
          highlightSingleMuscle(muscleName)
          
          // Emit event to parent component
          emit('muscle-clicked', muscleName)
        }
      }
    }

    // Handle window resize
    const onWindowResize = () => {
      if (!camera || !renderer || !modelContainer.value) return
      
      camera.aspect = modelContainer.value.clientWidth / props.height
      camera.updateProjectionMatrix()
      renderer.setSize(modelContainer.value.clientWidth, props.height)
    }

    // Reset camera view
    const resetView = () => {
      if (controls && camera) {
        camera.position.set(0, 0, 6)
        controls.reset()
      }
    }

    // Toggle wireframe mode
    const toggleWireframe = () => {
      wireframe.value = !wireframe.value
      
      if (humanModel) {
        humanModel.traverse((child) => {
          if (child.isMesh) {
            child.material.wireframe = wireframe.value
          }
        })
      }
    }

    // Toggle skeleton visibility
    const toggleSkeleton = () => {
      showSkeleton.value = !showSkeleton.value
      // Implementation depends on your model structure
    }

    // Highlight a single muscle group (for click interaction)
    const highlightSingleMuscle = (muscleName) => {
      if (!humanModel) return

      // Reset all materials to default first
      humanModel.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.emissive.setHex(0x111111)
          child.material.opacity = 0.9
        }
      })

      // Highlight the clicked muscle with a bright color
      humanModel.traverse((child) => {
        if (child.isMesh) {
          const objectName = child.name.toLowerCase()
          const isTargetMuscle = 
            (muscleName.toLowerCase().includes('chest') && objectName.includes('object_0')) ||
            (muscleName.toLowerCase().includes('back') && objectName.includes('object_1')) ||
            (muscleName.toLowerCase().includes('arm') && objectName.includes('object_2')) ||
            (muscleName.toLowerCase().includes('core') && objectName.includes('object_3')) ||
            (muscleName.toLowerCase().includes('leg') && objectName.includes('object_4')) ||
            (muscleName.toLowerCase().includes('shoulder') && objectName.includes('object_2')) ||
            (muscleName.toLowerCase().includes('tricep') && objectName.includes('object_2')) ||
            (muscleName.toLowerCase().includes('bicep') && objectName.includes('object_2')) ||
            (muscleName.toLowerCase().includes('quad') && objectName.includes('object_4')) ||
            (muscleName.toLowerCase().includes('glute') && objectName.includes('object_4')) ||
            (muscleName.toLowerCase().includes('hamstring') && objectName.includes('object_4')) ||
            (muscleName.toLowerCase().includes('calf') && objectName.includes('object_4')) ||
            (muscleName.toLowerCase().includes('abs') && objectName.includes('object_3')) ||
            (muscleName.toLowerCase().includes('oblique') && objectName.includes('object_3'))
          
          if (isTargetMuscle && child.material) {
            child.material.emissive.setHex(0xff4444) // Bright red highlight
            child.material.opacity = 1.0
          }
        }
      })
    }

    // Highlight specific muscles (for workout selection)
    const highlightMuscles = (muscleNames) => {
      if (!humanModel) return

      // First, reset all materials to default
      humanModel.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.emissive.setHex(0x111111)
          child.material.opacity = 0.9
        }
      })

      // Then highlight the specified muscles
      muscleNames.forEach(muscleName => {
        const mesh = muscleGroups[muscleName]
        if (mesh && mesh.material) {
          // Create a more vibrant highlight for the anatomy study
          mesh.material.emissive.setHex(0x666666)
          mesh.material.opacity = 1.0
          
          // Add a subtle glow effect
          if (mesh.material.emissive) {
            mesh.material.emissive.setHex(0x444444)
          }
        }
      })

      // Also try to highlight based on object names for broader matching
      humanModel.traverse((child) => {
        if (child.isMesh) {
          const objectName = child.name.toLowerCase()
          const isHighlighted = muscleNames.some(name => {
            const nameLower = name.toLowerCase()
            return objectName.includes(nameLower) || 
                   (nameLower.includes('chest') && objectName.includes('object_0')) ||
                   (nameLower.includes('back') && objectName.includes('object_1')) ||
                   (nameLower.includes('arm') && objectName.includes('object_2')) ||
                   (nameLower.includes('core') && objectName.includes('object_3')) ||
                   (nameLower.includes('leg') && objectName.includes('object_4'))
          })
          
          if (isHighlighted && child.material) {
            child.material.emissive.setHex(0x666666)
            child.material.opacity = 1.0
          }
        }
      })
    }

    // Watch for changes in highlighted muscles
    watch(() => props.highlightedMuscles, (newMuscles) => {
      if (newMuscles && newMuscles.length > 0) {
        highlightMuscles(newMuscles)
      }
    }, { immediate: true })

    // Watch for auto-rotate changes
    watch(autoRotate, (newValue) => {
      if (controls) {
        controls.autoRotate = newValue
      }
    })

    // Cleanup
    const cleanup = () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      
      if (renderer && modelContainer.value && modelContainer.value.contains(renderer.domElement)) {
        renderer.domElement.removeEventListener('click', onMouseClick, false)
        modelContainer.value.removeChild(renderer.domElement)
        renderer.dispose()
      }
      
      window.removeEventListener('resize', onWindowResize)
    }

    onMounted(async () => {
      await nextTick()
      await initThreeJS()
    })

    onUnmounted(() => {
      cleanup()
    })

    return {
      modelContainer,
      wireframe,
      autoRotate,
      showSkeleton,
      loading,
      error,
      currentModel,
      selectedMuscle,
      resetView,
      toggleWireframe,
      toggleSkeleton,
      loadModel,
      switchModel
    }
  }
}
</script>

<style scoped>
.external-model-3d {
  background: #1a1a1a;
  border-radius: 12px;
  padding: 30px;
  height: 1000px;
}

.model-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.model-controls .btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.model-controls .btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.model-container {
  width: 100%;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  background: #1a1a1a;
  position: relative;
}

.loading-overlay, .error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(26, 26, 26, 0.9);
  color: white;
  z-index: 10;
}

.muscle-info, .model-selection {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
}

.muscle-tags {
  margin-top: 10px;
}

.badge {
  font-size: 0.8rem;
  padding: 0.5em 0.75em;
  background: rgba(0, 123, 255, 0.8) !important;
}

.btn-group .btn.active {
  background: #007bff;
  border-color: #007bff;
  color: white;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .model-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .model-controls .btn {
    margin-bottom: 5px;
  }
}
</style>
