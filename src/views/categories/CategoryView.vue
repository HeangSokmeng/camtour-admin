<template>
  <div class="mb-9">
    <div class="row g-2 mb-4">
      <div class="col-auto">
        <h2 class="mb-0">Category</h2>
      </div>
    </div>
    <div id="categories">
      <div class="mb-4">
        <div class="row g-3 justify-content-between">
          <div class="col-auto">
            <div class="search-box">
              <input
                v-model="searchQuery"
                class="form-control search-input search"
                type="search"
                placeholder="Search categories"
              />
            </div>
          </div>
          <div class="col-auto">
            <button class="btn btn-primary" @click="openModal">
              <span class="fas fa-plus me-2"></span>Add Category
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
              <th class="align-middle">Category Name</th>
              <th class="align-middle">Category Name Km</th>
              <th class="align-middle text-end">Created At</th>
              <th class="align-middle text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredCategories.length === 0">
              <td colspan="6" class="text-center">No categories found</td>
            </tr>
            <tr v-else v-for="(category, index) in filteredCategories" :key="category.id">
              <td class="align-middle ps-0">{{ index + 1 }}</td>
              <td class="align-middle">
                <img
                  :src="category.image"
                  alt="Category Image"
                  class="img-thumbnail"
                  style="width: 50px; height: 50px; object-fit: cover"
                />
              </td>
              <td class="align-middle">{{ category.name }}</td>
              <td class="align-middle">{{ category.name_km }}</td>
              <td class="align-middle text-end">{{ category.created_at }}</td>
              <td class="align-middle text-end">
                <button
                  class="btn btn-sm btn-primary me-2"
                  @click="editCategory(category.id)"
                >
                  <span class="fas fa-edit me-1"></span>Edit
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  @click="deleteCategory(category.id)"
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
    <div class="modal-content">
      <h4>{{ isEditMode ? "Edit" : "Create" }} Category</h4>
      <!-- Display modal messages -->
      <div v-if="modalMessage" class="alert alert-danger">{{ modalMessage }}</div>
      <form class="row g-3 needs-validation" novalidate @submit.prevent="handleSubmit">
        <div class="col-md-6">
          <label class="form-label" for="categoryName">Category name</label>
          <input
            v-model="newCategory.name"
            class="form-control"
            id="categoryName"
            type="text"
            required
          />
          <div class="invalid-feedback">Category name is required</div>
        </div>
        <div class="col-md-6">
          <label class="form-label" for="categoryName">Category name km</label>
          <input
            v-model="newCategory.name_km"
            class="form-control"
            id="categoryName"
            type="text"
            required
          />
          <div class="invalid-feedback">Category name km is required</div>
        </div>
        <div class="col-md-12">
          <label class="form-label" for="categoryImage">Image</label>
          <input
            class="form-control"
            id="categoryImage"
            type="file"
            @change="handleImageUpload"
          />
        </div>
        <div class="col-md-12">
          <label class="form-label" for="categoryDescription">Description</label>
          <input
            v-model="newCategory.description"
            class="form-control"
            id="categoryDescription"
            type="text"
          />
        </div>
        <div class="col-12 float-end">
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
</template>

<script setup>
import "@/assets/css/toast-styles.css";
import { useGlobalStore } from "@/stores/global";
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";

const state = reactive({
  categories: [],
  isLoading: false,
  error: null,
});

const searchQuery = ref("");
const showModal = ref(false);
const isEditMode = ref(false);
const currentCategoryId = ref(null);
const isSubmitting = ref(false);

const newCategory = reactive({
  name: "",
  name_km: "",
  description: "",
  image: null,
});

const modalMessage = ref("");
const fetchCategories = async () => {
  state.isLoading = true;
  const globalStore = useGlobalStore();
  try {
    const res = await axios.get("/api/categories", globalStore.getAxiosHeader()); // Add auth headers
    if (res.data.result && Array.isArray(res.data.data)) {
      state.categories = res.data.data;
    } else {
      state.error = res.data.message || "Failed to fetch tags";
    }
  } catch (error) {
    state.error = "An error occurred while fetching tags";
    console.error(error);
    await globalStore.onCheckError(error, router);
  } finally {
    state.isLoading = false;
  }
};

const createCategory = async () => {
  const globalStore = useGlobalStore();
  try {
    isSubmitting.value = true;
    modalMessage.value = "";
    const formData = new FormData();
    formData.append("name", newCategory.name);
    formData.append("name_km", newCategory.name_km);
    formData.append("description", newCategory.description);
    if (newCategory.image) {
      formData.append("image", newCategory.image);
    }
    const res = await axios.post(
      `/api/categories`,
      formData,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      state.categories.push(res.data.data);
      closeModal();
      resetCategoryForm();
    } else {
      modalMessage.value = res.data.message || "Failed to create category";
    }
  } catch (error) {
    console.error("Error creating category:", error);
    modalMessage.value = "An error occurred while creating the category";
    await globalStore.onCheckError(error, router);
  } finally {
    isSubmitting.value = false;
  }
};

const updateCategory = async () => {
  const globalStore = useGlobalStore();
  try {
    isSubmitting.value = true;
    modalMessage.value = "";
    const formData = new FormData();
    formData.append("name", newCategory.name);
    formData.append("name_km", newCategory.name_km);
    formData.append("description", newCategory.description);
    if (newCategory.image) {
      formData.append("image", newCategory.image);
    }
    const res = await axios.post(
      `/api/categories/${currentCategoryId.value}`,
      formData,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      const updatedCategory = res.data.data;
      const index = state.categories.findIndex((c) => c.id === updatedCategory.id);
      state.categories.splice(index, 1, updatedCategory);
      closeModal();
      resetCategoryForm();
    } else {
      modalMessage.value = res.data.message || "Failed to update category";
    }
  } catch (error) {
    console.error("Error updating category:", error);
    modalMessage.value = "An error occurred while updating the category";
    const globalStore = useGlobalStore();
    await globalStore.onCheckError(error, router);
  } finally {
    isSubmitting.value = false;
  }
};

const deleteCategory = async (categoryId) => {
  const globalStore = useGlobalStore();
  if (!confirm("Are you sure you want to delete this category?")) return;
  try {
    const res = await axios.delete(
      `/api/categories/${categoryId}`,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      state.categories = state.categories.filter((c) => c.id !== categoryId);
    } else {
      alert(res.data.message || "Failed to delete category");
    }
  } catch (error) {
    console.error("Error deleting category:", error);
    alert("An error occurred while deleting the category");
  }
};

const openModal = () => {
  resetCategoryForm();
  isEditMode.value = false;
  showModal.value = true;
};

const editCategory = (categoryId) => {
  const category = state.categories.find((c) => c.id === categoryId);
  if (category) {
    newCategory.name = category.name;
    newCategory.name_km = category.name_km;
    newCategory.description = category.description;
    currentCategoryId.value = categoryId;
    isEditMode.value = true;
    showModal.value = true;
  }
};

const closeModal = () => {
  showModal.value = false;
  resetCategoryForm();
  modalMessage.value = "";
};

const resetCategoryForm = () => {
  newCategory.name = "";
  newCategory.name_km = "";
  newCategory.description = "";
  newCategory.image = null;
  currentCategoryId.value = null;
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  newCategory.image = file;
};

const handleSubmit = async (event) => {
  event.preventDefault();
  if (!newCategory.name.trim()) {
    modalMessage.value = "Category name is required";
    return;
  }
  if (isEditMode.value) {
    await updateCategory();
  } else {
    await createCategory();
  }
};

const filteredCategories = computed(() => {
  return state.categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

onMounted(fetchCategories);
</script>

<style scoped></style>
