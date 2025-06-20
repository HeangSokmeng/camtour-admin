<template>
  <div class="image-uploader-container">
    <div class="uploader-hero">
      <div class="hero-content">
        <h1 class="display-6 mb-2">Hotel Photo Gallery</h1>
        <p class="lead text-muted">Upload and manage your hotel images with ease</p>
      </div>
      <div class="hero-illustration">
        <div class="floating-card">
          <i class="fa fa-hotel fa-3x text-primary"></i>
        </div>
      </div>
    </div>

    <div class="upload-flow">
      <div class="upload-step active">
        <div class="step-indicator">
          <div class="step-number">1</div>
        </div>

        <div class="card hotel-selector">
          <div class="card-body">
            <div class="d-flex align-items-center mb-4">
              <i class="fa fa-hotel text-primary me-3 fa-2x"></i>
              <div>
                <h4 class="mb-0">Select Hotel</h4>
                <small class="text-muted">Choose the hotel for your images</small>
              </div>
            </div>

            <div class="hotel-dropdown">
              <select
                v-model="selectedHotelId"
                class="form-select form-select-lg"
                @change="handleHotelChange"
              >
                <option value="">Choose a hotel...</option>
                <option v-for="hotel in hotels" :key="hotel.id" :value="hotel.id">
                  {{ hotel.name }}
                </option>
              </select>
            </div>

            <transition name="fade">
              <div v-if="selectedHotel" class="hotel-preview mt-4">
                <div class="d-flex align-items-center">
                  <div class="hotel-info ms-3">
                    <h5 class="mb-1">{{ selectedHotel.name }}</h5>
                    <p class="mb-0 text-muted">
                      <i class="fa fa-location-dot me-1"></i>
                      {{ selectedHotel.name_km }}
                    </p>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <div
        class="upload-step"
        :class="{ active: selectedHotelId, disabled: !selectedHotelId }"
      >
        <div class="step-indicator">
          <div class="step-number">2</div>
        </div>

        <div class="card image-uploader">
          <div class="card-body">
            <div class="d-flex align-items-center mb-4">
              <i class="fa fa-cloud-upload-alt text-primary me-3 fa-2x"></i>
              <div>
                <h4 class="mb-0">Upload Images</h4>
                <small class="text-muted">Add photos to your hotel</small>
              </div>
            </div>

            <template v-if="!selectedHotelId">
              <div class="upload-placeholder">
                <i class="fa fa-arrow-up fa-3x mb-3 text-muted"></i>
                <p class="mb-0 text-muted">Select a hotel first</p>
              </div>
            </template>

            <template v-else>
              <div
                class="dropzone"
                :class="{ dragover: isDragging }"
                @click="triggerFileInput"
                @dragover.prevent="handleDragOver"
                @dragleave.prevent="handleDragLeave"
                @drop.prevent="handleDrop"
              >
                <input
                  type="file"
                  ref="fileInput"
                  multiple
                  accept="image/*"
                  class="d-none"
                  @change="handleImageSelect"
                />

                <div class="dropzone-content">
                  <div class="upload-icon">
                    <i class="fa fa-cloud-arrow-up fa-4x"></i>
                  </div>
                  <h6 class="mt-3 mb-1">Drag & drop images here</h6>
                  <p class="mb-0 text-muted">or click to browse</p>
                  <small class="text-muted mt-2 d-block"
                    >Support JPG, PNG, JPEG (max 2MB each)</small
                  >
                </div>
              </div>

              <transition name="fade">
                <div v-if="selectedFiles.length > 0" class="selected-images-section mt-4">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="mb-0">Selected Images ({{ selectedFiles.length }})</h6>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="clearSelectedFiles"
                    >
                      <i class="fa fa-trash-alt me-1"></i> Clear All
                    </button>
                  </div>

                  <div class="selected-images-grid">
                    <div
                      v-for="(file, index) in selectedFiles"
                      :key="index"
                      class="image-preview-card"
                    >
                      <div class="image-wrapper">
                        <img
                          :src="getImagePreviewUrl(file)"
                          alt="Preview"
                          class="image-preview"
                        />
                        <div class="image-overlay">
                          <button
                            class="btn btn-sm btn-danger"
                            @click="removeSelectedFile(index)"
                          >
                            <i class="fa fa-times"></i>
                          </button>
                        </div>
                      </div>
                      <div class="image-name">
                        {{ shortenFileName(file.name) }}
                      </div>
                    </div>
                  </div>
                </div>
              </transition>

              <div class="upload-actions mt-4">
                <button
                  class="btn btn-primary btn-lg px-5"
                  @click="uploadImages"
                  :disabled="isUploading || !selectedFiles.length"
                >
                  <span v-if="isUploading">
                    <i class="fa fa-spinner fa-spin me-2"></i>Uploading...
                  </span>
                  <span v-else>
                    <i class="fa fa-upload me-2"></i>Upload
                    {{ selectedFiles.length }} Image{{
                      selectedFiles.length !== 1 ? "s" : ""
                    }}
                  </span>
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div
        v-if="uploadResult"
        class="alert"
        :class="uploadSuccess ? 'alert-success' : 'alert-danger'"
        role="alert"
      >
        <i
          :class="uploadSuccess ? 'fa fa-check-circle' : 'fa fa-exclamation-circle'"
          class="me-2"
        ></i>
        {{ uploadResult }}
      </div>
    </transition>

    <transition name="fade">
      <div
        v-if="selectedHotelId && (uploadedImages.length > 0 || isLoading)"
        class="gallery-section"
      >
        <div class="section-header mb-4">
          <h4 class="mb-0">Image Gallery</h4>
          <p class="text-muted">Manage your uploaded images</p>
        </div>

        <div v-if="isLoading" class="loading-state">
          <div class="spinner-grow text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="uploadedImages.length === 0" class="empty-gallery">
          <i class="fa fa-image fa-3x mb-3 text-muted"></i>
          <h5>No images uploaded yet</h5>
          <p class="text-muted mb-0">Start by uploading your first image</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle">
            <thead>
              <tr>
                <th class="text-center" width="80">Preview</th>
                <th>File Name</th>
                <th>Upload Date</th>
                <th class="text-center" width="150">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(image, index) in uploadedImages" :key="image.id">
                <td class="text-center">
                  <div class="table-thumbnail">
                    <img :src="image.url" alt="Thumbnail" />
                  </div>
                </td>
                <td>
                  <strong>{{ image.name || `Image ${index + 1}` }}</strong>
                </td>
                <td>
                  <div class="text-muted">
                    <i class="fa fa-calendar me-1"></i>
                    {{ formatDate(image.created_at) }}
                  </div>
                </td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                    <button
                      class="btn btn-outline-primary"
                      @click="viewImage(image)"
                      title="View Full Size"
                    >
                      <i class="fa fa-eye"></i>
                    </button>
                    <button
                      class="btn btn-outline-danger"
                      @click="confirmDeleteImage(image.id)"
                      title="Delete Image"
                    >
                      <i class="fa fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </transition>

    <transition name="modal">
      <div v-if="showConfirmModal" class="modal-overlay">
        <div class="modal-content confirm-modal">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fa fa-exclamation-triangle text-warning me-2"></i>
              Confirm Deletion
            </h5>
          </div>
          <div class="modal-body">
            <p class="mb-0">
              Are you sure you want to delete this image? This action cannot be undone.
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-light" @click="closeConfirmModal">Cancel</button>
            <button class="btn btn-danger" @click="deleteImage" :disabled="isDeleting">
              <span v-if="isDeleting">
                <i class="fa fa-spinner fa-spin me-2"></i>Deleting...
              </span>
              <span v-else> <i class="fa fa-trash-alt me-2"></i>Delete </span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal">
      <div v-if="previewImage" class="modal-overlay" @click="closePreview">
        <div class="modal-content preview-modal" @click.stop>
          <div class="modal-header">
            <h5 class="modal-title">Image Preview</h5>
            <button class="btn-close" @click="closePreview">
              <i class="fa fa-times"></i>
            </button>
          </div>
          <div class="modal-body p-0">
            <img :src="previewImage.url" alt="Preview" class="img-fluid" />
          </div>
        </div>
      </div>
    </transition>

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
  </div>
</template>

<script setup>
import { useToast } from "@/composables/useToast";
import { useGlobalStore } from "@/stores/global";
import axios from "axios";
import { onBeforeUnmount, onMounted, ref } from "vue";

const hotels = ref([]);
const selectedHotelId = ref("");
const selectedHotel = ref(null);
const selectedFiles = ref([]);
const isUploading = ref(false);
const isDeleting = ref(false);
const isLoading = ref(false);
const uploadResult = ref("");
const uploadSuccess = ref(false);
const uploadedImages = ref([]);
const showConfirmModal = ref(false);
const imageToDelete = ref(null);
const fileInput = ref(null);
const objectUrls = ref([]);
const isDragging = ref(false);
const previewImage = ref(null);
const { toasts, showNotification, removeToast } = useToast();
const globalStore = useGlobalStore();

const getImagePreviewUrl = (file) => {
  if (file instanceof File || file instanceof Blob) {
    const url = URL.createObjectURL(file);
    objectUrls.value.push(url);
    return url;
  }
  return typeof file === "string" ? file : "/placeholder-image.jpg";
};

const cleanupObjectURLs = () => {
  objectUrls.value.forEach((url) => {
    URL.revokeObjectURL(url);
  });
  objectUrls.value = [];
};

const fetchHotels = async () => {
  try {
    const response = await axios.get(
      "/api/hotels/siemreap",
      globalStore.getAxiosHeader()
    );
    if (response.data.result && Array.isArray(response.data.data)) {
      hotels.value = response.data.data;
    } else {
      showNotification("error", "Error", "Failed to fetch hotels");
    }
  } catch (error) {
    console.error("Error fetching hotels:", error);
    showNotification("error", "Error", "An error occurred while fetching hotels");
  }
};

const fetchHotelDetails = async (hotelId) => {
  isLoading.value = true;
  try {
    const hotelResponse = await axios.get(
      `/api/hotels/siemreap/${hotelId}`,
      globalStore.getAxiosHeader()
    );
    if (hotelResponse.data.result) {
      selectedHotel.value = hotelResponse.data.data;
    }

    const imagesResponse = await axios.get(
      `/api/hotels/siemreap/get/images/${hotelId}`,
      globalStore.getAxiosHeader()
    );
    if (imagesResponse.data.result && Array.isArray(imagesResponse.data.data)) {
      uploadedImages.value = imagesResponse.data.data.map((image) => ({
        id: image.id,
        name: image.photo.split("/").pop(),
        url: image.url,
        created_at: image.created_at,
      }));
    } else {
      uploadedImages.value = [];
    }
  } catch (error) {
    console.error("Error fetching hotel details:", error);
    showNotification("error", "Error", "Failed to fetch hotel details");
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const handleHotelChange = () => {
  if (selectedHotelId.value) {
    fetchHotelDetails(selectedHotelId.value);
    selectedFiles.value = [];
    uploadResult.value = "";
    cleanupObjectURLs();
  } else {
    selectedHotel.value = null;
    uploadedImages.value = [];
  }
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleImageSelect = (event) => {
  const files = event.target.files;
  if (files) {
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        selectedFiles.value.push(file);
      }
    });
  }
  event.target.value = null;
};

const removeSelectedFile = (index) => {
  selectedFiles.value.splice(index, 1);
};

const clearSelectedFiles = () => {
  selectedFiles.value = [];
  cleanupObjectURLs();
};

const shortenFileName = (name) => {
  if (!name) return "Unnamed file";
  if (name.length > 15) {
    return name.substring(0, 12) + "...";
  }
  return name;
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
    if (file.type.startsWith("image/")) {
      selectedFiles.value.push(file);
    }
  });
};

const uploadImages = async () => {
  if (!selectedHotelId.value || !selectedFiles.value.length) return;
  isUploading.value = true;
  uploadResult.value = "";
  try {
    const formData = new FormData();
    selectedFiles.value.forEach((file) => {
      formData.append("images[]", file);
    });

    const response = await axios.post(
      `/api/hotels/siemreap/images/${selectedHotelId.value}`,
      formData,
      globalStore.getAxiosHeader()
    );

    if (response.data.result) {
      uploadSuccess.value = true;
      uploadResult.value = "Images uploaded successfully";
      showNotification("success", "Success", "Images uploaded successfully");
      selectedFiles.value = [];
      cleanupObjectURLs();
      await fetchHotelDetails(selectedHotelId.value);
    } else {
      uploadSuccess.value = false;
      uploadResult.value = response.data.message || "Failed to upload images";
    }
  } catch (error) {
    console.error("Error uploading images:", error);
    uploadSuccess.value = false;
    if (error.response && error.response.status === 422) {
      const errorMsg =
        error.response.data.message ||
        "Validation error: " +
          Object.values(error.response.data.errors || {})
            .flat()
            .join(", ");
      uploadResult.value = errorMsg;
    } else {
      uploadResult.value =
        error.response?.data?.message || "An error occurred while uploading images";
    }
  } finally {
    isUploading.value = false;
  }
};

const viewImage = (image) => {
  previewImage.value = image;
};

const closePreview = () => {
  previewImage.value = null;
};

const confirmDeleteImage = (imageId) => {
  imageToDelete.value = imageId;
  showConfirmModal.value = true;
};

const closeConfirmModal = () => {
  showConfirmModal.value = false;
  imageToDelete.value = null;
};

const deleteImage = async () => {
  if (!imageToDelete.value) return;
  isDeleting.value = true;
  try {
    const response = await axios.delete(
      `/api/hotels/siemreap/images/${imageToDelete.value}`,
      globalStore.getAxiosHeader()
    );
    if (response.data.result) {
      showNotification("success", "Success", "Image deleted successfully");
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

onBeforeUnmount(() => {
  cleanupObjectURLs();
});

onMounted(() => {
  fetchHotels();
});
</script>

<style scoped>
.image-uploader-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.uploader-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}

.hero-content {
  z-index: 1;
}

.hero-illustration {
  position: absolute;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.1;
}

.floating-card {
  background: white;
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transform: rotate(-15deg);
}

.upload-flow {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.upload-step {
  position: relative;
  padding-left: 3rem;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.upload-step.active {
  opacity: 1;
}

.upload-step.disabled {
  pointer-events: none;
}

.step-indicator {
  position: absolute;
  left: 0;
  top: 0;
  width: 36px;
  height: 36px;
  background: #e9ecef;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.upload-step.active .step-indicator {
  background: #3b82f6;
  color: white;
}

.step-number {
  font-weight: 600;
}

.card {
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: none;
  margin-bottom: 1.5rem;
}

.hotel-preview {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  border-left: 4px solid #3b82f6;
}

.dropzone {
  border: 2px dashed #cbd5e0;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dropzone:hover,
.dropzone.dragover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.dropzone-content {
  color: #64748b;
}

.upload-icon {
  color: #94a3b8;
  margin-bottom: 1rem;
}

.upload-placeholder {
  text-align: center;
  padding: 4rem 2rem;
  background: #f8fafc;
  border-radius: 12px;
}

.selected-images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}

.image-preview-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.image-wrapper {
  position: relative;
}

.image-preview {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-wrapper:hover .image-overlay {
  opacity: 1;
}

.image-name {
  padding: 0.5rem;
  font-size: 0.875rem;
  background: #f8fafc;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gallery-section {
  margin-top: 3rem;
}

.section-header {
  margin-bottom: 1.5rem;
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-gallery {
  text-align: center;
  padding: 4rem 2rem;
  background: #f8fafc;
  border-radius: 12px;
}

.table-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
}

.table-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  margin: 1rem;
}

.preview-modal {
  max-width: 900px;
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: between;
  align-items: center;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-close {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #9ca3af;
  margin-left: auto;
}

.btn-close:hover {
  color: #4b5563;
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

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
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

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
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

@media (max-width: 768px) {
  .uploader-hero {
    flex-direction: column;
    text-align: center;
  }

  .hero-illustration {
    display: none;
  }

  .selected-images-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>
