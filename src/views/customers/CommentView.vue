<template>
  <div class="mb-9">
    <div class="row g-2 mb-4">
      <div class="col-auto">
        <h2 class="mb-0">Comments</h2>
      </div>
    </div>
    <div id="comments">
      <div class="mb-4">
        <div class="row g-3 justify-content-between">
          <div class="col-auto">
            <div class="search-box">
              <input
                v-model="searchQuery"
                class="form-control search-input search"
                type="search"
                placeholder="Search comments"
              />
            </div>
          </div>
          <div class="col-auto">
            <button class="btn btn-primary" @click="openModal">
              <span class="fas fa-plus me-2"></span>Add Comment
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
              <th class="align-middle">Commenter</th>
              <th class="align-middle">Location</th>
              <th class="align-middle">Comment</th>
              <th class="align-middle">Photos</th>
              <th class="align-middle text-center">Status</th>
              <th class="align-middle text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredComments.length === 0">
              <td colspan="7" class="text-center">No comments found</td>
            </tr>
            <tr v-else v-for="(comment, index) in filteredComments" :key="comment.id">
              <td class="align-middle ps-0">{{ index + 1 }}</td>
              <td class="align-middle">{{ comment.commender }}</td>
              <td class="align-middle">{{ comment.location_name }}</td>
              <td class="align-middle">
                <div class="comment-text">{{ comment.comment }}</div>
              </td>
              <td class="align-middle">
                <div
                  v-if="comment.photos && comment.photos.length > 0"
                  class="photo-thumbnails"
                >
                  <div
                    v-for="(photo, photoIndex) in comment.photos"
                    :key="photoIndex"
                    class="photo-thumbnail"
                    @click="viewPhoto(photo)"
                  >
                    <img :src="getPhotoUrl(photo)" alt="Comment photo" />
                  </div>
                </div>
                <span v-else class="text-muted">No photos</span>
              </td>
              <td class="align-middle text-center">
                <span class="badge" :class="comment.status ? 'bg-success' : 'bg-danger'">
                  {{ comment.status ? "Active" : "Inactive" }}
                </span>
              </td>
              <td class="align-middle text-end">
                <button
                  class="btn btn-sm btn-primary me-2"
                  @click="editComment(comment.id)"
                >
                  <span class="fas fa-edit me-1"></span>Edit
                </button>
                <button
                  class="btn btn-sm"
                  :class="comment.status ? 'btn-warning' : 'btn-success'"
                  @click="toggleCommentStatus(comment.id, comment.status)"
                >
                  <span
                    class="fas"
                    :class="comment.status ? 'fa-lock' : 'fa-unlock'"
                  ></span>
                </button>
                <button
                  class="btn btn-sm btn-danger ms-2"
                  @click="deleteComment(comment.id)"
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

  <!-- Comment Modal -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal-content comment-modal">
      <h4>{{ isEditMode ? "Edit" : "Create" }} Comment</h4>
      <div v-if="modalMessage" class="alert alert-danger">
        {{ modalMessage }}
      </div>
      <form class="needs-validation" novalidate @submit.prevent="handleSubmit">
        <!-- Location Selection -->
        <div class="mb-3">
          <label class="form-label" for="locationId">Location</label>
          <select
            v-model="newComment.location_id"
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
            v-model="newComment.comment"
            class="form-control"
            id="commentText"
            rows="4"
            required
          ></textarea>
          <div class="invalid-feedback">Comment text is required</div>
          <div class="text-muted small mt-1">
            {{ newComment.comment ? newComment.comment.length : 0 }}/5000 characters
          </div>
        </div>

        <!-- Status Toggle -->
        <div class="mb-3">
          <div class="form-check form-switch">
            <input
              v-model="newComment.status"
              class="form-check-input"
              type="checkbox"
              id="statusSwitch"
            />
            <label class="form-check-label" for="statusSwitch">
              {{ newComment.status ? "Active" : "Inactive" }}
            </label>
          </div>
        </div>

        <!-- Existing Photos (Edit Mode) -->
        <div v-if="isEditMode && existingPhotos.length > 0" class="mb-3">
          <label class="form-label">Existing Photos</label>
          <div class="existing-photos">
            <div
              v-for="(photo, index) in existingPhotos"
              :key="index"
              class="existing-photo-item"
            >
              <div class="photo-preview">
                <img :src="getPhotoUrl(photo)" alt="Comment photo" />
                <div class="photo-overlay">
                  <button
                    type="button"
                    class="btn btn-sm btn-danger remove-photo"
                    @click="markPhotoForRemoval(photo, index)"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- New Photos Upload -->
        <div class="mb-3">
          <label class="form-label" for="photos">
            {{ isEditMode ? "Add More Photos" : "Upload Photos" }}
          </label>
          <div
            class="photo-dropzone"
            :class="{ 'is-dragover': isDragging }"
            @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
          >
            <input
              type="file"
              id="photos"
              ref="photoInput"
              multiple
              accept="image/jpeg,image/png"
              class="d-none"
              @change="handlePhotoSelect"
            />

            <div class="dropzone-content">
              <i class="fas fa-cloud-upload-alt fa-3x mb-3"></i>
              <p>Drag and drop photos here or click to browse</p>
              <small class="text-muted">Supports JPG, PNG (max 2MB each)</small>
            </div>
          </div>

          <!-- Preview Selected Photos -->
          <div v-if="selectedPhotos.length > 0" class="mt-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6>Selected Photos ({{ selectedPhotos.length }})</h6>
              <button
                type="button"
                class="btn btn-sm btn-outline-danger"
                @click="clearSelectedPhotos"
              >
                Clear All
              </button>
            </div>

            <div class="selected-photos-grid">
              <div
                v-for="(photo, index) in selectedPhotos"
                :key="index"
                class="selected-photo-item"
              >
                <div class="photo-preview">
                  <img :src="getPhotoPreviewUrl(photo)" alt="Photo preview" />
                  <div class="photo-overlay">
                    <button
                      type="button"
                      class="btn btn-sm btn-danger remove-photo"
                      @click="removeSelectedPhoto(index)"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
                <small class="photo-name">{{ getPhotoName(photo) }}</small>
              </div>
            </div>
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

  <!-- Photo Preview Modal -->
  <div
    v-if="previewPhoto"
    class="modal-overlay photo-preview-modal"
    @click="closePhotoPreview"
  >
    <div class="modal-content preview-content" @click.stop>
      <div class="modal-header">
        <h5 class="modal-title">Photo Preview</h5>
        <button class="close-btn" @click="closePhotoPreview">&times;</button>
      </div>
      <div class="modal-body p-0">
        <img :src="getPhotoUrl(previewPhoto)" alt="Comment photo" class="img-fluid" />
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
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";

// Get toast functionality from the composable
const { toasts, showNotification, removeToast } = useToast();

const state = reactive({
  comments: [],
  isLoading: false,
  error: null,
});

const locations = ref([]);
const searchQuery = ref("");
const showModal = ref(false);
const isEditMode = ref(false);
const currentCommentId = ref(null);
const isSubmitting = ref(false);
const modalMessage = ref("");
const previewPhoto = ref(null);
const photoInput = ref(null);
const isDragging = ref(false);
const objectUrls = ref([]);
const selectedPhotos = ref([]);
const existingPhotos = ref([]);
const photosToRemove = ref([]);

// Confirmation modal state
const confirmationModal = reactive({
  show: false,
  title: "Confirm Action",
  message: "Are you sure you want to proceed?",
  action: null,
  actionParams: null,
});

// Comment form data
const newComment = reactive({
  location_id: "",
  comment: "",
  status: true,
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

// Format date utility function
const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString();
};

// Fetch comments from API
const fetchComments = async () => {
  state.isLoading = true;
  state.error = null;
  const globalStore = useGlobalStore();
  try {
    const res = await axios.get("/api/web/comment", globalStore.getAxiosHeader());
    if (res.data.result && Array.isArray(res.data.data)) {
      state.comments = res.data.data;
    } else {
      state.error = res.data.message || "Failed to fetch comments";
      showNotification("error", "Error", state.error);
    }
  } catch (error) {
    state.error = "An error occurred while fetching comments.";
    showNotification("error", "Error", state.error);
  } finally {
    state.isLoading = false;
  }
};

// Fetch locations for dropdown
const fetchLocations = async () => {
  const globalStore = useGlobalStore();
  try {
    const res = await axios.get("/api/locations", globalStore.getAxiosHeader());
    if (res.data.result && Array.isArray(res.data.data)) {
      locations.value = res.data.data;
    }
  } catch (error) {
    console.error("Error fetching locations:", error);
    modalMessage.value = "Failed to load locations.";
  }
};

// Handle comment creation
const createComment = async () => {
  const globalStore = useGlobalStore();
  isSubmitting.value = true;
  modalMessage.value = "";

  try {
    const formData = new FormData();
    formData.append("location_id", newComment.location_id);
    formData.append("comment", newComment.comment);
    formData.append("status", newComment.status ? 1 : 0);

    selectedPhotos.value.forEach((photo, index) => {
      formData.append(`photos[${index}]`, photo);
    });

    const res = await axios.post(
      "/api/web/comment",
      formData,
      globalStore.getAxiosHeader()
    );

    if (res.data.result) {
      await fetchComments();
      closeModal();
      resetCommentForm();
      showNotification("success", "Success", "Comment created successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to create comment";
    }
  } catch (error) {
    console.error("Error creating comment:", error);
    if (error.response && error.response.data && error.response.data.message) {
      modalMessage.value = error.response.data.message;
    } else if (error.response && error.response.data && error.response.data.errors) {
      // Handle validation errors
      const errors = error.response.data.errors;
      const firstError = Object.values(errors)[0][0];
      modalMessage.value = firstError || "Invalid data provided.";
    } else {
      modalMessage.value = "An error occurred while creating the comment.";
    }
  } finally {
    isSubmitting.value = false;
  }
};

// Handle comment update
const updateComment = async () => {
  const globalStore = useGlobalStore();
  isSubmitting.value = true;
  modalMessage.value = "";

  try {
    const formData = new FormData();
    formData.append("location_id", newComment.location_id);
    formData.append("comment", newComment.comment);
    formData.append("status", newComment.status ? 1 : 0);

    // Add photos to remove
    photosToRemove.value.forEach((photo, index) => {
      formData.append(`remove_photos[${index}]`, photo);
    });

    // Add new photos
    selectedPhotos.value.forEach((photo, index) => {
      formData.append(`photos[${index}]`, photo);
    });

    const res = await axios.put(
      `/api/web/comment/update/${currentCommentId.value}`,
      formData,
      globalStore.getAxiosHeader()
    );

    if (res.data.result) {
      await fetchComments();
      closeModal();
      resetCommentForm();
      showNotification("success", "Success", "Comment updated successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to update comment";
    }
  } catch (error) {
    console.error("Error updating comment:", error);
    if (error.response && error.response.data && error.response.data.message) {
      modalMessage.value = error.response.data.message;
    } else if (error.response && error.response.data && error.response.data.errors) {
      // Handle validation errors
      const errors = error.response.data.errors;
      const firstError = Object.values(errors)[0][0];
      modalMessage.value = firstError || "Invalid data provided.";
    } else {
      modalMessage.value = "An error occurred while updating the comment.";
    }
  } finally {
    isSubmitting.value = false;
  }
};

// Toggle comment status
const performToggleStatus = async (commentId) => {
  const globalStore = useGlobalStore();
  try {
    const res = await axios.put(
      `/api/web/comment/update/status/${commentId}`,
      {},
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      // Update the comment status in the local state
      const comment = state.comments.find((c) => c.id === commentId);
      if (comment) {
        comment.status = !comment.status;
      }

      // Use the server's response message
      showNotification(
        "success",
        "Success",
        res.data.message ||
          (comment.status ? "Comment has been unlocked" : "Comment has been locked")
      );
    } else {
      showNotification(
        "error",
        "Error",
        res.data.message || "Failed to update comment status"
      );
    }
  } catch (error) {
    showNotification(
      "error",
      "Error",
      "An error occurred while updating the comment status."
    );
  }
};

// Prompt for status toggle
const toggleCommentStatus = (commentId, currentStatus) => {
  const action = currentStatus ? "lock" : "unlock";
  showConfirmation(
    `${action.charAt(0).toUpperCase() + action.slice(1)} Comment`,
    `Are you sure you want to ${action} this comment?`,
    performToggleStatus,
    commentId
  );
};

// Delete comment implementation
const performDeleteComment = async (commentId) => {
  const globalStore = useGlobalStore();
  try {
    const res = await axios.delete(
      `/api/web/comment/${commentId}`,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      state.comments = state.comments.filter((c) => c.id !== commentId);
      showNotification("success", "Success", "Comment deleted successfully!");
    } else {
      showNotification("error", "Error", res.data.message || "Failed to delete comment");
    }
  } catch (error) {
    showNotification("error", "Error", "An error occurred while deleting the comment.");
  }
};

// Show confirmation for delete
const deleteComment = (commentId) => {
  showConfirmation(
    "Delete Comment",
    "Are you sure you want to delete this comment?",
    performDeleteComment,
    commentId
  );
};

// Get the full URL for a photo path
const getPhotoUrl = (photoPath) => {
  // Adjust this based on your storage configuration
  if (photoPath.startsWith("http")) {
    return photoPath;
  }
  return `${import.meta.env.VITE_APP_API_URL}/storage/${photoPath}`;
};

// View photo in preview modal
const viewPhoto = (photo) => {
  previewPhoto.value = photo;
};

// Close photo preview modal
const closePhotoPreview = () => {
  previewPhoto.value = null;
};

// Open comment modal for creation
const openModal = () => {
  resetCommentForm();
  isEditMode.value = false;
  showModal.value = true;
};

// Open comment modal for editing
const editComment = async (commentId) => {
  resetCommentForm();

  const globalStore = useGlobalStore();
  try {
    const res = await axios.get(
      `/api/web/comment/${commentId}`,
      globalStore.getAxiosHeader()
    );

    if (res.data.result) {
      const comment = res.data.data;
      newComment.location_id = comment.location_id;
      newComment.comment = comment.comment;
      newComment.status = comment.status;

      if (comment.photos && Array.isArray(comment.photos)) {
        existingPhotos.value = [...comment.photos];
      }

      currentCommentId.value = commentId;
      isEditMode.value = true;
      showModal.value = true;
    } else {
      showNotification(
        "error",
        "Error",
        res.data.message || "Failed to fetch comment details"
      );
    }
  } catch (error) {
    showNotification(
      "error",
      "Error",
      "An error occurred while fetching the comment details."
    );
  }
};

// Close comment modal
const closeModal = () => {
  showModal.value = false;
  resetCommentForm();
  modalMessage.value = "";
};

// Reset comment form
const resetCommentForm = () => {
  newComment.location_id = "";
  newComment.comment = "";
  newComment.status = true;
  currentCommentId.value = null;
  selectedPhotos.value = [];
  existingPhotos.value = [];
  photosToRemove.value = [];
  clearObjectUrls();
};

// Form submission handler
const handleSubmit = async (event) => {
  event.preventDefault();

  if (!newComment.location_id || !newComment.comment.trim()) {
    modalMessage.value = "Location and comment text are required";
    return;
  }

  if (isEditMode.value) {
    await updateComment();
  } else {
    await createComment();
  }
};

// File handling methods
const triggerFileInput = () => {
  photoInput.value?.click();
};

const handlePhotoSelect = (event) => {
  const files = event.target.files;
  if (files) {
    Array.from(files).forEach((file) => {
      if (file.type.match(/image\/(jpeg|png)/) && file.size <= 2 * 1024 * 1024) {
        selectedPhotos.value.push(file);
      } else {
        showNotification(
          "error",
          "Invalid File",
          "Only JPEG or PNG images under 2MB are allowed."
        );
      }
    });
  }
  event.target.value = null;
};

const handleDragOver = () => {
  isDragging.value = true;
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const handleDrop = (event) => {
  isDragging.value = false;
  const files = Array.from(event.dataTransfer.files);
  files.forEach((file) => {
    if (file.type.match(/image\/(jpeg|png)/) && file.size <= 2 * 1024 * 1024) {
      selectedPhotos.value.push(file);
    } else {
      showNotification(
        "error",
        "Invalid File",
        "Only JPEG or PNG images under 2MB are allowed."
      );
    }
  });
};

const getPhotoPreviewUrl = (file) => {
  if (file instanceof File) {
    const url = URL.createObjectURL(file);
    objectUrls.value.push(url);
    return url;
  }
  return null;
};

const getPhotoName = (file) => {
  if (file instanceof File) {
    return file.name.length > 20 ? file.name.substring(0, 17) + "..." : file.name;
  }
  return "";
};

const removeSelectedPhoto = (index) => {
  selectedPhotos.value.splice(index, 1);
};

const clearSelectedPhotos = () => {
  selectedPhotos.value = [];
  clearObjectUrls();
};

const clearObjectUrls = () => {
  objectUrls.value.forEach((url) => URL.revokeObjectURL(url));
  objectUrls.value = [];
};

const markPhotoForRemoval = (photo, index) => {
  photosToRemove.value.push(photo);
  existingPhotos.value.splice(index, 1);
};

// Filter comments based on search query
const filteredComments = computed(() => {
  if (!searchQuery.value) return state.comments;

  const query = searchQuery.value.toLowerCase();
  return state.comments.filter((comment) => {
    return (
      (comment.commender && comment.commender.toLowerCase().includes(query)) ||
      (comment.location_name && comment.location_name.toLowerCase().includes(query)) ||
      (comment.comment && comment.comment.toLowerCase().includes(query))
    );
  });
});

// Fetch data on component mount
onMounted(() => {
  fetchComments();
  fetchLocations();
});

// Clean up object URLs when component is unmounted
onBeforeUnmount(() => {
  clearObjectUrls();
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
