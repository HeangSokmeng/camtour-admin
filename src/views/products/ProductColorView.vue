<template>
  <div class="mb-9">
    <div class="row g-2 mb-4">
      <div class="col-auto">
        <h2 class="mb-0">Product Colors</h2>
      </div>
    </div>
    <div id="product-colors">
      <div class="mb-4">
        <div class="row g-3 justify-content-between">
          <div class="col-auto">
            <div class="search-box">
              <input
                v-model="searchQuery"
                class="form-control search-input search"
                type="search"
                placeholder="Search colors"
              />
            </div>
          </div>
          <div class="col-auto">
            <button class="btn btn-primary" @click="openModal">
              <span class="fas fa-plus me-2"></span>Add Color
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
              <th class="align-middle">Color</th>
              <th class="align-middle">Name</th>
              <th class="align-middle">Code</th>
              <th class="align-middle">Product</th>
              <th class="align-middle text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredColors.length === 0">
              <td colspan="6" class="text-center">No colors found</td>
            </tr>
            <tr v-else v-for="(color, index) in filteredColors" :key="color.id">
              <td class="align-middle ps-0">{{ index + 1 }}</td>
              <td class="align-middle">
                <div
                  class="color-swatch"
                  :style="{ backgroundColor: color.code }"
                  :title="color.code"
                ></div>
              </td>
              <td class="align-middle">{{ color.name }}</td>
              <td class="align-middle">{{ color.code }}</td>
              <td class="align-middle">
                {{ getProductName(color.product_id) }}
              </td>
              <td class="align-middle text-end">
                <button class="btn btn-sm btn-primary me-2" @click="editColor(color.id)">
                  <span class="fas fa-edit me-1"></span>Edit
                </button>
                <button class="btn btn-sm btn-danger" @click="deleteColor(color.id)">
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
    <div class="modal-content color-form">
      <h4>{{ isEditMode ? "Edit" : "Create" }} Product Color</h4>
      <div v-if="modalMessage" class="alert alert-danger">
        {{ modalMessage }}
      </div>
      <form class="row g-3 needs-validation" novalidate @submit.prevent="handleSubmit">
        <!-- Color Information -->
        <div class="col-md-6">
          <label class="form-label" for="colorName">Color Name</label>
          <input
            v-model="newColor.name"
            class="form-control"
            id="colorName"
            type="text"
            required
          />
          <div class="invalid-feedback">Color name is required</div>
        </div>

        <div class="col-md-6">
          <label class="form-label" for="colorCode">Color Code</label>
          <div class="input-group">
            <input
              v-model="newColor.code"
              class="form-control"
              id="colorCode"
              type="text"
              pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
              placeholder="#123456"
              required
            />
            <span class="input-group-text p-0">
              <input
                type="color"
                class="form-control form-control-color p-0 border-0"
                v-model="newColor.code"
              />
            </span>
          </div>
          <div class="invalid-feedback">Valid color code is required (e.g., #FF5733)</div>
        </div>

        <!-- Product Selection -->
        <div class="col-md-12">
          <label class="form-label" for="productId">Product</label>
          <select
            v-model="newColor.product_id"
            class="form-select"
            id="productId"
            required
          >
            <option value="" disabled>Select a product</option>
            <option v-for="product in products" :key="product.id" :value="product.id">
              {{ product.name }}
            </option>
          </select>
          <div class="invalid-feedback">Product is required</div>
        </div>

        <!-- Form Buttons -->
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
import { useToast } from "@/composables/useToast";
import { useGlobalStore } from "@/stores/global";
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";

// Get toast functionality from the composable
const { toasts, showNotification, removeToast } = useToast();
// Initialize the global store immediately
const globalStore = useGlobalStore();

const state = reactive({
  colors: [],
  isLoading: false,
  error: null,
});

// Data collections
const products = ref([]);

// UI state
const searchQuery = ref("");
const showModal = ref(false);
const isEditMode = ref(false);
const currentColorId = ref(null);
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

// New color form data
const newColor = reactive({
  name: "",
  code: "#000000",
  product_id: "",
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

// Helper function to find an item by ID with type-safe comparison
const findById = (collection, id) => {
  if (!id || !collection || !collection.length) return null;

  // Convert both to strings for comparison to handle string/number mismatches
  const stringId = String(id);
  return collection.find((item) => String(item.id) === stringId);
};

// Helper function to get product name
const getProductName = (productId) => {
  if (!productId) return "Unknown";

  // First try to find the product in our reference data
  const product = findById(products.value, productId);
  if (product) {
    return product.name;
  }

  // If not found, get the product directly from the color's product object
  const colorWithThisProduct = state.colors.find(
    (c) => c.product_id === productId || (c.product && c.product.id === productId)
  );

  if (colorWithThisProduct && colorWithThisProduct.product) {
    return colorWithThisProduct.product.name;
  }

  return "Unknown";
};

// Data fetching functions
const fetchColors = async () => {
  state.isLoading = true;
  state.error = null;
  try {
    // FIX: Added authorization headers to the GET request
    const res = await axios.get("/api/product-colors", globalStore.getAxiosHeader());

    if (res.data.result && Array.isArray(res.data.data)) {
      state.colors = res.data.data;
      console.log("Fetched colors:", state.colors);
    } else {
      state.error = res.data.message || "Failed to fetch product colors";
      console.error("API error when fetching colors:", res.data);
    }
  } catch (error) {
    console.error("Error fetching product colors:", error);
    state.error = "An error occurred while fetching product colors.";
    await globalStore.onCheckError(error); // FIX: Added error handling with global store
  }
  state.isLoading = false;
};

const fetchProducts = async () => {
  try {
    // FIX: Added authorization headers to the GET request
    const res = await axios.get("/api/products", globalStore.getAxiosHeader());
    if (res.data.result && Array.isArray(res.data.data)) {
      products.value = res.data.data;
      console.log("Fetched products for color selection:", products.value);
    } else {
      console.error("Failed to fetch products for color selection:", res.data);
      showNotification("error", "Error", "Failed to fetch products");
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    showNotification("error", "Error", "Failed to fetch products");
    await globalStore.onCheckError(error); // FIX: Added error handling with global store
  }
};

// CRUD operations for colors
const createColor = async () => {
  isSubmitting.value = true;
  modalMessage.value = "";

  try {
    const colorData = {
      name: newColor.name,
      code: newColor.code,
      product_id: newColor.product_id,
    };

    const res = await axios.post(
      `/api/product-colors`,
      colorData,
      globalStore.getAxiosHeader()
    );

    if (res.data.result) {
      await fetchColors();
      closeModal();
      resetColorForm();
      showNotification("success", "Success", "Color created successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to create color";
    }
  } catch (error) {
    console.error("Error creating color:", error);
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        modalMessage.value = error.response.data.message;
      } else if (error.response.data.errors) {
        // Format validation errors
        const errors = Object.values(error.response.data.errors).flat();
        modalMessage.value = errors.join("\n");
      } else {
        modalMessage.value = "An error occurred while creating the color.";
      }
    } else {
      modalMessage.value = "An error occurred while creating the color.";
    }

    await globalStore.onCheckError(error);
  }

  isSubmitting.value = false;
};

const updateColor = async () => {
  isSubmitting.value = true;
  modalMessage.value = "";

  try {
    const colorData = {
      name: newColor.name,
      code: newColor.code,
      product_id: newColor.product_id,
    };

    const res = await axios.put(
      `/api/product-colors/${currentColorId.value}`,
      colorData,
      globalStore.getAxiosHeader()
    );

    if (res.data.result) {
      await fetchColors();
      closeModal();
      resetColorForm();
      showNotification("success", "Success", "Color updated successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to update color";
    }
  } catch (error) {
    console.error("Error updating color:", error);
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        modalMessage.value = error.response.data.message;
      } else if (error.response.data.errors) {
        // Format validation errors
        const errors = Object.values(error.response.data.errors).flat();
        modalMessage.value = errors.join("\n");
      } else {
        modalMessage.value = "An error occurred while updating the color.";
      }
    } else {
      modalMessage.value = "An error occurred while updating the color.";
    }

    await globalStore.onCheckError(error);
  }

  isSubmitting.value = false;
};

// Delete color function
const performDeleteColor = async (colorId) => {
  try {
    const res = await axios.delete(
      `/api/product-colors/${colorId}`,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      state.colors = state.colors.filter((c) => c.id !== colorId);
      await fetchColors();
      showNotification("success", "Success", "Color deleted successfully!");
    } else {
      showNotification("error", "Error", res.data.message || "Failed to delete color");
    }
  } catch (error) {
    showNotification("error", "Error", "An error occurred while deleting the color.");
    await globalStore.onCheckError(error);
  }
};

// Show delete confirmation
const deleteColor = (colorId) => {
  showConfirmation(
    "Delete Color",
    "Are you sure you want to delete this color?",
    performDeleteColor,
    colorId
  );
};

// Modal controls
const openModal = () => {
  resetColorForm();
  isEditMode.value = false;
  showModal.value = true;
};

const editColor = async (colorId) => {
  try {
    state.isLoading = true;

    // Find color in existing data or fetch if needed
    let color = state.colors.find((c) => String(c.id) === String(colorId));

    if (!color) {
      // Fetch the color data if not in the list
      const response = await axios.get(
        `/api/product-colors/${colorId}`,
        globalStore.getAxiosHeader()
      );

      if (response.data.result && response.data.data) {
        color = response.data.data;
      } else {
        showNotification("error", "Error", "Failed to fetch color details");
        state.isLoading = false;
        return;
      }
    }

    console.log("Editing color:", color);

    // Set color fields
    newColor.name = color.name || "";
    newColor.code = color.code || "#000000";

    // Handle product_id as either direct ID or nested product.id
    if (color.product_id) {
      newColor.product_id = String(color.product_id);
    } else if (color.product && color.product.id) {
      newColor.product_id = String(color.product.id);
    } else {
      newColor.product_id = "";
    }

    currentColorId.value = colorId;
    isEditMode.value = true;
    showModal.value = true;
  } catch (error) {
    console.error("Error fetching color details:", error);
    showNotification("error", "Error", "An error occurred while fetching color details");
    await globalStore.onCheckError(error); // FIX: Added error handling with global store
  } finally {
    state.isLoading = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  resetColorForm();
  modalMessage.value = "";
};

const resetColorForm = () => {
  newColor.name = "";
  newColor.code = "#000000";
  newColor.product_id = "";
  currentColorId.value = null;
};

const handleSubmit = async (event) => {
  event.preventDefault();

  // Check form validity
  if (!event.target.checkValidity()) {
    event.stopPropagation();
    event.target.classList.add("was-validated");
    return;
  }

  // Validate required fields
  if (!newColor.name.trim()) {
    modalMessage.value = "Color name is required";
    return;
  }

  if (
    !newColor.code.trim() ||
    !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(newColor.code)
  ) {
    modalMessage.value = "Valid color code is required (e.g., #FF5733)";
    return;
  }

  if (!newColor.product_id) {
    modalMessage.value = "Product is required";
    return;
  }

  if (isEditMode.value) {
    await updateColor();
  } else {
    await createColor();
  }
};

const filteredColors = computed(() => {
  return state.colors.filter(
    (color) =>
      color.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      color.code?.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Initialize data on component mount
onMounted(async () => {
  try {
    console.log("Component mounted, fetching data...");

    // Fetch products first to ensure we have reference data
    await fetchProducts();

    // Then fetch colors
    await fetchColors();

    console.log("Data loading complete.");
  } catch (error) {
    console.error("Error during initialization:", error);
    showNotification("error", "Error", "Failed to initialize the component");
    await globalStore.onCheckError(error); // FIX: Added error handling with global store
  }
});
</script>

<style scoped>
.color-swatch {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  display: inline-block;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.form-control-color {
  width: 50px;
  height: 38px;
}

.color-form .form-label {
  font-weight: 500;
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
