<template>
  <div class="mb-9">
    <div class="row g-2 mb-4">
      <div class="col-auto">
        <h2 class="mb-0">Travel Guides</h2>
      </div>
    </div>

    <!-- Location Selector -->
    <div class="mb-4">
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label" for="locationSelect">Select Location</label>
          <select
            v-model="selectedLocationId"
            class="form-select"
            id="locationSelect"
            @change="fetchGuideForLocation"
          >
            <option value="" disabled>Select a location</option>
            <option v-for="location in locations" :key="location.id" :value="location.id">
              {{ location.name }}
            </option>
          </select>
        </div>
        <div class="col-auto d-flex align-items-end">
          <button
            class="btn btn-primary"
            @click="openCreateModal"
            :disabled="!selectedLocationId || loadingGuide"
          >
            <span class="fas fa-plus me-2"></span>
            {{ currentGuide ? "Edit Guide" : "Create Guide" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading and Error States -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading locations...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <!-- Guide Display -->
    <div v-else-if="currentGuide" class="travel-guide-display">
      <div class="card mb-4">
        <div
          class="card-header bg-light d-flex justify-content-between align-items-center"
        >
          <h5 class="mb-0">
            Travel Guide for {{ getLocationName(currentGuide.location_id) }}
          </h5>
          <button class="btn btn-sm btn-primary" @click="openEditModal">
            <span class="fas fa-edit me-1"></span>Edit
          </button>
        </div>
        <div class="card-body">
          <div class="row">
            <!-- Best Time to Visit -->
            <div class="col-md-6 mb-4">
              <div class="guide-section">
                <h5 class="section-title">
                  <span class="fas fa-calendar-alt me-2 text-primary"></span>
                  Best Time to Visit
                </h5>
                <p>{{ currentGuide.best_time_to_visit }}</p>
              </div>
            </div>

            <!-- Currency and Budget -->
            <div class="col-md-6 mb-4">
              <div class="guide-section">
                <h5 class="section-title">
                  <span class="fas fa-money-bill-wave me-2 text-primary"></span>
                  Currency & Budget
                </h5>
                <div v-if="parsedCurrencyBudget">
                  <ul class="list-unstyled">
                    <li v-if="parsedCurrencyBudget.currency">
                      <strong>Currency:</strong> {{ parsedCurrencyBudget.currency }}
                    </li>
                    <li v-if="parsedCurrencyBudget.notes">
                      <strong>Notes:</strong> {{ parsedCurrencyBudget.notes }}
                    </li>
                    <li v-if="parsedCurrencyBudget.ATMs">
                      <strong>ATMs:</strong> {{ parsedCurrencyBudget.ATMs }}
                    </li>
                    <li v-if="parsedCurrencyBudget.budget">
                      <strong>Budget:</strong> {{ parsedCurrencyBudget.budget }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Local Transportation -->
            <div class="col-md-6 mb-4">
              <div class="guide-section">
                <h5 class="section-title">
                  <span class="fas fa-shuttle-van me-2 text-primary"></span>
                  Local Transportation
                </h5>
                <div v-if="parsedTransportation">
                  <ul class="list-unstyled">
                    <li v-if="parsedTransportation.shortDistances">
                      <strong>Short Distances:</strong>
                      {{ parsedTransportation.shortDistances }}
                    </li>
                    <li v-if="parsedTransportation.longDistances">
                      <strong>Long Distances:</strong>
                      {{ parsedTransportation.longDistances }}
                    </li>
                    <li v-if="parsedTransportation.tip">
                      <strong>Tip:</strong> {{ parsedTransportation.tip }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Local Contacts -->
            <div class="col-md-6 mb-4">
              <div class="guide-section">
                <h5 class="section-title">
                  <span class="fas fa-phone-alt me-2 text-primary"></span>
                  Local Contacts
                </h5>
                <div v-if="parsedContacts">
                  <ul class="list-unstyled">
                    <li v-for="(contact, key) in parsedContacts" :key="key">
                      <strong>{{ key }}:</strong> {{ contact }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- What to Pack -->
            <div class="col-md-6 mb-4">
              <div class="guide-section">
                <h5 class="section-title">
                  <span class="fas fa-suitcase me-2 text-primary"></span>
                  What to Pack
                </h5>
                <div v-if="parsedWhatToPack && parsedWhatToPack.length">
                  <ul class="list-group list-group-flush">
                    <li
                      v-for="(item, index) in parsedWhatToPack"
                      :key="index"
                      class="list-group-item"
                    >
                      {{ item }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- What's on Sale -->
            <div class="col-md-6 mb-4">
              <div class="guide-section">
                <h5 class="section-title">
                  <span class="fas fa-shopping-bag me-2 text-primary"></span>
                  What's on Sale
                </h5>
                <div v-if="parsedWhatOnSale && parsedWhatOnSale.length">
                  <ul class="list-group list-group-flush">
                    <li
                      v-for="(item, index) in parsedWhatOnSale"
                      :key="index"
                      class="list-group-item"
                    >
                      {{ item }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Local Etiquette -->
            <div class="col-md-12 mb-4">
              <div class="guide-section">
                <h5 class="section-title">
                  <span class="fas fa-handshake me-2 text-primary"></span>
                  Local Etiquette
                </h5>
                <div v-if="parsedEtiquette">
                  <p v-if="parsedEtiquette.greeting">
                    <strong>Greeting:</strong> {{ parsedEtiquette.greeting }}
                  </p>
                  <div v-if="parsedEtiquette.customs && parsedEtiquette.customs.length">
                    <p><strong>Customs:</strong></p>
                    <ul class="list-group list-group-flush">
                      <li
                        v-for="(custom, index) in parsedEtiquette.customs"
                        :key="index"
                        class="list-group-item"
                      >
                        {{ custom }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="card-footer bg-light text-end">
          <small class="text-muted"
            >Last updated: {{ formatDate(currentGuide.updated_at) }}</small
          >
        </div>
      </div>
    </div>

    <!-- Empty States -->
    <div v-else-if="selectedLocationId && !loadingGuide" class="text-center py-5">
      <div class="empty-state">
        <div class="icon-container mb-3">
          <span class="fas fa-map-marked-alt fa-3x text-muted"></span>
        </div>
        <h4>No Guide Available</h4>
        <p class="text-muted">There is no travel guide for this location yet.</p>
        <button class="btn btn-primary mt-3" @click="openCreateModal">
          <span class="fas fa-plus me-2"></span>Create Guide
        </button>
      </div>
    </div>

    <div v-else-if="!selectedLocationId" class="text-center py-5">
      <div class="empty-state">
        <div class="icon-container mb-3">
          <span class="fas fa-globe fa-3x text-muted"></span>
        </div>
        <h4>Select a Location</h4>
        <p class="text-muted">
          Please select a location to view or create a travel guide.
        </p>
      </div>
    </div>

    <!-- Travel Guide Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content guide-form" @click.stop>
        <h4>{{ isEditMode ? "Edit" : "Create" }} Travel Guide</h4>
        <div v-if="modalError" class="alert alert-danger">
          {{ modalError }}
        </div>

        <form class="needs-validation" novalidate @submit.prevent="handleSubmit">
          <div class="row g-3">
            <!-- Best Time to Visit -->
            <div class="col-md-12 mb-3">
              <label class="form-label" for="bestTimeToVisit">Best Time to Visit</label>
              <textarea
                v-model="formData.best_time_to_visit"
                class="form-control"
                id="bestTimeToVisit"
                rows="3"
                required
              ></textarea>
              <div class="invalid-feedback">
                Please provide information about the best time to visit.
              </div>
            </div>

            <!-- Currency and Budget Section -->
            <div class="col-md-12 mb-3">
              <h5 class="form-section-title">Currency and Budget</h5>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label" for="currency">Currency</label>
                  <input
                    v-model="formData.currency_and_budget.currency"
                    type="text"
                    class="form-control"
                    id="currency"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label" for="budget">Budget</label>
                  <input
                    v-model="formData.currency_and_budget.budget"
                    type="text"
                    class="form-control"
                    id="budget"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label" for="notes">Notes</label>
                  <input
                    v-model="formData.currency_and_budget.notes"
                    type="text"
                    class="form-control"
                    id="notes"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label" for="atms">ATMs</label>
                  <input
                    v-model="formData.currency_and_budget.ATMs"
                    type="text"
                    class="form-control"
                    id="atms"
                  />
                </div>
              </div>
            </div>

            <!-- Local Transportation Section -->
            <div class="col-md-12 mb-3">
              <h5 class="form-section-title">Local Transportation</h5>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label" for="shortDistances">Short Distances</label>
                  <input
                    v-model="formData.local_transportation.shortDistances"
                    type="text"
                    class="form-control"
                    id="shortDistances"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label" for="longDistances">Long Distances</label>
                  <input
                    v-model="formData.local_transportation.longDistances"
                    type="text"
                    class="form-control"
                    id="longDistances"
                    required
                  />
                </div>
                <div class="col-md-12">
                  <label class="form-label" for="transportTip">Tip</label>
                  <input
                    v-model="formData.local_transportation.tip"
                    type="text"
                    class="form-control"
                    id="transportTip"
                    required
                  />
                </div>
              </div>
            </div>

            <!-- Local Contacts Section -->
            <div class="col-md-12 mb-3">
              <h5 class="form-section-title">Local Contacts</h5>
              <div
                v-for="(contact, index) in contactEntries"
                :key="index"
                class="row g-3 mb-2"
              >
                <div class="col-md-5">
                  <label class="form-label" :for="'contactName' + index"
                    >Contact Type</label
                  >
                  <input
                    v-model="contact.key"
                    type="text"
                    class="form-control"
                    :id="'contactName' + index"
                    required
                  />
                </div>
                <div class="col-md-5">
                  <label class="form-label" :for="'contactValue' + index"
                    >Contact Number</label
                  >
                  <input
                    v-model="contact.value"
                    type="text"
                    class="form-control"
                    :id="'contactValue' + index"
                    required
                  />
                </div>
                <div class="col-md-2 d-flex align-items-end">
                  <button
                    type="button"
                    class="btn btn-danger w-100"
                    @click="removeContact(index)"
                  >
                    <span class="fas fa-trash"></span>
                  </button>
                </div>
              </div>
              <button
                type="button"
                class="btn btn-outline-primary mt-2"
                @click="addContact"
              >
                <span class="fas fa-plus me-1"></span>Add Contact
              </button>
            </div>

            <!-- List Sections -->
            <div class="col-md-6 mb-3">
              <h5 class="form-section-title">What to Pack</h5>
              <div
                v-for="(item, index) in formData.what_to_pack"
                :key="'pack' + index"
                class="row g-2 mb-2"
              >
                <div class="col-10">
                  <input
                    v-model="formData.what_to_pack[index]"
                    type="text"
                    class="form-control"
                    :id="'packItem' + index"
                    required
                  />
                </div>
                <div class="col-2">
                  <button
                    type="button"
                    class="btn btn-danger w-100"
                    @click="removeListItem('what_to_pack', index)"
                  >
                    <span class="fas fa-trash"></span>
                  </button>
                </div>
              </div>
              <button
                type="button"
                class="btn btn-outline-primary mt-2"
                @click="addListItem('what_to_pack')"
              >
                <span class="fas fa-plus me-1"></span>Add Item
              </button>
            </div>

            <div class="col-md-6 mb-3">
              <h5 class="form-section-title">What's on Sale</h5>
              <div
                v-for="(item, index) in formData.what_on_sale"
                :key="'sale' + index"
                class="row g-2 mb-2"
              >
                <div class="col-10">
                  <input
                    v-model="formData.what_on_sale[index]"
                    type="text"
                    class="form-control"
                    :id="'saleItem' + index"
                    required
                  />
                </div>
                <div class="col-2">
                  <button
                    type="button"
                    class="btn btn-danger w-100"
                    @click="removeListItem('what_on_sale', index)"
                  >
                    <span class="fas fa-trash"></span>
                  </button>
                </div>
              </div>
              <button
                type="button"
                class="btn btn-outline-primary mt-2"
                @click="addListItem('what_on_sale')"
              >
                <span class="fas fa-plus me-1"></span>Add Item
              </button>
            </div>

            <!-- Local Etiquette Section -->
            <div class="col-md-12 mb-3">
              <h5 class="form-section-title">Local Etiquette</h5>
              <div class="row g-3">
                <div class="col-md-12 mb-3">
                  <label class="form-label" for="greeting">Traditional Greeting</label>
                  <input
                    v-model="formData.local_etiquette.greeting"
                    type="text"
                    class="form-control"
                    id="greeting"
                    required
                  />
                </div>

                <div class="col-md-12">
                  <label class="form-label">Customs</label>
                  <div
                    v-for="(custom, index) in formData.local_etiquette.customs"
                    :key="'custom' + index"
                    class="row g-2 mb-2"
                  >
                    <div class="col-10">
                      <input
                        v-model="formData.local_etiquette.customs[index]"
                        type="text"
                        class="form-control"
                        :id="'customItem' + index"
                        required
                      />
                    </div>
                    <div class="col-2">
                      <button
                        type="button"
                        class="btn btn-danger w-100"
                        @click="removeCustom(index)"
                      >
                        <span class="fas fa-trash"></span>
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="btn btn-outline-primary mt-2"
                    @click="addCustom"
                  >
                    <span class="fas fa-plus me-1"></span>Add Custom
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Form Buttons -->
          <div class="col-12 d-flex justify-content-end mt-4">
            <button class="btn btn-secondary me-2" type="button" @click="closeModal">
              Cancel
            </button>
            <button class="btn btn-primary" type="submit" :disabled="submitting">
              {{ submitting ? "Processing..." : isEditMode ? "Update" : "Save" }}
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
  </div>
</template>

<script setup>
import { useGlobalStore } from "@/stores/global";
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";

const globalStore = useGlobalStore();

// Reactive data
const loading = ref(false);
const loadingGuide = ref(false);
const error = ref(null);
const locations = ref([]);
const selectedLocationId = ref("");
const currentGuide = ref(null);
const showModal = ref(false);
const isEditMode = ref(false);
const modalError = ref("");
const submitting = ref(false);
const toasts = ref([]);
let toastId = 0;

// Form data
const formData = reactive({
  location_id: "",
  best_time_to_visit: "",
  local_contacts: {},
  currency_and_budget: {
    currency: "",
    notes: "",
    ATMs: "",
    budget: "",
  },
  local_transportation: {
    shortDistances: "",
    longDistances: "",
    tip: "",
  },
  what_to_pack: [],
  what_on_sale: [],
  local_etiquette: {
    greeting: "",
    customs: [],
  },
});

// Contact entries for form handling
const contactEntries = ref([]);

// Computed properties for parsing JSON data
const parsedContacts = computed(() => {
  if (!currentGuide.value?.local_contacts) return {};
  return parseJsonField(currentGuide.value.local_contacts);
});

const parsedCurrencyBudget = computed(() => {
  if (!currentGuide.value?.currency_and_budget) return {};
  return parseJsonField(currentGuide.value.currency_and_budget);
});

const parsedTransportation = computed(() => {
  if (!currentGuide.value?.local_transportation) return {};
  return parseJsonField(currentGuide.value.local_transportation);
});

const parsedWhatToPack = computed(() => {
  if (!currentGuide.value?.what_to_pack) return [];
  return parseJsonField(currentGuide.value.what_to_pack);
});

const parsedWhatOnSale = computed(() => {
  if (!currentGuide.value?.what_on_sale) return [];
  return parseJsonField(currentGuide.value.what_on_sale);
});

const parsedEtiquette = computed(() => {
  if (!currentGuide.value?.local_etiquette) return {};
  return parseJsonField(currentGuide.value.local_etiquette);
});

// Utility functions
const parseJsonField = (field) => {
  if (typeof field === "string") {
    try {
      return JSON.parse(field);
    } catch (e) {
      console.warn("Failed to parse JSON field:", field);
      return {};
    }
  }
  return field || {};
};

const getLocationName = (locationId) => {
  const location = locations.value.find((loc) => loc.id === locationId);
  return location ? location.name : "Unknown Location";
};

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    return date.toLocaleString();
  } catch (e) {
    return "Invalid Date";
  }
};

// API functions
const fetchLocations = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await axios.get("/api/locations", globalStore.getAxiosHeader());

    if (response.data.result && Array.isArray(response.data.data)) {
      locations.value = response.data.data;
    } else {
      error.value = response.data.message || "Failed to fetch locations";
      console.error("API error when fetching locations:", response.data);
    }
  } catch (err) {
    console.error("Error fetching locations:", err);
    error.value = "An error occurred while fetching locations.";
    await globalStore.onCheckError(err);
  } finally {
    loading.value = false;
  }
};

const fetchGuideForLocation = async () => {
  if (!selectedLocationId.value) {
    currentGuide.value = null;
    return;
  }

  loadingGuide.value = true;
  error.value = null;

  try {
    const response = await axios.get(
      "/api/locations/guide/get",
      globalStore.getAxiosHeader()
    );

    if (response.data.error === false && Array.isArray(response.data.data)) {
      const guides = response.data.data;
      const guide = guides.find(
        (g) => g.location_id === Number(selectedLocationId.value)
      );
      currentGuide.value = guide || null;
    } else {
      error.value = response.data.message || "Failed to fetch travel guide";
      console.error("API error when fetching guide:", response.data);
    }
  } catch (err) {
    console.error("Error fetching travel guide:", err);
    error.value = "An error occurred while fetching the travel guide.";
    await globalStore.onCheckError(err);
  } finally {
    loadingGuide.value = false;
  }
};

// Form handling functions
const initFormData = () => {
  if (currentGuide.value) {
    // Edit mode - populate with existing data
    formData.location_id = currentGuide.value.location_id;
    formData.best_time_to_visit = currentGuide.value.best_time_to_visit;

    // Parse and assign JSON fields
    formData.currency_and_budget = { ...parsedCurrencyBudget.value };
    formData.local_transportation = { ...parsedTransportation.value };
    formData.what_to_pack = [...parsedWhatToPack.value];
    formData.what_on_sale = [...parsedWhatOnSale.value];
    formData.local_etiquette = {
      greeting: parsedEtiquette.value.greeting || "",
      customs: [...(parsedEtiquette.value.customs || [])],
    };

    // Setup contacts
    contactEntries.value = [];
    Object.entries(parsedContacts.value).forEach(([key, value]) => {
      contactEntries.value.push({ key, value });
    });
  } else {
    // Create mode - setup empty form
    formData.location_id = selectedLocationId.value;
    formData.best_time_to_visit = "";
    formData.currency_and_budget = {
      currency: "",
      notes: "",
      ATMs: "",
      budget: "",
    };
    formData.local_transportation = {
      shortDistances: "",
      longDistances: "",
      tip: "",
    };
    formData.what_to_pack = [""];
    formData.what_on_sale = [""];
    formData.local_etiquette = {
      greeting: "",
      customs: [""],
    };
    contactEntries.value = [{ key: "Emergency", value: "" }];
  }
};

const buildContactsObject = () => {
  const contacts = {};
  contactEntries.value.forEach((entry) => {
    if (entry.key && entry.key.trim()) {
      contacts[entry.key] = entry.value || "";
    }
  });
  return contacts;
};

// Modal functions
const openCreateModal = () => {
  isEditMode.value = false;
  initFormData();
  showModal.value = true;
};

const openEditModal = () => {
  isEditMode.value = true;
  initFormData();
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  modalError.value = "";
};

// List manipulation functions
const addListItem = (listName) => {
  formData[listName].push("");
};

const removeListItem = (listName, index) => {
  formData[listName].splice(index, 1);
  if (formData[listName].length === 0) {
    formData[listName].push("");
  }
};

const addContact = () => {
  contactEntries.value.push({ key: "", value: "" });
};

const removeContact = (index) => {
  contactEntries.value.splice(index, 1);
  if (contactEntries.value.length === 0) {
    contactEntries.value.push({ key: "Emergency", value: "" });
  }
};

const addCustom = () => {
  formData.local_etiquette.customs.push("");
};

const removeCustom = (index) => {
  formData.local_etiquette.customs.splice(index, 1);
  if (formData.local_etiquette.customs.length === 0) {
    formData.local_etiquette.customs.push("");
  }
};

// Toast notification functions
const showNotification = (type, title, message) => {
  const id = toastId++;
  const icons = {
    success: "fas fa-check-circle",
    error: "fas fa-exclamation-circle",
    warning: "fas fa-exclamation-triangle",
    info: "fas fa-info-circle",
  };

  toasts.value.push({
    id,
    type,
    title,
    message,
    icon: icons[type] || icons.info,
  });

  setTimeout(() => {
    removeToast(id);
  }, 5000);
};

const removeToast = (id) => {
  toasts.value = toasts.value.filter((toast) => toast.id !== id);
};

// Form submission
const handleSubmit = async (event) => {
  event.preventDefault();

  if (!event.target.checkValidity()) {
    event.stopPropagation();
    event.target.classList.add("was-validated");
    return;
  }

  submitting.value = true;
  modalError.value = "";

  try {
    const guideData = {
      location_id: selectedLocationId.value,
      best_time_to_visit: formData.best_time_to_visit,
      local_contacts: buildContactsObject(),
      currency_and_budget: formData.currency_and_budget,
      local_transportation: formData.local_transportation,
      what_to_pack: formData.what_to_pack.filter((item) => item.trim() !== ""),
      what_on_sale: formData.what_on_sale.filter((item) => item.trim() !== ""),
      local_etiquette: {
        greeting: formData.local_etiquette.greeting,
        customs: formData.local_etiquette.customs.filter(
          (custom) => custom.trim() !== ""
        ),
      },
    };

    let response;
    if (isEditMode.value && currentGuide.value) {
      response = await axios.put(
        `/api/locations/guide/${currentGuide.value.id}`,
        guideData,
        globalStore.getAxiosHeader()
      );
    } else {
      response = await axios.post(
        "/api/locations/guide",
        guideData,
        globalStore.getAxiosHeader()
      );
    }

    if (response.data.result || response.data.error === false) {
      await fetchGuideForLocation();
      closeModal();
      showNotification(
        "success",
        "Success",
        isEditMode.value ? "Guide updated successfully!" : "Guide created successfully!"
      );
    } else {
      modalError.value = response.data.message || "Failed to save guide";
    }
  } catch (err) {
    console.error(
      isEditMode.value ? "Error updating guide:" : "Error creating guide:",
      err
    );

    if (err.response && err.response.data) {
      if (err.response.data.message) {
        modalError.value = err.response.data.message;
      } else if (err.response.data.errors) {
        const errors = Object.values(err.response.data.errors).flat();
        modalError.value = errors.join("\n");
      } else {
        modalError.value = "An error occurred while saving the guide.";
      }
    } else {
      modalError.value = "An error occurred while saving the guide.";
    }

    await globalStore.onCheckError(err);
  } finally {
    submitting.value = false;
  }
};

// Initialize component
onMounted(() => {
  fetchLocations();
});
</script>

<style scoped>
.color-swatch {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  display: inline-block;
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
  align-items: center;
  z-index: 1000;
}

.modal-content {
  top: 40px;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  left: 100px;
  overflow-y: auto;
}

.form-control-color {
  width: 50px;
  height: 38px;
}

.color-form .form-label {
  font-weight: 500;
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

.table th {
  background-color: #f8f9fa;
  font-weight: 500;
}

.guide-section {
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background-color: #f8f9fa;
  height: 100%;
}

.section-title {
  color: #495057;
  margin-bottom: 1rem;
}

.form-section-title {
  color: #495057;
  margin-bottom: 1rem;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 0.5rem;
}

.empty-state {
  color: #6c757d;
}

.icon-container {
  margin-bottom: 1rem;
}

/* Toast styles */
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
</style>
