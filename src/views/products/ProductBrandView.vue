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
        <!-- Existing Brand Selection (Default for new brands) -->
        <div v-if="!isEditMode && availableBrands.length > 0" class="col-12">
          <div class="existing-brand-section">
            <div class="section-header">
              <label class="form-label" for="existingBrand">Select Existing Brand</label>
              <button
                type="button"
                class="btn btn-outline-secondary btn-sm add-new-brand-btn"
                @click="switchToCreateMode"
                title="Create New Brand"
              >
                <i class="fas fa-plus me-1"></i>Create New
              </button>
            </div>

            <div class="existing-brand-selector">
              <select
                v-model="selectedExistingBrandId"
                class="form-select"
                id="existingBrand"
                @change="onExistingBrandSelect"
                required
              >
                <option value="" disabled>Choose an existing brand</option>
                <option
                  v-for="brand in availableBrands"
                  :key="brand.id"
                  :value="brand.id"
                >
                  {{ brand.name }} ({{ brand.name_km }})
                </option>
              </select>
              <div class="invalid-feedback">Please select an existing brand</div>
            </div>

            <!-- Enhanced Preview of selected existing brand -->
            <div v-if="previewExistingBrand" class="existing-brand-preview">
              <div class="preview-card">
                <div class="brand-display">
                  <div class="brand-badge-large">
                    {{ previewExistingBrand.name.charAt(0).toUpperCase() }}
                  </div>
                </div>
                <div class="brand-info">
                  <h6 class="brand-name">{{ previewExistingBrand.name }}</h6>
                  <span class="brand-local-name">{{ previewExistingBrand.name_km }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- New Brand Creation Fields (Hidden by default, shown when no existing brands or when user clicks + button) -->
        <template
          v-if="
            brandInputMethod === 'create' || isEditMode || availableBrands.length === 0
          "
        >
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
        </template>

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

// New variables for brand selection
const brandInputMethod = ref("select"); // 'create' or 'select'
const selectedExistingBrandId = ref("");
const previewExistingBrand = ref(null);

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

// Get unique brands for selection
const availableBrands = computed(() => {
  const uniqueBrands = [];
  const seen = new Set();

  state.brands.forEach((brand) => {
    const key = `${brand.name}-${brand.name_km}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueBrands.push({
        id: brand.id,
        name: brand.name,
        name_km: brand.name_km,
      });
    }
  });

  return uniqueBrands;
});

const onExistingBrandSelect = () => {
  if (selectedExistingBrandId.value) {
    const selectedBrand = availableBrands.value.find(
      (brand) => brand.id === selectedExistingBrandId.value
    );
    if (selectedBrand) {
      previewExistingBrand.value = selectedBrand;
      // Auto-fill the brand data
      newBrand.name = selectedBrand.name;
      newBrand.name_km = selectedBrand.name_km;
    }
  } else {
    previewExistingBrand.value = null;
  }
};

const switchToCreateMode = () => {
  brandInputMethod.value = "create";
  selectedExistingBrandId.value = "";
  previewExistingBrand.value = null;
  newBrand.name = "";
  newBrand.name_km = "";
};

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

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString();
};

const fetchBrands = async () => {
  state.isLoading = true;
  state.error = null;
  const globalStore = useGlobalStore();
  try {
    const res = await axios.get("/api/brands", globalStore.getAxiosHeader());
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
  // Default to select mode if there are existing brands, otherwise create mode
  brandInputMethod.value = availableBrands.value.length > 0 ? "select" : "create";
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
  selectedExistingBrandId.value = "";
  previewExistingBrand.value = null;
  // Don't reset brandInputMethod here - let openModal handle it
};

const handleSubmit = async (event) => {
  event.preventDefault();

  // Validation for select existing brand mode
  if (
    brandInputMethod.value === "select" &&
    !isEditMode.value &&
    !selectedExistingBrandId.value &&
    availableBrands.value.length > 0
  ) {
    modalMessage.value = "Please select an existing brand";
    return;
  }

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
    const brandName = brand.name || "";
    const brandLocalName = brand.name_km || "";
    return (
      brandName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      brandLocalName.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  });
});

onMounted(fetchBrands);
</script>

<style scoped>
.modal-overlay {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 30px;
  padding-bottom: 30px;
  overflow-y: auto;
}

.modal-content {
  top: 0;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  left: 0;
  overflow-y: auto;
  padding: 2rem;
  border-radius: 0.5rem;
  margin: auto;
}

/* Enhanced existing brand section styling */
.existing-brand-section {
  background: transparent;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header .form-label {
  color: #495057;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0;
}

.add-new-brand-btn {
  background: transparent;
  border: 1px solid #6c757d;
  color: #6c757d;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.add-new-brand-btn:hover {
  background: #6c757d;
  border-color: #6c757d;
  color: white;
  transform: translateY(-1px);
}

.existing-brand-selector {
  margin-bottom: 1rem;
}

.existing-brand-preview {
  margin-top: 1rem;
}

.preview-card {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.preview-card:hover {
  transform: translateY(-2px);
}

.brand-display {
  flex-shrink: 0;
}

.brand-badge-large {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: white;
  color: #495057;
  font-weight: bold;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  border: 2px solid #dee2e6;
}

.brand-badge-large:hover {
  transform: scale(1.05);
}

.brand-info {
  flex-grow: 1;
}

.brand-name {
  margin: 0;
  color: #2d3748;
  font-weight: 600;
  font-size: 1.1rem;
}

.brand-local-name {
  color: #718096;
  font-size: 0.9rem;
  background: #f7fafc;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
  margin-top: 0.25rem;
}

.confirmation-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
}

.confirmation-modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  overflow: hidden;
}

.confirmation-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dee2e6;
}

.confirmation-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.confirmation-icon.warning {
  background-color: #fff3cd;
  color: #ff9800;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.confirmation-body {
  padding: 1rem;
}

.confirmation-footer {
  padding: 1rem;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #dee2e6;
}

.form-control,
.form-select {
  border-color: #e5e5e5;
  padding: 0.5rem 0.75rem;
}

.form-control:focus,
.form-select:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.table th {
  background-color: #f8f9fa;
  font-weight: 500;
}

/* Toast styles */
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1050;
}

.toast-notification {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
  width: 300px;
  margin-bottom: 0.5rem;
  padding: 0.75rem 1rem;
  animation: toast-in 0.2s ease-in;
}

.toast-notification.success {
  border-left: 4px solid #198754;
}

.toast-notification.error {
  border-left: 4px solid #dc3545;
}

.toast-icon {
  margin-right: 0.75rem;
  color: #6c757d;
}

.toast-notification.success .toast-icon {
  color: #198754;
}

.toast-notification.error .toast-icon {
  color: #dc3545;
}

.toast-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.toast-message {
  color: #6c757d;
  font-size: 0.875rem;
}

.toast-close {
  margin-left: auto;
  background: none;
  border: none;
  color: #6c757d;
  font-size: 1.25rem;
  cursor: pointer;
}

@keyframes toast-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
