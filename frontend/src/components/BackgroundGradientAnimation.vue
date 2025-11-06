<template>
  <div
    class="bg-gradient-anim"
    ref="root"
    :style="cssVars"
    aria-hidden="true"
  >
    
    <div class="bg-layers" aria-hidden="true"></div>

    
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
    }))
    onMounted(() => {})

    onBeforeUnmount(() => {})

    return { root, cssVars }
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
  background: radial-gradient(600px circle, rgba(var(--pointer,140,100,255),0.28) 0%, rgba(0,0,0,0) 40%),
              radial-gradient(400px circle, rgba(var(--c1),0.28) 0%, transparent 40%),
              radial-gradient(300px circle, rgba(var(--c2),0.22) 0%, transparent 35%),
              radial-gradient(350px circle, rgba(var(--c3),0.14) 0%, transparent 38%),
              linear-gradient(90deg, var(--bg-start), var(--bg-end));
  background-size: 300% 300%, 200% 200%, 200% 200%, 200% 200%, 100% 100%;
  animation: bgMove 18s ease-in-out infinite;
  mix-blend-mode: var(--blend, overlay);
  filter: saturate(1.05) blur(0.6px);
}

@keyframes bgMove {
  0% {
    background-position: 10% 10%, 20% 30%, 80% 60%, 60% 10%, 0% 0%;
  }
  25% {
    background-position: 80% 20%, 10% 80%, 60% 30%, 40% 80%, 0% 0%;
  }
  50% {
    background-position: 60% 80%, 30% 20%, 20% 70%, 80% 40%, 0% 0%;
  }
  75% {
    background-position: 30% 60%, 70% 30%, 80% 20%, 20% 70%, 0% 0%;
  }
  100% {
    background-position: 10% 10%, 20% 30%, 80% 60%, 60% 10%, 0% 0%;
  }
}

.bg-content {
  position: relative;
  z-index: 10;
}
</style>
