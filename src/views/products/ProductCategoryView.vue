<template>
  <div class="mb-9">
    <div class="row g-2 mb-4">
      <div class="col-auto">
        <h2 class="mb-0">Product Categories</h2>
      </div>
    </div>
    <div id="categories">
      <div class="mb-4">
        <div class="row g-3 justify-content-between">
          <div class="col-auto">
            <div class="search-box">
              <input
                v-model="searchQuery"
                class="form-control search-input search"
                type="search"
                placeholder="Search categories"
              />
            </div>
          </div>
          <div class="col-auto">
            <button class="btn btn-primary" @click="openModal">
              <span class="fas fa-plus me-2"></span>Add Category
            </button>
          </div>
        </div>
      </div>
      <div v-if="state.isCategoryLoading" class="text-center">Loading...</div>
      <div v-else-if="state.categoryError" class="text-center text-danger">
        {{ state.categoryError }}
      </div>
      <div v-else class="table-responsive">
        <table class="table table-sm fs-9 mb-0">
          <thead>
            <tr>
              <th class="align-middle ps-0">#</th>
              <th class="align-middle">Category Name</th>
              <th class="align-middle text-end">Created At</th>
              <th class="align-middle text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredCategories.length === 0">
              <td colspan="4" class="text-center">No category found</td>
            </tr>
            <tr v-else v-for="(category, index) in filteredCategories" :key="category.id">
              <td class="align-middle ps-0">{{ index + 1 }}</td>
              <td class="align-middle">{{ category.name }}</td>
              <td class="align-middle text-end">{{ category.created_at }}</td>
              <td class="align-middle text-end">
                <button
                  class="btn btn-sm btn-primary me-2"
                  @click="editCategory(category.id)"
                >
                  <span class="fas fa-edit me-1"></span>Edit
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  @click="deleteCategory(category.id)"
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

  <!-- Category Form Modal -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal-content">
      <h4>{{ isEditMode ? "Edit" : "Create" }} Category</h4>
      <div v-if="modalMessage" class="alert alert-danger">
        {{ modalMessage }}
      </div>
      <form class="row g-3 needs-validation" novalidate @submit.prevent="handleSubmit">
        <div class="col-md-12">
          <label class="form-label" for="categoryName">Category Name</label>
          <input
            v-model="newCategory.name"
            class="form-control"
            id="categoryName"
            type="text"
            required
          />
          <div class="invalid-feedback">Category name is required</div>
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
import { useGlobalStore } from "@/stores/global";
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";

// State for categories
const state = reactive({
  productCategories: [],
  isCategoryLoading: false,
  categoryError: null,
});

// Form + Modal States
const searchQuery = ref("");
const showModal = ref(false);
const isEditMode = ref(false);
const currentCategoryId = ref(null);
const isSubmitting = ref(false);
const modalMessage = ref("");

// Toast notifications state
const toasts = ref([]);
let toastIdCounter = 0;

// Confirmation modal state
const confirmationModal = reactive({
  show: false,
  title: "Confirm Action",
  message: "Are you sure you want to proceed?",
  action: null,
  actionParams: null,
});

const newCategory = reactive({
  name: "",
});

// Show toast notification
const showNotification = (type, title, message) => {
  const id = toastIdCounter++;
  let icon = "fas fa-bell";

  // Set appropriate icon based on notification type
  switch (type) {
    case "success":
      icon = "fas fa-check-circle";
      break;
    case "error":
      icon = "fas fa-times-circle";
      break;
    case "warning":
      icon = "fas fa-exclamation-triangle";
      break;
    case "info":
      icon = "fas fa-info-circle";
      break;
  }

  // Add toast to the array
  toasts.value.push({
    id,
    type,
    title,
    message,
    icon,
  });

  // Auto-remove toast after 3 seconds
  setTimeout(() => {
    removeToast(id);
  }, 3000);
};

// Remove a specific toast by ID
const removeToast = (id) => {
  const index = toasts.value.findIndex((toast) => toast.id === id);
  if (index !== -1) {
    toasts.value.splice(index, 1);
  }
};

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

// Fetch product categories (same style as fetchBrands)
const fetchProductCategories = async () => {
  state.isCategoryLoading = true;
  state.categoryError = null;
  const globalStore = useGlobalStore();

  try {
    const res = await axios.get("/api/product-categories",  globalStore.getAxiosHeader());
    if (res.data.result && Array.isArray(res.data.data)) {
      // Store only `name` and `id` for each category
      state.productCategories = res.data.data.map((category) => ({
        id: category.id,
        name: category.name,
        created_at: category.created_at
      }));
    } else {
      state.categoryError = res.data.message || "Failed to fetch categories.";
    }
  } catch (error) {
    state.categoryError = "An error occurred while fetching categories.";
  }
  state.isCategoryLoading = false;
};

// Open modal to add or edit category
const openModal = () => {
  resetCategoryForm();
  isEditMode.value = false;
  showModal.value = true;
};

// Edit category function
const editCategory = (categoryId) => {
  const category = state.productCategories.find((p) => p.id === categoryId);
  if (category) {
    newCategory.name = category.name;
    currentCategoryId.value = categoryId;
    isEditMode.value = true;
    showModal.value = true;
  }
};

// Delete category function
const performDeleteCategory = async (categoryId) => {
  const globalStore = useGlobalStore();
  try {
    const res = await axios.delete(
      `/api/product-categories/${categoryId}`,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      state.productCategories = state.productCategories.filter(
        (p) => p.id !== categoryId
      );
      await fetchProductCategories();
      showNotification("success", "Success", "Category deleted successfully!");
    } else {
      showNotification("error", "Error", res.data.message || "Failed to delete category");
    }
  } catch (error) {
    showNotification("error", "Error", "An error occurred while deleting the category.");
  }
};

// Show delete confirmation
const deleteCategory = (categoryId) => {
  showConfirmation(
    "Delete Category",
    "Are you sure you want to delete this category?",
    performDeleteCategory,
    categoryId
  );
};

// Close modal
const closeModal = () => {
  showModal.value = false;
  resetCategoryForm();
  modalMessage.value = "";
};

// Reset category form
const resetCategoryForm = () => {
  newCategory.name = "";
  currentCategoryId.value = null;
};

// Handle submit for creating/updating categories
const handleSubmit = async (event) => {
  event.preventDefault();
  if (!newCategory.name.trim()) {
    modalMessage.value = "Category name is required";
    return;
  }
  if (isEditMode.value) {
    await updateCategory();
  } else {
    await createCategory();
  }
};

// Create new category
const createCategory = async () => {
  const globalStore = useGlobalStore();
  isSubmitting.value = true;
  modalMessage.value = "";
  try {
    const res = await axios.post(
      "/api/product-categories",
      { name: newCategory.name },
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      state.productCategories.push(res.data.data);
      await fetchProductCategories();
      closeModal();
      resetCategoryForm();
      showNotification("success", "Success", "Category created successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to create category";
    }
  } catch (error) {
    modalMessage.value = "An error occurred while creating the category.";
  }
  isSubmitting.value = false;
};

// Update category
const updateCategory = async () => {
  const globalStore = useGlobalStore();
  isSubmitting.value = true;
  modalMessage.value = "";
  try {
    const res = await axios.put(
      `/api/product-categories/${currentCategoryId.value}`,
      { name: newCategory.name },
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      const updatedCategory = res.data.data;
      const index = state.productCategories.findIndex((t) => t.id === updatedCategory.id);
      state.productCategories.splice(index, 1, updatedCategory);
      await fetchProductCategories();
      closeModal();
      resetCategoryForm();
      showNotification("success", "Success", "Category updated successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to update category";
    }
  } catch (error) {
    modalMessage.value = "An error occurred while updating the category.";
  }
  isSubmitting.value = false;
};

// Filter categories based on search query
const filteredCategories = computed(() => {
  return state.productCategories.filter((category) => {
    const categoryName = category.name || ""; // Default to empty string
    return categoryName.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
});

// Fetch categories on component mount
onMounted(fetchProductCategories);
</script>

<style scoped>
/* Modal Overlay Styles */
.modal-overlay,
.notification-modal-overlay,
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
  z-index: 1000;
}

/* Modal Content Styles */
.modal-content,
.notification-modal-content,
.confirmation-modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  position: relative;
}

/* Toast Notification Styles */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 350px;
}

.toast-notification {
  display: flex;
  align-items: flex-start;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  margin-bottom: 10px;
  padding: 15px;
  position: relative;
  overflow: hidden;
  min-width: 300px;
}

.toast-notification:before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
}

.toast-notification.success {
  border-left: 4px solid #28a745;
}

.toast-notification.error {
  border-left: 4px solid #dc3545;
}

.toast-notification.warning {
  border-left: 4px solid #ffc107;
}

.toast-notification.info {
  border-left: 4px solid #17a2b8;
}

.toast-icon {
  margin-right: 12px;
  font-size: 20px;
  display: flex;
  align-items: center;
}

.toast-notification.success .toast-icon {
  color: #28a745;
}

.toast-notification.error .toast-icon {
  color: #dc3545;
}

.toast-notification.warning .toast-icon {
  color: #ffc107;
}

.toast-notification.info .toast-icon {
  color: #17a2b8;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-weight: 600;
  margin-bottom: 5px;
}

.toast-message {
  font-size: 14px;
  color: #6c757d;
}

.toast-close {
  background: none;
  border: none;
  color: #adb5bd;
  cursor: pointer;
  font-size: 18px;
  margin-left: 5px;
  padding: 0;
}

.toast-close:hover {
  color: #495057;
}

/* Toast Animation */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Confirmation Modal Styles */
.confirmation-modal-content {
  max-width: 400px;
}

.confirmation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px 0;
}

.confirmation-body {
  padding: 10px 20px 15px;
}

.confirmation-footer {
  padding: 15px;
  background-color: #f8f9fa;
  border-top: 1px solid #eee;
  text-align: right;
}

.confirmation-icon {
  font-size: 24px;
  margin-right: 10px;
}

.confirmation-icon.warning {
  color: #ffc107;
}

/* Close Button Styles */
.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
}

.close-btn:hover {
  color: #343a40;
}
</style>
