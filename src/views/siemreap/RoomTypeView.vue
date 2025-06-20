<template>
  <div class="mb-9">
    <div class="row g-2 mb-4">
      <div class="col-auto">
        <h2 class="mb-0">Hotel Room Types</h2>
      </div>
    </div>
    <div id="room-type-management">
      <div class="mb-4">
        <div class="row g-3 justify-content-between">
          <div class="col-auto">
            <div class="search-box">
              <input
                v-model="searchQuery"
                class="form-control search-input search"
                type="search"
                placeholder="Search room types"
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
              <span class="fas fa-plus me-2"></span>Add Room Type
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
              <th class="align-middle">Image</th>
              <th class="align-middle">Title</th>
              <th class="align-middle">Hotel</th>
              <th class="align-middle">Price Range</th>
              <th class="align-middle">Description</th>
              <th class="align-middle text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredRoomTypes.length === 0">
              <td colspan="7" class="text-center">No room types found</td>
            </tr>
            <tr v-else v-for="(roomType, index) in filteredRoomTypes" :key="roomType.id">
              <td class="align-middle ps-0">{{ index + 1 }}</td>
              <td class="align-middle">
                <div class="room-image-preview">
                  <img
                    :src="roomType.image"
                    :alt="roomType.title"
                    class="room-thumbnail"
                  />
                </div>
              </td>
              <td class="align-middle">{{ roomType.title }}</td>
              <td class="align-middle">
                {{ getHotelName(roomType.hotel_siem_reap_id) }}
              </td>
              <td class="align-middle">
                <span v-if="roomType.price_range" class="badge bg-success">
                  {{ roomType.price_range }}
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td class="align-middle">
                <span v-if="roomType.description" :title="roomType.description">
                  {{ truncateText(roomType.description, 50) }}
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td class="align-middle text-end">
                <div class="btn-group btn-group-sm">
                  <button
                    class="btn btn-outline-info"
                    @click="viewImage(roomType)"
                    :disabled="!roomType.image || roomType.image === 'default-room.jpg'"
                    title="View Image"
                  >
                    <span class="fas fa-eye"></span>
                  </button>
                  <button class="btn btn-primary" @click="editRoomType(roomType.id)">
                    <span class="fas fa-edit"></span>
                  </button>
                  <button
                    class="btn btn-outline-danger"
                    @click="resetImage(roomType.id)"
                    :disabled="!roomType.image || roomType.image === 'default-room.jpg'"
                    title="Reset Image"
                  >
                    <span class="fas fa-image"></span>
                  </button>
                  <button class="btn btn-danger" @click="deleteRoomType(roomType.id)">
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
    <div class="modal-content room-type-form">
      <h4>{{ isEditMode ? "Edit" : "Create" }} Room Type</h4>
      <div v-if="modalMessage" class="alert alert-danger">
        {{ modalMessage }}
      </div>
      <form class="row g-3 needs-validation" novalidate @submit.prevent="handleSubmit">
        <div class="col-md-6">
          <label class="form-label" for="roomTitle">Room Title</label>
          <div class="room-title-section">
            <div class="form-check-group mb-2">
              <div class="form-check">
                <input
                  v-model="titleInputMethod"
                  class="form-check-input"
                  type="radio"
                  value="select"
                  id="selectExistingTitle"
                />
                <label class="form-check-label" for="selectExistingTitle">
                  Select Existing
                </label>
              </div>
              <div class="form-check">
                <input
                  v-model="titleInputMethod"
                  class="form-check-input"
                  type="radio"
                  value="create"
                  id="createNewTitle"
                />
                <label class="form-check-label" for="createNewTitle"> Create New </label>
              </div>
            </div>

            <div v-if="titleInputMethod === 'select' && availableRoomTitles.length > 0">
              <select
                v-model="selectedExistingTitleId"
                class="form-select"
                @change="onExistingTitleSelect"
                required
              >
                <option value="" disabled>Choose an existing room title</option>
                <option
                  v-for="roomTitle in availableRoomTitles"
                  :key="roomTitle.id"
                  :value="roomTitle.id"
                >
                  {{ roomTitle.title }} ({{ roomTitle.price_range || "No price" }})
                </option>
              </select>
            </div>

            <div v-if="titleInputMethod === 'create' || availableRoomTitles.length === 0">
              <input
                v-model="newRoomType.title"
                class="form-control"
                id="roomTitle"
                type="text"
                placeholder="Enter room title..."
                required
              />
            </div>
          </div>
          <div class="invalid-feedback">Room title is required</div>
        </div>

        <div class="col-md-6">
          <label class="form-label" for="hotelSelect">Hotel</label>
          <select
            v-model="newRoomType.hotel_siem_reap_id"
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
          <label class="form-label" for="priceRange">Price Range</label>
          <div class="price-range-section">
            <div class="form-check-group mb-2">
              <div class="form-check">
                <input
                  v-model="priceInputMethod"
                  class="form-check-input"
                  type="radio"
                  value="select"
                  id="selectExistingPrice"
                />
                <label class="form-check-label" for="selectExistingPrice">
                  Select Existing
                </label>
              </div>
              <div class="form-check">
                <input
                  v-model="priceInputMethod"
                  class="form-check-input"
                  type="radio"
                  value="create"
                  id="createNewPrice"
                />
                <label class="form-check-label" for="createNewPrice"> Create New </label>
              </div>
            </div>

            <div v-if="priceInputMethod === 'select' && availablePriceRanges.length > 0">
              <select
                v-model="selectedExistingPriceId"
                class="form-select"
                @change="onExistingPriceSelect"
              >
                <option value="" disabled>Choose an existing price range</option>
                <option
                  v-for="priceRange in availablePriceRanges"
                  :key="priceRange.id"
                  :value="priceRange.id"
                >
                  {{ priceRange.price_range }}
                </option>
              </select>
            </div>

            <div
              v-if="priceInputMethod === 'create' || availablePriceRanges.length === 0"
            >
              <input
                v-model="newRoomType.price_range"
                class="form-control"
                id="priceRange"
                type="text"
                placeholder="e.g., $50-100/night"
              />
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <label class="form-label" for="roomImage">Room Image</label>
          <input
            ref="imageInput"
            class="form-control"
            id="roomImage"
            type="file"
            accept="image/jpeg,image/png"
            @change="handleImageSelect"
          />
          <small class="text-muted">JPEG, PNG only (max 2MB)</small>
        </div>

        <div v-if="imagePreview" class="col-12">
          <div class="image-preview-container">
            <label class="form-label">Image Preview</label>
            <div class="image-preview">
              <img :src="imagePreview" alt="Preview" class="preview-image" />
              <button
                type="button"
                class="btn btn-sm btn-outline-danger remove-preview"
                @click="removeImagePreview"
              >
                <span class="fas fa-times"></span>
              </button>
            </div>
          </div>
        </div>

        <div class="col-12">
          <label class="form-label" for="roomDescription">Description</label>
          <textarea
            v-model="newRoomType.description"
            class="form-control"
            id="roomDescription"
            rows="4"
            placeholder="Enter room description..."
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

  <transition name="modal">
    <div v-if="previewImage" class="modal-overlay" @click="closeImagePreview">
      <div class="modal-content image-preview-modal" @click.stop>
        <div class="modal-header">
          <h5 class="modal-title">Room Image</h5>
          <button class="btn-close" @click="closeImagePreview">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="modal-body p-0">
          <img :src="previewImage.url" :alt="previewImage.title" class="img-fluid" />
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
  roomTypes: [],
  isLoading: false,
  error: null,
});

const hotels = ref([]);
const searchQuery = ref("");
const selectedHotelFilter = ref("");
const showModal = ref(false);
const isEditMode = ref(false);
const currentRoomTypeId = ref(null);
const isSubmitting = ref(false);
const modalMessage = ref("");
const imageInput = ref(null);
const imagePreview = ref(null);
const selectedImageFile = ref(null);
const previewImage = ref(null);
const objectUrls = ref([]);

const titleInputMethod = ref("select");
const priceInputMethod = ref("select");
const selectedExistingTitleId = ref("");
const selectedExistingPriceId = ref("");

const confirmationModal = reactive({
  show: false,
  title: "Confirm Action",
  message: "Are you sure you want to proceed?",
  action: null,
  actionParams: null,
});

const newRoomType = reactive({
  title: "",
  hotel_siem_reap_id: "",
  price_range: "",
  description: "",
});

const availableRoomTitles = computed(() => {
  const uniqueTitles = [];
  const seen = new Set();

  state.roomTypes.forEach((roomType) => {
    if (roomType.title && !seen.has(roomType.title)) {
      seen.add(roomType.title);
      uniqueTitles.push({
        id: roomType.id,
        title: roomType.title,
        price_range: roomType.price_range,
      });
    }
  });

  return uniqueTitles;
});

const availablePriceRanges = computed(() => {
  const uniquePrices = [];
  const seen = new Set();

  state.roomTypes.forEach((roomType) => {
    if (roomType.price_range && !seen.has(roomType.price_range)) {
      seen.add(roomType.price_range);
      uniquePrices.push({
        id: roomType.id,
        price_range: roomType.price_range,
      });
    }
  });

  return uniquePrices;
});

const onExistingTitleSelect = () => {
  if (selectedExistingTitleId.value) {
    const selectedTitle = availableRoomTitles.value.find(
      (title) => title.id === selectedExistingTitleId.value
    );
    if (selectedTitle) {
      newRoomType.title = selectedTitle.title;
      if (selectedTitle.price_range && !newRoomType.price_range) {
        newRoomType.price_range = selectedTitle.price_range;
        priceInputMethod.value = "create";
      }
    }
  }
};

const onExistingPriceSelect = () => {
  if (selectedExistingPriceId.value) {
    const selectedPrice = availablePriceRanges.value.find(
      (price) => price.id === selectedExistingPriceId.value
    );
    if (selectedPrice) {
      newRoomType.price_range = selectedPrice.price_range;
    }
  }
};

const cleanupObjectURLs = () => {
  objectUrls.value.forEach((url) => {
    URL.revokeObjectURL(url);
  });
  objectUrls.value = [];
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

const getRoomImageUrl = (imagePath) => {
  if (!imagePath || imagePath === "default-room.jpg") {
    return "/default-room.jpg";
  }
  return `${imagePath}`;
};

const getHotelName = (hotelId) => {
  if (!hotelId) return "Unknown";
  const hotel = hotels.value.find((h) => String(h.id) === String(hotelId));
  if (hotel) return hotel.name;

  const roomTypeWithHotel = state.roomTypes.find(
    (rt) => rt.hotel_siem_reap_id === hotelId || (rt.hotel && rt.hotel.id === hotelId)
  );
  if (roomTypeWithHotel && roomTypeWithHotel.hotel) {
    return roomTypeWithHotel.hotel.name;
  }
  return "Unknown";
};

const handleImageSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 2048 * 1024) {
      modalMessage.value = "Image size must be less than 2MB";
      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      modalMessage.value = "Only JPEG and PNG images are allowed";
      return;
    }

    selectedImageFile.value = file;
    const url = URL.createObjectURL(file);
    objectUrls.value.push(url);
    imagePreview.value = url;
    modalMessage.value = "";
  }
};

const removeImagePreview = () => {
  imagePreview.value = null;
  selectedImageFile.value = null;
  if (imageInput.value) {
    imageInput.value.value = "";
  }
};

const viewImage = (roomType) => {
  if (roomType.image && roomType.image !== "default-room.jpg") {
    previewImage.value = {
      url: getRoomImageUrl(roomType.image),
      title: roomType.title,
    };
  }
};

const closeImagePreview = () => {
  previewImage.value = null;
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

const fetchRoomTypes = async () => {
  state.isLoading = true;
  state.error = null;
  try {
    const params = {};
    if (selectedHotelFilter.value) {
      params.hotel_siem_reap_id = selectedHotelFilter.value;
    }

    const res = await axios.get("/api/room-types/hotel", {
      ...globalStore.getAxiosHeader(),
      params,
    });
    if (res.data.result && Array.isArray(res.data.data)) {
      state.roomTypes = res.data.data;
    } else {
      state.error = res.data.message || "Failed to fetch room types";
      console.error("API error when fetching room types:", res.data);
    }
  } catch (error) {
    console.error("Error fetching room types:", error);
    state.error = "An error occurred while fetching room types.";
    await globalStore.onCheckError(error);
  }
  state.isLoading = false;
};

const createRoomType = async () => {
  isSubmitting.value = true;
  modalMessage.value = "";
  try {
    const formData = new FormData();
    formData.append("title", newRoomType.title);
    formData.append("hotel_siem_reap_id", newRoomType.hotel_siem_reap_id);
    if (newRoomType.price_range) {
      formData.append("price_range", newRoomType.price_range);
    }
    if (newRoomType.description) {
      formData.append("description", newRoomType.description);
    }
    if (selectedImageFile.value) {
      formData.append("image", selectedImageFile.value);
    }

    const res = await axios.post(
      `/api/room-types/hotel`,
      formData,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      await fetchRoomTypes();
      closeModal();
      resetForm();
      showNotification("success", "Success", "Room type created successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to create room type";
    }
  } catch (error) {
    console.error("Error creating room type:", error);
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        modalMessage.value = error.response.data.message;
      } else if (error.response.data.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        modalMessage.value = errors.join("\n");
      } else {
        modalMessage.value = "An error occurred while creating the room type.";
      }
    } else {
      modalMessage.value = "An error occurred while creating the room type.";
    }
    await globalStore.onCheckError(error);
  }
  isSubmitting.value = false;
};

const updateRoomType = async () => {
  isSubmitting.value = true;
  modalMessage.value = "";
  try {
    const formData = new FormData();
    formData.append("title", newRoomType.title);
    formData.append("hotel_siem_reap_id", newRoomType.hotel_siem_reap_id);
    if (newRoomType.price_range) {
      formData.append("price_range", newRoomType.price_range);
    }
    if (newRoomType.description) {
      formData.append("description", newRoomType.description);
    }
    if (selectedImageFile.value) {
      formData.append("image", selectedImageFile.value);
    }

    const res = await axios.post(
      `/api/room-types/hotel/${currentRoomTypeId.value}?_method=PUT`,
      formData,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      await fetchRoomTypes();
      closeModal();
      resetForm();
      showNotification("success", "Success", "Room type updated successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to update room type";
    }
  } catch (error) {
    console.error("Error updating room type:", error);
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        modalMessage.value = error.response.data.message;
      } else if (error.response.data.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        modalMessage.value = errors.join("\n");
      } else {
        modalMessage.value = "An error occurred while updating the room type.";
      }
    } else {
      modalMessage.value = "An error occurred while updating the room type.";
    }
    await globalStore.onCheckError(error);
  }
  isSubmitting.value = false;
};

const performDeleteRoomType = async (roomTypeId) => {
  try {
    const res = await axios.delete(
      `/api/room-types/hotel/${roomTypeId}`,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      state.roomTypes = state.roomTypes.filter((rt) => rt.id !== roomTypeId);
      await fetchRoomTypes();
      showNotification("success", "Success", "Room type deleted successfully!");
    } else {
      showNotification(
        "error",
        "Error",
        res.data.message || "Failed to delete room type"
      );
    }
  } catch (error) {
    showNotification("error", "Error", "An error occurred while deleting the room type.");
    await globalStore.onCheckError(error);
  }
};

const performResetImage = async (roomTypeId) => {
  try {
    const res = await axios.delete(
      `/api/room-types/hotel/${roomTypeId}/image`,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      await fetchRoomTypes();
      showNotification("success", "Success", "Room image reset successfully!");
    } else {
      showNotification("error", "Error", res.data.message || "Failed to reset image");
    }
  } catch (error) {
    showNotification("error", "Error", "An error occurred while resetting the image.");
    await globalStore.onCheckError(error);
  }
};

const deleteRoomType = (roomTypeId) => {
  showConfirmation(
    "Delete Room Type",
    "Are you sure you want to delete this room type?",
    performDeleteRoomType,
    roomTypeId
  );
};

const resetImage = (roomTypeId) => {
  showConfirmation(
    "Reset Image",
    "Are you sure you want to reset this room image to default?",
    performResetImage,
    roomTypeId
  );
};

const openModal = () => {
  resetForm();
  isEditMode.value = false;
  titleInputMethod.value = availableRoomTitles.value.length > 0 ? "select" : "create";
  priceInputMethod.value = availablePriceRanges.value.length > 0 ? "select" : "create";
  showModal.value = true;
};

const editRoomType = async (roomTypeId) => {
  try {
    state.isLoading = true;
    let roomType = state.roomTypes.find((rt) => String(rt.id) === String(roomTypeId));
    if (!roomType) {
      const response = await axios.get(
        `/api/room-types/hotel/${roomTypeId}`,
        globalStore.getAxiosHeader()
      );
      if (response.data.result && response.data.data) {
        roomType = response.data.data;
      } else {
        showNotification("error", "Error", "Failed to fetch room type details");
        state.isLoading = false;
        return;
      }
    }

    newRoomType.title = roomType.title || "";
    newRoomType.hotel_siem_reap_id = String(roomType.hotel_siem_reap_id || "");
    newRoomType.price_range = roomType.price_range || "";
    newRoomType.description = roomType.description || "";

    currentRoomTypeId.value = roomTypeId;
    isEditMode.value = true;
    showModal.value = true;
  } catch (error) {
    console.error("Error fetching room type details:", error);
    showNotification(
      "error",
      "Error",
      "An error occurred while fetching room type details"
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
  newRoomType.title = "";
  newRoomType.hotel_siem_reap_id = "";
  newRoomType.price_range = "";
  newRoomType.description = "";
  currentRoomTypeId.value = null;
  selectedExistingTitleId.value = "";
  selectedExistingPriceId.value = "";
  removeImagePreview();
  cleanupObjectURLs();
};

const handleSubmit = async (event) => {
  event.preventDefault();
  if (!event.target.checkValidity()) {
    event.stopPropagation();
    event.target.classList.add("was-validated");
    return;
  }

  if (!newRoomType.title.trim()) {
    modalMessage.value = "Room title is required";
    return;
  }
  if (!newRoomType.hotel_siem_reap_id) {
    modalMessage.value = "Hotel selection is required";
    return;
  }

  if (isEditMode.value) {
    await updateRoomType();
  } else {
    await createRoomType();
  }
};

const filteredRoomTypes = computed(() => {
  let filtered = state.roomTypes;

  if (selectedHotelFilter.value) {
    filtered = filtered.filter(
      (rt) => String(rt.hotel_siem_reap_id) === String(selectedHotelFilter.value)
    );
  }

  if (searchQuery.value) {
    filtered = filtered.filter(
      (rt) =>
        rt.title?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        rt.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  return filtered;
});

onBeforeUnmount(() => {
  cleanupObjectURLs();
});

onMounted(async () => {
  try {
    await fetchHotels();
    await fetchRoomTypes();
  } catch (error) {
    console.error("Error during initialization:", error);
    showNotification("error", "Error", "Failed to initialize the component");
    await globalStore.onCheckError(error);
  }
});
</script>

<style scoped>
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

.room-title-section,
.price-range-section {
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  padding: 1rem;
  background-color: #f8f9fa;
}

.room-image-preview {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
}

.room-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-preview-container {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 1rem;
  background-color: #f8f9fa;
}

.image-preview {
  position: relative;
  display: inline-block;
  max-width: 200px;
}

.preview-image {
  margin: 20px;
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

.image-preview-modal {
  max-width: 900px;
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: -20px -20px 20px -20px;
}

.modal-body {
  padding: 1.5rem;
  margin: -20px;
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

.room-type-form .form-label {
  font-weight: 500;
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
