<template>
  <div
    class="bg-gradient-anim"
    ref="root"
    :style="cssVars"
    @pointermove="interactive ? onPointerMove : null"
    @pointerleave="interactive ? onPointerLeave : null"
    aria-hidden="false"
  >
    <!-- decorative animated background layers -->
    <div class="bg-layers" aria-hidden="true"></div>

    <!-- slot for content that sits above the animation -->
    <div class="bg-content">
      <slot />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

export default {
  name: 'BackgroundGradientAnimation',
  props: {
    gradientBackgroundStart: { type: String, default: 'rgb(108, 0, 162)' },
    gradientBackgroundEnd: { type: String, default: 'rgb(0, 17, 82)' },
    firstColor: { type: String, default: '18, 113, 255' },
    secondColor: { type: String, default: '221, 74, 255' },
    thirdColor: { type: String, default: '100, 220, 255' },
    fourthColor: { type: String, default: '200, 50, 50' },
    fifthColor: { type: String, default: '180, 180, 50' },
    pointerColor: { type: String, default: '140, 100, 255' },
    blendingValue: { type: String, default: 'hard-light' },
    interactive: { type: Boolean, default: true }
  },
  setup(props) {
    const root = ref(null)
    const px = ref({ x: '50%', y: '50%' })

    const cssVars = computed(() => ({
      '--bg-start': props.gradientBackgroundStart,
      '--bg-end': props.gradientBackgroundEnd,
      '--c1': props.firstColor,
      '--c2': props.secondColor,
      '--c3': props.thirdColor,
      '--c4': props.fourthColor,
      '--c5': props.fifthColor,
      '--pointer': props.pointerColor,
      '--blend': props.blendingValue,
      '--pointer-x': px.value.x,
      '--pointer-y': px.value.y
    }))

    let pointerMoveHandler = null

    function onPointerMove(e) {
      if (!root.value) return
      const rect = root.value.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      px.value.x = x.toFixed(2) + '%'
      px.value.y = y.toFixed(2) + '%'
    }

    function onPointerLeave() {
      px.value.x = '50%'
      px.value.y = '50%'
    }

    // Support touch -> map touchmove to pointermove
    onMounted(() => {
      if (!root.value) return
      pointerMoveHandler = (e) => {
        if (!props.interactive) return
        // support touch
        const ev = e.touches && e.touches[0] ? e.touches[0] : e
        const rect = root.value.getBoundingClientRect()
        const x = ((ev.clientX - rect.left) / rect.width) * 100
        const y = ((ev.clientY - rect.top) / rect.height) * 100
        px.value.x = x.toFixed(2) + '%'
        px.value.y = y.toFixed(2) + '%'
      }
      root.value.addEventListener('touchmove', pointerMoveHandler, { passive: true })
    })

    onBeforeUnmount(() => {
      if (root.value && pointerMoveHandler) root.value.removeEventListener('touchmove', pointerMoveHandler)
    })

    return { root, cssVars, onPointerMove, onPointerLeave }
  }
}
</script>

<style scoped>
.bg-gradient-anim {
  position: relative;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  overflow: hidden;
}

.bg-layers {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  /* layered radial gradients with animated background-position */
  background: radial-gradient(600px circle at var(--pointer-x,50%) var(--pointer-y,50%), rgba(var(--pointer,140,100,255),0.15) 0%, rgba(0,0,0,0) 40%),
              radial-gradient(400px circle at 20% 30%, rgba(var(--c1),0.22) 0%, transparent 40%),
              radial-gradient(300px circle at 80% 60%, rgba(var(--c2),0.18) 0%, transparent 35%),
              radial-gradient(350px circle at 60% 20%, rgba(var(--c3),0.14) 0%, transparent 38%),
              linear-gradient(90deg, var(--bg-start), var(--bg-end));
  background-size: 300% 300%, 200% 200%, 200% 200%, 200% 200%, 100% 100%;
  animation: bgMove 10s ease infinite;
  mix-blend-mode: var(--blend, overlay);
  filter: saturate(1.05) blur(0.6px);
}

@keyframes bgMove {
  0% { background-position: 0% 50%, 10% 20%, 80% 60%, 60% 10%, 0% 0%; }
  50% { background-position: 100% 50%, 20% 80%, 60% 30%, 40% 80%, 0% 0%; }
 100% { background-position: 0% 50%, 10% 20%, 80% 60%, 60% 10%, 0% 0%; }
}

.bg-content {
  position: relative;
  z-index: 10;
}
</style>
