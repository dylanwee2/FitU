<template>
  <div class="virtual-gym container-fluid py-3">
    <!-- --- UI refactor start --- -->
    <div class="d-flex align-items-center justify-content-center mb-3">
      <h2 class="u-text">Virtual Gym</h2>
    </div>

    <div class="row g-3">
      <!-- Left pane: Canvas -->
      <div class="col-12 col-lg-7 col-xxl-8">
        <div class="card bg-dark border-0 shadow-sm h-100">
          <div ref="canvasWrap" class="gym-canvas position-relative" :style="{height: canvasHeight}">
            <!-- Skeleton loader while initializing -->
            <div v-if="loading" class="skeleton-loader">
              <div class="placeholder-glow">
                <span class="placeholder col-12 h-100"></span>
              </div>
              <div class="position-absolute top-50 start-50 translate-middle text-white">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <div class="mt-2">Loading… {{ Math.round(progress*100) }}%</div>
              </div>
            </div>
            <div v-if="webglError" class="alert alert-warning m-2">WebGL unavailable. Showing 2D fallback.</div>
          </div>
          
          <!-- Canvas status bar -->
          <div class="card-footer bg-dark text-white py-2">
            <div class="d-flex justify-content-between align-items-center small">
              <span v-if="selection">
                <strong>{{ selection.name }}</strong>
                <span class="ms-3 text-muted">{{ selection.info?.purpose || 'Training equipment' }}</span>
              </span>
              <span v-else class="text-muted">No equipment selected</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right pane: Inspector (sticky) -->
      <div class="col-12 col-lg-5 col-xxl-4">
        <div class="sticky-pane">
          <!-- Action toolbar -->
          <div class="card mb-3">
            <div class="card-body py-2">
              <div class="btn-group w-100" role="group">
                <button class="btn btn-outline-primary btn-sm rounded-pill justify-content-center align-items-center" @click="resetView" 
                        aria-label="Reset camera position" title="Reset camera position">
                  Reset
                </button>
                <button class="btn btn-outline-success btn-sm rounded-pill justify-content-center align-items-center" @click="focusOnSelection" 
                        :disabled="!selection" aria-label="Focus on selected equipment" title="Focus on selected equipment">
                   Focus
                </button>
              </div>
            </div>
          </div>

          <!-- Equipment Inspector -->
          <div class="card">
            <div class="card-header">
              <h1 class="mb-0">
                {{ selection ? selection.name : 'Equipment Inspector' }}
              </h1>
            </div>
            <div class="card-body">
              <div v-if="!selection">
                <div class="text-center py-4">
                  <p class="text-muted mb-0">Click on any equipment to inspect it</p>
                </div>
              </div>
              
              <div v-else>
                <!-- Purpose and Muscle Groups -->
                <div class="mb-3">
                  <h6 class="muscle-title mb-2">{{ selection.info?.purpose || 'Training equipment' }}</h6>
                  <div class="muscle-badges d-flex flex-wrap gap-1">
                    <span class="badge muscle-badge" v-for="muscle in selection.info?.muscles || []" :key="muscle">
                      {{ muscle }}
                    </span>
                  </div>
                </div>

                <!-- Instructions -->
                <div class="mb-3" v-if="selection.info?.steps?.length">
                  <h6 class="mb-2">
                    Instructions
                  </h6>
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item py-1 px-2" v-for="(step, i) in selection.info.steps" :key="i">
                      {{ i + 1 }}. {{ step }}
                    </li>
                  </ul>
                </div>

                <!-- Safety Tips -->
                <div class="mb-3" v-if="selection.info?.safety?.length">
                  <h6 class="mb-2 text-warning">
                    Safety Tips
                  </h6>
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item list-group-item-warning py-1 px-2" v-for="(tip, i) in selection.info.safety" :key="i">
                      {{ tip }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast container -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div v-for="toast in toasts" :key="toast.id" 
           class="toast show" 
           :class="`bg-${toast.variant}`"
           role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <strong class="me-auto">{{ toast.title }}</strong>
          <button type="button" class="btn-close" @click="removeToast(toast.id)"></button>
        </div>
        <div class="toast-body text-white">
          {{ toast.message }}
        </div>
      </div>
    </div>
    <!-- --- UI refactor end --- -->
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EQUIPMENT } from '@/data/equipment'

export default {
  name: 'VirtualGym',
  setup() {
    const canvasWrap = ref(null)
    const canvasHeight = '70vh'
    const loading = ref(true)
    const progress = ref(0)
    const webglError = ref(false)
    const selection = ref(null)
    const visited = ref(new Set())
    
    // --- UI refactor start ---
    const toasts = ref([])
    let toastId = 0
    
    const toast = (message, variant = 'primary', title = 'Notification', icon = 'info-circle') => {
      const id = ++toastId
      toasts.value.push({ id, message, variant, title, icon })
      setTimeout(() => removeToast(id), 3000)
    }
    
    const removeToast = (id) => {
      const index = toasts.value.findIndex(t => t.id === id)
      if (index > -1) toasts.value.splice(index, 1)
    }
    
    const focusOnSelection = () => {
      if (!selection.value) return
      const targetPosition = new THREE.Vector3(...selection.value.position)
      targetPosition.y += 2
      targetPosition.z += 3
      camera.position.copy(targetPosition)
      controls.target.set(...selection.value.position)
      controls.update()
      toast('Focused on ' + selection.value.name, 'success', 'Focus', 'crosshairs')
    }
    
    const saveLayout = () => {
      const layout = {
        equipment: EQUIPMENT.map(eq => ({
          id: eq.id,
          position: eq.position,
          rotation: eq.rotation,
          scale: eq.size
        })),
        timestamp: Date.now()
      }
      localStorage.setItem('vg:layout', JSON.stringify(layout))
      toast('Layout saved successfully', 'success', 'Save', 'save')
    }
    
    // Keyboard shortcuts
    const handleKeydown = (e) => {
      if (e.target.tagName === 'INPUT') return // Don't interfere with input fields
      
      switch(e.key) {
        case 'f':
          focusOnSelection()
          break
      }
    }
    // --- UI refactor end ---

    // three core
    let renderer, scene, camera, controls, clock
    let hoverMesh = null
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    const clickable = []
    let textureLoader

    const init = async () => {
      try {
        const el = canvasWrap.value
        const width = el.clientWidth
        const height = el.clientHeight
        // renderer
        renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(width, height)
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
        renderer.shadowMap.enabled = true
        el.appendChild(renderer.domElement)

        // scene
        scene = new THREE.Scene()
        scene.background = new THREE.Color(0x0f0f10) // Dark background for better contrast
        scene.fog = new THREE.FogExp2(0x0f0f10, 0.02)

        textureLoader = new THREE.TextureLoader()

        // camera
        camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 200)
        camera.position.set(0, 1.8, 8)

        // Modern gym lighting setup
        // Main ambient light (bright daylight)
        scene.add(new THREE.HemisphereLight(0xFFFFFF, 0xE8E8E8, 0.8))
        
        // Primary directional light (LED ceiling panels)
        const mainLight = new THREE.DirectionalLight(0xFFFFFF, 1.2)
        mainLight.position.set(0, 8, 0)
        mainLight.castShadow = true
        mainLight.shadow.mapSize.width = 2048
        mainLight.shadow.mapSize.height = 2048
        mainLight.shadow.camera.near = 0.5
        mainLight.shadow.camera.far = 50
        mainLight.shadow.camera.left = -20
        mainLight.shadow.camera.right = 20
        mainLight.shadow.camera.top = 20
        mainLight.shadow.camera.bottom = -20
        scene.add(mainLight)
        
        // Side fill lights (window daylight simulation)
        const fillLight1 = new THREE.DirectionalLight(0xFFEECF, 0.4)
        fillLight1.position.set(-15, 6, 0)
        scene.add(fillLight1)
        
        const fillLight2 = new THREE.DirectionalLight(0xFFEECF, 0.4)
        fillLight2.position.set(15, 6, 0)
        scene.add(fillLight2)
        
        // Accent lighting (royal blue accent)
        const accentLight = new THREE.PointLight(0x3B82F6, 0.3, 20)
        accentLight.position.set(0, 4, 0)
        scene.add(accentLight)

        // floor - professional gym rubber flooring
        const floorGeo = new THREE.PlaneGeometry(30, 20)
        const floorMat = new THREE.MeshStandardMaterial({ 
          color: 0xE8E8E8, // Light gray rubber floor
          roughness: 0.8,
          metalness: 0.0
        })
        const floor = new THREE.Mesh(floorGeo, floorMat)
        floor.rotation.x = -Math.PI/2
        floor.receiveShadow = true
        scene.add(floor)
        
        // Add gym floor pattern/markings
        const floorMarkings = new THREE.Group()
        for (let i = -12; i <= 12; i += 2) {
          const lineGeo = new THREE.PlaneGeometry(0.1, 20)
          const lineMat = new THREE.MeshBasicMaterial({ color: 0xD0D0D0 })
          const line = new THREE.Mesh(lineGeo, lineMat)
          line.rotation.x = -Math.PI/2
          line.position.set(i, 0.01, 0)
          floorMarkings.add(line)
        }
        for (let i = -8; i <= 8; i += 2) {
          const lineGeo = new THREE.PlaneGeometry(30, 0.1)
          const lineMat = new THREE.MeshBasicMaterial({ color: 0xD0D0D0 })
          const line = new THREE.Mesh(lineGeo, lineMat)
          line.rotation.x = -Math.PI/2
          line.position.set(0, 0.01, i)
          floorMarkings.add(line)
        }
        scene.add(floorMarkings)

        // walls & ceiling - modern gym aesthetic
        const makeWall = (w,h,color,texPath,repeatX=4, repeatY=2) => {
          let mat
          try {
            const wt = textureLoader.load(texPath)
            wt.wrapS = wt.wrapT = THREE.RepeatWrapping
            wt.repeat.set(repeatX, repeatY)
            mat = new THREE.MeshStandardMaterial({ 
              map: wt, 
              color: color,
              roughness: 0.7,
              metalness: 0.0
            })
          } catch { 
            mat = new THREE.MeshStandardMaterial({ 
              color: color,
              roughness: 0.7,
              metalness: 0.0
            }) 
          }
          const g = new THREE.PlaneGeometry(w,h)
          return new THREE.Mesh(g, mat)
        }
        
        // Light warm grey walls
        const wallColor = 0xEAEAEA
        const back = makeWall(30,6, wallColor, '/textures/wall_plain.jpg')
        back.position.set(0,3,-10); back.receiveShadow = true; scene.add(back)
        const front = makeWall(30,6, wallColor, '/textures/wall_plain.jpg')
        front.position.set(0,3,10); front.rotation.y = Math.PI; scene.add(front)
        const left = makeWall(20,6, wallColor, '/textures/wall_plain.jpg')
        left.position.set(-15,3,0); left.rotation.y = Math.PI/2; scene.add(left)
        const right = makeWall(20,6, wallColor, '/textures/wall_plain.jpg')
        right.position.set(15,3,0); right.rotation.y = -Math.PI/2; scene.add(right)
        
        // Neutral grey ceiling with LED strip effect
        const ceilingGeo = new THREE.PlaneGeometry(30,20)
        const ceiling = new THREE.Mesh(ceilingGeo, new THREE.MeshStandardMaterial({ 
          color: 0xD9D9D9, 
          roughness: 0.8,
          metalness: 0.1
        }))
        ceiling.position.set(0,6,0); ceiling.rotation.x = Math.PI/2; scene.add(ceiling)
        
        // LED light strips on ceiling (visual accent)
        for (let i = -12; i <= 12; i += 6) {
          const stripGeo = new THREE.PlaneGeometry(0.2, 20)
          const stripMat = new THREE.MeshBasicMaterial({ 
            color: 0x3B82F6, // Royal blue accent
            transparent: true,
            opacity: 0.6
          })
          const strip = new THREE.Mesh(stripGeo, stripMat)
          strip.position.set(i, 5.9, 0)
          strip.rotation.x = Math.PI/2
          scene.add(strip)
        }

        // blob shadow texture (optional)
        let blobTex = null
        try { blobTex = textureLoader.load('/textures/blob_shadow.png') } catch {}

        // equipment: load models in parallel for better performance
        const loader = new GLTFLoader()
        
        const addLabelAndShadow = (spec, centerY = spec.size[1]/2) => {
          const sprite = makeLabelSprite(spec.name)
          sprite.position.set(spec.position[0], spec.position[1] + centerY + 0.3, spec.position[2])
          scene.add(sprite)
          if (blobTex) {
            const sMat = new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false })
            const sGeo = new THREE.PlaneGeometry(spec.size[0]*1.4, spec.size[2]*1.4)
            const blob = new THREE.Mesh(sGeo, sMat)
            blob.rotation.x = -Math.PI/2
            blob.position.set(spec.position[0], 0.01, spec.position[2])
            scene.add(blob)
          }
        }

        // Create loading promises for all equipment
        const totalModels = EQUIPMENT.filter(spec => spec.model).length
        let loadedCount = 0
        
        const loadPromises = EQUIPMENT.map(spec => {
          if (spec.model) {
            return new Promise((resolve, reject) => {
              loader.load(spec.model, (gltf) => {
                console.log(`Loaded ${spec.id}:`, gltf.scene)
                const root = gltf.scene
                
                // Ensure all meshes are visible and clickable
                root.traverse(obj => { 
                  if (obj.isMesh) { 
                    obj.visible = true
                    obj.material.transparent = false
                    obj.castShadow = true; 
                    obj.receiveShadow = true;
                    obj.userData = { id: spec.id, parent: root }
                    
                    // Apply modern gym equipment materials
                    if (obj.material) {
                      if (Array.isArray(obj.material)) {
                        obj.material.forEach(mat => {
                          mat.color.setHex(0x2B2B2B) // Matte black
                          mat.roughness = 0.8
                          mat.metalness = 0.2
                          mat.transparent = false
                        })
                      } else {
                        obj.material.color.setHex(0x2B2B2B) // Matte black
                        obj.material.roughness = 0.8
                        obj.material.metalness = 0.2
                        obj.material.transparent = false
                      }
                    }
                    
                    // Add each mesh to clickable array individually
                    clickable.push(obj)
                    console.log(`Added mesh for ${spec.id}:`, obj)
                  } 
                })
                
                // center and scale roughly to match size box
                const box = new THREE.Box3().setFromObject(root)
                const size = new THREE.Vector3(); box.getSize(size)
                const center = new THREE.Vector3(); box.getCenter(center)
                root.position.sub(center) // center to origin
                const targetMax = Math.max(spec.size[0], spec.size[1], spec.size[2])
                const currentMax = Math.max(size.x, size.y, size.z) || 1
                const scale = targetMax / currentMax
                root.scale.setScalar(scale)
                root.position.add(new THREE.Vector3(...spec.position))
                if (spec.rotation) root.rotation.set(...spec.rotation)
                
                root.userData = { id: spec.id }
                scene.add(root)
                console.log(`Added ${spec.id} to scene, clickable count:`, clickable.length)
                addLabelAndShadow(spec, spec.size[1]/2)
                
                // Update progress
                loadedCount++
                progress.value = loadedCount / totalModels
                console.log(`Progress: ${Math.round(progress.value * 100)}% (${loadedCount}/${totalModels})`)
                
                resolve(spec.id)
              }, undefined, (error) => {
                console.error(`Failed to load ${spec.model}:`, error)
                // fallback box on error - modern gym style
                const color = new THREE.Color('#2B2B2B') // Matte black
                const geo = new THREE.BoxGeometry(spec.size[0], spec.size[1], spec.size[2])
                const mat = new THREE.MeshStandardMaterial({ 
                  color, 
                  metalness: 0.2, 
                  roughness: 0.8 
                })
                const mesh = new THREE.Mesh(geo, mat)
                mesh.position.set(...spec.position)
                if (spec.rotation) mesh.rotation.set(...spec.rotation)
                mesh.castShadow = true
                mesh.userData = { id: spec.id }
                scene.add(mesh); clickable.push(mesh)
                addLabelAndShadow(spec)
                
                // Update progress even on error
                loadedCount++
                progress.value = loadedCount / totalModels
                console.log(`Progress: ${Math.round(progress.value * 100)}% (${loadedCount}/${totalModels}) - Fallback created`)
                
                resolve(spec.id) // Resolve even on error with fallback
              })
            })
          } else {
            // Handle equipment without models immediately
            const color = new THREE.Color('#2B2B2B') // Matte black
            const geo = new THREE.BoxGeometry(spec.size[0], spec.size[1], spec.size[2])
            const mat = new THREE.MeshStandardMaterial({ 
              color, 
              metalness: 0.2, 
              roughness: 0.8 
            })
            const mesh = new THREE.Mesh(geo, mat)
            mesh.position.set(...spec.position)
            if (spec.rotation) mesh.rotation.set(...spec.rotation)
            mesh.castShadow = true
            mesh.userData = { id: spec.id }
            scene.add(mesh); clickable.push(mesh)
            addLabelAndShadow(spec)
            return Promise.resolve(spec.id)
          }
        })

        // Wait for all models to load in parallel
        Promise.all(loadPromises).then(() => {
          console.log('All models loaded successfully!')
          console.log('Final clickable array:', clickable)
          progress.value = 1 // Ensure 100% before hiding
          loading.value = false
        }).catch(error => {
          console.error('Error loading models:', error)
          loading.value = false
        })

        // controls
        controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.maxPolarAngle = Math.PI/2.1
        controls.target.set(0,1.2,0)

        clock = new THREE.Clock()

        // events
        window.addEventListener('resize', onResize)
        renderer.domElement.addEventListener('mousemove', onPointerMove)
        renderer.domElement.addEventListener('click', onClick)
        // --- UI refactor start ---
        document.addEventListener('keydown', handleKeydown)
        // --- UI refactor end ---

        loading.value = false
        animate()
      } catch (e) {
        console.error(e)
        webglError.value = true
        loading.value = false
      }
    }

    const makeLabelSprite = (text) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = 256; canvas.height = 64
      ctx.fillStyle = '#FFFFFF'; // White text for dark background
      ctx.font = 'bold 24px system-ui'
      ctx.fillText(text, 10, 40)
      const tex = new THREE.CanvasTexture(canvas)
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true })
      const sprite = new THREE.Sprite(mat)
      sprite.scale.set(2.5, 0.6, 1)
      return sprite
    }

    const onPointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    }

    const onClick = () => {
      console.log('Click detected, hoverMesh:', hoverMesh)
      if (hoverMesh) {
        const id = hoverMesh.userData.id || hoverMesh.userData.parent?.userData?.id
        console.log('Equipment ID:', id)
        const spec = EQUIPMENT.find(x => x.id === id)
        console.log('Found spec:', spec)
        if (spec) {
          selection.value = spec
          visited.value.add(spec.id)
          localStorage.setItem('vg:visited', JSON.stringify(Array.from(visited.value)))
          console.log('Selection updated:', spec.name)
        }
      }
    }

    const animate = () => {
      const dt = clock.getDelta()
      controls.update()
      // hover/raycast
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(clickable, false)
      const hit = hits[0]?.object || null
      
      // Only log when hover state changes to avoid infinite console spam
      if (hit !== hoverMesh) {
        console.log('Raycast hits:', hits.length, 'Hit object:', hit?.userData?.id || 'none', 'Clickable count:', clickable.length)
      }
      
      if (hoverMesh && hoverMesh !== hit) {
        // Reset emissive on previous hover
        let material = hoverMesh.material
        if (Array.isArray(material)) material = material[0]
        if (material && material.emissive) {
          material.emissive.setHex(0x000000)
        }
        hoverMesh = null
        renderer.domElement.style.cursor = 'default'
      }
      if (hit && hoverMesh !== hit) {
        hoverMesh = hit
        // Try to find emissive material on the hit mesh or its parent
        let material = hit.material
        if (Array.isArray(material)) material = material[0]
        if (material && material.emissive) {
          material.emissive.setHex(0x3B82F6) // Royal blue hover effect
        }
        renderer.domElement.style.cursor = 'pointer'
      }
      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }

    const onResize = () => {
      if (!renderer) return
      const el = canvasWrap.value
      const w = el.clientWidth; const h = el.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }

    const resetView = () => {
      camera.position.set(0, 1.8, 8)
      controls.target.set(0,1.2,0)
      controls.update()
    }

    onMounted(init)
    onBeforeUnmount(() => {
      window.removeEventListener('resize', onResize)
      renderer?.domElement?.removeEventListener('mousemove', onPointerMove)
      renderer?.domElement?.removeEventListener('click', onClick)
      // --- UI refactor start ---
      document.removeEventListener('keydown', handleKeydown)
      // --- UI refactor end ---
      renderer?.dispose?.()
    })

    return { 
      canvasWrap, 
      canvasHeight, 
      loading, 
      progress, 
      webglError, 
      selection, 
      visited, 
      resetView,
      // --- UI refactor start ---
      toasts,
      focusOnSelection,
      saveLayout,
      removeToast
      // --- UI refactor end ---
    }
  }
}
</script>

<style scoped>
/* --- UI refactor start --- */
.gym-canvas { 
  height: 70vh; 
  background: #0f0f10; 
  overflow: hidden; 
  border-radius: 8px;
}

.label-readable { 
  text-shadow: 0 1px 2px rgba(0,0,0,.6); 
  backdrop-filter: blur(2px); 
}

.sticky-pane { 
  position: sticky; 
  top: 80px; 
}

.skeleton-loader {
  position: absolute;
  inset: 0;
  background: #0f0f10;
}

.toast-container {
  z-index: 1050;
}

/* Focus-visible rings for accessibility */
.btn:focus-visible {
  outline: 2px solid var(--bs-primary);
  outline-offset: 2px;
}

/* Dark theme adjustments */
.card.bg-dark {
  background-color: #1a1a1a !important;
}

.card-footer.bg-dark {
  background-color: #0f0f10 !important;
  border-top: 1px solid #333;
}

/* Input group styling for dark theme */
.input-group-text {
  background-color: #2a2a2a;
  border-color: #444;
  color: #fff;
}

.form-control {
  background-color: #2a2a2a;
  border-color: #444;
  color: #fff;
}

.form-control:focus {
  background-color: #2a2a2a;
  border-color: var(--bs-primary);
  color: #fff;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

/* List group dark theme */
.list-group-item {
  background-color: transparent;
  border-color: #444;
  color: #fff;
}

.list-group-item-warning {
  background-color: rgba(255, 193, 7, 0.1);
  border-color: rgba(255, 193, 7, 0.3);
  color: #ffc107;
}

/* Muscle title styling */
.muscle-title {
  color: #e9ecef !important; /* Light gray for better visibility on dark background */
  font-weight: 500;
}

/* Muscle badge styling */
.muscle-badges .badge {
  position: relative;
  background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
  color: #e9e9e9 !important;
  border: 1px solid rgba(201, 162, 39, 0.28) !important;
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.01em;
  padding: 0.25rem 0.6rem;
  width: auto;
  max-width: 100%;
  justify-self: start;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.25);
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  display: inline-block;
}

.muscle-badges .badge:hover {
  transform: none;
  border-color: rgba(201, 162, 39, 0.42) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.28);
}

.muscle-badges .badge::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0) 40%);
  pointer-events: none;
}

@media (max-width: 420px) {
  .muscle-badges {
    grid-template-columns: 1fr;
  }
}
/* --- UI refactor end --- */

.loader { 
  position: absolute; 
  inset: 0; 
  display:flex; 
  align-items:center; 
  justify-content:center; 
  background: rgba(248,250,252,.6); 
  font-weight:600; 
}
</style>