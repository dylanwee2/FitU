<template>
  <div class="page-bg-wrap">
    <!-- Top-half local video Carousel -->
    <section class="video-carousel" v-reveal>
      <div class="carousel-inner">
        <div
          v-for="(vid, idx) in videoIds"
          :key="vid"
          class="carousel-item"
          :class="{ active: idx === currentSlide }"
          role="group"
          :aria-label="`Slide ${idx+1} of ${videoIds.length}`"
        >
          <div class="iframe-wrap">
            <video
              :title="`Video slide ${idx+1}`"
              :src="vid"
              :autoplay="idx === currentSlide"
              muted
              loop
              playsinline
              :ref="el => registerVideoRef(el, idx)"
            ></video>
          </div>
        </div>
      </div>
      <!-- Overlay hero copy on top of videos -->
      <div v-if="!isAuthenticated" class="vc-content">
        <div class="vc-content-wrap">
            <div class="container vc-hero-container">
              <h1 class="mb-3 vc-title">UNLEASH YOUR<br>BEST SELF</h1>
              <p class="mb-3">Unlock your fitness potential with personalized workout plans, meal tracking, and expert guidance.</p>
              <div class="d-flex gap-3">
                <router-link to="/signup" class="u-special-btn" style="padding-left: 60px; padding-right:60px;">
                  Join FitU Now!
                </router-link>
              </div>
            </div>
        </div>
      </div>
    </section>
    <!-- Background local video -->
    <div class="bg-video" aria-hidden="true">
      <video src="/videos/fitu.mp4" autoplay muted loop playsinline></video>
    </div>
    <div class="bg-overlay" aria-hidden="true"></div>

    <div class="container mt-4">
      <!-- Logged In User Section -->
      <div v-if="isAuthenticated" class="mb-4" v-reveal>
        <div class="p-4 text-center">
          <h2 class="h3 mb-3">Welcome back to FitU!</h2>
          <p class="mb-3">Ready to continue your fitness journey?</p>
          <div class="d-flex gap-3 justify-content-center">
            <router-link to="/home" class="u-special-btn">
            Start Using FitU Website
            </router-link>
          </div>
          
        </div>
      </div>

      <!-- Not Logged In - Show Sign Up/Login Section -->
      <!-- Hero content moved into video overlay above -->

      <!-- Starfield wrapper starts: applies from here onwards -->
      <div class="starfield-wrap">
        <div class="night" aria-hidden="true">
          <div class="shooting_star"></div>
          <div class="shooting_star"></div>
          <div class="shooting_star"></div>
          <div class="shooting_star"></div>
          <div class="shooting_star"></div>
          <div class="shooting_star"></div>
          <div class="shooting_star"></div>
          <div class="shooting_star"></div>
          <div class="shooting_star"></div>
          <div class="shooting_star"></div>
          <div class="shooting_star"></div>
          <div class="shooting_star"></div>
        </div>

      <!-- Stats Section (full-bleed white bar placed above features) -->
      <section class="stats-bleed" v-reveal>
        <div class="container py-3">
          <div class="row text-center">
            <div class="col-4 mb-3 mb-md-0">
              <div class="h3 m-0">500K+</div>
              <div class="u-muted">Active Students</div>
            </div>
            <div class="col-4 mb-3 mb-md-0">
              <div class="h3 m-0">200+</div>
              <div class="u-muted">Workouts</div>
            </div>
            <div class="col-4">
              <div class="h3 m-0">★ 4.9</div>
              <div class="u-muted">App Rating</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Feature Highlights (simplified: icons above text, no cards) -->
      <section class="p-3 mb-4 mt-4" v-reveal>
        <h2 class="mb-3">Built for Student Life</h2>
        <div class="row g-3">
          <div class="col-12 col-md-6 col-lg-3">
            <div class="feature-simple">
              <div class="feature-icon-wrap">
                <!-- stopwatch icon -->
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M9 2h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 7v6l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="14" r="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h6 class="mb-1">15-Minute Workouts</h6>
              <small class="u-muted">Fit exercise between lectures</small>
            </div>
          </div>
          <div class="col-12 col-md-6 col-lg-3">
            <div class="feature-simple">
              <div class="feature-icon-wrap">
                <!-- dumbbell icon -->
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M2 12h2v2H2zM20 12h2v2h-2z" fill="currentColor"/>
                  <path d="M9 12h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M4 10v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M20 10v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h6 class="mb-1">No Equipment</h6>
              <small class="u-muted">Bodyweight exercises anywhere</small>
            </div>
          </div>
          <div class="col-12 col-md-6 col-lg-3">
            <div class="feature-simple">
              <div class="feature-icon-wrap">
                <!-- users icon -->
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h6 class="mb-1">Student Community</h6>
              <small class="u-muted">Connect with campus fitness groups</small>
            </div>
          </div>
          <div class="col-12 col-md-6 col-lg-3">
            <div class="feature-simple">
              <div class="feature-icon-wrap">
                <!-- lightning/fast results icon -->
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h6 class="mb-1">Quick Results</h6>
              <small class="u-muted">See progress in just weeks</small>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Section (removed duplicate - moved above features) -->

      <!-- Reviews Section -->
      <div class="p-3 mb-4" v-reveal>
        <h2 class="mb-3">Student Reviews</h2>
        <div v-if="reviews.length === 0" class="u-muted">No reviews yet.</div>
        <div class="row">
          <div v-for="(r, i) in reviews" :key="r.id" class="col-12 col-md-6 col-lg-6 mb-3">
            <div class="p-3 h-100 u-card review-card" :style="{ animationDelay: (i * 0.1) + 's' }">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <strong>{{ r.name }}</strong>
                <span class="u-muted">{{ r.course }} • {{ r.year }}</span>
              </div>
              <div class="mb-1" :aria-label="`Rating ${r.rating} out of 5`">
                <span v-for="n in 5" :key="n" :style="{ color: n <= r.rating ? 'gold' : '#d9d9d9' }">★</span>
              </div>
              <p class="m-0">{{ r.comment }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom CTA -->
      <section class="p-4 text-center" v-reveal>
        <h2 class="mb-2" style="color: var(--text)">Ready to Transform Your Campus Fitness?</h2>
        <p class="u-muted mb-3">Join thousands of students getting stronger, healthier, and more energized.</p>
        <div class="d-flex gap-3 justify-content-center">
        <router-link to="/signup" class="u-special-btn" style="padding-left: 60px; padding-right:60px;">Get Started For Free &nbsp;&nbsp;></router-link>

        </div>
      </section>

      </div> <!-- end starfield-wrap -->

    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'vue-router'


export default {
  components: {

  },
  setup() {
    const router = useRouter()
    const auth = getAuth();
    const isAuthenticated = ref(false);
    const videoIds = ref([
      '/videos/fitu.mp4'
    ])
    const currentSlide = ref(0)
    let intervalHandle = null
    const videoEls = ref([])
    const registerVideoRef = (el, idx) => {
      if (!el) return
      videoEls.value[idx] = el
    }
    const nextSlide = () => { currentSlide.value = (currentSlide.value + 1) % videoIds.value.length }
    const prevSlide = () => { currentSlide.value = (currentSlide.value - 1 + videoIds.value.length) % videoIds.value.length }

    onMounted(() => {        
        onAuthStateChanged(auth, async (userCredential) => {
            if (userCredential) {
              isAuthenticated.value = true;
              //router.push(`/home`)
            } else {
              isAuthenticated.value = false;
              //router.push(`/`)
            }
        });
        // Auto-advance disabled; each video loops on its own
        // intervalHandle = setInterval(nextSlide, 8000)
    });
    // Pause/play when slide changes
    onBeforeUnmount(() => { if (intervalHandle) clearInterval(intervalHandle) })

    watch(currentSlide, (idx) => {
      videoEls.value.forEach((v, i) => {
        if (!v) return
        try { i === idx ? v.play() : v.pause() } catch {}
      })
    })

    // Pause videos when tab is hidden, resume active on visible
    const onVisibility = () => {
      const active = videoEls.value[currentSlide.value]
      if (document.hidden) {
        videoEls.value.forEach(v => { try { v && v.pause() } catch {} })
      } else if (active) {
        try { active.play() } catch {}
      }
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibility)
      onBeforeUnmount(() => document.removeEventListener('visibilitychange', onVisibility))
    }

    // Reviews state
    const reviews = ref([
      { id: 'r1', name: 'Aisha K.', course: 'Computer Science', year: 'Year 2', rating: 5, comment: 'FitU keeps me on track during exam season. Love the clean visuals!' },
      { id: 'r2', name: 'Liam D.', course: 'Mechanical Eng.', year: 'Year 3', rating: 5, comment: 'The workout planner and calorie tracker combo is perfect.' },
      { id: 'r3', name: 'Sophia M.', course: 'Medicine', year: 'Year 1', rating: 4, comment: 'Simple, fast, and the dark theme is beautiful.' },
      { id: 'r4', name: 'Noah P.', course: 'Business Analytics', year: 'Year 4', rating: 5, comment: 'Weekly charts + quick add makes tracking effortless.' }
    ])
    const newReview = ref({ name: '', rating: 5, comment: '', course: '', year: '' })
    const loadReviews = () => {
      try {
        const raw = localStorage.getItem('fitu:reviews')
        if (!raw) {
          // Seed defaults into storage on first run
          saveReviews()
          return
        }
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) reviews.value = parsed
      } catch {
        // Keep seeded defaults if parsing fails
      }
    }
    const saveReviews = () => {
      try { localStorage.setItem('fitu:reviews', JSON.stringify(reviews.value)) } catch {}
    }
    const submitReview = () => {
      if (!newReview.value.name || !newReview.value.comment || !newReview.value.course || !newReview.value.year) return
      const entry = { id: crypto.randomUUID?.() || String(Date.now()), ...newReview.value }
      reviews.value.unshift(entry)
      saveReviews()
      newReview.value = { name: '', rating: 5, comment: '', course: '', year: '' }
    }

    onMounted(loadReviews)

    return { 
      isAuthenticated,
      videoIds,
      currentSlide,
      nextSlide,
      prevSlide,
      registerVideoRef,
      reviews,
      newReview,
      submitReview
    };
  }
};
</script>

<style scoped>


input.form-control {
  max-width: 100%;
}

.btn-elevate { box-shadow: 0 6px 18px rgba(230, 57, 70, 0.25); }
.btn-elevate:active { transform: translateY(1px); }

/* Carousel theming */
.carousel-item-tinted::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, rgba(255,247,230,.65) 0%, rgba(255,247,230,.25) 100%);
}
.carousel-gradient { background: var(--surface); }
.carousel .carousel-caption h5 { color: #FFF7E6; text-shadow: 0 2px 8px rgba(0,0,0,.3); }
.carousel .carousel-caption p { color: #FFF7E6; text-shadow: 0 1px 4px rgba(0,0,0,.3); }

/* Feature cards */
.feature-icon { font-size: 1.5rem; color: var(--primary); margin-bottom: .25rem; }

/* Image feature cards */
.feature-card {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  background: var(--surface-subtle);
  border: 1px solid var(--border-subtle);
  height: 220px;
  display: block;
  box-shadow: var(--shadow-card);
  transition: transform .25s ease, box-shadow .25s ease, filter .25s ease;
}
.feature-card img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(.85);
  transition: transform .35s ease, filter .35s ease;
}
.feature-card-overlay {
  position: absolute;
  inset: auto 0 0 0;
  padding: 12px 14px 14px;
  background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.55) 90%);
}
.feature-card:hover { transform: translateY(-6px); box-shadow: 0 22px 40px -18px rgba(0,0,0,.6); }
.feature-card:hover img { transform: scale(1.06); filter: brightness(.95); }

/* Simplified feature layout (icons above text) */
.feature-simple { display: flex; flex-direction: column; align-items: center; gap: .5rem; padding: .75rem 0; text-align: center; }
.feature-simple .feature-icon-wrap { width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; color: var(--primary); margin-bottom: .25rem; transition: transform .22s cubic-bezier(.2,.8,.2,1), box-shadow .22s cubic-bezier(.2,.8,.2,1); will-change: transform; }
.feature-simple h6 { margin: 0; }
.feature-simple small { display: block; }

/* Pop-out effect on icon when hovering the feature */
.feature-simple:hover .feature-icon-wrap,
.feature-simple:focus-within .feature-icon-wrap {
  transform: translateY(-6px) scale(1.08);
  box-shadow: 0 12px 24px rgba(15,23,42,0.12);
}

/* Full-bleed stats bar that overlays the features section */
.stats-bleed {
  background-color: rgb(21, 21, 21);
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  box-shadow: 0 8px 24px rgba(18, 38, 63, 0.06);
  position: relative;
  z-index: 4;
}
.stats-bleed .h3 { color: var(--text); }
.stats-bleed .u-muted { color: var(--muted); }

/* Remove top gap between the hero video area and the main container so the stats bar sits directly under the video */
.page-bg-wrap > .container { margin-top: 0 !important; }

/* Make carousel full width and remove border radius/shadow */
.home-carousel {
  width: 100vw !important;
  margin-left: calc(-50vw + 50%) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

/* Ensure carousel images fill width and height */
.home-carousel .carousel-item img {
  width: 100vw !important;
  object-fit: cover;
  height: 360px;
  border-radius: 0 !important;
}

.carousel-text:hover {
  cursor: default;
}
.carousel-item img{
  filter: brightness(40%);
}

/* Top-half carousel */
.video-carousel {
  position: relative;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  height: 65vh;
  min-height: 420px;
  max-height: 900px;
  overflow: hidden;
}
.video-carousel .carousel-inner { position: relative; height: 100%; }
.video-carousel .carousel-item {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity .5s ease;
}
.video-carousel .carousel-item.active { opacity: 1; }
.video-carousel .iframe-wrap { position: relative; width: 100%; height: 100%; background: #000; }
.video-carousel video {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120vw;
  height: 67.5vw;
  min-width: 177.78vh;
  min-height: 100%;
  pointer-events: none;
}
/* Darken carousel video and add an internal overlay so hero text is readable */
.video-carousel video {
  filter: brightness(0.8) contrast(0.8);
  z-index: 0;
}
.video-carousel::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 1; /* sits above the video but below .vc-content (z-index:2) */
  pointer-events: none;
}
.video-carousel .nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.35);
  color: #fff;
  border: 0;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  cursor: pointer;
}
.video-carousel .nav:hover { background: rgba(0,0,0,0.5); }
.video-carousel .prev { left: 12px; }
.video-carousel .next { right: 12px; }

/* Overlay content on video */
.vc-content { position: absolute; inset: 0; display: flex; align-items: center; z-index: 2; }
.vc-content-wrap { width: min(100%, 1200px); margin-inline: auto; padding: 0 1rem; }
.vc-content-wrap { position: relative; }
.vc-content-wrap::before { display: none; }
.vc-title { font-size: clamp(2rem, 6vw, 5rem); line-height: 1.02; }
.vc-sub { max-width: 680px; }

/* Limit background to page content (exclude navbar & footer) */
.page-bg-wrap { position: relative; }
.page-bg-wrap > .bg-video { position: absolute; top: 0; left: 0; right: 0; height: 65vh; }
.page-bg-wrap > .bg-overlay { position: absolute; top: 0; left: 0; right: 0; height: 65vh; }

/* Background video covering the landing content area */
.bg-video {
  z-index: -2; /* behind content within landing only */
  overflow: hidden;
  background: transparent;
}
.bg-video video {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  /* Cover technique for 16:9 video */
  width: 120vw;
  height: 67.5vw; /* 120 * 9/16 */
  min-width: 177.78vh; /* 100 * 16/9 to cover tall screens */
  min-height: 100%;
  pointer-events: none; /* allow page interaction */
  /* Darken the video for better overlay contrast. Adjust brightness value as needed. */
  filter: brightness(0.28) contrast(0.9);
}
.bg-overlay { z-index: -1; background: rgba(0,0,0,0.72); }

/* Reviews animations */
@keyframes review-fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.review-card {
  opacity: 0;
  animation: review-fade-up .5s ease forwards;
  transition: transform .2s ease, box-shadow .2s ease;
}
.review-card:hover { transform: translateY(-4px); box-shadow: 0 12px 22px -12px rgba(0,0,0,.6); }

/* Elevated, high-impact animations */
@keyframes hero-shimmer {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
.vc-title {
  background: linear-gradient(90deg, #ffffff, #846fff, #ffffff);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: hero-shimmer 6s linear infinite;
  filter: none;
}

@keyframes cta-pulse {
  0%, 100% { transform: translateY(0) scale(1); box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4); }
  50% { transform: translateY(-2px) scale(1.02); box-shadow: 0 14px 28px rgba(102, 126, 234, 0.5); }
}

/* 3D tilt + lift on cards */
.u-card {
  transition: transform .25s ease, box-shadow .25s ease, filter .25s ease;
  transform-style: preserve-3d;
}
.u-card:hover {
  transform: translateY(-6px) scale(1.015) rotateX(1.5deg) rotateY(1.5deg);
  box-shadow: 0 22px 40px -18px rgba(0,0,0,.6);
  filter: brightness(1.02);
}

/* Stronger reveal on enter for elements that use v-reveal */
.reveal { opacity: 0; transform: translateY(14px) scale(.98); will-change: transform, opacity; }
.reveal--visible { opacity: 1; transform: translateY(0) scale(1); transition: opacity .35s cubic-bezier(.2,.65,.25,1), transform .35s cubic-bezier(.2,.65,.25,1); }

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
  .vc-title { filter: none; }
}

/* Limit hover effects to precise pointers */
@media (hover: none), (pointer: coarse) {
  .u-card:hover { transform: none; box-shadow: none; filter: none; }
}

/* Mobile tuning for stars */
@media (max-width: 768px) {
  .shooting_star { animation-duration: 4s, 4s; opacity: .7; }
  .shooting_star:nth-child(n+8) { display: none; }
}

/* Shooting star backdrop (inspired by https://codepen.io/nefejames/pen/PwYMqoE) */
.starfield-wrap { position: relative; isolation: isolate; }
.starfield-wrap > *:not(.night) { position: relative; z-index: 1; }
.night { position: absolute; inset: 0; overflow: hidden; z-index: 0; pointer-events: none; }

@keyframes tail {
  0% { width: 0; }
  30% { width: 120px; }
  100% { width: 0; }
}
@keyframes shooting {
  0% { transform: translateX(0) translateY(0); opacity: 0; }
  10% { opacity: 1; }
  100% { transform: translateX(600px) translateY(300px); opacity: 0; }
}
@keyframes blink {
  50% { opacity: .6; }
}
.shooting_star {
  position: absolute;
  left: 0;
  top: 0;
  height: 2px;
  width: 120px;
  background: linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,0));
  filter: drop-shadow(0 0 6px rgba(255,255,255,.85));
  border-radius: 999px;
  transform: rotate(220deg);
  animation: tail 2.8s ease-in-out infinite, shooting 2.8s ease-in-out infinite;
  opacity: 0;
}
.shooting_star::before, .shooting_star::after {
  content: "";
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6px; height: 6px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 12px 4px rgba(255,255,255,.75);
  animation: blink 1.4s infinite;
}
.shooting_star::after { width: 3px; height: 3px; animation-duration: 1s; }

/* Vary positions and delays */
.shooting_star:nth-child(1) { top: 8%; left: 4%; animation-delay: .2s; }
.shooting_star:nth-child(2) { top: 18%; left: 18%; animation-delay: 1.1s; }
.shooting_star:nth-child(3) { top: 28%; left: 2%; animation-delay: 2.2s; }
.shooting_star:nth-child(4) { top: 36%; left: 22%; animation-delay: 1.6s; }
.shooting_star:nth-child(5) { top: 44%; left: 6%; animation-delay: .9s; }
.shooting_star:nth-child(6) { top: 52%; left: 16%; animation-delay: 2.8s; }
.shooting_star:nth-child(7) { top: 60%; left: 10%; animation-delay: 1.9s; }
.shooting_star:nth-child(8) { top: 68%; left: 3%; animation-delay: .5s; }
.shooting_star:nth-child(9) { top: 74%; left: 14%; animation-delay: 2.3s; }
.shooting_star:nth-child(10) { top: 82%; left: 7%; animation-delay: 1.3s; }
.shooting_star:nth-child(11) { top: 12%; left: 28%; animation-delay: 2.6s; }
.shooting_star:nth-child(12) { top: 56%; left: 28%; animation-delay: .7s; }
</style>