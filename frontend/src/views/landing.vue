<template>
  <div class="container mt-4">
    <!-- Logged In User Section -->
    <div v-if="isAuthenticated" class="welcome-section mb-4" v-reveal>
      <div class="home-card p-4 text-center">
        <h2 class="h3 mb-3" style="color: var(--primary)">Welcome back to FitU!</h2>
        <p class="mb-3" style="color: var(--text)">Ready to continue your fitness journey?</p>
        <router-link to="/home" class="btn btn-primary btn-lg btn-elevate">
          Start Using FitU Website
        </router-link>
      </div>
    </div>

    <!-- Not Logged In - Show Sign Up/Login Section -->
    <div v-if="!isAuthenticated" class="auth-section mb-4" v-reveal>
      <div class="home-card p-4 text-center">
        <h2 class="h3 mb-3" style="color: var(--primary)">Join FitU Today!</h2>
        <p class="mb-3" style="color: var(--text)">Start your fitness journey with our student-friendly platform</p>
        <div class="d-flex gap-3 justify-content-center">
          <router-link to="/signup" class="btn btn-primary btn-lg btn-elevate">
            Sign Up
          </router-link>
          <router-link to="/login" class="btn btn-outline-primary btn-lg">
            Login
          </router-link>
        </div>
      </div>
    </div>

    <!-- Slideshow / Carousel -->
    <div id="homeCarousel" class="carousel slide mb-4 home-card home-carousel" data-bs-ride="carousel" v-reveal>
      <div class="carousel-indicators">
        <button type="button" data-bs-target="#homeCarousel" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
        <button type="button" data-bs-target="#homeCarousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
        <button type="button" data-bs-target="#homeCarousel" data-bs-slide-to="2" aria-label="Slide 3"></button>
      </div>
      <div class="carousel-inner">
        <div class="carousel-item active carousel-item-tinted">
          <img src="/junwei.png" class="d-block w-100" alt="Workout motivation" style="object-fit: cover; height: 360px;">
          <div class="carousel-caption d-none d-md-block">
            <h5 class="fw-bold">Plan. Track. Improve.</h5>
            <p>Stay consistent with your red & cream fitness dashboard.</p>
          </div>
        </div>
        <div class="carousel-item carousel-gradient">
          <div class="d-flex align-items-center justify-content-center w-100" style="height: 360px;">
            <div class="text-center text-dark">
              <h5 class="fw-bold" style="color: var(--primary)">Visualize Your Week</h5>
              <p class="m-0">See your 7-day calories at a glance.</p>
            </div>
          </div>
        </div>
        <div class="carousel-item carousel-item-tinted">
          <img src="/junwei.png" class="d-block w-100" alt="Healthy choices" style="object-fit: cover; height: 360px;">
          <div class="carousel-caption d-none d-md-block">
            <h5 class="fw-bold">Workouts Your Way</h5>
            <p>Toggle workouts and focus on today's goals.</p>
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
    </div>

    <!-- Feature Highlights (moved above today's calories) -->
    <section class="home-card p-3 mb-4" v-reveal>
      <h2 class="h4 mb-3" style="color: var(--text)">Built for Student Life</h2>
      <div class="row g-3">
        <div class="col-12 col-md-6 col-lg-3">
          <div class="p-3 feature-card h-100">
            <div class="feature-icon">⏱️</div>
            <h6 class="mb-1">15-Minute Workouts</h6>
            <small class="u-muted">Fit exercise between lectures</small>
          </div>
        </div>
        <div class="col-12 col-md-6 col-lg-3">
          <div class="p-3 feature-card h-100">
            <div class="feature-icon">💪</div>
            <h6 class="mb-1">No Equipment</h6>
            <small class="u-muted">Bodyweight exercises anywhere</small>
          </div>
        </div>
        <div class="col-12 col-md-6 col-lg-3">
          <div class="p-3 feature-card h-100">
            <div class="feature-icon">👥</div>
            <h6 class="mb-1">Student Community</h6>
            <small class="u-muted">Connect with campus fitness groups</small>
          </div>
        </div>
        <div class="col-12 col-md-6 col-lg-3">
          <div class="p-3 feature-card h-100">
            <div class="feature-icon">⚡</div>
            <h6 class="mb-1">Quick Results</h6>
            <small class="u-muted">See progress in just weeks</small>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <div class="home-card p-3 mb-4" v-reveal>
      <div class="row text-center">
        <div class="col-12 col-md-4 mb-3 mb-md-0">
          <div class="h3 m-0" style="color: var(--primary)">500K+</div>
          <div class="u-muted">Active Students</div>
        </div>
        <div class="col-12 col-md-4 mb-3 mb-md-0">
          <div class="h3 m-0" style="color: var(--primary)">200+</div>
          <div class="u-muted">Workouts</div>
        </div>
        <div class="col-12 col-md-4">
          <div class="h3 m-0" style="color: var(--primary)">★ 4.9</div>
          <div class="u-muted">App Rating</div>
        </div>
      </div>
    </div>

    <!-- Reviews Section -->
    <div class="home-card p-3 mb-4" v-reveal>
      <h5 class="mb-3" style="color: var(--secondary)">Student Reviews</h5>
      <div v-if="reviews.length === 0" class="u-muted">No reviews yet.</div>
      <div class="row">
        <div v-for="r in reviews" :key="r.id" class="col-12 col-md-6 col-lg-6 mb-3">
          <div class="p-3 h-100" style="background: var(--surface); border: 1px solid var(--border-subtle); border-radius: 12px;">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <strong>{{ r.name }}</strong>
              <span class="u-muted">{{ r.course }} • {{ r.year }}</span>
            </div>
            <div class="mb-1" :aria-label="`Rating ${r.rating} out of 5`">
              <span v-for="n in 5" :key="n" :style="{ color: n <= r.rating ? 'var(--primary)' : '#d9d9d9' }">★</span>
            </div>
            <p class="m-0">{{ r.comment }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom CTA -->
    <section class="home-card p-4 text-center" v-reveal>
      <h2 class="mb-2" style="color: var(--text)">Ready to Transform Your Campus Fitness?</h2>
      <p class="u-muted mb-3">Join thousands of students getting stronger, healthier, and more energized.</p>
      <router-link to="/signup" class="btn btn-primary btn-elevate">Get Started Free</router-link>
    </section>

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

.home-card { background: var(--surface); border: 1px solid var(--border-subtle); box-shadow: var(--shadow-card); border-radius: 12px; }
.btn-elevate { box-shadow: 0 6px 18px rgba(230, 57, 70, 0.25); }
.btn-elevate:active { transform: translateY(1px); }

/* Welcome and Auth sections */
.welcome-section .home-card {
  background: linear-gradient(135deg, var(--surface) 0%, #f8f9fa 100%);
  border: 2px solid var(--primary);
}

.auth-section .home-card {
  background: linear-gradient(135deg, var(--surface) 0%, #fff7e6 100%);
}

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
.feature-card { background: #fff; border: 1px solid var(--border-subtle); border-radius: 12px; box-shadow: var(--shadow-card); }
.feature-icon { font-size: 1.5rem; color: var(--primary); margin-bottom: .25rem; }
</style>