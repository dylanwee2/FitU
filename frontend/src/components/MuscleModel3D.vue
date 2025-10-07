<template>
  <div class="muscle-model-3d">
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
    ></div>
    
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
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

export default {
  name: 'MuscleModel3D',
  props: {
    highlightedMuscles: {
      type: Array,
      default: () => []
    },
    height: {
      type: Number,
      default: 500
    }
  },
  setup(props) {
    const modelContainer = ref(null)
    const wireframe = ref(false)
    const autoRotate = ref(true)
    const showSkeleton = ref(false)
    
    let scene, camera, renderer, controls
    let humanModel, muscleGroups = {}, skeletonBones = {}
    let animationId

    // Initialize Three.js scene
    const initThreeJS = async () => {
      if (!modelContainer.value) return

      try {
        // Import Three.js dynamically
        const THREE = await import('three')
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')

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

        // Lighting setup for realistic rendering
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4)
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
        directionalLight.position.set(5, 5, 5)
        directionalLight.castShadow = true
        directionalLight.shadow.mapSize.width = 2048
        directionalLight.shadow.mapSize.height = 2048
        scene.add(directionalLight)

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
        fillLight.position.set(-5, 0, -5)
        scene.add(fillLight)

        // Create realistic human model
        createRealisticHumanModel(THREE)

        // Start animation loop
        animate()

        // Handle window resize
        window.addEventListener('resize', onWindowResize)

      } catch (error) {
        console.error('Error initializing Three.js:', error)
        showFallbackMessage()
      }
    }

    // Show fallback message if Three.js fails
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

    // Create realistic human model with proper anatomy
    const createRealisticHumanModel = (THREE) => {
      const group = new THREE.Group()

      // Create skeleton first (if enabled)
      if (showSkeleton.value) {
        createDetailedSkeleton(THREE, group)
      }

      // Create realistic muscle groups
      createRealisticMuscles(THREE, group)

      // Create human body base
      createHumanBodyBase(THREE, group)

      scene.add(group)
      humanModel = group
    }

    // Create detailed skeletal system
    const createDetailedSkeleton = (THREE, parent) => {
      const boneMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.2
      })

      // Spine (vertebral column)
      for (let i = 0; i < 24; i++) {
        const vertebraGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.15, 8)
        const vertebra = new THREE.Mesh(vertebraGeometry, boneMaterial)
        vertebra.position.set(0, -1.2 + (i * 0.1), 0)
        parent.add(vertebra)
      }

      // Ribcage
      const ribcageGeometry = new THREE.SphereGeometry(0.6, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.7)
      const ribcage = new THREE.Mesh(ribcageGeometry, boneMaterial)
      ribcage.position.set(0, 0.2, 0)
      parent.add(ribcage)

      // Skull
      const skullGeometry = new THREE.SphereGeometry(0.25, 16, 16)
      const skull = new THREE.Mesh(skullGeometry, boneMaterial)
      skull.position.set(0, 1.4, 0)
      parent.add(skull)

      // Clavicles
      const clavicleGeometry = new THREE.CylinderGeometry(0.03, 0.05, 0.8, 8)
      const leftClavicle = new THREE.Mesh(clavicleGeometry, boneMaterial)
      leftClavicle.position.set(-0.4, 1.0, 0)
      leftClavicle.rotation.z = Math.PI / 4
      parent.add(leftClavicle)

      const rightClavicle = new THREE.Mesh(clavicleGeometry, boneMaterial)
      rightClavicle.position.set(0.4, 1.0, 0)
      rightClavicle.rotation.z = -Math.PI / 4
      parent.add(rightClavicle)

      // Humerus (upper arm bones)
      const humerusGeometry = new THREE.CylinderGeometry(0.06, 0.08, 1.0, 8)
      const leftHumerus = new THREE.Mesh(humerusGeometry, boneMaterial)
      leftHumerus.position.set(-0.6, 0.3, 0)
      leftHumerus.rotation.z = Math.PI / 6
      parent.add(leftHumerus)

      const rightHumerus = new THREE.Mesh(humerusGeometry, boneMaterial)
      rightHumerus.position.set(0.6, 0.3, 0)
      rightHumerus.rotation.z = -Math.PI / 6
      parent.add(rightHumerus)

      // Femur (thigh bones)
      const femurGeometry = new THREE.CylinderGeometry(0.08, 0.1, 1.2, 8)
      const leftFemur = new THREE.Mesh(femurGeometry, boneMaterial)
      leftFemur.position.set(-0.15, -0.8, 0)
      parent.add(leftFemur)

      const rightFemur = new THREE.Mesh(femurGeometry, boneMaterial)
      rightFemur.position.set(0.15, -0.8, 0)
      parent.add(rightFemur)
    }

    // Create realistic muscle groups with proper anatomical positioning
    const createRealisticMuscles = (THREE, parent) => {
      const muscleConfigs = {
        // Chest muscles (Pectoralis Major)
        'Chest': {
          geometry: new THREE.SphereGeometry(0.35, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6),
          position: [0, 0.4, 0.25],
          color: 0xff4444,
          scale: [1.3, 0.9, 0.7],
          rotation: [0, 0, 0]
        },
        
        // Shoulder muscles (Deltoids)
        'Shoulders': {
          geometry: new THREE.SphereGeometry(0.25, 16, 16),
          position: [0, 0.9, 0.1],
          color: 0x44ff44,
          scale: [1.6, 0.7, 0.9],
          rotation: [0, 0, 0]
        },
        
        // Triceps (back of upper arm)
        'Triceps': {
          geometry: new THREE.CylinderGeometry(0.12, 0.15, 0.7, 8),
          position: [0.65, 0.2, 0],
          color: 0x4444ff,
          scale: [1, 1, 1],
          rotation: [0, 0, Math.PI / 6]
        },
        
        // Back muscles (Latissimus Dorsi, Trapezius)
        'Back': {
          geometry: new THREE.SphereGeometry(0.45, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6),
          position: [0, 0.3, -0.3],
          color: 0x44ff44,
          scale: [1.2, 1.1, 0.6],
          rotation: [0, 0, 0]
        },
        
        // Biceps (front of upper arm)
        'Biceps': {
          geometry: new THREE.CylinderGeometry(0.1, 0.13, 0.6, 8),
          position: [-0.6, 0.2, 0.05],
          color: 0xffff44,
          scale: [1, 1, 1],
          rotation: [0, 0, -Math.PI / 6]
        },
        
        // Rear deltoids
        'Rear Delts': {
          geometry: new THREE.SphereGeometry(0.18, 16, 16),
          position: [-0.7, 0.6, -0.1],
          color: 0xff44ff,
          scale: [1, 1, 1],
          rotation: [0, 0, 0]
        },
        
        // Abdominal muscles (Rectus Abdominis)
        'Abs': {
          geometry: new THREE.BoxGeometry(0.5, 0.6, 0.15),
          position: [0, -0.1, 0.12],
          color: 0xff8844,
          scale: [1, 1, 1],
          rotation: [0, 0, 0]
        },
        
        // Oblique muscles
        'Obliques': {
          geometry: new THREE.BoxGeometry(0.25, 0.5, 0.12),
          position: [0.35, -0.05, 0.08],
          color: 0xff8844,
          scale: [1, 1, 1],
          rotation: [0, 0, 0]
        },
        
        // Lower back muscles (Erector Spinae)
        'Lower Back': {
          geometry: new THREE.BoxGeometry(0.5, 0.4, 0.15),
          position: [0, -0.3, -0.12],
          color: 0x44ffff,
          scale: [1, 1, 1],
          rotation: [0, 0, 0]
        },
        
        // Quadriceps (front thigh muscles)
        'Quads': {
          geometry: new THREE.CylinderGeometry(0.18, 0.22, 1.0, 8),
          position: [0, -0.7, 0.08],
          color: 0x888888,
          scale: [1, 1, 1],
          rotation: [0, 0, 0]
        },
        
        // Gluteal muscles
        'Glutes': {
          geometry: new THREE.SphereGeometry(0.28, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
          position: [0, -0.5, -0.2],
          color: 0x888888,
          scale: [1.1, 0.9, 0.8],
          rotation: [0, 0, 0]
        },
        
        // Hamstrings (back thigh muscles)
        'Hamstrings': {
          geometry: new THREE.CylinderGeometry(0.14, 0.18, 0.9, 8),
          position: [0, -0.9, -0.08],
          color: 0x888888,
          scale: [1, 1, 1],
          rotation: [0, 0, 0]
        },
        
        // Calf muscles (Gastrocnemius)
        'Calves': {
          geometry: new THREE.CylinderGeometry(0.1, 0.12, 0.7, 8),
          position: [0, -1.4, 0.05],
          color: 0x888888,
          scale: [1, 1, 1],
          rotation: [0, 0, 0]
        }
      }

      Object.entries(muscleConfigs).forEach(([muscleName, config]) => {
        const material = new THREE.MeshLambertMaterial({ 
          color: config.color,
          transparent: true,
          opacity: 0.6
        })
        
        const mesh = new THREE.Mesh(config.geometry, material)
        mesh.position.set(...config.position)
        mesh.scale.set(...config.scale)
        mesh.rotation.set(...config.rotation)
        mesh.userData = { muscleName, isMuscle: true }
        
        // Add hover effect
        mesh.onHover = () => {
          material.emissive.setHex(0x222222)
        }
        
        mesh.onLeave = () => {
          material.emissive.setHex(0x000000)
        }
        
        parent.add(mesh)
        muscleGroups[muscleName] = mesh
      })
    }

    // Create human body base (skin)
    const createHumanBodyBase = (THREE, parent) => {
      const skinMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xffdbac,
        transparent: true,
        opacity: 0.2
      })

      // Head
      const headGeometry = new THREE.SphereGeometry(0.3, 32, 32)
      const head = new THREE.Mesh(headGeometry, skinMaterial)
      head.position.set(0, 1.5, 0)
      parent.add(head)

      // Neck
      const neckGeometry = new THREE.CylinderGeometry(0.12, 0.15, 0.3, 8)
      const neck = new THREE.Mesh(neckGeometry, skinMaterial)
      neck.position.set(0, 1.2, 0)
      parent.add(neck)

      // Torso
      const torsoGeometry = new THREE.CylinderGeometry(0.4, 0.5, 1.6, 8)
      const torso = new THREE.Mesh(torsoGeometry, skinMaterial)
      torso.position.set(0, 0.4, 0)
      parent.add(torso)

      // Arms
      const armGeometry = new THREE.CylinderGeometry(0.1, 0.12, 1.1, 8)
      const leftArm = new THREE.Mesh(armGeometry, skinMaterial)
      leftArm.position.set(-0.6, 0.2, 0)
      leftArm.rotation.z = Math.PI / 6
      parent.add(leftArm)
      
      const rightArm = new THREE.Mesh(armGeometry, skinMaterial)
      rightArm.position.set(0.6, 0.2, 0)
      rightArm.rotation.z = -Math.PI / 6
      parent.add(rightArm)

      // Legs
      const legGeometry = new THREE.CylinderGeometry(0.13, 0.16, 1.4, 8)
      const leftLeg = new THREE.Mesh(legGeometry, skinMaterial)
      leftLeg.position.set(-0.15, -0.7, 0)
      parent.add(leftLeg)
      
      const rightLeg = new THREE.Mesh(legGeometry, skinMaterial)
      rightLeg.position.set(0.15, -0.7, 0)
      parent.add(rightLeg)
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
      
      Object.values(muscleGroups).forEach(mesh => {
        if (mesh.material) {
          mesh.material.wireframe = wireframe.value
        }
      })
    }

    // Toggle skeleton visibility
    const toggleSkeleton = async () => {
      showSkeleton.value = !showSkeleton.value
      
      // Recreate the model with/without skeleton
      if (humanModel) {
        scene.remove(humanModel)
      }
      const THREE = await import('three')
      createRealisticHumanModel(THREE)
    }

    // Highlight specific muscles with proper anatomical colors
    const highlightMuscles = (muscleNames) => {
      Object.entries(muscleGroups).forEach(([muscleName, mesh]) => {
        if (mesh.material) {
          if (muscleNames.includes(muscleName)) {
            mesh.material.opacity = 1.0
            mesh.material.emissive.setHex(0x444444)
            mesh.scale.multiplyScalar(1.05)
          } else {
            mesh.material.opacity = 0.3
            mesh.material.emissive.setHex(0x000000)
            mesh.scale.setScalar(1.0)
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

    // Watch for skeleton toggle
    watch(showSkeleton, async (newValue) => {
      // Recreate model when skeleton visibility changes
      if (humanModel) {
        scene.remove(humanModel)
      }
      const THREE = await import('three')
      createRealisticHumanModel(THREE)
    })

    // Cleanup
    const cleanup = () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      
      if (renderer && modelContainer.value && modelContainer.value.contains(renderer.domElement)) {
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
      resetView,
      toggleWireframe,
      toggleSkeleton
    }
  }
}
</script>

<style scoped>
.muscle-model-3d {
  background: #1a1a1a;
  border-radius: 12px;
  padding: 20px;
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

.muscle-info {
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