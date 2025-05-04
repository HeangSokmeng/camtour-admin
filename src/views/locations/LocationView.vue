<template>
  <div class="mb-9">
    <div class="row g-2 mb-4">
      <div class="col-auto">
        <h2 class="mb-0">Locations</h2>
      </div>
    </div>
    <div id="locations">
      <div class="mb-4">
        <div class="row g-3 justify-content-between">
          <div class="col-auto justify-content-between row g-3">
            <div class="search-box">
              <input
                v-model="searchQuery"
                class="form-control search-input search"
                type="search"
                placeholder="Search locations"
                @input="handleSearchInput"
              />
            </div>
            <div class="col-auto">
              <select
                v-model="selectedCategory"
                class="form-select"
                aria-label="Filter Category"
                @change="handleSearch"
              >
                <option value="">Filter Category</option>
                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
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
                @change="handleCommuneChange"
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
            <div class="col-auto">
              <select
                v-model="selectedVillage"
                class="form-select"
                aria-label="Filter Village"
                @change="handleSearch"
                :disabled="!selectedCommune"
              >
                <option value="">Filter Village</option>
                <option
                  v-for="village in filteredVillageOptions"
                  :key="village.id"
                  :value="village.id"
                >
                  {{ village.name }}
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
              <span class="fas fa-plus me-2"></span>Add Location
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
              <th class="align-middle">Thumbnail</th>
              <th class="align-middle">
                <a href="#" @click.prevent="toggleSort('name')">
                  Name
                  <i
                    v-if="sortCol === 'name'"
                    :class="sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
                  ></i>
                </a>
              </th>
              <th class="align-middle">
                <a href="#" @click.prevent="toggleSort('name_local')">
                  Local Name
                  <i
                    v-if="sortCol === 'name_local'"
                    :class="sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
                  ></i>
                </a>
              </th>
              <th class="align-middle">Category</th>
              <th class="align-middle">Province</th>
              <th class="align-middle">District</th>
              <th class="align-middle">
                <a href="#" @click.prevent="toggleSort('published_at')">
                  Published
                  <i
                    v-if="sortCol === 'published_at'"
                    :class="sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
                  ></i>
                </a>
              </th>
              <th class="align-middle text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="locations.length === 0">
              <td colspan="9" class="text-center">No location found</td>
            </tr>
            <tr v-else v-for="(location, index) in locations" :key="location.id">
              <td class="align-middle ps-0">
                {{ (paginationData.current_page - 1) * perPage + index + 1 }}
              </td>
              <td class="align-middle">
                <img
                  :src="location.thumbnail"
                  alt="Thumbnail"
                  class="location-thumbnail"
                  width="50"
                  height="50"
                />
              </td>
              <td class="align-middle">{{ location.name }}</td>
              <td class="align-middle">{{ location.name_local }}</td>
              <td class="align-middle">
                {{ location.category ? location.category.name : "Unknown" }}
              </td>
              <td class="align-middle">
                {{ location.province ? location.province.name : "Unknown" }}
              </td>
              <td class="align-middle">
                {{ location.district ? location.district.name : "Unknown" }}
              </td>
              <td class="align-middle">
                <span
                  class="badge"
                  :class="location.published_at ? 'bg-success' : 'bg-secondary'"
                >
                  {{ location.published_at ? "Published" : "Draft" }}
                </span>
              </td>
              <td class="align-middle text-end">
                <button
                  class="btn btn-sm btn-primary me-2"
                  @click="editLocation(location.id)"
                >
                  <span class="fas fa-edit me-1"></span>Edit
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  @click="deleteLocation(location.id)"
                >
                  <span class="fas fa-trash me-1"></span>Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <pagination
          v-if="!isLoading && locations.length > 0"
          :current-page="paginationData.current_page"
          :last-page="paginationData.last_page"
          :first-item="paginationData.first_item"
          :last-item="paginationData.last_item"
          :total="paginationData.total"
          @page-changed="changePage"
        />
      </div>
    </div>
  </div>

  <div v-if="showModal" class="modal-overlay">
    <div class="modal-content location-form">
      <h4>{{ isEditMode ? "Edit" : "Create" }} Location</h4>
      <div v-if="modalError" class="alert alert-danger">
        {{ modalError }}
      </div>
      <form class="row g-3 needs-validation" novalidate @submit.prevent="handleSubmit">
        <!-- Basic Information -->
        <div class="col-md-4">
          <label class="form-label" for="locationName">Location Name</label>
          <input
            v-model="locationForm.name"
            class="form-control"
            id="locationName"
            type="text"
            required
          />
          <div class="invalid-feedback">Location name is required</div>
        </div>
        <div class="col-md-4">
          <label class="form-label" for="locationLocalName">Local Name</label>
          <input
            v-model="locationForm.name_local"
            class="form-control"
            id="locationLocalName"
            type="text"
            required
          />
          <div class="invalid-feedback">Local name is required</div>
        </div>

        <!-- Category -->
        <div class="col-md-4">
          <label class="form-label" for="categoryId">Category</label>
          <select
            v-model="locationForm.category_id"
            class="form-select"
            id="categoryId"
            required
          >
            <option value="" disabled>Select a category</option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
          <div class="invalid-feedback">Category is required</div>
        </div>
        <div class="col-md-4">
          <label class="form-label" for="provinceId">Province</label>
          <select
            v-model="locationForm.province_id"
            class="form-select"
            id="provinceId"
            @change="updateFormDistricts"
            required
          >
            <option value="" disabled>Select a province</option>
            <option v-for="province in provinces" :key="province.id" :value="province.id">
              {{ province.name }}
            </option>
          </select>
          <div class="invalid-feedback">Province is required</div>
        </div>
        <div class="col-md-4">
          <label class="form-label" for="districtId">District</label>
          <select
            v-model="locationForm.district_id"
            class="form-select"
            id="districtId"
            @change="updateFormCommunes"
            :disabled="!locationForm.province_id"
            required
          >
            <option value="" disabled>Select a district</option>
            <option
              v-for="district in formDistricts"
              :key="district.id"
              :value="district.id"
            >
              {{ district.name }}
            </option>
          </select>
          <div class="invalid-feedback">District is required</div>
        </div>

        <div class="col-md-4">
          <label class="form-label" for="communeId">Commune</label>
          <select
            v-model="locationForm.commune_id"
            class="form-select"
            id="communeId"
            @change="updateFormVillages"
            :disabled="!locationForm.district_id"
          >
            <option value="" disabled>Select a commune</option>
            <option v-for="commune in formCommunes" :key="commune.id" :value="commune.id">
              {{ commune.name }}
            </option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label" for="villageId">Village</label>
          <select
            v-model="locationForm.village_id"
            class="form-select"
            id="villageId"
            :disabled="!locationForm.commune_id"
          >
            <option value="" disabled>Select a village</option>
            <option v-for="village in formVillages" :key="village.id" :value="village.id">
              {{ village.name }}
            </option>
          </select>
        </div>
        <!-- Geographic Information -->
        <div class="col-md-4">
          <label class="form-label" for="lat">Latitude</label>
          <input v-model="locationForm.lat" class="form-control" id="lat" type="text" />
        </div>
        <div class="col-md-4">
          <label class="form-label" for="lot">Longitude</label>
          <input v-model="locationForm.lot" class="form-control" id="lot" type="text" />
        </div>
        <!-- URL Location -->
        <div class="col-md-4">
          <label class="form-label" for="urlLocation">URL Location</label>
          <input
            v-model="locationForm.url_location"
            class="form-control"
            id="urlLocation"
            type="url"
          />
        </div>
        <!-- Short Description -->
        <div class="col-md-4">
          <label class="form-label" for="shortDescription">Short Description</label>
          <textarea
            v-model="locationForm.short_description"
            class="form-control"
            id="shortDescription"
            rows="1"
            required
          ></textarea>
          <div class="invalid-feedback">Short description is required</div>
        </div>

        <div class="col-md-4">
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              v-model="locationForm.published"
              id="locationPublished"
            />
            <label class="form-check-label" for="locationPublished">
              Publish this location
            </label>
          </div>
        </div>
        <!-- Thumbnail -->
        <div class="col-md-4">
          <label class="form-label" for="thumbnail">Thumbnail</label>
          <input
            type="file"
            class="form-control"
            id="thumbnail"
            @change="handleFileUpload"
            accept="image/*"
          />
          <div v-if="locationForm.thumbnail" class="mt-2">
            <img
              :src="
                typeof locationForm.thumbnail === 'string' ? locationForm.thumbnail : ''
              "
              alt="Preview"
              class="thumbnail-preview"
              width="100"
            />
          </div>
        </div>
        <!-- Tags -->
        <div class="col-md-8">
          <label class="form-label" for="tags">Tags</label>
          <select v-model="locationForm.tag_ids" class="form-select" id="tags" multiple>
            <option v-for="tag in tags" :key="tag.id" :value="tag.id">
              {{ tag.name }}
            </option>
          </select>
        </div>

        <!-- Full Description -->
        <div class="col-md-12">
          <label class="form-label" for="description">Full Description</label>
          <textarea
            v-model="locationForm.description"
            class="form-control"
            id="description"
            rows="4"
          ></textarea>
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
const locations = ref([]);
const isLoading = ref(false);
const error = ref(null);

// Filter and Search Options
const categories = ref([]);
const provinces = ref([]);
const districts = ref([]);
const communes = ref([]);
const villages = ref([]);
const tags = ref([]);

// Form State
const formDistricts = ref([]);
const formCommunes = ref([]);
const formVillages = ref([]);

// Pagination settings
const perPage = ref(10);
const sortCol = ref("id");
const sortDir = ref("desc");
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
const selectedCategory = ref("");
const selectedProvince = ref("");
const selectedDistrict = ref("");
const selectedCommune = ref("");
const selectedVillage = ref("");
let searchTimeout = null;

// Computed filter options
const filteredDistrictOptions = computed(() => {
  if (!selectedProvince.value) return [];
  return districts.value.filter(
    (district) => String(district.province_id) === String(selectedProvince.value)
  );
});

const filteredCommuneOptions = computed(() => {
  if (!selectedDistrict.value) return [];
  return communes.value.filter(
    (commune) => String(commune.district_id) === String(selectedDistrict.value)
  );
});

const filteredVillageOptions = computed(() => {
  if (!selectedCommune.value) return [];
  return villages.value.filter(
    (village) => String(village.commune_id) === String(selectedCommune.value)
  );
});

// Modal Management
const showModal = ref(false);
const isEditMode = ref(false);
const isSubmitting = ref(false);
const modalError = ref("");
const currentLocationId = ref(null);

// Confirmation modal state
const confirmationModal = reactive({
  show: false,
  title: "Confirm Action",
  message: "Are you sure you want to proceed?",
  action: null,
  actionParams: null,
});

// Location Form Data
const locationForm = reactive({
  name: "",
  name_local: "",
  thumbnail: null,
  url_location: "",
  short_description: "",
  description: "",
  lat: "",
  lot: "",
  category_id: "",
  province_id: "",
  district_id: "",
  commune_id: "",
  village_id: "",
  tag_ids: [],
  published: false,
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
  await getLocations(1);
};

// Toggle sorting
const toggleSort = async (column) => {
  if (sortCol.value === column) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortCol.value = column;
    sortDir.value = "asc";
  }

  await getLocations(1);
};

// Handle pagination
const changePage = async (page) => {
  await getLocations(page);
};

// Filter handlers
const handleProvinceChange = () => {
  selectedDistrict.value = "";
  selectedCommune.value = "";
  selectedVillage.value = "";
  handleSearch();
};

const handleDistrictChange = () => {
  selectedCommune.value = "";
  selectedVillage.value = "";
  handleSearch();
};

const handleCommuneChange = () => {
  selectedVillage.value = "";
  handleSearch();
};

// Form dropdown handlers for modal
const updateFormDistricts = async () => {
  locationForm.district_id = "";
  locationForm.commune_id = "";
  locationForm.village_id = "";

  if (!locationForm.province_id) {
    formDistricts.value = [];
    return;
  }

  try {
    const res = await axios.get(
      `/api/districts?province_id=${locationForm.province_id}`,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      formDistricts.value = res.data.data;
    }
  } catch (err) {
    console.error("Failed to fetch districts for form", err);
    formDistricts.value = [];
  }
};

const updateFormCommunes = async () => {
  locationForm.commune_id = "";
  locationForm.village_id = "";

  if (!locationForm.district_id) {
    formCommunes.value = [];
    return;
  }

  try {
    const res = await axios.get(
      `/api/communes?district_id=${locationForm.district_id}`,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      formCommunes.value = res.data.data;
    }
  } catch (err) {
    console.error("Failed to fetch communes for form", err);
    formCommunes.value = [];
  }
};

const updateFormVillages = async () => {
  locationForm.village_id = "";

  if (!locationForm.commune_id) {
    formVillages.value = [];
    return;
  }

  try {
    const res = await axios.get(
      `/api/villages?commune_id=${locationForm.commune_id}`,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      formVillages.value = res.data.data;
    }
  } catch (err) {
    console.error("Failed to fetch villages for form", err);
    formVillages.value = [];
  }
};

// Fetch locations data
const getLocations = async (page = 1) => {
  isLoading.value = true;
  error.value = null;

  try {
    // Build query URL with all filter parameters
    const url = `/api/locations?page=${page}&per_page=${perPage.value}&sort_col=${sortCol.value}&sort_dir=${sortDir.value}&search=${searchQuery.value}&category=${selectedCategory.value}&province=${selectedProvince.value}&district=${selectedDistrict.value}&commune=${selectedCommune.value}&village=${selectedVillage.value}`;

    console.log("API URL:", url);

    const res = await axios.get(url, globalStore.getAxiosHeader());

    if (res.data.result) {
      locations.value = res.data.data;

      // Update pagination data
      if (res.data.paginate) {
        Object.assign(paginationData, res.data.paginate);
      }

      return true;
    } else {
      error.value = res.data.message || "Failed to fetch locations";
      return false;
    }
  } catch (err) {
    error.value = err.message || "An error occurred while fetching locations";
    await globalStore.onCheckError(err, router);
    return false;
  } finally {
    isLoading.value = false;
  }
};

// Fetch options data
const getCategories = async () => {
  try {
    const res = await axios.get("/api/categories", globalStore.getAxiosHeader());
    if (res.data.result) {
      categories.value = res.data.data;
      return true;
    }
    return false;
  } catch (err) {
    console.error("Failed to fetch categories", err);
    showNotification("error", "Error", "Failed to fetch categories");
    return false;
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

const getVillages = async () => {
  try {
    const res = await axios.get("/api/villages", globalStore.getAxiosHeader());
    if (res.data.result) {
      villages.value = res.data.data;
      return true;
    }
    return false;
  } catch (err) {
    console.error("Failed to fetch villages", err);
    showNotification("error", "Error", "Failed to fetch villages");
    return false;
  }
};

const getTags = async () => {
  try {
    const res = await axios.get("/api/tags", globalStore.getAxiosHeader());
    if (res.data.result) {
      tags.value = res.data.data;
      return true;
    }
    return false;
  } catch (err) {
    console.error("Failed to fetch tags", err);
    showNotification("error", "Error", "Failed to fetch tags");
    return false;
  }
};

// File upload handling
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    locationForm.thumbnail = file;
  }
};

// Modal Methods
const openCreateModal = () => {
  isEditMode.value = false;
  currentLocationId.value = null;
  resetLocationForm();
  modalError.value = "";
  showModal.value = true;
};

const editLocation = async (locationId) => {
  isLoading.value = true;
  try {
    const res = await axios.get(
      `/api/locations/${locationId}`,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      const location = res.data.data;

      // Set basic info
      currentLocationId.value = locationId;
      locationForm.name = location.name || "";
      locationForm.name_local = location.name_local || "";
      locationForm.short_description = location.short_description || "";
      locationForm.description = location.description || "";
      locationForm.url_location = location.url_location || "";
      locationForm.lat = location.lat || "";
      locationForm.lot = location.lot || "";
      locationForm.category_id = location.category ? location.category.id : "";
      locationForm.published = !!location.published_at;

      // Set thumbnail if exists
      if (location.thumbnail && typeof location.thumbnail === "string") {
        locationForm.thumbnail = location.thumbnail;
      } else {
        locationForm.thumbnail = null;
      }

      // Set tags
      if (location.tags && Array.isArray(location.tags)) {
        locationForm.tag_ids = location.tags.map((tag) => tag.id);
      }
      // Handle location hierarchy in sequence
      locationForm.province_id = location.province ? location.province.id : "";

      // We need to fetch districts before setting district_id
      await updateFormDistricts();
      locationForm.district_id = location.district ? location.district.id : "";

      // We need to fetch communes before setting commune_id
      await updateFormCommunes();
      locationForm.commune_id = location.commune ? location.commune.id : "";

      // We need to fetch villages before setting village_id
      await updateFormVillages();
      locationForm.village_id = location.village ? location.village.id : "";

      isEditMode.value = true;
      showModal.value = true;
    } else {
      showNotification("error", "Error", "Failed to fetch location details");
    }
  } catch (err) {
    console.error("Error fetching location:", err);
    showNotification("error", "Error", "Failed to fetch location details");
  } finally {
    isLoading.value = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  modalError.value = "";
};

const resetLocationForm = () => {
  locationForm.name = "";
  locationForm.name_local = "";
  locationForm.thumbnail = null;
  locationForm.url_location = "";
  locationForm.short_description = "";
  locationForm.description = "";
  locationForm.lat = "";
  locationForm.lot = "";
  locationForm.category_id = "";
  locationForm.province_id = "";
  locationForm.district_id = "";
  locationForm.commune_id = "";
  locationForm.village_id = "";
  locationForm.tag_ids = [];
  locationForm.published = false;
};

// Form submission
const handleSubmit = async (event) => {
  event.preventDefault();

  // Validate required fields
  if (!locationForm.name.trim()) {
    modalError.value = "Location name is required";
    return;
  }

  if (!locationForm.name_local.trim()) {
    modalError.value = "Local name is required";
    return;
  }

  if (!locationForm.short_description.trim()) {
    modalError.value = "Short description is required";
    return;
  }

  if (!locationForm.category_id) {
    modalError.value = "Category is required";
    return;
  }

  if (!locationForm.province_id) {
    modalError.value = "Province is required";
    return;
  }

  if (!locationForm.district_id) {
    modalError.value = "District is required";
    return;
  }

  if (isEditMode.value) {
    await updateLocation();
  } else {
    await createLocation();
  }
};

// Create location
const createLocation = async () => {
  isSubmitting.value = true;
  modalError.value = "";

  try {
    // Create form data for submission
    const formData = new FormData();

    // Add basic location fields
    formData.append("name", locationForm.name);
    formData.append("name_local", locationForm.name_local);
    formData.append("short_description", locationForm.short_description);
    formData.append("description", locationForm.description || "");

    // Add geographical information
    formData.append("lat", locationForm.lat || "");
    formData.append("lot", locationForm.lot || "");
    formData.append("url_location", locationForm.url_location || "");

    // Add category and administrative areas
    formData.append("category_id", locationForm.category_id);
    formData.append("province_id", locationForm.province_id);
    formData.append("district_id", locationForm.district_id);

    if (locationForm.commune_id) {
      formData.append("commune_id", locationForm.commune_id);
    }

    if (locationForm.village_id) {
      formData.append("village_id", locationForm.village_id);
    }

    // Add tags if selected
    if (locationForm.tag_ids && locationForm.tag_ids.length > 0) {
      formData.append("tag_ids", JSON.stringify(locationForm.tag_ids));
    }

    // Add publication status with the correct format (Y-m-d H:i:s)
    if (locationForm.published) {
      const now = new Date();
      const formattedDate =
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(now.getDate()).padStart(2, "0") +
        " " +
        String(now.getHours()).padStart(2, "0") +
        ":" +
        String(now.getMinutes()).padStart(2, "0") +
        ":" +
        String(now.getSeconds()).padStart(2, "0");
      formData.append("published_at", formattedDate);
    }

    // Add thumbnail if selected
    if (locationForm.thumbnail instanceof File) {
      formData.append("thumbnail", locationForm.thumbnail);
    }

    const res = await axios.post(
      `/api/locations`,
      formData,
      globalStore.getAxiosHeader()
    );

    if (res.data.result) {
      await getLocations(paginationData.current_page);
      closeModal();
      showNotification("success", "Success", "Location created successfully!");
    } else {
      modalError.value = res.data.message || "Failed to create location";
    }
  } catch (error) {
    console.error("Error creating location:", error);
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        modalError.value = error.response.data.message;
      } else if (error.response.data.errors) {
        // Format validation errors
        const errors = Object.values(error.response.data.errors).flat();
        modalError.value = errors.join("\n");
      } else {
        modalError.value = "An error occurred while creating the location.";
      }
    } else {
      modalError.value = "An error occurred while creating the location.";
    }

    await globalStore.onCheckError(error, router);
  } finally {
    isSubmitting.value = false;
  }
};

// Update location
const updateLocation = async () => {
  isSubmitting.value = true;
  modalError.value = "";

  try {
    // Create form data for submission
    const formData = new FormData();

    // Add method override for Laravel
    formData.append("_method", "PUT");

    // Add basic location fields
    formData.append("name", locationForm.name);
    formData.append("name_local", locationForm.name_local);
    formData.append("short_description", locationForm.short_description);
    formData.append("description", locationForm.description || "");

    // Add geographical information
    formData.append("lat", locationForm.lat || "");
    formData.append("lot", locationForm.lot || "");
    formData.append("url_location", locationForm.url_location || "");

    // Add category and administrative areas
    formData.append("category_id", locationForm.category_id);
    formData.append("province_id", locationForm.province_id);
    formData.append("district_id", locationForm.district_id);

    if (locationForm.commune_id) {
      formData.append("commune_id", locationForm.commune_id);
    }

    if (locationForm.village_id) {
      formData.append("village_id", locationForm.village_id);
    }

    // Add tags if selected
    if (locationForm.tag_ids && locationForm.tag_ids.length > 0) {
      // Convert numeric strings to numbers if needed
      const tagIds = locationForm.tag_ids.map((id) =>
        typeof id === "string" ? parseInt(id, 10) : id
      );
      formData.append("tag_ids", JSON.stringify(tagIds));
    } else {
      // Send empty array if no tags selected
      formData.append("tag_ids", JSON.stringify([]));
    }

    // Add publication status with the correct format (Y-m-d H:i:s)
    if (locationForm.published) {
      const now = new Date();
      const formattedDate =
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(now.getDate()).padStart(2, "0") +
        " " +
        String(now.getHours()).padStart(2, "0") +
        ":" +
        String(now.getMinutes()).padStart(2, "0") +
        ":" +
        String(now.getSeconds()).padStart(2, "0");
      formData.append("published_at", formattedDate);
    } else {
      formData.append("published_at", "");
    }

    // Add thumbnail if selected
    if (locationForm.thumbnail instanceof File) {
      formData.append("thumbnail", locationForm.thumbnail);
    }

    // Use POST with _method=PUT for FormData
    const res = await axios.post(
      `/api/locations/${currentLocationId.value}`,
      formData,
      globalStore.getAxiosHeader()
    );

    if (res.data.result) {
      await getLocations(paginationData.current_page);
      closeModal();
      showNotification("success", "Success", "Location updated successfully!");
    } else {
      modalError.value = res.data.message || "Failed to update location";
    }
  } catch (error) {
    console.error("Error updating location:", error);
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        modalError.value = error.response.data.message;
      } else if (error.response.data.errors) {
        // Format validation errors
        const errors = Object.values(error.response.data.errors).flat();
        modalError.value = errors.join("\n");
      } else {
        modalError.value = "An error occurred while updating the location.";
      }
    } else {
      modalError.value = "An error occurred while updating the location.";
    }

    await globalStore.onCheckError(error, router);
  } finally {
    isSubmitting.value = false;
  }
};

// Delete location
const performDeleteLocation = async (id) => {
  try {
    const res = await axios.delete(`/api/locations/${id}`, globalStore.getAxiosHeader());

    if (res.data.result) {
      // If there was only one item on the current page and it's not the first page
      if (locations.value.length === 1 && paginationData.current_page > 1) {
        await getLocations(paginationData.current_page - 1);
      } else {
        await getLocations(paginationData.current_page);
      }

      showNotification("success", "Success", "Location deleted successfully!");
    } else {
      showNotification("error", "Error", res.data.message || "Failed to delete location");
    }
  } catch (err) {
    showNotification("error", "Error", "An error occurred while deleting the location");
    console.error("Error deleting location:", err);
    await globalStore.onCheckError(err, router);
  }
};

// Show delete confirmation
const deleteLocation = (id) => {
  showConfirmation(
    "Delete Location",
    "Are you sure you want to delete this location?",
    performDeleteLocation,
    id
  );
};

// Lifecycle Hook
onMounted(async () => {
  isLoading.value = true;
  error.value = null;

  try {
    // Load reference data in parallel
    await Promise.all([
      getCategories(),
      getProvinces(),
      getDistricts(),
      getCommunes(),
      getVillages(),
      getTags(),
    ]);

    // Then load locations
    await getLocations(1);
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
.location-thumbnail {
  object-fit: cover;
  border-radius: 4px;
}

.modal-overlay {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 30px;
  padding-bottom: 30px;
  overflow-y: auto;
}

.modal-content {
  top: 0;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  left: 0;
  overflow-y: auto;
  padding: 2rem;
  border-radius: 0.5rem;
  margin: auto;
}

.location-form .form-label {
  font-weight: 500;
}

.thumbnail-preview {
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

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

/* Media queries for responsive modal */
@media (max-width: 992px) {
  .modal-content {
    width: 95%;
    padding: 1.5rem;
  }
}

@media (max-height: 800px) {
  .modal-overlay {
    align-items: flex-start;
    padding: 20px 0;
  }
}
</style>
