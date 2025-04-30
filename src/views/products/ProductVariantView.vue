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
          <div class="col-auto">
            <div class="search-box">
              <input
                v-model="searchQuery"
                class="form-control search-input search"
                type="search"
                placeholder="Search variants"
              />
            </div>
          </div>
          <div class="col-auto">
            <button class="btn btn-primary" @click="openModal">
              <span class="fas fa-plus me-2"></span>Add Variant
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
              <th class="align-middle">Product</th>
              <th class="align-middle">Color</th>
              <th class="align-middle">Size</th>
              <th class="align-middle">Quantity</th>
              <th class="align-middle">Price</th>
              <th class="align-middle">Brand</th>
              <th class="align-middle text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredVariants.length === 0">
              <td colspan="8" class="text-center">No variants found</td>
            </tr>
            <tr v-else v-for="(variant, index) in filteredVariants" :key="variant.id">
              <td class="align-middle ps-0">{{ index + 1 }}</td>
              <td class="align-middle">
                {{ variant.product || getProductName(variant.product_id) }}
              </td>
              <td class="align-middle">
                <div class="d-flex align-items-center">
                  <div
                    v-if="variant.color_code || getColorCode(variant.product_color_id)"
                    class="color-swatch me-2"
                    :style="{
                      backgroundColor:
                        variant.color_code || getColorCode(variant.product_color_id),
                    }"
                    :title="variant.color_name || getColorName(variant.product_color_id)"
                  ></div>
                  {{ variant.color_name || getColorName(variant.product_color_id) }}
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
                <button class="btn btn-sm btn-danger" @click="deleteVariant(variant.id)">
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
    <div class="modal-content variant-form">
      <h4>{{ isEditMode ? "Edit" : "Create" }} Product Variant</h4>
      <div v-if="modalMessage" class="alert alert-danger">
        {{ modalMessage }}
      </div>
      <form class="row g-3 needs-validation" novalidate @submit.prevent="handleSubmit">
        <!-- Product Selection -->
        <div class="col-md-12">
          <label class="form-label" for="productId">Product</label>
          <select
            v-model="newVariant.product_id"
            class="form-select"
            id="productId"
            required
            @change="handleProductChange"
          >
            <option value="" disabled>Select a product</option>
            <option v-for="product in products" :key="product.id" :value="product.id">
              {{ product.name }}
            </option>
          </select>
          <div class="invalid-feedback">Product is required</div>
        </div>

        <!-- Color Selection -->
        <div class="col-md-6">
          <label class="form-label" for="colorId">Color</label>
          <select
            v-model="newVariant.product_color_id"
            class="form-select"
            id="colorId"
            required
          >
            <option value="" disabled>Select a color</option>
            <option v-for="color in filteredColors" :key="color.id" :value="color.id">
              {{ color.name }}
            </option>
          </select>
          <div class="invalid-feedback">Color is required</div>
        </div>

        <!-- Size Selection -->
        <div class="col-md-6">
          <label class="form-label" for="sizeId">Size</label>
          <select
            v-model="newVariant.product_size_id"
            class="form-select"
            id="sizeId"
            required
          >
            <option value="" disabled>Select a size</option>
            <option v-for="size in filteredSizes" :key="size.id" :value="size.id">
              {{ size.size }}
            </option>
          </select>
          <div class="invalid-feedback">Size is required</div>
        </div>

        <!-- Brand Selection -->
        <div class="col-md-12">
          <label class="form-label" for="brandId">Brand</label>
          <select v-model="newVariant.brand_id" class="form-select" id="brandId" required>
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
            v-model.number="newVariant.qty"
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
              v-model.number="newVariant.price"
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
import { computed, onMounted, reactive, ref } from "vue";

// Get toast functionality from the composable
const { toasts, showNotification, removeToast } = useToast();
// Initialize the global store immediately
const globalStore = useGlobalStore();

const state = reactive({
  variants: [],
  isLoading: false,
  error: null,
  pagination: null,
});

// Data collections
const products = ref([]);
const colors = ref([]);
const sizes = ref([]);
const brands = ref([]);

// UI state
const searchQuery = ref("");
const showModal = ref(false);
const isEditMode = ref(false);
const currentVariantId = ref(null);
const isSubmitting = ref(false);
const modalMessage = ref("");

// Filtered collections based on selected product
const filteredColors = computed(() => {
  if (!newVariant.product_id) return colors.value;
  return colors.value.filter(
    (color) => String(color.product_id) === String(newVariant.product_id)
  );
});

const filteredSizes = computed(() => {
  if (!newVariant.product_id) return sizes.value;
  return sizes.value.filter(
    (size) => String(size.product_id) === String(newVariant.product_id)
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

// New variant form data
const newVariant = reactive({
  product_id: "",
  product_color_id: "",
  product_size_id: "",
  brand_id: "",
  qty: 0,
  price: 0,
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
  if (confirmationModal.action && typeof confirmationModal.action === "function") {
    confirmationModal.action(confirmationModal.actionParams);
  }
  closeConfirmationModal();
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
  newVariant.product_color_id = "";
  newVariant.product_size_id = "";
};

// Data fetching functions
const fetchVariants = async () => {
  state.isLoading = true;
  state.error = null;
  try {
    const res = await axios.get("/api/product-variants", globalStore.getAxiosHeader());

    if (res.data.result && Array.isArray(res.data.data)) {
      state.variants = res.data.data;
      state.pagination = res.data.paginate || null;
      console.log("Fetched variants:", state.variants);
    } else {
      state.error = res.data.message || "Failed to fetch product variants";
      console.error("API error when fetching variants:", res.data);
    }
  } catch (error) {
    console.error("Error fetching product variants:", error);
    state.error = "An error occurred while fetching product variants.";
    await globalStore.onCheckError(error);
  }
  state.isLoading = false;
};

const fetchProducts = async () => {
  try {
    const res = await axios.get("/api/products", globalStore.getAxiosHeader());
    if (res.data.result && Array.isArray(res.data.data)) {
      products.value = res.data.data;
      console.log("Fetched products:", products.value);
    } else {
      console.error("Failed to fetch products:", res.data);
      showNotification("error", "Error", "Failed to fetch products");
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    showNotification("error", "Error", "Failed to fetch products");
    await globalStore.onCheckError(error);
  }
};

const fetchColors = async () => {
  try {
    const res = await axios.get("/api/product-colors", globalStore.getAxiosHeader());
    if (res.data.result && Array.isArray(res.data.data)) {
      colors.value = res.data.data;
      console.log("Fetched colors:", colors.value);
    } else {
      console.error("Failed to fetch colors:", res.data);
      showNotification("error", "Error", "Failed to fetch colors");
    }
  } catch (error) {
    console.error("Error fetching colors:", error);
    showNotification("error", "Error", "Failed to fetch colors");
    await globalStore.onCheckError(error);
  }
};

const fetchSizes = async () => {
  try {
    const res = await axios.get("/api/product-sizes", globalStore.getAxiosHeader());
    if (res.data.result && Array.isArray(res.data.data)) {
      sizes.value = res.data.data;
      console.log("Fetched sizes:", sizes.value);
    } else {
      console.error("Failed to fetch sizes:", res.data);
      showNotification("error", "Error", "Failed to fetch sizes");
    }
  } catch (error) {
    console.error("Error fetching sizes:", error);
    showNotification("error", "Error", "Failed to fetch sizes");
    await globalStore.onCheckError(error);
  }
};

const fetchBrands = async () => {
  try {
    const res = await axios.get("/api/brands", globalStore.getAxiosHeader());
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
    await globalStore.onCheckError(error);
  }
};

// CRUD operations for variants
const createVariant = async () => {
  isSubmitting.value = true;
  modalMessage.value = "";

  try {
    const variantData = {
      product_id: newVariant.product_id,
      product_color_id: newVariant.product_color_id,
      product_size_id: newVariant.product_size_id,
      brand_id: newVariant.brand_id,
      qty: newVariant.qty,
      price: newVariant.price,
    };

    const res = await axios.post(
      "/api/product-variants",
      variantData,
      globalStore.getAxiosHeader()
    );

    if (res.data.result) {
      await fetchVariants();
      closeModal();
      resetVariantForm();
      showNotification("success", "Success", "Variant created successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to create variant";
    }
  } catch (error) {
    console.error("Error creating variant:", error);
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        modalMessage.value = error.response.data.message;
      } else if (error.response.data.errors) {
        // Format validation errors
        const errors = Object.values(error.response.data.errors).flat();
        modalMessage.value = errors.join("\n");
      } else {
        modalMessage.value = "An error occurred while creating the variant.";
      }
    } else {
      modalMessage.value = "An error occurred while creating the variant.";
    }

    await globalStore.onCheckError(error);
  }

  isSubmitting.value = false;
};

const updateVariant = async () => {
  isSubmitting.value = true;
  modalMessage.value = "";

  try {
    const variantData = {
      product_id: newVariant.product_id,
      product_color_id: newVariant.product_color_id,
      product_size_id: newVariant.product_size_id,
      brand_id: newVariant.brand_id,
      qty: newVariant.qty,
      price: newVariant.price,
    };

    const res = await axios.put(
      `/api/product-variants/${currentVariantId.value}`,
      variantData,
      globalStore.getAxiosHeader()
    );

    if (res.data.result) {
      await fetchVariants();
      closeModal();
      resetVariantForm();
      showNotification("success", "Success", "Variant updated successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to update variant";
    }
  } catch (error) {
    console.error("Error updating variant:", error);
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        modalMessage.value = error.response.data.message;
      } else if (error.response.data.errors) {
        // Format validation errors
        const errors = Object.values(error.response.data.errors).flat();
        modalMessage.value = errors.join("\n");
      } else {
        modalMessage.value = "An error occurred while updating the variant.";
      }
    } else {
      modalMessage.value = "An error occurred while updating the variant.";
    }

    await globalStore.onCheckError(error);
  }

  isSubmitting.value = false;
};

// Delete variant function
const performDeleteVariant = async (variantId) => {
  try {
    const res = await axios.delete(
      `/api/product-variants/${variantId}`,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      state.variants = state.variants.filter((v) => v.id !== variantId);
      await fetchVariants();
      showNotification("success", "Success", "Variant deleted successfully!");
    } else {
      showNotification("error", "Error", res.data.message || "Failed to delete variant");
    }
  } catch (error) {
    showNotification("error", "Error", "An error occurred while deleting the variant.");
    await globalStore.onCheckError(error);
  }
};

// Show delete confirmation
const deleteVariant = (variantId) => {
  showConfirmation(
    "Delete Variant",
    "Are you sure you want to delete this variant?",
    performDeleteVariant,
    variantId
  );
};

// Modal controls
const openModal = () => {
  resetVariantForm();
  isEditMode.value = false;
  showModal.value = true;
};

const editVariant = async (variantId) => {
  try {
    state.isLoading = true;

    // Fetch the variant data directly from the API
    const response = await axios.get(
      `/api/product-variants/${variantId}`,
      globalStore.getAxiosHeader()
    );

    if (response.data.result && response.data.data) {
      const variant = response.data.data;
      console.log("Editing variant:", variant);

      // Handle product field from the API response
      if (variant.product) {
        // Find the corresponding product ID based on product name
        const matchingProduct = products.value.find((p) => p.name === variant.product);
        newVariant.product_id = matchingProduct ? String(matchingProduct.id) : "";
        console.log("Matched product:", matchingProduct);
      } else {
        newVariant.product_id = String(variant.product_id || "");
      }

      // Handle direct properties from the API response
      if (variant.size) {
        // Find the corresponding size ID
        const matchingSize = sizes.value.find((s) => s.size === variant.size);
        newVariant.product_size_id = matchingSize ? String(matchingSize.id) : "";
      } else {
        newVariant.product_size_id = String(variant.product_size_id || "");
      }

      if (variant.color_name && variant.color_code) {
        // Find the corresponding color ID
        const matchingColor = colors.value.find(
          (c) => c.name === variant.color_name && c.code === variant.color_code
        );
        newVariant.product_color_id = matchingColor ? String(matchingColor.id) : "";
      } else {
        newVariant.product_color_id = String(variant.product_color_id || "");
      }

      if (variant.brand) {
        // Find the corresponding brand ID
        const matchingBrand = brands.value.find((b) => b.name === variant.brand);
        newVariant.brand_id = matchingBrand ? String(matchingBrand.id) : "";
      } else {
        newVariant.brand_id = String(variant.brand_id || "");
      }

      newVariant.qty = variant.qty || 0;
      newVariant.price = parseFloat(variant.price) || 0;

      // If any fields are still empty, look for matching resource in their respective collections
      if (!newVariant.product_id && (variant.color_name || variant.size)) {
        // Try to find product through color or size
        let colorMatch, sizeMatch;

        if (variant.color_name) {
          colorMatch = colors.value.find((c) => c.name === variant.color_name);
        }

        if (variant.size) {
          sizeMatch = sizes.value.find((s) => s.size === variant.size);
        }

        if (colorMatch && colorMatch.product_id) {
          newVariant.product_id = String(colorMatch.product_id);
        } else if (sizeMatch && sizeMatch.product_id) {
          newVariant.product_id = String(sizeMatch.product_id);
        }

        console.log("Found product through association:", newVariant.product_id);
      }

      // Additional debug logs
      console.log("Setting form values:", {
        product_id: newVariant.product_id,
        product_color_id: newVariant.product_color_id,
        product_size_id: newVariant.product_size_id,
        brand_id: newVariant.brand_id,
        qty: newVariant.qty,
        price: newVariant.price,
      });

      currentVariantId.value = variantId;
      isEditMode.value = true;
      showModal.value = true;
    } else {
      showNotification("error", "Error", "Failed to fetch variant details");
    }
  } catch (error) {
    console.error("Error fetching variant details:", error);
    showNotification(
      "error",
      "Error",
      "An error occurred while fetching variant details"
    );
    await globalStore.onCheckError(error);
  } finally {
    state.isLoading = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  resetVariantForm();
  modalMessage.value = "";
};

const resetVariantForm = () => {
  newVariant.product_id = "";
  newVariant.product_color_id = "";
  newVariant.product_size_id = "";
  newVariant.brand_id = "";
  newVariant.qty = 0;
  newVariant.price = 0;
  currentVariantId.value = null;
};

const handleSubmit = async (event) => {
  event.preventDefault();

  // Check form validity
  if (!event.target.checkValidity()) {
    event.stopPropagation();
    event.target.classList.add("was-validated");
    return;
  }

  // Validate required fields
  if (!newVariant.product_id) {
    modalMessage.value = "Product is required";
    return;
  }

  if (!newVariant.product_color_id) {
    modalMessage.value = "Color is required";
    return;
  }

  if (!newVariant.product_size_id) {
    modalMessage.value = "Size is required";
    return;
  }

  if (!newVariant.brand_id) {
    modalMessage.value = "Brand is required";
    return;
  }

  if (newVariant.qty < 0 || isNaN(newVariant.qty)) {
    modalMessage.value = "Quantity must be a valid number";
    return;
  }

  if (newVariant.price <= 0 || isNaN(newVariant.price)) {
    modalMessage.value = "Price must be greater than zero";
    return;
  }

  if (isEditMode.value) {
    await updateVariant();
  } else {
    await createVariant();
  }
};

const filteredVariants = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return state.variants.filter((variant) => {
    const productName = variant.product || getProductName(variant.product_id) || "";
    const colorName = variant.color_name || getColorName(variant.product_color_id) || "";
    const sizeName = variant.size || getSizeName(variant.product_size_id) || "";
    const brandName = variant.brand || getBrandName(variant.brand_id) || "";

    return (
      productName.toLowerCase().includes(query) ||
      colorName.toLowerCase().includes(query) ||
      sizeName.toLowerCase().includes(query) ||
      brandName.toLowerCase().includes(query) ||
      String(variant.qty).includes(query) ||
      String(variant.price).includes(query)
    );
  });
});

// Initialize data on component mount
onMounted(async () => {
  try {
    console.log("Component mounted, fetching data...");

    // Fetch all reference data first
    await Promise.all([fetchProducts(), fetchColors(), fetchSizes(), fetchBrands()]);

    // Then fetch variants
    await fetchVariants();

    console.log("Data loading complete.");
  } catch (error) {
    console.error("Error during initialization:", error);
    showNotification("error", "Error", "Failed to initialize the component");
    await globalStore.onCheckError(error);
  }
});
</script>
