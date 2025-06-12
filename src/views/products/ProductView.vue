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
          <div class="col-auto justify-content-between row g-3">
            <div class="search-box">
              <input
                v-model="searchQuery"
                class="form-control search-input search"
                type="search"
                placeholder="Search products"
                @input="handleSearchInput"
              />
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
                v-model="selectedCategory"
                class="form-select"
                aria-label="Filter Category"
                @change="handleSearch"
              >
                <option value="">Filter Category</option>
                <option
                  v-for="category in productCategories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
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
              <span class="fas fa-plus me-2"></span>Add Product
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
              <th class="align-middle">Thumbnail</th>
              <th class="align-middle">
                <a href="#" @click.prevent="toggleSort('name')">
                  Name
                  <i
                    v-if="sortCol === 'name'"
                    :class="sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
                  ></i>
                </a>
              </th>
              <th class="align-middle">
                <a href="#" @click.prevent="toggleSort('code')">
                  Code
                  <i
                    v-if="sortCol === 'code'"
                    :class="sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
                  ></i>
                </a>
              </th>
              <th class="align-middle">Brand</th>
              <th class="align-middle">Category</th>
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
                <a href="#" @click.prevent="toggleSort('status')">
                  Status
                  <i
                    v-if="sortCol === 'status'"
                    :class="sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
                  ></i>
                </a>
              </th>
              <th class="align-middle text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="products.length === 0">
              <td colspan="9" class="text-center">No product found</td>
            </tr>
            <tr v-else v-for="(product, index) in products" :key="product.id">
              <td class="align-middle ps-0">
                {{ (paginationData.current_page - 1) * perPage + index + 1 }}
              </td>
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

        <!-- Pagination -->
        <pagination
          v-if="!isLoading && products.length > 0"
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
    <div class="modal-content product-form">
      <h4>{{ isEditMode ? "Edit" : "Create" }} Product</h4>
      <div v-if="modalError" class="alert alert-danger">
        {{ modalError }}
      </div>
      <form class="row g-3 needs-validation" novalidate @submit.prevent="handleSubmit">
        <!-- Basic Information -->
        <div class="col-md-4">
          <label class="form-label" for="productName">Product Name</label>
          <input
            v-model="productForm.name"
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
            v-model="productForm.name_km"
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
            v-model="productForm.code"
            class="form-control"
            id="productCode"
            type="text"
          />
          <!-- <div class="invalid-feedback">Product code is required</div> -->
        </div>

        <!-- Categories and Brand -->
        <div class="col-md-4">
          <label class="form-label" for="brandId">Brand</label>
          <select v-model="productForm.brand_id" class="form-select" id="brandId">
            <option value="" disabled>Select a brand</option>
            <option v-for="brand in brands" :key="brand.id" :value="brand.id">
              {{ brand.name }}
            </option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label" for="categoryId">Category</label>
          <select v-model="productForm.category_id" class="form-select" id="categoryId">
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
            v-model="productForm.product_category_id"
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
            v-model="productForm.price"
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
          <select v-model="productForm.status" class="form-select" id="status" required>
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
          <div v-if="productForm.thumbnail" class="mt-2">
            <img
              :src="getImagePreviewUrl(productForm.thumbnail)"
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
            v-model="productForm.description"
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
import Pagination from "@/components/layouts/Pagination.vue";
import { useToast } from "@/composables/useToast";
import { useGlobalStore } from "@/stores/global";
import axios from "axios";
import { onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

const { toasts, showNotification, removeToast } = useToast();
const router = useRouter();
const globalStore = useGlobalStore();
const products = ref([]);
const brands = ref([]);
const categories = ref([]);
const productCategories = ref([]);
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
const selectedBrand = ref("");
const selectedCategory = ref("");
let searchTimeout = null;
const showModal = ref(false);
const isEditMode = ref(false);
const currentProductId = ref(null);
const isSubmitting = ref(false);
const modalError = ref("");
const objectUrls = ref([]);

const confirmationModal = reactive({
  show: false,
  title: "Confirm Action",
  message: "Are you sure you want to proceed?",
  action: null,
  actionParams: null,
});

const productForm = reactive({
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
  await getProducts(1);
};

const toggleSort = async (column) => {
  if (sortCol.value === column) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortCol.value = column;
    sortDir.value = "asc";
  }

  await getProducts(1);
};

const changePage = async (page) => {
  await getProducts(page);
};

const getProducts = async (page = 1) => {
  isLoading.value = true;
  error.value = null;

  try {
    const url = `/api/products?page=${page}&per_page=${perPage.value}&sort_col=${sortCol.value}&sort_dir=${sortDir.value}&search=${searchQuery.value}&brand_id=${selectedBrand.value}&category_id=${selectedCategory.value}`;
    const res = await axios.get(url, globalStore.getAxiosHeader());
    if (res.data.result) {
      products.value = res.data.data;
      if (res.data.paginate) {
        Object.assign(paginationData, res.data.paginate);
      }
      return true;
    } else {
      error.value = res.data.message || "Failed to fetch products";
      return false;
    }
  } catch (err) {
    error.value = err.message || "An error occurred while fetching products";
    await globalStore.onCheckError(err, router);
    return false;
  } finally {
    isLoading.value = false;
  }
};

const findById = (collection, id) => {
  if (!id || !collection || !collection.length) return null;
  const stringId = String(id);
  return collection.find((item) => String(item.id) === stringId);
};
const getBrandName = (product) => {
  if (product.brand && product.brand.name) {
    return product.brand.name;
  }
  if (product.brand_id) {
    const brand = findById(brands.value, product.brand_id);
    if (brand) {
      return brand.name;
    }
  }
  return "Unknown";
};

const getCategoryName = (product) => {
  if (product.product_category && product.product_category.name) {
    return product.product_category.name;
  }
  if (product.category && product.category.name) {
    return product.category.name;
  }
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

const fetchCategories = async () => {
  try {
    const res = await axios.get("/api/categories", globalStore.getAxiosHeader());
    if (res.data.result) {
      categories.value = res.data.data;
      return true;
    }
    return false;
  } catch (err) {
    console.error("Failed to fetch categories", err);
    showNotification("error", "Error", "Failed to fetch categories");
    return false;
  }
};

const fetchProductCategories = async () => {
  try {
    const res = await axios.get("/api/product-categories", globalStore.getAxiosHeader());
    if (res.data.result) {
      productCategories.value = res.data.data;
      return true;
    }
    return false;
  } catch (err) {
    console.error("Failed to fetch product categories", err);
    showNotification("error", "Error", "Failed to fetch product categories");
    return false;
  }
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    productForm.thumbnail = file;
  }
};

const openCreateModal = () => {
  isEditMode.value = false;
  currentProductId.value = null;
  resetProductForm();
  modalError.value = "";
  showModal.value = true;
};

const editProduct = async (productId) => {
  isLoading.value = true;
  try {
    const res = await axios.get(
      `/api/products/${productId}`,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      const product = res.data.data;
      currentProductId.value = productId;
      productForm.name = product.name || "";
      productForm.name_km = product.name_km || "";
      productForm.code = product.code || "";
      productForm.description = product.description || "";
      productForm.price = product.price || "";
      productForm.status = product.status || "draft";
      productForm.brand_id = product.brand
        ? product.brand.id
        : product.brand_id
        ? product.brand_id
        : "";
      productForm.category_id = product.category
        ? product.category.id
        : product.category_id
        ? product.category_id
        : "";
      productForm.product_category_id = product.product_category
        ? product.product_category.id
        : product.product_category_id
        ? product.product_category_id
        : "";
      if (product.thumbnail && typeof product.thumbnail === "string") {
        productForm.thumbnail = product.thumbnail;
      } else {
        productForm.thumbnail = null;
      }
      isEditMode.value = true;
      showModal.value = true;
    } else {
      showNotification("error", "Error", "Failed to fetch product details");
    }
  } catch (err) {
    console.error("Error fetching product:", err);
    showNotification("error", "Error", "Failed to fetch product details");
  } finally {
    isLoading.value = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  modalError.value = "";
  cleanupObjectURLs();
};

const resetProductForm = () => {
  productForm.name = "";
  productForm.name_km = "";
  productForm.code = "";
  productForm.description = "";
  productForm.price = "";
  productForm.status = "published";
  productForm.brand_id = "";
  productForm.category_id = "";
  productForm.product_category_id = "";
  productForm.thumbnail = null;
};

const handleSubmit = async (event) => {
  event.preventDefault();
  if (!productForm.name.trim()) {
    modalError.value = "Product name is required";
    return;
  }
  if (!productForm.name_km.trim()) {
    modalError.value = "Product name in Khmer is required";
    return;
  }

  if (!productForm.price) {
    modalError.value = "Price is required";
    return;
  }
  if (isEditMode.value) {
    await updateProduct();
  } else {
    await createProduct();
  }
};

const createProduct = async () => {
  isSubmitting.value = true;
  modalError.value = "";
  try {
    const formData = new FormData();
    formData.append("name", productForm.name);
    formData.append("name_km", productForm.name_km);
    formData.append("code", productForm.code);
    formData.append("description", productForm.description || "");
    formData.append("price", productForm.price);
    formData.append("status", productForm.status);
    if (productForm.brand_id) {
      formData.append("brand_id", productForm.brand_id);
    }
    if (productForm.category_id) {
      formData.append("category_id", productForm.category_id);
    }
    if (productForm.product_category_id) {
      formData.append("product_category_id", productForm.product_category_id);
    }
    if (productForm.thumbnail instanceof File) {
      formData.append("thumbnail", productForm.thumbnail);
    }
    const res = await axios.post(`/api/products`, formData, globalStore.getAxiosHeader());
    if (res.data.result) {
      await getProducts(paginationData.current_page);
      closeModal();
      showNotification("success", "Success", "Product created successfully!");
    } else {
      modalError.value = res.data.message || "Failed to create product";
    }
  } catch (error) {
    console.error("Error creating product:", error);
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        modalError.value = error.response.data.message;
      } else if (error.response.data.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        modalError.value = errors.join("\n");
      } else {
        modalError.value = "An error occurred while creating the product.";
      }
    } else {
      modalError.value = "An error occurred while creating the product.";
    }
    await globalStore.onCheckError(error, router);
  } finally {
    isSubmitting.value = false;
  }
};

const updateProduct = async () => {
  isSubmitting.value = true;
  modalError.value = "";
  try {
    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("name", productForm.name);
    formData.append("name_km", productForm.name_km);
    formData.append("code", productForm.code);
    formData.append("description", productForm.description || "");
    formData.append("price", productForm.price);
    formData.append("status", productForm.status);
    if (productForm.brand_id) {
      formData.append("brand_id", productForm.brand_id);
    }
    if (productForm.category_id) {
      formData.append("category_id", productForm.category_id);
    }
    if (productForm.product_category_id) {
      formData.append("product_category_id", productForm.product_category_id);
    }
    if (productForm.thumbnail instanceof File) {
      formData.append("thumbnail", productForm.thumbnail);
    }
    const res = await axios.post(
      `/api/products/${currentProductId.value}`,
      formData,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      await getProducts(paginationData.current_page);
      closeModal();
      showNotification("success", "Success", "Product updated successfully!");
    } else {
      modalError.value = res.data.message || "Failed to update product";
    }
  } catch (error) {
    console.error("Error updating product:", error);
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        modalError.value = error.response.data.message;
      } else if (error.response.data.errors) {
        // Format validation errors
        const errors = Object.values(error.response.data.errors).flat();
        modalError.value = errors.join("\n");
      } else {
        modalError.value = "An error occurred while updating the product.";
      }
    } else {
      modalError.value = "An error occurred while updating the product.";
    }
    await globalStore.onCheckError(error, router);
  } finally {
    isSubmitting.value = false;
  }
};

const performDeleteProduct = async (id) => {
  try {
    const res = await axios.delete(`/api/products/${id}`, globalStore.getAxiosHeader());
    if (res.data.result) {
      if (products.value.length === 1 && paginationData.current_page > 1) {
        await getProducts(paginationData.current_page - 1);
      } else {
        await getProducts(paginationData.current_page);
      }
      showNotification("success", "Success", "Product deleted successfully!");
    } else {
      showNotification("error", "Error", res.data.message || "Failed to delete product");
    }
  } catch (err) {
    showNotification("error", "Error", "An error occurred while deleting the product");
    console.error("Error deleting product:", err);
    await globalStore.onCheckError(err, router);
  }
};

const deleteProduct = (id) => {
  showConfirmation(
    "Delete Product",
    "Are you sure you want to delete this product?",
    performDeleteProduct,
    id
  );
};

onBeforeUnmount(() => {
  cleanupObjectURLs();
});
onMounted(async () => {
  isLoading.value = true;
  error.value = null;
  try {
    await Promise.all([fetchBrands(), fetchCategories(), fetchProductCategories()]);
    await getProducts(1);
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
.product-thumbnail {
  object-fit: cover;
  border-radius: 4px;
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
  top: 0;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  left: 0;
  overflow-y: auto;
  padding: 2rem;
  border-radius: 0.5rem;
  margin: auto;
}

.product-form .form-label {
  font-weight: 500;
}

.thumbnail-preview {
  border-radius: 4px;
  border: 1px solid #dee2e6;
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
</style>
