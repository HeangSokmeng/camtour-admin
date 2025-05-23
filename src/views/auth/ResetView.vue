<template>
  <div class="col mx-auto">
    <div class="auth-form-box">
      <div class="text-center mb-7">
        <a class="d-flex flex-center text-decoration-none mb-4" href="#">
          <div class="d-flex align-items-center fw-bolder fs-3 d-inline-block">
            <img src="@/assets/img/png/logo.png" alt="phoenix" style="width: 80px" />
          </div>
        </a>
        <h4 class="text-body-highlight">Reset new password</h4>
        <p class="text-body-tertiary">Type your new password</p>
      </div>
      <form class="mt-5" @submit.prevent="onSubmitReset()">
        <div class="position-relative mb-2">
          <input
            class="form-control form-icon-input pe-6 cdl-pass"
            id="password"
            :type="state.is_show_pass ? 'text' : 'password'"
            placeholder="Type new password"
            :class="{ 'is-invalid': vv.new_pass.$error }"
            v-model="state.frm.new_pass"
          />
          <div class="invalid-feedback" v-if="vv.new_pass.$error">
            {{ vv.new_pass.$errors[0].$message }}
          </div>
          <button
            type="button"
            class="btn px-3 py-0 position-absolute end-0 fs-7 text-body-tertiary"
            style="top: 7px"
          >
            <span
              v-show="!state.is_show_pass"
              class="uil uil-eye"
              @click="state.is_show_pass = true"
            ></span>
            <span
              v-show="state.is_show_pass"
              class="uil uil-eye-slash"
              @click="state.is_show_pass = false"
            ></span>
          </button>
        </div>
        <div class="position-relative mb-4">
          <input
            class="form-control form-icon-input pe-6 cdl-pass"
            id="confirmPassword"
            :type="state.is_show_confirm ? 'text' : 'password'"
            placeholder="Confirm new password"
            :class="{ 'is-invalid': vv.new_pass_confirmation.$error }"
            v-model="state.frm.new_pass_confirmation"
          />
          <div class="invalid-feedback" v-if="vv.new_pass_confirmation.$error">
            {{ vv.new_pass_confirmation.$errors[0].$message }}
          </div>
          <button
            type="button"
            class="btn px-3 py-0 position-absolute end-0 fs-7 text-body-tertiary"
            style="top: 7px"
          >
            <span
              v-show="!state.is_show_confirm"
              class="uil uil-eye"
              @click="state.is_show_confirm = true"
            ></span>
            <span
              v-show="state.is_show_confirm"
              class="uil uil-eye-slash"
              @click="state.is_show_confirm = false"
            ></span>
          </button>
        </div>
        <button class="btn btn-primary w-100" :disabled="state.ldi_reset" type="submit">
          {{ state.ldi_reset ? "Resetting..." : "Set Password" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import router from "@/router/index.js";
import { useGlobalStore } from "@/stores/global.js";
import { useOTPStore } from "@/stores/views/auth/otp.js";
import { useResetStore } from "@/stores/views/auth/reset.js";
import useVuelidate from "@vuelidate/core";
import { helpers, required, sameAs } from "@vuelidate/validators";
import axios from "axios";
import { Modal } from "bootstrap";
import { computed, onMounted, reactive } from "vue";

const state = reactive({
  frm: {
    new_pass: "",
    new_pass_confirmation: "",
  },
  is_show_pass: false,
  is_show_confirm: false,
  ldi_reset: false,
});

let forgotEmail = "";
let forgotOTP = "";
let mdlWrong = null;

const rules = computed(() => ({
  new_pass: {
    required: helpers.withMessage("Please enter a new password", required),
  },
  new_pass_confirmation: {
    required: helpers.withMessage("Please enter a new password again", required),
    sameAs: helpers.withMessage("Both password not the same", sameAs(state.frm.new_pass)),
  },
}));

const vv = useVuelidate(rules, state.frm);

onMounted(async () => {
  if (!sessionStorage.getItem("frg_eml") || !sessionStorage.getItem("frg_tkn")) {
    await router.push("/forgot-password");
    return;
  }
  forgotEmail = sessionStorage.getItem("frg_eml");
  forgotOTP = sessionStorage.getItem("frg_tkn");
  mdlWrong = Modal.getOrCreateInstance(document.getElementById("mdl-wrong-otp"));
});

const onSubmitReset = async () => {
  await vv.value.$validate();
  if (vv.value.$error) {
    return;
  }
  state.ldi_reset = true;
  try {
    const res = await axios.post("/api/auth/reset-pass", {
      email: forgotEmail,
      otp: forgotOTP,
      new_pass: state.frm.new_pass,
      new_pass_confirmation: state.frm.new_pass_confirmation,
    });
    let { result, code } = res.data;
    if (!result) {
      if (parseInt(code) === 1) {
        mdlWrong.show();
        return;
      }
      if (parseInt(code) === 2) {
        const otpStore = useOTPStore();
        otpStore.mdl_expired.show();
        return;
      }
    }
    sessionStorage.removeItem("frg_eml");
    sessionStorage.removeItem("frg_tkn");
    const resetStore = useResetStore();
    resetStore.mdl_success.show();
  } catch (err) {
    const globalStore = useGlobalStore();
    await globalStore.onCheckError(err, router);
  } finally {
    state.ldi_reset = false;
  }
};
</script>
