<template>
  <div class="modal fade" id="mdl-reset-success" data-bs-backdrop="static" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header justify-content-center border-0 pt-4">
          <div>
            <div class="d-flex justify-content-center">
              <img src="@/assets/img/svg/tick.svg" alt="cross.png" style="height: 80px" />
            </div>
            <h5 class="modal-title mt-2">Reset Password Successful</h5>
          </div>
        </div>
        <div class="modal-body">
          <p class="text-body-tertiary text-center mb-0">
            Reset password successful. Please go to login page and use your new password
            to login
          </p>
        </div>
        <div class="modal-footer justify-content-center border-0 pb-4">
          <button type="button" class="btn btn-primary" @click="onGoToLogin()">
            Ok, Go to login
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useResetStore } from "@/stores/views/auth/reset.js";
import { Modal } from "bootstrap";
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

onMounted(() => {
  const resetStore = useResetStore();
  resetStore.mdl_success = Modal.getOrCreateInstance(
    document.getElementById("mdl-reset-success")
  );
});

const onGoToLogin = async () => {
  const resetStore = useResetStore();
  resetStore.mdl_success.hide();
  await router.push("/login");
};
</script>
