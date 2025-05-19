<template>
  <div class="mb-9">
    <div class="row g-2 mb-4">
      <div class="col-auto">
        <h2 class="mb-0">Location Ratings</h2>
      </div>
    </div>
    <div id="location-ratings">
      <div class="mb-4">
        <div class="row g-3 justify-content-between">
          <!-- Filters Section -->
          <div class="col-md-8">
            <div class="d-flex flex-wrap gap-2">
              <!-- Location Filter -->
              <div class="search-box">
                <input
                  v-model="filters.location_name"
                  class="form-control search-input"
                  type="search"
                  placeholder="Search by location name"
                  @input="onFilterInput"
                />
              </div>

              <!-- Status Filter -->
              <select
                v-model="filters.status"
                class="form-select"
                style="width: 150px"
                @change="applyFilters"
              >
                <option value="">All Statuses</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>

              <!-- Reset Filters Button -->
              <button
                class="btn btn-outline-secondary"
                @click="resetFilters"
                v-if="isFiltered"
              >
                <span class="fas fa-times me-1"></span>Clear Filters
              </button>
            </div>
          </div>

          <!-- Add Rating Button -->
          <div class="col-auto">
            <button class="btn btn-primary" @click="openModal">
              <span class="fas fa-plus me-2"></span>Add Rating
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="state.isLoading" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="state.error" class="text-center text-danger">
        {{ state.error }}
      </div>

      <!-- Data Table -->
      <div v-else class="table-responsive">
        <table class="table table-sm fs-9 mb-0">
          <thead>
            <tr>
              <th class="align-middle ps-0">#</th>
              <th class="align-middle">Rater</th>
              <th class="align-middle">Location</th>
              <th class="align-middle">Rating</th>
              <th class="align-middle">Comment</th>
              <th class="align-middle text-center">Status</th>
              <th class="align-middle">Date</th>
              <th class="align-middle text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="ratings.length === 0">
              <td colspan="8" class="text-center">No ratings found</td>
            </tr>
            <tr v-else v-for="(rating, index) in ratings" :key="rating.id">
              <td class="align-middle ps-0">{{ index + 1 }}</td>
              <td class="align-middle">{{ rating.rater_name }}</td>
              <td class="align-middle">{{ rating.location_name }}</td>
              <td class="align-middle">
                <div class="rating-stars">
                  <i
                    v-for="i in 5"
                    :key="i"
                    class="fas fa-star"
                    :class="i <= rating.star ? 'text-warning' : 'text-muted'"
                  ></i>
                  <span class="ms-1">{{ rating.star }}/5</span>
                </div>
              </td>
              <td class="align-middle">
                <div class="comment-text">{{ truncateText(rating.comment, 100) }}</div>
              </td>
              <td class="align-middle text-center">
                <span class="badge" :class="rating.status ? 'bg-success' : 'bg-danger'">
                  {{ rating.status ? "Active" : "Inactive" }}
                </span>
              </td>
              <td class="align-middle">{{ formatDate(rating.created_at) }}</td>
              <td class="align-middle text-end">
                <button
                  class="btn btn-sm btn-primary me-2"
                  @click="editRating(rating.id)"
                >
                  <span class="fas fa-edit me-1"></span>Edit
                </button>
                <button
                  class="btn btn-sm"
                  :class="rating.status ? 'btn-warning' : 'btn-success'"
                  @click="toggleRatingStatus(rating.id, rating.status)"
                >
                  <span
                    class="fas"
                    :class="rating.status ? 'fa-lock' : 'fa-unlock'"
                  ></span>
                </button>
                <button
                  class="btn btn-sm btn-danger ms-2"
                  @click="deleteRating(rating.id)"
                >
                  <span class="fas fa-trash"></span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Rating Modal -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal-content rating-modal">
      <h4>{{ isEditMode ? "Edit" : "Create" }} Rating</h4>
      <div v-if="modalMessage" class="alert alert-danger">
        {{ modalMessage }}
      </div>
      <form class="needs-validation" novalidate @submit.prevent="handleSubmit">
        <!-- Location Selection -->
        <div class="mb-3">
          <label class="form-label" for="locationId">Location</label>
          <select
            v-model="newRating.location_id"
            class="form-select"
            id="locationId"
            required
          >
            <option value="">Select a location</option>
            <option v-for="location in locations" :key="location.id" :value="location.id">
              {{ location.name }}
            </option>
          </select>
          <div class="invalid-feedback">Location is required</div>
        </div>

        <!-- Comment Text -->
        <div class="mb-3">
          <label class="form-label" for="commentText">Comment</label>
          <textarea
            v-model="newRating.comment"
            class="form-control"
            id="commentText"
            rows="4"
          ></textarea>
          <div class="text-muted small mt-1">
            {{ newRating.comment ? newRating.comment.length : 0 }}/5000 characters
          </div>
        </div>

        <!-- Status Toggle -->
        <div class="mb-3">
          <div class="form-check form-switch">
            <input
              v-model="newRating.status"
              class="form-check-input"
              type="checkbox"
              id="statusSwitch"
            />
            <label class="form-check-label" for="statusSwitch">
              {{ newRating.status ? "Active" : "Inactive" }}
            </label>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="mt-4 d-flex justify-content-end">
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

// Get toast functionality from the composable
const { toasts, showNotification, removeToast } = useToast();
const globalStore = useGlobalStore();

// Main state
const state = reactive({
  ratings: [],
  isLoading: false,
  error: null,
});

// Data collections
const locations = ref([]);
const users = ref([]);
const ratings = ref([]);

// Filters
const filters = reactive({
  location_name: "",
  status: "",
});

// UI state
const showModal = ref(false);
const isEditMode = ref(false);
const currentRatingId = ref(null);
const isSubmitting = ref(false);
const modalMessage = ref("");
const filterTimer = ref(null);

// Computed for checking if filters are applied
const isFiltered = computed(() => {
  return filters.location_name.trim() !== "" || filters.status !== "";
});

// Form data
const newRating = reactive({
  location_id: "",
  rater_id: "",
  star: 1,
  comment: "",
  status: true,
});

// Confirmation modal state
const confirmationModal = reactive({
  show: false,
  title: "Confirm Action",
  message: "Are you sure you want to proceed?",
  action: null,
  actionParams: null,
});

// Text utilities
const truncateText = (text, maxLength) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// Format date utility function
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Fetch ratings from API
const fetchRatings = async () => {
  state.isLoading = true;
  state.error = null;

  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (filters.location_name) params.append("location_name", filters.location_name);
    if (filters.status !== "") params.append("status", filters.status);

    const res = await axios.get(
      `/api/web/comment?${params.toString()}`,
      globalStore.getAxiosHeader()
    );

    if (res.data.result && Array.isArray(res.data.data)) {
      ratings.value = res.data.data;
    } else {
      state.error = res.data.message || "Failed to fetch ratings";
      showNotification("error", "Error", state.error);
    }
  } catch (error) {
    console.error("Error fetching ratings:", error);
    state.error = "An error occurred while fetching ratings.";
    showNotification("error", "Error", state.error);
    await globalStore.onCheckError(error);
  } finally {
    state.isLoading = false;
  }
};

// Fetch locations for dropdown
const fetchLocations = async () => {
  try {
    const res = await axios.get("/api/locations", globalStore.getAxiosHeader());

    if (res.data.result && Array.isArray(res.data.data)) {
      locations.value = res.data.data;
    } else {
      console.error("Failed to fetch locations:", res.data);
    }
  } catch (error) {
    console.error("Error fetching locations:", error);
    await globalStore.onCheckError(error);
  }
};

// Fetch users for rater dropdown
const fetchUsers = async () => {
  try {
    const res = await axios.get("/api/users", globalStore.getAxiosHeader());

    if (res.data.result && Array.isArray(res.data.data)) {
      users.value = res.data.data;
    } else {
      console.error("Failed to fetch users:", res.data);
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    await globalStore.onCheckError(error);
  }
};

// Filter handling
const onFilterInput = () => {
  // Debounce search input
  clearTimeout(filterTimer.value);
  filterTimer.value = setTimeout(() => {
    applyFilters();
  }, 500);
};

const applyFilters = () => {
  fetchRatings();
};

const resetFilters = () => {
  filters.location_name = "";
  filters.status = "";
  fetchRatings();
};

// CRUD operations
const createRating = async () => {
  isSubmitting.value = true;
  modalMessage.value = "";

  try {
    const ratingData = {
      location_id: newRating.location_id,
      rater_id: newRating.rater_id,
      star: newRating.star,
      comment: newRating.comment,
      status: newRating.status ? 1 : 0,
    };

    const res = await axios.post(
      "/api/web/comment",
      ratingData,
      globalStore.getAxiosHeader()
    );

    if (res.data.result) {
      await fetchRatings();
      closeModal();
      resetRatingForm();
      showNotification("success", "Success", "Rating created successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to create rating";
    }
  } catch (error) {
    console.error("Error creating rating:", error);
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        modalMessage.value = error.response.data.message;
      } else if (error.response.data.errors) {
        // Format validation errors
        const errors = Object.values(error.response.data.errors).flat();
        modalMessage.value = errors.join("\n");
      } else {
        modalMessage.value = "An error occurred while creating the rating.";
      }
    } else {
      modalMessage.value = "An error occurred while creating the rating.";
    }

    await globalStore.onCheckError(error);
  } finally {
    isSubmitting.value = false;
  }
};

const updateRating = async () => {
  isSubmitting.value = true;
  modalMessage.value = "";

  try {
    const ratingData = {
      location_id: newRating.location_id,
      rater_id: newRating.rater_id,
      star: newRating.star,
      comment: newRating.comment,
      status: newRating.status ? 1 : 0,
    };

    const res = await axios.put(
      `/api/web/comment/update/${currentRatingId.value}`,
      ratingData,
      globalStore.getAxiosHeader()
    );

    if (res.data.result) {
      await fetchRatings();
      closeModal();
      resetRatingForm();
      showNotification("success", "Success", "Rating updated successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to update rating";
    }
  } catch (error) {
    console.error("Error updating rating:", error);
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        modalMessage.value = error.response.data.message;
      } else if (error.response.data.errors) {
        // Format validation errors
        const errors = Object.values(error.response.data.errors).flat();
        modalMessage.value = errors.join("\n");
      } else {
        modalMessage.value = "An error occurred while updating the rating.";
      }
    } else {
      modalMessage.value = "An error occurred while updating the rating.";
    }

    await globalStore.onCheckError(error);
  } finally {
    isSubmitting.value = false;
  }
};

// Toggle rating status
const performToggleStatus = async (ratingId) => {
  try {
    const rating = ratings.value.find((r) => r.id === ratingId);
    if (!rating) return;

    const newStatus = !rating.status;

    const res = await axios.put(
      `/api/web/comment/update/status/${ratingId}`,
      { status: newStatus ? 1 : 0 },
      globalStore.getAxiosHeader()
    );

    if (res.data.result) {
      // Update local state
      rating.status = newStatus;

      showNotification(
        "success",
        "Success",
        `Rating has been ${newStatus ? "activated" : "deactivated"}`
      );
    } else {
      showNotification(
        "error",
        "Error",
        res.data.message || "Failed to update rating status"
      );
    }
  } catch (error) {
    console.error("Error toggling rating status:", error);
    showNotification(
      "error",
      "Error",
      "An error occurred while updating the rating status."
    );
    await globalStore.onCheckError(error);
  }
};

// Prompt for status toggle
const toggleRatingStatus = (ratingId, currentStatus) => {
  const action = currentStatus ? "deactivate" : "activate";
  showConfirmation(
    `${action.charAt(0).toUpperCase() + action.slice(1)} Rating`,
    `Are you sure you want to ${action} this rating?`,
    performToggleStatus,
    ratingId
  );
};

// Delete rating implementation
const performDeleteRating = async (ratingId) => {
  try {
    const res = await axios.delete(
      `/api/web/comment/${ratingId}`,
      globalStore.getAxiosHeader()
    );

    if (res.data.result) {
      ratings.value = ratings.value.filter((r) => r.id !== ratingId);
      showNotification("success", "Success", "Rating deleted successfully!");
    } else {
      showNotification("error", "Error", res.data.message || "Failed to delete rating");
    }
  } catch (error) {
    console.error("Error deleting rating:", error);
    showNotification("error", "Error", "An error occurred while deleting the rating.");
    await globalStore.onCheckError(error);
  }
};

// Show confirmation for delete
const deleteRating = (ratingId) => {
  showConfirmation(
    "Delete Rating",
    "Are you sure you want to delete this rating?",
    performDeleteRating,
    ratingId
  );
};

// Modal controls and form handling
const openModal = () => {
  resetRatingForm();
  isEditMode.value = false;
  showModal.value = true;
};

const editRating = async (ratingId) => {
  resetRatingForm();

  try {
    state.isLoading = true;

    // Find rating in existing data
    const rating = ratings.value.find((r) => r.id === ratingId);

    if (rating) {
      newRating.location_id = rating.location_id;
      newRating.rater_id = rating.rater_id;
      newRating.star = rating.star;
      newRating.comment = rating.comment;
      newRating.status = rating.status;

      currentRatingId.value = ratingId;
      isEditMode.value = true;
      showModal.value = true;
    } else {
      // Rating not in local state, fetch from API
      const res = await axios.get(
        `/api/web/comment/${ratingId}`,
        globalStore.getAxiosHeader()
      );

      if (res.data.result) {
        const rating = res.data.data;
        newRating.location_id = rating.location_id;
        newRating.rater_id = rating.rater_id;
        newRating.star = rating.star;
        newRating.comment = rating.comment;
        newRating.status = rating.status;

        currentRatingId.value = ratingId;
        isEditMode.value = true;
        showModal.value = true;
      } else {
        showNotification(
          "error",
          "Error",
          res.data.message || "Failed to fetch rating details"
        );
      }
    }
  } catch (error) {
    console.error("Error fetching rating details:", error);
    showNotification(
      "error",
      "Error",
      "An error occurred while fetching the rating details."
    );
    await globalStore.onCheckError(error);
  } finally {
    state.isLoading = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  resetRatingForm();
  modalMessage.value = "";
};

const resetRatingForm = () => {
  newRating.location_id = "";
  newRating.rater_id = "";
  newRating.star = 1;
  newRating.comment = "";
  newRating.status = true;
  currentRatingId.value = null;
};

// Form submission handler
const handleSubmit = async (event) => {
  event.preventDefault();

  if (isEditMode.value) {
    await updateRating();
  } else {
    await createRating();
  }
};

// Confirmation modal controls
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

// Initialize data on component mount
onMounted(async () => {
  try {
    // Load all required data
    await Promise.all([fetchRatings(), fetchLocations(), fetchUsers()]);
  } catch (error) {
    console.error("Error initializing component:", error);
    showNotification("error", "Error", "Failed to initialize component data");
    await globalStore.onCheckError(error);
  }
});
</script>
<style scoped>
/* Comment text styles */
.comment-text {
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Photo thumbnail styles */
.photo-thumbnails {
  display: flex;
  gap: 5px;
}

.photo-thumbnail {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
}

.photo-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.comment-modal {
  max-height: 90vh;
  overflow-y: auto;
}

/* Photo Preview Modal */
.photo-preview-modal {
  z-index: 1060;
}

.preview-content {
  max-width: 90%;
  max-height: 90vh;
  padding: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-body {
  max-height: 80vh;
  overflow: auto;
}

.modal-body img {
  display: block;
  margin: 0 auto;
  max-width: 100%;
  max-height: 70vh;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.close-btn:hover {
  opacity: 1;
}

/* Photo upload styles */
.photo-dropzone {
  border: 2px dashed #ced4da;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.photo-dropzone:hover,
.photo-dropzone.is-dragover {
  border-color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.05);
}

.dropzone-content {
  color: #6c757d;
}

.selected-photos-grid,
.existing-photos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  margin-top: 15px;
}

.selected-photo-item,
.existing-photo-item {
  position: relative;
}

.photo-preview {
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 100px;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.photo-preview:hover .photo-overlay {
  opacity: 1;
}

.remove-photo {
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.photo-name {
  display: block;
  text-align: center;
  margin-top: 5px;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #6c757d;
}

/* Confirmation Modal Styles */
.confirmation-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1060;
}

.confirmation-modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  width: 400px;
  max-width: 90%;
  overflow: hidden;
}

.confirmation-header {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.confirmation-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.confirmation-icon.warning {
  background: #fff3cd;
  color: #856404;
}

.confirmation-body {
  padding: 20px 15px;
}

.confirmation-footer {
  padding: 15px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #eee;
}

/* Toast Styles */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 350px;
}

.toast-notification {
  display: flex;
  background: white;
  border-radius: 6px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  margin-bottom: 15px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.toast-icon {
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
}

.toast-notification.success .toast-icon {
  background: #d4edda;
  color: #155724;
}

.toast-notification.error .toast-icon {
  background: #f8d7da;
  color: #721c24;
}

.toast-content {
  padding: 15px;
  flex: 1;
}

.toast-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.toast-close {
  background: none;
  border: none;
  font-size: 20px;
  padding: 10px;
  cursor: pointer;
  opacity: 0.6;
}

.toast-close:hover {
  opacity: 1;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
