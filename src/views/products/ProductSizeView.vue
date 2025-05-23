<template>
  <div class="mb-9">
    <div class="row g-2 mb-4">
      <div class="col-auto">
        <h2 class="mb-0">Product Sizes</h2>
      </div>
    </div>
    <div id="product-sizes">
      <div class="mb-4">
        <div class="row g-3 justify-content-between">
          <div class="col-auto">
            <div class="search-box">
              <input
                v-model="searchQuery"
                class="form-control search-input search"
                type="search"
                placeholder="Search sizes"
              />
            </div>
          </div>
          <div class="col-auto">
            <button class="btn btn-primary" @click="openModal">
              <span class="fas fa-plus me-2"></span>Add Size
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
              <th class="align-middle">Size</th>
              <th class="align-middle">Product</th>
              <th class="align-middle text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredSizes.length === 0">
              <td colspan="4" class="text-center">No sizes found</td>
            </tr>
            <tr v-else v-for="(size, index) in filteredSizes" :key="size.id">
              <td class="align-middle ps-0">{{ index + 1 }}</td>
              <td class="align-middle">
                <span class="size-label">{{ size.size }}</span>
              </td>
              <td class="align-middle">
                {{ getProductName(size.product_id) }}
              </td>
              <td class="align-middle text-end">
                <button class="btn btn-sm btn-primary me-2" @click="editSize(size.id)">
                  <span class="fas fa-edit me-1"></span>Edit
                </button>
                <button class="btn btn-sm btn-danger" @click="deleteSize(size.id)">
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
    <div class="modal-content size-form">
      <h4>{{ isEditMode ? "Edit" : "Create" }} Product Size</h4>
      <div v-if="modalMessage" class="alert alert-danger">
        {{ modalMessage }}
      </div>
      <form class="row g-3 needs-validation" novalidate @submit.prevent="handleSubmit">
        <!-- Size Information -->
        <div class="col-md-12">
          <label class="form-label" for="sizeValue">Size</label>
          <input
            v-model="newSize.size"
            class="form-control"
            id="sizeValue"
            type="text"
            placeholder="XS, S, M, L, XL, etc."
            required
          />
          <div class="invalid-feedback">Size value is required</div>
        </div>

        <!-- Product Selection -->
        <div class="col-md-12">
          <label class="form-label" for="productId">Product</label>
          <select
            v-model="newSize.product_id"
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
import "@/assets/css/toast-styles.css";

import { useToast } from "@/composables/useToast";
import { useGlobalStore } from "@/stores/global";
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";

const { toasts, showNotification, removeToast } = useToast();
const globalStore = useGlobalStore();
const state = reactive({
  sizes: [],
  isLoading: false,
  error: null,
});

const products = ref([]);
const searchQuery = ref("");
const showModal = ref(false);
const isEditMode = ref(false);
const currentSizeId = ref(null);
const isSubmitting = ref(false);
const modalMessage = ref("");

const confirmationModal = reactive({
  show: false,
  title: "Confirm Action",
  message: "Are you sure you want to proceed?",
  action: null,
  actionParams: null,
});

const newSize = reactive({
  size: "",
  product_id: "",
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

const findById = (collection, id) => {
  if (!id || !collection || !collection.length) return null;
  const stringId = String(id);
  return collection.find((item) => String(item.id) === stringId);
};

const getProductName = (productId) => {
  if (!productId) return "Unknown";
  const product = findById(products.value, productId);
  if (product) {
    return product.name;
  }
  const sizeWithThisProduct = state.sizes.find(
    (c) => c.product_id === productId || (c.product && c.product.id === productId)
  );
  if (sizeWithThisProduct && sizeWithThisProduct.product) {
    return sizeWithThisProduct.product.name;
  }
  return "Unknown";
};

const fetchSizes = async () => {
  state.isLoading = true;
  state.error = null;
  try {
    const res = await axios.get("/api/product-sizes", globalStore.getAxiosHeader());
    if (res.data.result && Array.isArray(res.data.data)) {
      state.sizes = res.data.data;
    } else {
      state.error = res.data.message || "Failed to fetch product sizes";
      console.error("API error when fetching sizes:", res.data);
    }
  } catch (error) {
    console.error("Error fetching product sizes:", error);
    state.error = "An error occurred while fetching product sizes.";
    await globalStore.onCheckError(error);
  }
  state.isLoading = false;
};

const fetchProducts = async () => {
  try {
    const res = await axios.get("/api/products", globalStore.getAxiosHeader());
    if (res.data.result && Array.isArray(res.data.data)) {
      products.value = res.data.data;
    } else {
      console.error("Failed to fetch products for size selection:", res.data);
      showNotification("error", "Error", "Failed to fetch products");
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    showNotification("error", "Error", "Failed to fetch products");
    await globalStore.onCheckError(error);
  }
};

const createSize = async () => {
  isSubmitting.value = true;
  modalMessage.value = "";
  try {
    const sizeData = {
      size: newSize.size,
      product_id: newSize.product_id,
    };
    const res = await axios.post(
      `/api/product-sizes`,
      sizeData,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      await fetchSizes();
      closeModal();
      resetSizeForm();
      showNotification("success", "Success", "Size created successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to create size";
    }
  } catch (error) {
    console.error("Error creating size:", error);
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        modalMessage.value = error.response.data.message;
      } else if (error.response.data.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        modalMessage.value = errors.join("\n");
      } else {
        modalMessage.value = "An error occurred while creating the size.";
      }
    } else {
      modalMessage.value = "An error occurred while creating the size.";
    }
    await globalStore.onCheckError(error);
  }
  isSubmitting.value = false;
};

const updateSize = async () => {
  isSubmitting.value = true;
  modalMessage.value = "";
  try {
    const sizeData = {
      size: newSize.size,
      product_id: newSize.product_id,
    };
    const res = await axios.put(
      `/api/product-sizes/${currentSizeId.value}`,
      sizeData,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      await fetchSizes();
      closeModal();
      resetSizeForm();
      showNotification("success", "Success", "Size updated successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to update size";
    }
  } catch (error) {
    console.error("Error updating size:", error);
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        modalMessage.value = error.response.data.message;
      } else if (error.response.data.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        modalMessage.value = errors.join("\n");
      } else {
        modalMessage.value = "An error occurred while updating the size.";
      }
    } else {
      modalMessage.value = "An error occurred while updating the size.";
    }
    await globalStore.onCheckError(error);
  }

  isSubmitting.value = false;
};

const performDeleteSize = async (sizeId) => {
  try {
    const res = await axios.delete(
      `/api/product-sizes/${sizeId}`,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      state.sizes = state.sizes.filter((s) => s.id !== sizeId);
      await fetchSizes();
      showNotification("success", "Success", "Size deleted successfully!");
    } else {
      showNotification("error", "Error", res.data.message || "Failed to delete size");
    }
  } catch (error) {
    showNotification("error", "Error", "An error occurred while deleting the size.");
    await globalStore.onCheckError(error);
  }
};

const deleteSize = (sizeId) => {
  showConfirmation(
    "Delete Size",
    "Are you sure you want to delete this size?",
    performDeleteSize,
    sizeId
  );
};

const openModal = () => {
  resetSizeForm();
  isEditMode.value = false;
  showModal.value = true;
};

const editSize = async (sizeId) => {
  try {
    state.isLoading = true;
    let size = state.sizes.find((s) => String(s.id) === String(sizeId));
    if (!size) {
      const response = await axios.get(
        `/api/product-sizes/${sizeId}`,
        globalStore.getAxiosHeader()
      );
      if (response.data.result && response.data.data) {
        size = response.data.data;
      } else {
        showNotification("error", "Error", "Failed to fetch size details");
        state.isLoading = false;
        return;
      }
    }
    newSize.size = size.size || "";
    if (size.product_id) {
      newSize.product_id = String(size.product_id);
    } else if (size.product && size.product.id) {
      newSize.product_id = String(size.product.id);
    } else {
      newSize.product_id = "";
    }
    currentSizeId.value = sizeId;
    isEditMode.value = true;
    showModal.value = true;
  } catch (error) {
    showNotification("error", "Error", "An error occurred while fetching size details");
    await globalStore.onCheckError(error);
  } finally {
    state.isLoading = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  resetSizeForm();
  modalMessage.value = "";
};

const resetSizeForm = () => {
  newSize.size = "";
  newSize.product_id = "";
  currentSizeId.value = null;
};

const handleSubmit = async (event) => {
  event.preventDefault();
  if (!event.target.checkValidity()) {
    event.stopPropagation();
    event.target.classList.add("was-validated");
    return;
  }
  if (!newSize.size.trim()) {
    modalMessage.value = "Size value is required";
    return;
  }
  if (!newSize.product_id) {
    modalMessage.value = "Product is required";
    return;
  }
  if (isEditMode.value) {
    await updateSize();
  } else {
    await createSize();
  }
};

const filteredSizes = computed(() => {
  return state.sizes.filter(
    (size) =>
      size.size?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      getProductName(size.product_id)
        ?.toLowerCase()
        .includes(searchQuery.value.toLowerCase())
  );
});
onMounted(async () => {
  try {
    await fetchProducts();
    await fetchSizes();
  } catch (error) {
    console.error("Error during initialization:", error);
    showNotification("error", "Error", "Failed to initialize the component");
    await globalStore.onCheckError(error);
  }
});
</script>
