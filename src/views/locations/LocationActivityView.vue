<template>
  <div class="mb-9">
    <div class="row g-2 mb-4">
      <div class="col-auto">
        <h2 class="mb-0">Travel Activities</h2>
      </div>
    </div>
    <div id="travel-activities">
      <div class="mb-4">
        <div class="row g-3 justify-content-between">
          <div class="col-auto">
            <div class="search-box">
              <input
                v-model="searchQuery"
                class="form-control search-input search"
                type="search"
                placeholder="Search activities"
              />
            </div>
          </div>
          <div class="col-auto">
            <button class="btn btn-primary" @click="openModal">
              <span class="fas fa-plus me-2"></span>Add Activity
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
              <th class="align-middle">Duration</th>
              <th class="align-middle">Difficulty</th>
              <th class="align-middle">Price</th>
              <th class="align-middle">Location</th>
              <th class="align-middle">Status</th>
              <th class="align-middle text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredActivities.length === 0">
              <td colspan="9" class="text-center">No activities found</td>
            </tr>
            <tr v-else v-for="(activity, index) in filteredActivities" :key="activity.id">
              <td class="align-middle ps-0">{{ index + 1 }}</td>
              <td class="align-middle">
                <div class="activity-image">
                  <img
                    v-if="activity.image"
                    :src="activity.image"
                    :alt="activity.title"
                    class="img-thumbnail"
                  />
                  <span v-else class="no-image">No Image</span>
                </div>
              </td>
              <td class="align-middle">
                <div class="fw-semibold">{{ activity.title }}</div>
                <div class="text-muted small">
                  {{ truncateText(activity.description || "No description", 50) }}
                </div>
              </td>
              <td class="align-middle">{{ activity.duration_hours }}h</td>
              <td class="align-middle">
                <span
                  class="badge"
                  :class="getDifficultyBadgeClass(activity.difficulty_level)"
                >
                  {{ activity.difficulty_level }}
                </span>
              </td>
              <td class="align-middle">${{ activity.price_per_person }}</td>
              <td class="align-middle">
                {{ getLocationName(activity.location_id) }}
              </td>
              <td class="align-middle">
                <span
                  class="badge"
                  :class="activity.is_active ? 'bg-success' : 'bg-secondary'"
                >
                  {{ activity.is_active ? "Active" : "Inactive" }}
                </span>
              </td>
              <td class="align-middle text-end">
                <button
                  class="btn btn-sm btn-primary me-2"
                  @click="editActivity(activity.id)"
                >
                  <span class="fas fa-edit me-1"></span>Edit
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  @click="deleteActivity(activity.id)"
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
    <div class="modal-content activity-form">
      <h4>{{ isEditMode ? "Edit" : "Create" }} Travel Activity</h4>
      <div v-if="modalMessage" class="alert alert-danger">
        {{ modalMessage }}
      </div>
      <form class="row g-3 needs-validation" novalidate @submit.prevent="handleSubmit">
        <!-- Activity Information -->
        <div class="col-md-6">
          <label class="form-label" for="activityTitle">Activity Title</label>
          <input
            v-model="newActivity.title"
            class="form-control"
            id="activityTitle"
            type="text"
            required
          />
          <div class="invalid-feedback">Activity title is required</div>
        </div>

        <div class="col-md-6">
          <label class="form-label" for="activityImage">Activity Image</label>
          <input
            ref="imageInput"
            class="form-control"
            id="activityImage"
            type="file"
            accept="image/*"
            @change="handleImageChange"
          />
          <div class="invalid-feedback">Valid image file is required</div>
          <div v-if="imagePreview" class="mt-2">
            <img
              :src="imagePreview"
              alt="Preview"
              class="img-thumbnail"
              style="max-width: 100px; max-height: 100px"
            />
          </div>
        </div>

        <div class="col-md-12">
          <label class="form-label" for="activityDescription">Description</label>
          <textarea
            v-model="newActivity.description"
            class="form-control"
            id="activityDescription"
            rows="3"
            required
          ></textarea>
          <div class="invalid-feedback">Description is required</div>
        </div>

        <div class="col-md-4">
          <label class="form-label" for="activityDuration">Duration (hours)</label>
          <input
            v-model.number="newActivity.duration_hours"
            class="form-control"
            id="activityDuration"
            type="number"
            min="1"
            required
          />
          <div class="invalid-feedback">Duration is required (minimum 1 hour)</div>
        </div>

        <div class="col-md-4">
          <label class="form-label" for="activityDifficulty">Difficulty Level</label>
          <select
            v-model="newActivity.difficulty_level"
            class="form-select"
            id="activityDifficulty"
            required
          >
            <option value="" disabled>Select difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Moderate">Moderate</option>
            <option value="Hard">Hard</option>
          </select>
          <div class="invalid-feedback">Difficulty level is required</div>
        </div>

        <div class="col-md-4">
          <label class="form-label" for="activityPrice">Price per Person ($)</label>
          <input
            v-model.number="newActivity.price_per_person"
            class="form-control"
            id="activityPrice"
            type="number"
            min="0"
            step="0.01"
            required
          />
          <div class="invalid-feedback">Price is required</div>
        </div>

        <!-- Location Selection -->
        <div class="col-md-6">
          <label class="form-label" for="locationId">Location</label>
          <select
            v-model="newActivity.location_id"
            class="form-select"
            id="locationId"
            required
          >
            <option value="" disabled>Select a location</option>
            <option v-for="location in locations" :key="location.id" :value="location.id">
              {{ location.name }}, {{ location.city }}
            </option>
          </select>
          <div class="invalid-feedback">Location is required</div>
        </div>

        <div class="col-md-6">
          <label class="form-label" for="maxParticipants"
            >Max Participants (optional)</label
          >
          <input
            v-model.number="newActivity.max_participants"
            class="form-control"
            id="maxParticipants"
            type="number"
            min="1"
          />
        </div>

        <!-- Included Items -->
        <div class="col-md-6">
          <label class="form-label" for="includedItems">Included Items</label>
          <div class="input-group mb-2">
            <input
              v-model="newIncludedItem"
              class="form-control"
              placeholder="Enter included item"
              @keyup.enter="addIncludedItem"
            />
            <button
              class="btn btn-outline-secondary"
              type="button"
              @click="addIncludedItem"
            >
              Add
            </button>
          </div>
          <div class="included-items-list">
            <span
              v-for="(item, index) in newActivity.included_items"
              :key="index"
              class="badge bg-primary me-1 mb-1"
            >
              {{ item }}
              <button
                type="button"
                class="btn-close btn-close-white ms-1"
                @click="removeIncludedItem(index)"
              ></button>
            </span>
          </div>
        </div>

        <!-- Requirements -->
        <div class="col-md-6">
          <label class="form-label" for="requirements">Requirements</label>
          <div class="input-group mb-2">
            <input
              v-model="newRequirement"
              class="form-control"
              placeholder="Enter requirement"
              @keyup.enter="addRequirement"
            />
            <button
              class="btn btn-outline-secondary"
              type="button"
              @click="addRequirement"
            >
              Add
            </button>
          </div>
          <div class="requirements-list">
            <span
              v-for="(requirement, index) in newActivity.requirements"
              :key="index"
              class="badge bg-warning me-1 mb-1"
            >
              {{ requirement }}
              <button
                type="button"
                class="btn-close ms-1"
                @click="removeRequirement(index)"
              ></button>
            </span>
          </div>
        </div>

        <!-- Status -->
        <div class="col-md-12">
          <div class="form-check">
            <input
              v-model="newActivity.is_active"
              class="form-check-input"
              type="checkbox"
              id="isActive"
            />
            <label class="form-check-label" for="isActive"> Active </label>
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
  activities: [],
  isLoading: false,
  error: null,
});

const locations = ref([]);
const searchQuery = ref("");
const showModal = ref(false);
const isEditMode = ref(false);
const currentActivityId = ref(null);
const isSubmitting = ref(false);
const modalMessage = ref("");
const imagePreview = ref("");
const imageInput = ref(null);
const newIncludedItem = ref("");
const newRequirement = ref("");

const confirmationModal = reactive({
  show: false,
  title: "Confirm Action",
  message: "Are you sure you want to proceed?",
  action: null,
  actionParams: null,
});

const newActivity = reactive({
  title: "",
  description: "",
  duration_hours: 1,
  difficulty_level: "",
  price_per_person: 0,
  location_id: "",
  max_participants: null,
  included_items: [],
  requirements: [],
  is_active: true,
  image: null,
});

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

const findById = (collection, id) => {
  if (!id || !collection || !collection.length) return null;
  const stringId = String(id);
  return collection.find((item) => String(item.id) === stringId);
};

const getLocationName = (locationId) => {
  if (!locationId) return "Unknown";
  const location = findById(locations.value, locationId);
  if (location) {
    return `${location.name}, ${location.city}`;
  }
  const activityWithThisLocation = state.activities.find(
    (a) => a.location_id === locationId || (a.location && a.location.id === locationId)
  );
  if (activityWithThisLocation && activityWithThisLocation.location) {
    return `${activityWithThisLocation.location.name}, ${activityWithThisLocation.location.city}`;
  }
  return "Unknown";
};

const getDifficultyBadgeClass = (difficulty) => {
  switch (difficulty) {
    case "Easy":
      return "bg-success";
    case "Moderate":
      return "bg-warning";
    case "Hard":
      return "bg-danger";
    default:
      return "bg-secondary";
  }
};

const truncateText = (text, maxLength) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const handleImageChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    newActivity.image = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const addIncludedItem = () => {
  if (newIncludedItem.value.trim()) {
    newActivity.included_items.push(newIncludedItem.value.trim());
    newIncludedItem.value = "";
  }
};

const removeIncludedItem = (index) => {
  newActivity.included_items.splice(index, 1);
};

const addRequirement = () => {
  if (newRequirement.value.trim()) {
    newActivity.requirements.push(newRequirement.value.trim());
    newRequirement.value = "";
  }
};

const removeRequirement = (index) => {
  newActivity.requirements.splice(index, 1);
};

const fetchActivities = async () => {
  state.isLoading = true;
  state.error = null;
  try {
    const res = await axios.get(
      "/api/locations/travel-activities",
      globalStore.getAxiosHeader()
    );
    if (res.data.result && Array.isArray(res.data.data)) {
      state.activities = res.data.data;
    } else {
      state.error = res.data.message || "Failed to fetch travel activities";
      console.error("API error when fetching activities:", res.data);
    }
  } catch (error) {
    console.error("Error fetching travel activities:", error);
    state.error = "An error occurred while fetching travel activities.";
    await globalStore.onCheckError(error);
  }
  state.isLoading = false;
};

const fetchLocations = async () => {
  try {
    const res = await axios.get("/api/locations", globalStore.getAxiosHeader());
    if (res.data.result && Array.isArray(res.data.data)) {
      locations.value = res.data.data;
    } else {
      console.error("Failed to fetch locations for activity selection:", res.data);
      showNotification("error", "Error", "Failed to fetch locations");
    }
  } catch (error) {
    console.error("Error fetching locations:", error);
    showNotification("error", "Error", "Failed to fetch locations");
    await globalStore.onCheckError(error);
  }
};

const createActivity = async () => {
  isSubmitting.value = true;
  modalMessage.value = "";
  try {
    const formData = new FormData();

    // Append all form fields
    formData.append("title", newActivity.title);
    formData.append("description", newActivity.description);
    formData.append("duration_hours", newActivity.duration_hours);
    formData.append("difficulty_level", newActivity.difficulty_level);
    formData.append("price_per_person", newActivity.price_per_person);
    formData.append("location_id", newActivity.location_id);
    formData.append("is_active", newActivity.is_active ? 1 : 0);

    if (newActivity.max_participants) {
      formData.append("max_participants", newActivity.max_participants);
    }

    if (newActivity.image) {
      formData.append("image", newActivity.image);
    }

    // Send arrays properly
    newActivity.included_items.forEach((item, index) => {
      formData.append(`included_items[${index}]`, item);
    });

    newActivity.requirements.forEach((requirement, index) => {
      formData.append(`requirements[${index}]`, requirement);
    });

    const res = await axios.post(`/api/travel-activities`, formData, {
      ...globalStore.getAxiosHeader(),
      "Content-Type": "multipart/form-data",
    });

    if (res.data.result) {
      await fetchActivities();
      closeModal();
      resetActivityForm();
      showNotification("success", "Success", "Activity created successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to create activity";
    }
  } catch (error) {
    console.error("Error creating activity:", error);
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        modalMessage.value = error.response.data.message;
      } else if (error.response.data.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        modalMessage.value = errors.join("\n");
      } else {
        modalMessage.value = "An error occurred while creating the activity.";
      }
    } else {
      modalMessage.value = "An error occurred while creating the activity.";
    }
    await globalStore.onCheckError(error);
  }
  isSubmitting.value = false;
};

const updateActivity = async () => {
  isSubmitting.value = true;
  modalMessage.value = "";
  try {
    const formData = new FormData();

    // Append all form fields
    formData.append("title", newActivity.title);
    formData.append("description", newActivity.description);
    formData.append("duration_hours", newActivity.duration_hours);
    formData.append("difficulty_level", newActivity.difficulty_level);
    formData.append("price_per_person", newActivity.price_per_person);
    formData.append("location_id", newActivity.location_id);
    formData.append("is_active", newActivity.is_active ? 1 : 0);
    formData.append("_method", "PUT");

    if (newActivity.max_participants) {
      formData.append("max_participants", newActivity.max_participants);
    }

    if (newActivity.image) {
      formData.append("image", newActivity.image);
    }

    // Send arrays properly
    newActivity.included_items.forEach((item, index) => {
      formData.append(`included_items[${index}]`, item);
    });

    newActivity.requirements.forEach((requirement, index) => {
      formData.append(`requirements[${index}]`, requirement);
    });

    const res = await axios.post(
      `/api/travel-activities/${currentActivityId.value}`,
      formData,
      {
        ...globalStore.getAxiosHeader(),
        "Content-Type": "multipart/form-data",
      }
    );

    if (res.data.result) {
      await fetchActivities();
      closeModal();
      resetActivityForm();
      showNotification("success", "Success", "Activity updated successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to update activity";
    }
  } catch (error) {
    console.error("Error updating activity:", error);
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        modalMessage.value = error.response.data.message;
      } else if (error.response.data.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        modalMessage.value = errors.join("\n");
      } else {
        modalMessage.value = "An error occurred while updating the activity.";
      }
    } else {
      modalMessage.value = "An error occurred while updating the activity.";
    }
    await globalStore.onCheckError(error);
  }
  isSubmitting.value = false;
};

const performDeleteActivity = async (activityId) => {
  try {
    const res = await axios.delete(
      `/api/travel-activities/${activityId}`,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      state.activities = state.activities.filter((a) => a.id !== activityId);
      await fetchActivities();
      showNotification("success", "Success", "Activity deleted successfully!");
    } else {
      showNotification("error", "Error", res.data.message || "Failed to delete activity");
    }
  } catch (error) {
    showNotification("error", "Error", "An error occurred while deleting the activity.");
    await globalStore.onCheckError(error);
  }
};

const deleteActivity = (activityId) => {
  showConfirmation(
    "Delete Activity",
    "Are you sure you want to delete this activity?",
    performDeleteActivity,
    activityId
  );
};

const openModal = () => {
  resetActivityForm();
  isEditMode.value = false;
  showModal.value = true;
};

const editActivity = async (activityId) => {
  try {
    state.isLoading = true;
    let activity = state.activities.find((a) => String(a.id) === String(activityId));
    if (!activity) {
      const response = await axios.get(
        `/api/travel-activities/${activityId}`,
        globalStore.getAxiosHeader()
      );
      if (response.data.result && response.data.data) {
        activity = response.data.data;
      } else {
        showNotification("error", "Error", "Failed to fetch activity details");
        state.isLoading = false;
        return;
      }
    }

    // Populate form with activity data
    newActivity.title = activity.title || "";
    newActivity.description = activity.description || "";
    newActivity.duration_hours = activity.duration_hours || 1;
    newActivity.difficulty_level = activity.difficulty_level || "";
    newActivity.price_per_person = parseFloat(activity.price_per_person) || 0;
    newActivity.max_participants = activity.max_participants || null;
    newActivity.included_items = activity.included_items
      ? Array.isArray(activity.included_items)
        ? activity.included_items
        : JSON.parse(activity.included_items)
      : [];
    newActivity.requirements = activity.requirements
      ? Array.isArray(activity.requirements)
        ? activity.requirements
        : JSON.parse(activity.requirements)
      : [];
    newActivity.is_active = activity.is_active ?? true;
    newActivity.image = null; // Reset image for edit

    if (activity.location_id) {
      newActivity.location_id = String(activity.location_id);
    } else if (activity.location && activity.location.id) {
      newActivity.location_id = String(activity.location.id);
    } else {
      newActivity.location_id = "";
    }

    // Show existing image preview
    if (activity.image) {
      imagePreview.value = activity.image;
    }

    currentActivityId.value = activityId;
    isEditMode.value = true;
    showModal.value = true;
  } catch (error) {
    console.error("Error fetching activity details:", error);
    showNotification(
      "error",
      "Error",
      "An error occurred while fetching activity details"
    );
    await globalStore.onCheckError(error);
  } finally {
    state.isLoading = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  resetActivityForm();
  modalMessage.value = "";
};

const resetActivityForm = () => {
  newActivity.title = "";
  newActivity.description = "";
  newActivity.duration_hours = 1;
  newActivity.difficulty_level = "";
  newActivity.price_per_person = 0;
  newActivity.location_id = "";
  newActivity.max_participants = null;
  newActivity.included_items = [];
  newActivity.requirements = [];
  newActivity.is_active = true;
  newActivity.image = null;
  currentActivityId.value = null;
  imagePreview.value = "";
  newIncludedItem.value = "";
  newRequirement.value = "";
  if (imageInput.value) {
    imageInput.value.value = "";
  }
};

const handleSubmit = async (event) => {
  event.preventDefault();
  if (!event.target.checkValidity()) {
    event.stopPropagation();
    event.target.classList.add("was-validated");
    return;
  }

  if (!newActivity.title.trim()) {
    modalMessage.value = "Activity title is required";
    return;
  }

  if (!newActivity.description.trim()) {
    modalMessage.value = "Description is required";
    return;
  }

  if (!newActivity.location_id) {
    modalMessage.value = "Location is required";
    return;
  }

  if (isEditMode.value) {
    await updateActivity();
  } else {
    await createActivity();
  }
};

const filteredActivities = computed(() => {
  return state.activities.filter(
    (activity) =>
      activity.title?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (activity.description &&
        activity.description.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      activity.difficulty_level?.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

onMounted(async () => {
  try {
    await fetchLocations();
    await fetchActivities();
  } catch (error) {
    console.error("Error during initialization:", error);
    showNotification("error", "Error", "Failed to initialize the component");
    await globalStore.onCheckError(error);
  }
});
</script>

<style scoped>
.activity-image {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.no-image {
  font-size: 0.75rem;
  color: #6c757d;
  text-align: center;
}

.modal-overlay {
  position: fixed;
  top: 0;
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

.activity-form .form-label {
  font-weight: 500;
}

.included-items-list,
.requirements-list {
  min-height: 40px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 8px;
  background-color: #f8f9fa;
}

.badge .btn-close {
  font-size: 0.65rem;
  margin-left: 0.25rem;
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

.table td {
  vertical-align: middle;
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

.toast-content {
  flex: 1;
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

/* Search input styling */
.search-box {
  position: relative;
}

.search-input {
  padding-left: 2.5rem;
}

.search-box::before {
  content: "\f002";
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 2;
}

/* Button hover effects */
.btn:hover {
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #004085;
}

.btn-danger:hover {
  background-color: #c82333;
  border-color: #bd2130;
}

/* Badge styling */
.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.5rem;
}

/* Loading and error states */
.text-center {
  padding: 2rem;
  color: #6c757d;
}

/* Form validation */
.was-validated .form-control:invalid,
.was-validated .form-select:invalid {
  border-color: #dc3545;
}

.was-validated .form-control:valid,
.was-validated .form-select:valid {
  border-color: #198754;
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #dc3545;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
  }

  .table-responsive {
    font-size: 0.875rem;
  }

  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }

  .activity-image {
    width: 40px;
    height: 40px;
  }
}

/* Smooth transitions */
* {
  transition: all 0.2s ease;
}

/* Focus states for accessibility */
.btn:focus,
.form-control:focus,
.form-select:focus {
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Custom scrollbar for modal */
.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
