<template>
  <div class="mb-9">
    <div class="row g-2 mb-4">
      <div class="col-auto">
        <h2 class="mb-0">Hotels</h2>
      </div>
    </div>
    <div id="hotels">
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
              <th class="align-middle">Name</th>
              <!-- <th class="align-middle">Star Rating</th> -->
              <th class="align-middle">Price/Night</th>
              <th class="align-middle">Contact</th>
              <th class="align-middle">Status</th>
              <th class="align-middle text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredHotels.length === 0">
              <td colspan="7" class="text-center">No hotels found</td>
            </tr>
            <tr v-else v-for="(hotel, index) in filteredHotels" :key="hotel.id">
              <td class="align-middle ps-0">{{ index + 1 }}</td>
              <td class="align-middle">
                <div>
                  <strong>{{ hotel.name }}</strong>
                  <div v-if="hotel.address" class="text-muted small">
                    {{ hotel.address }}
                  </div>
                </div>
              </td>
              <!-- <td class="align-middle">
                <div class="star-rating">
                  <span
                    v-for="i in 5"
                    :key="i"
                    class="star"
                    :class="{ filled: i <= hotel.star_rating }"
                  >
                    ★
                  </span>
                </div>
              </td> -->
              <td class="align-middle">${{ formatPrice(hotel.price_per_night) }}</td>
              <td class="align-middle">
                <div v-if="hotel.contact_phone" class="small">
                  {{ hotel.contact_phone }}
                </div>
                <div v-if="hotel.contact_email" class="small text-muted">
                  {{ hotel.contact_email }}
                </div>
              </td>
              <td class="align-middle">
                <span class="badge" :class="hotel.is_active ? 'bg-success' : 'bg-danger'">
                  {{ hotel.is_active ? "Active" : "Inactive" }}
                </span>
              </td>
              <td class="align-middle text-end">
                <button class="btn btn-sm btn-primary me-2" @click="editHotel(hotel.id)">
                  <span class="fas fa-edit me-1"></span>Edit
                </button>
                <button class="btn btn-sm btn-danger" @click="deleteHotel(hotel.id)">
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
    <div class="modal-content hotel-form">
      <h4>{{ isEditMode ? "Edit" : "Create" }} Hotel</h4>
      <div v-if="modalMessage" class="alert alert-danger">
        {{ modalMessage }}
      </div>
      <form class="row g-3 needs-validation" novalidate @submit.prevent="handleSubmit">
        <!-- Hotel Name -->
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

        <!-- Star Rating -->
        <div class="col-md-6">
          <label class="form-label" for="starRating">Star Rating</label>
          <select
            v-model="newHotel.star_rating"
            class="form-select"
            id="starRating"
            required
          >
            <option value="" disabled>Select rating</option>
            <option v-for="i in 5" :key="i" :value="i">
              {{ i }} Star{{ i > 1 ? "s" : "" }}
            </option>
          </select>
          <div class="invalid-feedback">Star rating is required</div>
        </div>

        <!-- Price per Night -->
        <div class="col-md-6">
          <label class="form-label" for="pricePerNight">Price per Night ($)</label>
          <input
            v-model="newHotel.price_per_night"
            class="form-control"
            id="pricePerNight"
            type="number"
            step="0.01"
            min="0"
            required
          />
          <div class="invalid-feedback">Price per night is required</div>
        </div>

        <!-- Status -->
        <div class="col-md-6">
          <label class="form-label" for="isActive">Status</label>
          <select v-model="newHotel.is_active" class="form-select" id="isActive">
            <option :value="true">Active</option>
            <option :value="false">Inactive</option>
          </select>
        </div>

        <!-- Description -->
        <div class="col-12">
          <label class="form-label" for="description">Description</label>
          <textarea
            v-model="newHotel.description"
            class="form-control"
            id="description"
            rows="3"
            placeholder="Hotel description..."
          ></textarea>
        </div>

        <!-- Address -->
        <div class="col-12">
          <label class="form-label" for="address">Address</label>
          <input
            v-model="newHotel.address"
            class="form-control"
            id="address"
            type="text"
            placeholder="Hotel address..."
          />
        </div>

        <!-- Contact Information -->
        <div class="col-md-6">
          <label class="form-label" for="contactPhone">Contact Phone</label>
          <input
            v-model="newHotel.contact_phone"
            class="form-control"
            id="contactPhone"
            type="text"
            placeholder="+855-xx-xxxxxx"
          />
        </div>

        <div class="col-md-6">
          <label class="form-label" for="contactEmail">Contact Email</label>
          <input
            v-model="newHotel.contact_email"
            class="form-control"
            id="contactEmail"
            type="email"
            placeholder="hotel@example.com"
          />
        </div>

        <!-- Location -->
        <div class="col-md-6">
          <label class="form-label" for="latitude">Latitude</label>
          <input
            v-model="newHotel.latitude"
            class="form-control"
            id="latitude"
            type="number"
            step="any"
            min="-90"
            max="90"
            placeholder="13.3671"
          />
        </div>

        <div class="col-md-6">
          <label class="form-label" for="longitude">Longitude</label>
          <input
            v-model="newHotel.longitude"
            class="form-control"
            id="longitude"
            type="number"
            step="any"
            min="-180"
            max="180"
            placeholder="103.8448"
          />
        </div>

        <!-- Amenities -->
        <div class="col-12">
          <label class="form-label">Amenities</label>
          <div class="amenities-section">
            <div class="row g-2">
              <div class="col-auto" v-for="amenity in availableAmenities" :key="amenity">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :id="`amenity-${amenity}`"
                    :value="amenity"
                    v-model="newHotel.amenities"
                  />
                  <label class="form-check-label" :for="`amenity-${amenity}`">
                    {{ amenity }}
                  </label>
                </div>
              </div>
            </div>
            <div class="mt-2">
              <input
                v-model="newAmenity"
                class="form-control form-control-sm"
                type="text"
                placeholder="Add custom amenity..."
                @keyup.enter="addCustomAmenity"
              />
              <small class="text-muted">Press Enter to add custom amenity</small>
            </div>
          </div>
        </div>

        <!-- Room Types -->
        <div class="col-12">
          <label class="form-label">Room Types</label>
          <div class="room-types-section">
            <div class="row g-2">
              <div
                class="col-auto"
                v-for="roomType in availableRoomTypes"
                :key="roomType"
              >
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :id="`room-${roomType}`"
                    :value="roomType"
                    v-model="newHotel.room_types"
                  />
                  <label class="form-check-label" :for="`room-${roomType}`">
                    {{ roomType }}
                  </label>
                </div>
              </div>
            </div>
            <div class="mt-2">
              <input
                v-model="newRoomType"
                class="form-control form-control-sm"
                type="text"
                placeholder="Add custom room type..."
                @keyup.enter="addCustomRoomType"
              />
              <small class="text-muted">Press Enter to add custom room type</small>
            </div>
          </div>
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
import { useToast } from "@/composables/useToast";
import { useGlobalStore } from "@/stores/global";
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";

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
const newAmenity = ref("");
const newRoomType = ref("");

const confirmationModal = reactive({
  show: false,
  title: "Confirm Action",
  message: "Are you sure you want to proceed?",
  action: null,
  actionParams: null,
});

const newHotel = reactive({
  name: "",
  description: "",
  star_rating: "",
  price_per_night: "",
  latitude: "",
  longitude: "",
  amenities: [],
  room_types: [],
  contact_phone: "",
  contact_email: "",
  address: "",
  is_active: true,
});

const availableAmenities = ref([
  "WiFi",
  "Swimming Pool",
  "Restaurant",
  "Gym",
  "Spa",
  "Bar",
  "Room Service",
  "Laundry",
  "Parking",
  "Air Conditioning",
  "Private Bathroom",
  "Shared Kitchen",
  "Balcony",
  "Airport Shuttle",
  "Business Center",
]);

const availableRoomTypes = ref([
  "Single",
  "Double",
  "Twin",
  "Triple",
  "Suite",
  "Deluxe",
  "Standard",
  "Dormitory",
  "Private Room",
  "Family Room",
  "Executive Suite",
  "Presidential Suite",
]);

const formatPrice = (price) => {
  return parseFloat(price).toFixed(2);
};

const addCustomAmenity = () => {
  if (newAmenity.value.trim() && !newHotel.amenities.includes(newAmenity.value.trim())) {
    newHotel.amenities.push(newAmenity.value.trim());
    if (!availableAmenities.value.includes(newAmenity.value.trim())) {
      availableAmenities.value.push(newAmenity.value.trim());
    }
    newAmenity.value = "";
  }
};

const addCustomRoomType = () => {
  if (
    newRoomType.value.trim() &&
    !newHotel.room_types.includes(newRoomType.value.trim())
  ) {
    newHotel.room_types.push(newRoomType.value.trim());
    if (!availableRoomTypes.value.includes(newRoomType.value.trim())) {
      availableRoomTypes.value.push(newRoomType.value.trim());
    }
    newRoomType.value = "";
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

const fetchHotels = async () => {
  state.isLoading = true;
  state.error = null;
  try {
    const res = await axios.get("/api/hotels", globalStore.getAxiosHeader());
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
    const hotelData = {
      name: newHotel.name,
      description: newHotel.description,
      star_rating: parseInt(newHotel.star_rating),
      price_per_night: parseFloat(newHotel.price_per_night),
      latitude: newHotel.latitude ? parseFloat(newHotel.latitude) : null,
      longitude: newHotel.longitude ? parseFloat(newHotel.longitude) : null,
      amenities: newHotel.amenities,
      room_types: newHotel.room_types,
      contact_phone: newHotel.contact_phone,
      contact_email: newHotel.contact_email,
      address: newHotel.address,
      is_active: newHotel.is_active,
    };
    const res = await axios.post(`/api/hotels`, hotelData, globalStore.getAxiosHeader());
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
    const hotelData = {
      name: newHotel.name,
      description: newHotel.description,
      star_rating: parseInt(newHotel.star_rating),
      price_per_night: parseFloat(newHotel.price_per_night),
      latitude: newHotel.latitude ? parseFloat(newHotel.latitude) : null,
      longitude: newHotel.longitude ? parseFloat(newHotel.longitude) : null,
      amenities: newHotel.amenities,
      room_types: newHotel.room_types,
      contact_phone: newHotel.contact_phone,
      contact_email: newHotel.contact_email,
      address: newHotel.address,
      is_active: newHotel.is_active,
    };
    const res = await axios.put(
      `/api/hotels/${currentHotelId.value}`,
      hotelData,
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
      `/api/hotels/${hotelId}`,
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
        `/api/hotels/${hotelId}`,
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
    newHotel.description = hotel.description || "";
    newHotel.star_rating = hotel.star_rating || "";
    newHotel.price_per_night = hotel.price_per_night || "";
    newHotel.latitude = hotel.latitude || "";
    newHotel.longitude = hotel.longitude || "";
    newHotel.amenities = hotel.amenities || [];
    newHotel.room_types = hotel.room_types || [];
    newHotel.contact_phone = hotel.contact_phone || "";
    newHotel.contact_email = hotel.contact_email || "";
    newHotel.address = hotel.address || "";
    newHotel.is_active = hotel.is_active !== undefined ? hotel.is_active : true;

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
  newHotel.description = "";
  newHotel.star_rating = "";
  newHotel.price_per_night = "";
  newHotel.latitude = "";
  newHotel.longitude = "";
  newHotel.amenities = [];
  newHotel.room_types = [];
  newHotel.contact_phone = "";
  newHotel.contact_email = "";
  newHotel.address = "";
  newHotel.is_active = true;
  currentHotelId.value = null;
  newAmenity.value = "";
  newRoomType.value = "";
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
  if (!newHotel.star_rating) {
    modalMessage.value = "Star rating is required";
    return;
  }
  if (!newHotel.price_per_night || parseFloat(newHotel.price_per_night) < 0) {
    modalMessage.value = "Valid price per night is required";
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
      hotel.address?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      hotel.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
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

.product-form .form-label {
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
.section-header .form-label {
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0;
}

.add-new-color-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.add-new-color-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  color: white;
  transform: translateY(-1px);
}

.stylish-select {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.stylish-select:focus {
  background: white;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  outline: none;
}

.existing-color-preview {
  margin-top: 1rem;
}

.preview-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.preview-card:hover {
  transform: translateY(-2px);
}

.color-display {
  flex-shrink: 0;
}

.color-swatch-large {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.color-swatch-large:hover {
  transform: scale(1.05);
}

.color-info {
  flex-grow: 1;
}

.color-name {
  margin: 0;
  color: #2d3748;
  font-weight: 600;
  font-size: 1.1rem;
}

.color-code {
  color: #718096;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 0.9rem;
  background: #f7fafc;
  padding: 2px 6px;
  border-radius: 4px;
}

/* Form check group styling */
.form-check-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
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
}

/* Existing color selector styling */
.existing-color-selector {
  margin-bottom: 1rem;
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

/* Toast styles */
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
