<template>
  <div class="col mx-auto">
    <div class="auth-form-box" style="height: 500px">
      <div class="text-center">
        <a class="d-flex flex-center text-decoration-none mb-4" href="#">
          <div class="d-flex align-items-center fw-bolder fs-3 d-inline-block">
            <img src="@/assets/img/png/logo.png" alt="phoenix" style="width: 80px" />
          </div>
        </a>
        <h4 class="text-body-highlight">Forgot your password?</h4>
        <p class="text-body-tertiary mb-5">
          Enter your email below and we will <br class="d-md-none" />send you
          <br class="d-none d-xxl-block" />OTP code
        </p>
        <form class="mb-5" @submit.prevent="onSubmitForgot()">
          <div class="d-flex align-items-center">
            <input
              class="form-control flex-1"
              id="email"
              type="email"
              placeholder="Email"
              :class="{ 'is-invalid': vv.email.$error }"
              v-model="state.frm.email"
            />
            <button class="btn btn-primary ms-2" :disabled="state.ldi_send" type="submit">
              {{ state.ldi_send ? "Sending..." : "Send"
              }}<span class="fas fa-chevron-right ms-2"></span>
            </button>
          </div>
          <div v-if="vv.email.$error" class="small text-danger text-start mt-1">
            {{ vv.email.$errors[0].$message }}
          </div>
        </form>
        <RouterLink to="/login" class="fs-9 fw-bold"> Go back to login </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGlobalStore } from "@/stores/global.js";
import useVuelidate from "@vuelidate/core";
import { email, helpers, required } from "@vuelidate/validators";
import axios from "axios";
import { computed, reactive } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const state = reactive({
  frm: {
    email: "",
  },
  ldi_send: false,
});
const rules = computed(() => ({
  email: {
    required: helpers.withMessage("Please enter your account's email", required),
    email: helpers.withMessage("Email is invalid", email),
  },
}));
const vv = useVuelidate(rules, state.frm);

const onSubmitForgot = async () => {
  await vv.value.$validate();
  if (vv.value.$error) {
    return;
  }

  state.ldi_send = true;
  try {
    await axios.post("/api/auth/forgot-pass", state.frm);
    sessionStorage.setItem("frg_eml", state.frm.email);
    await router.push("/otp/forgot-verify");
  } catch (err) {
    const globalStore = useGlobalStore();
    await globalStore.onCheckError(err, router);
  } finally {
    state.ldi_send = false;
  }
};
</script>
