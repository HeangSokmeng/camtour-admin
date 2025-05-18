<template>
  <div class="user-management">
    <!-- Header Section -->
    <div class="page-header">
      <div class="container">
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <h1 class="h2 mb-0">User Management</h1>
            <p class="text-muted mb-0">Manage your team members and their roles</p>
          </div>
          <button class="btn btn-primary btn-add-user" @click="openAddUserModal">
            <i class="fa fa-plus-circle me-2"></i>Add New User
          </button>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <div class="container">
        <div class="card shadow-sm border-0">
          <div class="card-body">
            <div class="d-flex flex-wrap gap-3 align-items-center">
              <div class="search-box flex-grow-1">
                <i class="fa fa-search search-icon"></i>
                <input
                  v-model="searchQuery"
                  class="form-control"
                  type="search"
                  placeholder="Search by name, email, or phone..."
                  @input="handleSearchInput"
                />
              </div>

              <select
                v-model="selectedRole"
                class="form-select filter-select"
                @change="handleSearch"
              >
                <option value="">All Roles</option>
                <option v-for="role in roles" :key="role.id" :value="role.id">
                  {{ role.name }}
                </option>
              </select>

              <select
                v-model="selectedGender"
                class="form-select filter-select"
                @change="handleSearch"
              >
                <option value="">All Genders</option>
                <option value="1">Male</option>
                <option value="2">Female</option>
              </select>

              <select
                v-model="lockStatus"
                class="form-select filter-select"
                @change="handleSearch"
              >
                <option value="">All Users</option>
                <option value="unlock">Active Users</option>
                <option value="lock">Locked Users</option>
              </select>

              <button
                v-if="hasFilters"
                class="btn btn-outline-danger"
                @click="clearFilters"
              >
                <i class="fa fa-times me-1"></i>Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Users Grid -->
    <div class="users-grid">
      <div class="container">
        <div v-if="isLoading" class="loading-state">
          <div class="spinner-grow text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 text-muted">Loading users...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <div class="alert alert-danger" role="alert">
            <i class="fa fa-exclamation-circle me-2"></i>{{ error }}
          </div>
        </div>

        <div v-else class="row">
          <div v-if="users.length === 0" class="col-12">
            <div class="empty-state">
              <i class="fa fa-users fa-4x text-muted mb-3"></i>
              <h3>No Users Found</h3>
              <p class="text-muted mb-4">Get started by adding your first user</p>
              <button class="btn btn-primary" @click="openAddUserModal">
                <i class="fa fa-plus me-2"></i>Add User
              </button>
            </div>
          </div>

          <div
            v-else
            v-for="user in users"
            :key="user.id"
            class="col-12 col-md-6 col-lg-4 mb-4"
          >
            <div
              :class="[
                'user-card',
                user.is_lock === 'lock' || user.is_lock === true || user.is_lock === 1
                  ? 'card-locked'
                  : '',
              ]"
            >
              <div class="card-body p-0">
                <div class="user-header">
                  <div class="user-avatar">
                    <img :src="getUserImage(user.image_url)" alt="User avatar" />
                  </div>
                  <div class="user-info">
                    <h5 class="user-name mb-1">{{ user.full_name }}</h5>
                    <div class="d-flex align-items-center gap-2">
                      <span :class="['badge', getRoleBadgeClass(user.roles[0])]">
                        {{ user.roles[0]?.name || "No Role" }}
                      </span>
                      <span :class="['badge', getUserStatusIndicator(user).class]">
                        <i :class="['fa', getUserStatusIndicator(user).icon, 'me-1']"></i>
                        {{ getUserStatusIndicator(user).text }}
                      </span>
                    </div>
                  </div>
                  <div class="user-actions">
                    <div class="dropdown">
                      <button class="btn btn-link" data-bs-toggle="dropdown">
                        <i class="fa fa-ellipsis-v"></i>
                      </button>
                      <ul class="dropdown-menu dropdown-menu-end">
                        <li>
                          <a class="dropdown-item" @click.prevent="modifyUser(user)">
                            <i class="fa fa-edit text-warning me-2"></i>Edit User
                          </a>
                        </li>
                        <li>
                          <a class="dropdown-item" @click.prevent="toggleUserLock(user)">
                            <i
                              :class="[
                                'fa',
                                user.is_lock === 'lock' ||
                                user.is_lock === true ||
                                user.is_lock === 1
                                  ? 'fa-lock text-danger' // Show lock icon when locked
                                  : 'fa-unlock text-success', // Show unlock icon when unlocked
                                'me-2',
                              ]"
                            ></i>
                            {{
                              user.is_lock === "lock" ||
                              user.is_lock === true ||
                              user.is_lock === 1
                                ? "Unlock User"
                                : "Lock User"
                            }}
                          </a>
                        </li>
                        <li><hr class="dropdown-divider" /></li>
                        <li>
                          <a
                            class="dropdown-item text-danger"
                            @click.prevent="deleteUser(user.id)"
                          >
                            <i class="fa fa-trash-alt me-2"></i>Delete
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div class="user-details">
                  <div class="detail-item">
                    <i class="fa fa-envelope me-2"></i>
                    <span>{{ user.email }}</span>
                  </div>
                  <div class="detail-item">
                    <i class="fa fa-phone me-2"></i>
                    <span>{{ user.phone || "No phone" }}</span>
                  </div>
                  <div class="detail-item">
                    <i class="fa fa-calendar me-2"></i>
                    <span>Joined {{ formatDate(user.created_at) }}</span>
                  </div>
                  <div class="detail-item">
                    <i class="fa fa-venus-mars me-2"></i>
                    <span>{{ user.gender_text || "N/A" }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit User Modal -->
    <div v-if="showUserModal" class="modal-overlay">
      <div class="modal-content user-form animate-modal">
        <div class="modal-header">
          <h4>
            <i class="fa me-2" :class="isEditMode ? 'fa-edit' : 'fa-user-plus'"></i>
            {{ isEditMode ? "Edit User" : "Add New User" }}
          </h4>
          <button type="button" class="btn-close" @click="closeUserModal">
            <i class="fa fa-times"></i>
          </button>
        </div>

        <div v-if="modalError" class="alert alert-danger">
          <i class="fa fa-exclamation-circle me-2"></i>{{ modalError }}
        </div>

        <form class="modal-body" @submit.prevent="handleSubmit">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">First Name</label>
              <input v-model="userForm.first_name" class="form-control" required />
            </div>

            <div class="col-md-6">
              <label class="form-label">Last Name</label>
              <input v-model="userForm.last_name" class="form-control" required />
            </div>

            <div class="col-md-6">
              <label class="form-label">Email</label>
              <input
                v-model="userForm.email"
                class="form-control"
                type="email"
                required
              />
            </div>

            <div class="col-md-6">
              <label class="form-label">Phone</label>
              <input v-model="userForm.phone" class="form-control" />
            </div>

            <div class="col-md-6">
              <label class="form-label">Gender</label>
              <select v-model="userForm.gender" class="form-select">
                <option value="">Select gender</option>
                <option value="1">Male</option>
                <option value="2">Female</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label">Role</label>
              <select v-model="userForm.role_id" class="form-select">
                <option value="">Select a role</option>
                <option v-for="role in roles" :key="role.id" :value="role.id">
                  {{ role.name }}
                </option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label">Image</label>
              <input
                @change="handleImageChange"
                class="form-control"
                type="file"
                accept="image/png,image/jpeg"
              />
            </div>

            <div class="col-md-6">
              <label class="form-label">Status</label>
              <select v-model="userForm.is_lock" class="form-select">
                <option value="">Select status</option>
                <option value="unlock">Unlocked</option>
                <option value="lock">Locked</option>
              </select>
            </div>

            <div v-if="!isEditMode" class="col-md-6">
              <label class="form-label">Password</label>
              <input
                v-model="userForm.password"
                class="form-control"
                type="password"
                :required="!isEditMode"
                minlength="8"
              />
            </div>

            <div v-if="!isEditMode" class="col-md-6">
              <label class="form-label">Confirm Password</label>
              <input
                v-model="userForm.password_confirmation"
                class="form-control"
                type="password"
                :required="!isEditMode"
              />
            </div>

            <div v-if="isEditMode" class="col-12">
              <div class="form-check">
                <input
                  v-model="changePassword"
                  class="form-check-input"
                  type="checkbox"
                  id="changePasswordToggle"
                />
                <label class="form-check-label" for="changePasswordToggle"
                  >Change Password</label
                >
              </div>
            </div>

            <template v-if="isEditMode && changePassword">
              <div class="col-md-6">
                <label class="form-label">New Password</label>
                <input
                  v-model="userForm.password"
                  class="form-control"
                  type="password"
                  minlength="8"
                />
              </div>
              <div class="col-md-6">
                <label class="form-label">Confirm Password</label>
                <input
                  v-model="userForm.password_confirmation"
                  class="form-control"
                  type="password"
                />
              </div>
            </template>
          </div>
        </form>

        <div class="modal-footer">
          <button class="btn btn-light" @click="closeUserModal">Cancel</button>
          <button class="btn btn-primary" @click="handleSubmit" :disabled="isSubmitting">
            {{
              isSubmitting ? "Processing..." : isEditMode ? "Update User" : "Create User"
            }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <transition-group name="toast" tag="div">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', 'show', `toast-${toast.type}`]"
          role="alert"
        >
          <div class="toast-header">
            <i :class="toast.icon" class="me-2"></i>
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

    <!-- Confirmation Dialog -->
    <div v-if="showConfirmDialog" class="modal-overlay">
      <div class="modal-content confirm-dialog animate-modal">
        <div class="modal-header">
          <h4>
            <i class="fa fa-exclamation-triangle text-warning me-2"></i>{{ confirmTitle }}
          </h4>
        </div>

        <div class="modal-body">
          <p>{{ confirmMessage }}</p>
        </div>

        <div class="modal-footer">
          <button class="btn btn-light" @click="handleCancel">Cancel</button>
          <button class="btn btn-danger" @click="handleConfirm">Confirm</button>
        </div>
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
import { useRouter } from "vue-router";

// Constants
const DEFAULT_AVATAR = "/images/default-avatar.png";
const ROLE_COLORS = {
  admin: "bg-danger",
  manager: "bg-warning",
  staff: "bg-primary",
  default: "bg-secondary",
};

// Composables & Store
const { toasts, showNotification, removeToast } = useToast();
const router = useRouter();
const globalStore = useGlobalStore();

// State
const users = ref([]);
const roles = ref([]);
const isLoading = ref(false);
const error = ref(null);

// Search and Filter
const searchQuery = ref("");
const selectedRole = ref("");
const selectedGender = ref("");
const lockStatus = ref("");
let searchTimeout = null;

// Modal
const showUserModal = ref(false);
const isEditMode = ref(false);
const currentEditId = ref(null);
const isSubmitting = ref(false);
const modalError = ref("");
const changePassword = ref(false);

const userForm = reactive({
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  gender: "",
  role_id: "",
  image: null,
  is_lock: "",
  password: "",
  password_confirmation: "",
});

// Confirmation Dialog
const showConfirmDialog = ref(false);
const confirmTitle = ref("");
const confirmMessage = ref("");
const confirmCallback = ref(null);
const confirmArgs = ref(null);

// Computed
const hasFilters = computed(() => {
  return (
    searchQuery.value || selectedRole.value || selectedGender.value || lockStatus.value
  );
});

// Methods
const getUserImage = (imageUrl) => {
  return imageUrl && imageUrl !== "storage/no_photo.jpg" ? imageUrl : DEFAULT_AVATAR;
};

const getRoleBadgeClass = (role) => {
  if (!role?.name) return ROLE_COLORS.default;
  const roleName = role.name.toLowerCase();
  return ROLE_COLORS[roleName] || ROLE_COLORS.default;
};

const getUserStatusIndicator = (user) => {
  if (user.is_lock === "lock" || user.is_lock === true || user.is_lock === 1) {
    return {
      icon: "fa-lock",
      class: "user-locked",
      text: "Locked",
    };
  } else {
    return {
      icon: "fa-unlock", // Changed to shield icon matching your image
      class: "user-active",
      text: "Active",
    };
  }
};
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const handleSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => handleSearch(), 500);
};

const handleSearch = async () => {
  await fetchUsers();
};

const clearFilters = () => {
  searchQuery.value = "";
  selectedRole.value = "";
  selectedGender.value = "";
  lockStatus.value = "";
  fetchUsers();
};

const fetchUsers = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const params = {
      search: searchQuery.value,
      role_id: selectedRole.value,
      gender: selectedGender.value,
      is_lock: lockStatus.value,
    };

    Object.keys(params).forEach((key) => {
      if (!params[key]) delete params[key];
    });

    const res = await axios.get("/api/users", {
      params,
      ...globalStore.getAxiosHeader(),
    });

    if (res.data.result) {
      users.value = res.data.data;
      return true;
    } else {
      error.value = res.data.message || "Failed to fetch users";
      return false;
    }
  } catch (err) {
    error.value = err.message || "An error occurred while fetching users";
    await globalStore.onCheckError(err, router);
    return false;
  } finally {
    isLoading.value = false;
  }
};

const fetchRoles = async () => {
  try {
    const res = await axios.get("/api/roles", globalStore.getAxiosHeader());
    if (res.data.result) {
      roles.value = res.data.data;
      return true;
    }
    return false;
  } catch (err) {
    console.error("Failed to fetch roles", err);
    return false;
  }
};

const openAddUserModal = () => {
  resetUserForm();
  isEditMode.value = false;
  showUserModal.value = true;
  modalError.value = "";
};
const modifyUser = (user) => {
  resetUserForm();
  isEditMode.value = true;
  userForm.first_name = user.first_name || "";
  userForm.last_name = user.last_name || "";
  userForm.email = user.email || "";
  userForm.phone = user.phone || "";
  userForm.gender = user.gender || "";

  // Make sure we handle role assignment properly
  // Check if user.roles is an array and has elements
  if (Array.isArray(user.roles) && user.roles.length > 0 && user.roles[0]?.id) {
    userForm.role_id = user.roles[0].id;
  } else {
    userForm.role_id = "";
  }

  // Normalize lock status
  userForm.is_lock = user.is_lock || "unlock";

  currentEditId.value = user.id;
  showUserModal.value = true;
  modalError.value = "";

  console.log("Editing user:", user.id, userForm);
};

const closeUserModal = () => {
  showUserModal.value = false;
  resetUserForm();
  modalError.value = "";
};

const resetUserForm = () => {
  Object.assign(userForm, {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "",
    role_id: "",
    image: null,
    is_lock: "",
    password: "",
    password_confirmation: "",
  });
  changePassword.value = false;
  currentEditId.value = null;
};

const handleImageChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    userForm.image = file;
  }
};

const validateForm = () => {
  if (
    !userForm.first_name.trim() ||
    !userForm.last_name.trim() ||
    !userForm.email.trim()
  ) {
    modalError.value = "First name, last name and email are required";
    return false;
  }

  if (!isEditMode.value && (!userForm.password || !userForm.password_confirmation)) {
    modalError.value = "Password is required for new users";
    return false;
  }

  if (
    (userForm.password || userForm.password_confirmation) &&
    userForm.password !== userForm.password_confirmation
  ) {
    modalError.value = "Passwords must match";
    return false;
  }

  return true;
};

const toggleUserLock = (user) => {
  // Show confirmation dialog before locking/unlocking
  const isCurrentlyLocked =
    user.is_lock === "lock" || user.is_lock === true || user.is_lock === 1;
  const action = isCurrentlyLocked ? "unlock" : "lock";

  showConfirmation(
    `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
    `Are you sure you want to ${action} this user?`,
    () => lockUser(user.id, isCurrentlyLocked),
    null
  );
};

const lockUser = async (userId, isCurrentlyLocked) => {
  try {
    // Find user in the array
    const userIndex = users.value.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      // Optimistically update the UI before server response
      const newStatus = isCurrentlyLocked ? "unlock" : "lock";
      users.value[userIndex].is_lock = newStatus;
    }

    // Make the API call
    const res = await axios.put(
      `/api/users/islock/${userId}`,
      {},
      globalStore.getAxiosHeader()
    );

    if (res.data.result) {
      showNotification(
        "success",
        "Success",
        res.data.message || "User status updated successfully!"
      );
      // Refresh the user list to ensure all data is in sync
      await fetchUsers();
    } else {
      // If the API call failed, revert the optimistic update
      if (userIndex !== -1) {
        users.value[userIndex].is_lock = isCurrentlyLocked ? "lock" : "unlock";
      }
      showNotification(
        "error",
        "Error",
        res.data.message || "Failed to change user status"
      );
    }
  } catch (err) {
    console.error("Error toggling user lock status:", err);

    // Revert the optimistic update if there was an error
    const userIndex = users.value.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      users.value[userIndex].is_lock = isCurrentlyLocked ? "lock" : "unlock";
    }

    // Check if there's an error response from the server
    const errorMessage =
      err.response?.data?.message || "An error occurred while changing user status";

    // Check if the error is that the user tried to lock themselves
    if (
      err.response?.data?.message?.includes("cannot lock your own account") ||
      err.response?.data?.message?.includes("Cannot lock yourself")
    ) {
      showNotification("error", "Error", "You cannot lock your own account");
    } else {
      showNotification("error", "Error", errorMessage);
    }

    await globalStore.onCheckError(err, router);
  }
};

// Fixed handleSubmit function
const handleSubmit = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;
  modalError.value = "";

  try {
    const formData = new FormData();

    formData.append("first_name", userForm.first_name);
    formData.append("last_name", userForm.last_name);
    formData.append("email", userForm.email);

    if (userForm.phone) formData.append("phone", userForm.phone);
    if (userForm.gender) formData.append("gender", userForm.gender);
    if (userForm.role_id) formData.append("role_id", userForm.role_id);
    if (userForm.is_lock) formData.append("is_lock", userForm.is_lock);
    if (userForm.image) formData.append("image", userForm.image);

    if (!isEditMode.value || (isEditMode.value && changePassword.value)) {
      formData.append("password", userForm.password);
      formData.append("password_confirmation", userForm.password_confirmation);
    }

    let res;
    if (isEditMode.value) {
      // Fix: Use the correct endpoint format and method
      // Following the pattern from product colors
      formData.append("_method", "PUT");
      res = await axios.put(`/api/users/update/${currentEditId.value}`, formData, {
        ...globalStore.getAxiosHeader(),
        headers: {
          ...globalStore.getAxiosHeader().headers,
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      // For new users, continue with the regular POST
      res = await axios.post("/api/users", formData, {
        ...globalStore.getAxiosHeader(),
        headers: {
          ...globalStore.getAxiosHeader().headers,
          "Content-Type": "multipart/form-data",
        },
      });
    }

    if (res.data.result) {
      showNotification(
        "success",
        "Success",
        res.data.message ||
          (isEditMode.value ? "User updated successfully!" : "User created successfully!")
      );
      closeUserModal();
      fetchUsers();
    } else {
      modalError.value = res.data.message || "Failed to save user";
    }
  } catch (err) {
    console.error("Error saving user:", err);
    modalError.value =
      err.response?.data?.message || "An error occurred while saving the user";

    // Add debugging to help identify issues
    console.log("Error details:", {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      headers: err.response?.headers,
    });

    await globalStore.onCheckError(err, router);
  } finally {
    isSubmitting.value = false;
  }
};

// Improved performDeleteUser function
const performDeleteUser = async (userId) => {
  try {
    const res = await axios.delete(`/api/users/${userId}`, globalStore.getAxiosHeader());

    if (res.data.result) {
      showNotification(
        "success",
        "Success",
        res.data.message || "User deleted successfully!"
      );
      await fetchUsers();
    } else {
      showNotification("error", "Error", res.data.message || "Failed to delete user");
    }
  } catch (err) {
    console.error("Error deleting user:", err);
    showNotification(
      "error",
      "Error",
      err.response?.data?.message || "An error occurred while deleting the user"
    );
    await globalStore.onCheckError(err, router);
  }
};

// Confirmation Dialog methods
const showConfirmation = (title, message, callback, args) => {
  confirmTitle.value = title;
  confirmMessage.value = message;
  confirmCallback.value = callback;
  confirmArgs.value = args;
  showConfirmDialog.value = true;
};

const handleConfirm = () => {
  if (confirmCallback.value) {
    confirmCallback.value(confirmArgs.value);
  }
  showConfirmDialog.value = false;
};

const handleCancel = () => {
  showConfirmDialog.value = false;
};

const deleteUser = (userId) => {
  showConfirmation(
    "Delete User",
    "Are you sure you want to delete this user?",
    performDeleteUser,
    userId
  );
};

onMounted(async () => {
  isLoading.value = true;
  error.value = null;

  try {
    await Promise.all([fetchRoles()]);
    await fetchUsers();
  } catch (err) {
    error.value = "Failed to load initial data";
    showNotification("error", "Error", "Failed to load initial data");
    console.error("Failed to load initial data", err);
  } finally {
    isLoading.value = false;
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
</style>
