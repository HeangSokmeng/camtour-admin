<template>
  <div class="image-uploader-container">
    <!-- Hero Section -->
    <div class="uploader-hero">
      <div class="hero-content">
        <h1 class="display-6 mb-2">Product Image Gallery</h1>
        <p class="lead text-muted">Upload and manage your product images with ease</p>
      </div>
      <div class="hero-illustration">
        <div class="floating-card">
          <i class="fa fa-box fa-3x text-primary"></i>
        </div>
      </div>
    </div>

    <!-- Upload Flow -->
    <div class="upload-flow">
      <!-- Step 1: Product Selection -->
      <div class="upload-step active">
        <div class="step-indicator">
          <div class="step-number">1</div>
        </div>

        <div class="card product-selector">
          <div class="card-body">
            <div class="d-flex align-items-center mb-4">
              <i class="fa fa-box text-primary me-3 fa-2x"></i>
              <div>
                <h4 class="mb-0">Select Product</h4>
                <small class="text-muted">Choose the product for your images</small>
              </div>
            </div>

            <div class="product-dropdown">
              <select
                v-model="selectedProductId"
                class="form-select form-select-lg"
                @change="handleProductChange"
              >
                <option value="">Choose a product...</option>
                <option v-for="product in products" :key="product.id" :value="product.id">
                  {{ product.name }}
                </option>
              </select>
            </div>

            <transition name="fade">
              <div v-if="selectedProduct" class="product-preview mt-4">
                <div class="d-flex align-items-center">
                  <div class="product-thumbnail-wrapper">
                    <img
                      :src="selectedProduct.thumbnail || '/placeholder-image.jpg'"
                      alt="Product thumbnail"
                      class="product-thumbnail"
                    />
                  </div>
                  <div class="ms-3">
                    <h5 class="mb-1">{{ selectedProduct.name }}</h5>
                    <p class="mb-0 text-muted">
                      <i class="fa fa-tag me-1"></i>
                      {{ formatProduct(selectedProduct) }}
                    </p>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <!-- Step 2: Image Upload -->
      <div
        class="upload-step"
        :class="{ active: selectedProductId, disabled: !selectedProductId }"
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
                <small class="text-muted">Add photos to your product</small>
              </div>
            </div>

            <template v-if="!selectedProductId">
              <div class="upload-placeholder">
                <i class="fa fa-arrow-up fa-3x mb-3 text-muted"></i>
                <p class="mb-0 text-muted">Select a product first</p>
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
                    >Support JPG, PNG, GIF (max 5MB each)</small
                  >
                </div>
              </div>

              <!-- Selected Images -->
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

              <!-- Upload Actions -->
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

    <!-- Upload Result -->
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

    <!-- Gallery Table -->
    <transition name="fade">
      <div
        v-if="selectedProductId && (uploadedImages.length > 0 || isLoading)"
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
                <th>Size</th>
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
                <td>
                  <span class="badge bg-light text-dark">
                    {{ formatSize(image.size) }}
                  </span>
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

    <!-- Confirmation Modal -->
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

    <!-- Image Preview Modal -->
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
  </div>
</template>

<script setup>
import { useToast } from "@/composables/useToast";
import { useGlobalStore } from "@/stores/global";
import axios from "axios";
import { onBeforeUnmount, onMounted, ref } from "vue";

// State
const products = ref([]);
const selectedProductId = ref("");
const selectedProduct = ref(null);
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

// Toast notifications
const { showNotification } = useToast();
const globalStore = useGlobalStore();

// Image preview methods
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

// Fetch methods
const fetchProducts = async () => {
  try {
    const response = await axios.get("/api/products", globalStore.getAxiosHeader());
    if (response.data.result && Array.isArray(response.data.data)) {
      products.value = response.data.data;
    } else {
      showNotification("error", "Error", "Failed to fetch products");
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    showNotification("error", "Error", "An error occurred while fetching products");
  }
};

const fetchProductDetails = async (productId) => {
  isLoading.value = true;
  try {
    // Fetch product details
    const productResponse = await axios.get(
      `/api/products/${productId}`,
      globalStore.getAxiosHeader()
    );

    if (productResponse.data.result) {
      selectedProduct.value = productResponse.data.data;

      // Extract images from the product response
      if (selectedProduct.value.images && Array.isArray(selectedProduct.value.images)) {
        // Transform the data to match your component's expected format
        uploadedImages.value = selectedProduct.value.images.map((image) => ({
          id: image.id,
          name: image.image.split("/").pop(), // Extract filename from path
          url: image.image,
          created_at: selectedProduct.value.created_at || new Date().toISOString(),
          size: 0, // Size information not available in the API response
        }));
      } else {
        uploadedImages.value = [];
      }
    }
  } catch (error) {
    console.error("Error fetching product details:", error);
    showNotification("error", "Error", "Failed to fetch product details");
  } finally {
    isLoading.value = false;
  }
};

// Product and formatting methods
const formatProduct = (product) => {
  const parts = [];
  if (product.brand?.name) parts.push(product.brand.name);
  if (product.category?.name) parts.push(product.category.name);
  return parts.join(", ");
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

const formatSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// File handling methods
const handleProductChange = () => {
  if (selectedProductId.value) {
    fetchProductDetails(selectedProductId.value);
    selectedFiles.value = [];
    uploadResult.value = "";
    cleanupObjectURLs();
  } else {
    selectedProduct.value = null;
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

// Drag and drop methods
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
// Modified uploadImages method to match the server requirements
const uploadImages = async () => {
  if (!selectedProductId.value || !selectedFiles.value.length) return;

  isUploading.value = true;
  uploadResult.value = "";

  try {
    // Process each file individually - the backend expects a single image
    for (const file of selectedFiles.value) {
      if (file instanceof File) {
        const formData = new FormData();
        formData.append("product_id", selectedProductId.value);
        formData.append("image", file); // Changed from "images[]" to "image"

        const response = await axios.post(
          `/api/product-images`,
          formData,
          globalStore.getAxiosHeader()
        );

        if (!response.data.result) {
          // If any upload fails, show error and stop
          uploadSuccess.value = false;
          uploadResult.value = response.data.message || "Failed to upload images";
          break;
        }
      }
    }

    // If we got here without breaking, all uploads were successful
    uploadSuccess.value = true;
    uploadResult.value = "Images uploaded successfully";
    showNotification("success", "Success", "Images uploaded successfully");
    selectedFiles.value = [];
    cleanupObjectURLs();
    await fetchProductDetails(selectedProductId.value);
  } catch (error) {
    console.error("Error uploading images:", error);
    uploadSuccess.value = false;

    // Extract validation errors from the 422 response
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
// Image management methods
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
      `/api/product-images/${imageToDelete.value}`,
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

// Lifecycle hooks
onBeforeUnmount(() => {
  cleanupObjectURLs();
});

onMounted(() => {
  fetchProducts();
});
</script>

<style scoped>
.image-uploader-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* Hero Section */
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

/* Upload Flow */
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

/* Cards */
.card {
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: none;
  margin-bottom: 1.5rem;
}

.product-preview {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  border-left: 4px solid #3b82f6;
}

.product-thumbnail-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.product-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Dropzone */
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

/* Selected Images */
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

/* Gallery Section */
.gallery-section {
  margin-top: 3rem;
}

.section-header {
  margin-bottom: 1.5rem;
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

/* Modals */
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

/* Animations */
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

/* Responsive */
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
