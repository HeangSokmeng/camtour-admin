<template>
  <div class="roles-page">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <div class="row align-items-center">
        <div class="col">
          <h2 class="page-title mb-0">Role Management</h2>
          <p class="text-muted">Manage system roles and permissions</p>
        </div>
        <div class="col-auto">
          <button
            class="btn btn-primary"
            @click="openCreateModal"
            :disabled="!hasPermission"
            :title="hasPermission ? 'Add New Role' : 'Admin access required'"
          >
            <i class="fas fa-plus me-2"></i>
            Add New Role
          </button>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="search-box">
              <i class="fas fa-search search-icon"></i>
              <input
                v-model="searchQuery"
                type="text"
                class="form-control ps-5"
                placeholder="Search roles..."
              />
            </div>
          </div>
          <div class="col-md-3">
            <select v-model="statusFilter" class="form-select">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>
          <div class="col-md-3">
            <button class="btn btn-outline-secondary w-100" @click="resetFilters">
              <i class="fas fa-refresh me-2"></i>
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Roles Table -->
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Roles List</h5>
        <div class="d-flex align-items-center">
          <span class="text-muted me-3"> Total: {{ filteredRoles.length }} role(s) </span>
          <div class="btn-group" role="group">
            <button
              type="button"
              class="btn btn-outline-secondary btn-sm"
              :class="{ active: viewMode === 'table' }"
              @click="viewMode = 'table'"
            >
              <i class="fas fa-table"></i>
            </button>
            <button
              type="button"
              class="btn btn-outline-secondary btn-sm"
              :class="{ active: viewMode === 'grid' }"
              @click="viewMode = 'grid'"
            >
              <i class="fas fa-th"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="card-body p-0">
        <!-- Loading State -->
        <div v-if="state.isLoading" class="text-center p-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">Loading roles...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="state.error" class="text-center p-5">
          <div
            v-if="
              state.error.includes('Authentication') ||
              state.error.includes('Access denied')
            "
          >
            <i class="fas fa-lock text-warning fs-1 mb-3"></i>
            <h5 class="text-warning">
              {{
                state.error.includes("Authentication")
                  ? "Authentication Required"
                  : "Access Denied"
              }}
            </h5>
            <p class="text-muted">{{ state.error }}</p>
            <div class="d-flex gap-2 justify-content-center">
              <button
                v-if="state.error.includes('Authentication')"
                class="btn btn-primary"
                @click="$router.push('/login')"
              >
                <i class="fas fa-sign-in-alt me-2"></i>
                Go to Login
              </button>
              <button class="btn btn-outline-secondary" @click="fetchRoles">
                <i class="fas fa-refresh me-2"></i>
                Retry
              </button>
            </div>
          </div>
          <div v-else>
            <i class="fas fa-exclamation-triangle text-danger fs-1 mb-3"></i>
            <h5 class="text-danger">Error Loading Roles</h5>
            <p class="text-muted">{{ state.error }}</p>
            <button class="btn btn-primary" @click="fetchRoles">
              <i class="fas fa-refresh me-2"></i>
              Retry
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredRoles.length === 0" class="text-center p-5">
          <i class="fas fa-users text-muted fs-1 mb-3"></i>
          <h5 class="text-muted">No Roles Found</h5>
          <p class="text-muted">
            {{
              searchQuery
                ? "No roles match your search criteria."
                : "No roles available yet."
            }}
          </p>
          <button v-if="!searchQuery" class="btn btn-primary" @click="openCreateModal">
            <i class="fas fa-plus me-2"></i>
            Create First Role
          </button>
        </div>

        <!-- Table View -->
        <div v-else-if="viewMode === 'table'" class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th scope="col">
                  <button
                    class="btn btn-link p-0 text-decoration-none fw-semibold"
                    @click="sortBy('id')"
                  >
                    ID
                    <i
                      class="fas fa-sort ms-1"
                      :class="{
                        'fa-sort-up': sortField === 'id' && sortOrder === 'asc',
                        'fa-sort-down': sortField === 'id' && sortOrder === 'desc',
                      }"
                    ></i>
                  </button>
                </th>
                <th scope="col">
                  <button
                    class="btn btn-link p-0 text-decoration-none fw-semibold"
                    @click="sortBy('name')"
                  >
                    Role Name
                    <i
                      class="fas fa-sort ms-1"
                      :class="{
                        'fa-sort-up': sortField === 'name' && sortOrder === 'asc',
                        'fa-sort-down': sortField === 'name' && sortOrder === 'desc',
                      }"
                    ></i>
                  </button>
                </th>
                <th scope="col">Status</th>
                <th scope="col">Deleted Info</th>
                <th scope="col" class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="role in paginatedRoles"
                :key="role.id"
                :class="{ 'table-warning': role.is_deleted }"
              >
                <td>
                  <span class="badge bg-light text-dark">#{{ role.id }}</span>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="role-icon me-3">
                      <i
                        :class="getRoleIcon(role.name)"
                        :style="{ color: getRoleColor(role.name) }"
                      ></i>
                    </div>
                    <div>
                      <h6 class="mb-0">{{ role.name }}</h6>
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    class="badge"
                    :class="role.is_deleted ? 'bg-danger' : 'bg-success'"
                  >
                    {{ role.is_deleted ? "Deleted" : "Active" }}
                  </span>
                </td>
                <td>
                  <div v-if="role.is_deleted" class="text-muted">
                    <small>
                      <i class="fas fa-clock me-1"></i>
                      {{ formatDate(role.deleted_datetime) }}
                      <br />
                      <i class="fas fa-user me-1"></i>
                      UID: {{ role.deleted_uid }}
                    </small>
                  </div>
                  <span v-else class="text-muted">—</span>
                </td>
                <td class="text-center">
                  <div class="btn-group" role="group">
                    <button
                      class="btn btn-sm btn-outline-primary"
                      @click="viewRole(role)"
                      :title="'View ' + role.name"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button
                      v-if="!role.is_deleted"
                      class="btn btn-sm btn-outline-secondary"
                      @click="editRole(role)"
                      :title="'Edit ' + role.name"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      class="btn btn-sm"
                      :class="
                        role.is_deleted ? 'btn-outline-success' : 'btn-outline-danger'
                      "
                      @click="role.is_deleted ? restoreRole(role) : deleteRole(role)"
                      :title="
                        role.is_deleted ? 'Restore ' + role.name : 'Delete ' + role.name
                      "
                    >
                      <i :class="role.is_deleted ? 'fas fa-undo' : 'fas fa-trash'"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Grid View -->
        <div v-else class="p-3">
          <div class="row g-3">
            <div v-for="role in paginatedRoles" :key="role.id" class="col-md-6 col-lg-4">
              <div
                class="card role-card h-100"
                :class="{ 'border-warning': role.is_deleted }"
              >
                <div class="card-body">
                  <div class="d-flex align-items-start justify-content-between mb-3">
                    <div class="role-icon-large">
                      <i
                        :class="getRoleIcon(role.name)"
                        :style="{ color: getRoleColor(role.name) }"
                      ></i>
                    </div>
                    <span
                      class="badge"
                      :class="role.is_deleted ? 'bg-danger' : 'bg-success'"
                    >
                      {{ role.is_deleted ? "Deleted" : "Active" }}
                    </span>
                  </div>

                  <h5 class="card-title">{{ role.name }}</h5>
                  <p class="card-text text-muted">
                    <small>ID: #{{ role.id }}</small>
                  </p>

                  <div v-if="role.is_deleted" class="text-muted mb-3">
                    <small>
                      <i class="fas fa-clock me-1"></i>
                      Deleted: {{ formatDate(role.deleted_datetime) }}
                      <br />
                      <i class="fas fa-user me-1"></i>
                      By UID: {{ role.deleted_uid }}
                    </small>
                  </div>
                </div>

                <div class="card-footer bg-transparent border-0">
                  <div class="d-flex gap-2">
                    <button
                      class="btn btn-sm btn-outline-primary flex-fill"
                      @click="viewRole(role)"
                    >
                      <i class="fas fa-eye me-1"></i>
                      View
                    </button>
                    <button
                      v-if="!role.is_deleted"
                      class="btn btn-sm btn-outline-secondary flex-fill"
                      @click="editRole(role)"
                    >
                      <i class="fas fa-edit me-1"></i>
                      Edit
                    </button>
                    <button
                      class="btn btn-sm flex-fill"
                      :class="
                        role.is_deleted ? 'btn-outline-success' : 'btn-outline-danger'
                      "
                      @click="role.is_deleted ? restoreRole(role) : deleteRole(role)"
                    >
                      <i
                        :class="
                          role.is_deleted ? 'fas fa-undo me-1' : 'fas fa-trash me-1'
                        "
                      ></i>
                      {{ role.is_deleted ? "Restore" : "Delete" }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div
          v-if="totalPages > 1"
          class="d-flex justify-content-between align-items-center p-3 border-top"
        >
          <div class="text-muted">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to
            {{ Math.min(currentPage * itemsPerPage, filteredRoles.length) }}
            of {{ filteredRoles.length }} entries
          </div>
          <nav>
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button
                  class="page-link"
                  @click="currentPage = 1"
                  :disabled="currentPage === 1"
                >
                  <i class="fas fa-angle-double-left"></i>
                </button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button
                  class="page-link"
                  @click="currentPage--"
                  :disabled="currentPage === 1"
                >
                  <i class="fas fa-angle-left"></i>
                </button>
              </li>
              <li
                v-for="page in visiblePages"
                :key="page"
                class="page-item"
                :class="{ active: currentPage === page }"
              >
                <button class="page-link" @click="currentPage = page">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button
                  class="page-link"
                  @click="currentPage++"
                  :disabled="currentPage === totalPages"
                >
                  <i class="fas fa-angle-right"></i>
                </button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button
                  class="page-link"
                  @click="currentPage = totalPages"
                  :disabled="currentPage === totalPages"
                >
                  <i class="fas fa-angle-double-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Role Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay">
      <div class="modal-content role-detail-modal">
        <div class="modal-header">
          <h4 class="modal-title">
            <i
              :class="getRoleIcon(selectedRole.name)"
              :style="{ color: getRoleColor(selectedRole.name) }"
              class="me-2"
            ></i>
            {{ selectedRole.name }}
          </h4>
          <button class="btn-close" @click="closeDetailModal"></button>
        </div>
        <div class="modal-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label text-muted">Role ID</label>
              <div class="form-control-plaintext">#{{ selectedRole.id }}</div>
            </div>
            <div class="col-md-6">
              <label class="form-label text-muted">Role Name</label>
              <div class="form-control-plaintext">{{ selectedRole.name }}</div>
            </div>
            <div class="col-md-6">
              <label class="form-label text-muted">Status</label>
              <div class="form-control-plaintext">
                <span
                  class="badge"
                  :class="selectedRole.is_deleted ? 'bg-danger' : 'bg-success'"
                >
                  {{ selectedRole.is_deleted ? "Deleted" : "Active" }}
                </span>
              </div>
            </div>
            <div v-if="selectedRole.is_deleted" class="col-md-6">
              <label class="form-label text-muted">Deleted Date</label>
              <div class="form-control-plaintext">
                {{ formatDate(selectedRole.deleted_datetime) }}
              </div>
            </div>
            <div v-if="selectedRole.is_deleted" class="col-md-6">
              <label class="form-label text-muted">Deleted By (UID)</label>
              <div class="form-control-plaintext">{{ selectedRole.deleted_uid }}</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeDetailModal">Close</button>
          <button
            v-if="!selectedRole.is_deleted"
            class="btn btn-primary"
            @click="editRole(selectedRole)"
          >
            <i class="fas fa-edit me-2"></i>
            Edit Role
          </button>
        </div>
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
  </div>
</template>

<script setup>
import { useToast } from "@/composables/useToast";
import { useGlobalStore } from "@/stores/global";
import axios from "axios";
import { computed, onMounted, reactive, ref, watch } from "vue";

// Remove mock implementations and use actual store
const globalStore = useGlobalStore();

const { toasts, showNotification, removeToast } = useToast();

// State management
const state = reactive({
  isLoading: false,
  error: null,
});

// Data
const roles = ref([]);
const selectedRole = ref({});

// UI States
const showDetailModal = ref(false);
const viewMode = ref("table"); // 'table' or 'grid'

// Search and Filters
const searchQuery = ref("");
const statusFilter = ref("");
const sortField = ref("id");
const sortOrder = ref("asc");

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Computed Properties
const isAuthenticated = computed(() => {
  return globalStore.token && globalStore.user;
});

const hasPermission = computed(() => {
  // Check if user has admin or system admin role
  const userRole = globalStore.user?.role?.name?.toLowerCase() || "";
  return userRole.includes("admin") || userRole.includes("system");
});

const filteredRoles = computed(() => {
  let filtered = [...roles.value];

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (role) =>
        role.name.toLowerCase().includes(query) || role.id.toString().includes(query)
    );
  }

  // Apply status filter
  if (statusFilter.value) {
    if (statusFilter.value === "active") {
      filtered = filtered.filter((role) => !role.is_deleted);
    } else if (statusFilter.value === "deleted") {
      filtered = filtered.filter((role) => role.is_deleted);
    }
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue = a[sortField.value];
    let bValue = b[sortField.value];

    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortOrder.value === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return filtered;
});

const totalPages = computed(() => {
  return Math.ceil(filteredRoles.value.length / itemsPerPage.value);
});

const paginatedRoles = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredRoles.value.slice(start, end);
});

const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("...");
      pages.push(total);
    } else if (current >= total - 3) {
      pages.push(1);
      pages.push("...");
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
      pages.push("...");
      pages.push(total);
    }
  }

  return pages.filter((page) => page !== "..." || true);
});

// Methods
const fetchRoles = async () => {
  state.isLoading = true;
  state.error = null;

  try {
    // Check if user is authenticated
    if (!globalStore.token) {
      state.error = "Authentication required. Please login first.";
      showNotification(
        "error",
        "Authentication Error",
        "Please login to access roles data"
      );
      return;
    }

    // Make API call with proper headers
    const response = await axios.get("/api/roles", globalStore.getAxiosHeader());

    if (response.data.result) {
      roles.value = response.data.data || [];
      showNotification(
        "success",
        "Success",
        `${roles.value.length} roles loaded successfully`
      );
    } else {
      state.error = response.data.message || "Failed to load roles";
      showNotification("error", "Error", state.error);
    }
  } catch (error) {
    console.error("Error fetching roles:", error);

    // Handle specific error cases
    if (error.response?.status === 403) {
      state.error = "Access denied. You do not have permission to view roles.";
      showNotification(
        "error",
        "Access Denied",
        "You need admin privileges to view roles"
      );
    } else if (error.response?.status === 401) {
      state.error = "Authentication expired. Please login again.";
      showNotification("error", "Session Expired", "Please login again to continue");
      // Optionally redirect to login
      // router.push('/login');
    } else if (error.response?.status === 500) {
      state.error = "Server error. Please try again later.";
      showNotification("error", "Server Error", "Internal server error occurred");
    } else if (error.code === "NETWORK_ERROR" || !error.response) {
      state.error = "Network error. Please check your connection.";
      showNotification("error", "Network Error", "Unable to connect to server");
    } else {
      state.error = error.response?.data?.message || "An unexpected error occurred";
      showNotification("error", "Error", state.error);
    }

    await globalStore.onCheckError(error);
  } finally {
    state.isLoading = false;
  }
};

const sortBy = (field) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortOrder.value = "asc";
  }
  currentPage.value = 1;
};

const resetFilters = () => {
  searchQuery.value = "";
  statusFilter.value = "";
  sortField.value = "id";
  sortOrder.value = "asc";
  currentPage.value = 1;
};

const viewRole = (role) => {
  selectedRole.value = { ...role };
  showDetailModal.value = true;
};

const editRole = (role) => {
  // Implement edit functionality
  showNotification(
    "info",
    "Info",
    `Edit functionality for ${role.name} not implemented yet`
  );
};

const deleteRole = (role) => {
  if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
    // Implement delete functionality
    showNotification(
      "info",
      "Info",
      `Delete functionality for ${role.name} not implemented yet`
    );
  }
};

const restoreRole = (role) => {
  if (confirm(`Are you sure you want to restore the role "${role.name}"?`)) {
    // Implement restore functionality
    showNotification(
      "info",
      "Info",
      `Restore functionality for ${role.name} not implemented yet`
    );
  }
};

const openCreateModal = () => {
  // Implement create modal
  showNotification("info", "Info", "Create role functionality not implemented yet");
};

const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedRole.value = {};
};

const getRoleIcon = (roleName) => {
  const name = roleName.toLowerCase();
  if (name.includes("system admin")) return "fas fa-crown";
  if (name.includes("admin")) return "fas fa-user-shield";
  if (name.includes("staff")) return "fas fa-user-tie";
  if (name.includes("customer")) return "fas fa-user";
  return "fas fa-user-circle";
};

const getRoleColor = (roleName) => {
  const name = roleName.toLowerCase();
  if (name.includes("system admin")) return "#dc3545"; // Red
  if (name.includes("admin")) return "#fd7e14"; // Orange
  if (name.includes("staff")) return "#0d6efd"; // Blue
  if (name.includes("customer")) return "#198754"; // Green
  return "#6c757d"; // Gray
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "Invalid Date";
  }
};

// Watchers
watch(searchQuery, () => {
  currentPage.value = 1;
});

watch(statusFilter, () => {
  currentPage.value = 1;
});

// Initialize
onMounted(async () => {
  // Check authentication before fetching roles
  if (!globalStore.token && !globalStore.user) {
    state.error = "Please login to access this page";
    showNotification("warning", "Authentication Required", "Please login to view roles");
    return;
  }

  await fetchRoles();
});
</script>

<style scoped>
.roles-page {
  padding: 1rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #2c3e50;
}

.search-box {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 2;
}

.search-box input {
  padding-left: 2.5rem;
}

.role-icon {
  font-size: 1.25rem;
  width: 32px;
  text-align: center;
}

.role-icon-large {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.role-card {
  transition: all 0.2s ease-in-out;
  border-radius: 0.5rem;
}

.role-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.table-hover tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.075);
}

.btn-group .btn {
  margin: 0 2px;
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
  z-index: 1050;
}

.modal-content {
  background-color: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.role-detail-modal {
  max-width: 700px;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:after {
  content: "×";
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.form-control-plaintext {
  padding: 0.375rem 0;
  margin-bottom: 0;
  font-size: 1rem;
  line-height: 1.5;
  color: #212529;
  background-color: transparent;
  border: solid transparent;
  border-width: 1px 0;
}

.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1100;
}

.toast-notification {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 0.375rem;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
  width: 300px;
  margin-bottom: 0.5rem;
  padding: 0.75rem 1rem;
  animation: toast-in 0.3s ease-out;
  border: 1px solid #e9ecef;
}

.toast-notification.success {
  border-left: 4px solid #198754;
}

.toast-notification.error {
  border-left: 4px solid #dc3545;
}

.toast-notification.warning {
  border-left: 4px solid #ffc107;
}

.toast-notification.info {
  border-left: 4px solid #0dcaf0;
}

.toast-icon {
  margin-right: 0.75rem;
  color: #6c757d;
  font-size: 1.1rem;
}

.toast-notification.success .toast-icon {
  color: #198754;
}

.toast-notification.error .toast-icon {
  color: #dc3545;
}

.toast-notification.warning .toast-icon {
  color: #ffc107;
}

.toast-notification.info .toast-icon {
  color: #0dcaf0;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #212529;
  font-size: 0.9rem;
}

.toast-message {
  color: #6c757d;
  font-size: 0.875rem;
  line-height: 1.4;
}

.toast-close {
  margin-left: auto;
  background: none;
  border: none;
  color: #6c757d;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.15s ease-in-out;
}

.toast-close:hover {
  background-color: #f8f9fa;
  color: #495057;
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

.spinner-border {
  width: 3rem;
  height: 3rem;
}

.card {
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 1rem 1.25rem;
}

.card-body {
  padding: 1.25rem;
}

.btn {
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.15s ease-in-out;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.btn-primary:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
}

.btn-outline-primary {
  color: #0d6efd;
  border-color: #0d6efd;
}

.btn-outline-primary:hover {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: #fff;
}

.btn-outline-secondary {
  color: #6c757d;
  border-color: #6c757d;
}

.btn-outline-secondary:hover {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
}

.btn-outline-danger {
  color: #dc3545;
  border-color: #dc3545;
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  border-color: #dc3545;
  color: #fff;
}

.btn-outline-success {
  color: #198754;
  border-color: #198754;
}

.btn-outline-success:hover {
  background-color: #198754;
  border-color: #198754;
  color: #fff;
}

.btn-link {
  color: #212529;
  text-decoration: none;
}

.btn-link:hover {
  color: #0d6efd;
  text-decoration: none;
  transform: none;
  box-shadow: none;
}

.badge {
  font-size: 0.75em;
  padding: 0.35em 0.65em;
  border-radius: 0.375rem;
}

.badge.bg-success {
  background-color: #198754 !important;
}

.badge.bg-danger {
  background-color: #dc3545 !important;
}

.badge.bg-light {
  background-color: #f8f9fa !important;
  color: #212529 !important;
  border: 1px solid #dee2e6;
}

.table {
  margin-bottom: 0;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #495057;
  padding: 0.75rem;
}

.table td {
  padding: 0.75rem;
  vertical-align: middle;
}

.table-hover tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.075);
}

.table-warning {
  background-color: rgba(255, 193, 7, 0.1);
}

.pagination {
  margin: 0;
}

.page-link {
  color: #0d6efd;
  border-color: #dee2e6;
  padding: 0.375rem 0.75rem;
}

.page-link:hover {
  color: #0a58ca;
  background-color: #e9ecef;
  border-color: #dee2e6;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.page-item.disabled .page-link {
  color: #6c757d;
  background-color: #fff;
  border-color: #dee2e6;
}

.form-control {
  border-color: #e5e5e5;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
}

.form-control:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-select {
  border-color: #e5e5e5;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
}

.form-select:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-label {
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.5rem;
}

.text-muted {
  color: #6c757d !important;
}

.text-danger {
  color: #dc3545 !important;
}

.fw-semibold {
  font-weight: 600;
}

.fs-1 {
  font-size: 2.5rem;
}

.visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .roles-page {
    padding: 0.5rem;
  }

  .page-header .col-auto {
    margin-top: 1rem;
  }

  .btn-group .btn {
    margin: 2px;
  }

  .modal-content {
    width: 95%;
    margin: 10px;
  }

  .toast-notification {
    width: 280px;
  }

  .table-responsive {
    font-size: 0.875rem;
  }

  .card-body {
    padding: 1rem;
  }
}

@media (max-width: 576px) {
  .page-title {
    font-size: 1.5rem;
  }

  .btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }

  .toast-container {
    left: 1rem;
    right: 1rem;
  }

  .toast-notification {
    width: 100%;
  }

  .modal-content {
    width: 98%;
    padding: 1rem;
  }

  .role-icon-large {
    font-size: 1.5rem;
  }
}
</style>
