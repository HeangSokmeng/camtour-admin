<template>
  <form class="col mx-auto" @submit.prevent="onSubmitLogin()" autocomplete="on">
    <div class="auth-form-box">
      <div class="text-center mb-7">
        <a class="d-flex flex-center text-decoration-none mb-4" href="#">
          <div class="d-flex align-items-center fw-bolder fs-3 d-inline-block">
            <img src="@/assets/img/png/logo.png" alt="phoenix" style="width: 80px" />
          </div>
        </a>
        <h3 class="text-body-highlight">Sign In</h3>
        <p class="text-body-tertiary">Get access to your account</p>
      </div>

      <div class="mb-2 text-start">
        <label class="form-label" for="email">Email address</label>
        <div class="form-icon-container">
          <input
            class="form-control form-icon-input"
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            autocomplete="email"
            :class="{ 'is-invalid': vv.email.$error }"
            v-model="state.frm.email"
          />
          <div class="invalid-feedback" v-if="vv.email.$error">
            {{ vv.email.$errors[0].$message }}
          </div>
          <span class="fas fa-user text-body fs-9 form-icon"></span>
        </div>
      </div>
      <div class="mb-3 text-start">
        <label class="form-label" for="password">Password</label>
        <div class="form-icon-container">
          <input
            class="form-control form-icon-input pe-6 cdl-pass"
            id="password"
            name="password"
            :type="state.is_show_pass ? 'text' : 'password'"
            placeholder="Password"
            autocomplete="current-password"
            :class="{ 'is-invalid': vv.password.$error }"
            v-model="state.frm.password"
          />
          <div class="invalid-feedback" v-if="vv.password.$error">
            {{ vv.password.$errors[0].$message }}
          </div>
          <span class="fas fa-key text-body fs-9 form-icon"></span>
          <button
            type="button"
            class="btn px-3 py-0 position-absolute end-0 fs-7 text-body-tertiary"
            style="top: 6px"
            @click="state.is_show_pass = !state.is_show_pass"
            aria-label="Toggle password visibility"
          >
            <span class="uil uil-eye" v-show="!state.is_show_pass"></span>
            <span class="uil uil-eye-slash" v-show="state.is_show_pass"></span>
          </button>
        </div>
      </div>
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div class="form-check mb-0">
          <input
            class="form-check-input"
            id="basic-checkbox"
            name="remember"
            type="checkbox"
            checked="checked"
            v-model="state.is_remember"
          />
          <label class="form-check-label mb-0" for="basic-checkbox">Remember me</label>
        </div>

        <RouterLink to="/forgot-password" class="fs-9 fw-semibold">
          Forgot Password?
        </RouterLink>
      </div>

      <div class="position-relative">
        <hr class="bg-body-secondary mt-5 mb-4" />
        <!-- <div class="divider-content-center bg-body-emphasis">or use email</div> -->
      </div>
      <!-- <button
        type="button"
        :disabled="state.ldi_login || true"
        class="btn btn-phoenix-secondary w-100 mb-3"
      >
        <span class="fab fa-google text-danger me-2 fs-9"></span>Sign in with google
      </button> -->
      <!-- <button type="button"
                :disabled="state.ldi_login || true"
                class="btn btn-phoenix-secondary w-100">
                <span class="fab fa-facebook text-primary me-2 fs-9"></span>Sign in with
                facebook
            </button> -->
      <!-- <div class="text-center">
        <a class="fs-9 fw-bold" href="#">Go to user site</a>
      </div> -->
      <button
        class="btn btn-primary w-100 mb-3"
        :disabled="state.ldi_login"
        type="submit"
      >
        {{ state.ldi_login ? "Signing..." : "Sign in" }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { useGlobalStore } from "@/stores/global.js";
import useVuelidate from "@vuelidate/core";
import { email, helpers, required } from "@vuelidate/validators";
import axios from "axios";
import { Modal } from "bootstrap";
import { computed, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";

const state = reactive({
  frm: {
    email: "",
    password: "",
  },
  ldi_login: false,
  is_remember: true,
  is_show_pass: false,
});
const router = useRouter();
const rules = computed(() => ({
  email: {
    required: helpers.withMessage("Please enter account's email", required),
    email: helpers.withMessage("The email is invalid", email),
  },
  password: {
    required: helpers.withMessage("Please enter account's password", required),
  },
}));

const vv = useVuelidate(rules, state.frm);
let mdl_fail = null;

onMounted(() => {
  mdl_fail = Modal.getOrCreateInstance(document.getElementById("mdl-login-fail"));
});

const onSubmitLogin = async () => {
  await vv.value.$validate();
  if (vv.value.$error) {
    return;
  }
  state.ldi_login = true;
  try {
    const res = await axios.post("/api/auth/login", state.frm);
    const { result, data } = res.data;
    if (!result) {
      mdl_fail.show();
      return;
    }
    let { token, ...profile } = data;
    if (state.is_remember) {
      localStorage.setItem("usr_tk", token);
      localStorage.setItem("usr_pr", JSON.stringify(profile));
    } else {
      sessionStorage.setItem("usr_tk", token);
      sessionStorage.setItem("usr_pr", JSON.stringify(profile));
    }
    sessionStorage.setItem("is_check_usr", "1");
    await router.push("/");
  } catch (error) {
    const globalStore = useGlobalStore();
    await globalStore.onCheckError(error, router);
  } finally {
    state.ldi_login = false;
  }
};
</script>

<style scoped>
.logo-responsive {
  width: 60px;
  height: auto;
}

@media (min-width: 576px) {
  .logo-responsive {
    width: 70px;
  }
}

@media (min-width: 768px) {
  .logo-responsive {
    width: 80px;
  }
}

/* Enhanced touch targets for mobile */
@media (max-width: 767.98px) {
  .btn {
    min-height: 44px;
  }

  .form-control {
    min-height: 44px;
  }

  .form-check-input {
    width: 1.25em;
    height: 1.25em;
  }
}

/* Better spacing on smaller screens */
@media (max-width: 575.98px) {
  .auth-form-box {
    padding: 1.5rem 1rem;
  }
}

@media (min-width: 576px) {
  .auth-form-box {
    padding: 2rem;
  }
}
</style>
