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
                  v-for="province in state.provinces"
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
          </div>
          <div class="col-auto">
            <button class="btn btn-primary" @click="openModal">
              <span class="fas fa-plus me-2"></span>Add Village
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
              <th class="align-middle">Village Name</th>
              <th class="align-middle">Village Local Name</th>
              <th class="align-middle">Province</th>
              <th class="align-middle">District</th>
              <th class="align-middle">Commune</th>
              <th class="align-middle text-end">Created At</th>
              <th class="align-middle text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredVillages.length === 0">
              <td colspan="7" class="text-center">No village found</td>
            </tr>
            <tr v-else v-for="(village, index) in filteredVillages" :key="village.id">
              <td class="align-middle ps-0">
                {{ index + 1 + (currentPage - 1) * pageSize }}
              </td>
              <td class="align-middle">{{ village.name }}</td>
              <td class="align-middle">{{ village.local_name }}</td>
              <td class="align-middle">{{ village.province.name }}</td>
              <td class="align-middle">{{ village.district.name }}</td>
              <td class="align-middle">{{ village.commune.name }}</td>
              <td class="align-middle text-end">{{ formatDate(village.created_at) }}</td>
              <td class="align-middle text-end">
                <button
                  class="btn btn-sm btn-primary me-2"
                  @click="editVillage(village.id)"
                >
                  <span class="fas fa-edit me-1"></span>Edit
                </button>
                <button class="btn btn-sm btn-danger" @click="deleteVillage(village.id)">
                  <span class="fas fa-trash me-1"></span>Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="row align-items-center justify-content-between py-2 pe-0 fs-9">
          <div class="col-auto d-flex">
            <p
              class="mb-0 d-none d-sm-block me-3 fw-semibold text-body"
              data-list-info="data-list-info"
            >
              Showing page {{ state.paginate.current_page }} of
              {{ state.paginate.last_page }}
            </p>
            <a
              class="fw-semibold"
              href="#!"
              @click.prevent="fetchVillages(1)"
              data-list-view="*"
            >
              View all
              <span class="fas fa-angle-right ms-1" data-fa-transform="down-1"></span>
            </a>
          </div>
          <div class="col-auto d-flex">
            <button
              class="page-link"
              :disabled="state.paginate.current_page === 1"
              @click.prevent="fetchVillages(state.paginate.current_page - 1)"
              data-list-pagination="prev"
            >
              <span class="fas fa-chevron-left"></span>
            </button>
            <ul class="pagination mb-0">
              <li class="page-item" v-for="page in totalPages" :key="page">
                <button
                  class="page-link"
                  :class="{ active: currentPage === page }"
                  @click.prevent="fetchVillages(page)"
                >
                  {{ page }}
                </button>
              </li>
            </ul>
            <button
              class="page-link pe-0"
              :disabled="!state.paginate.has_more_pages"
              @click.prevent="fetchVillages(state.paginate.current_page + 1)"
              data-list-pagination="next"
            >
              <span class="fas fa-chevron-right"></span>
            </button>
          </div>
        </div>
      </div>
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
          <h4>{{ isEditMode ? "Edit" : "Create" }} Village</h4>
          <div v-if="modalMessage" class="alert alert-danger">{{ modalMessage }}</div>
          <form
            class="row g-3 needs-validation"
            novalidate
            @submit.prevent="handleSubmit"
          >
            <div class="col-md-12">
              <label class="form-label" for="villageName">Village Name</label>
              <input
                v-model="newVillage.name"
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
                v-model="newVillage.local_name"
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
                v-model="newVillage.province_id"
                class="form-select"
                id="provinceId"
                required
                @change="updateModalDistrictOptions"
              >
                <option value="">Select a province</option>
                <option
                  v-for="province in state.provinces"
                  :key="province.id"
                  :value="province.id"
                >
                  {{ province.name }}
                </option>
              </select>
              <div class="invalid-feedback">Please select a province</div>
            </div>
            <div class="col-md-12">
              <label class="form-label" for="districtId">District</label>
              <select
                v-model="newVillage.district_id"
                class="form-select"
                id="districtId"
                required
                :disabled="!newVillage.province_id"
                @change="updateModalCommuneOptions"
              >
                <option value="">Select a district</option>
                <option
                  v-for="district in filteredDistricts"
                  :key="district.id"
                  :value="district.id"
                >
                  {{ district.name }}
                </option>
              </select>
              <div class="invalid-feedback">Please select a district</div>
            </div>
            <div class="col-md-12">
              <label class="form-label" for="communeId">Commune</label>
              <select
                v-model="newVillage.commune_id"
                class="form-select"
                id="communeId"
                required
                :disabled="!newVillage.district_id"
              >
                <option value="">Select a commune</option>
                <option
                  v-for="commune in filteredCommunes"
                  :key="commune.id"
                  :value="commune.id"
                >
                  {{ commune.name }}
                </option>
              </select>
              <div class="invalid-feedback">Please select a commune</div>
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
import { computed, onMounted, reactive, ref, watch } from "vue";

// Get toast functionality from the composable
const { toasts, showNotification, removeToast } = useToast();

const state = reactive({
  villages: [],
  provinces: [],
  districts: [],
  communes: [],
  isLoading: false,
  error: null,
  paginate: {
    has_more_pages: false,
    current_page: 1,
    last_page: 1,
  },
});

// Filtering states
const searchQuery = ref("");
const selectedProvince = ref("");
const selectedDistrict = ref("");
const selectedCommune = ref("");
const filteredDistrictOptions = ref([]);
const filteredCommuneOptions = ref([]);

// Modal states
const showModal = ref(false);
const isEditMode = ref(false);
const currentVillageId = ref(null);
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

// Form data
const newVillage = reactive({
  name: "",
  local_name: "",
  province_id: "",
  district_id: "",
  commune_id: "",
});

// Pagination variables
const currentPage = ref(1);
const pageSize = 10;

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

// Utility function to format date
const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString();
};

// Filter handlers for top filters
const handleProvinceChange = () => {
  selectedDistrict.value = "";
  selectedCommune.value = "";
  // Update district dropdown options
  filteredDistrictOptions.value = state.districts.filter(
    (district) => String(district.province.id) === String(selectedProvince.value)
  );
};

const handleDistrictChange = () => {
  selectedCommune.value = "";
  // Update commune dropdown options
  filteredCommuneOptions.value = state.communes.filter(
    (commune) => String(commune.district.id) === String(selectedDistrict.value)
  );
};

// Modal dropdown handlers
const updateModalDistrictOptions = () => {
  newVillage.district_id = "";
  newVillage.commune_id = "";
};

const updateModalCommuneOptions = () => {
  newVillage.commune_id = "";
};

// Fetch all villages data
const fetchVillages = async (page = 1) => {
  const globalStore = useGlobalStore();
  state.isLoading = true;
  state.error = null;
  try {
    const res = await axios.get(
      `/api/villages?page=${page}`,
      globalStore.getAxiosHeader()
    );
    if (res.data.result && Array.isArray(res.data.data)) {
      state.villages = res.data.data;
      state.paginate = res.data.paginate;
      currentPage.value = res.data.paginate.current_page;
    } else {
      state.error = res.data.message || "Failed to fetch villages";
      showNotification("error", "Error", state.error);
    }
  } catch (err) {
    state.error = err.message || "An error occurred while fetching villages";
    showNotification("error", "Error", state.error);
  } finally {
    state.isLoading = false;
  }
};

// Fetch all provinces
const fetchProvinces = async () => {
  const globalStore = useGlobalStore();
  try {
    const res = await axios.get("/api/provinces", globalStore.getAxiosHeader());
    if (res.data.result && Array.isArray(res.data.data)) {
      state.provinces = res.data.data;
    } else {
      const errorMsg = res.data.message || "Failed to fetch provinces";
      console.error(errorMsg);
      showNotification("error", "Error", errorMsg);
    }
  } catch (err) {
    const errorMsg = err.message || "An error occurred while fetching provinces";
    console.error(errorMsg);
    showNotification("error", "Error", errorMsg);
  }
};

// Fetch all districts
const fetchDistricts = async () => {
  const globalStore = useGlobalStore();
  try {
    const res = await axios.get("/api/districts", globalStore.getAxiosHeader());
    if (res.data.result && Array.isArray(res.data.data)) {
      state.districts = res.data.data;
    } else {
      const errorMsg = res.data.message || "Failed to fetch districts";
      console.error(errorMsg);
      showNotification("error", "Error", errorMsg);
    }
  } catch (err) {
    const errorMsg = err.message || "An error occurred while fetching districts";
    console.error(errorMsg);
    showNotification("error", "Error", errorMsg);
  }
};

// Fetch all communes
const fetchCommunes = async () => {
  const globalStore = useGlobalStore();
  try {
    const res = await axios.get("/api/communes", globalStore.getAxiosHeader());
    if (res.data.result && Array.isArray(res.data.data)) {
      state.communes = res.data.data;
    } else {
      const errorMsg = res.data.message || "Failed to fetch communes";
      console.error(errorMsg);
      showNotification("error", "Error", errorMsg);
    }
  } catch (err) {
    const errorMsg = err.message || "An error occurred while fetching communes";
    console.error(errorMsg);
    showNotification("error", "Error", errorMsg);
  }
};

// Computed for filtered villages
const filteredVillages = computed(() => {
  let filtered = state.villages.filter((village) => {
    const nameMatch = village.name
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());
    const localNameMatch = village.local_name
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());
    const provinceMatch =
      !selectedProvince.value ||
      String(village.province.id) === String(selectedProvince.value);
    const districtMatch =
      !selectedDistrict.value ||
      String(village.district.id) === String(selectedDistrict.value);
    const communeMatch =
      !selectedCommune.value ||
      String(village.commune.id) === String(selectedCommune.value);
    return nameMatch && provinceMatch && districtMatch && communeMatch && localNameMatch;
  });
  return filtered;
});

// Computed for filtered districts in the modal
const filteredDistricts = computed(() => {
  if (!newVillage.province_id) return [];
  return state.districts.filter(
    (district) => String(district.province.id) === String(newVillage.province_id)
  );
});

// Computed for filtered communes in the modal
const filteredCommunes = computed(() => {
  if (!newVillage.district_id) return [];
  return state.communes.filter(
    (commune) => String(commune.district.id) === String(newVillage.district_id)
  );
});

// Computed for pagination
const totalPages = computed(() => {
  const pages = [];
  for (let i = 1; i <= state.paginate.last_page; i++) {
    pages.push(i);
  }
  return pages;
});

// Watch for changes in selection fields
watch(
  () => newVillage.province_id,
  () => {
    newVillage.district_id = "";
    newVillage.commune_id = "";
  }
);

watch(
  () => newVillage.district_id,
  () => {
    newVillage.commune_id = "";
  }
);

// Modal controls
const openModal = () => {
  showModal.value = true;
  isEditMode.value = false;
  newVillage.name = "";
  newVillage.local_name = "";
  newVillage.province_id = "";
  newVillage.district_id = "";
  newVillage.commune_id = "";
  modalMessage.value = "";
};

const closeModal = () => {
  showModal.value = false;
  modalMessage.value = "";
};

// Form submission handler
const handleSubmit = async () => {
  if (isSubmitting.value) return;

  // Form validation
  if (!newVillage.name.trim()) {
    modalMessage.value = "Village name is required";
    return;
  }
  if (!newVillage.local_name.trim()) {
    modalMessage.value = "Village local name is required";
    return;
  }
  if (!newVillage.province_id) {
    modalMessage.value = "Province is required";
    return;
  }
  if (!newVillage.district_id) {
    modalMessage.value = "District is required";
    return;
  }
  if (!newVillage.commune_id) {
    modalMessage.value = "Commune is required";
    return;
  }

  isSubmitting.value = true;
  modalMessage.value = "";

  try {
    const globalStore = useGlobalStore();
    const config = globalStore.getAxiosHeader();
    const data = {
      name: newVillage.name,
      local_name: newVillage.local_name,
      province_id: newVillage.province_id,
      district_id: newVillage.district_id,
      commune_id: newVillage.commune_id,
    };
    const res = isEditMode.value
      ? await axios.put(`/api/villages/${currentVillageId.value}`, data, config)
      : await axios.post("/api/villages", data, config);

    if (res.data.result) {
      await fetchVillages(state.paginate.current_page);
      closeModal();

      const successMsg = isEditMode.value
        ? "Village updated successfully!"
        : "Village created successfully!";
      showNotification("success", "Success", successMsg);
    } else {
      modalMessage.value = res.data.message || "Failed to save village";
    }
  } catch (error) {
    modalMessage.value =
      error.response?.data?.message || error.message || "An error occurred";
  } finally {
    isSubmitting.value = false;
  }
};

// Edit village - fetch and populate form
const editVillage = async (id) => {
  isEditMode.value = true;
  currentVillageId.value = id;
  modalMessage.value = "";

  const globalStore = useGlobalStore();
  const config = globalStore.getAxiosHeader();
  try {
    const res = await axios.get(`/api/villages/${id}`, config);
    if (res.data.result) {
      const village = res.data.data;
      newVillage.name = village.name;
      newVillage.local_name = village.local_name;
      newVillage.province_id = village.province_id;

      // Need to wait for province selection to update district options
      await nextTick();
      newVillage.district_id = village.district_id;

      // Need to wait for district selection to update commune options
      await nextTick();
      newVillage.commune_id = village.commune_id;

      showModal.value = true;
    } else {
      showNotification("error", "Error", "Failed to fetch village details");
    }
  } catch (error) {
    console.error(error);
    showNotification("error", "Error", "Failed to fetch village details");
  }
};

// Perform delete operation
const performDeleteVillage = async (id) => {
  const globalStore = useGlobalStore();
  const config = globalStore.getAxiosHeader();
  try {
    const res = await axios.delete(`/api/villages/${id}`, config);
    if (res.data.result) {
      await fetchVillages(state.paginate.current_page);
      showNotification("success", "Success", "Village deleted successfully!");
    } else {
      showNotification("error", "Error", res.data.message || "Failed to delete village");
    }
  } catch (error) {
    console.error(error);
    showNotification("error", "Error", "Failed to delete village");
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

// Lifecycle hook - fetch data on mount
onMounted(async () => {
  try {
    // Load data
    await Promise.all([
      fetchVillages(),
      fetchProvinces(),
      fetchDistricts(),
      fetchCommunes(),
    ]);
  } catch (err) {
    console.error("Failed to initialize:", err);
    showNotification("error", "Error", "Failed to load initial data");
  }
});

const nextTick = () => new Promise((resolve) => setTimeout(resolve, 0));
</script>
