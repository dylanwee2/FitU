<template>
  <section class="vh-100" style="background-color: #9A616D;">
    <div class="container py-5 h-100">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col-12 col-lg-11 col-xl-10">
          <div class="card" style="border-radius: 1rem;">
            <div class="row g-0">
              <div class="col-md-6 col-lg-6 col-xl-5 d-none d-md-block">
                <img src="../../public/junwei.png"
                  alt="signup form" class="img-fluid w-100 h-100" style="border-radius: 1rem 0 0 1rem; object-fit: cover;" />
              </div>
              <div class="col-md-6 col-lg-6 col-xl-7 d-flex align-items-center">
                <div class="card-body p-4 p-lg-5 p-xl-6 text-black w-100">
                  <form class="mx-auto" style="max-width: 400px;">
                    <div class="d-flex align-items-center mb-4 pb-2">
                      <i class="fas fa-cubes fa-2x me-3" style="color: #ff6219;"></i>
                      <span class="h1 fw-bold mb-0">FitU</span>
                    </div>
                    <h5 class="fw-normal mb-4 pb-3" style="letter-spacing: 1px;">Create your account</h5>
                    <div data-mdb-input-init class="form-outline mb-4">
                      <input type="text" id="form2Example1" class="form-control form-control-lg" v-model="nameInput" />
                      <label class="form-label" for="form2Example1">Full Name</label>
                    </div>
                    <div data-mdb-input-init class="form-outline mb-4">
                      <input type="email" id="form2Example17" class="form-control form-control-lg" v-model="emailInput" />
                      <label class="form-label" for="form2Example17">Email address</label>
                    </div>
                    <div data-mdb-input-init class="form-outline mb-4">
                      <input type="password" id="form2Example27" class="form-control form-control-lg" v-model="passwordInput" />
                      <label class="form-label" for="form2Example27">Password</label>
                    </div>
                    <div class="pt-1 mb-4">
                      <button data-mdb-button-init data-mdb-ripple-init class="btn btn-dark btn-lg btn-block" type="button" @click.prevent="signup">Sign Up</button>
                    </div>
                    <p class="mb-0 text-center" style="color: #393f81;">Already have an account? <router-link to="/login"
                        style="color: #393f81;">Login here</router-link></p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

export default {
  name: 'Signup',
  setup() {
    const router = useRouter();
    const auth = getAuth();
    const emailInput = ref('');
    const nameInput = ref('');
    const passwordInput = ref('');

    const signup = async () => {
      try {
        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
        const user = userCredential.user;
        
        // Update the user's display name in Firebase Auth
        await updateProfile(user, { displayName: nameInput.value });

        // Create user document in Firestore using the user's UID as the document ID
        // This ensures the document ID matches the auth UID
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
          fullName: nameInput.value,
          email: emailInput.value,
          photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(nameInput.value)}&size=150&background=e63946&color=fff`,
          
          // Default profile fields
          gender: '',
          age: null,
          height: null,
          weight: null,
          
          // Default goals - CHANGED: Use dailyCalorieGoal to match home page
          goalType: '',
          dailyGoal: 2000,
          dietaryPreference: '',
          allergies: '',
          workoutFrequency: 3,
          
          // Default preferences
          spotifyConnected: false,
          aiSuggestionsEnabled: true,
          remindersEnabled: true,
          darkMode: false,
          
          // Timestamps
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Navigate to login page
        router.push('/login');
      } catch (error) {
        console.error(error.code, error.message);
        
        // Provide more specific error messages
        let errorMsg = 'Sign Up failed.';
        if (error.code === 'auth/email-already-in-use') {
          errorMsg = 'This email is already registered. Please login instead.';
        } else if (error.code === 'auth/weak-password') {
          errorMsg = 'Password should be at least 6 characters.';
        } else if (error.code === 'auth/invalid-email') {
          errorMsg = 'Please enter a valid email address.';
        }
        
        alert(errorMsg);
      }
    }

    return { emailInput, nameInput, passwordInput, signup };
  }
}
</script>

<style scoped>
/* Custom styles for the signup form */
.btn-block {
  width: 100%;
}
</style>