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
import { app, db } from "../firebase";
import { collection, addDoc } from "firebase/firestore"; 
import { getAuth, createUserWithEmailAndPassword, updateProfile} from "firebase/auth";

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
        const userCredential = await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
        const user = auth.currentUser;
        updateProfile(user, {displayName: nameInput.value})


        const docRef = await addDoc(collection(db, "users"), {
          email: emailInput.value,
          name: nameInput.value,
          password: passwordInput.value,
        });

        router.push('/login');
      } catch (error) {
        console.error(error.code, error.message);
        alert('Sign Up failed.')
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