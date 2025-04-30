<template>
  <div class="mb-9">
    <div class="row g-2 mb-4">
      <div class="col-auto">
        <h2 class="mb-0">Brand</h2>
      </div>
    </div>
    <div id="brands">
      <div class="mb-4">
        <div class="row g-3 justify-content-between">
          <div class="col-auto">
            <div class="search-box">
              <input
                v-model="searchQuery"
                class="form-control search-input search"
                type="search"
                placeholder="Search brands"
              />
            </div>
          </div>
          <div class="col-auto">
            <button class="btn btn-primary" @click="openModal">
              <span class="fas fa-plus me-2"></span>Add Brand
            </button>
          </div>
        </div>
      </div>
      <div v-if="state.isLoading" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-else-if="state.error" class="text-center text-danger">
        {{ state.error }}
      </div>
      <div v-else class="table-responsive">
        <table class="table table-sm fs-9 mb-0">
          <thead>
            <tr>
              <th class="align-middle ps-0">#</th>
              <th class="align-middle">Brand Name</th>
              <th class="align-middle">Brand Local Name</th>
              <th class="align-middle text-end">Created At</th>
              <th class="align-middle text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredBrands.length === 0">
              <td colspan="5" class="text-center">No brand found</td>
            </tr>
            <tr v-else v-for="(brand, index) in filteredBrands" :key="brand.id">
              <td class="align-middle ps-0">{{ index + 1 }}</td>
              <td class="align-middle">{{ brand.name }}</td>
              <td class="align-middle">{{ brand.name_km }}</td>
              <td class="align-middle text-end">{{ formatDate(brand.created_at) }}</td>
              <td class="align-middle text-end">
                <button class="btn btn-sm btn-primary me-2" @click="editBrand(brand.id)">
                  <span class="fas fa-edit me-1"></span>Edit
                </button>
                <button class="btn btn-sm btn-danger" @click="deleteBrand(brand.id)">
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
      <h4>{{ isEditMode ? "Edit" : "Create" }} Brand</h4>
      <div v-if="modalMessage" class="alert alert-danger">
        {{ modalMessage }}
      </div>
      <form class="row g-3 needs-validation" novalidate @submit.prevent="handleSubmit">
        <div class="col-md-12">
          <label class="form-label" for="brandName">Brand Name</label>
          <input
            v-model="newBrand.name"
            class="form-control"
            id="brandName"
            type="text"
            required
          />
          <div class="invalid-feedback">Brand name is required</div>
        </div>
        <div class="col-md-12">
          <label class="form-label" for="brandLocalName">Brand Local Name</label>
          <input
            v-model="newBrand.name_km"
            class="form-control"
            id="brandLocalName"
            type="text"
            required
          />
          <div class="invalid-feedback">Brand local name is required</div>
        </div>
        <div class="col-12 float-end">
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

// Get toast functionality from the composable
const { toasts, showNotification, removeToast } = useToast();

const state = reactive({
  brands: [],
  isLoading: false,
  error: null,
});

const searchQuery = ref("");
const showModal = ref(false);
const isEditMode = ref(false);
const currentBrandId = ref(null);
const isSubmitting = ref(false);
const modalMessage = ref("");

// Confirmation modal state
const confirmationModal = reactive({
  show: false,
  title: "Confirm Action",
  message: "Are you sure you want to proceed?",
  action: null,
  actionParams: null,
});

const newBrand = reactive({
  name: "",
  name_km: "",
});

// Show confirmation modal
const showConfirmation = (title, message, action, actionParams) => {
  confirmationModal.show = true;
  confirmationModal.title = title;
  confirmationModal.message = message;
  confirmationModal.action = action;
  confirmationModal.actionParams = actionParams;
};

// Close confirmation modal
const closeConfirmationModal = () => {
  confirmationModal.show = false;
  confirmationModal.action = null;
  confirmationModal.actionParams = null;
};

// Confirm action
const confirmAction = () => {
  if (confirmationModal.action && typeof confirmationModal.action === "function") {
    confirmationModal.action(confirmationModal.actionParams);
  }
  closeConfirmationModal();
};

// Format date utility function
const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString();
};

const fetchBrands = async () => {
  state.isLoading = true;
  state.error = null;
  try {
    const res = await axios.get("/api/brands");
    if (res.data.result && Array.isArray(res.data.data)) {
      state.brands = res.data.data;
    } else {
      state.error = res.data.message || "Failed to fetch brands";
      showNotification("error", "Error", state.error);
    }
  } catch (error) {
    state.error = "An error occurred while fetching brands.";
    showNotification("error", "Error", state.error);
  } finally {
    state.isLoading = false;
  }
};

const createBrand = async () => {
  const globalStore = useGlobalStore();
  isSubmitting.value = true;
  modalMessage.value = "";
  try {
    const res = await axios.post(
      "/api/brands",
      { name: newBrand.name, name_km: newBrand.name_km },
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      state.brands.push(res.data.data);
      await fetchBrands();
      closeModal();
      resetBrandForm();
      showNotification("success", "Success", "Brand created successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to create brand";
    }
  } catch (error) {
    modalMessage.value = "An error occurred while creating the brand.";
  } finally {
    isSubmitting.value = false;
  }
};

const updateBrand = async () => {
  const globalStore = useGlobalStore();
  isSubmitting.value = true;
  modalMessage.value = "";
  try {
    const res = await axios.put(
      `/api/brands/${currentBrandId.value}`,
      { name: newBrand.name, name_km: newBrand.name_km },
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      const updatedBrand = res.data.data;
      const index = state.brands.findIndex((t) => t.id === updatedBrand.id);
      state.brands.splice(index, 1, updatedBrand);
      await fetchBrands();
      closeModal();
      resetBrandForm();
      showNotification("success", "Success", "Brand updated successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to update brand";
    }
  } catch (error) {
    modalMessage.value = "An error occurred while updating the brand.";
  } finally {
    isSubmitting.value = false;
  }
};

// Delete brand implementation
const performDeleteBrand = async (brandId) => {
  const globalStore = useGlobalStore();
  try {
    const res = await axios.delete(
      `/api/brands/${brandId}`,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      state.brands = state.brands.filter((p) => p.id !== brandId);
      await fetchBrands();
      showNotification("success", "Success", "Brand deleted successfully!");
    } else {
      showNotification("error", "Error", res.data.message || "Failed to delete brand");
    }
  } catch (error) {
    showNotification("error", "Error", "An error occurred while deleting the brand.");
  }
};

// Show confirmation for delete
const deleteBrand = (brandId) => {
  showConfirmation(
    "Delete Brand",
    "Are you sure you want to delete this brand?",
    performDeleteBrand,
    brandId
  );
};

const openModal = () => {
  resetBrandForm();
  isEditMode.value = false;
  showModal.value = true;
};

const editBrand = (brandId) => {
  const brand = state.brands.find((p) => p.id === brandId);
  if (brand) {
    newBrand.name = brand.name;
    newBrand.name_km = brand.name_km;
    currentBrandId.value = brandId;
    isEditMode.value = true;
    showModal.value = true;
  }
};

const closeModal = () => {
  showModal.value = false;
  resetBrandForm();
  modalMessage.value = "";
};

const resetBrandForm = () => {
  newBrand.name = "";
  newBrand.name_km = "";
  currentBrandId.value = null;
};

const handleSubmit = async (event) => {
  event.preventDefault();
  if (!newBrand.name.trim() || !newBrand.name_km.trim()) {
    modalMessage.value = "Both brand name and local name are required";
    return;
  }
  if (isEditMode.value) {
    await updateBrand();
  } else {
    await createBrand();
  }
};

const filteredBrands = computed(() => {
  return state.brands.filter((brand) => {
    const brandName = brand.name || ""; // Default to empty string
    const brandLocalName = brand.name_km || ""; // Default to empty string
    return (
      brandName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      brandLocalName.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  });
});

onMounted(fetchBrands);
</script>
