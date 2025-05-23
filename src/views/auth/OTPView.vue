<template>
  <div class="col mx-auto">
    <div class="auth-form-box">
      <div class="text-center">
        <a class="d-flex flex-center text-decoration-none mb-4" href="#">
          <div class="d-flex align-items-center fw-bolder fs-3 d-inline-block">
            <img src="@/assets/img/png/logo.png" alt="phoenix" style="width: 80px" />
          </div>
        </a>
        <h4 class="text-body-highlight">Enter the verification code</h4>
        <p class="text-body-tertiary mb-4">
          An email containing a 6-digit verification code has been sent to the email
          address - {{ obscureEmail(state.forgot_email) }}
        </p>
        <form class="verification-form" @submit.prevent="onSubmitOTP()">
          <div class="d-flex align-items-center gap-2 mb-4">
            <input
              class="form-control px-2 text-center text-uppercase"
              type="text"
              ref="one"
              maxlength="1"
              v-model="state.frm.one"
              @keyup="onOneInput($event)"
            />
            <input
              class="form-control px-2 text-center text-uppercase"
              type="text"
              ref="two"
              maxlength="1"
              v-model="state.frm.two"
              @keyup="onTwoInput($event)"
            />
            <input
              class="form-control px-2 text-center text-uppercase"
              type="text"
              ref="three"
              maxlength="1"
              v-model="state.frm.three"
              @keyup="onThreeInput($event)"
            /><span>-</span>
            <input
              class="form-control px-2 text-center text-uppercase"
              type="text"
              ref="four"
              maxlength="1"
              v-model="state.frm.four"
              @keyup="onFourInput($event)"
            />
            <input
              class="form-control px-2 text-center text-uppercase"
              type="text"
              ref="five"
              maxlength="1"
              v-model="state.frm.five"
              @keyup="onFiveInput($event)"
            />
            <input
              class="form-control px-2 text-center text-uppercase"
              type="text"
              ref="six"
              maxlength="1"
              v-model="state.frm.six"
              @keyup="onSixInput($event)"
            />
          </div>
          <button
            class="btn btn-primary w-100 mb-5"
            type="submit"
            ref="bverify"
            :disabled="!isValid || state.ldi_verify"
          >
            {{ state.ldi_verify ? "Verifying..." : "Verify" }}
          </button>
          <p class="fs-9 mb-0">
            Didn’t receive the code?
            <a
              role="button"
              class="text-primary"
              :disabled="state.ldi_resend"
              @click="onResetOTP()"
              >{{ state.ldi_resend ? "Sending..." : "Click to resend" }}</a
            >
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import router from "@/router/index.js";
import { useGlobalStore } from "@/stores/global.js";
import { useOTPStore } from "@/stores/views/auth/otp.js";
import { obscureEmail } from "@/utilities.js";
import axios from "axios";
import { Modal } from "bootstrap";
import { computed, onMounted, reactive, ref } from "vue";

const state = reactive({
  frm: {
    one: "",
    two: "",
    three: "",
    four: "",
    five: "",
    six: "",
  },
  forgot_email: "",
  ldi_verify: false,
  ldi_resend: false,
});

const one = ref(null);
const two = ref(null);
const three = ref(null);
const four = ref(null);
const five = ref(null);
const six = ref(null);
const bverify = ref(null);

let mdl_wrong = null;

onMounted(async () => {
  if (!sessionStorage.getItem("frg_eml")) {
    await router.push("/forgot-password");
    return;
  }
  state.forgot_email = sessionStorage.getItem("frg_eml");
  mdl_wrong = Modal.getOrCreateInstance(document.getElementById("mdl-wrong-otp"));
});

const isValid = computed(() => {
  return (
    state.frm.one.length > 0 &&
    state.frm.two.length > 0 &&
    state.frm.three.length > 0 &&
    state.frm.four.length > 0 &&
    state.frm.five.length > 0 &&
    state.frm.six.length > 0
  );
});

const onOneInput = (e) => {
  if (e.code === "Backspace") {
    one.value.focus();
  } else if (state.frm.one.trim().length > 0) {
    two.value.focus();
  } else {
    state.frm.one = "";
  }
};

const onTwoInput = (e) => {
  if (e.code === "Backspace") {
    one.value.focus();
  } else if (state.frm.two.trim().length > 0) {
    three.value.focus();
  } else {
    state.frm.two = "";
  }
};

const onThreeInput = (e) => {
  if (e.code === "Backspace") {
    two.value.focus();
  } else if (state.frm.three.trim().length > 0) {
    four.value.focus();
  } else {
    state.frm.three = "";
  }
};

const onFourInput = (e) => {
  if (e.code === "Backspace") {
    three.value.focus();
  } else if (state.frm.four.trim().length > 0) {
    five.value.focus();
  } else {
    state.frm.four = "";
  }
};

const onFiveInput = (e) => {
  if (e.code === "Backspace") {
    four.value.focus();
  } else if (state.frm.five.trim().length > 0) {
    six.value.focus();
  } else {
    state.frm.five = "";
  }
};

const onSixInput = (e) => {
  if (e.code === "Backspace") {
    five.value.focus();
  } else if (state.frm.six.trim().length > 0) {
    bverify.value.focus();
  } else {
    state.frm.six = "";
  }
};

const onSubmitOTP = async () => {
  state.ldi_verify = true;
  let codeOTP = `${state.frm.one}${state.frm.two}${state.frm.three}${state.frm.four}${state.frm.five}${state.frm.six}`.toUpperCase();
  try {
    const res = await axios.post("/api/auth/forgot-pass/verify-otp", {
      email: state.forgot_email,
      otp: codeOTP,
    });
    let { result, code } = res.data;
    if (!result) {
      if (parseInt(code) === 1) {
        mdl_wrong.show();
        return;
      }
      if (parseInt(code) === 2) {
        const otpStore = useOTPStore();
        otpStore.mdl_expired.show();
        return;
      }
    }
    sessionStorage.setItem("frg_tkn", codeOTP);
    await router.push("/reset-password");
  } catch (err) {
    const globalStore = useGlobalStore();
    await globalStore.onCheckError(err, router);
  } finally {
    state.ldi_verify = false;
  }
};

const onResetOTP = async () => {
  state.ldi_resend = true;
  try {
    await axios.post("/api/auth/forgot-pass", {
      email: state.forgot_email,
    });
  } catch (err) {
    const globalStore = useGlobalStore();
    await globalStore.onCheckError(err, router);
  } finally {
    state.ldi_resend = false;
  }
};
</script>
