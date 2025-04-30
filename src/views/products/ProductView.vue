<template>
  <div class="mb-9">
    <div class="row g-2 mb-4">
      <div class="col-auto">
        <h2 class="mb-0">Products</h2>
      </div>
    </div>
    <div id="products">
      <div class="mb-4">
        <div class="row g-3 justify-content-between">
          <div class="col-auto">
            <div class="search-box">
              <input
                v-model="searchQuery"
                class="form-control search-input search"
                type="search"
                placeholder="Search products"
              />
            </div>
          </div>
          <div class="col-auto">
            <button class="btn btn-primary" @click="openModal">
              <span class="fas fa-plus me-2"></span>Add Product
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
              <th class="align-middle">Code</th>
              <th class="align-middle">Brand</th>
              <th class="align-middle">Category</th>
              <th class="align-middle">Price</th>
              <th class="align-middle">Status</th>
              <th class="align-middle text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredProducts.length === 0">
              <td colspan="9" class="text-center">No product found</td>
            </tr>
            <tr v-else v-for="(product, index) in filteredProducts" :key="product.id">
              <td class="align-middle ps-0">{{ index + 1 }}</td>
              <td class="align-middle">
                <img
                  :src="product.thumbnail"
                  alt="Thumbnail"
                  class="product-thumbnail"
                  width="50"
                  height="50"
                />
              </td>
              <td class="align-middle">{{ product.name }}</td>
              <td class="align-middle">{{ product.code }}</td>
              <td class="align-middle">
                {{ getBrandName(product) }}
              </td>
              <td class="align-middle">
                {{ getCategoryName(product) }}
              </td>
              <td class="align-middle">{{ product.price }}</td>
              <td class="align-middle">
                <span
                  class="badge"
                  :class="product.status === 'published' ? 'bg-success' : 'bg-secondary'"
                >
                  {{ product.status }}
                </span>
              </td>
              <td class="align-middle text-end">
                <button
                  class="btn btn-sm btn-primary me-2"
                  @click="editProduct(product.id)"
                >
                  <span class="fas fa-edit me-1"></span>Edit
                </button>
                <button class="btn btn-sm btn-danger" @click="deleteProduct(product.id)">
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
    <div class="modal-content product-form">
      <h4>{{ isEditMode ? "Edit" : "Create" }} Product</h4>
      <div v-if="modalMessage" class="alert alert-danger">
        {{ modalMessage }}
      </div>
      <form class="row g-3 needs-validation" novalidate @submit.prevent="handleSubmit">
        <!-- Basic Information -->
        <div class="col-md-4">
          <label class="form-label" for="productName">Product Name</label>
          <input
            v-model="newProduct.name"
            class="form-control"
            id="productName"
            type="text"
            required
          />
          <div class="invalid-feedback">Product name is required</div>
        </div>
        <div class="col-md-4">
          <label class="form-label" for="productNameKm">Product Name (Khmer)</label>
          <input
            v-model="newProduct.name_km"
            class="form-control"
            id="productNameKm"
            type="text"
            required
          />
          <div class="invalid-feedback">Product name in Khmer is required</div>
        </div>
        <div class="col-md-4">
          <label class="form-label" for="productCode">Product Code</label>
          <input
            v-model="newProduct.code"
            class="form-control"
            id="productCode"
            type="text"
            required
          />
          <div class="invalid-feedback">Product code is required</div>
        </div>

        <!-- Categories and Brand -->
        <div class="col-md-4">
          <label class="form-label" for="brandId">Brand</label>
          <select v-model="newProduct.brand_id" class="form-select" id="brandId">
            <option value="" disabled>Select a brand</option>
            <option v-for="brand in brands" :key="brand.id" :value="brand.id">
              {{ brand.name }}
            </option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label" for="categoryId">Category</label>
          <select v-model="newProduct.category_id" class="form-select" id="categoryId">
            <option value="" disabled>Select a category</option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label" for="productCategoryId">Product Category</label>
          <select
            v-model="newProduct.product_category_id"
            class="form-select"
            id="productCategoryId"
          >
            <option value="" disabled>Select a product category</option>
            <option
              v-for="category in productCategories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>

        <!-- Price and Status -->
        <div class="col-md-4">
          <label class="form-label" for="price">Price</label>
          <input
            v-model="newProduct.price"
            class="form-control"
            id="price"
            type="number"
            step="0.01"
            required
          />
          <div class="invalid-feedback">Price is required</div>
        </div>
        <div class="col-md-4">
          <label class="form-label" for="status">Status</label>
          <select v-model="newProduct.status" class="form-select" id="status" required>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <div class="invalid-feedback">Status is required</div>
        </div>

        <!-- Thumbnail -->
        <div class="col-md-4">
          <label class="form-label" for="thumbnail">Thumbnail</label>
          <input
            type="file"
            class="form-control"
            id="thumbnail"
            @change="handleFileUpload"
            accept="image/*"
          />
          <div v-if="newProduct.thumbnail" class="mt-2">
            <img
              :src="getImagePreviewUrl(newProduct.thumbnail)"
              alt="Preview"
              class="thumbnail-preview"
              width="100"
            />
          </div>
        </div>

        <!-- Description -->
        <div class="col-md-12">
          <label class="form-label" for="description">Description</label>
          <textarea
            v-model="newProduct.description"
            class="form-control"
            id="description"
            rows="4"
          ></textarea>
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
import "@/assets/css/toast-styles.css";
import { useToast } from "@/composables/useToast";
import { useGlobalStore } from "@/stores/global";
import axios from "axios";
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";

// Get toast functionality from the composable
const { toasts, showNotification, removeToast } = useToast();

const state = reactive({
  products: [],
  isLoading: false,
  error: null,
});

// Data collections
const brands = ref([]);
const categories = ref([]);
const productCategories = ref([]);

// UI state
const searchQuery = ref("");
const showModal = ref(false);
const isEditMode = ref(false);
const currentProductId = ref(null);
const isSubmitting = ref(false);
const modalMessage = ref("");
const objectUrls = ref([]);

// Confirmation modal state
const confirmationModal = reactive({
  show: false,
  title: "Confirm Action",
  message: "Are you sure you want to proceed?",
  action: null,
  actionParams: null,
});

// New product form data
const newProduct = reactive({
  name: "",
  name_km: "",
  code: "",
  description: "",
  price: "",
  status: "published",
  brand_id: "",
  category_id: "",
  product_category_id: "",
  thumbnail: null,
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

// Data fetching functions
const fetchProducts = async () => {
  state.isLoading = true;
  state.error = null;
  try {
    const res = await axios.get("/api/products");
    if (res.data.result && Array.isArray(res.data.data)) {
      state.products = res.data.data;
      console.log("Fetched products:", state.products);
    } else {
      state.error = res.data.message || "Failed to fetch products";
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    state.error = "An error occurred while fetching products.";
  }
  state.isLoading = false;
};

const fetchBrands = async () => {
  try {
    const res = await axios.get("/api/brands");
    if (res.data.result && Array.isArray(res.data.data)) {
      brands.value = res.data.data;
      console.log("Fetched brands:", brands.value);
    } else {
      console.error("Failed to fetch brands:", res.data);
      showNotification("error", "Error", "Failed to fetch brands");
    }
  } catch (error) {
    console.error("Error fetching brands:", error);
    showNotification("error", "Error", "Failed to fetch brands");
  }
};

const fetchCategories = async () => {
  try {
    const res = await axios.get("/api/categories");
    if (res.data.result && Array.isArray(res.data.data)) {
      categories.value = res.data.data;
      console.log("Fetched categories:", categories.value);
    } else {
      console.error("Failed to fetch categories:", res.data);
      showNotification("error", "Error", "Failed to fetch categories");
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    showNotification("error", "Error", "Failed to fetch categories");
  }
};

const fetchProductCategories = async () => {
  try {
    const res = await axios.get("/api/product-categories");
    if (res.data.result && Array.isArray(res.data.data)) {
      productCategories.value = res.data.data;
      console.log("Fetched product categories:", productCategories.value);
    } else {
      console.error("Failed to fetch product categories:", res.data);
      showNotification("error", "Error", "Failed to fetch product categories");
    }
  } catch (error) {
    console.error("Error fetching product categories:", error);
    showNotification("error", "Error", "Failed to fetch product categories");
  }
};

// Helper function to find an item by ID with type-safe comparison
const findById = (collection, id) => {
  if (!id || !collection || !collection.length) return null;

  // Convert both to strings for comparison to handle string/number mismatches
  const stringId = String(id);
  return collection.find((item) => String(item.id) === stringId);
};

// Helper function to get brand name
const getBrandName = (product) => {
  // First check if product has nested brand object (direct API format)
  if (product.brand && product.brand.name) {
    return product.brand.name;
  }

  // Fallback to looking up by ID if we have the collection
  if (product.brand_id) {
    const brand = findById(brands.value, product.brand_id);
    if (brand) {
      return brand.name;
    }
  }

  return "Unknown";
};

// Helper function to get category name
const getCategoryName = (product) => {
  // First check for a product_category object (from detailed response)
  if (product.product_category && product.product_category.name) {
    return product.product_category.name;
  }

  // Fallback to category object (from detailed response)
  if (product.category && product.category.name) {
    return product.category.name;
  }

  // Then try to look up by ID from collections
  if (product.product_category_id) {
    const prodCategory = findById(productCategories.value, product.product_category_id);
    if (prodCategory) {
      return prodCategory.name;
    }
  }

  if (product.category_id) {
    const category = findById(categories.value, product.category_id);
    if (category) {
      return category.name;
    }
  }

  return "Unknown";
};

// File upload handling
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    newProduct.thumbnail = file;
  }
};

// CRUD operations for products
const createProduct = async () => {
  const globalStore = useGlobalStore();
  isSubmitting.value = true;
  modalMessage.value = "";

  try {
    // Create form data for submission
    const formData = new FormData();

    // Add basic product fields
    formData.append("name", newProduct.name);
    formData.append("name_km", newProduct.name_km);
    formData.append("code", newProduct.code);
    formData.append("description", newProduct.description || "");
    formData.append("price", newProduct.price);
    formData.append("status", newProduct.status);

    // Add foreign keys
    if (newProduct.brand_id) {
      formData.append("brand_id", newProduct.brand_id);
    }
    if (newProduct.category_id) {
      formData.append("category_id", newProduct.category_id);
    }
    if (newProduct.product_category_id) {
      formData.append("product_category_id", newProduct.product_category_id);
    }

    // Add thumbnail if selected
    if (newProduct.thumbnail instanceof File) {
      formData.append("thumbnail", newProduct.thumbnail);
    }

    const res = await axios.post(`/api/products`, formData, globalStore.getAxiosHeader());

    if (res.data.result) {
      await fetchProducts();
      closeModal();
      resetProductForm();
      showNotification("success", "Success", "Product created successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to create product";
    }
  } catch (error) {
    console.error("Error creating product:", error);
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        modalMessage.value = error.response.data.message;
      } else if (error.response.data.errors) {
        // Format validation errors
        const errors = Object.values(error.response.data.errors).flat();
        modalMessage.value = errors.join("\n");
      } else {
        modalMessage.value = "An error occurred while creating the product.";
      }
    } else {
      modalMessage.value = "An error occurred while creating the product.";
    }

    await globalStore.onCheckError(error);
  }

  isSubmitting.value = false;
};

const updateProduct = async () => {
  const globalStore = useGlobalStore();
  isSubmitting.value = true;
  modalMessage.value = "";

  try {
    // Create form data for submission
    const formData = new FormData();

    // Add method override for Laravel
    formData.append("_method", "PUT");

    // Add basic product fields
    formData.append("name", newProduct.name);
    formData.append("name_km", newProduct.name_km);
    formData.append("code", newProduct.code);
    formData.append("description", newProduct.description || "");
    formData.append("price", newProduct.price);
    formData.append("status", newProduct.status);

    // Add foreign keys
    if (newProduct.brand_id) {
      formData.append("brand_id", newProduct.brand_id);
    }
    if (newProduct.category_id) {
      formData.append("category_id", newProduct.category_id);
    }
    if (newProduct.product_category_id) {
      formData.append("product_category_id", newProduct.product_category_id);
    }

    // Add thumbnail if selected
    if (newProduct.thumbnail instanceof File) {
      formData.append("thumbnail", newProduct.thumbnail);
    }

    // Use POST with _method=PUT for FormData
    const res = await axios.post(
      `/api/products/${currentProductId.value}`,
      formData,
      globalStore.getAxiosHeader()
    );

    if (res.data.result) {
      await fetchProducts();
      closeModal();
      resetProductForm();
      showNotification("success", "Success", "Product updated successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to update product";
    }
  } catch (error) {
    console.error("Error updating product:", error);
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        modalMessage.value = error.response.data.message;
      } else if (error.response.data.errors) {
        // Format validation errors
        const errors = Object.values(error.response.data.errors).flat();
        modalMessage.value = errors.join("\n");
      } else {
        modalMessage.value = "An error occurred while updating the product.";
      }
    } else {
      modalMessage.value = "An error occurred while updating the product.";
    }

    await globalStore.onCheckError(error);
  }

  isSubmitting.value = false;
};

// Delete product function
const performDeleteProduct = async (productId) => {
  const globalStore = useGlobalStore();
  try {
    const res = await axios.delete(
      `/api/products/${productId}`,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      state.products = state.products.filter((p) => p.id !== productId);
      await fetchProducts();
      showNotification("success", "Success", "Product deleted successfully!");
    } else {
      showNotification("error", "Error", res.data.message || "Failed to delete product");
    }
  } catch (error) {
    showNotification("error", "Error", "An error occurred while deleting the product.");
    await globalStore.onCheckError(error);
  }
};

// Show delete confirmation
const deleteProduct = (productId) => {
  showConfirmation(
    "Delete Product",
    "Are you sure you want to delete this product?",
    performDeleteProduct,
    productId
  );
};

// Modal controls
const openModal = () => {
  resetProductForm();
  isEditMode.value = false;
  showModal.value = true;
};

const editProduct = async (productId) => {
  try {
    const globalStore = useGlobalStore();
    state.isLoading = true;

    // Fetch the full product data
    const response = await axios.get(
      `/api/products/${productId}`,
      globalStore.getAxiosHeader()
    );

    if (response.data.result && response.data.data) {
      const product = response.data.data;
      console.log("Fetched product detail:", product);

      // Set all the product fields
      newProduct.name = product.name || "";
      newProduct.name_km = product.name_km || "";
      newProduct.code = product.code || "";
      newProduct.description = product.description || "";
      newProduct.price = product.price || "";
      newProduct.status = product.status || "draft";

      // Handle relations - use direct IDs from nested objects for edit form
      // And ensure IDs are stored as the same type as in the select elements
      if (product.brand && product.brand.id) {
        newProduct.brand_id = String(product.brand.id);
      } else if (product.brand_id) {
        newProduct.brand_id = String(product.brand_id);
      } else {
        newProduct.brand_id = "";
      }

      if (product.category && product.category.id) {
        newProduct.category_id = String(product.category.id);
      } else if (product.category_id) {
        newProduct.category_id = String(product.category_id);
      } else {
        newProduct.category_id = "";
      }

      if (product.product_category && product.product_category.id) {
        newProduct.product_category_id = String(product.product_category.id);
      } else if (product.product_category_id) {
        newProduct.product_category_id = String(product.product_category_id);
      } else {
        newProduct.product_category_id = "";
      }

      // Maintain the existing thumbnail URL for display
      if (product.thumbnail && typeof product.thumbnail === "string") {
        newProduct.thumbnail = product.thumbnail;
      } else {
        newProduct.thumbnail = null;
      }

      currentProductId.value = productId;
      isEditMode.value = true;
      showModal.value = true;

      // Log the loaded IDs for debugging
      console.log("Form fields after loading:", {
        brand_id: newProduct.brand_id,
        category_id: newProduct.category_id,
        product_category_id: newProduct.product_category_id,
      });
    } else {
      showNotification("error", "Error", "Failed to fetch product details");
    }
  } catch (error) {
    console.error("Error fetching product details:", error);
    showNotification(
      "error",
      "Error",
      "An error occurred while fetching product details"
    );
  } finally {
    state.isLoading = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  resetProductForm();
  modalMessage.value = "";
  cleanupObjectURLs();
};

const resetProductForm = () => {
  newProduct.name = "";
  newProduct.name_km = "";
  newProduct.code = "";
  newProduct.description = "";
  newProduct.price = "";
  newProduct.status = "published";
  newProduct.brand_id = "";
  newProduct.category_id = "";
  newProduct.product_category_id = "";
  newProduct.thumbnail = null;
  currentProductId.value = null;
};

const handleSubmit = async (event) => {
  event.preventDefault();

  // Validate required fields
  if (!newProduct.name.trim()) {
    modalMessage.value = "Product name is required";
    return;
  }

  if (!newProduct.name_km.trim()) {
    modalMessage.value = "Product name in Khmer is required";
    return;
  }

  if (!newProduct.code.trim()) {
    modalMessage.value = "Product code is required";
    return;
  }

  if (!newProduct.price) {
    modalMessage.value = "Price is required";
    return;
  }

  if (isEditMode.value) {
    await updateProduct();
  } else {
    await createProduct();
  }
};

const filteredProducts = computed(() => {
  return state.products.filter(
    (product) =>
      product.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      product.code?.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Clean up when component unmounts
onBeforeUnmount(() => {
  cleanupObjectURLs();
});

// Initialize data on component mount
onMounted(async () => {
  try {
    console.log("Component mounted, fetching data...");

    // Fetch brands, categories, and product categories first
    await Promise.all([fetchBrands(), fetchCategories(), fetchProductCategories()]);

    // Then fetch products to ensure we have reference data first
    await fetchProducts();

    // Log the data to verify everything loaded correctly
    console.log("Data loading complete.");
    console.log("Brands count:", brands.value.length);
    console.log("Categories count:", categories.value.length);
    console.log("Product categories count:", productCategories.value.length);
    console.log("Products count:", state.products.length);

    // Check if we can match products to their related entities
    if (state.products.length > 0) {
      const firstProduct = state.products[0];
      console.log("First product:", firstProduct);
      console.log("Brand ID:", firstProduct.brand_id);
      console.log("Brand name:", getBrandName(firstProduct));
      console.log("Category name:", getCategoryName(firstProduct));
    }
  } catch (error) {
    console.error("Error during initialization:", error);
    showNotification("error", "Error", "Failed to initialize the component");
  }
});
</script>
