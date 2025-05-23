<template>
  <div class="user-management">
    <!-- Header Section -->
    <div class="page-header">
      <div class="container">
        <div class="row g-3 align-items-center">
          <div class="col-md-6">
            <h2 class="mb-0">User Management</h2>
          </div>
          <div class="col-md-6 text-md-end">
            <button class="btn btn-light btn-add-user" @click="openModal()">
              <i class="fas fa-plus me-2"></i>Add User
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <!-- Filter Section -->
      <div class="filters-section">
        <div class="d-flex flex-wrap gap-3 align-items-center justify-content-between">
          <div class="search-box">
            <i class="fas fa-search search-icon"></i>
            <input
              v-model="filters.search"
              class="form-control"
              type="search"
              placeholder="Search users..."
              @input="onSearchInput"
            />
          </div>
          <div class="d-flex flex-wrap gap-2">
            <select
              v-model="filters.role_id"
              class="form-select filter-select"
              @change="filterUsers"
            >
              <option value="">All Roles</option>
              <option v-for="role in roles" :key="role.id" :value="role.id">
                {{ role.name }}
              </option>
            </select>
            <select
              v-model="filters.gender"
              class="form-select filter-select"
              @change="filterUsers"
            >
              <option value="">All Genders</option>
              <option value="1">Male</option>
              <option value="2">Female</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="state.isLoading" class="loading-state">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Loading users...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="state.error" class="error-state">
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ state.error }}
        </div>
        <button class="btn btn-primary mt-3" @click="fetchUsers">
          <i class="fas fa-sync me-2"></i>Try Again
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="users.length === 0" class="empty-state">
        <i class="fas fa-users fa-3x text-muted mb-3"></i>
        <h4>No Users Found</h4>
        <p class="text-muted">
          {{
            filters.search
              ? "No users match your search criteria."
              : "There are no users in the system yet."
          }}
        </p>
        <button
          v-if="filters.search || filters.role_id || filters.gender_text"
          class="btn btn-outline-secondary mt-2"
          @click="resetFilters"
        >
          Clear Filters
        </button>
      </div>

      <!-- User Cards -->
      <div v-else class="row g-4">
        <div v-for="user in users" :key="user.id" class="col-md-6 col-lg-4">
          <div class="user-card" :class="{ 'card-locked': user.is_lock === 'lock' }">
            <div class="user-header">
              <div class="user-avatar">
                <img :src="getImageUrl(user.image)" :alt="user.first_name" />
              </div>
              <div class="user-info">
                <div class="user-name">{{ user.first_name }} {{ user.last_name }}</div>
                <div class="mt-1">
                  <span
                    v-for="role in user.roles"
                    :key="role.id"
                    class="badge me-1"
                    :class="getRoleBadgeClass(role.id)"
                  >
                    {{ role.name }}
                  </span>
                  <span
                    class="badge"
                    :class="user.is_lock === 'lock' ? 'user-locked' : 'user-active'"
                  >
                    {{ user.is_lock === "lock" ? "Locked" : "Active" }}
                  </span>
                </div>
              </div>
              <div class="user-actions">
                <div class="dropdown">
                  <button class="btn btn-link" data-bs-toggle="dropdown">
                    <i class="fas fa-ellipsis-v"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                      <button class="dropdown-item" @click="editUser(user.id)">
                        <i class="fas fa-edit me-2"></i>Edit
                      </button>
                    </li>
                    <li>
                      <button
                        class="dropdown-item"
                        @click="toggleLockUser(user.id, user.is_lock)"
                      >
                        <i
                          :class="
                            user.is_lock === 'lock'
                              ? 'fas fa-unlock me-2'
                              : 'fas fa-lock me-2'
                          "
                        ></i>
                        {{ user.is_lock === "lock" ? "Unlock" : "Lock" }}
                      </button>
                    </li>
                    <li>
                      <button
                        class="dropdown-item text-danger"
                        @click="confirmDelete(user.id)"
                      >
                        <i class="fas fa-trash-alt me-2"></i>Delete
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="user-details">
              <div class="detail-item">
                <i class="fas fa-envelope"></i>
                <span class="ms-2">{{ user.email }}</span>
              </div>
              <div v-if="user.phone" class="detail-item">
                <i class="fas fa-phone"></i>
                <span class="ms-2">{{ user.phone }}</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-venus-mars"></i>
                <span class="ms-2">{{ user.gender_text }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.last_page > 1" class="d-flex justify-content-center mt-4">
        <nav>
          <ul class="pagination">
            <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
              <button class="page-link" @click="changePage(1)">First</button>
            </li>
            <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
              <button class="page-link" @click="changePage(pagination.current_page - 1)">
                Prev
              </button>
            </li>

            <li
              v-for="page in displayedPages"
              :key="page"
              class="page-item"
              :class="{ active: pagination.current_page === page }"
            >
              <button class="page-link" @click="changePage(page)">{{ page }}</button>
            </li>

            <li
              class="page-item"
              :class="{ disabled: pagination.current_page === pagination.last_page }"
            >
              <button class="page-link" @click="changePage(pagination.current_page + 1)">
                Next
              </button>
            </li>
            <li
              class="page-item"
              :class="{ disabled: pagination.current_page === pagination.last_page }"
            >
              <button class="page-link" @click="changePage(pagination.last_page)">
                Last
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- User Form Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content animate-modal">
        <div class="modal-header">
          <h4>
            <i
              :class="isEditMode ? 'fas fa-user-edit me-2' : 'fas fa-user-plus me-2'"
            ></i>
            {{ isEditMode ? "Edit User" : "Add New User" }}
          </h4>
          <button class="btn-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div v-if="modalMessage" class="alert alert-danger mx-3 mt-3">
          {{ modalMessage }}
        </div>

        <div class="modal-body">
          <form
            id="userForm"
            class="row g-3 needs-validation"
            novalidate
            @submit.prevent="handleSubmit"
          >
            <!-- Personal Information -->
            <div class="col-md-6">
              <label for="firstName" class="form-label">First Name</label>
              <input
                v-model="userForm.first_name"
                type="text"
                class="form-control"
                id="firstName"
                required
              />
              <div class="invalid-feedback">First name is required</div>
            </div>

            <div class="col-md-6">
              <label for="lastName" class="form-label">Last Name</label>
              <input
                v-model="userForm.last_name"
                type="text"
                class="form-control"
                id="lastName"
                required
              />
              <div class="invalid-feedback">Last name is required</div>
            </div>

            <div class="col-md-6">
              <label for="email" class="form-label">Email</label>
              <input
                v-model="userForm.email"
                type="email"
                class="form-control"
                id="email"
                required
              />
              <div class="invalid-feedback">Valid email is required</div>
            </div>

            <div class="col-md-6">
              <label for="phone" class="form-label">Phone</label>
              <input
                v-model="userForm.phone"
                type="text"
                class="form-control"
                id="phone"
              />
            </div>

            <div class="col-md-6">
              <label for="gender" class="form-label">Gender</label>
              <select v-model="userForm.gender" class="form-select" id="gender">
                <option value="">Select Gender</option>
                <option value="1">Male</option>
                <option value="2">Female</option>
              </select>
            </div>

            <div class="col-md-6">
              <label for="roleId" class="form-label">Role</label>
              <select v-model="userForm.role_id" class="form-select" id="roleId" required>
                <option value="">Select Role</option>
                <option v-for="role in roles" :key="role.id" :value="role.id">
                  {{ role.name }}
                </option>
              </select>
              <div class="invalid-feedback">Role is required</div>
            </div>

            <!-- Password Fields - Only required for new users -->
            <div v-if="!isEditMode || showPasswordFields" class="col-12">
              <div class="row g-3">
                <div class="col-md-6">
                  <label for="password" class="form-label">Password</label>
                  <input
                    v-model="userForm.password"
                    type="password"
                    class="form-control"
                    id="password"
                    :required="!isEditMode"
                    minlength="8"
                  />
                  <div class="invalid-feedback">
                    Password must be at least 8 characters
                  </div>
                </div>

                <div class="col-md-6">
                  <label for="passwordConfirmation" class="form-label"
                    >Confirm Password</label
                  >
                  <input
                    v-model="userForm.password_confirmation"
                    type="password"
                    class="form-control"
                    id="passwordConfirmation"
                    :required="!isEditMode"
                  />
                  <div class="invalid-feedback">Passwords must match</div>
                </div>
              </div>
            </div>

            <!-- Password Toggle for Edit Mode -->
            <div v-if="isEditMode" class="col-12">
              <div class="form-check">
                <input
                  v-model="showPasswordFields"
                  class="form-check-input"
                  type="checkbox"
                  id="changePassword"
                />
                <label class="form-check-label" for="changePassword">
                  Change Password
                </label>
              </div>
            </div>

            <!-- Profile Image -->
            <div class="col-12">
              <label for="profileImage" class="form-label">Profile Image</label>
              <input
                type="file"
                class="form-control"
                id="profileImage"
                @change="handleImageUpload"
                accept="image/png,image/jpeg"
              />
              <div class="form-text">Max file size: 2MB. Formats: JPG, PNG</div>
            </div>

            <!-- Preview Image -->
            <div v-if="imagePreview" class="col-12">
              <div class="d-flex align-items-center mt-2">
                <img
                  :src="imagePreview"
                  alt="Preview"
                  class="me-3"
                  style="width: 60px; height: 60px; object-fit: cover; border-radius: 50%"
                />
                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger"
                  @click="removeImage"
                >
                  <i class="fas fa-times me-1"></i>Remove
                </button>
              </div>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Cancel</button>
          <button
            class="btn btn-primary"
            type="submit"
            form="userForm"
            :disabled="isSubmitting"
          >
            <i
              :class="
                isSubmitting
                  ? 'fas fa-spinner fa-spin me-1'
                  : isEditMode
                  ? 'fas fa-save me-1'
                  : 'fas fa-plus me-1'
              "
            ></i>
            {{
              isSubmitting ? "Processing..." : isEditMode ? "Update User" : "Create User"
            }}
          </button>
        </div>
      </div>
    </div>

    <!-- Confirmation Dialog for Delete -->
    <div v-if="confirmationDialog.show" class="modal-overlay">
      <div class="modal-content confirm-dialog animate-modal">
        <div class="modal-header">
          <h4 class="text-danger">
            <i class="fas fa-exclamation-triangle me-2"></i>
            {{ confirmationDialog.title }}
          </h4>
          <button class="btn-close" @click="closeConfirmDialog">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>{{ confirmationDialog.message }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeConfirmDialog">Cancel</button>
          <button class="btn btn-danger" @click="confirmAction" :disabled="isSubmitting">
            <i
              :class="
                isSubmitting ? 'fas fa-spinner fa-spin me-1' : 'fas fa-trash-alt me-1'
              "
            ></i>
            {{ isSubmitting ? "Processing..." : "Delete" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div class="toast-container position-fixed top-0 end-0 p-3">
      <transition-group name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast show"
          :class="'toast-' + toast.type"
          role="alert"
        >
          <div class="toast-header">
            <i
              :class="
                toast.type === 'success'
                  ? 'fas fa-check-circle text-success me-2'
                  : 'fas fa-exclamation-circle text-danger me-2'
              "
            ></i>
            <strong class="me-auto">{{ toast.title }}</strong>
            <button
              type="button"
              class="btn-close"
              @click="removeToast(toast.id)"
            ></button>
          </div>
          <div class="toast-body">{{ toast.message }}</div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { useGlobalStore } from "@/stores/global";
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";

// Initialize global store
const globalStore = useGlobalStore();

// State management
const state = reactive({
  isLoading: false,
  error: null,
});

// Data collections
const users = ref([]);
const roles = ref([]);
const pagination = reactive({
  current_page: 1,
  per_page: 9,
  total: 0,
  last_page: 0,
});

// UI state
const showModal = ref(false);
const isEditMode = ref(false);
const currentUserId = ref(null);
const isSubmitting = ref(false);
const modalMessage = ref("");
const imagePreview = ref("");
const showPasswordFields = ref(false);
const filters = reactive({
  search: "",
  role_id: "",
  gender: "",
  page: 1,
  per_page: 9,
});

// Toast notifications
const toasts = ref([]);
let nextToastId = 1;

const showNotification = (type, title, message) => {
  const id = nextToastId++;
  toasts.value.push({ id, type, title, message });

  // Auto-remove after 5 seconds
  setTimeout(() => {
    removeToast(id);
  }, 5000);
};

const removeToast = (id) => {
  toasts.value = toasts.value.filter((toast) => toast.id !== id);
};

// Confirmation dialog state
const confirmationDialog = reactive({
  show: false,
  title: "Confirm Delete",
  message: "Are you sure you want to delete this user? This action cannot be undone.",
  action: null,
  userId: null,
});

// User form data
const userForm = reactive({
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  gender: "",
  role_id: "",
  password: "",
  password_confirmation: "",
  image: null,
});

const getImageUrl = (imagePath) => {
  if (!imagePath) return "/images/default-avatar.png";
  if (imagePath.startsWith("http")) {
    return imagePath;
  }
  return `/storage/${imagePath}`;
};

const getRoleBadgeClass = (roleId) => {
  switch (roleId) {
    case 1:
      return "bg-danger"; // Admin
    case 2:
      return "bg-primary"; // Staff
    case 3:
      return "bg-secondary"; // User/Customer
    default:
      return "bg-secondary";
  }
};

// Computed properties
const displayedPages = computed(() => {
  const pages = [];
  const lastPage = pagination.last_page;
  const currentPage = pagination.current_page;
  pages.push(1);
  for (
    let i = Math.max(2, currentPage - 1);
    i <= Math.min(lastPage - 1, currentPage + 1);
    i++
  ) {
    pages.push(i);
  }
  if (lastPage > 1) {
    pages.push(lastPage);
  }
  return [...new Set(pages)].sort((a, b) => a - b);
});

// Data fetching functions
const fetchUsers = async () => {
  state.isLoading = true;
  state.error = null;

  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.role_id) params.append("role_id", filters.role_id);
    if (filters.gender) params.append("gender", filters.gender);
    if (filters.page) params.append("page", filters.page);
    if (filters.per_page) params.append("per_page", filters.per_page);
    const res = await axios.get(
      `/api/users?${params.toString()}`,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      users.value = res.data.data || [];
      pagination.current_page = res.data.current_page || 1;
      pagination.per_page = res.data.per_page || 9;
      pagination.total = res.data.total || 0;
      pagination.last_page = res.data.last_page || 1;
    } else {
      state.error = res.data.message || "Failed to fetch users";
      console.error("API error when fetching users:", res.data);
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    state.error = "An error occurred while fetching users.";
    await globalStore.onCheckError(error);
  }
  state.isLoading = false;
};

const fetchRoles = async () => {
  try {
    const res = await axios.get("/api/roles", globalStore.getAxiosHeader());
    if (res.data.result) {
      roles.value = res.data.data || [];
    } else {
      console.error("Failed to fetch roles:", res.data);
    }
  } catch (error) {
    console.error("Error fetching roles:", error);
    await globalStore.onCheckError(error);
  }
};

// Filter and pagination functions
const onSearchInput = () => {
  clearTimeout(onSearchInput.timer);
  onSearchInput.timer = setTimeout(() => {
    filters.page = 1;
    filterUsers();
  }, 300);
};

const filterUsers = () => {
  filters.page = 1;
  fetchUsers();
};

const resetFilters = () => {
  filters.search = "";
  filters.role_id = "";
  filters.gender = "";
  filters.page = 1;
  fetchUsers();
};

const changePage = (page) => {
  if (page < 1 || page > pagination.last_page) return;
  filters.page = page;
  fetchUsers();
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

// User CRUD operations
const createUser = async () => {
  isSubmitting.value = true;
  modalMessage.value = "";

  try {
    const formData = new FormData();
    for (const [key, value] of Object.entries(userForm)) {
      if (key === "image") {
        if (value) formData.append("image", value);
      } else if (value !== "" && value !== null) {
        formData.append(key, value);
      }
    }

    const res = await axios.post("/api/users", formData, {
      ...globalStore.getAxiosHeader(),
      headers: {
        ...globalStore.getAxiosHeader().headers,
        "Content-Type": "multipart/form-data",
      },
    });
    if (res.data.result) {
      await fetchUsers();
      closeModal();
      resetUserForm();
      showNotification("success", "Success", "User created successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to create user";
    }
  } catch (error) {
    console.error("Error creating user:", error);
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        modalMessage.value = error.response.data.message;
      } else if (error.response.data.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        modalMessage.value = errors.join("\n");
      } else {
        modalMessage.value = "An error occurred while creating the user.";
      }
    } else {
      modalMessage.value = "An error occurred while creating the user.";
    }
    await globalStore.onCheckError(error);
  }
  isSubmitting.value = false;
};

const updateUser = async () => {
  isSubmitting.value = true;
  modalMessage.value = "";

  try {
    const formData = new FormData();
    for (const [key, value] of Object.entries(userForm)) {
      if (
        !showPasswordFields.value &&
        (key === "password" || key === "password_confirmation")
      ) {
        continue;
      }
      if (key === "image") {
        if (value) formData.append("image", value);
      } else if (value !== "" && value !== null) {
        formData.append(key, value);
      }
    }
    formData.append("_method", "PUT");
    const res = await axios.post(`/api/users/update/${currentUserId.value}`, formData, {
      ...globalStore.getAxiosHeader(),
      headers: {
        ...globalStore.getAxiosHeader().headers,
        "Content-Type": "multipart/form-data",
      },
    });
    if (res.data.result) {
      await fetchUsers();
      closeModal();
      resetUserForm();
      showNotification("success", "Success", "User updated successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to update user";
    }
  } catch (error) {
    console.error("Error updating user:", error);
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        modalMessage.value = error.response.data.message;
      } else if (error.response.data.errors) {
        // Format validation errors
        const errors = Object.values(error.response.data.errors).flat();
        modalMessage.value = errors.join("\n");
      } else {
        modalMessage.value = "An error occurred while updating the user.";
      }
    } else {
      modalMessage.value = "An error occurred while updating the user.";
    }
    await globalStore.onCheckError(error);
  }
  isSubmitting.value = false;
};

const performDeleteUser = async () => {
  isSubmitting.value = true;
  try {
    const res = await axios.delete(
      `/api/users/${confirmationDialog.userId}`,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      await fetchUsers();
      showNotification("success", "Success", "User deleted successfully!");
    } else {
      showNotification("error", "Error", res.data.message || "Failed to delete user");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    showNotification("error", "Error", "An error occurred while deleting the user.");
    await globalStore.onCheckError(error);
  }
  isSubmitting.value = false;
  closeConfirmDialog();
};

const toggleLockUser = async (userId, currentLockStatus) => {
  try {
    const res = await axios.put(
      `/api/users/islock/${userId}`,
      {},
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      await fetchUsers();
      const newStatus = currentLockStatus === "lock" ? "unlocked" : "locked";
      showNotification("success", "Success", `User has been ${newStatus}!`);
    } else {
      showNotification(
        "error",
        "Error",
        res.data.message || "Failed to update user lock status"
      );
    }
  } catch (error) {
    console.error("Error toggling user lock status:", error);
    showNotification(
      "error",
      "Error",
      "An error occurred while updating user lock status."
    );
    await globalStore.onCheckError(error);
  }
};

// Modal controls and form handling
const openModal = () => {
  resetUserForm();
  isEditMode.value = false;
  showModal.value = true;
  showPasswordFields.value = !isEditMode.value;
};

const editUser = async (userId) => {
  try {
    state.isLoading = true;
    let user = users.value.find((u) => u.id === userId);
    if (!user) {
      const response = await axios.get(
        `/api/users/${userId}`,
        globalStore.getAxiosHeader()
      );
      if (response.data.result && response.data.data) {
        user = response.data.data;
      } else {
        showNotification("error", "Error", "Failed to fetch user details");
        state.isLoading = false;
        return;
      }
    }
    resetUserForm();
    userForm.first_name = user.first_name || "";
    userForm.last_name = user.last_name || "";
    userForm.email = user.email || "";
    userForm.phone = user.phone || "";
    userForm.gender = user.gender || "";
    if (user.roles && user.roles.length > 0) {
      userForm.role_id = user.roles[0].id.toString();
    } else if (user.role_id) {
      userForm.role_id = user.role_id.toString();
    }
    if (user.image) {
      imagePreview.value = getImageUrl(user.image);
    }
    currentUserId.value = userId;
    isEditMode.value = true;
    showModal.value = true;
    showPasswordFields.value = false;
  } catch (error) {
    console.error("Error fetching user details:", error);
    showNotification("error", "Error", "An error occurred while fetching user details");
    await globalStore.onCheckError(error);
  } finally {
    state.isLoading = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  resetUserForm();
  modalMessage.value = "";
  imagePreview.value = "";
};

const confirmDelete = (userId) => {
  confirmationDialog.userId = userId;
  confirmationDialog.show = true;
};

const closeConfirmDialog = () => {
  confirmationDialog.show = false;
  confirmationDialog.userId = null;
};

const confirmAction = () => {
  if (confirmationDialog.userId) {
    performDeleteUser();
  }
};

const resetUserForm = () => {
  userForm.first_name = "";
  userForm.last_name = "";
  userForm.email = "";
  userForm.phone = "";
  userForm.gender = "";
  userForm.role_id = "";
  userForm.password = "";
  userForm.password_confirmation = "";
  userForm.image = null;
  currentUserId.value = null;
  imagePreview.value = "";
  showPasswordFields.value = true;
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    modalMessage.value = "Image size must be less than 2MB";
    event.target.value = null;
    return;
  }

  if (!["image/jpeg", "image/png"].includes(file.type)) {
    modalMessage.value = "Only JPG and PNG images are allowed";
    event.target.value = null;
    return;
  }
  userForm.image = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

const removeImage = () => {
  userForm.image = null;
  imagePreview.value = "";
  const fileInput = document.getElementById("profileImage");
  if (fileInput) fileInput.value = null;
};

const handleSubmit = async (event) => {
  modalMessage.value = "";
  if (!event.target.checkValidity()) {
    event.stopPropagation();
    event.target.classList.add("was-validated");
    return;
  }
  if (
    !userForm.first_name.trim() ||
    !userForm.last_name.trim() ||
    !userForm.email.trim()
  ) {
    modalMessage.value = "Please fill in all required fields";
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userForm.email)) {
    modalMessage.value = "Please enter a valid email address";
    return;
  }
  if ((!isEditMode.value || showPasswordFields.value) && userForm.password) {
    if (userForm.password.length < 8) {
      modalMessage.value = "Password must be at least 8 characters long";
      return;
    }

    if (userForm.password !== userForm.password_confirmation) {
      modalMessage.value = "Passwords do not match";
      return;
    }
  }
  if (isEditMode.value) {
    await updateUser();
  } else {
    await createUser();
  }
};
onMounted(async () => {
  try {
    await fetchRoles();
    await fetchUsers();
  } catch (error) {
    console.error("Error during initialization:", error);
    showNotification("error", "Error", "Failed to initialize the component");
    await globalStore.onCheckError(error);
  }
});
</script>

<style scoped>
.user-management {
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* Header Section */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
  margin-bottom: 2rem;
}

.btn-add-user {
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
}

/* Filters Section */
.filters-section {
  margin-bottom: 2rem;
}

.search-box {
  position: relative;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.search-box .form-control {
  padding-left: 3rem;
  border-radius: 8px;
}

.filter-select {
  width: 200px;
  border-radius: 8px;
}

/* User Cards */
.user-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  overflow: hidden;
  border: 1px solid #edf2f7;
}

.user-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.user-header {
  padding: 1.25rem;
  background: white;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #edf2f7;
  background-color: #f7fafc;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
}

.badge {
  font-size: 0.75rem;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-weight: 500;
  margin-right: 0.5rem;
  display: inline-flex;
  align-items: center;
}

/* Role badge colors */
.bg-danger {
  background-color: #ef4444 !important;
  color: white;
}

.bg-warning {
  background-color: #f59e0b !important;
  color: white;
}

.bg-primary {
  background-color: #3b82f6 !important;
  color: white;
}

.bg-secondary {
  background-color: #6b7280 !important;
  color: white;
}

/* Status badges */
.user-locked {
  background-color: #f87171;
  color: white;
}

.user-active {
  background-color: #10b981;
  color: white;
}

.user-actions .btn-link {
  color: #6c757d;
  padding: 0.5rem;
}

.user-actions .btn-link:hover {
  color: #343a40;
}

.user-details {
  padding: 1.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  color: #4a5568;
}

.detail-item i {
  width: 24px;
  color: #718096;
}

/* States */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-state {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
}

.modal-header h4 {
  margin: 0;
  font-weight: 600;
  color: #1a202c;
  display: flex;
  align-items: center;
}

.btn-close {
  background: none;
  border: none;
  padding: 0.5rem;
  color: #718096;
  cursor: pointer;
}

.btn-close:hover {
  color: #4a5568;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background: #f8f9fa;
}

.form-label {
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.form-control,
.form-select {
  border-radius: 8px;
  border: 1px solid #cbd5e0;
  padding: 0.75rem 1rem;
}

.form-control:focus,
.form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Animations */
.animate-modal {
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Custom Toast Styles */
.toast {
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.toast-success {
  background-color: #d1fae5;
  border-left: 4px solid #10b981;
}

.toast-error {
  background-color: #fee2e2;
  border-left: 4px solid #ef4444;
}

.toast-header {
  background: transparent;
  border-bottom: none;
  padding: 0.75rem 1rem;
}

.toast-body {
  padding: 0.75rem 1rem;
  color: #4b5563;
}

/* Responsive */
@media (max-width: 768px) {
  .filters-section .d-flex {
    flex-direction: column;
  }

  .search-box,
  .filter-select {
    width: 100%;
    max-width: none;
  }
}

/* Confirmation Dialog */
.confirm-dialog {
  max-width: 400px;
}

.confirm-dialog .modal-body {
  padding: 1.5rem 1.5rem 1rem;
  font-size: 1rem;
  color: #4a5568;
}

.confirm-dialog .modal-footer {
  padding: 1rem 1.5rem;
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}

.btn-danger:hover {
  background-color: #c82333;
  border-color: #bd2130;
}

/* Locked user styling */
.user-locked {
  background-color: #f87171;
  color: white;
}

.user-active {
  background-color: #10b981;
  color: white;
}

/* Card locked visual indicator - more subtle version */
.card-locked {
  position: relative;
  border-color: #fecaca;
  background-color: #fef2f2;
}

.card-locked .user-header {
  background-color: #fef2f2;
}

/* Remove the original triangle corner fold and icon */
.card-locked::before,
.card-locked::after {
  display: none;
}
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
  margin-bottom: 2rem;
}

.btn-add-user {
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
}

/* Filters Section */
.filters-section {
  margin-bottom: 2rem;
}

.search-box {
  position: relative;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.search-box .form-control {
  padding-left: 3rem;
  border-radius: 8px;
}

.filter-select {
  width: 200px;
  border-radius: 8px;
}

/* User Cards */
.user-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  overflow: hidden;
  border: 1px solid #edf2f7;
}

.user-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.user-header {
  padding: 1.25rem;
  background: white;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #edf2f7;
  background-color: #f7fafc;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
}

.badge {
  font-size: 0.75rem;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-weight: 500;
  margin-right: 0.5rem;
  display: inline-flex;
  align-items: center;
}

/* Role badge colors */
.bg-danger {
  background-color: #ef4444 !important;
  color: white;
}

.bg-warning {
  background-color: #f59e0b !important;
  color: white;
}

.bg-primary {
  background-color: #3b82f6 !important;
  color: white;
}

.bg-secondary {
  background-color: #6b7280 !important;
  color: white;
}

/* Status badges */
.user-locked {
  background-color: #f87171;
  color: white;
}

.user-active {
  background-color: #10b981;
  color: white;
}

.user-actions .btn-link {
  color: #6c757d;
  padding: 0.5rem;
}

.user-actions .btn-link:hover {
  color: #343a40;
}

.user-details {
  padding: 1.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  color: #4a5568;
}

.detail-item i {
  width: 24px;
  color: #718096;
}

/* States */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-state {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
}

.modal-header h4 {
  margin: 0;
  font-weight: 600;
  color: #1a202c;
  display: flex;
  align-items: center;
}

.btn-close {
  background: none;
  border: none;
  padding: 0.5rem;
  color: #718096;
  cursor: pointer;
}

.btn-close:hover {
  color: #4a5568;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background: #f8f9fa;
}

.form-label {
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.form-control,
.form-select {
  border-radius: 8px;
  border: 1px solid #cbd5e0;
  padding: 0.75rem 1rem;
}

.form-control:focus,
.form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Animations */
.animate-modal {
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Custom Toast Styles */
.toast {
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.toast-success {
  background-color: #d1fae5;
  border-left: 4px solid #10b981;
}

.toast-error {
  background-color: #fee2e2;
  border-left: 4px solid #ef4444;
}

.toast-header {
  background: transparent;
  border-bottom: none;
  padding: 0.75rem 1rem;
}

.toast-body {
  padding: 0.75rem 1rem;
  color: #4b5563;
}

/* Responsive */
@media (max-width: 768px) {
  .filters-section .d-flex {
    flex-direction: column;
  }

  .search-box,
  .filter-select {
    width: 100%;
    max-width: none;
  }
}

/* Confirmation Dialog */
.confirm-dialog {
  max-width: 400px;
}

.confirm-dialog .modal-body {
  padding: 1.5rem 1.5rem 1rem;
  font-size: 1rem;
  color: #4a5568;
}

.confirm-dialog .modal-footer {
  padding: 1rem 1.5rem;
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}

.btn-danger:hover {
  background-color: #c82333;
  border-color: #bd2130;
}

/* Locked user styling */
.user-locked {
  background-color: #f87171;
  color: white;
}

.user-active {
  background-color: #10b981;
  color: white;
}

/* Card locked visual indicator - more subtle version */
.card-locked {
  position: relative;
  border-color: #fecaca;
  background-color: #fef2f2;
}

.card-locked .user-header {
  background-color: #fef2f2;
}

/* Remove the original triangle corner fold and icon */
.card-locked::before,
.card-locked::after {
  display: none;
}
</style>
