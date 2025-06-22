<template>
  <div class="mb-9">
    <div class="row g-2 mb-4">
      <div class="col-auto">
        <h2 class="mb-0">Hotel Locations</h2>
      </div>
    </div>
    <div id="location-management">
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
            <select
              v-model="selectedHotelFilter"
              class="form-select me-2"
              style="width: auto; display: inline-block"
            >
              <option value="">All Hotels</option>
              <option v-for="hotel in hotels" :key="hotel.id" :value="hotel.id">
                {{ hotel.name }}
              </option>
            </select>
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
              <th class="align-middle">Title</th>
              <th class="align-middle">Hotel</th>
              <th class="align-middle">Distance</th>
              <th class="align-middle">Description</th>
              <th class="align-middle text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredLocations.length === 0">
              <td colspan="6" class="text-center">No locations found</td>
            </tr>
            <tr v-else v-for="(location, index) in filteredLocations" :key="location.id">
              <td class="align-middle ps-0">{{ index + 1 }}</td>
              <td class="align-middle">{{ location.title }}</td>
              <td class="align-middle">
                {{ getHotelName(location.hotel_siem_reap_id) }}
              </td>
              <td class="align-middle">
                <span v-if="location.distance" class="badge bg-info">
                  {{ location.distance }}
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td class="align-middle">
                <span v-if="location.description" :title="location.description">
                  {{ truncateText(location.description, 50) }}
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td class="align-middle text-end">
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-primary" @click="editLocation(location.id)">
                    <span class="fas fa-edit"></span>
                  </button>
                  <button class="btn btn-danger" @click="deleteLocation(location.id)">
                    <span class="fas fa-trash"></span>
                  </button>
                </div>
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
        <div class="col-md-6">
          <label class="form-label" for="locationTitle">Location Title</label>
          <div class="location-title-section">
            <div
              v-if="!isEditMode && availableLocationTitles.length > 0"
              class="form-check-group mb-2"
            >
              <div class="form-check">
                <input
                  v-model="titleInputMethod"
                  class="form-check-input"
                  type="radio"
                  value="select"
                  id="selectExistingLocationTitle"
                />
                <label class="form-check-label" for="selectExistingLocationTitle">
                  Select Existing
                </label>
              </div>
              <div class="form-check">
                <input
                  v-model="titleInputMethod"
                  class="form-check-input"
                  type="radio"
                  value="create"
                  id="createNewLocationTitle"
                />
                <label class="form-check-label" for="createNewLocationTitle">
                  Create New
                </label>
              </div>
            </div>

            <div
              v-if="
                titleInputMethod === 'select' &&
                availableLocationTitles.length > 0 &&
                !isEditMode
              "
            >
              <select
                v-model="selectedExistingTitleId"
                class="form-select"
                @change="onExistingTitleSelect"
                required
              >
                <option value="" disabled>Choose an existing location title</option>
                <option
                  v-for="locationTitle in availableLocationTitles"
                  :key="locationTitle.id"
                  :value="locationTitle.id"
                >
                  {{ locationTitle.title }} ({{
                    locationTitle.distance || "No distance"
                  }})
                </option>
              </select>
            </div>

            <div
              v-if="
                titleInputMethod === 'create' ||
                availableLocationTitles.length === 0 ||
                isEditMode
              "
            >
              <input
                v-model="newLocation.title"
                class="form-control"
                id="locationTitle"
                type="text"
                placeholder="Enter location title..."
                required
              />
            </div>
          </div>
          <div class="invalid-feedback">Location title is required</div>
        </div>

        <div class="col-md-6">
          <label class="form-label" for="hotelSelect">Hotel</label>
          <select
            v-model="newLocation.hotel_siem_reap_id"
            class="form-select"
            id="hotelSelect"
            required
          >
            <option value="">Select a hotel</option>
            <option v-for="hotel in hotels" :key="hotel.id" :value="hotel.id">
              {{ hotel.name }}
            </option>
          </select>
          <div class="invalid-feedback">Hotel selection is required</div>
        </div>

        <div class="col-md-6">
          <label class="form-label" for="locationDistance">Distance</label>
          <div class="distance-section">
            <div
              v-if="!isEditMode && availableDistances.length > 0"
              class="form-check-group mb-2"
            >
              <div class="form-check">
                <input
                  v-model="distanceInputMethod"
                  class="form-check-input"
                  type="radio"
                  value="select"
                  id="selectExistingDistance"
                />
                <label class="form-check-label" for="selectExistingDistance">
                  Select Existing
                </label>
              </div>
              <div class="form-check">
                <input
                  v-model="distanceInputMethod"
                  class="form-check-input"
                  type="radio"
                  value="create"
                  id="createNewDistance"
                />
                <label class="form-check-label" for="createNewDistance">
                  Create New
                </label>
              </div>
            </div>

            <div
              v-if="
                distanceInputMethod === 'select' &&
                availableDistances.length > 0 &&
                !isEditMode
              "
            >
              <select
                v-model="selectedExistingDistanceId"
                class="form-select"
                @change="onExistingDistanceSelect"
              >
                <option value="" disabled>Choose an existing distance</option>
                <option
                  v-for="distance in availableDistances"
                  :key="distance.id"
                  :value="distance.id"
                >
                  {{ distance.distance }}
                </option>
              </select>
            </div>

            <div
              v-if="
                distanceInputMethod === 'create' ||
                availableDistances.length === 0 ||
                isEditMode
              "
            >
              <input
                v-model="newLocation.distance"
                class="form-control"
                id="locationDistance"
                type="text"
                placeholder="e.g., 5 km, 10 minutes walk..."
              />
            </div>
          </div>
        </div>

        <div class="col-12">
          <label class="form-label" for="locationDescription">Description</label>
          <textarea
            v-model="newLocation.description"
            class="form-control"
            id="locationDescription"
            rows="4"
            placeholder="Enter location description..."
          ></textarea>
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
import { useToast } from "@/composables/useToast";
import { useGlobalStore } from "@/stores/global";
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";

const { toasts, showNotification, removeToast } = useToast();
const globalStore = useGlobalStore();

const state = reactive({
  locations: [],
  isLoading: false,
  error: null,
});

const hotels = ref([]);
const searchQuery = ref("");
const selectedHotelFilter = ref("");
const showModal = ref(false);
const isEditMode = ref(false);
const currentLocationId = ref(null);
const isSubmitting = ref(false);
const modalMessage = ref("");

const titleInputMethod = ref("select");
const distanceInputMethod = ref("select");
const selectedExistingTitleId = ref("");
const selectedExistingDistanceId = ref("");

const confirmationModal = reactive({
  show: false,
  title: "Confirm Action",
  message: "Are you sure you want to proceed?",
  action: null,
  actionParams: null,
});

const newLocation = reactive({
  title: "",
  hotel_siem_reap_id: "",
  distance: "",
  description: "",
});

const availableLocationTitles = computed(() => {
  const uniqueTitles = [];
  const seen = new Set();

  state.locations.forEach((location) => {
    if (location.title && !seen.has(location.title)) {
      seen.add(location.title);
      uniqueTitles.push({
        id: location.id,
        title: location.title,
        distance: location.distance,
      });
    }
  });

  return uniqueTitles;
});

const availableDistances = computed(() => {
  const uniqueDistances = [];
  const seen = new Set();

  state.locations.forEach((location) => {
    if (location.distance && !seen.has(location.distance)) {
      seen.add(location.distance);
      uniqueDistances.push({
        id: location.id,
        distance: location.distance,
      });
    }
  });

  return uniqueDistances;
});

const onExistingTitleSelect = () => {
  if (selectedExistingTitleId.value) {
    const selectedTitle = availableLocationTitles.value.find(
      (title) => title.id === selectedExistingTitleId.value
    );
    if (selectedTitle) {
      newLocation.title = selectedTitle.title;
      if (selectedTitle.distance && !newLocation.distance) {
        newLocation.distance = selectedTitle.distance;
        distanceInputMethod.value = "create";
      }
    }
  }
};

const onExistingDistanceSelect = () => {
  if (selectedExistingDistanceId.value) {
    const selectedDistance = availableDistances.value.find(
      (distance) => distance.id === selectedExistingDistanceId.value
    );
    if (selectedDistance) {
      newLocation.distance = selectedDistance.distance;
    }
  }
};

const showConfirmation = (title, message, action, actionParams) => {
  confirmationModal.show = true;
  confirmationModal.title = title;
  confirmationModal.message = message;
  confirmationModal.action = action;
  confirmationModal.actionParams = actionParams;
};

const closeConfirmationModal = () => {
  confirmationModal.show = false;
  confirmationModal.action = null;
  confirmationModal.actionParams = null;
};

const confirmAction = () => {
  if (confirmationModal.action && typeof confirmationModal.action === "function") {
    confirmationModal.action(confirmationModal.actionParams);
  }
  closeConfirmationModal();
};

const truncateText = (text, maxLength) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

const getHotelName = (hotelId) => {
  if (!hotelId) return "Unknown";
  const hotel = hotels.value.find((h) => String(h.id) === String(hotelId));
  if (hotel) return hotel.name;

  const locationWithHotel = state.locations.find(
    (loc) => loc.hotel_siem_reap_id === hotelId || (loc.hotel && loc.hotel.id === hotelId)
  );
  if (locationWithHotel && locationWithHotel.hotel) {
    return locationWithHotel.hotel.name;
  }
  return "Unknown";
};

const fetchHotels = async () => {
  try {
    const res = await axios.get("/api/hotels/siemreap", globalStore.getAxiosHeader());
    if (res.data.result && Array.isArray(res.data.data)) {
      hotels.value = res.data.data;
    } else {
      console.error("Failed to fetch hotels:", res.data);
    }
  } catch (error) {
    console.error("Error fetching hotels:", error);
    await globalStore.onCheckError(error);
  }
};

const fetchLocations = async () => {
  state.isLoading = true;
  state.error = null;
  try {
    const params = {};
    if (selectedHotelFilter.value) {
      params.hotel_id = selectedHotelFilter.value;
    }

    const res = await axios.get("/api/locations/hotel", {
      ...globalStore.getAxiosHeader(),
      params,
    });
    if (res.data.result && Array.isArray(res.data.data)) {
      state.locations = res.data.data;
    } else {
      state.error = res.data.message || "Failed to fetch locations";
      console.error("API error when fetching locations:", res.data);
    }
  } catch (error) {
    console.error("Error fetching locations:", error);
    state.error = "An error occurred while fetching locations.";
    await globalStore.onCheckError(error);
  }
  state.isLoading = false;
};

const createLocation = async () => {
  isSubmitting.value = true;
  modalMessage.value = "";
  try {
    const locationData = {
      title: newLocation.title,
      hotel_siem_reap_id: newLocation.hotel_siem_reap_id,
      distance: newLocation.distance,
      description: newLocation.description,
    };
    const res = await axios.post(
      `/api/locations/hotel`,
      locationData,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      await fetchLocations();
      closeModal();
      resetForm();
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
        const errors = Object.values(error.response.data.errors).flat();
        modalMessage.value = errors.join("\n");
      } else {
        modalMessage.value = "An error occurred while creating the location.";
      }
    } else {
      modalMessage.value = "An error occurred while creating the location.";
    }
    await globalStore.onCheckError(error);
  }
  isSubmitting.value = false;
};

const updateLocation = async () => {
  isSubmitting.value = true;
  modalMessage.value = "";
  try {
    const locationData = {
      title: newLocation.title,
      hotel_siem_reap_id: newLocation.hotel_siem_reap_id,
      distance: newLocation.distance,
      description: newLocation.description,
    };
    const res = await axios.put(
      `/api/locations/hotel/${currentLocationId.value}`,
      locationData,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      await fetchLocations();
      closeModal();
      resetForm();
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
        const errors = Object.values(error.response.data.errors).flat();
        modalMessage.value = errors.join("\n");
      } else {
        modalMessage.value = "An error occurred while updating the location.";
      }
    } else {
      modalMessage.value = "An error occurred while updating the location.";
    }
    await globalStore.onCheckError(error);
  }
  isSubmitting.value = false;
};

const performDeleteLocation = async (locationId) => {
  try {
    const res = await axios.delete(
      `/api/locations/hotel/${locationId}`,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      state.locations = state.locations.filter((loc) => loc.id !== locationId);
      await fetchLocations();
      showNotification("success", "Success", "Location deleted successfully!");
    } else {
      showNotification("error", "Error", res.data.message || "Failed to delete location");
    }
  } catch (error) {
    showNotification("error", "Error", "An error occurred while deleting the location.");
    await globalStore.onCheckError(error);
  }
};

const deleteLocation = (locationId) => {
  showConfirmation(
    "Delete Location",
    "Are you sure you want to delete this location?",
    performDeleteLocation,
    locationId
  );
};

const openModal = () => {
  resetForm();
  isEditMode.value = false;
  titleInputMethod.value = availableLocationTitles.value.length > 0 ? "select" : "create";
  distanceInputMethod.value = availableDistances.value.length > 0 ? "select" : "create";
  showModal.value = true;
};

const editLocation = async (locationId) => {
  try {
    state.isLoading = true;
    let location = state.locations.find((loc) => String(loc.id) === String(locationId));
    if (!location) {
      const response = await axios.get(
        `/api/locations/hotel/${locationId}`,
        globalStore.getAxiosHeader()
      );
      if (response.data.result && response.data.data) {
        location = response.data.data;
      } else {
        showNotification("error", "Error", "Failed to fetch location details");
        state.isLoading = false;
        return;
      }
    }

    newLocation.title = location.title || "";
    newLocation.hotel_siem_reap_id = String(location.hotel_siem_reap_id || "");
    newLocation.distance = location.distance || "";
    newLocation.description = location.description || "";

    currentLocationId.value = locationId;
    isEditMode.value = true;
    showModal.value = true;
  } catch (error) {
    console.error("Error fetching location details:", error);
    showNotification(
      "error",
      "Error",
      "An error occurred while fetching location details"
    );
    await globalStore.onCheckError(error);
  } finally {
    state.isLoading = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
  modalMessage.value = "";
};

const resetForm = () => {
  newLocation.title = "";
  newLocation.hotel_siem_reap_id = "";
  newLocation.distance = "";
  newLocation.description = "";
  currentLocationId.value = null;
  selectedExistingTitleId.value = "";
  selectedExistingDistanceId.value = "";
};

const handleSubmit = async (event) => {
  event.preventDefault();
  if (!event.target.checkValidity()) {
    event.stopPropagation();
    event.target.classList.add("was-validated");
    return;
  }

  if (!newLocation.title.trim()) {
    modalMessage.value = "Location title is required";
    return;
  }
  if (!newLocation.hotel_siem_reap_id) {
    modalMessage.value = "Hotel selection is required";
    return;
  }

  if (isEditMode.value) {
    await updateLocation();
  } else {
    await createLocation();
  }
};

const filteredLocations = computed(() => {
  let filtered = state.locations;

  if (selectedHotelFilter.value) {
    filtered = filtered.filter(
      (loc) => String(loc.hotel_siem_reap_id) === String(selectedHotelFilter.value)
    );
  }

  if (searchQuery.value) {
    filtered = filtered.filter(
      (loc) =>
        loc.title?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        loc.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  return filtered;
});

onMounted(async () => {
  try {
    await fetchHotels();
    await fetchLocations();
  } catch (error) {
    console.error("Error during initialization:", error);
    showNotification("error", "Error", "Failed to initialize the component");
    await globalStore.onCheckError(error);
  }
});
</script>

<style scoped>
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

.form-check-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.form-check {
  display: flex;
  align-items: center;
}

.form-check-input {
  margin-right: 0.5rem;
}

.form-check-label {
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 0;
}

.location-title-section,
.distance-section {
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  padding: 1rem;
  background-color: #f8f9fa;
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

.form-control,
.form-select {
  border-color: #e5e5e5;
  padding: 0.5rem 0.75rem;
}

.form-control:focus,
.form-select:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.table th {
  background-color: #f8f9fa;
  font-weight: 500;
}

.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1050;
}

.toast-notification {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
  width: 300px;
  margin-bottom: 0.5rem;
  padding: 0.75rem 1rem;
  animation: toast-in 0.2s ease-in;
}

.toast-notification.success {
  border-left: 4px solid #198754;
}

.toast-notification.error {
  border-left: 4px solid #dc3545;
}

.toast-icon {
  margin-right: 0.75rem;
  color: #6c757d;
}

.toast-notification.success .toast-icon {
  color: #198754;
}

.toast-notification.error .toast-icon {
  color: #dc3545;
}

.toast-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.toast-message {
  color: #6c757d;
  font-size: 0.875rem;
}

.toast-close {
  margin-left: auto;
  background: none;
  border: none;
  color: #6c757d;
  font-size: 1.25rem;
  cursor: pointer;
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
</style>
