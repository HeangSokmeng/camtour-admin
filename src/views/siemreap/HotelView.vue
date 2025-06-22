<template>
  <div class="mb-9">
    <div class="row g-2 mb-4">
      <div class="col-auto">
        <h2 class="mb-0">Hotel Management</h2>
      </div>
    </div>
    <div id="hotel-management">
      <div class="mb-4">
        <div class="row g-3 justify-content-between">
          <div class="col-auto">
            <div class="search-box">
              <input
                v-model="searchQuery"
                class="form-control search-input search"
                type="search"
                placeholder="Search hotels"
              />
            </div>
          </div>
          <div class="col-auto">
            <button class="btn btn-primary" @click="openModal">
              <span class="fas fa-plus me-2"></span>Add Hotel
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
              <th class="align-middle">Name (KM)</th>
              <th class="align-middle">Description</th>
              <th class="align-middle">Meals</th>
              <th class="align-middle">Room Types</th>
              <th class="align-middle">Locations</th>
              <th class="align-middle text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredHotels.length === 0">
              <td colspan="9" class="text-center">No hotels found</td>
            </tr>
            <tr v-else v-for="(hotel, index) in filteredHotels" :key="hotel.id">
              <td class="align-middle ps-0">{{ index + 1 }}</td>
              <td class="align-middle">
                <div class="hotel-thumbnail-preview">
                  <img
                    :src="getHotelThumbnailUrl(hotel.thumbnail)"
                    :alt="hotel.name"
                    class="hotel-thumbnail"
                  />
                </div>
              </td>
              <td class="align-middle">{{ hotel.name }}</td>
              <td class="align-middle">{{ hotel.name_km }}</td>
              <td class="align-middle">
                <span v-if="hotel.description" :title="hotel.description">
                  {{ truncateText(hotel.description, 50) }}
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td class="align-middle">
                <span
                  v-if="hotel.meals && hotel.meals.length > 0"
                  class="badge bg-warning"
                >
                  {{ hotel.meals.length }}
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td class="align-middle">
                <span class="badge bg-info">{{ hotel.room_types?.length || 0 }}</span>
              </td>
              <td class="align-middle">
                <span class="badge bg-success">{{ hotel.locations?.length || 0 }}</span>
              </td>
              <td class="align-middle text-end">
                <div class="btn-group btn-group-sm">
                  <button
                    class="btn btn-outline-info"
                    @click="viewThumbnail(hotel)"
                    :disabled="
                      !hotel.thumbnail || hotel.thumbnail === 'default-hotel.jpg'
                    "
                    title="View Thumbnail"
                  >
                    <span class="fas fa-eye"></span>
                  </button>
                  <button class="btn btn-primary" @click="editHotel(hotel.id)">
                    <span class="fas fa-edit"></span>
                  </button>
                  <button
                    class="btn btn-outline-danger"
                    @click="resetThumbnail(hotel.id)"
                    :disabled="
                      !hotel.thumbnail || hotel.thumbnail === 'default-hotel.jpg'
                    "
                    title="Reset Thumbnail"
                  >
                    <span class="fas fa-image"></span>
                  </button>
                  <button class="btn btn-danger" @click="deleteHotel(hotel.id)">
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
    <div class="modal-content hotel-form">
      <h4>{{ isEditMode ? "Edit" : "Create" }} Hotel</h4>
      <div v-if="modalMessage" class="alert alert-danger">
        {{ modalMessage }}
      </div>
      <form class="row g-3 needs-validation" novalidate @submit.prevent="handleSubmit">
        <div class="col-md-6">
          <label class="form-label" for="hotelName">Hotel Name</label>
          <input
            v-model="newHotel.name"
            class="form-control"
            id="hotelName"
            type="text"
            required
          />
          <div class="invalid-feedback">Hotel name is required</div>
        </div>

        <div class="col-md-6">
          <label class="form-label" for="hotelNameKm">Hotel Name (KM)</label>
          <input
            v-model="newHotel.name_km"
            class="form-control"
            id="hotelNameKm"
            type="text"
            required
          />
          <div class="invalid-feedback">Hotel name in Khmer is required</div>
        </div>

        <div class="col-md-6">
          <label class="form-label" for="hotelThumbnail">Hotel Thumbnail</label>
          <input
            ref="thumbnailInput"
            class="form-control"
            id="hotelThumbnail"
            type="file"
            accept="image/jpeg,image/png"
            @change="handleThumbnailSelect"
          />
          <small class="text-muted">JPEG, PNG only (max 2MB)</small>
        </div>

        <div v-if="thumbnailPreview" class="col-12">
          <div class="thumbnail-preview-container">
            <label class="form-label">Thumbnail Preview</label>
            <div class="thumbnail-preview">
              <img :src="thumbnailPreview" alt="Preview" class="preview-thumbnail" />
              <button
                type="button"
                class="btn btn-sm btn-outline-danger remove-preview"
                @click="removeThumbnailPreview"
              >
                <span class="fas fa-times"></span>
              </button>
            </div>
          </div>
        </div>

        <div>
          <label class="form-label" for="hotelDescription">Description</label>
          <textarea
            v-model="newHotel.description"
            class="form-control"
            id="hotelDescription"
            rows="4"
            placeholder="Enter hotel description..."
          ></textarea>
        </div>

        <div class="col-12">
          <label class="form-label">Meals</label>
          <div class="meals-input">
            <div class="input-group mb-2">
              <input
                v-model="newMealInput"
                class="form-control"
                type="text"
                placeholder="Enter meal option (e.g., Breakfast included, Half board)..."
                @keypress.enter.prevent="addMeal"
              />
              <button class="btn btn-outline-primary" type="button" @click="addMeal">
                <span class="fas fa-plus"></span>
              </button>
            </div>
            <div v-if="newHotel.meals && newHotel.meals.length > 0" class="meals-list">
              <div v-for="(meal, index) in newHotel.meals" :key="index" class="meal-tag">
                {{ meal }}
                <button type="button" class="btn-remove-meal" @click="removeMeal(index)">
                  &times;
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12">
          <label class="form-label">Services</label>
          <div class="services-input">
            <div class="input-group mb-2">
              <input
                v-model="newServiceInput"
                class="form-control"
                type="text"
                placeholder="Enter service..."
                @keypress.enter.prevent="addService"
              />
              <button class="btn btn-outline-primary" type="button" @click="addService">
                <span class="fas fa-plus"></span>
              </button>
            </div>
            <div
              v-if="newHotel.services && newHotel.services.length > 0"
              class="services-list"
            >
              <div
                v-for="(service, index) in newHotel.services"
                :key="index"
                class="service-tag"
              >
                {{ service }}
                <button
                  type="button"
                  class="btn-remove-service"
                  @click="removeService(index)"
                >
                  &times;
                </button>
              </div>
            </div>
          </div>
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
  <transition name="modal">
    <div v-if="previewThumbnail" class="modal-overlay" @click="closeThumbnailPreview">
      <div class="modal-content thumbnail-preview-modal" @click.stop>
        <div class="modal-header">
          <h5 class="modal-title">Hotel Thumbnail - {{ previewThumbnail.name }}</h5>
          <button class="btn-close" @click="closeThumbnailPreview">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="modal-body p-0">
          <img
            :src="previewThumbnail.url"
            :alt="previewThumbnail.name"
            class="img-fluid"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useToast } from "@/composables/useToast";
import { useGlobalStore } from "@/stores/global";
import axios from "axios";
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";

const { toasts, showNotification, removeToast } = useToast();
const globalStore = useGlobalStore();

const state = reactive({
  hotels: [],
  isLoading: false,
  error: null,
});

const searchQuery = ref("");
const showModal = ref(false);
const isEditMode = ref(false);
const currentHotelId = ref(null);
const isSubmitting = ref(false);
const modalMessage = ref("");
const newServiceInput = ref("");
const newMealInput = ref("");
const thumbnailInput = ref(null);
const thumbnailPreview = ref(null);
const selectedThumbnailFile = ref(null);
const previewThumbnail = ref(null);
const objectUrls = ref([]);

const confirmationModal = reactive({
  show: false,
  title: "Confirm Action",
  message: "Are you sure you want to proceed?",
  action: null,
  actionParams: null,
});

const newHotel = reactive({
  name: "",
  name_km: "",
  description: "",
  meals: [],
  services: [],
});

const cleanupObjectURLs = () => {
  objectUrls.value.forEach((url) => {
    URL.revokeObjectURL(url);
  });
  objectUrls.value = [];
};

const getHotelThumbnailUrl = (thumbnailPath) => {
  if (!thumbnailPath || thumbnailPath === "default-hotel.jpg") {
    return "/default-hotel.jpg";
  }
  return `${thumbnailPath}`;
};

const handleThumbnailSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 2048 * 1024) {
      modalMessage.value = "Thumbnail size must be less than 2MB";
      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      modalMessage.value = "Only JPEG and PNG images are allowed";
      return;
    }

    selectedThumbnailFile.value = file;
    const url = URL.createObjectURL(file);
    objectUrls.value.push(url);
    thumbnailPreview.value = url;
    modalMessage.value = "";
  }
};

const removeThumbnailPreview = () => {
  thumbnailPreview.value = null;
  selectedThumbnailFile.value = null;
  if (thumbnailInput.value) {
    thumbnailInput.value.value = "";
  }
};

const viewThumbnail = (hotel) => {
  if (hotel.thumbnail && hotel.thumbnail !== "default-hotel.jpg") {
    previewThumbnail.value = {
      url: getHotelThumbnailUrl(hotel.thumbnail),
      name: hotel.name,
    };
  }
};

const closeThumbnailPreview = () => {
  previewThumbnail.value = null;
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

const fetchHotels = async () => {
  state.isLoading = true;
  state.error = null;
  try {
    const res = await axios.get("/api/hotels/siemreap", globalStore.getAxiosHeader());
    if (res.data.result && Array.isArray(res.data.data)) {
      state.hotels = res.data.data;
    } else {
      state.error = res.data.message || "Failed to fetch hotels";
      console.error("API error when fetching hotels:", res.data);
    }
  } catch (error) {
    console.error("Error fetching hotels:", error);
    state.error = "An error occurred while fetching hotels.";
    await globalStore.onCheckError(error);
  }
  state.isLoading = false;
};

const createHotel = async () => {
  isSubmitting.value = true;
  modalMessage.value = "";
  try {
    const formData = new FormData();
    formData.append("name", newHotel.name);
    formData.append("name_km", newHotel.name_km);
    if (newHotel.description) {
      formData.append("description", newHotel.description);
    }
    if (newHotel.meals && newHotel.meals.length > 0) {
      newHotel.meals.forEach((meal, index) => {
        formData.append(`meal[${index}]`, meal);
      });
    }
    if (newHotel.services && newHotel.services.length > 0) {
      newHotel.services.forEach((service, index) => {
        formData.append(`services[${index}]`, service);
      });
    }
    if (selectedThumbnailFile.value) {
      formData.append("thumbnail", selectedThumbnailFile.value);
    }

    const res = await axios.post(
      `/api/hotels/siemreap`,
      formData,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      await fetchHotels();
      closeModal();
      resetHotelForm();
      showNotification("success", "Success", "Hotel created successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to create hotel";
    }
  } catch (error) {
    console.error("Error creating hotel:", error);
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        modalMessage.value = error.response.data.message;
      } else if (error.response.data.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        modalMessage.value = errors.join("\n");
      } else {
        modalMessage.value = "An error occurred while creating the hotel.";
      }
    } else {
      modalMessage.value = "An error occurred while creating the hotel.";
    }
    await globalStore.onCheckError(error);
  }
  isSubmitting.value = false;
};

const updateHotel = async () => {
  isSubmitting.value = true;
  modalMessage.value = "";
  try {
    const formData = new FormData();
    formData.append("name", newHotel.name);
    formData.append("name_km", newHotel.name_km);
    if (newHotel.description) {
      formData.append("description", newHotel.description);
    }
    if (newHotel.meals && newHotel.meals.length > 0) {
      newHotel.meals.forEach((meal, index) => {
        formData.append(`meal[${index}]`, meal);
      });
    }
    if (newHotel.services && newHotel.services.length > 0) {
      newHotel.services.forEach((service, index) => {
        formData.append(`services[${index}]`, service);
      });
    }
    if (selectedThumbnailFile.value) {
      formData.append("thumbnail", selectedThumbnailFile.value);
    }

    const res = await axios.post(
      `/api/hotels/siemreap/${currentHotelId.value}?_method=PUT`,
      formData,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      await fetchHotels();
      closeModal();
      resetHotelForm();
      showNotification("success", "Success", "Hotel updated successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to update hotel";
    }
  } catch (error) {
    console.error("Error updating hotel:", error);
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        modalMessage.value = error.response.data.message;
      } else if (error.response.data.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        modalMessage.value = errors.join("\n");
      } else {
        modalMessage.value = "An error occurred while updating the hotel.";
      }
    } else {
      modalMessage.value = "An error occurred while updating the hotel.";
    }
    await globalStore.onCheckError(error);
  }
  isSubmitting.value = false;
};

const performDeleteHotel = async (hotelId) => {
  try {
    const res = await axios.delete(
      `/api/hotels/siemreap/${hotelId}`,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      state.hotels = state.hotels.filter((h) => h.id !== hotelId);
      await fetchHotels();
      showNotification("success", "Success", "Hotel deleted successfully!");
    } else {
      showNotification("error", "Error", res.data.message || "Failed to delete hotel");
    }
  } catch (error) {
    showNotification("error", "Error", "An error occurred while deleting the hotel.");
    await globalStore.onCheckError(error);
  }
};

const performResetThumbnail = async (hotelId) => {
  try {
    const res = await axios.delete(
      `/api/hotels/siemreap/${hotelId}/thumbnail`,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      await fetchHotels();
      showNotification("success", "Success", "Hotel thumbnail reset successfully!");
    } else {
      showNotification("error", "Error", res.data.message || "Failed to reset thumbnail");
    }
  } catch (error) {
    showNotification(
      "error",
      "Error",
      "An error occurred while resetting the thumbnail."
    );
    await globalStore.onCheckError(error);
  }
};

const resetThumbnail = (hotelId) => {
  showConfirmation(
    "Reset Thumbnail",
    "Are you sure you want to reset this hotel thumbnail to default?",
    performResetThumbnail,
    hotelId
  );
};
const deleteHotel = (hotelId) => {
  showConfirmation(
    "Delete Hotel",
    "Are you sure you want to delete this hotel?",
    performDeleteHotel,
    hotelId
  );
};

const openModal = () => {
  resetHotelForm();
  isEditMode.value = false;
  showModal.value = true;
};

const editHotel = async (hotelId) => {
  try {
    state.isLoading = true;
    let hotel = state.hotels.find((h) => String(h.id) === String(hotelId));
    if (!hotel) {
      const response = await axios.get(
        `/api/hotels/siemreap/${hotelId}`,
        globalStore.getAxiosHeader()
      );
      if (response.data.result && response.data.data) {
        hotel = response.data.data;
      } else {
        showNotification("error", "Error", "Failed to fetch hotel details");
        state.isLoading = false;
        return;
      }
    }
    newHotel.name = hotel.name || "";
    newHotel.name_km = hotel.name_km || "";
    newHotel.description = hotel.description || "";
    // Handle both 'meal' (singular from backend) and 'meals' (plural)
    if (hotel.meals && Array.isArray(hotel.meals)) {
      newHotel.meals = [...hotel.meals];
    } else if (hotel.meal && Array.isArray(hotel.meal)) {
      newHotel.meals = [...hotel.meal];
    } else if (hotel.meal && typeof hotel.meal === "string") {
      // Handle case where meal is a single string
      newHotel.meals = [hotel.meal];
    } else {
      newHotel.meals = [];
    }
    newHotel.services = Array.isArray(hotel.services) ? [...hotel.services] : [];
    currentHotelId.value = hotelId;
    isEditMode.value = true;
    showModal.value = true;
  } catch (error) {
    console.error("Error fetching hotel details:", error);
    showNotification("error", "Error", "An error occurred while fetching hotel details");
    await globalStore.onCheckError(error);
  } finally {
    state.isLoading = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  resetHotelForm();
  modalMessage.value = "";
};

const resetHotelForm = () => {
  newHotel.name = "";
  newHotel.name_km = "";
  newHotel.description = "";
  newHotel.meals = [];
  newHotel.services = [];
  currentHotelId.value = null;
  newServiceInput.value = "";
  newMealInput.value = "";
  removeThumbnailPreview();
  cleanupObjectURLs();
};

const addMeal = () => {
  if (newMealInput.value.trim()) {
    if (!newHotel.meals) {
      newHotel.meals = [];
    }
    newHotel.meals.push(newMealInput.value.trim());
    newMealInput.value = "";
  }
};

const removeMeal = (index) => {
  newHotel.meals.splice(index, 1);
};

const addService = () => {
  if (newServiceInput.value.trim()) {
    if (!newHotel.services) {
      newHotel.services = [];
    }
    newHotel.services.push(newServiceInput.value.trim());
    newServiceInput.value = "";
  }
};

const removeService = (index) => {
  newHotel.services.splice(index, 1);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  if (!event.target.checkValidity()) {
    event.stopPropagation();
    event.target.classList.add("was-validated");
    return;
  }

  if (!newHotel.name.trim()) {
    modalMessage.value = "Hotel name is required";
    return;
  }
  if (!newHotel.name_km.trim()) {
    modalMessage.value = "Hotel name in Khmer is required";
    return;
  }

  if (isEditMode.value) {
    await updateHotel();
  } else {
    await createHotel();
  }
};

const filteredHotels = computed(() => {
  return state.hotels.filter(
    (hotel) =>
      hotel.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      hotel.name_km?.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

onBeforeUnmount(() => {
  cleanupObjectURLs();
});

onMounted(async () => {
  try {
    await fetchHotels();
  } catch (error) {
    console.error("Error during initialization:", error);
    showNotification("error", "Error", "Failed to initialize the component");
    await globalStore.onCheckError(error);
  }
});
</script>

<style scoped>
.hotel-thumbnail-preview {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
}

.hotel-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-preview-container {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 1rem;
  background-color: #f8f9fa;
}

.thumbnail-preview {
  position: relative;
  display: inline-block;
  max-width: 200px;
}

.preview-thumbnail {
  width: 100%;
  height: auto;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.remove-preview {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.thumbnail-preview-modal {
  max-width: 900px;
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: -2rem -2rem 2rem -2rem;
}

.modal-body {
  padding: 1.5rem;
  margin: -2rem;
}

.btn-close {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #9ca3af;
}

.btn-close:hover {
  color: #4b5563;
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

.hotel-form .form-label {
  font-weight: 500;
}

.meals-input {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 1rem;
  background-color: #f8f9fa;
}

.meals-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.meal-tag {
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-remove-meal {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  padding: 0;
  margin-left: 0.25rem;
}

.btn-remove-meal:hover {
  color: #dc3545;
}

.services-input {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 1rem;
  background-color: #f8f9fa;
}

.services-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.service-tag {
  background-color: #e3f2fd;
  border: 1px solid #90caf9;
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-remove-service {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  padding: 0;
  margin-left: 0.25rem;
}

.btn-remove-service:hover {
  color: #dc3545;
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

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
