<template>
  <div class="location-image-uploader">
    <h2 class="mb-4">Location Image Uploader</h2>

    <!-- Location Selection -->
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title mb-3">1. Select Location</h5>

        <div class="mb-3">
          <label for="locationSelect" class="form-label">Location</label>
          <select
            v-model="selectedLocationId"
            class="form-select form-select-lg"
            id="locationSelect"
            @change="handleLocationChange"
          >
            <option value="">Select a location</option>
            <option v-for="location in locations" :key="location.id" :value="location.id">
              {{ location.name }}
            </option>
          </select>
        </div>

        <div v-if="selectedLocation" class="selected-location-info">
          <div class="d-flex align-items-center">
            <img
              :src="selectedLocation.thumbnail || '/placeholder-image.jpg'"
              alt="Location thumbnail"
              class="location-thumbnail me-3"
            />
            <div>
              <h5 class="mb-1">{{ selectedLocation.name }}</h5>
              <p
                v-if="selectedLocation.province || selectedLocation.district"
                class="mb-0 text-muted"
              >
                {{ formatLocation(selectedLocation) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Upload -->
    <div class="card" :class="{ 'disabled-card': !selectedLocationId }">
      <div class="card-body">
        <h5 class="card-title mb-3">2. Upload Images</h5>

        <div v-if="!selectedLocationId" class="text-center p-4 text-muted">
          <i class="fas fa-arrow-up fa-2x mb-3"></i>
          <p class="mb-0">Please select a location first</p>
        </div>

        <div v-else>
          <div class="image-upload-area mb-4" @click="triggerFileInput">
            <input
              type="file"
              ref="fileInput"
              multiple
              accept="image/*"
              class="d-none"
              @change="handleImageSelect"
            />
            <div class="upload-icon">
              <i class="fas fa-cloud-upload-alt fa-2x"></i>
            </div>
            <p class="mb-1 mt-2">Click or drag files to upload</p>
            <small class="text-muted">You can upload multiple images at once</small>
          </div>

          <!-- Selected Images Preview -->
          <div v-if="selectedFiles.length > 0" class="mb-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="mb-0">Selected Images ({{ selectedFiles.length }})</h6>
              <button class="btn btn-sm btn-outline-danger" @click="clearSelectedFiles">
                <i class="fas fa-trash-alt me-1"></i> Clear All
              </button>
            </div>

            <div class="selected-files-grid">
              <div
                v-for="(file, index) in selectedFiles"
                :key="index"
                class="selected-file-item"
              >
                <img
                  :src="getImagePreviewUrl(file)"
                  :alt="file.name || 'Image preview'"
                  class="selected-file-preview"
                />
                <button class="remove-selection-btn" @click="removeSelectedFile(index)">
                  <i class="fas fa-times"></i>
                </button>
                <div class="selected-file-name">
                  {{ shortenFileName(file.name || "Image " + (index + 1)) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Upload Button -->
          <div class="text-end">
            <button
              class="btn btn-primary btn-lg"
              @click="uploadImages"
              :disabled="isUploading || !selectedFiles.length"
            >
              <span v-if="isUploading">
                <i class="fas fa-spinner fa-spin me-2"></i>Uploading...
              </span>
              <span v-else> <i class="fas fa-upload me-2"></i>Upload Images </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Results Section -->
    <div
      v-if="uploadResult"
      class="card mt-4"
      :class="{ 'border-success': uploadSuccess, 'border-danger': !uploadSuccess }"
    >
      <div class="card-body">
        <h5
          class="card-title"
          :class="{ 'text-success': uploadSuccess, 'text-danger': !uploadSuccess }"
        >
          <i
            :class="[
              uploadSuccess ? 'fas fa-check-circle' : 'fas fa-exclamation-circle',
              'me-2',
            ]"
          ></i>
          Upload Result
        </h5>
        <p class="mb-0">{{ uploadResult }}</p>
      </div>
    </div>

    <!-- Recent Uploads -->
    <div v-if="selectedLocationId && uploadedImages.length > 0" class="card mt-4">
      <div class="card-body">
        <h5 class="card-title mb-3">Recent Uploads</h5>

        <div class="uploaded-images-grid">
          <div
            v-for="(image, index) in uploadedImages"
            :key="index"
            class="uploaded-image-item"
          >
            <img
              :src="image.url || '/placeholder-image.jpg'"
              :alt="'Uploaded image ' + (index + 1)"
              class="uploaded-image"
            />
            <div class="image-actions">
              <button
                class="btn btn-sm btn-outline-danger"
                @click="confirmDeleteImage(image.id)"
                title="Delete Image"
              >
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Confirmation Modal -->
  <div v-if="showConfirmModal" class="modal-overlay">
    <div class="modal-content confirm-modal">
      <div class="modal-header">
        <h4>Confirm Delete</h4>
        <button class="close-btn" @click="closeConfirmModal">&times;</button>
      </div>
      <div class="modal-body">
        <p>Are you sure you want to delete this image? This action cannot be undone.</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeConfirmModal">Cancel</button>
        <button class="btn btn-danger" @click="deleteImage" :disabled="isDeleting">
          <span v-if="isDeleting">
            <i class="fas fa-spinner fa-spin me-2"></i>Deleting...
          </span>
          <span v-else>Delete</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToast } from "@/composables/useToast";
import { useGlobalStore } from "@/stores/global";
import axios from "axios";
import { onBeforeUnmount, onMounted, ref } from "vue";

// State
const locations = ref([]);
const selectedLocationId = ref("");
const selectedLocation = ref(null);
const selectedFiles = ref([]);
const isUploading = ref(false);
const isDeleting = ref(false);
const uploadResult = ref("");
const uploadSuccess = ref(false);
const uploadedImages = ref([]);
const showConfirmModal = ref(false);
const imageToDelete = ref(null);
const fileInput = ref(null);

// Store object URLs to clean up
const objectUrls = ref([]);

// Toast notifications
const { showNotification } = useToast();
const globalStore = useGlobalStore();

// Helper method to safely create object URLs
const getImagePreviewUrl = (file) => {
  if (file instanceof File || file instanceof Blob) {
    const url = URL.createObjectURL(file);
    objectUrls.value.push(url);
    return url;
  }
  // Return the string URL if it's not a File/Blob
  return typeof file === "string" ? file : "/placeholder-image.jpg";
};

// Clean up object URLs to prevent memory leaks
const cleanupObjectURLs = () => {
  objectUrls.value.forEach((url) => {
    URL.revokeObjectURL(url);
  });
  objectUrls.value = [];
};

// Fetch all locations
const fetchLocations = async () => {
  try {
    const response = await axios.get("/api/locations", globalStore.getAxiosHeader());

    if (response.data.result && Array.isArray(response.data.data)) {
      locations.value = response.data.data;
    } else {
      showNotification("error", "Error", "Failed to fetch locations");
    }
  } catch (error) {
    console.error("Error fetching locations:", error);
    showNotification("error", "Error", "An error occurred while fetching locations");
  }
};

// Fetch location details and its images
const fetchLocationDetails = async (locationId) => {
  try {
    // Fetch location details
    const locationResponse = await axios.get(
      `/api/locations/${locationId}`,
      globalStore.getAxiosHeader()
    );

    if (locationResponse.data.result) {
      selectedLocation.value = locationResponse.data.data;

      // Fetch location images
      const imagesResponse = await axios.get(
        `/api/locations/${locationId}/images`,
        globalStore.getAxiosHeader()
      );

      if (imagesResponse.data.result) {
        uploadedImages.value = imagesResponse.data.data || [];
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
  }
};

// Format location address
const formatLocation = (location) => {
  const parts = [];

  if (location.district && location.district.name) {
    parts.push(location.district.name);
  }

  if (location.province && location.province.name) {
    parts.push(location.province.name);
  }

  return parts.join(", ");
};

// Handle location change
const handleLocationChange = () => {
  if (selectedLocationId.value) {
    fetchLocationDetails(selectedLocationId.value);
    // Reset file selection
    selectedFiles.value = [];
    uploadResult.value = "";
    cleanupObjectURLs();
  } else {
    selectedLocation.value = null;
    uploadedImages.value = [];
  }
};

// Trigger file input
const triggerFileInput = () => {
  fileInput.value.click();
};

// Handle image selection
const handleImageSelect = (event) => {
  const files = event.target.files;
  if (files) {
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        selectedFiles.value.push(file);
      }
    });
  }

  // Reset input to allow selecting the same files again
  event.target.value = null;
};

// Remove selected file
const removeSelectedFile = (index) => {
  selectedFiles.value.splice(index, 1);
};

// Clear all selected files
const clearSelectedFiles = () => {
  selectedFiles.value = [];
  cleanupObjectURLs();
};

// Shorten file name
const shortenFileName = (name) => {
  if (!name) return "Unnamed file";
  if (name.length > 15) {
    return name.substring(0, 12) + "...";
  }
  return name;
};

// Upload images
const uploadImages = async () => {
  if (!selectedLocationId.value || !selectedFiles.value.length) return;

  isUploading.value = true;
  uploadResult.value = "";

  try {
    const formData = new FormData();

    selectedFiles.value.forEach((file) => {
      // Only append if it's a valid File object
      if (file instanceof File) {
        formData.append("images[]", file);
      }
    });

    const response = await axios.post(
      `/api/locations/images/${selectedLocationId.value}`,
      formData,
      globalStore.getAxiosHeader()
    );

    if (response.data.result) {
      uploadSuccess.value = true;
      uploadResult.value = response.data.message || "Images uploaded successfully";
      showNotification("success", "Success", "Images uploaded successfully");

      // Clear selected files
      selectedFiles.value = [];
      cleanupObjectURLs();

      // Fetch updated images
      await fetchLocationDetails(selectedLocationId.value);
    } else {
      uploadSuccess.value = false;
      uploadResult.value = response.data.message || "Failed to upload images";
    }
  } catch (error) {
    console.error("Error uploading images:", error);
    uploadSuccess.value = false;
    uploadResult.value = "An error occurred while uploading images";

    if (error.response && error.response.data && error.response.data.message) {
      uploadResult.value = error.response.data.message;
    }
  } finally {
    isUploading.value = false;
  }
};

// Confirm delete image
const confirmDeleteImage = (imageId) => {
  imageToDelete.value = imageId;
  showConfirmModal.value = true;
};

// Close confirmation modal
const closeConfirmModal = () => {
  showConfirmModal.value = false;
  imageToDelete.value = null;
};

// Delete image
const deleteImage = async () => {
  if (!imageToDelete.value) return;

  isDeleting.value = true;

  try {
    const response = await axios.delete(
      `/api/locations/${selectedLocationId.value}/images/${imageToDelete.value}`,
      globalStore.getAxiosHeader()
    );

    if (response.data.result) {
      showNotification("success", "Success", "Image deleted successfully");

      // Update the images list
      uploadedImages.value = uploadedImages.value.filter(
        (img) => img.id !== imageToDelete.value
      );

      closeConfirmModal();
    } else {
      showNotification(
        "error",
        "Error",
        response.data.message || "Failed to delete image"
      );
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    showNotification("error", "Error", "An error occurred while deleting image");
  } finally {
    isDeleting.value = false;
  }
};

// Clean up object URLs when component is unmounted
onBeforeUnmount(() => {
  cleanupObjectURLs();
});

// Initialize
onMounted(() => {
  fetchLocations();
});
</script>

<style scoped>
.location-image-uploader {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem 0;
}

.card {
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 500;
  color: #333;
}

.disabled-card {
  opacity: 0.7;
  pointer-events: none;
}

.location-thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

.selected-location-info {
  margin-top: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 6px;
  border-left: 4px solid #16c464;
}

/* Image upload styling */
.image-upload-area {
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 2.5rem 2rem;
  text-align: center;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: all 0.2s ease;
}

.image-upload-area:hover {
  border-color: #16c464;
  background-color: #f2f9f5;
}

.upload-icon {
  color: #aaa;
  margin-bottom: 0.5rem;
}

/* Selected files grid */
.selected-files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}

.selected-file-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.selected-file-preview {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.selected-file-name {
  padding: 0.5rem;
  font-size: 0.8rem;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: #f5f5f5;
}

.remove-selection-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255, 82, 82, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* Uploaded images grid */
.uploaded-images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.25rem;
}

.uploaded-image-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.uploaded-image {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.image-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.uploaded-image-item:hover .image-actions {
  opacity: 1;
}

/* Modal Styles */
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
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.confirm-modal {
  width: 90%;
  max-width: 450px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h4 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
}

/* Form styling */
.form-select {
  padding: 0.75rem;
  border-color: #e0e0e0;
  border-radius: 6px;
}

.form-select:focus {
  border-color: #16c464;
  box-shadow: 0 0 0 0.25rem rgba(22, 196, 100, 0.25);
}

.btn-primary {
  background-color: #16c464;
  border-color: #16c464;
}

.btn-primary:hover {
  background-color: #14b35a;
  border-color: #14b35a;
}

.btn-danger {
  background-color: #ff5252;
  border-color: #ff5252;
}

.btn-danger:hover {
  background-color: #f03e3e;
  border-color: #f03e3e;
}

.border-success {
  border-color: #16c464 !important;
}

.border-danger {
  border-color: #ff5252 !important;
}

.text-success {
  color: #16c464 !important;
}

.text-danger {
  color: #ff5252 !important;
}
</style>
