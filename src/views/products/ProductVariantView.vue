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
                <option v-for="product in products" :key="product.id" :value="product.id">
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
                <option v-for="brand in brands" :key="brand.id" :value="brand.id">
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
                <option v-for="color in colors" :key="color.id" :value="color.id">
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
                    :class="sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
                  ></i>
                </a>
              </th>
              <th class="align-middle">
                <a href="#" @click.prevent="toggleSort('color')">
                  Color
                  <i
                    v-if="sortCol === 'color'"
                    :class="sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
                  ></i>
                </a>
              </th>
              <th class="align-middle">
                <a href="#" @click.prevent="toggleSort('size')">
                  Size
                  <i
                    v-if="sortCol === 'size'"
                    :class="sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
                  ></i>
                </a>
              </th>
              <th class="align-middle">
                <a href="#" @click.prevent="toggleSort('qty')">
                  Quantity
                  <i
                    v-if="sortCol === 'qty'"
                    :class="sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
                  ></i>
                </a>
              </th>
              <th class="align-middle">
                <a href="#" @click.prevent="toggleSort('price')">
                  Price
                  <i
                    v-if="sortCol === 'price'"
                    :class="sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
                  ></i>
                </a>
              </th>
              <th class="align-middle">
                <a href="#" @click.prevent="toggleSort('brand')">
                  Brand
                  <i
                    v-if="sortCol === 'brand'"
                    :class="sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
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

  <!-- Main Variant Modal -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal-content variant-form">
      <h4>{{ isEditMode ? "Edit" : "Create" }} Product Variant</h4>
      <div v-if="modalError" class="alert alert-danger">
        {{ modalError }}
      </div>
      <form class="row g-3 needs-validation" novalidate @submit.prevent="handleSubmit">
        <!-- Product Selection -->
        <div class="col-md-12">
          <label class="form-label" for="productId">Product</label>
          <div class="input-group">
            <select
              v-model="variantForm.product_id"
              class="form-select"
              id="productId"
              required
              @change="handleProductChange"
            >
              <option value="" disabled>
                {{
                  products.length === 0
                    ? "No products available - Create one first"
                    : "Select a product"
                }}
              </option>
              <option v-for="product in products" :key="product.id" :value="product.id">
                {{ product.name }}
              </option>
            </select>
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="openQuickCreateModal('product')"
              title="Create new product"
            >
              <i class="fas fa-plus"></i>
            </button>
          </div>
          <div class="invalid-feedback">Product is required</div>
          <div v-if="products.length === 0" class="form-text text-warning">
            <i class="fas fa-exclamation-triangle me-1"></i>
            No products available. Click + to create one.
          </div>
        </div>

        <!-- Color Selection -->
        <div class="col-md-6">
          <label class="form-label" for="colorId">Color</label>
          <div class="input-group">
            <select
              v-model="variantForm.product_color_id"
              class="form-select"
              id="colorId"
              required
              :disabled="!variantForm.product_id"
            >
              <option value="" disabled>
                {{ !variantForm.product_id ? "Select product first" : "Select a color" }}
              </option>
              <option v-for="color in filteredColors" :key="color.id" :value="color.id">
                {{ color.name }}
              </option>
            </select>
            <span
              v-if="variantForm.product_color_id"
              class="input-group-text color-preview-addon"
              :title="getSelectedColorName()"
            >
              <div
                class="color-preview-swatch"
                :style="{ backgroundColor: getSelectedColorCode() }"
              ></div>
            </span>
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="openQuickCreateModal('color')"
              :disabled="!variantForm.product_id"
              title="Create new color"
            >
              <i class="fas fa-plus"></i>
            </button>
          </div>
          <div class="invalid-feedback">Color is required</div>
          <div
            v-if="filteredColors.length === 0 && variantForm.product_id"
            class="form-text text-warning"
          >
            <i class="fas fa-exclamation-triangle me-1"></i>
            No colors available for this product. Click + to create one.
          </div>
        </div>

        <!-- Size Selection -->
        <div class="col-md-6">
          <label class="form-label" for="sizeId">Size</label>
          <div class="input-group">
            <select
              v-model="variantForm.product_size_id"
              class="form-select"
              id="sizeId"
              required
              :disabled="!variantForm.product_id"
            >
              <option value="" disabled>
                {{ !variantForm.product_id ? "Select product first" : "Select a size" }}
              </option>
              <option v-for="size in filteredSizes" :key="size.id" :value="size.id">
                {{ size.size }}
              </option>
            </select>
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="openQuickCreateModal('size')"
              :disabled="!variantForm.product_id"
              title="Create new size"
            >
              <i class="fas fa-plus"></i>
            </button>
          </div>
          <div class="invalid-feedback">Size is required</div>
          <div
            v-if="filteredSizes.length === 0 && variantForm.product_id"
            class="form-text text-warning"
          >
            <i class="fas fa-exclamation-triangle me-1"></i>
            No sizes available for this product. Click + to create one.
          </div>
        </div>

        <!-- Brand Selection -->
        <div class="col-md-12">
          <label class="form-label" for="brandId">Brand</label>
          <div class="input-group">
            <select
              v-model="variantForm.brand_id"
              class="form-select"
              id="brandId"
              required
            >
              <option value="" disabled>
                {{
                  brands.length === 0
                    ? "No brands available - Create one first"
                    : "Select a brand"
                }}
              </option>
              <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                {{ brand.name }}
              </option>
            </select>
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="openQuickCreateModal('brand')"
              title="Create new brand"
            >
              <i class="fas fa-plus"></i>
            </button>
          </div>
          <div class="invalid-feedback">Brand is required</div>
          <div v-if="brands.length === 0" class="form-text text-warning">
            <i class="fas fa-exclamation-triangle me-1"></i>
            No brands available. Click + to create one.
          </div>
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

  <!-- Quick Create Modal -->
  <div v-if="showQuickCreateModal" class="modal-overlay">
    <div class="modal-content quick-create-form">
      <h5>
        Create New
        {{ quickCreateType.charAt(0).toUpperCase() + quickCreateType.slice(1) }}
      </h5>
      <div v-if="quickCreateError" class="alert alert-danger">
        {{ quickCreateError }}
      </div>

      <!-- Product Form -->
      <form
        v-if="quickCreateType === 'product'"
        @submit.prevent="handleQuickCreate"
        class="row g-3"
      >
        <div class="col-12">
          <label class="form-label">Product Name</label>
          <input
            v-model="quickCreateForm.name"
            type="text"
            class="form-control"
            required
            placeholder="Enter product name"
          />
        </div>
        <div class="col-12">
          <label class="form-label">Description</label>
          <textarea
            v-model="quickCreateForm.description"
            class="form-control"
            rows="3"
            placeholder="Enter product description"
          ></textarea>
        </div>
        <div class="col-12 d-flex justify-content-end">
          <button
            type="button"
            class="btn btn-secondary me-2"
            @click="closeQuickCreateModal"
          >
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="isQuickCreating">
            {{ isQuickCreating ? "Creating..." : "Create Product" }}
          </button>
        </div>
      </form>

      <!-- Color Form -->
      <form
        v-if="quickCreateType === 'color'"
        @submit.prevent="handleQuickCreate"
        class="row g-3"
      >
        <div class="col-6">
          <label class="form-label">Color Name</label>
          <input
            v-model="quickCreateForm.name"
            type="text"
            class="form-control"
            required
            placeholder="Enter color name"
          />
        </div>
        <div class="col-6">
          <label class="form-label">Color Code</label>
          <div class="input-group">
            <input
              v-model="quickCreateForm.code"
              type="color"
              class="form-control form-control-color"
              required
              title="Choose color"
            />
            <input
              v-model="quickCreateForm.code"
              type="text"
              class="form-control"
              placeholder="#000000"
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
        </div>
        <div class="col-12 d-flex justify-content-end">
          <button
            type="button"
            class="btn btn-secondary me-2"
            @click="closeQuickCreateModal"
          >
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="isQuickCreating">
            {{ isQuickCreating ? "Creating..." : "Create Color" }}
          </button>
        </div>
      </form>

      <!-- Size Form -->
      <form
        v-if="quickCreateType === 'size'"
        @submit.prevent="handleQuickCreate"
        class="row g-3"
      >
        <div class="col-12">
          <label class="form-label">Size</label>
          <input
            v-model="quickCreateForm.size"
            type="text"
            class="form-control"
            required
            placeholder="Enter size (e.g., S, M, L, XL, 32, 34)"
          />
        </div>
        <div class="col-12">
          <label class="form-label">Sort Order</label>
          <input
            v-model.number="quickCreateForm.sort_order"
            type="number"
            class="form-control"
            min="1"
            placeholder="Enter sort order"
          />
        </div>
        <div class="col-12 d-flex justify-content-end">
          <button
            type="button"
            class="btn btn-secondary me-2"
            @click="closeQuickCreateModal"
          >
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="isQuickCreating">
            {{ isQuickCreating ? "Creating..." : "Create Size" }}
          </button>
        </div>
      </form>

      <!-- Brand Form -->
      <form
        v-if="quickCreateType === 'brand'"
        @submit.prevent="handleQuickCreate"
        class="row g-3"
      >
        <div class="col-md-6">
          <label class="form-label">Brand Name (English)</label>
          <input
            v-model="quickCreateForm.name"
            type="text"
            class="form-control"
            required
            placeholder="Enter brand name in English"
          />
        </div>
        <div class="col-md-6">
          <label class="form-label">Brand Name (Khmer)</label>
          <input
            v-model="quickCreateForm.name_km"
            type="text"
            class="form-control"
            placeholder="Enter brand name in Khmer"
          />
        </div>
        <div class="col-12">
          <label class="form-label">Description</label>
          <textarea
            v-model="quickCreateForm.description"
            class="form-control"
            rows="3"
            placeholder="Enter brand description"
          ></textarea>
        </div>
        <div class="col-12 d-flex justify-content-end">
          <button
            type="button"
            class="btn btn-secondary me-2"
            @click="closeQuickCreateModal"
          >
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="isQuickCreating">
            {{ isQuickCreating ? "Creating..." : "Create Brand" }}
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
import Pagination from "@/components/layouts/Pagination.vue";
import { useToast } from "@/composables/useToast";
import { useGlobalStore } from "@/stores/global";
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

const { toasts, showNotification, removeToast } = useToast();
const router = useRouter();
const globalStore = useGlobalStore();
const variants = ref([]);
const products = ref([]);
const colors = ref([]);
const sizes = ref([]);
const brands = ref([]);
const isLoading = ref(false);
const error = ref(null);
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

const searchQuery = ref("");
const selectedProduct = ref("");
const selectedBrand = ref("");
const selectedColor = ref("");
let searchTimeout = null;
const showModal = ref(false);
const isEditMode = ref(false);
const currentVariantId = ref(null);
const isSubmitting = ref(false);
const modalError = ref("");

// Quick Create Modal States
const showQuickCreateModal = ref(false);
const quickCreateType = ref("");
const isQuickCreating = ref(false);
const quickCreateError = ref("");
const quickCreateForm = reactive({
  name: "",
  description: "",
  code: "#000000",
  size: "",
  sort_order: 1,
  name_km: "",
});

const variantForm = reactive({
  product_id: "",
  product_color_id: "",
  product_size_id: "",
  brand_id: "",
  qty: 0,
  price: 0,
});

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

const confirmationModal = reactive({
  show: false,
  title: "Confirm Action",
  message: "Are you sure you want to proceed?",
  action: null,
  actionParams: null,
});

const formatPrice = (price) => {
  return `$${parseFloat(price).toFixed(2)}`;
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

// Quick Create Modal Methods
const openQuickCreateModal = (type) => {
  quickCreateType.value = type;
  quickCreateError.value = "";
  resetQuickCreateForm();
  showQuickCreateModal.value = true;
};

const closeQuickCreateModal = () => {
  showQuickCreateModal.value = false;
  quickCreateType.value = "";
  quickCreateError.value = "";
  resetQuickCreateForm();
};

const resetQuickCreateForm = () => {
  quickCreateForm.name = "";
  quickCreateForm.description = "";
  quickCreateForm.code = "#000000";
  quickCreateForm.size = "";
  quickCreateForm.sort_order = 1;
  quickCreateForm.name_km = "";
};

const handleQuickCreate = async () => {
  isQuickCreating.value = true;
  quickCreateError.value = "";

  try {
    let endpoint = "";
    let data = {};

    switch (quickCreateType.value) {
      case "product":
        endpoint = "/api/products";
        data = {
          name: quickCreateForm.name,
          description: quickCreateForm.description,
        };
        break;
      case "color":
        if (!variantForm.product_id) {
          quickCreateError.value =
            "Please select a product first, or create a new product";
          return;
        }
        endpoint = "/api/product-colors";
        data = {
          name: quickCreateForm.name,
          code: quickCreateForm.code,
          product_id: variantForm.product_id,
        };
        break;
      case "size":
        if (!variantForm.product_id) {
          quickCreateError.value =
            "Please select a product first, or create a new product";
          return;
        }
        endpoint = "/api/product-sizes";
        data = {
          size: quickCreateForm.size,
          sort_order: quickCreateForm.sort_order,
          product_id: variantForm.product_id,
        };
        break;
      case "brand":
        endpoint = "/api/brands";
        data = {
          name: quickCreateForm.name,
          name_km: quickCreateForm.name_km,
          description: quickCreateForm.description,
        };
        break;
    }

    const res = await axios.post(endpoint, data, globalStore.getAxiosHeader());

    if (res.data.result) {
      const newItem = res.data.data;

      // Debug: Log the response to see the structure
      console.log(`Created ${quickCreateType.value}:`, newItem);

      // Update the appropriate array and set the selected value
      switch (quickCreateType.value) {
        case "product":
          products.value.push(newItem);
          variantForm.product_id = String(newItem.id);
          // Reset color and size since product changed
          variantForm.product_color_id = "";
          variantForm.product_size_id = "";
          break;
        case "color":
          colors.value.push(newItem);
          variantForm.product_color_id = String(newItem.id);
          break;
        case "size":
          sizes.value.push(newItem);
          variantForm.product_size_id = String(newItem.id);
          break;
        case "brand":
          brands.value.push(newItem);
          // Check if the new item has an id field
          if (newItem.id) {
            variantForm.brand_id = String(newItem.id);
          } else {
            console.warn("Brand created but no ID returned:", newItem);
            // If no id, try to find the brand by name to get the id
            await fetchBrands(); // Refresh brands list
            const foundBrand = brands.value.find((brand) => brand.name === newItem.name);
            if (foundBrand) {
              variantForm.brand_id = String(foundBrand.id);
            }
          }
          break;
      }

      showNotification(
        "success",
        "Success",
        `${
          quickCreateType.value.charAt(0).toUpperCase() + quickCreateType.value.slice(1)
        } created successfully!`
      );
      closeQuickCreateModal();
    } else {
      quickCreateError.value =
        res.data.message || `Failed to create ${quickCreateType.value}`;
    }
  } catch (error) {
    console.error(`Error creating ${quickCreateType.value}:`, error);
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        quickCreateError.value = error.response.data.message;
      } else if (error.response.data.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        quickCreateError.value = errors.join(", ");
      } else {
        quickCreateError.value = `An error occurred while creating the ${quickCreateType.value}.`;
      }
    } else {
      quickCreateError.value = `An error occurred while creating the ${quickCreateType.value}.`;
    }
  } finally {
    isQuickCreating.value = false;
  }
};

const handleSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    handleSearch();
  }, 500);
};

const handleSearch = async () => {
  paginationData.current_page = 1;
  await getVariants(1);
};

const toggleSort = async (column) => {
  if (sortCol.value === column) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortCol.value = column;
    sortDir.value = "asc";
  }
  await getVariants(1);
};

const changePage = async (page) => {
  await getVariants(page);
};

const findById = (collection, id) => {
  if (!id || !collection || !collection.length) return null;
  const stringId = String(id);
  return collection.find((item) => String(item.id) === stringId);
};

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

const getSelectedColorName = () => {
  if (!variantForm.product_color_id) return "";
  const color = findById(colors.value, variantForm.product_color_id);
  return color ? color.name : "";
};

const getSelectedColorCode = () => {
  if (!variantForm.product_color_id) return "#cccccc";
  const color = findById(colors.value, variantForm.product_color_id);
  return color ? color.code : "#cccccc";
};

const handleProductChange = () => {
  variantForm.product_color_id = "";
  variantForm.product_size_id = "";
};

const getVariants = async (page = 1) => {
  isLoading.value = true;
  error.value = null;
  try {
    const url = `/api/product-variants?page=${page}&per_page=${perPage.value}&sort_col=${sortCol.value}&sort_dir=${sortDir.value}&search=${searchQuery.value}&product_id=${selectedProduct.value}&brand_id=${selectedBrand.value}&color_id=${selectedColor.value}`;
    const res = await axios.get(url, globalStore.getAxiosHeader());
    if (res.data.result) {
      variants.value = res.data.data;
      if (res.data.paginate) {
        Object.assign(paginationData, res.data.paginate);
      }
      return true;
    } else {
      error.value = res.data.message || "Failed to fetch product variants";
      return false;
    }
  } catch (err) {
    error.value = err.message || "An error occurred while fetching product variants";
    await globalStore.onCheckError(err, router);
    return false;
  } finally {
    isLoading.value = false;
  }
};

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
    const res = await axios.get("/api/product-colors", globalStore.getAxiosHeader());
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
    const res = await axios.get("/api/product-sizes", globalStore.getAxiosHeader());
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
      currentVariantId.value = variantId;
      if (variant.product) {
        const matchingProduct = products.value.find((p) => p.name === variant.product);
        variantForm.product_id = matchingProduct ? String(matchingProduct.id) : "";
      } else {
        variantForm.product_id = String(variant.product_id || "");
      }
      if (variant.color_name) {
        const matchingColor = colors.value.find((c) => c.name === variant.color_name);
        variantForm.product_color_id = matchingColor ? String(matchingColor.id) : "";
      } else {
        variantForm.product_color_id = String(variant.product_color_id || "");
      }
      if (variant.size) {
        const matchingSize = sizes.value.find((s) => s.size === variant.size);
        variantForm.product_size_id = matchingSize ? String(matchingSize.id) : "";
      } else {
        variantForm.product_size_id = String(variant.product_size_id || "");
      }
      if (variant.brand) {
        const matchingBrand = brands.value.find((b) => b.name === variant.brand);
        variantForm.brand_id = matchingBrand ? String(matchingBrand.id) : "";
      } else {
        variantForm.brand_id = String(variant.brand_id || "");
      }
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

const handleSubmit = async (event) => {
  event.preventDefault();
  if (!event.target.checkValidity()) {
    event.stopPropagation();
    event.target.classList.add("was-validated");
    return;
  }
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
      } else {
        modalError.value = "An error occurred while updating the variant.";
      }
    } else {
      modalError.value = "An error occurred while updating the variant.";
    }
    await globalStore.onCheckError(error, router);
  } finally {
    isSubmitting.value = false;
  }
};

const performDeleteVariant = async (id) => {
  try {
    const res = await axios.delete(
      `/api/product-variants/${id}`,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      if (variants.value.length === 1 && paginationData.current_page > 1) {
        await getVariants(paginationData.current_page - 1);
      } else {
        await getVariants(paginationData.current_page);
      }
      showNotification("success", "Success", "Variant deleted successfully!");
    } else {
      showNotification("error", "Error", res.data.message || "Failed to delete variant");
    }
  } catch (err) {
    showNotification("error", "Error", "An error occurred while deleting the variant");
    console.error("Error deleting variant:", err);
    await globalStore.onCheckError(err, router);
  }
};

const deleteVariant = (id) => {
  showConfirmation(
    "Delete Variant",
    "Are you sure you want to delete this variant?",
    performDeleteVariant,
    id
  );
};

onMounted(async () => {
  isLoading.value = true;
  error.value = null;

  try {
    await Promise.all([fetchProducts(), fetchColors(), fetchSizes(), fetchBrands()]);
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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 30px;
  padding-bottom: 30px;
  overflow-y: auto;
  z-index: 1050;
}

.modal-content {
  width: 90%;
  max-width: 800px;
  max-height: unset;
  overflow-y: auto;
  padding: 2rem;
  border-radius: 0.5rem;
  margin: auto;
  background-color: white;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.quick-create-form {
  max-width: 500px;
}

.variant-form .form-label {
  font-weight: 500;
}

/* Create button styling */
.input-group .btn {
  border-left: 0;
}

.input-group .form-select {
  border-right: 0;
}

.form-control-color {
  max-width: 60px;
}

/* Color preview in form */
.color-preview-addon {
  padding: 0.375rem 0.75rem;
}

.color-preview-swatch {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #ccc;
}

/* Warning text styling */
.form-text.text-warning {
  font-size: 0.875rem;
  margin-top: 0.25rem;
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

/* Toast container */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1200;
}

.toast-notification {
  display: flex;
  align-items: center;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 0.375rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  background-color: white;
  border: 1px solid #dee2e6;
  min-width: 300px;
}

.toast-notification.success {
  border-left: 4px solid #198754;
}

.toast-notification.error {
  border-left: 4px solid #dc3545;
}

.toast-notification.warning {
  border-left: 4px solid #ffc107;
}

.toast-icon {
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.toast-content {
  flex-grow: 1;
}

.toast-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.toast-message {
  font-size: 0.875rem;
  color: #6c757d;
}

.toast-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  margin-left: 0.75rem;
  flex-shrink: 0;
}

/* Toast animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
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

@media (max-width: 576px) {
  .toast-container {
    right: 10px;
    left: 10px;
  }

  .toast-notification {
    min-width: unset;
  }
}
</style>
