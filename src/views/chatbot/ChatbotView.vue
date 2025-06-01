<template>
  <div class="mb-9">
    <div class="row g-2 mb-4">
      <div class="col-auto">
        <h2 class="mb-0">Tours Management</h2>
      </div>
    </div>
    <div id="tours">
      <div class="mb-4">
        <div class="row g-3 justify-content-between">
          <div class="col-auto justify-content-between row g-3">
            <div class="search-box">
              <input
                v-model="searchQuery"
                class="form-control search-input search"
                type="search"
                placeholder="Search tours"
                @input="handleSearchInput"
              />
            </div>
            <div class="col-auto">
              <select
                v-model="selectedLocation"
                class="form-select"
                aria-label="Filter Location"
                @change="handleSearch"
              >
                <option value="">Filter Location</option>
                <option
                  v-for="location in uniqueLocations"
                  :key="location"
                  :value="location"
                >
                  {{ location }}
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
                  v-for="category in uniqueCategories"
                  :key="category"
                  :value="category"
                >
                  {{ category }}
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
              <span class="fas fa-plus me-2"></span>Add Tour
            </button>
            <div class="btn-group ms-2" role="group">
              <button
                id="exportDropdown"
                type="button"
                class="btn btn-success dropdown-toggle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                :disabled="isExporting"
              >
                <span
                  v-if="isExporting"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                <span v-else class="fas fa-download me-2"></span>
                {{ isExporting ? "Exporting..." : "Export" }}
              </button>
              <ul class="dropdown-menu" aria-labelledby="exportDropdown">
                <li>
                  <a
                    class="dropdown-item"
                    href="#"
                    @click.prevent="exportJson('pretty')"
                    :class="{ disabled: isExporting }"
                  >
                    <i class="fas fa-file-code me-2"></i>Export JSON (Pretty)
                  </a>
                </li>
                <li>
                  <a
                    class="dropdown-item"
                    href="#"
                    @click.prevent="exportJson('compact')"
                    :class="{ disabled: isExporting }"
                  >
                    <i class="fas fa-file-alt me-2"></i>Export JSON (Compact)
                  </a>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <a
                    class="dropdown-item"
                    href="#"
                    @click.prevent="showExportStats"
                    :class="{ disabled: isExporting }"
                  >
                    <i class="fas fa-chart-bar me-2"></i>Export Statistics
                  </a>
                </li>
              </ul>
            </div>
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
                <a href="#" @click.prevent="toggleSort('location')">
                  Location
                  <i
                    v-if="sortCol === 'location'"
                    :class="sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
                  ></i>
                </a>
              </th>
              <th class="align-middle">
                <a href="#" @click.prevent="toggleSort('category')">
                  Category
                  <i
                    v-if="sortCol === 'category'"
                    :class="sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
                  ></i>
                </a>
              </th>
              <th class="align-middle">Question</th>
              <th class="align-middle">Answer Preview</th>
              <th class="align-middle">Media</th>
              <th class="align-middle">Links</th>
              <th class="align-middle text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="tours.length === 0">
              <td colspan="8" class="text-center">No tours found</td>
            </tr>
            <tr v-else v-for="(tour, index) in tours" :key="tour.id">
              <td class="align-middle ps-0">
                {{ (paginationData.page_no - 1) * perPage + index + 1 }}
              </td>
              <td class="align-middle">
                <span class="badge bg-info">{{ tour.location }}</span>
              </td>
              <td class="align-middle">
                <span class="badge bg-secondary">{{ tour.category }}</span>
              </td>
              <td class="align-middle">
                <div class="question-preview">
                  {{ truncateText(tour.question, 50) }}
                </div>
              </td>
              <td class="align-middle">
                <div class="answer-preview">
                  {{ truncateText(tour.answer, 50) }}
                </div>
              </td>
              <td class="align-middle">
                <span v-if="tour.media && tour.media.length > 0" class="badge bg-success">
                  {{ tour.media.length }} item(s)
                </span>
                <span v-else class="text-muted">No media</span>
              </td>
              <td class="align-middle">
                <span v-if="tour.links && tour.links.length > 0" class="badge bg-primary">
                  {{ tour.links.length }} link(s)
                </span>
                <span v-else class="text-muted">No links</span>
              </td>
              <td class="align-middle text-end">
                <button
                  class="btn btn-sm btn-info me-1"
                  @click="viewTour(tour)"
                  title="View Details"
                >
                  <span class="fas fa-eye"></span>
                </button>
                <button class="btn btn-sm btn-primary me-1" @click="editTour(tour.id)">
                  <span class="fas fa-edit"></span>
                </button>
                <button class="btn btn-sm btn-danger" @click="deleteTour(tour.id)">
                  <span class="fas fa-trash"></span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <pagination
          v-if="!isLoading && tours.length > 0"
          :current-page="paginationData.page_no"
          :last-page="paginationData.total_page"
          :first-item="(paginationData.page_no - 1) * paginationData.per_page + 1"
          :last-item="
            Math.min(
              paginationData.page_no * paginationData.per_page,
              paginationData.total
            )
          "
          :total="paginationData.total"
          @page-changed="changePage"
        />
      </div>
    </div>
  </div>

  <!-- Create/Edit Modal -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal-content tour-form">
      <h4>{{ isEditMode ? "Edit" : "Create" }} Tour</h4>
      <div v-if="modalError" class="alert alert-danger">
        {{ modalError }}
      </div>
      <button class="btn-close" @click="closeModal"></button>
      <form class="row g-3 needs-validation" novalidate @submit.prevent="handleSubmit">
        <!-- Location Input -->
        <div class="col-md-6">
          <label class="form-label" for="location">Location</label>
          <input
            v-model="tourForm.location"
            class="form-control"
            id="location"
            type="text"
            required
            placeholder="e.g., Siem Reap"
          />
          <div class="invalid-feedback">Location is required</div>
        </div>

        <!-- Category Input -->
        <div class="col-md-6">
          <label class="form-label" for="category">Category</label>
          <input
            v-model="tourForm.category"
            class="form-control"
            id="category"
            type="text"
            required
            placeholder="e.g., tours, temples, nightlife"
          />
          <div class="invalid-feedback">Category is required</div>
        </div>

        <!-- Question Input -->
        <div class="col-md-12">
          <label class="form-label" for="question">Question</label>
          <textarea
            v-model="tourForm.question"
            class="form-control"
            id="question"
            rows="2"
            required
            placeholder="Enter the question about this tour..."
          ></textarea>
          <div class="invalid-feedback">Question is required</div>
        </div>

        <!-- Answer Input -->
        <div class="col-md-12">
          <label class="form-label" for="answer">Answer</label>
          <textarea
            v-model="tourForm.answer"
            class="form-control"
            id="answer"
            rows="6"
            required
            placeholder="Enter the detailed answer..."
          ></textarea>
          <div class="invalid-feedback">Answer is required</div>
        </div>

        <!-- Media Section -->
        <div class="col-md-12">
          <label class="form-label">Media</label>
          <div
            v-for="(media, index) in tourForm.media"
            :key="index"
            class="media-item mb-3 p-3 border rounded"
          >
            <div class="row g-2">
              <div class="col-md-3">
                <select v-model="media.type" class="form-select" required>
                  <option value="">Select Type</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div class="col-md-5">
                <input
                  v-model="media.url"
                  class="form-control"
                  type="text"
                  placeholder="Media URL"
                  required
                />
              </div>
              <div class="col-md-3">
                <input
                  v-model="media.caption"
                  class="form-control"
                  type="text"
                  placeholder="Caption (optional)"
                />
              </div>
              <div class="col-md-1">
                <button
                  type="button"
                  class="btn btn-danger btn-sm"
                  @click="removeMedia(index)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
          <button type="button" class="btn btn-outline-primary btn-sm" @click="addMedia">
            <i class="fas fa-plus me-1"></i>Add Media
          </button>
        </div>

        <!-- Links Section -->
        <div class="col-md-12">
          <label class="form-label">Links</label>
          <div
            v-for="(link, index) in tourForm.links"
            :key="index"
            class="link-item mb-3 p-3 border rounded"
          >
            <div class="row g-2">
              <div class="col-md-5">
                <input
                  v-model="link.title"
                  class="form-control"
                  type="text"
                  placeholder="Link Title"
                  required
                />
              </div>
              <div class="col-md-6">
                <input
                  v-model="link.url"
                  class="form-control"
                  type="url"
                  placeholder="https://example.com"
                  required
                />
              </div>
              <div class="col-md-1">
                <button
                  type="button"
                  class="btn btn-danger btn-sm"
                  @click="removeLink(index)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
          <button type="button" class="btn btn-outline-primary btn-sm" @click="addLink">
            <i class="fas fa-plus me-1"></i>Add Link
          </button>
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

  <!-- View Modal -->
  <div v-if="showViewModal" class="modal-overlay">
    <div class="modal-content view-tour">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4>Tour Details</h4>
        <button class="btn-close" @click="closeViewModal"></button>
      </div>
      <div v-if="selectedTour">
        <div class="row mb-3">
          <div class="col-md-6">
            <strong>Location:</strong>
            <span class="badge bg-info ms-2">{{ selectedTour.location }}</span>
          </div>
          <div class="col-md-6">
            <strong>Category:</strong>
            <span class="badge bg-secondary ms-2">{{ selectedTour.category }}</span>
          </div>
        </div>

        <div class="mb-3">
          <strong>Question:</strong>
          <p class="mt-2">{{ selectedTour.question }}</p>
        </div>

        <div class="mb-3">
          <strong>Answer:</strong>
          <p class="mt-2">{{ selectedTour.answer }}</p>
        </div>

        <div v-if="selectedTour.media && selectedTour.media.length > 0" class="mb-3">
          <strong>Media:</strong>
          <div class="media-list mt-2">
            <div
              v-for="(media, index) in selectedTour.media"
              :key="index"
              class="media-item p-2 border rounded mb-2"
            >
              <div class="d-flex align-items-center">
                <span class="badge bg-primary me-2">{{ media.type }}</span>
                <a
                  :href="media.url"
                  target="_blank"
                  class="text-decoration-none me-auto"
                  >{{ media.url }}</a
                >
              </div>
              <div v-if="media.caption" class="mt-1 text-muted small">
                {{ media.caption }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="selectedTour.links && selectedTour.links.length > 0" class="mb-3">
          <strong>Links:</strong>
          <div class="links-list mt-2">
            <div
              v-for="(link, index) in selectedTour.links"
              :key="index"
              class="link-item p-2 border rounded mb-2"
            >
              <a :href="link.url" target="_blank" class="text-decoration-none">{{
                link.title
              }}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Export Statistics Modal -->
  <div v-if="showStatsModal" class="modal-overlay">
    <div class="modal-content stats-modal">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4>Export Statistics</h4>
        <button class="btn-close" @click="closeStatsModal"></button>
      </div>
      <div v-if="exportStats">
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="stat-card">
              <div class="stat-number">{{ exportStats.total_tours }}</div>
              <div class="stat-label">Total Tours</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card">
              <div class="stat-number">{{ exportStats.locations }}</div>
              <div class="stat-label">Locations</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card">
              <div class="stat-number">{{ exportStats.categories }}</div>
              <div class="stat-label">Categories</div>
            </div>
          </div>
        </div>

        <div class="row mb-4">
          <div class="col-md-6">
            <h6>Tours by Location</h6>
            <div class="stats-list">
              <div
                v-for="(count, location) in exportStats.tours_by_location"
                :key="location"
                class="stats-item"
              >
                <span class="badge bg-info me-2">{{ location }}</span>
                <span>{{ count }} tours</span>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <h6>Tours by Category</h6>
            <div class="stats-list">
              <div
                v-for="(count, category) in exportStats.tours_by_category"
                :key="category"
                class="stats-item"
              >
                <span class="badge bg-secondary me-2">{{ category }}</span>
                <span>{{ count }} tours</span>
              </div>
            </div>
          </div>
        </div>

        <div class="row" v-if="exportStats.latest_tour || exportStats.oldest_tour">
          <div class="col-md-6" v-if="exportStats.latest_tour">
            <h6>Latest Tour</h6>
            <div class="info-card">
              <div><strong>ID:</strong> {{ exportStats.latest_tour.id }}</div>
              <div><strong>Location:</strong> {{ exportStats.latest_tour.location }}</div>
              <div>
                <strong>Created:</strong>
                {{ new Date(exportStats.latest_tour.created_at).toLocaleDateString() }}
              </div>
            </div>
          </div>
          <div class="col-md-6" v-if="exportStats.oldest_tour">
            <h6>Oldest Tour</h6>
            <div class="info-card">
              <div><strong>ID:</strong> {{ exportStats.oldest_tour.id }}</div>
              <div><strong>Location:</strong> {{ exportStats.oldest_tour.location }}</div>
              <div>
                <strong>Created:</strong>
                {{ new Date(exportStats.oldest_tour.created_at).toLocaleDateString() }}
              </div>
            </div>
          </div>
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
import Pagination from "@/components/layouts/Pagination.vue";
import { useToast } from "@/composables/useToast";
import { useGlobalStore } from "@/stores/global";
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

const { toasts, showNotification, removeToast } = useToast();
const router = useRouter();
const globalStore = useGlobalStore();

// Data refs
const tours = ref([]);
const isLoading = ref(false);
const error = ref(null);
const perPage = ref(15);
const sortCol = ref("id");
const sortDir = ref("desc");

// Pagination data structure matching your API response
const paginationData = reactive({
  per_page: 10,
  total: 0,
  total_page: 1,
  page_no: 1,
});

// Search and filter
const searchQuery = ref("");
const selectedLocation = ref("");
const selectedCategory = ref("");
let searchTimeout = null;

// Modal states
const showModal = ref(false);
const showViewModal = ref(false);
const showStatsModal = ref(false);
const isEditMode = ref(false);
const currentTourId = ref(null);
const isSubmitting = ref(false);
const modalError = ref("");
const selectedTour = ref(null);
const exportStats = ref(null);
const isExporting = ref(false);

// Form data
const tourForm = reactive({
  location: "",
  category: "",
  question: "",
  answer: "",
  media: [],
  links: [],
});

// Confirmation modal
const confirmationModal = reactive({
  show: false,
  title: "Confirm Action",
  message: "Are you sure you want to proceed?",
  action: null,
  actionParams: null,
});

// Computed properties
const uniqueLocations = computed(() => {
  const locations = tours.value.map((tour) => tour.location);
  return [...new Set(locations)].sort();
});

const uniqueCategories = computed(() => {
  const categories = tours.value.map((tour) => tour.category);
  return [...new Set(categories)].sort();
});

// Utility functions
const truncateText = (text, maxLength) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

// Search and filtering
const handleSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    handleSearch();
  }, 500);
};

const handleSearch = async () => {
  paginationData.page_no = 1;
  await getTours(1);
};

const toggleSort = async (column) => {
  if (sortCol.value === column) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortCol.value = column;
    sortDir.value = "asc";
  }
  await getTours(1);
};

const changePage = async (page) => {
  await getTours(page);
};

// API calls
const getTours = async (page = 1) => {
  isLoading.value = true;
  error.value = null;
  try {
    const params = new URLSearchParams({
      page: page,
      per_page: perPage.value,
      sort_col: sortCol.value,
      sort_dir: sortDir.value,
    });

    if (searchQuery.value) params.append("search", searchQuery.value);
    if (selectedLocation.value) params.append("location", selectedLocation.value);
    if (selectedCategory.value) params.append("category", selectedCategory.value);

    const url = `/api/tours?${params.toString()}`;
    const res = await axios.get(url, globalStore.getAxiosHeader());

    if (res.data.status === "OK") {
      tours.value = res.data.data;
      // Update pagination data to match your API structure
      paginationData.per_page = res.data.per_page;
      paginationData.total = res.data.total;
      paginationData.total_page = res.data.total_page;
      paginationData.page_no = res.data.page_no;
      return true;
    } else {
      error.value = res.data.message || "Failed to fetch tours";
      return false;
    }
  } catch (err) {
    error.value = err.message || "An error occurred while fetching tours";
    await globalStore.onCheckError(err, router);
    return false;
  } finally {
    isLoading.value = false;
  }
};

// Modal functions
const openCreateModal = () => {
  isEditMode.value = false;
  currentTourId.value = null;
  resetTourForm();
  modalError.value = "";
  showModal.value = true;
};

const viewTour = (tour) => {
  selectedTour.value = tour;
  showViewModal.value = true;
};

const closeViewModal = () => {
  showViewModal.value = false;
  selectedTour.value = null;
};

const editTour = async (tourId) => {
  isLoading.value = true;
  try {
    const res = await axios.get(`/api/tours/${tourId}`, globalStore.getAxiosHeader());
    if (res.data.status === "OK" && !res.data.error) {
      const tour = res.data.data;
      currentTourId.value = tourId;
      tourForm.location = tour.location || "";
      tourForm.category = tour.category || "";
      tourForm.question = tour.question || "";
      tourForm.answer = tour.answer || "";
      tourForm.media = tour.media || [];
      tourForm.links = tour.links || [];
      isEditMode.value = true;
      showModal.value = true;
    } else {
      showNotification("error", "Error", "Failed to fetch tour details");
    }
  } catch (err) {
    console.error("Error fetching tour:", err);
    showNotification("error", "Error", "Failed to fetch tour details");
  } finally {
    isLoading.value = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  modalError.value = "";
};

const resetTourForm = () => {
  tourForm.location = "";
  tourForm.category = "";
  tourForm.question = "";
  tourForm.answer = "";
  tourForm.media = [];
  tourForm.links = [];
};

// Media and links management
const addMedia = () => {
  tourForm.media.push({
    type: "",
    url: "",
    caption: "",
  });
};

const removeMedia = (index) => {
  tourForm.media.splice(index, 1);
};

const addLink = () => {
  tourForm.links.push({
    title: "",
    url: "",
  });
};

const removeLink = (index) => {
  tourForm.links.splice(index, 1);
};

// Form submission
const handleSubmit = async (event) => {
  event.preventDefault();
  if (!event.target.checkValidity()) {
    event.stopPropagation();
    event.target.classList.add("was-validated");
    return;
  }

  if (!tourForm.location.trim()) {
    modalError.value = "Location is required";
    return;
  }
  if (!tourForm.category.trim()) {
    modalError.value = "Category is required";
    return;
  }
  if (!tourForm.question.trim()) {
    modalError.value = "Question is required";
    return;
  }
  if (!tourForm.answer.trim()) {
    modalError.value = "Answer is required";
    return;
  }

  if (isEditMode.value) {
    await updateTour();
  } else {
    await createTour();
  }
};

const createTour = async () => {
  isSubmitting.value = true;
  modalError.value = "";
  try {
    const tourData = {
      location: tourForm.location.trim(),
      category: tourForm.category.trim(),
      question: tourForm.question.trim(),
      answer: tourForm.answer.trim(),
      media: tourForm.media.filter((m) => m.type && m.url),
      links: tourForm.links.filter((l) => l.title && l.url),
    };

    const res = await axios.post("/api/tours", tourData, globalStore.getAxiosHeader());
    if (res.data.status === "OK" && !res.data.error) {
      await getTours(paginationData.page_no);
      closeModal();
      showNotification("success", "Success", "Tour created successfully!");
    } else {
      modalError.value = res.data.message || "Failed to create tour";
    }
  } catch (error) {
    console.error("Error creating tour:", error);
    if (error.response && error.response.data) {
      modalError.value =
        error.response.data.message || "An error occurred while creating the tour.";
    } else {
      modalError.value = "An error occurred while creating the tour.";
    }
    await globalStore.onCheckError(error, router);
  } finally {
    isSubmitting.value = false;
  }
};

const updateTour = async () => {
  isSubmitting.value = true;
  modalError.value = "";
  try {
    const tourData = {
      location: tourForm.location.trim(),
      category: tourForm.category.trim(),
      question: tourForm.question.trim(),
      answer: tourForm.answer.trim(),
      media: tourForm.media.filter((m) => m.type && m.url),
      links: tourForm.links.filter((l) => l.title && l.url),
    };

    const res = await axios.put(
      `/api/tours/${currentTourId.value}`,
      tourData,
      globalStore.getAxiosHeader()
    );
    if (res.data.status === "OK" && !res.data.error) {
      await getTours(paginationData.page_no);
      closeModal();
      showNotification("success", "Success", "Tour updated successfully!");
    } else {
      modalError.value = res.data.message || "Failed to update tour";
    }
  } catch (error) {
    console.error("Error updating tour:", error);
    if (error.response && error.response.data) {
      modalError.value =
        error.response.data.message || "An error occurred while updating the tour.";
    } else {
      modalError.value = "An error occurred while updating the tour.";
    }
    await globalStore.onCheckError(error, router);
  } finally {
    isSubmitting.value = false;
  }
};

// Confirmation modal functions
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

// Delete functionality
const performDeleteTour = async (id) => {
  try {
    const res = await axios.delete(`/api/tours/${id}`, globalStore.getAxiosHeader());
    if (res.data.status === "OK" && !res.data.error) {
      if (tours.value.length === 1 && paginationData.page_no > 1) {
        await getTours(paginationData.page_no - 1);
      } else {
        await getTours(paginationData.page_no);
      }
      showNotification("success", "Success", "Tour deleted successfully!");
    } else {
      showNotification("error", "Error", res.data.message || "Failed to delete tour");
    }
  } catch (err) {
    showNotification("error", "Error", "An error occurred while deleting the tour");
    console.error("Error deleting tour:", err);
    await globalStore.onCheckError(err, router);
  }
};

const deleteTour = (id) => {
  showConfirmation(
    "Delete Tour",
    "Are you sure you want to delete this tour?",
    performDeleteTour,
    id
  );
};

// Export functions
const exportJson = async (format = "pretty") => {
  isExporting.value = true;
  try {
    // Use the data endpoint instead of direct file download
    const params = new URLSearchParams();

    // Add current filters to export
    if (searchQuery.value) params.append("search", searchQuery.value);
    if (selectedLocation.value) params.append("location", selectedLocation.value);
    if (selectedCategory.value) params.append("category", selectedCategory.value);

    const response = await axios.get(
      `/api/tours/export/data?${params.toString()}`,
      globalStore.getAxiosHeader()
    );

    if (response.data.status) {
      // Create JSON string with proper formatting
      const jsonString =
        format === "pretty"
          ? JSON.stringify(response.data.data, null, 2)
          : JSON.stringify(response.data.data);

      // Create blob and download
      const blob = new Blob([jsonString], {
        type: "application/json;charset=utf-8",
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      // Generate filename with timestamp
      const now = new Date();
      const timestamp =
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(now.getDate()).padStart(2, "0") +
        "_" +
        String(now.getHours()).padStart(2, "0") +
        "-" +
        String(now.getMinutes()).padStart(2, "0") +
        "-" +
        String(now.getSeconds()).padStart(2, "0");

      link.download = `tours_export_${format}_${timestamp}.json`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      window.URL.revokeObjectURL(downloadUrl);

      showNotification("success", "Success", `JSON export downloaded (${format} format)`);
    } else {
      showNotification(
        "error",
        "Error",
        response.data.message || "Failed to get export data"
      );
    }
  } catch (error) {
    console.error("Export error:", error);
    showNotification(
      "error",
      "Error",
      "Failed to export data: " + (error.response?.data?.message || error.message)
    );
  } finally {
    isExporting.value = false;
  }
};
const showExportStats = async () => {
  try {
    const res = await axios.get("/api/tours/export/stats", globalStore.getAxiosHeader());
    if (res.data.status === "OK" && !res.data.error) {
      exportStats.value = res.data.data;
      showStatsModal.value = true;
    } else {
      showNotification("error", "Error", "Failed to load export statistics");
    }
  } catch (error) {
    console.error("Stats error:", error);
    showNotification("error", "Error", "Failed to load export statistics");
  }
};

const closeStatsModal = () => {
  showStatsModal.value = false;
  exportStats.value = null;
};

// Lifecycle
onMounted(async () => {
  await getTours(1);
});
</script>

<style scoped>
.question-preview,
.answer-preview {
  max-width: 200px;
  word-wrap: break-word;
}

.media-item,
.link-item {
  background-color: #f8f9fa;
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
  z-index: 1000;
}

.modal-content {
  top: 50px;
  width: 100%;
  left: 100px;
  max-width: 1100px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
  background-color: white;
  border-radius: 0.5rem;
  margin: auto;
}

.view-tour {
  max-width: 700px;
}

.tour-form .form-label {
  font-weight: 500;
}

.btn-close {
  background: url("https://static.thenounproject.com/png/636011-200.png") no-repeat center;
  background-size: 16px 16px;
  border: none;
  width: 44px;
  height: 44px;
  cursor: pointer;
  padding: 0;
  border: 2px solid #004499;
}

/* Sortable columns */
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

/* Toast animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Media queries for responsive design */
@media (max-width: 992px) {
  .modal-content {
    width: 95%;
    padding: 1.5rem;
  }

  .question-preview,
  .answer-preview {
    max-width: 150px;
  }
}

@media (max-width: 768px) {
  .modal-content {
    width: 98%;
    padding: 1rem;
  }

  .table-responsive {
    font-size: 0.875rem;
  }

  .question-preview,
  .answer-preview {
    max-width: 100px;
  }
}

@media (max-height: 800px) {
  .modal-overlay {
    align-items: flex-start;
    padding: 20px 0;
  }
}

/* Custom badge styles */
.badge {
  font-size: 0.75rem;
}

/* Stats modal styles */
.stats-modal {
  max-width: 800px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 1rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-top: 0.5rem;
}

.stats-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 0.5rem;
}

.stats-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.stats-item:last-child {
  border-bottom: none;
}

.info-card {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 1rem;
}

.info-card div {
  margin-bottom: 0.5rem;
}

.info-card div:last-child {
  margin-bottom: 0;
}

/* Media and link items styling */
.media-list .media-item,
.links-list .link-item {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
}

.media-list a,
.links-list a {
  color: #0066cc;
}

.media-list a:hover,
.links-list a:hover {
  color: #004499;
  text-decoration: underline;
}
</style>
