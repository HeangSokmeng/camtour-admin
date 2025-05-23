<template>
  <div class="mb-9">
    <div class="row g-2 mb-4">
      <div class="col-auto">
        <h2 class="mb-0">Districts</h2>
      </div>
    </div>
    <div id="districts">
      <div class="mb-4">
        <div class="row g-3 justify-content-between">
          <div class="col-auto justify-content-between row g-3">
            <div class="search-box">
              <input
                v-model="searchQuery"
                class="form-control search-input search"
                type="search"
                placeholder="Search districts"
                @input="handleSearchInput"
              />
            </div>
            <div class="col-auto">
              <select
                v-model="selectedProvince"
                class="form-select"
                aria-label="Province filter"
                @change="handleSearch"
              >
                <option value="">Filter Province</option>
                <option
                  v-for="province in provinces"
                  :key="province.id"
                  :value="province.id"
                >
                  {{ province.name }}
                </option>
              </select>
            </div>
            <div class="col-auto">
              <select
                class="form-select"
                aria-label="Items per page"
                v-model="perPage"
                @change="handleSearch"
              >
                <option :value="10">10 per page</option>
                <option :value="25">25 per page</option>
                <option :value="50">50 per page</option>
                <option :value="100">100 per page</option>
              </select>
            </div>
          </div>
          <div class="col-auto">
            <button class="btn btn-primary" @click="openCreateModal">
              <i class="fas fa-plus me-2"></i>Add District
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-danger text-center">
        {{ error }}
      </div>

      <!-- Districts Table -->
      <div v-else class="table-responsive">
        <table class="table table-sm fs-9 mb-0">
          <thead>
            <tr>
              <th class="align-middle ps-0">#</th>
              <th class="align-middle">
                <a href="#" @click.prevent="toggleSort('name')">
                  District Name
                  <i
                    v-if="sortCol === 'name'"
                    :class="sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
                  ></i>
                </a>
              </th>
              <th class="align-middle">
                <a href="#" @click.prevent="toggleSort('local_name')">
                  District Local Name
                  <i
                    v-if="sortCol === 'local_name'"
                    :class="sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
                  ></i>
                </a>
              </th>
              <th class="align-middle">Province Name</th>
              <th class="align-middle text-end">
                <a href="#" @click.prevent="toggleSort('created_at')">
                  Created At
                  <i
                    v-if="sortCol === 'created_at'"
                    :class="sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
                  ></i>
                </a>
              </th>
              <th class="align-middle text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="districts.length === 0">
              <td colspan="6" class="text-center">No districts found</td>
            </tr>
            <tr v-else v-for="(district, index) in districts" :key="district.id">
              <td class="align-middle ps-0">
                {{ (paginationData.current_page - 1) * perPage + index + 1 }}
              </td>
              <td class="align-middle">{{ district.name }}</td>
              <td class="align-middle">{{ district.local_name }}</td>
              <td class="align-middle">{{ district.province.name }}</td>
              <td class="align-middle text-end">{{ formatDate(district.created_at) }}</td>
              <td class="align-middle text-end">
                <button
                  class="btn btn-sm btn-primary me-2"
                  @click="openEditModal(district)"
                >
                  <i class="fas fa-edit me-1"></i>Edit
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  @click="deleteDistrict(district.id)"
                >
                  <i class="fas fa-trash me-1"></i>Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <pagination
          v-if="!isLoading && districts.length > 0"
          :current-page="paginationData.current_page"
          :last-page="paginationData.last_page"
          :first-item="paginationData.first_item"
          :last-item="paginationData.last_item"
          :total="paginationData.total"
          @page-changed="changePage"
        />
      </div>

      <!-- District Modal -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
          <h4>{{ isEditMode ? "Edit" : "Create" }} District</h4>

          <div v-if="modalError" class="alert alert-danger">
            {{ modalError }}
          </div>

          <form
            @submit.prevent="submitDistrict"
            class="row g-3 needs-validation"
            novalidate
          >
            <div class="col-md-12">
              <label for="districtName" class="form-label">District Name</label>
              <input
                v-model.trim="districtForm.name"
                id="districtName"
                type="text"
                class="form-control"
                required
              />
              <div class="invalid-feedback">District name is required</div>
            </div>

            <div class="col-md-12">
              <label for="districtLocalName" class="form-label"
                >District Local Name</label
              >
              <input
                v-model.trim="districtForm.local_name"
                id="districtLocalName"
                type="text"
                class="form-control"
                required
              />
              <div class="invalid-feedback">District local name is required</div>
            </div>

            <div class="col-md-12">
              <label for="provinceId" class="form-label">Province</label>
              <select
                v-model="districtForm.province_id"
                id="provinceId"
                class="form-select"
                required
              >
                <option value="">Select a province</option>
                <option
                  v-for="province in provinces"
                  :key="province.id"
                  :value="province.id"
                >
                  {{ province.name }} ({{ province.local_name }})
                </option>
              </select>
              <div class="invalid-feedback">Please select a province</div>
            </div>

            <div class="col-12 d-flex justify-content-end">
              <button type="button" class="btn btn-secondary me-2" @click="closeModal">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                {{ isSubmitting ? "Processing..." : isEditMode ? "Update" : "Save" }}
              </button>
            </div>
          </form>
        </div>
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
import Pagination from "@/components/layouts/Pagination.vue";
import { useToast } from "@/composables/useToast";
import { useGlobalStore } from "@/stores/global";
import axios from "axios";
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

// Get toast functionality from the composable
const { toasts, showNotification, removeToast } = useToast();

// Router and Store
const router = useRouter();
const globalStore = useGlobalStore();

// State management
const isLoading = ref(false);
const error = ref(null);
const districts = ref([]);
const provinces = ref([]);

// Pagination settings
const perPage = ref(10);
const sortCol = ref("name");
const sortDir = ref("asc");
const paginationData = reactive({
  has_page: false,
  on_first_page: true,
  has_more_pages: false,
  first_item: 0,
  last_item: 0,
  total: 0,
  current_page: 1,
  last_page: 1,
});

// Search and Filter
const searchQuery = ref("");
const selectedProvince = ref("");
let searchTimeout = null;

// Modal Management
const showModal = ref(false);
const isEditMode = ref(false);
const isSubmitting = ref(false);
const modalError = ref("");

// Confirmation modal state
const confirmationModal = reactive({
  show: false,
  title: "Confirm Action",
  message: "Are you sure you want to proceed?",
  action: null,
  actionParams: null,
});

// Form Data
const districtForm = reactive({
  id: null,
  name: "",
  local_name: "",
  province_id: "",
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

// Utility Functions
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

// Handle search input with debounce
const handleSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    handleSearch();
  }, 500);
};

// Handle search when user submits the search
const handleSearch = async () => {
  paginationData.current_page = 1;
  await getDistricts(1);
};

// Toggle sorting
const toggleSort = async (column) => {
  if (sortCol.value === column) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortCol.value = column;
    sortDir.value = "asc";
  }

  await getDistricts(1);
};

// Handle pagination
const changePage = async (page) => {
  await getDistricts(page);
};

// API Interactions
const getDistricts = async (page = 1) => {
  isLoading.value = true;
  error.value = null;

  try {
    const url = `/api/districts?page=${page}&per_page=${perPage.value}&sort_col=${sortCol.value}&sort_dir=${sortDir.value}&search=${searchQuery.value}&province=${selectedProvince.value}`;

    const res = await axios.get(url, globalStore.getAxiosHeader());

    if (res.data.result) {
      districts.value = res.data.data;

      // Update pagination data
      if (res.data.paginate) {
        Object.assign(paginationData, res.data.paginate);
      }

      return true;
    } else {
      error.value = res.data.message || "Failed to fetch data";
      return false;
    }
  } catch (err) {
    error.value = err.message || "An error occurred while fetching data";
    await globalStore.onCheckError(err, router);
    return false;
  } finally {
    isLoading.value = false;
  }
};

const getProvinces = async () => {
  try {
    const res = await axios.get("/api/provinces", globalStore.getAxiosHeader());
    if (res.data.result) {
      provinces.value = res.data.data;
      return true;
    }
    return false;
  } catch (err) {
    console.error("Failed to fetch provinces", err);
    showNotification("error", "Error", "Failed to fetch provinces");
    return false;
  }
};

// Modal Methods
const openCreateModal = () => {
  isEditMode.value = false;
  districtForm.id = null;
  districtForm.name = "";
  districtForm.local_name = "";
  districtForm.province_id = "";
  modalError.value = "";
  showModal.value = true;
};

const openEditModal = (district) => {
  isEditMode.value = true;
  districtForm.id = district.id;
  districtForm.name = district.name;
  districtForm.local_name = district.local_name;
  districtForm.province_id = district.province.id;
  modalError.value = "";
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  modalError.value = "";
};

const submitDistrict = async () => {
  isSubmitting.value = true;
  modalError.value = "";

  try {
    const payload = {
      name: districtForm.name,
      local_name: districtForm.local_name,
      province_id: districtForm.province_id,
    };

    const res = isEditMode.value
      ? await axios.put(
          `/api/districts/${districtForm.id}`,
          payload,
          globalStore.getAxiosHeader()
        )
      : await axios.post("/api/districts", payload, globalStore.getAxiosHeader());

    if (res.data.result) {
      await getDistricts(paginationData.current_page);
      closeModal();

      // Show success notification
      const message = isEditMode.value
        ? "District updated successfully!"
        : "District created successfully!";
      showNotification("success", "Success", message);
    } else {
      modalError.value = res.data.message || "Failed to save district";
    }
  } catch (err) {
    modalError.value = err.response?.data?.message || "An error occurred";
  } finally {
    isSubmitting.value = false;
  }
};

// Perform delete operation
const performDeleteDistrict = async (id) => {
  try {
    const res = await axios.delete(`/api/districts/${id}`, globalStore.getAxiosHeader());

    if (res.data.result) {
      // Refresh the current page or go to the previous page if no items left
      const page = paginationData.current_page;

      if (districts.value.length === 1 && paginationData.current_page > 1) {
        // If deleting the last item on a page (not the first page), go to the previous page
        await getDistricts(page - 1);
      } else {
        // Otherwise refresh the current page
        await getDistricts(page);
      }

      showNotification("success", "Success", "District deleted successfully!");
    } else {
      showNotification("error", "Error", res.data.message || "Failed to delete district");
    }
  } catch (err) {
    showNotification("error", "Error", "An error occurred while deleting the district");
    console.error("Error deleting district:", err);
  }
};

// Show delete confirmation
const deleteDistrict = (id) => {
  showConfirmation(
    "Delete District",
    "Are you sure you want to delete this district?",
    performDeleteDistrict,
    id
  );
};

// Lifecycle Hook
onMounted(async () => {
  isLoading.value = true;
  error.value = null;

  try {
    // Load provinces first
    await getProvinces();
    // Then load districts
    await getDistricts(1);
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
/* Additional styling for sortable columns */
th a {
  color: inherit;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

th a:hover {
  text-decoration: underline;
}
</style>
