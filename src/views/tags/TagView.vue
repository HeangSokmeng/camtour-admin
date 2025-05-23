<template>
  <div class="mb-9">
    <div class="row g-2 mb-4">
      <div class="col-auto">
        <h2 class="mb-0">Tag</h2>
      </div>
    </div>

    <div id="tags">
      <div class="mb-4">
        <div class="row g-3 justify-content-between">
          <div class="col-auto">
            <div class="search-box">
              <input
                v-model="searchQuery"
                class="form-control search-input search"
                type="search"
                placeholder="Search tags"
              />
            </div>
          </div>
          <div class="col-auto">
            <button class="btn btn-primary" @click="openModal">
              <span class="fas fa-plus me-2"></span>Add Tag
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
              <th class="align-middle">Tag Name</th>
              <th class="align-middle text-end">Created At</th>
              <th class="align-middle text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredTags.length === 0">
              <td colspan="4" class="text-center">No tags found</td>
            </tr>
            <tr v-else v-for="(tag, index) in filteredTags" :key="tag.id">
              <td class="align-middle ps-0">{{ index + 1 }}</td>
              <td class="align-middle">{{ tag.name }}</td>
              <td class="align-middle text-end">{{ tag.created_at }}</td>
              <td class="align-middle text-end">
                <button class="btn btn-sm btn-primary me-2" @click="editTag(tag.id)">
                  <span class="fas fa-edit me-1"></span>Edit
                </button>
                <button class="btn btn-sm btn-danger" @click="deleteTag(tag.id)">
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
      <h4>{{ isEditMode ? "Edit" : "Create" }} Tag</h4>
      <div v-if="modalMessage" class="alert alert-danger">{{ modalMessage }}</div>
      <form class="row g-3 needs-validation" novalidate @submit.prevent="handleSubmit">
        <div class="col-md-12">
          <label class="form-label" for="tagName">Tag Name</label>
          <input
            v-model="newTag.name"
            class="form-control"
            id="tagName"
            type="text"
            required
          />
          <div class="invalid-feedback">Tag name is required</div>
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

const state = reactive({
  tags: [],
  isLoading: false,
  error: null,
});

const searchQuery = ref("");
const showModal = ref(false);
const isEditMode = ref(false);
const currentTagId = ref(null);
const isSubmitting = ref(false);
const modalMessage = ref("");

// Confirmation modal state
const confirmationModal = reactive({
  show: false,
  title: "Confirm Action",
  message: "Are you sure you want to proceed?",
  action: null,
  actionParams: null,
});

const newTag = reactive({
  name: "",
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

const fetchTags = async () => {
  state.isLoading = true;
  const globalStore = useGlobalStore(); // Import the store

  try {
    const res = await axios.get("/api/tags", globalStore.getAxiosHeader()); // Add auth headers
    if (res.data.result && Array.isArray(res.data.data)) {
      state.tags = res.data.data;
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

const createTag = async () => {
  const globalStore = useGlobalStore();
  try {
    isSubmitting.value = true;
    modalMessage.value = "";
    const res = await axios.post(
      `/api/tags`,
      { name: newTag.name },
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      state.tags.push(res.data.data);
      await fetchTags();
      closeModal();
      resetTagForm();
      showNotification("success", "Success", "Tag created successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to create tag";
    }
  } catch (error) {
    console.error("Error creating tag:", error);
    modalMessage.value = "An error occurred while creating the tag";
    await globalStore.onCheckError(error, router);
  } finally {
    isSubmitting.value = false;
  }
};

const updateTag = async () => {
  const globalStore = useGlobalStore();
  try {
    isSubmitting.value = true;
    modalMessage.value = "";
    const res = await axios.put(
      `/api/tags/${currentTagId.value}`,
      { name: newTag.name },
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      const updatedTag = res.data.data;
      const index = state.tags.findIndex((t) => t.id === updatedTag.id);
      state.tags.splice(index, 1, updatedTag);
      await fetchTags();
      closeModal();
      resetTagForm();
      showNotification("success", "Success", "Tag updated successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to update tag";
    }
  } catch (error) {
    console.error("Error updating tag:", error);
    modalMessage.value = "An error occurred while updating the tag";
  } finally {
    isSubmitting.value = false;
  }
};

// Delete tag function
const performDeleteTag = async (tagId) => {
  const globalStore = useGlobalStore();
  try {
    const res = await axios.delete(`/api/tags/${tagId}`, globalStore.getAxiosHeader());
    if (res.data.result) {
      state.tags = state.tags.filter((t) => t.id !== tagId);
      await fetchTags();
      showNotification("success", "Success", "Tag deleted successfully!");
    } else {
      showNotification("error", "Error", res.data.message || "Failed to delete tag");
    }
  } catch (error) {
    console.error("Error deleting tag:", error);
    showNotification("error", "Error", "An error occurred while deleting the tag");
  }
};

// Show delete confirmation
const deleteTag = (tagId) => {
  showConfirmation(
    "Delete Tag",
    "Are you sure you want to delete this tag?",
    performDeleteTag,
    tagId
  );
};

const openModal = () => {
  resetTagForm();
  isEditMode.value = false;
  showModal.value = true;
};

const editTag = (tagId) => {
  const tag = state.tags.find((t) => t.id === tagId);
  if (tag) {
    newTag.name = tag.name;
    currentTagId.value = tagId;
    isEditMode.value = true;
    showModal.value = true;
  }
};

const closeModal = () => {
  showModal.value = false;
  resetTagForm();
  modalMessage.value = "";
};

const resetTagForm = () => {
  newTag.name = "";
  currentTagId.value = null;
};

const handleSubmit = async (event) => {
  event.preventDefault();
  if (!newTag.name.trim()) {
    modalMessage.value = "Tag name is required";
    return;
  }

  if (isEditMode.value) {
    await updateTag();
  } else {
    await createTag();
  }
};

const filteredTags = computed(() => {
  return state.tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

onMounted(fetchTags);
</script>
