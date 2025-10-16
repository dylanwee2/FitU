<template>
  <div>
    <!-- Carousel: moved outside container for full width -->
    <!-- <div id="homeCarousel" class="carousel slide mb-4 home-carousel" data-bs-ride="carousel" v-reveal
      style="width: 100vw; margin-left: calc(-50vw + 50%); border-radius: 0; box-shadow: none;">
      <div class="carousel-inner">
        <div class="carousel-item active">
          <img src="../assets/carousel/hyrox-background.webp" class="d-block w-100" alt="Workout motivation" style="object-fit: cover; height: 360px;">
          <div class="carousel-caption d-none d-md-block">
            <h1 class="fw-bold carousel-text" style="font-size: 70px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);">Plan. Track. Improve.</h1>
          </div>
        </div>
        <div class="carousel-item carousel-gradient">
          <img src="../assets/carousel/gym-background.jpg" class="d-block w-100" alt="Workout motivation" style="object-fit: cover; height: 360px;">
          <div class="carousel-caption d-none d-md-block">
            <h1 class="fw-bold carousel-text" style="font-size: 60px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);">Visualize. Believe. Achieve.</h1>
          </div>
        </div>
      </div>
      <button class="carousel-control-prev" type="button" data-bs-target="#homeCarousel" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#homeCarousel" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div> -->

    <div class="container mt-4">
      <!-- Logged In User Section -->
      <div v-if="isAuthenticated" class="mb-4" v-reveal>
        <div class="p-4 text-center">
          <h2 class="h3 mb-3">Welcome back to FitU!</h2>
          <p class="mb-3">Ready to continue your fitness journey?</p>
          <router-link to="/home" class="u-btn u-btn--primary">
            Start Using FitU Website
          </router-link>
        </div>
      </div>

      <!-- Not Logged In - Show Sign Up/Login Section -->
      <div v-if="!isAuthenticated" class="hero row mb-4" v-reveal>
        <div class="hero-content col-lg-6 p-4 text-left">
          <h1 class="mb-3" style="font-size: 80px;">UNLEASH YOUR<br>BEST SELF</h1>
          <p class="mb-3 u-muted">Unlock your fitness potential with personalized workout plans, meal tracking, and expert guidance.</p>
          <div class="d-flex gap-3 justify-content-left">
            <router-link to="/signup" class="u-btn u-btn--primary" style="text-decoration: none;">
              Join FitU Now!
            </router-link>
          </div>
        </div>

        <div class="hero-image col-lg-6">
          <img src="../assets/img/bodybuilder.png" alt="Workout"  style="max-width: 100%;"/>
        </div>
      </div>

      <!-- Feature Highlights (moved above today's calories) -->
      <section class="p-3 mb-4" v-reveal>
        <h2 class="h4 mb-3">Built for Student Life</h2>
        <div class="row g-3">
          <div class="col-12 col-md-6 col-lg-3">
            <div class="p-3 u-card h-100">
              <div class="feature-icon">⏱️</div>
              <h6 class="mb-1">15-Minute Workouts</h6>
              <small class="u-muted">Fit exercise between lectures</small>
            </div>
          </div>
          <div class="col-12 col-md-6 col-lg-3">
            <div class="p-3 u-card h-100">
              <div class="feature-icon">💪</div>
              <h6 class="mb-1">No Equipment</h6>
              <small class="u-muted">Bodyweight exercises anywhere</small>
            </div>
          </div>
          <div class="col-12 col-md-6 col-lg-3">
            <div class="p-3 u-card h-100">
              <div class="feature-icon">👥</div>
              <h6 class="mb-1">Student Community</h6>
              <small class="u-muted">Connect with campus fitness groups</small>
            </div>
          </div>
          <div class="col-12 col-md-6 col-lg-3">
            <div class="p-3 u-card h-100">
              <div class="feature-icon">⚡</div>
              <h6 class="mb-1">Quick Results</h6>
              <small class="u-muted">See progress in just weeks</small>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <div class="p-3 mb-4" v-reveal>
        <div class="row text-center">
          <div class="col-12 col-md-4 mb-3 mb-md-0">
            <div class="h3 m-0">500K+</div>
            <div class="u-muted">Active Students</div>
          </div>
          <div class="col-12 col-md-4 mb-3 mb-md-0">
            <div class="h3 m-0">200+</div>
            <div class="u-muted">Workouts</div>
          </div>
          <div class="col-12 col-md-4">
            <div class="h3 m-0">★ 4.9</div>
            <div class="u-muted">App Rating</div>
          </div>
        </div>
      </div>

      <!-- Reviews Section -->
      <div class="p-3 mb-4" v-reveal>
        <h5 class="mb-3">Student Reviews</h5>
        <div v-if="reviews.length === 0" class="u-muted">No reviews yet.</div>
        <div class="row">
          <div v-for="r in reviews" :key="r.id" class="col-12 col-md-6 col-lg-6 mb-3">
            <div class="p-3 h-100 u-card">
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
        <router-link to="/signup" class="u-btn u-btn--primary" style="text-decoration: none;">Get Started Free</router-link>
      </section>

    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'vue-router'


export default {
  components: {

  },
  setup() {
    const router = useRouter()
    const auth = getAuth();
    const isAuthenticated = ref(false);

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
    });

    // Reviews state
    const reviews = ref([
      { id: 'r1', name: 'Aisha K.', course: 'Computer Science', year: 'Year 2', rating: 5, comment: 'FitU keeps me on track during exam season. Love the clean visuals!' },
      { id: 'r2', name: 'Liam D.', course: 'Mechanical Eng.', year: 'Year 3', rating: 5, comment: 'The workout planner and calorie tracker combo is perfect.' },
      { id: 'r3', name: 'Sophia M.', course: 'Medicine', year: 'Year 1', rating: 4, comment: 'Simple, fast, and the red/cream theme is beautiful.' },
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
</style>