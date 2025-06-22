<template>
  <div class="mb-9">
    <div class="row g-2 mb-4">
      <div class="col-auto">
        <h2 class="mb-0">Province</h2>
      </div>
    </div>
    <div id="provinces">
      <div class="mb-4">
        <div class="row g-3 justify-content-between">
          <div class="col-auto">
            <div class="search-box">
              <input
                v-model="searchQuery"
                class="form-control search-input search"
                type="search"
                placeholder="Search provinces"
              />
            </div>
          </div>
          <div class="col-auto">
            <button class="btn btn-primary" @click="openModal">
              <span class="fas fa-plus me-2"></span>Add Province
            </button>
          </div>
        </div>
      </div>
      <div v-if="state.isLoading" class="text-center">Loading...</div>
      <div v-else-if="state.error" class="text-center text-danger">
        {{ state.error }}
      </div>
      <div v-else class="table-responsive">
        <table class="table table-sm fs-9 mb-0">
          <thead>
            <tr>
              <th class="align-middle ps-0">#</th>
              <th class="align-middle">Province Name</th>
              <th class="align-middle">Province Local Name</th>
              <th class="align-middle text-end">Created At</th>
              <th class="align-middle text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredProvinces.length === 0">
              <td colspan="5" class="text-center">No province found</td>
            </tr>
            <tr v-else v-for="(province, index) in filteredProvinces" :key="province.id">
              <td class="align-middle ps-0">{{ index + 1 }}</td>
              <td class="align-middle">{{ province.name }}</td>
              <td class="align-middle">{{ province.local_name }}</td>
              <td class="align-middle text-end">{{ province.created_at }}</td>
              <td class="align-middle text-end">
                <button
                  class="btn btn-sm btn-primary me-2"
                  @click="editProvince(province.id)"
                >
                  <span class="fas fa-edit me-1"></span>Edit
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  @click="deleteProvince(province.id)"
                >
                  <span class="fas fa-trash me-1"></span>Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div v-if="showModal" class="modal-overlay">
    <div class="modal-content">
      <h4>{{ isEditMode ? "Edit" : "Create" }} Province</h4>
      <div v-if="modalMessage" class="alert alert-danger">
        {{ modalMessage }}
      </div>
      <form class="row g-3 needs-validation" novalidate @submit.prevent="handleSubmit">
        <div class="col-md-12">
          <label class="form-label" for="provinceName">Province Name</label>
          <input
            v-model="newProvince.name"
            class="form-control"
            id="provinceName"
            type="text"
            required
          />
          <div class="invalid-feedback">Province name is required</div>
        </div>
        <div class="col-md-12">
          <label class="form-label" for="provinceLocalName">Province Local Name</label>
          <input
            v-model="newProvince.local_name"
            class="form-control"
            id="provinceLocalName"
            type="text"
            required
          />
          <div class="invalid-feedback">Province local name is required</div>
        </div>
        <div class="col-12 d-flex justify-content-end">
          <button class="btn btn-secondary me-2" type="button" @click="closeModal">
            Cancel
          </button>
          <button class="btn btn-primary" type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? "Processing..." : isEditMode ? "Update" : "Save" }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Toast Notifications -->
  <div class="toast-container">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-notification"
        :class="toast.type"
      >
        <div class="toast-icon">
          <i :class="toast.icon"></i>
        </div>
        <div class="toast-content">
          <div class="toast-title">{{ toast.title }}</div>
          <div class="toast-message">{{ toast.message }}</div>
        </div>
        <button class="toast-close" @click="removeToast(toast.id)">&times;</button>
      </div>
    </transition-group>
  </div>

  <!-- Confirmation Modal -->
  <div v-if="confirmationModal.show" class="confirmation-modal-overlay">
    <div class="confirmation-modal-content">
      <div class="confirmation-header">
        <span class="confirmation-icon warning">
          <i class="fas fa-exclamation-triangle"></i>
        </span>
        <button class="close-btn" @click="closeConfirmationModal">&times;</button>
      </div>
      <div class="confirmation-body">
        <h5>{{ confirmationModal.title }}</h5>
        <p>{{ confirmationModal.message }}</p>
      </div>
      <div class="confirmation-footer">
        <button class="btn btn-secondary me-2" @click="closeConfirmationModal">
          Cancel
        </button>
        <button class="btn btn-danger" @click="confirmAction">Confirm</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import "@/assets/css/toast-styles.css";
import { useToast } from "@/composables/useToast";
import { useGlobalStore } from "@/stores/global";
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";

const { toasts, showNotification, removeToast } = useToast();
const state = reactive({
  provinces: [],
  isLoading: false,
  error: null,
});
const searchQuery = ref("");
const showModal = ref(false);
const isEditMode = ref(false);
const currentProvinceId = ref(null);
const isSubmitting = ref(false);
const modalMessage = ref("");

const confirmationModal = reactive({
  show: false,
  title: "Confirm Action",
  message: "Are you sure you want to proceed?",
  action: null,
  actionParams: null,
});

const newProvince = reactive({
  name: "",
  local_name: "",
});

const showConfirmation = (title, message, action, actionParams) => {
  confirmationModal.show = true;
  confirmationModal.title = title;
  confirmationModal.message = message;
  confirmationModal.action = action;
  confirmationModal.actionParams = actionParams;
};

const closeConfirmationModal = () => {
  confirmationModal.show = false;
  confirmationModal.action = null;
  confirmationModal.actionParams = null;
};

const confirmAction = () => {
  if (confirmationModal.action && typeof confirmationModal.action === "function") {
    confirmationModal.action(confirmationModal.actionParams);
  }
  closeConfirmationModal();
};

const fetchProvinces = async () => {
  state.isLoading = true;
  state.error = null;
  const globalStore = useGlobalStore();
  try {
    const res = await axios.get("/api/provinces", globalStore.getAxiosHeader());
    if (res.data.result && Array.isArray(res.data.data)) {
      state.provinces = res.data.data;
    } else {
      state.error = res.data.message || "Failed to fetch provinces";
    }
  } catch (error) {
    state.error = "An error occurred while fetching provinces.";
  }
  state.isLoading = false;
};

const createProvince = async () => {
  const globalStore = useGlobalStore();
  isSubmitting.value = true;
  modalMessage.value = "";
  try {
    const res = await axios.post(
      `/api/provinces`,
      { name: newProvince.name, local_name: newProvince.local_name },
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      state.provinces.push(res.data.data);
      await fetchProvinces();
      closeModal();
      resetProvinceForm();
      showNotification("success", "Success", "Province created successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to create province";
    }
  } catch (error) {
    modalMessage.value = "An error occurred while creating the province.";
  }
  isSubmitting.value = false;
};

const updateProvince = async () => {
  const globalStore = useGlobalStore();
  isSubmitting.value = true;
  modalMessage.value = "";
  try {
    const res = await axios.put(
      `/api/provinces/${currentProvinceId.value}`,
      { name: newProvince.name, local_name: newProvince.local_name },
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      const updatedProvince = res.data.data;
      const index = state.provinces.findIndex((t) => t.id === updatedProvince.id);
      state.provinces.splice(index, 1, updatedProvince);
      await fetchProvinces();
      closeModal();
      resetProvinceForm();
      showNotification("success", "Success", "Province updated successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to update province";
    }
  } catch (error) {
    modalMessage.value = "An error occurred while updating the province.";
  }
  isSubmitting.value = false;
};

// Delete province function
const performDeleteProvince = async (provinceId) => {
  const globalStore = useGlobalStore();
  try {
    const res = await axios.delete(
      `/api/provinces/${provinceId}`,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      state.provinces = state.provinces.filter((p) => p.id !== provinceId);
      await fetchProvinces();
      showNotification("success", "Success", "Province deleted successfully!");
    } else {
      showNotification("error", "Error", res.data.message || "Failed to delete province");
    }
  } catch (error) {
    showNotification("error", "Error", "An error occurred while deleting the province.");
  }
};

const deleteProvince = (provinceId) => {
  showConfirmation(
    "Delete Province",
    "Are you sure you want to delete this province?",
    performDeleteProvince,
    provinceId
  );
};

const openModal = () => {
  resetProvinceForm();
  isEditMode.value = false;
  showModal.value = true;
};

const editProvince = (provinceId) => {
  const province = state.provinces.find((p) => p.id === provinceId);
  if (province) {
    newProvince.name = province.name;
    newProvince.local_name = province.local_name;
    currentProvinceId.value = provinceId;
    isEditMode.value = true;
    showModal.value = true;
  }
};

const closeModal = () => {
  showModal.value = false;
  resetProvinceForm();
  modalMessage.value = "";
};

const resetProvinceForm = () => {
  newProvince.name = "";
  newProvince.local_name = "";
  currentProvinceId.value = null;
};

const handleSubmit = async (event) => {
  event.preventDefault();
  if (!newProvince.name.trim() || !newProvince.local_name.trim()) {
    modalMessage.value = "Both province name and local name are required";
    return;
  }
  if (isEditMode.value) {
    await updateProvince();
  } else {
    await createProvince();
  }
};

const filteredProvinces = computed(() => {
  return state.provinces.filter((province) =>
    province.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

onMounted(fetchProvinces);
</script>
