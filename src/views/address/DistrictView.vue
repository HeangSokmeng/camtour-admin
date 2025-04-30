<template>
  <div class="mb-9">
    <div class="row g-2 mb-4">
      <div class="col-auto">
        <h2 class="mb-0">Districts</h2>
      </div>
    </div>
    <div id="districts">
      <div class="mb-4">
        <div class="row g-3 justify-content-between">
          <div class="col-auto justify-content-between row g-3">
            <div class="search-box">
              <input
                v-model="searchQuery"
                class="form-control search-input search"
                type="search"
                placeholder="Search districts"
              />
            </div>
            <div class="col-auto">
              <select
                v-model="selectedProvince"
                class="form-select"
                aria-label="Province filter"
              >
                <option value="">Filter Province</option>
                <option
                  v-for="province in provinces"
                  :key="province.id"
                  :value="province.id"
                >
                  {{ province.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="col-auto">
            <button class="btn btn-primary" @click="openCreateModal">
              <i class="fas fa-plus me-2"></i>Add District
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-danger text-center">
        {{ error }}
      </div>

      <!-- Districts Table -->
      <div v-else class="table-responsive">
        <table class="table table-sm fs-9 mb-0">
          <thead>
            <tr>
              <th class="align-middle ps-0">#</th>
              <th class="align-middle">District Name</th>
              <th class="align-middle">District Local Name</th>
              <th class="align-middle">Province Name</th>
              <th class="align-middle text-end">Created At</th>
              <th class="align-middle text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredDistricts.length === 0">
              <td colspan="6" class="text-center">No districts found</td>
            </tr>
            <tr v-else v-for="(district, index) in filteredDistricts" :key="district.id">
              <td class="align-middle ps-0">
                {{ index + 1 + (currentPage - 1) * pageSize }}
              </td>
              <td class="align-middle">{{ district.name }}</td>
              <td class="align-middle">{{ district.local_name }}</td>
              <td class="align-middle">{{ district.province.name }}</td>
              <td class="align-middle text-end">{{ formatDate(district.created_at) }}</td>
              <td class="align-middle text-end">
                <button
                  class="btn btn-sm btn-primary me-2"
                  @click="openEditModal(district)"
                >
                  <i class="fas fa-edit me-1"></i>Edit
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  @click="deleteDistrict(district.id)"
                >
                  <i class="fas fa-trash me-1"></i>Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="row align-items-center justify-content-between py-2 pe-0 fs-9">
          <div class="col-auto d-flex">
            <p class="mb-0 d-none d-sm-block me-3 fw-semibold text-body">
              Showing page {{ currentPage }} of {{ totalPages }}
            </p>
            <a href="#!" class="fw-semibold" @click.prevent="fetchDistricts(1)">
              View all
              <i class="fas fa-angle-right ms-1"></i>
            </a>
          </div>
          <div class="col-auto d-flex">
            <button
              class="page-link"
              :disabled="currentPage === 1"
              @click.prevent="fetchDistricts(currentPage - 1)"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <ul class="pagination mb-0">
              <li v-for="page in totalPagesArray" :key="page" class="page-item">
                <button
                  class="page-link"
                  :class="{ active: currentPage === page }"
                  @click.prevent="fetchDistricts(page)"
                >
                  {{ page }}
                </button>
              </li>
            </ul>
            <button
              class="page-link pe-0"
              :disabled="currentPage === totalPages"
              @click.prevent="fetchDistricts(currentPage + 1)"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- District Modal -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
          <h4>{{ isEditMode ? "Edit" : "Create" }} District</h4>

          <div v-if="modalError" class="alert alert-danger">
            {{ modalError }}
          </div>

          <form
            @submit.prevent="submitDistrict"
            class="row g-3 needs-validation"
            novalidate
          >
            <div class="col-md-12">
              <label for="districtName" class="form-label">District Name</label>
              <input
                v-model.trim="districtForm.name"
                id="districtName"
                type="text"
                class="form-control"
                required
              />
              <div class="invalid-feedback">District name is required</div>
            </div>

            <div class="col-md-12">
              <label for="districtLocalName" class="form-label"
                >District Local Name</label
              >
              <input
                v-model.trim="districtForm.local_name"
                id="districtLocalName"
                type="text"
                class="form-control"
                required
              />
              <div class="invalid-feedback">District local name is required</div>
            </div>

            <div class="col-md-12">
              <label for="provinceId" class="form-label">Province</label>
              <select
                v-model="districtForm.province_id"
                id="provinceId"
                class="form-select"
                required
              >
                <option value="">Select a province</option>
                <option
                  v-for="province in provinces"
                  :key="province.id"
                  :value="province.id"
                >
                  {{ province.name }} ({{ province.local_name }})
                </option>
              </select>
              <div class="invalid-feedback">Please select a province</div>
            </div>

            <div class="col-12 d-flex justify-content-end">
              <button type="button" class="btn btn-secondary me-2" @click="closeModal">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                {{ isSubmitting ? "Processing..." : isEditMode ? "Update" : "Save" }}
              </button>
            </div>
          </form>
        </div>
      </div>
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

// State management
const isLoading = ref(false);
const error = ref(null);
const districts = ref([]);
const provinces = ref([]);

// Pagination
const currentPage = ref(1);
const pageSize = ref(10);
const totalPages = ref(1);

// Search and Filter
const searchQuery = ref("");
const selectedProvince = ref("");

// Modal Management
const showModal = ref(false);
const isEditMode = ref(false);
const isSubmitting = ref(false);
const modalError = ref("");

// Confirmation modal state
const confirmationModal = reactive({
  show: false,
  title: "Confirm Action",
  message: "Are you sure you want to proceed?",
  action: null,
  actionParams: null,
});

// Form Data
const districtForm = reactive({
  id: null,
  name: "",
  local_name: "",
  province_id: "",
});

// Computed Properties
const filteredDistricts = computed(() => {
  return districts.value.filter((district) => {
    const nameMatch = district.name
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());
    const provinceMatch =
      !selectedProvince.value ||
      String(district.province.id) === String(selectedProvince.value);
    return nameMatch && provinceMatch;
  });
});

const totalPagesArray = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1);
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

// Utility Functions
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

// API Interactions
const fetchDistricts = async (page = 1) => {
  const globalStore = useGlobalStore();
  isLoading.value = true;
  error.value = null;

  try {
    const res = await axios.get(
      `/api/districts?page=${page}`,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      districts.value = res.data.data;
      currentPage.value = res.data.paginate.current_page;
      totalPages.value = res.data.paginate.last_page;
    } else {
      error.value = res.data.message || "Failed to fetch districts";
    }
  } catch (err) {
    error.value = err.message || "An error occurred while fetching districts";
  } finally {
    isLoading.value = false;
  }
};

const fetchProvinces = async () => {
  const globalStore = useGlobalStore();
  try {
    const res = await axios.get("/api/provinces", globalStore.getAxiosHeader());
    provinces.value = res.data.result ? res.data.data : [];
  } catch (err) {
    console.error("Failed to fetch provinces", err);
    showNotification("error", "Error", "Failed to fetch provinces");
  }
};

// Modal Methods
const openCreateModal = () => {
  isEditMode.value = false;
  districtForm.id = null;
  districtForm.name = "";
  districtForm.local_name = "";
  districtForm.province_id = "";
  modalError.value = "";
  showModal.value = true;
};

const openEditModal = (district) => {
  isEditMode.value = true;
  districtForm.id = district.id;
  districtForm.name = district.name;
  districtForm.local_name = district.local_name;

  // Update this line to use the province_id from the nested province object
  districtForm.province_id = district.province.id;

  modalError.value = "";
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  modalError.value = "";
};

const submitDistrict = async () => {
  const globalStore = useGlobalStore();
  isSubmitting.value = true;
  modalError.value = "";

  try {
    const payload = {
      name: districtForm.name,
      local_name: districtForm.local_name,
      province_id: districtForm.province_id,
    };

    const res = isEditMode.value
      ? await axios.put(
          `/api/districts/${districtForm.id}`,
          payload,
          globalStore.getAxiosHeader()
        )
      : await axios.post("/api/districts", payload, globalStore.getAxiosHeader());

    if (res.data.result) {
      await fetchDistricts(currentPage.value);
      closeModal();

      // Show success notification
      const message = isEditMode.value
        ? "District updated successfully!"
        : "District created successfully!";
      showNotification("success", "Success", message);
    } else {
      modalError.value = res.data.message || "Failed to save district";
    }
  } catch (err) {
    modalError.value = err.response?.data?.message || "An error occurred";
  } finally {
    isSubmitting.value = false;
  }
};

// Perform delete operation
const performDeleteDistrict = async (id) => {
  const globalStore = useGlobalStore();
  try {
    const res = await axios.delete(`/api/districts/${id}`, globalStore.getAxiosHeader());

    if (res.data.result) {
      await fetchDistricts(currentPage.value);
      showNotification("success", "Success", "District deleted successfully!");
    } else {
      showNotification("error", "Error", res.data.message || "Failed to delete district");
    }
  } catch (err) {
    showNotification("error", "Error", "An error occurred while deleting the district");
    console.error("Error deleting district:", err);
  }
};

// Show delete confirmation
const deleteDistrict = (id) => {
  showConfirmation(
    "Delete District",
    "Are you sure you want to delete this district?",
    performDeleteDistrict,
    id
  );
};

// Lifecycle Hook
onMounted(() => {
  fetchDistricts();
  fetchProvinces();
});
</script>
