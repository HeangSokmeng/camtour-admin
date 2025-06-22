<template>
  <div class="mb-9">
    <div class="row g-2 mb-4">
      <div class="col-auto">
        <h2 class="mb-0">Travel Activities</h2>
      </div>
    </div>
    <div id="travel-activities">
      <div class="mb-4">
        <div class="row g-3 justify-content-between">
          <div class="col-auto">
            <div class="search-box">
              <input
                v-model="searchQuery"
                class="form-control search-input search"
                type="search"
                placeholder="Search activities"
              />
            </div>
          </div>
          <div class="col-auto">
            <button class="btn btn-primary" @click="openModal">
              <span class="fas fa-plus me-2"></span>Add Activity
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
              <th class="align-middle">Title</th>
              <th class="align-middle">Duration</th>
              <th class="align-middle">Difficulty</th>
              <th class="align-middle">Price</th>
              <th class="align-middle">Location</th>
              <th class="align-middle">Status</th>
              <th class="align-middle text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredActivities.length === 0">
              <td colspan="9" class="text-center">No activities found</td>
            </tr>
            <tr v-else v-for="(activity, index) in filteredActivities" :key="activity.id">
              <td class="align-middle ps-0">{{ getItemNumber(index) }}</td>
              <td class="align-middle">
                <div class="activity-image">
                  <img
                    v-if="activity.image"
                    :src="activity.image"
                    :alt="activity.title"
                    class="img-thumbnail"
                  />
                  <span v-else class="no-image">No Image</span>
                </div>
              </td>
              <td class="align-middle">
                <div class="fw-semibold">{{ activity.title }}</div>
                <div class="text-muted small">
                  {{ truncateText(activity.description || "No description", 50) }}
                </div>
              </td>
              <td class="align-middle">{{ activity.duration_hours }}h</td>
              <td class="align-middle">
                <span
                  class="badge"
                  :class="getDifficultyBadgeClass(activity.difficulty_level)"
                >
                  {{ activity.difficulty_level }}
                </span>
              </td>
              <td class="align-middle">${{ activity.price_per_person }}</td>
              <td class="align-middle">
                {{ getLocationName(activity.location_id) }}
              </td>
              <td class="align-middle">
                <span
                  class="badge"
                  :class="activity.is_active ? 'bg-success' : 'bg-secondary'"
                >
                  {{ activity.is_active ? "Active" : "Inactive" }}
                </span>
              </td>
              <td class="align-middle text-end">
                <button
                  class="btn btn-sm btn-primary me-2"
                  @click="editActivity(activity.id)"
                >
                  <span class="fas fa-edit me-1"></span>Edit
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  @click="deleteActivity(activity.id)"
                >
                  <span class="fas fa-trash me-1"></span>Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Section -->
        <div v-if="state.pagination.total > 0" class="row g-3 align-items-center mt-3">
          <!-- Per Page Selector -->
          <div class="col-auto">
            <div class="d-flex align-items-center">
              <label class="form-label mb-0 me-2">Show:</label>
              <select
                v-model="selectedPerPage"
                class="form-select form-select-sm"
                style="width: auto"
                @change="changePerPage"
              >
                <option v-for="option in perPageOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
              <span class="ms-2 text-muted">entries</span>
            </div>
          </div>

          <!-- Pagination Info -->
          <div class="col">
            <div class="text-muted small">
              Showing {{ state.pagination.first_item }} to
              {{ state.pagination.last_item }} of {{ state.pagination.total }} entries
              <span v-if="searchQuery"
                >(filtered from {{ state.pagination.total }} total entries)</span
              >
            </div>
          </div>

          <!-- Pagination Controls -->
          <div class="col-auto">
            <nav aria-label="Activities pagination">
              <ul class="pagination pagination-sm mb-0">
                <!-- Previous Button -->
                <li class="page-item" :class="{ disabled: currentPage <= 1 }">
                  <button
                    class="page-link"
                    @click="goToPage(currentPage - 1)"
                    :disabled="currentPage <= 1"
                    aria-label="Previous"
                  >
                    <span aria-hidden="true">&laquo;</span>
                  </button>
                </li>

                <!-- Page Numbers -->
                <li
                  v-for="page in visiblePages"
                  :key="page"
                  class="page-item"
                  :class="{ active: page === currentPage }"
                >
                  <button class="page-link" @click="goToPage(page)">
                    {{ page }}
                  </button>
                </li>

                <!-- Next Button -->
                <li
                  class="page-item"
                  :class="{ disabled: currentPage >= state.pagination.last_page }"
                >
                  <button
                    class="page-link"
                    @click="goToPage(currentPage + 1)"
                    :disabled="currentPage >= state.pagination.last_page"
                    aria-label="Next"
                  >
                    <span aria-hidden="true">&raquo;</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="showModal" class="modal-overlay" @click="closeModal">
    <div class="modal-content activity-form" @click.stop>
      <h4>{{ isEditMode ? "Edit" : "Create" }} Travel Activity</h4>
      <div v-if="modalMessage" class="alert alert-danger">
        {{ modalMessage }}
      </div>

      <form class="row g-3 needs-validation" novalidate @submit.prevent="handleSubmit">
        <!-- Activity Information -->
        <div class="col-md-6">
          <label class="form-label" for="activityTitle">Activity Title</label>
          <div class="input-group">
            <select
              v-model="newActivity.title"
              class="form-select"
              id="activityTitleSelect"
              @change="onSelectChange('title')"
            >
              <option value="">Choose from existing or type new...</option>
              <option
                v-for="option in activityOptions.titles"
                :key="option"
                :value="option"
              >
                {{ option }}
              </option>
            </select>
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="toggleCustomInput('title')"
            >
              <i class="fas fa-edit"></i>
            </button>
          </div>
          <input
            v-if="customInputs.title"
            v-model="newActivity.title"
            class="form-control mt-2"
            id="activityTitle"
            type="text"
            placeholder="Enter custom activity title..."
            required
          />
          <div class="invalid-feedback">Activity title is required</div>
        </div>

        <div class="col-md-6">
          <label class="form-label" for="activityImage">Activity Image</label>
          <input
            ref="imageInput"
            class="form-control"
            id="activityImage"
            type="file"
            accept="image/*"
            @change="handleImageChange"
          />
          <div class="invalid-feedback">Valid image file is required</div>
          <div v-if="imagePreview" class="mt-2">
            <img
              :src="imagePreview"
              alt="Preview"
              class="img-thumbnail"
              style="max-width: 100px; max-height: 100px"
            />
          </div>
        </div>

        <div class="col-md-12">
          <label class="form-label" for="activityDescription">Description</label>
          <div class="input-group">
            <select
              v-model="newActivity.description"
              class="form-select"
              id="activityDescriptionSelect"
              @change="onSelectChange('description')"
            >
              <option value="">Choose from existing or type new...</option>
              <option
                v-for="option in activityOptions.descriptions"
                :key="option"
                :value="option"
              >
                {{ truncateText(option, 60) }}
              </option>
            </select>
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="toggleCustomInput('description')"
            >
              <i class="fas fa-edit"></i>
            </button>
          </div>
          <textarea
            v-if="customInputs.description"
            v-model="newActivity.description"
            class="form-control mt-2"
            id="activityDescription"
            rows="3"
            placeholder="Enter custom description..."
            required
          ></textarea>
          <div class="invalid-feedback">Description is required</div>
        </div>

        <div class="col-md-4">
          <label class="form-label" for="activityDuration">Duration (hours)</label>
          <div class="input-group">
            <select
              v-model="newActivity.duration_hours"
              class="form-select"
              id="activityDurationSelect"
              @change="onSelectChange('duration')"
            >
              <option value="">Choose from existing or type new...</option>
              <option
                v-for="option in activityOptions.durations"
                :key="option"
                :value="option"
              >
                {{ option }} hours
              </option>
            </select>
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="toggleCustomInput('duration')"
            >
              <i class="fas fa-edit"></i>
            </button>
          </div>
          <input
            v-if="customInputs.duration"
            v-model.number="newActivity.duration_hours"
            class="form-control mt-2"
            id="activityDuration"
            type="number"
            min="1"
            placeholder="Enter custom duration..."
            required
          />
          <div class="invalid-feedback">Duration is required (minimum 1 hour)</div>
        </div>

        <div class="col-md-4">
          <label class="form-label" for="activityDifficulty">Difficulty Level</label>
          <select
            v-model="newActivity.difficulty_level"
            class="form-select"
            id="activityDifficulty"
            required
          >
            <option value="" disabled>Select difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Moderate">Moderate</option>
            <option value="Hard">Hard</option>
          </select>
          <div class="invalid-feedback">Difficulty level is required</div>
        </div>

        <div class="col-md-4">
          <label class="form-label" for="activityPrice">Price per Person ($)</label>
          <div class="input-group">
            <select
              v-model="newActivity.price_per_person"
              class="form-select"
              id="activityPriceSelect"
              @change="onSelectChange('price')"
            >
              <option value="">Choose from existing or type new...</option>
              <option
                v-for="option in activityOptions.prices"
                :key="option"
                :value="option"
              >
                ${{ option }}
              </option>
            </select>
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="toggleCustomInput('price')"
            >
              <i class="fas fa-edit"></i>
            </button>
          </div>
          <input
            v-if="customInputs.price"
            v-model.number="newActivity.price_per_person"
            class="form-control mt-2"
            id="activityPrice"
            type="number"
            min="0"
            step="0.01"
            placeholder="Enter custom price..."
            required
          />
          <div class="invalid-feedback">Price is required</div>
        </div>

        <!-- Location Selection -->
        <div class="col-md-6">
          <label class="form-label" for="locationId">Location</label>
          <select
            v-model="newActivity.location_id"
            class="form-select"
            id="locationId"
            required
          >
            <option value="" disabled>Select a location</option>
            <option v-for="location in locations" :key="location.id" :value="location.id">
              {{ location.name }}, {{ location.city }}
            </option>
          </select>
          <div class="invalid-feedback">Location is required</div>
        </div>

        <div class="col-md-6">
          <label class="form-label" for="maxParticipants"
            >Max Participants (optional)</label
          >
          <div class="input-group">
            <select
              v-model="newActivity.max_participants"
              class="form-select"
              id="maxParticipantsSelect"
              @change="onSelectChange('maxParticipants')"
            >
              <option value="">Choose from existing or type new...</option>
              <option
                v-for="option in activityOptions.maxParticipants"
                :key="option"
                :value="option"
              >
                {{ option }} people
              </option>
            </select>
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="toggleCustomInput('maxParticipants')"
            >
              <i class="fas fa-edit"></i>
            </button>
          </div>
          <input
            v-if="customInputs.maxParticipants"
            v-model.number="newActivity.max_participants"
            class="form-control mt-2"
            id="maxParticipants"
            type="number"
            min="1"
            placeholder="Enter custom max participants..."
          />
        </div>

        <!-- Included Items -->
        <div class="col-md-6">
          <label class="form-label m-lg-2" for="includedItems">Included Items</label>
          <div
            v-for="(item, index) in newActivity.included_items"
            :key="'included' + index"
            class="row g-2 mb-2"
          >
            <div class="col-10">
              <div class="input-group">
                <select
                  v-model="newActivity.included_items[index]"
                  class="form-select"
                  :id="'includedItemSelect' + index"
                  @change="onIncludedItemChange(index)"
                >
                  <option value="">Choose from existing or type new...</option>
                  <option
                    v-for="option in activityOptions.includedItems"
                    :key="option"
                    :value="option"
                  >
                    {{ option }}
                  </option>
                </select>
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="toggleIncludedCustomInput(index)"
                >
                  <i class="fas fa-edit"></i>
                </button>
              </div>
              <input
                v-if="includedCustomInputs[index]"
                v-model="newActivity.included_items[index]"
                type="text"
                class="form-control mt-2"
                :id="'includedItem' + index"
                placeholder="Enter custom included item..."
                required
              />
            </div>
            <div class="col-2">
              <button
                type="button"
                class="btn btn-danger w-100"
                @click="removeIncludedItem(index)"
              >
                <span class="fas fa-trash"></span>
              </button>
            </div>
          </div>
          <button
            type="button"
            class="btn btn-outline-primary mt-2"
            @click="addIncludedItem"
          >
            <span class="fas fa-plus me-1"></span>Add Item
          </button>
        </div>

        <!-- Requirements -->
        <div class="col-md-6">
          <label class="form-label m-lg-2" for="requirements">Requirements</label>
          <div
            v-for="(requirement, index) in newActivity.requirements"
            :key="'requirement' + index"
            class="row g-2 mb-2"
          >
            <div class="col-10">
              <div class="input-group">
                <select
                  v-model="newActivity.requirements[index]"
                  class="form-select"
                  :id="'requirementSelect' + index"
                  @change="onRequirementChange(index)"
                >
                  <option value="">Choose from existing or type new...</option>
                  <option
                    v-for="option in activityOptions.requirements"
                    :key="option"
                    :value="option"
                  >
                    {{ option }}
                  </option>
                </select>
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="toggleRequirementCustomInput(index)"
                >
                  <i class="fas fa-edit"></i>
                </button>
              </div>
              <input
                v-if="requirementCustomInputs[index]"
                v-model="newActivity.requirements[index]"
                type="text"
                class="form-control mt-2"
                :id="'requirement' + index"
                placeholder="Enter custom requirement..."
                required
              />
            </div>
            <div class="col-2">
              <button
                type="button"
                class="btn btn-danger w-100"
                @click="removeRequirement(index)"
              >
                <span class="fas fa-trash"></span>
              </button>
            </div>
          </div>
          <button
            type="button"
            class="btn btn-outline-primary mt-2"
            @click="addRequirement"
          >
            <span class="fas fa-plus me-1"></span>Add Requirement
          </button>
        </div>

        <!-- Status -->
        <div class="col-md-12">
          <div class="form-check">
            <input
              v-model="newActivity.is_active"
              class="form-check-input"
              type="checkbox"
              id="isActive"
            />
            <label class="form-check-label" for="isActive"> Active </label>
          </div>
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
import { useToast } from "@/composables/useToast";
import { useGlobalStore } from "@/stores/global";
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";

const { toasts, showNotification, removeToast } = useToast();
const globalStore = useGlobalStore();

const state = reactive({
  activities: [],
  isLoading: false,
  error: null,
  pagination: {
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
    has_more_pages: false,
    first_item: 0,
    last_item: 0,
  },
});

const locations = ref([]);
const searchQuery = ref("");
const showModal = ref(false);
const isEditMode = ref(false);
const currentActivityId = ref(null);
const isSubmitting = ref(false);
const modalMessage = ref("");
const imagePreview = ref("");
const imageInput = ref(null);
const currentPage = ref(1);
const perPageOptions = [10, 25, 50, 100];
const selectedPerPage = ref(10);
const customInputs = ref({
  title: false,
  description: false,
  duration: false,
  price: false,
  maxParticipants: false,
});

const includedCustomInputs = ref({});
const requirementCustomInputs = ref({});
const activityOptions = ref({
  titles: [],
  descriptions: [],
  durations: [],
  prices: [],
  maxParticipants: [],
  includedItems: [],
  requirements: [],
});

const confirmationModal = reactive({
  show: false,
  title: "Confirm Action",
  message: "Are you sure you want to proceed?",
  action: null,
  actionParams: null,
});

const newActivity = reactive({
  title: "",
  description: "",
  duration_hours: 1,
  difficulty_level: "",
  price_per_person: 0,
  location_id: "",
  max_participants: null,
  included_items: [],
  requirements: [],
  is_active: true,
  image: null,
});

const filteredActivities = computed(() => {
  if (searchQuery.value.trim()) {
    return state.activities.filter(
      (activity) =>
        activity.title?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        (activity.description &&
          activity.description.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
        activity.difficulty_level?.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  return state.activities;
});

const visiblePages = computed(() => {
  const pages = [];
  const totalPages = state.pagination.last_page;
  const current = currentPage.value;

  if (totalPages > 0) pages.push(1);

  let startPage = Math.max(2, current - 2);
  let endPage = Math.min(totalPages - 1, current + 2);
  if (startPage > 2) {
    pages.push("...");
  }
  for (let i = startPage; i <= endPage; i++) {
    if (i !== 1 && i !== totalPages) {
      pages.push(i);
    }
  }
  if (endPage < totalPages - 1) {
    pages.push("...");
  }
  if (totalPages > 1) pages.push(totalPages);
  return pages;
});

const isValidId = (id) => {
  return (
    id !== null &&
    id !== undefined &&
    id !== "null" &&
    id !== "undefined" &&
    String(id).trim() !== ""
  );
};

const findById = (collection, id) => {
  if (!isValidId(id) || !collection || !collection.length) return null;
  const stringId = String(id);
  return collection.find((item) => String(item.id) === stringId);
};

const getLocationName = (locationId) => {
  if (!isValidId(locationId)) return "Unknown";
  const location = findById(locations.value, locationId);
  if (location) {
    return `${location.name}, ${location.city}`;
  }
  const activityWithThisLocation = state.activities.find(
    (a) => a.location_id === locationId || (a.location && a.location.id === locationId)
  );
  if (activityWithThisLocation && activityWithThisLocation.location) {
    return `${activityWithThisLocation.location.name}, ${activityWithThisLocation.location.city}`;
  }
  return "Unknown";
};

const getDifficultyBadgeClass = (difficulty) => {
  switch (difficulty) {
    case "Easy":
      return "bg-success";
    case "Moderate":
      return "bg-warning";
    case "Hard":
      return "bg-danger";
    default:
      return "bg-secondary";
  }
};

const truncateText = (text, maxLength) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const getItemNumber = (index) => {
  return (currentPage.value - 1) * selectedPerPage.value + index + 1;
};

const toggleCustomInput = (field) => {
  customInputs.value[field] = !customInputs.value[field];
};

const toggleIncludedCustomInput = (index) => {
  includedCustomInputs.value[index] = !includedCustomInputs.value[index];
};

const toggleRequirementCustomInput = (index) => {
  requirementCustomInputs.value[index] = !requirementCustomInputs.value[index];
};

const onSelectChange = (field) => {
  customInputs.value[field] = false;
};

const onIncludedItemChange = (index) => {
  includedCustomInputs.value[index] = false;
};

const onRequirementChange = (index) => {
  requirementCustomInputs.value[index] = false;
};

const handleImageChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    newActivity.image = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const addIncludedItem = () => {
  if (!Array.isArray(newActivity.included_items)) {
    newActivity.included_items = [];
  }
  newActivity.included_items.push("");
};

const removeIncludedItem = (index) => {
  if (Array.isArray(newActivity.included_items)) {
    newActivity.included_items.splice(index, 1);
    delete includedCustomInputs.value[index];
  }
};

const addRequirement = () => {
  if (!Array.isArray(newActivity.requirements)) {
    newActivity.requirements = [];
  }
  newActivity.requirements.push("");
};

const removeRequirement = (index) => {
  if (Array.isArray(newActivity.requirements)) {
    newActivity.requirements.splice(index, 1);
    delete requirementCustomInputs.value[index];
  }
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

const fetchActivities = async () => {
  state.isLoading = true;
  state.error = null;
  try {
    const res = await axios.get(
      "/api/locations/travel-activities",
      globalStore.getAxiosHeader()
    );
    if (res.data.result && Array.isArray(res.data.data)) {
      state.activities = res.data.data;
    } else {
      state.error = res.data.message || "Failed to fetch travel activities";
      console.error("API error when fetching activities:", res.data);
    }
  } catch (error) {
    console.error("Error fetching travel activities:", error);
    state.error = "An error occurred while fetching travel activities.";
    await globalStore.onCheckError(error);
  }
  state.isLoading = false;
};

const fetchLocations = async () => {
  try {
    const res = await axios.get("/api/locations", globalStore.getAxiosHeader());
    if (res.data.result && Array.isArray(res.data.data)) {
      locations.value = res.data.data;
    } else {
      console.error("Failed to fetch locations for activity selection:", res.data);
      showNotification("error", "Error", "Failed to fetch locations");
    }
  } catch (error) {
    console.error("Error fetching locations:", error);
    showNotification("error", "Error", "Failed to fetch locations");
    await globalStore.onCheckError(error);
  }
};

const fetchActivityOptions = async () => {
  try {
    const response = await axios.get(
      "/api/locations/travel-activities",
      globalStore.getAxiosHeader()
    );
    if (response.data.result && Array.isArray(response.data.data)) {
      const activities = response.data.data;
      const titles = [...new Set(activities.map((a) => a.title).filter(Boolean))].sort();
      const descriptions = [
        ...new Set(activities.map((a) => a.description).filter(Boolean)),
      ].sort();
      const durations = [
        ...new Set(activities.map((a) => a.duration_hours).filter(Boolean)),
      ].sort((a, b) => a - b);
      const prices = [
        ...new Set(activities.map((a) => parseFloat(a.price_per_person)).filter(Boolean)),
      ].sort((a, b) => a - b);
      const maxParticipants = [
        ...new Set(activities.map((a) => a.max_participants).filter(Boolean)),
      ].sort((a, b) => a - b);
      const allIncludedItems = [];
      activities.forEach((activity) => {
        if (activity.included_items) {
          let items;
          if (Array.isArray(activity.included_items)) {
            items = activity.included_items;
          } else if (typeof activity.included_items === "string") {
            try {
              items = JSON.parse(activity.included_items);
            } catch (e) {
              items = [];
            }
          }
          if (Array.isArray(items)) {
            allIncludedItems.push(...items.filter((item) => item && item.trim()));
          }
        }
      });
      const includedItems = [...new Set(allIncludedItems)].sort();
      const allRequirements = [];
      activities.forEach((activity) => {
        if (activity.requirements) {
          let requirements;
          if (Array.isArray(activity.requirements)) {
            requirements = activity.requirements;
          } else if (typeof activity.requirements === "string") {
            try {
              requirements = JSON.parse(activity.requirements);
            } catch (e) {
              requirements = [];
            }
          }
          if (Array.isArray(requirements)) {
            allRequirements.push(...requirements.filter((req) => req && req.trim()));
          }
        }
      });
      const requirements = [...new Set(allRequirements)].sort();
      activityOptions.value = {
        titles,
        descriptions,
        durations,
        prices,
        maxParticipants,
        includedItems,
        requirements,
      };
    }
    try {
      const optionsResponse = await axios.get(
        "/api/travel-activities/options",
        globalStore.getAxiosHeader()
      );
      if (optionsResponse.data.result && optionsResponse.data.data) {
        Object.keys(optionsResponse.data.data).forEach((key) => {
          if (
            optionsResponse.data.data[key] &&
            Array.isArray(optionsResponse.data.data[key])
          ) {
            const existing = activityOptions.value[key] || [];
            const newItems = optionsResponse.data.data[key];
            activityOptions.value[key] = [...new Set([...existing, ...newItems])].sort();
          }
        });
      }
    } catch (optionsError) {
      console.error("Error fetching options:", optionsError);
    }
  } catch (err) {
    console.error("Error fetching activity options:", err);
    activityOptions.value = {
      titles: ["Temple Tour", "Food Tour", "Cultural Workshop", "Bicycle Tour"],
      descriptions: [
        "Explore local culture",
        "Discover traditional cuisine",
        "Learn local crafts",
      ],
      durations: [1, 2, 3, 4, 5, 6, 8, 10, 12],
      prices: [15, 20, 25, 30, 40, 50, 75, 100, 150],
      maxParticipants: [2, 4, 6, 8, 10, 15, 20],
      includedItems: ["Transportation", "Guide", "Entrance fees", "Lunch", "Water"],
      requirements: ["Comfortable shoes", "Hat and sunscreen", "Camera", "Passport/ID"],
    };
  }
};

const createActivity = async () => {
  isSubmitting.value = true;
  modalMessage.value = "";
  try {
    const formData = new FormData();
    formData.append("title", newActivity.title);
    formData.append("description", newActivity.description || "");
    formData.append("duration_hours", newActivity.duration_hours);
    formData.append("difficulty_level", newActivity.difficulty_level || "");
    formData.append("price_per_person", newActivity.price_per_person || 0);
    formData.append("location_id", newActivity.location_id);
    formData.append("is_active", newActivity.is_active ? 1 : 0);
    if (newActivity.max_participants && newActivity.max_participants > 0) {
      formData.append("max_participants", newActivity.max_participants);
    }
    if (newActivity.image) {
      formData.append("image", newActivity.image);
    }
    if (!Array.isArray(newActivity.included_items)) {
      newActivity.included_items = [];
    }
    if (!Array.isArray(newActivity.requirements)) {
      newActivity.requirements = [];
    }
    const cleanedIncludedItems = newActivity.included_items.filter((item) => {
      const isValid =
        item !== null && item !== undefined && item !== "" && String(item).trim() !== "";
      return isValid;
    });
    const cleanedRequirements = newActivity.requirements.filter((req) => {
      const isValid =
        req !== null && req !== undefined && req !== "" && String(req).trim() !== "";
      return isValid;
    });
    if (cleanedIncludedItems.length > 0) {
      cleanedIncludedItems.forEach((item) => {
        formData.append("included_items[]", item);
      });
    } else {
      formData.append("included_items", JSON.stringify([]));
    }

    if (cleanedRequirements.length > 0) {
      cleanedRequirements.forEach((requirement) => {
        formData.append("requirements[]", requirement);
      });
    } else {
      formData.append("requirements", JSON.stringify([]));
    }
    const axiosConfig = { ...globalStore.getAxiosHeader() };
    delete axiosConfig.headers["Content-Type"];
    const res = await axios.post("/api/travel-activities", formData, axiosConfig);
    if (res.data.result) {
      await fetchActivities();
      await fetchActivityOptions();
      closeModal();
      resetActivityForm();
      showNotification("success", "Success", "Activity created successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to create activity";
    }
  } catch (error) {
    console.error("Error creating activity:", error);
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        modalMessage.value = error.response.data.message;
      } else if (error.response.data.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        modalMessage.value = errors.join("\n");
      } else {
        modalMessage.value = "An error occurred while creating the activity.";
      }
    } else {
      modalMessage.value = "An error occurred while creating the activity.";
    }
    await globalStore.onCheckError(error);
  }
  isSubmitting.value = false;
};

const updateActivity = async () => {
  if (!isValidId(currentActivityId.value)) {
    modalMessage.value = "Invalid activity ID. Cannot update activity.";
    console.error("Cannot update activity: invalid ID:", currentActivityId.value);
    return;
  }
  isSubmitting.value = true;
  modalMessage.value = "";
  try {
    const formData = new FormData();
    formData.append("title", newActivity.title);
    formData.append("description", newActivity.description || "");
    formData.append("duration_hours", newActivity.duration_hours);
    formData.append("difficulty_level", newActivity.difficulty_level || "");
    formData.append("price_per_person", newActivity.price_per_person || 0);
    formData.append("location_id", newActivity.location_id);
    formData.append("is_active", newActivity.is_active ? 1 : 0);
    formData.append("_method", "PUT");

    if (newActivity.max_participants && newActivity.max_participants > 0) {
      formData.append("max_participants", newActivity.max_participants);
    }
    if (newActivity.image) {
      formData.append("image", newActivity.image);
    }
    if (!Array.isArray(newActivity.included_items)) {
      newActivity.included_items = [];
    }
    if (!Array.isArray(newActivity.requirements)) {
      newActivity.requirements = [];
    }
    const cleanedIncludedItems = newActivity.included_items.filter((item) => {
      const isValid =
        item !== null && item !== undefined && item !== "" && String(item).trim() !== "";
      return isValid;
    });
    const cleanedRequirements = newActivity.requirements.filter((req) => {
      const isValid =
        req !== null && req !== undefined && req !== "" && String(req).trim() !== "";
      return isValid;
    });
    if (cleanedIncludedItems.length > 0) {
      cleanedIncludedItems.forEach((item) => {
        formData.append("included_items[]", item);
      });
    } else {
      formData.append("included_items", JSON.stringify([]));
    }
    if (cleanedRequirements.length > 0) {
      cleanedRequirements.forEach((requirement) => {
        formData.append("requirements[]", requirement);
      });
    } else {
      formData.append("requirements", JSON.stringify([]));
    }
    const axiosConfig = { ...globalStore.getAxiosHeader() };
    delete axiosConfig.headers["Content-Type"];
    const res = await axios.post(
      `/api/travel-activities/${currentActivityId.value}`,
      formData,
      axiosConfig
    );
    if (res.data.result) {
      await fetchActivities();
      await fetchActivityOptions();
      closeModal();
      resetActivityForm();
      showNotification("success", "Success", "Activity updated successfully!");
    } else {
      modalMessage.value = res.data.message || "Failed to update activity";
    }
  } catch (error) {
    console.error("Error updating activity:", error);
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        modalMessage.value = error.response.data.message;
      } else if (error.response.data.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        modalMessage.value = errors.join("\n");
      } else {
        modalMessage.value = "An error occurred while updating the activity.";
      }
    } else {
      modalMessage.value = "An error occurred while updating the activity.";
    }
    await globalStore.onCheckError(error);
  }
  isSubmitting.value = false;
};

const performDeleteActivity = async (activityId) => {
  if (!isValidId(activityId)) {
    console.error("Cannot delete activity: invalid ID:", activityId);
    showNotification("error", "Error", "Invalid activity ID provided");
    return;
  }
  try {
    const res = await axios.delete(
      `/api/travel-activities/${activityId}`,
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      state.activities = state.activities.filter(
        (a) => String(a.id) !== String(activityId)
      );
      await fetchActivities();
      showNotification("success", "Success", "Activity deleted successfully!");
    } else {
      showNotification("error", "Error", res.data.message || "Failed to delete activity");
    }
  } catch (error) {
    console.error("Error deleting activity:", error);
    showNotification("error", "Error", "An error occurred while deleting the activity.");
    await globalStore.onCheckError(error);
  }
};

const deleteActivity = (activityId) => {
  if (!isValidId(activityId)) {
    console.error("Cannot delete activity: invalid ID:", activityId);
    showNotification("error", "Error", "Invalid activity ID provided");
    return;
  }
  showConfirmation(
    "Delete Activity",
    "Are you sure you want to delete this activity?",
    performDeleteActivity,
    activityId
  );
};

const openModal = () => {
  resetActivityForm();
  isEditMode.value = false;
  showModal.value = true;
};

const editActivity = async (activityId) => {
  if (!isValidId(activityId)) {
    console.error("Invalid activity ID:", activityId);
    showNotification("error", "Error", "Invalid activity ID provided");
    return;
  }
  try {
    state.isLoading = true;
    const stringActivityId = String(activityId);
    let activity = state.activities.find((a) => String(a.id) === stringActivityId);
    if (!activity) {
      const response = await axios.get(
        `/api/travel-activities/${stringActivityId}`,
        globalStore.getAxiosHeader()
      );
      if (response.data.result && response.data.data) {
        activity = response.data.data;
      } else {
        showNotification("error", "Error", "Failed to fetch activity details");
        state.isLoading = false;
        return;
      }
    }
    Object.keys(customInputs.value).forEach((key) => {
      customInputs.value[key] = false;
    });
    includedCustomInputs.value = {};
    requirementCustomInputs.value = {};
    newActivity.title = activity.title || "";
    newActivity.description = activity.description || "";
    newActivity.duration_hours = activity.duration_hours || 1;
    newActivity.difficulty_level = activity.difficulty_level || "";
    newActivity.price_per_person = parseFloat(activity.price_per_person) || 0;
    newActivity.max_participants = activity.max_participants || null;
    if (activity.included_items) {
      if (Array.isArray(activity.included_items)) {
        newActivity.included_items = activity.included_items.filter(
          (item) => item !== null && item !== ""
        );
      } else if (typeof activity.included_items === "string") {
        try {
          const parsed = JSON.parse(activity.included_items);
          newActivity.included_items = Array.isArray(parsed)
            ? parsed.filter((item) => item !== null && item !== "")
            : [];
        } catch (e) {
          console.error("Error parsing included_items:", e);
          newActivity.included_items = [];
        }
      } else {
        newActivity.included_items = [];
      }
    } else {
      newActivity.included_items = [];
    }
    if (activity.requirements) {
      if (Array.isArray(activity.requirements)) {
        newActivity.requirements = activity.requirements.filter(
          (req) => req !== null && req !== ""
        );
      } else if (typeof activity.requirements === "string") {
        try {
          const parsed = JSON.parse(activity.requirements);
          newActivity.requirements = Array.isArray(parsed)
            ? parsed.filter((req) => req !== null && req !== "")
            : [];
        } catch (e) {
          console.error("Error parsing requirements:", e);
          newActivity.requirements = [];
        }
      } else {
        newActivity.requirements = [];
      }
    } else {
      newActivity.requirements = [];
    }
    newActivity.is_active = activity.is_active ?? true;
    newActivity.image = null;
    if (activity.location_id) {
      newActivity.location_id = String(activity.location_id);
    } else if (activity.location && activity.location.id) {
      newActivity.location_id = String(activity.location.id);
    } else {
      newActivity.location_id = "";
    }
    if (activity.image) {
      imagePreview.value = activity.image;
    }
    currentActivityId.value = stringActivityId;
    isEditMode.value = true;
    showModal.value = true;
  } catch (error) {
    console.error("Error fetching activity details:", error);
    showNotification(
      "error",
      "Error",
      "An error occurred while fetching activity details"
    );
    await globalStore.onCheckError(error);
  } finally {
    state.isLoading = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  resetActivityForm();
  modalMessage.value = "";
};

const resetActivityForm = () => {
  newActivity.title = "";
  newActivity.description = "";
  newActivity.duration_hours = 1;
  newActivity.difficulty_level = "";
  newActivity.price_per_person = 0;
  newActivity.location_id = "";
  newActivity.max_participants = null;
  newActivity.included_items = [];
  newActivity.requirements = [];
  newActivity.is_active = true;
  newActivity.image = null;
  currentActivityId.value = null;
  imagePreview.value = "";
  Object.keys(customInputs.value).forEach((key) => {
    customInputs.value[key] = false;
  });
  includedCustomInputs.value = {};
  requirementCustomInputs.value = {};

  if (imageInput.value) {
    imageInput.value.value = "";
  }
};

const handleSubmit = async (event) => {
  event.preventDefault();
  if (!event.target.checkValidity()) {
    event.stopPropagation();
    event.target.classList.add("was-validated");
    return;
  }
  if (!newActivity.title.trim()) {
    modalMessage.value = "Activity title is required";
    return;
  }
  if (!newActivity.description.trim()) {
    modalMessage.value = "Description is required";
    return;
  }
  if (!newActivity.location_id) {
    modalMessage.value = "Location is required";
    return;
  }
  if (isEditMode.value) {
    await updateActivity();
  } else {
    await createActivity();
  }
};

onMounted(async () => {
  try {
    await fetchLocations();
    await fetchActivityOptions();
    await fetchActivities();
  } catch (error) {
    console.error("Error during initialization:", error);
    showNotification("error", "Error", "Failed to initialize the component");
    await globalStore.onCheckError(error);
  }
});
</script>

<style scoped>
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

.form-control,
.form-select {
  border-color: #e5e5e5;
  padding: 0.5rem 0.75rem;
}

.form-control:focus,
.form-select:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.input-group .btn-outline-secondary {
  border-color: #6c757d;
}

.input-group .btn-outline-secondary:hover {
  background-color: #6c757d;
  border-color: #6c757d;
  color: white;
}

/* Activity Image Styles */
.activity-image img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 0.25rem;
}

.no-image {
  display: inline-block;
  width: 50px;
  height: 50px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: #6c757d;
}

/* Toast Styles */
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1050;
}

.toast-notification {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
  width: 300px;
  margin-bottom: 0.5rem;
  padding: 0.75rem 1rem;
  animation: toast-in 0.2s ease-in;
}

.toast-notification.success {
  border-left: 4px solid #198754;
}

.toast-notification.error {
  border-left: 4px solid #dc3545;
}

.toast-icon {
  margin-right: 0.75rem;
  color: #6c757d;
}

.toast-notification.success .toast-icon {
  color: #198754;
}

.toast-notification.error .toast-icon {
  color: #dc3545;
}

.toast-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.toast-message {
  color: #6c757d;
  font-size: 0.875rem;
}

.toast-close {
  margin-left: auto;
  background: none;
  border: none;
  color: #6c757d;
  font-size: 1.25rem;
  cursor: pointer;
}

@keyframes toast-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Confirmation Modal Styles */
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

.activity-form {
  width: 100%;
  max-width: 1000px;
}
</style>
