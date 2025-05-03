<template>
  <div class="mb-9">
    <div class="row g-2 mb-4">
      <div class="col-auto">
        <h2 class="mb-0">Product Variants</h2>
      </div>
    </div>
    <div id="product-variants">
      <div class="mb-4">
        <div class="row g-3 justify-content-between">
          <div class="col-auto justify-content-between row g-3">
            <div class="search-box">
              <input
                v-model="searchQuery"
                class="form-control search-input search"
                type="search"
                placeholder="Search variants"
                @input="handleSearchInput"
              />
            </div>
            <div class="col-auto">
              <select
                v-model="selectedProduct"
                class="form-select"
                aria-label="Filter Product"
                @change="handleSearch"
              >
                <option value="">Filter Product</option>
                <option
                  v-for="product in products"
                  :key="product.id"
                  :value="product.id"
                >
                  {{ product.name }}
                </option>
              </select>
            </div>
            <div class="col-auto">
              <select
                v-model="selectedBrand"
                class="form-select"
                aria-label="Filter Brand"
                @change="handleSearch"
              >
                <option value="">Filter Brand</option>
                <option
                  v-for="brand in brands"
                  :key="brand.id"
                  :value="brand.id"
                >
                  {{ brand.name }}
                </option>
              </select>
            </div>
            <div class="col-auto">
              <select
                v-model="selectedColor"
                class="form-select"
                aria-label="Filter Color"
                @change="handleSearch"
              >
                <option value="">Filter Color</option>
                <option
                  v-for="color in colors"
                  :key="color.id"
                  :value="color.id"
                >
                  {{ color.name }}
                </option>
              </select>
            </div>
            <div class="col-auto">
              <select
                class="form-select"
                aria-label="Items per page"
                v-model="perPage"
                @change="handleSearch"
              >
                <option :value="10">10 per page</option>
                <option :value="15">15 per page</option>
                <option :value="25">25 per page</option>
                <option :value="50">50 per page</option>
              </select>
            </div>
          </div>
          <div class="col-auto">
            <button class="btn btn-primary" @click="openCreateModal">
              <span class="fas fa-plus me-2"></span>Add Variant
            </button>
          </div>
        </div>
      </div>
      <div v-if="isLoading" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-else-if="error" class="text-center text-danger">
        {{ error }}
      </div>
      <div v-else class="table-responsive">
        <table class="table table-sm fs-9 mb-0">
          <thead>
            <tr>
              <th class="align-middle ps-0">#</th>
              <th class="align-middle">
                <a href="#" @click.prevent="toggleSort('product')">
                  Product
                  <i
                    v-if="sortCol === 'product'"
                    :class="
                      sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'
                    "
                  ></i>
                </a>
              </th>
              <th class="align-middle">
                <a href="#" @click.prevent="toggleSort('color')">
                  Color
                  <i
                    v-if="sortCol === 'color'"
                    :class="
                      sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'
                    "
                  ></i>
                </a>
              </th>
              <th class="align-middle">
                <a href="#" @click.prevent="toggleSort('size')">
                  Size
                  <i
                    v-if="sortCol === 'size'"
                    :class="
                      sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'
                    "
                  ></i>
                </a>
              </th>
              <th class="align-middle">
                <a href="#" @click.prevent="toggleSort('qty')">
                  Quantity
                  <i
                    v-if="sortCol === 'qty'"
                    :class="
                      sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'
                    "
                  ></i>
                </a>
              </th>
              <th class="align-middle">
                <a href="#" @click.prevent="toggleSort('price')">
                  Price
                  <i
                    v-if="sortCol === 'price'"
                    :class="
                      sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'
                    "
                  ></i>
                </a>
              </th>
              <th class="align-middle">
                <a href="#" @click.prevent="toggleSort('brand')">
                  Brand
                  <i
                    v-if="sortCol === 'brand'"
                    :class="
                      sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'
                    "
                  ></i>
                </a>
              </th>
              <th class="align-middle text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="variants.length === 0">
              <td colspan="8" class="text-center">No variants found</td>
            </tr>
            <tr v-else v-for="(variant, index) in variants" :key="variant.id">
              <td class="align-middle ps-0">
                {{ (paginationData.current_page - 1) * perPage + index + 1 }}
              </td>
              <td class="align-middle">
                {{ variant.product || getProductName(variant.product_id) }}
              </td>
              <td class="align-middle">
                <div class="d-flex align-items-center">
                  <div
                    v-if="
                      variant.color_code ||
                      getColorCode(variant.product_color_id)
                    "
                    class="color-swatch me-2"
                    :style="{
                      backgroundColor:
                        variant.color_code ||
                        getColorCode(variant.product_color_id),
                    }"
                    :title="
                      variant.color_name ||
                      getColorName(variant.product_color_id)
                    "
                  ></div>
                  {{
                    variant.color_name || getColorName(variant.product_color_id)
                  }}
                </div>
              </td>
              <td class="align-middle">
                <span class="size-label">{{
                  variant.size || getSizeName(variant.product_size_id)
                }}</span>
              </td>
              <td class="align-middle">{{ variant.qty }}</td>
              <td class="align-middle">{{ formatPrice(variant.price) }}</td>
              <td class="align-middle">
                {{ variant.brand || getBrandName(variant.brand_id) }}
              </td>
              <td class="align-middle text-end">
                <button
                  class="btn btn-sm btn-primary me-2"
                  @click="editVariant(variant.id)"
                >
                  <span class="fas fa-edit me-1"></span>Edit
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  @click="deleteVariant(variant.id)"
                >
                  <span class="fas fa-trash me-1"></span>Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <pagination
          v-if="!isLoading && variants.length > 0"
          :current-page="paginationData.current_page"
          :last-page="paginationData.last_page"
          :first-item="paginationData.first_item"
          :last-item="paginationData.last_item"
          :total="paginationData.total"
          @page-changed="changePage"
        />
      </div>
    </div>
  </div>

  <div v-if="showModal" class="modal-overlay">
    <div class="modal-content variant-form">
      <h4>{{ isEditMode ? "Edit" : "Create" }} Product Variant</h4>
      <div v-if="modalError" class="alert alert-danger">
        {{ modalError }}
      </div>
      <form
        class="row g-3 needs-validation"
        novalidate
        @submit.prevent="handleSubmit"
      >
        <!-- Product Selection -->
        <div class="col-md-12">
          <label class="form-label" for="productId">Product</label>
          <select
            v-model="variantForm.product_id"
            class="form-select"
            id="productId"
            required
            @change="handleProductChange"
          >
            <option value="" disabled>Select a product</option>
            <option
              v-for="product in products"
              :key="product.id"
              :value="product.id"
            >
              {{ product.name }}
            </option>
          </select>
          <div class="invalid-feedback">Product is required</div>
        </div>

        <!-- Color Selection -->
        <div class="col-md-6">
          <label class="form-label" for="colorId">Color</label>
          <select
            v-model="variantForm.product_color_id"
            class="form-select"
            id="colorId"
            required
          >
            <option value="" disabled>Select a color</option>
            <option
              v-for="color in filteredColors"
              :key="color.id"
              :value="color.id"
            >
              {{ color.name }}
            </option>
          </select>
          <div class="invalid-feedback">Color is required</div>
        </div>

        <!-- Size Selection -->
        <div class="col-md-6">
          <label class="form-label" for="sizeId">Size</label>
          <select
            v-model="variantForm.product_size_id"
            class="form-select"
            id="sizeId"
            required
          >
            <option value="" disabled>Select a size</option>
            <option
              v-for="size in filteredSizes"
              :key="size.id"
              :value="size.id"
            >
              {{ size.size }}
            </option>
          </select>
          <div class="invalid-feedback">Size is required</div>
        </div>

        <!-- Brand Selection -->
        <div class="col-md-12">
          <label class="form-label" for="brandId">Brand</label>
          <select
            v-model="variantForm.brand_id"
            class="form-select"
            id="brandId"
            required
          >
            <option value="" disabled>Select a brand</option>
            <option v-for="brand in brands" :key="brand.id" :value="brand.id">
              {{ brand.name }}
            </option>
          </select>
          <div class="invalid-feedback">Brand is required</div>
        </div>

        <!-- Quantity Input -->
        <div class="col-md-6">
          <label class="form-label" for="quantity">Quantity</label>
          <input
            v-model.number="variantForm.qty"
            class="form-control"
            id="quantity"
            type="number"
            min="0"
            step="1"
            required
          />
          <div class="invalid-feedback">Valid quantity is required</div>
        </div>

        <!-- Price Input -->
        <div class="col-md-6">
          <label class="form-label" for="price">Price</label>
          <div class="input-group">
            <span class="input-group-text">$</span>
            <input
              v-model.number="variantForm.price"
              class="form-control"
              id="price"
              type="number"
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <div class="invalid-feedback">Valid price is required</div>
        </div>

        <!-- Form Buttons -->
        <div class="col-12 d-flex justify-content-end">
          <button
            class="btn btn-secondary me-2"
            type="button"
            @click="closeModal"
          >
            Cancel
          </button>
          <button
            class="btn btn-primary"
            type="submit"
            :disabled="isSubmitting"
          >
            {{
              isSubmitting ? "Processing..." : isEditMode ? "Update" : "Save"
            }}
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
        <button class="toast-close" @click="removeToast(toast.id)">
          &times;
        </button>
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
        <button class="close-btn" @click="closeConfirmationModal">
          &times;
        </button>
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
import Pagination from "@/components/layouts/Pagination.vue";
import { useToast } from "@/composables/useToast";
import { useGlobalStore } from "@/stores/global";
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

// Get toast functionality from the composable
const { toasts, showNotification, removeToast } = useToast();

// Router and Store
const router = useRouter();
const globalStore = useGlobalStore();

// Data collections
const variants = ref([]);
const products = ref([]);
const colors = ref([]);
const sizes = ref([]);
const brands = ref([]);
const isLoading = ref(false);
const error = ref(null);

// Pagination settings
const perPage = ref(15);
const sortCol = ref("id");
const sortDir = ref("desc");
const paginationData = reactive({
  has_page: false,
  on_first_page: true,
  has_more_pages: false,
  first_item: 0,
  last_item: 0,
  total: 0,
  current_page: 1,
  last_page: 1,
});

// Search and Filter
const searchQuery = ref("");
const selectedProduct = ref("");
const selectedBrand = ref("");
const selectedColor = ref("");
let searchTimeout = null;

// UI state
const showModal = ref(false);
const isEditMode = ref(false);
const currentVariantId = ref(null);
const isSubmitting = ref(false);
const modalError = ref("");

// Variant form data
const variantForm = reactive({
  product_id: "",
  product_color_id: "",
  product_size_id: "",
  brand_id: "",
  qty: 0,
  price: 0,
});

// Filtered collections based on selected product
const filteredColors = computed(() => {
  if (!variantForm.product_id) return colors.value;
  return colors.value.filter(
    (color) => String(color.product_id) === String(variantForm.product_id)
  );
});

const filteredSizes = computed(() => {
  if (!variantForm.product_id) return sizes.value;
  return sizes.value.filter(
    (size) => String(size.product_id) === String(variantForm.product_id)
  );
});

// Confirmation modal state
const confirmationModal = reactive({
  show: false,
  title: "Confirm Action",
  message: "Are you sure you want to proceed?",
  action: null,
  actionParams: null,
});

// Format price for display
const formatPrice = (price) => {
  return `$${parseFloat(price).toFixed(2)}`;
};

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
  if (
    confirmationModal.action &&
    typeof confirmationModal.action === "function"
  ) {
    confirmationModal.action(confirmationModal.actionParams);
  }
  closeConfirmationModal();
};

// Handle search input with debounce
const handleSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    handleSearch();
  }, 500);
};

// Handle search when user submits the search
const handleSearch = async () => {
  paginationData.current_page = 1;
  await getVariants(1);
};

// Toggle sorting
const toggleSort = async (column) => {
  if (sortCol.value === column) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortCol.value = column;
    sortDir.value = "asc";
  }

  await getVariants(1);
};

// Handle pagination
const changePage = async (page) => {
  await getVariants(page);
};

// Helper function to find an item by ID with type-safe comparison
const findById = (collection, id) => {
  if (!id || !collection || !collection.length) return null;

  // Convert both to strings for comparison to handle string/number mismatches
  const stringId = String(id);
  return collection.find((item) => String(item.id) === stringId);
};

// Helper functions to get reference data
const getProductName = (productId) => {
  if (!productId) return "Unknown";
  const product = findById(products.value, productId);
  return product ? product.name : "Unknown";
};

const getColorName = (colorId) => {
  if (!colorId) return "Unknown";
  const color = findById(colors.value, colorId);
  return color ? color.name : "Unknown";
};

const getColorCode = (colorId) => {
  if (!colorId) return null;
  const color = findById(colors.value, colorId);
  return color ? color.code : null;
};

const getSizeName = (sizeId) => {
  if (!sizeId) return "Unknown";
  const size = findById(sizes.value, sizeId);
  return size ? size.size : "Unknown";
};

const getBrandName = (brandId) => {
  if (!brandId) return "Unknown";
  const brand = findById(brands.value, brandId);
  return brand ? brand.name : "Unknown";
};

// Handle product change in form
const handleProductChange = () => {
  // Reset color and size when product changes
  variantForm.product_color_id = "";
  variantForm.product_size_id = "";
};

// Fetch variants data
const getVariants = async (page = 1) => {
  isLoading.value = true;
  error.value = null;

  try {
    // Build query URL with all filter parameters
    const url = `/api/product-variants?page=${page}&per_page=${perPage.value}&sort_col=${sortCol.value}&sort_dir=${sortDir.value}&search=${searchQuery.value}&product_id=${selectedProduct.value}&brand_id=${selectedBrand.value}&color_id=${selectedColor.value}`;

    console.log("API URL:", url);

    const res = await axios.get(url, globalStore.getAxiosHeader());

    if (res.data.result) {
      variants.value = res.data.data;

      // Update pagination data
      if (res.data.paginate) {
        Object.assign(paginationData, res.data.paginate);
      }

      return true;
    } else {
      error.value = res.data.message || "Failed to fetch product variants";
      return false;
    }
  } catch (err) {
    error.value =
      err.message || "An error occurred while fetching product variants";
    await globalStore.onCheckError(err, router);
    return false;
  } finally {
    isLoading.value = false;
  }
};

// Data fetching functions
const fetchProducts = async () => {
  try {
    const res = await axios.get("/api/products", globalStore.getAxiosHeader());
    if (res.data.result) {
      products.value = res.data.data;
      return true;
    }
    return false;
  } catch (err) {
    console.error("Failed to fetch products", err);
    showNotification("error", "Error", "Failed to fetch products");
    return false;
  }
};

const fetchColors = async () => {
  try {
    const res = await axios.get(
      "/api/product-colors",
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      colors.value = res.data.data;
      return true;
    }
    return false;
  } catch (err) {
    console.error("Failed to fetch colors", err);
    showNotification("error", "Error", "Failed to fetch colors");
    return false;
  }
};

const fetchSizes = async () => {
  try {
    const res = await axios.get(
      "/api/product-sizes",
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      sizes.value = res.data.data;
      return true;
    }
    return false;
  } catch (err) {
    console.error("Failed to fetch sizes", err);
    showNotification("error", "Error", "Failed to fetch sizes");
    return false;
  }
};

const fetchBrands = async () => {
  try {
    const res = await axios.get("/api/brands", globalStore.getAxiosHeader());
    if (res.data.result) {
      brands.value = res.data.data;
      return true;
    }
    return false;
  } catch (err) {
    console.error("Failed to fetch brands", err);
    showNotification("error", "Error", "Failed to fetch brands");
    return false;
  }
};

// Modal Methods
const openCreateModal = () => {
  isEditMode.value = false;
  currentVariantId.value = null;
  resetVariantForm();
  modalError.value = "";
  showModal.value = true;
};

const editVariant = async (variantId) => {
  isLoading.value = true;
  try {
    const res = await axios.get(
      `/api/product-variants/${variantId}`,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      const variant = res.data.data;

      // Set basic info
      currentVariantId.value = variantId;

      // Handle product selection
      if (variant.product) {
        const matchingProduct = products.value.find(
          (p) => p.name === variant.product
        );
        variantForm.product_id = matchingProduct
          ? String(matchingProduct.id)
          : "";
      } else {
        variantForm.product_id = String(variant.product_id || "");
      }

      // Handle color selection
      if (variant.color_name) {
        const matchingColor = colors.value.find(
          (c) => c.name === variant.color_name
        );
        variantForm.product_color_id = matchingColor
          ? String(matchingColor.id)
          : "";
      } else {
        variantForm.product_color_id = String(variant.product_color_id || "");
      }

      // Handle size selection
      if (variant.size) {
        const matchingSize = sizes.value.find((s) => s.size === variant.size);
        variantForm.product_size_id = matchingSize
          ? String(matchingSize.id)
          : "";
      } else {
        variantForm.product_size_id = String(variant.product_size_id || "");
      }

      // Handle brand selection
      if (variant.brand) {
        const matchingBrand = brands.value.find(
          (b) => b.name === variant.brand
        );
        variantForm.brand_id = matchingBrand ? String(matchingBrand.id) : "";
      } else {
        variantForm.brand_id = String(variant.brand_id || "");
      }

      // Set numeric values
      variantForm.qty = variant.qty || 0;
      variantForm.price = parseFloat(variant.price) || 0;

      isEditMode.value = true;
      showModal.value = true;
    } else {
      showNotification("error", "Error", "Failed to fetch variant details");
    }
  } catch (err) {
    console.error("Error fetching variant:", err);
    showNotification("error", "Error", "Failed to fetch variant details");
  } finally {
    isLoading.value = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  modalError.value = "";
};

const resetVariantForm = () => {
  variantForm.product_id = "";
  variantForm.product_color_id = "";
  variantForm.product_size_id = "";
  variantForm.brand_id = "";
  variantForm.qty = 0;
  variantForm.price = 0;
};

// Form submission
const handleSubmit = async (event) => {
  event.preventDefault();

  // Check form validity
  if (!event.target.checkValidity()) {
    event.stopPropagation();
    event.target.classList.add("was-validated");
    return;
  }

  // Validate required fields
  if (!variantForm.product_id) {
    modalError.value = "Product is required";
    return;
  }

  if (!variantForm.product_color_id) {
    modalError.value = "Color is required";
    return;
  }

  if (!variantForm.product_size_id) {
    modalError.value = "Size is required";
    return;
  }

  if (!variantForm.brand_id) {
    modalError.value = "Brand is required";
    return;
  }

  if (variantForm.qty < 0 || isNaN(variantForm.qty)) {
    modalError.value = "Quantity must be a valid number";
    return;
  }

  if (variantForm.price <= 0 || isNaN(variantForm.price)) {
    modalError.value = "Price must be greater than zero";
    return;
  }

  if (isEditMode.value) {
    await updateVariant();
  } else {
    await createVariant();
  }
};

// Create variant
const createVariant = async () => {
  isSubmitting.value = true;
  modalError.value = "";

  try {
    const variantData = {
      product_id: variantForm.product_id,
      product_color_id: variantForm.product_color_id,
      product_size_id: variantForm.product_size_id,
      brand_id: variantForm.brand_id,
      qty: variantForm.qty,
      price: variantForm.price,
    };

    const res = await axios.post(
      "/api/product-variants",
      variantData,
      globalStore.getAxiosHeader()
    );

    if (res.data.result) {
      await getVariants(paginationData.current_page);
      closeModal();
      showNotification("success", "Success", "Variant created successfully!");
    } else {
      modalError.value = res.data.message || "Failed to create variant";
    }
  } catch (error) {
    console.error("Error creating variant:", error);
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        modalError.value = error.response.data.message;
      } else if (error.response.data.errors) {
        // Format validation errors
        const errors = Object.values(error.response.data.errors).flat();
        modalError.value = errors.join("\n");
      } else {
        modalError.value = "An error occurred while creating the variant.";
      }
    } else {
      modalError.value = "An error occurred while creating the variant.";
    }

    await globalStore.onCheckError(error, router);
  } finally {
    isSubmitting.value = false;
  }
};

// Update variant
const updateVariant = async () => {
  isSubmitting.value = true;
  modalError.value = "";

  try {
    const variantData = {
      product_id: variantForm.product_id,
      product_color_id: variantForm.product_color_id,
      product_size_id: variantForm.product_size_id,
      brand_id: variantForm.brand_id,
      qty: variantForm.qty,
      price: variantForm.price,
    };

    const res = await axios.put(
      `/api/product-variants/${currentVariantId.value}`,
      variantData,
      globalStore.getAxiosHeader()
    );

    if (res.data.result) {
      await getVariants(paginationData.current_page);
      closeModal();
      showNotification("success", "Success", "Variant updated successfully!");
    } else {
      modalError.value = res.data.message || "Failed to update variant";
    }
  } catch (error) {
    console.error("Error updating variant:", error);
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        modalError.value = error.response.data.message;
      } else if (error.response.data.errors) {
        // Format validation errors
        const errors = Object.values(error.response.data.errors).flat();
        modalError.value = errors.join("\n");
      }
      elsemodalError.value = "An error occurred while updating the variant.";
    } else {
      modalError.value = "An error occurred while updating the variant.";
    }

    await globalStore.onCheckError(error, router);
  } finally {
    isSubmitting.value = false;
  }
};

// Delete product
const performDeleteVariant = async (id) => {
  try {
    const res = await axios.delete(
      `/api/product-variants/${id}`,
      globalStore.getAxiosHeader()
    );

    if (res.data.result) {
      // If there was only one item on the current page and it's not the first page
      if (variants.value.length === 1 && paginationData.current_page > 1) {
        await getVariants(paginationData.current_page - 1);
      } else {
        await getVariants(paginationData.current_page);
      }

      showNotification("success", "Success", "Variant deleted successfully!");
    } else {
      showNotification(
        "error",
        "Error",
        res.data.message || "Failed to delete variant"
      );
    }
  } catch (err) {
    showNotification(
      "error",
      "Error",
      "An error occurred while deleting the variant"
    );
    console.error("Error deleting variant:", err);
    await globalStore.onCheckError(err, router);
  }
};

// Show delete confirmation
const deleteVariant = (id) => {
  showConfirmation(
    "Delete Variant",
    "Are you sure you want to delete this variant?",
    performDeleteVariant,
    id
  );
};

// Lifecycle Hook
onMounted(async () => {
  isLoading.value = true;
  error.value = null;

  try {
    // Load reference data in parallel
    await Promise.all([
      fetchProducts(),
      fetchColors(),
      fetchSizes(),
      fetchBrands(),
    ]);

    // Then load variants
    await getVariants(1);
  } catch (err) {
    error.value = "Failed to load initial data";
    showNotification("error", "Error", "Failed to load initial data");
    console.error("Failed to load initial data", err);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.color-swatch {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #ccc;
}

.size-label {
  display: inline-block;
  min-width: 30px;
  padding: 0.25rem 0.5rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
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
  width: 90%;
  max-width: 800px;
  max-height: unset;
  overflow-y: auto;
  padding: 2rem;
  border-radius: 0.5rem;
  margin: auto;
}

.variant-form .form-label {
  font-weight: 500;
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

/* Confirmation modal styling */
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
</style>
