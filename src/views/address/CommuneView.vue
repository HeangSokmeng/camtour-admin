<template>
  <div class="mb-9">
    <div class="row g-2 mb-4">
      <div class="col-auto">
        <h2 class="mb-0">Communes</h2>
      </div>
    </div>

    <div id="communes">
      <div class="mb-4">
        <div class="row g-3 justify-content-between">
          <div class="col-auto justify-content-between row g-3">
            <div class="search-box">
              <input
                v-model="searchQuery"
                class="form-control search-input search"
                type="search"
                placeholder="Search communes"
                @input="handleSearchInput"
              />
            </div>
            <div class="col-auto">
              <select
                class="form-select"
                aria-label="Province Filter"
                v-model="selectedProvince"
                @change="filterDistricts"
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
                aria-label="District Filter"
                v-model="selectedDistrict"
                @change="handleSearch"
              >
                <option value="">Filter District</option>
                <option
                  v-for="district in filteredDistricts"
                  :key="district.id"
                  :value="district.id"
                >
                  {{ district.name }}
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
              <i class="fas fa-plus me-2"></i>Add Commune
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

      <!-- Communes Table -->
      <div v-else class="table-responsive">
        <table class="table table-sm fs-9 mb-0">
          <thead>
            <tr>
              <th class="align-middle ps-0" style="width: 50px">#</th>
              <th class="align-middle">
                <a href="#" @click.prevent="toggleSort('name')">
                  Commune Name
                  <i
                    v-if="sortCol === 'name'"
                    :class="sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
                  ></i>
                </a>
              </th>
              <th class="align-middle">
                <a href="#" @click.prevent="toggleSort('local_name')">
                  Commune Local Name
                  <i
                    v-if="sortCol === 'local_name'"
                    :class="sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
                  ></i>
                </a>
              </th>
              <th class="align-middle">Province</th>
              <th class="align-middle">District</th>
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
            <tr v-if="communes.length === 0">
              <td colspan="7" class="text-center">No communes found</td>
            </tr>
            <tr v-else v-for="(commune, index) in communes" :key="commune.id">
              <td>{{ (paginationData.current_page - 1) * perPage + index + 1 }}</td>
              <td>{{ commune.name }}</td>
              <td>{{ commune.local_name }}</td>
              <td>{{ commune.province.name }}</td>
              <td>{{ commune.district.name }}</td>
              <td class="text-end">{{ formatDate(commune.created_at) }}</td>
              <td class="text-end">
                <button
                  class="btn btn-primary btn-sm me-2"
                  @click="openEditModal(commune)"
                >
                  <i class="fas fa-edit me-1"></i>Edit
                </button>
                <button class="btn btn-danger btn-sm" @click="deleteCommune(commune.id)">
                  <i class="fas fa-trash me-1"></i>Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <pagination
        v-if="!isLoading && communes.length > 0"
        :current-page="paginationData.current_page"
        :last-page="paginationData.last_page"
        :first-item="paginationData.first_item"
        :last-item="paginationData.last_item"
        :total="paginationData.total"
        @page-changed="changePage"
      />

      <!-- Commune Modal -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
          <h4>{{ isEditMode ? "Edit" : "Create" }} Commune</h4>

          <div v-if="modalError" class="alert alert-danger">
            {{ modalError }}
          </div>

          <form
            @submit.prevent="submitCommune"
            class="row g-3 needs-validation"
            novalidate
          >
            <div class="col-md-12">
              <label for="communeName" class="form-label">Commune Name</label>
              <input
                v-model.trim="communeForm.name"
                id="communeName"
                type="text"
                class="form-control"
                required
              />
              <div class="invalid-feedback">Commune name is required</div>
            </div>

            <div class="col-md-12">
              <label for="communeLocalName" class="form-label">Commune Local Name</label>
              <input
                v-model.trim="communeForm.local_name"
                id="communeLocalName"
                type="text"
                class="form-control"
                required
              />
              <div class="invalid-feedback">Commune local name is required</div>
            </div>

            <div class="col-md-12">
              <label for="provinceId" class="form-label">Province</label>
              <select
                v-model="communeForm.province_id"
                id="provinceId"
                class="form-select"
                required
                @change="filterDistrictsForModal"
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

            <div class="col-md-12">
              <label for="districtId" class="form-label">District</label>
              <select
                v-model="communeForm.district_id"
                id="districtId"
                class="form-select"
                required
                :disabled="!communeForm.province_id"
              >
                <option value="">Select a district</option>
                <option
                  v-for="district in modalDistrictOptions"
                  :key="district.id"
                  :value="district.id"
                >
                  {{ district.name }} ({{ district.local_name }})
                </option>
              </select>
              <div class="invalid-feedback">Please select a district</div>
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
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

// Get toast functionality from the composable
const { toasts, showNotification, removeToast } = useToast();

// Router and Store
const router = useRouter();
const globalStore = useGlobalStore();

// State Management
const communes = ref([]);
const provinces = ref([]);
const districts = ref([]);
const isLoading = ref(false);
const error = ref(null);

// Search and Filter
const searchQuery = ref("");
const selectedProvince = ref("");
const selectedDistrict = ref("");
let searchTimeout = null;

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
const communeForm = reactive({
  id: null,
  name: "",
  local_name: "",
  province_id: "",
  district_id: "",
});

// Modal District Options
const modalDistrictOptions = ref([]);

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

// Computed Properties
const filteredDistricts = computed(() => {
  return selectedProvince.value
    ? districts.value.filter(
        (district) => String(district.province.id) === String(selectedProvince.value)
      )
    : districts.value;
});

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
  await getCommunes(1);
};

// Toggle sorting
const toggleSort = async (column) => {
  if (sortCol.value === column) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortCol.value = column;
    sortDir.value = "asc";
  }

  await getCommunes(1);
};

// Handle pagination
const changePage = async (page) => {
  await getCommunes(page);
};

// Data Fetching
const fetchData = async (url, setData) => {
  isLoading.value = true;
  error.value = null;
  try {
    const res = await axios.get(url, globalStore.getAxiosHeader());
    if (res.data.result) {
      setData(res.data.data);
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

const getCommunes = async (page = 1) => {
  isLoading.value = true;
  error.value = null;

  try {
    const url = `/api/communes?page=${page}&per_page=${perPage.value}&sort_col=${sortCol.value}&sort_dir=${sortDir.value}&search=${searchQuery.value}&province=${selectedProvince.value}&district=${selectedDistrict.value}`;

    const res = await axios.get(url, globalStore.getAxiosHeader());

    if (res.data.result) {
      communes.value = res.data.data;

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
  return await fetchData("/api/provinces", (data) => {
    provinces.value = data;
  });
};

const getDistricts = async () => {
  return await fetchData("/api/districts", (data) => {
    districts.value = data;
  });
};

// Filter Methods
const filterDistricts = async () => {
  selectedDistrict.value = "";
  await handleSearch();
};

const filterDistrictsForModal = () => {
  communeForm.district_id = "";
  modalDistrictOptions.value = districts.value.filter(
    (district) => String(district.province.id) === String(communeForm.province_id)
  );
};

// Modal Methods
const openCreateModal = () => {
  isEditMode.value = false;
  communeForm.id = null;
  communeForm.name = "";
  communeForm.local_name = "";
  communeForm.province_id = "";
  communeForm.district_id = "";
  modalError.value = "";
  modalDistrictOptions.value = [];
  showModal.value = true;
};

const openEditModal = (commune) => {
  isEditMode.value = true;
  communeForm.id = commune.id;
  communeForm.name = commune.name;
  communeForm.local_name = commune.local_name;
  communeForm.province_id = commune.province.id;
  communeForm.district_id = commune.district.id;

  // Populate district options for the selected province
  modalDistrictOptions.value = districts.value.filter(
    (district) => String(district.province.id) === String(commune.province.id)
  );

  modalError.value = "";
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  modalError.value = "";
};

// CRUD Methods
const submitCommune = async () => {
  isSubmitting.value = true;
  modalError.value = "";

  try {
    const payload = {
      name: communeForm.name,
      local_name: communeForm.local_name,
      province_id: communeForm.province_id,
      district_id: communeForm.district_id,
    };

    const res = isEditMode.value
      ? await axios.put(
          `/api/communes/${communeForm.id}`,
          payload,
          globalStore.getAxiosHeader()
        )
      : await axios.post("/api/communes", payload, globalStore.getAxiosHeader());

    if (res.data.result) {
      await getCommunes(paginationData.current_page);
      closeModal();

      // Show success notification
      const message = isEditMode.value
        ? "Commune updated successfully!"
        : "Commune created successfully!";
      showNotification("success", "Success", message);
    } else {
      modalError.value = res.data.message || "Failed to save commune";
    }
  } catch (err) {
    modalError.value = err.response?.data?.message || "An error occurred";
  } finally {
    isSubmitting.value = false;
  }
};

// Perform delete operation
const performDeleteCommune = async (communeId) => {
  try {
    const res = await axios.delete(
      `/api/communes/${communeId}`,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      // Refresh the current page or go to the previous page if no items left
      const page = paginationData.current_page;
      const lastItemOnPage =
        (paginationData.current_page - 1) * perPage.value + communes.value.length;

      if (communes.value.length === 1 && paginationData.current_page > 1) {
        // If deleting the last item on a page (not the first page), go to the previous page
        await getCommunes(page - 1);
      } else {
        // Otherwise refresh the current page
        await getCommunes(page);
      }

      showNotification("success", "Success", "Commune deleted successfully!");
    } else {
      showNotification("error", "Error", res.data.message || "Failed to delete commune");
    }
  } catch (err) {
    showNotification("error", "Error", "An error occurred while deleting the commune");
    console.error("Error deleting commune:", err);
  }
};

// Show delete confirmation
const deleteCommune = (communeId) => {
  showConfirmation(
    "Delete Commune",
    "Are you sure you want to delete this commune?",
    performDeleteCommune,
    communeId
  );
};

// Lifecycle Hook
onMounted(async () => {
  isLoading.value = true;
  error.value = null;

  try {
    // Load data sequentially to ensure proper relationships
    const provincesLoaded = await getProvinces();
    if (!provincesLoaded) {
      showNotification("error", "Error", "Failed to load provinces");
      return;
    }

    const districtsLoaded = await getDistricts();
    if (!districtsLoaded) {
      showNotification("error", "Error", "Failed to load districts");
      return;
    }

    const communesLoaded = await getCommunes(1);
    if (!communesLoaded) {
      showNotification("error", "Error", "Failed to load communes");
    }
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

.page-item.active .page-link {
  background-color: var(--falcon-primary);
  border-color: var(--falcon-primary);
}

.page-link {
  position: relative;
  display: block;
  color: var(--falcon-primary);
  text-decoration: none;
  background-color: #ff0000;
  border: 1px solid #dee2e6;
  padding: 0.375rem 0.75rem;
}
</style>
