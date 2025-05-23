<template>
  <div class="modal fade" id="mdl-logout" data-bs-backdrop="static" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header justify-content-center border-0 pt-4">
          <div>
            <div class="d-flex justify-content-center">
              <img
                src="@/assets/img/png/question.png"
                alt="question.png"
                style="height: 80px"
              />
            </div>
            <h5 class="modal-title mt-2">Sign Out</h5>
          </div>
        </div>
        <div class="modal-body">
          <p class="text-body-tertiary text-center mb-0 px-7">
            After sign out, you need to re-enter your account. Are you sure to sign out?
          </p>
        </div>
        <div class="modal-footer justify-content-center border-0 gap-2 pb-4">
          <button
            class="btn btn-outline-primary"
            data-bs-dismiss="modal"
            :disabled="state.ldi_logout"
            type="button"
          >
            No, Cancel
          </button>
          <button
            class="btn btn-primary"
            type="button"
            :disabled="state.ldi_logout"
            @click="onLogout()"
          >
            {{ state.ldi_logout ? "Logging out..." : "Yes, Got it" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGlobalStore } from "@/stores/global.js";
import { clearToken } from "@/utilities.js";
import axios from "axios";
import { Modal } from "bootstrap";
import { onMounted, reactive } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const globalStore = useGlobalStore();
const state = reactive({
  ldi_logout: false,
});

onMounted(() => {
  globalStore.mdl_logout = Modal.getOrCreateInstance(
    document.getElementById("mdl-logout")
  );
});

const onLogout = async () => {
  state.ldi_logout = true;
  try {
    await axios.delete("/api/auth/logout", globalStore.getAxiosHeader());
    clearToken();
    await router.push("/login");
    globalStore.mdl_logout.hide();
  } catch (err) {
    await globalStore.onCheckError(err, router);
  } finally {
    state.ldi_logout = false;
  }
};
</script>
