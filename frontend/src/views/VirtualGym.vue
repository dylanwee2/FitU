<template>
  <div class="virtual-gym container-fluid py-3">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h2 class="m-0" style="color: var(--primary)">Virtual Gym (Beta)</h2>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-secondary" @click="resetView">Reset Position</button>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-12 col-lg-8">
        <div ref="canvasWrap" class="gym-canvas u-card position-relative" :style="{height: canvasHeight}">
          <div v-if="loading" class="loader">Loading… {{ Math.round(progress*100) }}%</div>
          <div v-if="webglError" class="alert alert-warning m-2">WebGL unavailable. Showing 2D fallback.</div>
        </div>
      </div>
      <div class="col-12 col-lg-4">
        <EquipmentInfoPanel :selection="selection" :visited="visited" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import EquipmentInfoPanel from '@/components/gym/EquipmentInfoPanel.vue'
import { EQUIPMENT } from '@/data/equipment'

export default {
  name: 'VirtualGym',
  components: { EquipmentInfoPanel },
  setup() {
    const canvasWrap = ref(null)
    const canvasHeight = '60vh'
    const loading = ref(true)
    const progress = ref(0)
    const webglError = ref(false)
    const selection = ref(null)
    const visited = ref(new Set())

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
        scene.background = new THREE.Color(0xF8F8F8) // Off-white background
        scene.fog = new THREE.FogExp2(0xF8F8F8, 0.02) // Very light fog for depth

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

        // floor - modern rubberized gym floor
        const floorGeo = new THREE.PlaneGeometry(30, 20)
        let floorMat
        try {
          const floorTex = textureLoader.load('/textures/floor_gym_tile.jpg')
          floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping
          floorTex.repeat.set(12, 8)
          floorMat = new THREE.MeshStandardMaterial({ 
            map: floorTex, 
            color: 0xA9A9A9, // Light graphite
            roughness: 0.9,
            metalness: 0.0
          })
        } catch { 
          floorMat = new THREE.MeshStandardMaterial({ 
            color: 0xA9A9A9, // Light graphite
            roughness: 0.9,
            metalness: 0.0
          }) 
        }
        const floor = new THREE.Mesh(floorGeo, floorMat)
        floor.rotation.x = -Math.PI/2
        floor.receiveShadow = true
        scene.add(floor)

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

        // equipment: load models if provided, otherwise fallback boxes
        const loader = new GLTFLoader()
        let loadedCount = 0
        const totalModels = EQUIPMENT.filter(spec => spec.model).length
        
        EQUIPMENT.forEach(spec => {
          const addLabelAndShadow = (centerY = spec.size[1]/2) => {
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

          if (spec.model) {
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
              addLabelAndShadow(spec.size[1]/2)
              
              loadedCount++
              if (loadedCount === totalModels) {
                console.log('All models loaded, final clickable array:', clickable)
              }
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
              addLabelAndShadow()
              
              loadedCount++
              if (loadedCount === totalModels) {
                console.log('All models loaded, clickable array:', clickable)
              }
            })
          } else {
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
            addLabelAndShadow()
          }
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
      ctx.fillStyle = '#2B2B2B'; // Matte black text
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
      console.log('Raycast hits:', hits.length, 'Hit object:', hit?.userData, 'Clickable count:', clickable.length)
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
      renderer?.dispose?.()
    })

    return { canvasWrap, canvasHeight, loading, progress, webglError, selection, visited, resetView }
  }
}
</script>

<style scoped>
.gym-canvas { height: 60vh; overflow: hidden; }
.loader { position: absolute; inset: 0; display:flex; align-items:center; justify-content:center; background: rgba(248,250,252,.6); font-weight:600; }
</style>


