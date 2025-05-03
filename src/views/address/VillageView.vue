<template>
  <div class="mb-9">
    <div class="row g-2 mb-4">
      <div class="col-auto">
        <h2 class="mb-0">Villages</h2>
      </div>
    </div>
    <div id="villages">
      <div class="mb-4">
        <div class="row g-3 justify-content-between">
          <div class="col-auto justify-content-between row g-3">
            <div class="search-box">
              <input
                v-model="searchQuery"
                class="form-control search-input search"
                type="search"
                placeholder="Search villages"
                @input="handleSearchInput"
              />
            </div>
            <div class="col-auto">
              <select
                v-model="selectedProvince"
                class="form-select"
                aria-label="Filter Province"
                @change="handleProvinceChange"
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
                v-model="selectedDistrict"
                class="form-select"
                aria-label="Filter District"
                @change="handleDistrictChange"
              >
                <option value="">Filter District</option>
                <option
                  v-for="district in filteredDistrictOptions"
                  :key="district.id"
                  :value="district.id"
                >
                  {{ district.name }}
                </option>
              </select>
            </div>
            <div class="col-auto">
              <select
                v-model="selectedCommune"
                class="form-select"
                aria-label="Filter Commune"
                @change="handleSearch"
              >
                <option value="">Filter Commune</option>
                <option
                  v-for="commune in filteredCommuneOptions"
                  :key="commune.id"
                  :value="commune.id"
                >
                  {{ commune.name }}
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
              <span class="fas fa-plus me-2"></span>Add Village
            </button>
          </div>
        </div>
      </div>
      <div v-if="isLoading" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-else-if="error" class="text-center text-danger">
        {{ error }}
      </div>
      <div v-else class="table-responsive">
        <table class="table table-sm fs-9 mb-0">
          <thead>
            <tr>
              <th class="align-middle ps-0">#</th>
              <th class="align-middle">
                <a href="#" @click.prevent="toggleSort('name')">
                  Village Name
                  <i
                    v-if="sortCol === 'name'"
                    :class="sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
                  ></i>
                </a>
              </th>
              <th class="align-middle">
                <a href="#" @click.prevent="toggleSort('local_name')">
                  Village Local Name
                  <i
                    v-if="sortCol === 'local_name'"
                    :class="sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
                  ></i>
                </a>
              </th>
              <th class="align-middle">Province</th>
              <th class="align-middle">District</th>
              <th class="align-middle">Commune</th>
              <th class="align-middle text-end">
                <a href="#" @click.prevent="toggleSort('created_at')">
                  Created At
                  <i
                    v-if="sortCol === 'created_at'"
                    :class="sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
                  ></i>
                </a>
              </th>
              <th class="align-middle text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="villages.length === 0">
              <td colspan="8" class="text-center">No village found</td>
            </tr>
            <tr v-else v-for="(village, index) in villages" :key="village.id">
              <td class="align-middle ps-0">
                {{ (paginationData.current_page - 1) * perPage + index + 1 }}
              </td>
              <td class="align-middle">{{ village.name }}</td>
              <td class="align-middle">{{ village.local_name }}</td>
              <td class="align-middle">{{ village.province.name }}</td>
              <td class="align-middle">{{ village.district.name }}</td>
              <td class="align-middle">{{ village.commune.name }}</td>
              <td class="align-middle text-end">{{ formatDate(village.created_at) }}</td>
              <td class="align-middle text-end">
                <button class="btn btn-sm btn-primary me-2" @click="editVillage(village)">
                  <span class="fas fa-edit me-1"></span>Edit
                </button>
                <button class="btn btn-sm btn-danger" @click="deleteVillage(village.id)">
                  <span class="fas fa-trash me-1"></span>Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <pagination
          v-if="!isLoading && villages.length > 0"
          :current-page="paginationData.current_page"
          :last-page="paginationData.last_page"
          :first-item="paginationData.first_item"
          :last-item="paginationData.last_item"
          :total="paginationData.total"
          @page-changed="changePage"
        />
      </div>

      <!-- Village Modal -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
          <h4>{{ isEditMode ? "Edit" : "Create" }} Village</h4>
          <div v-if="modalError" class="alert alert-danger">{{ modalError }}</div>
          <form
            class="row g-3 needs-validation"
            novalidate
            @submit.prevent="submitVillage"
          >
            <div class="col-md-12">
              <label class="form-label" for="villageName">Village Name</label>
              <input
                v-model="villageForm.name"
                class="form-control"
                id="villageName"
                type="text"
                required
              />
              <div class="invalid-feedback">Village name is required</div>
            </div>
            <div class="col-md-12">
              <label class="form-label" for="villageName">Village Local Name</label>
              <input
                v-model="villageForm.local_name"
                class="form-control"
                id="villageLocalName"
                type="text"
                required
              />
              <div class="invalid-feedback">Village local name is required</div>
            </div>
            <div class="col-md-12">
              <label class="form-label" for="provinceId">Province</label>
              <select
                v-model="villageForm.province_id"
                class="form-select"
                id="provinceId"
                required
                @change="updateModalDistrictOptions"
              >
                <option value="">Select a province</option>
                <option
                  v-for="province in provinces"
                  :key="province.id"
                  :value="province.id"
                >
                  {{ province.name }}
                </option>
              </select>
              <div class="invalid-feedback">Please select a province</div>
            </div>
            <div class="col-auto">
              <select
                v-model="selectedDistrict"
                class="form-select"
                aria-label="Filter District"
                @change="handleDistrictChange"
                :disabled="!selectedProvince"
              >
                <option value="">Filter District</option>
                <option
                  v-for="district in filteredDistrictOptions"
                  :key="district.id"
                  :value="district.id"
                >
                  {{ district.name }}
                </option>
              </select>
            </div>
            <div class="col-auto">
              <select
                v-model="selectedCommune"
                class="form-select"
                aria-label="Filter Commune"
                @change="handleSearch"
                :disabled="!selectedDistrict"
              >
                <option value="">Filter Commune</option>
                <option
                  v-for="commune in filteredCommuneOptions"
                  :key="commune.id"
                  :value="commune.id"
                >
                  {{ commune.name }}
                </option>
              </select>
            </div>
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
const villages = ref([]);
const provinces = ref([]);
const districts = ref([]);
const communes = ref([]);
const isLoading = ref(false);
const error = ref(null);

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
const selectedDistrict = ref("");
const selectedCommune = ref("");
let searchTimeout = null;

// Computed filter options
const filteredDistrictOptions = computed(() => {
  if (!selectedProvince.value) return [];
  return districts.value.filter(
    (district) => String(district.province.id) === String(selectedProvince.value)
  );
});

const filteredCommuneOptions = computed(() => {
  if (!selectedDistrict.value) return [];
  return communes.value.filter(
    (commune) => String(commune.district.id) === String(selectedDistrict.value)
  );
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
const villageForm = reactive({
  id: null,
  name: "",
  local_name: "",
  province_id: "",
  district_id: "",
  commune_id: "",
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
  await getVillages(1);
};

// Toggle sorting
const toggleSort = async (column) => {
  if (sortCol.value === column) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortCol.value = column;
    sortDir.value = "asc";
  }

  await getVillages(1);
};

// Handle pagination
const changePage = async (page) => {
  await getVillages(page);
};

// Filter handlers
const handleProvinceChange = () => {
  selectedDistrict.value = "";
  selectedCommune.value = "";
  handleSearch();
};

const handleDistrictChange = () => {
  selectedCommune.value = "";
  handleSearch();
};

// Modal dropdown handlers
const updateModalDistrictOptions = () => {
  villageForm.district_id = "";
  villageForm.commune_id = "";
};

const updateModalCommuneOptions = () => {
  villageForm.commune_id = "";
};

// Computed for filtered form options
const filteredDistricts = computed(() => {
  if (!villageForm.province_id) return [];
  return districts.value.filter(
    (district) => String(district.province.id) === String(villageForm.province_id)
  );
});

const filteredCommunes = computed(() => {
  if (!villageForm.district_id) return [];
  return communes.value.filter(
    (commune) => String(commune.district.id) === String(villageForm.district_id)
  );
});

// Fetch villages data
const getVillages = async (page = 1) => {
  isLoading.value = true;
  error.value = null;

  try {
    // Build query URL with all filter parameters
    const url = `/api/villages?page=${page}&per_page=${perPage.value}&sort_col=${sortCol.value}&sort_dir=${sortDir.value}&search=${searchQuery.value}&province=${selectedProvince.value}&district=${selectedDistrict.value}&commune=${selectedCommune.value}`;

    console.log("API URL:", url);
    console.log("Selected province:", selectedProvince.value);
    console.log("Selected district:", selectedDistrict.value);
    console.log("Selected commune:", selectedCommune.value);

    const res = await axios.get(url, globalStore.getAxiosHeader());

    if (res.data.result) {
      villages.value = res.data.data;

      // Update pagination data
      if (res.data.paginate) {
        Object.assign(paginationData, res.data.paginate);
      }

      return true;
    } else {
      error.value = res.data.message || "Failed to fetch villages";
      return false;
    }
  } catch (err) {
    error.value = err.message || "An error occurred while fetching villages";
    await globalStore.onCheckError(err, router);
    return false;
  } finally {
    isLoading.value = false;
  }
};

// Fetch additional data
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

const getDistricts = async () => {
  try {
    const res = await axios.get("/api/districts", globalStore.getAxiosHeader());
    if (res.data.result) {
      districts.value = res.data.data;
      return true;
    }
    return false;
  } catch (err) {
    console.error("Failed to fetch districts", err);
    showNotification("error", "Error", "Failed to fetch districts");
    return false;
  }
};

const getCommunes = async () => {
  try {
    const res = await axios.get("/api/communes", globalStore.getAxiosHeader());
    if (res.data.result) {
      communes.value = res.data.data;
      return true;
    }
    return false;
  } catch (err) {
    console.error("Failed to fetch communes", err);
    showNotification("error", "Error", "Failed to fetch communes");
    return false;
  }
};

// Modal Methods
const openCreateModal = () => {
  isEditMode.value = false;
  villageForm.id = null;
  villageForm.name = "";
  villageForm.local_name = "";
  villageForm.province_id = "";
  villageForm.district_id = "";
  villageForm.commune_id = "";
  modalError.value = "";
  showModal.value = true;
};

const editVillage = (village) => {
  isEditMode.value = true;
  villageForm.id = village.id;
  villageForm.name = village.name;
  villageForm.local_name = village.local_name;
  villageForm.province_id = village.province.id;

  // Set district and commune values after a brief delay to ensure computed properties update
  setTimeout(() => {
    villageForm.district_id = village.district.id;

    setTimeout(() => {
      villageForm.commune_id = village.commune.id;
    }, 10);
  }, 10);

  modalError.value = "";
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  modalError.value = "";
};

// Form submission
const submitVillage = async () => {
  if (isSubmitting.value) return;

  // Form validation
  if (!villageForm.name.trim()) {
    modalError.value = "Village name is required";
    return;
  }
  if (!villageForm.local_name.trim()) {
    modalError.value = "Village local name is required";
    return;
  }
  if (!villageForm.province_id) {
    modalError.value = "Province is required";
    return;
  }
  if (!villageForm.district_id) {
    modalError.value = "District is required";
    return;
  }
  if (!villageForm.commune_id) {
    modalError.value = "Commune is required";
    return;
  }

  isSubmitting.value = true;
  modalError.value = "";

  try {
    const data = {
      name: villageForm.name,
      local_name: villageForm.local_name,
      province_id: villageForm.province_id,
      district_id: villageForm.district_id,
      commune_id: villageForm.commune_id,
    };

    const res = isEditMode.value
      ? await axios.put(
          `/api/villages/${villageForm.id}`,
          data,
          globalStore.getAxiosHeader()
        )
      : await axios.post("/api/villages", data, globalStore.getAxiosHeader());

    if (res.data.result) {
      await getVillages(paginationData.current_page);
      closeModal();

      const successMsg = isEditMode.value
        ? "Village updated successfully!"
        : "Village created successfully!";
      showNotification("success", "Success", successMsg);
    } else {
      modalError.value = res.data.message || "Failed to save village";
    }
  } catch (error) {
    modalError.value =
      error.response?.data?.message || error.message || "An error occurred";
  } finally {
    isSubmitting.value = false;
  }
};

// Delete village
const performDeleteVillage = async (id) => {
  try {
    const res = await axios.delete(`/api/villages/${id}`, globalStore.getAxiosHeader());

    if (res.data.result) {
      // Refresh the current page or go to the previous page if no items left
      const page = paginationData.current_page;

      if (villages.value.length === 1 && paginationData.current_page > 1) {
        // If deleting the last item on a page (not the first page), go to the previous page
        await getVillages(page - 1);
      } else {
        // Otherwise refresh the current page
        await getVillages(page);
      }

      showNotification("success", "Success", "Village deleted successfully!");
    } else {
      showNotification("error", "Error", res.data.message || "Failed to delete village");
    }
  } catch (err) {
    showNotification("error", "Error", "An error occurred while deleting the village");
    console.error("Error deleting village:", err);
  }
};

// Show delete confirmation
const deleteVillage = (id) => {
  showConfirmation(
    "Delete Village",
    "Are you sure you want to delete this village?",
    performDeleteVillage,
    id
  );
};

// Lifecycle Hook
onMounted(async () => {
  isLoading.value = true;
  error.value = null;

  try {
    // Load data in sequence to ensure proper initialization
    await getProvinces();
    await getDistricts();
    await getCommunes();

    // Then load villages after dependencies are loaded
    await getVillages(1);
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
