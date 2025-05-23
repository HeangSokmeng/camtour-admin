<template>
  <div class="modal fade" id="mdl-expired-otp" data-bs-backdrop="static" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header justify-content-center border-0 pt-4">
          <div>
            <div class="d-flex justify-content-center">
              <img
                src="@/assets/img/png/expired.png"
                alt="cross.png"
                style="height: 80px"
              />
            </div>
            <h5 class="modal-title mt-2">Verify Code Expired</h5>
          </div>
        </div>
        <div class="modal-body">
          <p
            v-if="['otp.forgot.verify'].includes(route.name)"
            class="text-body-tertiary text-center mb-0"
          >
            Your verify code is expired. Please click on resend to get a new code.
          </p>
          <p
            v-if="['reset.password'].includes(route.name)"
            class="text-body-tertiary text-center mb-0"
          >
            Your verify code is expired. Please go to forgot password page then resend
            OTP.
          </p>
        </div>
        <div class="modal-footer justify-content-center border-0 pb-4">
          <button
            v-if="['otp.forgot.verify'].includes(route.name)"
            class="btn btn-primary"
            data-bs-dismiss="modal"
            type="button"
          >
            Ok, Got it
          </button>
          <button
            v-if="['reset.password'].includes(route.name)"
            type="button"
            class="btn btn-primary"
          >
            Ok, Go there
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useOTPStore } from "@/stores/views/auth/otp.js";
import { Modal } from "bootstrap";
import { onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

onMounted(() => {
  const otpStore = useOTPStore();
  otpStore.mdl_expired = Modal.getOrCreateInstance(
    document.getElementById("mdl-expired-otp")
  );
});
</script>
