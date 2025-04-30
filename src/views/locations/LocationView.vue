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
          <div class="col-auto">
            <div class="search-box">
              <input
                v-model="searchQuery"
                class="form-control search-input search"
                type="search"
                placeholder="Search locations"
              />
            </div>
          </div>
          <div class="col-auto">
            <button class="btn btn-primary" @click="openModal">
              <span class="fas fa-plus me-2"></span>Add Location
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
              <th class="align-middle">Thumbnail</th>
              <th class="align-middle">Name</th>
              <th class="align-middle">Local Name</th>
              <th class="align-middle">Category</th>
              <th class="align-middle">Province</th>
              <th class="align-middle">District</th>
              <th class="align-middle">Published</th>
              <th class="align-middle text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredLocations.length === 0">
              <td colspan="9" class="text-center">No location found</td>
            </tr>
            <tr v-else v-for="(location, index) in filteredLocations" :key="location.id">
              <td class="align-middle ps-0">{{ index + 1 }}</td>
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
      </div>
    </div>
  </div>

  <div v-if="showModal" class="modal-overlay">
    <div class="modal-content location-form">
      <h4>{{ isEditMode ? "Edit" : "Create" }} Location</h4>
      <div v-if="modalMessage" class="alert alert-danger">
        {{ modalMessage }}
      </div>
      <form class="row g-3 needs-validation" novalidate @submit.prevent="handleSubmit">
        <!-- Basic Information -->
        <div class="col-md-4">
          <label class="form-label" for="locationName">Location Name</label>
          <input
            v-model="newLocation.name"
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
            v-model="newLocation.name_local"
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
            v-model="newLocation.category_id"
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
            v-model="newLocation.province_id"
            class="form-select"
            id="provinceId"
            @change="fetchDistricts"
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
            v-model="newLocation.district_id"
            class="form-select"
            id="districtId"
            @change="fetchCommunes"
            :disabled="!newLocation.province_id"
            required
          >
            <option value="" disabled>Select a district</option>
            <option v-for="district in districts" :key="district.id" :value="district.id">
              {{ district.name }}
            </option>
          </select>
          <div class="invalid-feedback">District is required</div>
        </div>

        <div class="col-md-4">
          <label class="form-label" for="communeId">Commune</label>
          <select
            v-model="newLocation.commune_id"
            class="form-select"
            id="communeId"
            @change="fetchVillages"
            :disabled="!newLocation.district_id"
          >
            <option value="" disabled>Select a commune</option>
            <option v-for="commune in communes" :key="commune.id" :value="commune.id">
              {{ commune.name }}
            </option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label" for="villageId">Village</label>
          <select
            v-model="newLocation.village_id"
            class="form-select"
            id="villageId"
            :disabled="!newLocation.commune_id"
          >
            <option value="" disabled>Select a village</option>
            <option v-for="village in villages" :key="village.id" :value="village.id">
              {{ village.name }}
            </option>
          </select>
        </div>
        <!-- Geographic Information -->
        <div class="col-md-4">
          <label class="form-label" for="lat">Latitude</label>
          <input v-model="newLocation.lat" class="form-control" id="lat" type="text" />
        </div>
        <div class="col-md-4">
          <label class="form-label" for="lot">Longitude</label>
          <input v-model="newLocation.lot" class="form-control" id="lot" type="text" />
        </div>
        <!-- URL Location -->
        <div class="col-md-4">
          <label class="form-label" for="urlLocation">URL Location</label>
          <input
            v-model="newLocation.url_location"
            class="form-control"
            id="urlLocation"
            type="url"
          />
        </div>
        <!-- Short Description -->
        <div class="col-md-4">
          <label class="form-label" for="shortDescription">Short Description</label>
          <textarea
            v-model="newLocation.short_description"
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
              v-model="newLocation.published"
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
          <div v-if="newLocation.thumbnail" class="mt-2">
            <img
              :src="newLocation.thumbnail"
              alt="Preview"
              class="thumbnail-preview"
              width="100"
            />
          </div>
        </div>
        <!-- Tags -->
        <div class="col-md-8">
          <label class="form-label" for="tags">Tags</label>
          <select v-model="newLocation.tag_ids" class="form-select" id="tags" multiple>
            <option v-for="tag in tags" :key="tag.id" :value="tag.id">
              {{ tag.name }}
            </option>
          </select>
        </div>

        <!-- Full Description -->
        <div class="col-md-12">
          <label class="form-label" for="description">Full Description</label>
          <textarea
            v-model="newLocation.description"
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
import { useToast } from "@/composables/useToast";
import { useGlobalStore } from "@/stores/global";
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";

// Get toast functionality from the composable
const { toasts, showNotification, removeToast } = useToast();

const state = reactive({
  locations: [],
  isLoading: false,
  error: null,
});

// Data collections
const provinces = ref([]);
const districts = ref([]);
const communes = ref([]);
const villages = ref([]);
const categories = ref([]);
const tags = ref([]);

// UI state
const searchQuery = ref("");
const showModal = ref(false);
const isEditMode = ref(false);
const currentLocationId = ref(null);
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

// New location form data
const newLocation = reactive({
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

// Data fetching functions
const fetchLocations = async () => {
  state.isLoading = true;
  state.error = null;
  try {
    const res = await axios.get("/api/locations");
    if (res.data.result && Array.isArray(res.data.data)) {
      state.locations = res.data.data;
    } else {
      state.error = res.data.message || "Failed to fetch locations";
    }
  } catch (error) {
    state.error = "An error occurred while fetching locations.";
  }
  state.isLoading = false;
};

const fetchProvinces = async () => {
  try {
    const res = await axios.get("/api/provinces");
    if (res.data.result && Array.isArray(res.data.data)) {
      provinces.value = res.data.data;
    }
  } catch (error) {
    showNotification("error", "Error", "Failed to fetch provinces");
  }
};

const fetchDistricts = async () => {
  if (!newLocation.province_id) return;

  try {
    const res = await axios.get(`/api/districts?province_id=${newLocation.province_id}`);
    if (res.data.result && Array.isArray(res.data.data)) {
      districts.value = res.data.data;
      newLocation.district_id = "";
      newLocation.commune_id = "";
      newLocation.village_id = "";
    }
  } catch (error) {
    showNotification("error", "Error", "Failed to fetch districts");
  }
};

const fetchCommunes = async () => {
  if (!newLocation.district_id) return;

  try {
    const res = await axios.get(`/api/communes?district_id=${newLocation.district_id}`);
    if (res.data.result && Array.isArray(res.data.data)) {
      communes.value = res.data.data;
      newLocation.commune_id = "";
      newLocation.village_id = "";
    }
  } catch (error) {
    showNotification("error", "Error", "Failed to fetch communes");
  }
};

const fetchVillages = async () => {
  if (!newLocation.commune_id) return;

  try {
    const res = await axios.get(`/api/villages?commune_id=${newLocation.commune_id}`);
    if (res.data.result && Array.isArray(res.data.data)) {
      villages.value = res.data.data;
      newLocation.village_id = "";
    }
  } catch (error) {
    showNotification("error", "Error", "Failed to fetch villages");
  }
};

const fetchCategories = async () => {
  try {
    const res = await axios.get("/api/categories");
    if (res.data.result && Array.isArray(res.data.data)) {
      categories.value = res.data.data;
    }
  } catch (error) {
    showNotification("error", "Error", "Failed to fetch categories");
  }
};

const fetchTags = async () => {
  try {
    const res = await axios.get("/api/tags");
    if (res.data.result && Array.isArray(res.data.data)) {
      tags.value = res.data.data;
    }
  } catch (error) {
    showNotification("error", "Error", "Failed to fetch tags");
  }
};

// File upload handling
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    newLocation.thumbnail = file;
  }
};

// CRUD operations for locations
const createLocation = async () => {
  const globalStore = useGlobalStore();
  isSubmitting.value = true;
  modalMessage.value = "";

  try {
    // Create form data for submission
    const formData = new FormData();

    // Add basic location fields
    formData.append("name", newLocation.name);
    formData.append("name_local", newLocation.name_local);
    formData.append("short_description", newLocation.short_description);
    formData.append("description", newLocation.description || "");

    // Add geographical information
    formData.append("lat", newLocation.lat || "");
    formData.append("lot", newLocation.lot || "");
    formData.append("url_location", newLocation.url_location || "");

    // Add category and administrative areas
    formData.append("category_id", newLocation.category_id);
    formData.append("province_id", newLocation.province_id);
    formData.append("district_id", newLocation.district_id);

    if (newLocation.commune_id) {
      formData.append("commune_id", newLocation.commune_id);
    }

    if (newLocation.village_id) {
      formData.append("village_id", newLocation.village_id);
    }

    // Add tags if selected
    if (newLocation.tag_ids && newLocation.tag_ids.length > 0) {
      formData.append("tag_ids", JSON.stringify(newLocation.tag_ids));
    }

    // Add publication status with the correct format (Y-m-d H:i:s)
    if (newLocation.published) {
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
    if (newLocation.thumbnail instanceof File) {
      formData.append("thumbnail", newLocation.thumbnail);
    }

    const res = await axios.post(
      `/api/locations`,
      formData,
      globalStore.getAxiosHeader()
    );

    if (res.data.result) {
      await fetchLocations();
      closeModal();
      resetLocationForm();
      showNotification("success", "Success", "Location created successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to create location";
    }
  } catch (error) {
    console.error("Error creating location:", error);
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        modalMessage.value = error.response.data.message;
      } else if (error.response.data.errors) {
        // Format validation errors
        const errors = Object.values(error.response.data.errors).flat();
        modalMessage.value = errors.join("\n");
      } else {
        modalMessage.value = "An error occurred while creating the location.";
      }
    } else {
      modalMessage.value = "An error occurred while creating the location.";
    }

    const globalStore = useGlobalStore();
    await globalStore.onCheckError(error);
  }

  isSubmitting.value = false;
};

const updateLocation = async () => {
  const globalStore = useGlobalStore();
  isSubmitting.value = true;
  modalMessage.value = "";

  try {
    // Create form data for submission
    const formData = new FormData();

    // Add method override for Laravel
    formData.append("_method", "PUT");

    // Add basic location fields
    formData.append("name", newLocation.name);
    formData.append("name_local", newLocation.name_local);
    formData.append("short_description", newLocation.short_description);
    formData.append("description", newLocation.description || "");

    // Add geographical information
    formData.append("lat", newLocation.lat || "");
    formData.append("lot", newLocation.lot || "");
    formData.append("url_location", newLocation.url_location || "");

    // Add category and administrative areas
    formData.append("category_id", newLocation.category_id);
    formData.append("province_id", newLocation.province_id);
    formData.append("district_id", newLocation.district_id);

    if (newLocation.commune_id) {
      formData.append("commune_id", newLocation.commune_id);
    }

    if (newLocation.village_id) {
      formData.append("village_id", newLocation.village_id);
    }

    // Add tags if selected
    if (newLocation.tag_ids && newLocation.tag_ids.length > 0) {
      // Convert numeric strings to numbers if needed
      const tagIds = newLocation.tag_ids.map((id) =>
        typeof id === "string" ? parseInt(id, 10) : id
      );
      formData.append("tag_ids", JSON.stringify(tagIds));
    } else {
      // Send empty array if no tags selected
      formData.append("tag_ids", JSON.stringify([]));
    }

    // Add publication status with the correct format (Y-m-d H:i:s)
    if (newLocation.published) {
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
    if (newLocation.thumbnail instanceof File) {
      formData.append("thumbnail", newLocation.thumbnail);
    }

    // Use POST with _method=PUT for FormData
    const res = await axios.post(
      `/api/locations/${currentLocationId.value}`,
      formData,
      globalStore.getAxiosHeader()
    );

    if (res.data.result) {
      await fetchLocations();
      closeModal();
      resetLocationForm();
      showNotification("success", "Success", "Location updated successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to update location";
    }
  } catch (error) {
    console.error("Error updating location:", error);
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        modalMessage.value = error.response.data.message;
      } else if (error.response.data.errors) {
        // Format validation errors
        const errors = Object.values(error.response.data.errors).flat();
        modalMessage.value = errors.join("\n");
      } else {
        modalMessage.value = "An error occurred while updating the location.";
      }
    } else {
      modalMessage.value = "An error occurred while updating the location.";
    }

    const globalStore = useGlobalStore();
    await globalStore.onCheckError(error);
  }

  isSubmitting.value = false;
};

// Delete location function
const performDeleteLocation = async (locationId) => {
  const globalStore = useGlobalStore();
  try {
    const res = await axios.delete(
      `/api/locations/${locationId}`,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      state.locations = state.locations.filter((p) => p.id !== locationId);
      await fetchLocations();
      showNotification("success", "Success", "Location deleted successfully!");
    } else {
      showNotification("error", "Error", res.data.message || "Failed to delete location");
    }
  } catch (error) {
    showNotification("error", "Error", "An error occurred while deleting the location.");
    const globalStore = useGlobalStore();
    await globalStore.onCheckError(error);
  }
};

// Show delete confirmation
const deleteLocation = (locationId) => {
  showConfirmation(
    "Delete Location",
    "Are you sure you want to delete this location?",
    performDeleteLocation,
    locationId
  );
};

// Modal controls
const openModal = () => {
  resetLocationForm();
  isEditMode.value = false;
  showModal.value = true;
};

const editLocation = async (locationId) => {
  try {
    const globalStore = useGlobalStore();
    state.isLoading = true;

    // Fetch the full location data
    const response = await axios.get(
      `/api/locations/${locationId}`,
      globalStore.getAxiosHeader()
    );

    if (response.data.result && response.data.data) {
      const location = response.data.data;
      console.log("Fetched location:", location);

      // Set all the location fields
      newLocation.name = location.name || "";
      newLocation.name_local = location.name_local || "";
      newLocation.short_description = location.short_description || "";
      newLocation.description = location.description || "";
      newLocation.url_location = location.url_location || "";
      newLocation.lat = location.lat || "";
      newLocation.lot = location.lot || "";

      // Handle nested objects
      newLocation.category_id = location.category ? location.category.id : "";
      newLocation.province_id = location.province ? location.province.id : "";
      newLocation.district_id = location.district ? location.district.id : "";
      newLocation.commune_id = location.commune ? location.commune.id : "";
      newLocation.village_id = location.village ? location.village.id : "";

      console.log("Setting district_id:", newLocation.district_id);
      console.log("Setting commune_id:", newLocation.commune_id);
      console.log("Setting village_id:", newLocation.village_id);

      // Handle tags - convert to array of IDs
      if (location.tags && Array.isArray(location.tags)) {
        newLocation.tag_ids = location.tags.map((tag) => tag.id);
        console.log("Set tag_ids:", newLocation.tag_ids);
      } else {
        newLocation.tag_ids = [];
      }

      newLocation.published = !!location.published_at;

      // Maintain the existing thumbnail URL for display
      if (location.thumbnail && typeof location.thumbnail === "string") {
        newLocation.thumbnail = location.thumbnail;
      } else {
        newLocation.thumbnail = null;
      }

      currentLocationId.value = locationId;
      isEditMode.value = true;
      showModal.value = true;

      // Load related data in sequence
      try {
        // First load districts
        if (location.province && location.province.id) {
          const districtRes = await axios.get(
            `/api/districts?province_id=${location.province.id}`
          );
          if (districtRes.data.result && Array.isArray(districtRes.data.data)) {
            districts.value = districtRes.data.data;
            console.log("Loaded districts:", districts.value);
          }
        }

        // Then load communes
        if (location.district && location.district.id) {
          const communeRes = await axios.get(
            `/api/communes?district_id=${location.district.id}`
          );
          if (communeRes.data.result && Array.isArray(communeRes.data.data)) {
            communes.value = communeRes.data.data;
            console.log("Loaded communes:", communes.value);
          }
        }

        // Finally load villages
        if (location.commune && location.commune.id) {
          const villageRes = await axios.get(
            `/api/villages?commune_id=${location.commune.id}`
          );
          if (villageRes.data.result && Array.isArray(villageRes.data.data)) {
            villages.value = villageRes.data.data;
            console.log("Loaded villages:", villages.value);
          }
        }
      } catch (error) {
        console.error("Error loading dependent data:", error);
        showNotification("error", "Error", "Failed to load some dependent data");
      }
    } else {
      showNotification("error", "Error", "Failed to fetch location details");
    }
  } catch (error) {
    console.error("Error fetching location details:", error);
    showNotification(
      "error",
      "Error",
      "An error occurred while fetching location details"
    );
  } finally {
    state.isLoading = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  resetLocationForm();
  modalMessage.value = "";
};

const resetLocationForm = () => {
  newLocation.name = "";
  newLocation.name_local = "";
  newLocation.thumbnail = null;
  newLocation.url_location = "";
  newLocation.short_description = "";
  newLocation.description = "";
  newLocation.lat = "";
  newLocation.lot = "";
  newLocation.category_id = "";
  newLocation.province_id = "";
  newLocation.district_id = "";
  newLocation.commune_id = "";
  newLocation.village_id = "";
  newLocation.tag_ids = [];
  newLocation.published = false;
  currentLocationId.value = null;
};

const handleSubmit = async (event) => {
  event.preventDefault();

  // Validate required fields
  if (!newLocation.name.trim()) {
    modalMessage.value = "Location name is required";
    return;
  }

  if (!newLocation.name_local.trim()) {
    modalMessage.value = "Local name is required";
    return;
  }

  if (!newLocation.short_description.trim()) {
    modalMessage.value = "Short description is required";
    return;
  }

  if (!newLocation.category_id) {
    modalMessage.value = "Category is required";
    return;
  }

  if (!newLocation.province_id) {
    modalMessage.value = "Province is required";
    return;
  }

  if (!newLocation.district_id) {
    modalMessage.value = "District is required";
    return;
  }

  if (isEditMode.value) {
    await updateLocation();
  } else {
    await createLocation();
  }
};

const filteredLocations = computed(() => {
  return state.locations.filter(
    (location) =>
      location.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      location.name_local?.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Initialize data on component mount
onMounted(async () => {
  await Promise.all([fetchLocations(), fetchProvinces(), fetchCategories(), fetchTags()]);
});
</script>

<style scoped>
.location-thumbnail {
  object-fit: cover;
  border-radius: 4px;
}

.modal-overlay {
  position: fixed;
  top: 50px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.location-form .form-label {
  font-weight: 500;
}

.thumbnail-preview {
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

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
  z-index: 1100;
}

.confirmation-modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  overflow: hidden;
}

.confirmation-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dee2e6;
}

.confirmation-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.confirmation-icon.warning {
  background-color: #fff3cd;
  color: #ff9800;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.confirmation-body {
  padding: 1rem;
}

.confirmation-footer {
  padding: 1rem;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #dee2e6;
}
</style>
