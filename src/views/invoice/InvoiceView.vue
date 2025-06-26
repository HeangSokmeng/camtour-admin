<template>
  <div class="mb-9">
    <div class="row g-2 mb-4">
      <div class="col-auto">
        <h2 class="mb-0">Invoices</h2>
      </div>
    </div>

    <div id="invoices">
      <!-- Advanced Search Panel -->
      <div class="mb-4">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-light">
            <div class="d-flex justify-content-between align-items-center">
              <h6 class="mb-0"><i class="fas fa-search me-2"></i>Search & Filter</h6>
              <button
                style="background-color: blue; color: white; padding: 10px"
                class="btn btn-outline-secondary btn-sm"
                @click="toggleAdvancedSearch"
              >
                <i
                  :class="
                    showAdvancedSearch ? 'fas fa-chevron-up' : 'fas fa-chevron-down'
                  "
                ></i>
                {{ showAdvancedSearch ? "Hide" : "Show" }} Advanced
              </button>
            </div>
          </div>

          <div class="card-body">
            <!-- Basic Search Row -->
            <div class="row g-3 mb-3">
              <div class="col-md-4">
                <div class="search-box">
                  <input
                    v-model="searchFilters.search"
                    class="form-control search-input"
                    type="search"
                    placeholder="Search orders, customers, emails..."
                    @input="debouncedSearch"
                  />
                </div>
              </div>
              <div class="col-md-3">
                <select
                  v-model="searchFilters.payment_status"
                  class="form-select"
                  @change="applyFilters"
                >
                  <option value="">All Payment Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div class="col-md-3">
                <select
                  v-model="searchFilters.date_range"
                  class="form-select"
                  @change="applyFilters"
                >
                  <option value="">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="this_week">This Week</option>
                  <option value="last_week">Last Week</option>
                  <option value="this_month">This Month</option>
                  <option value="last_month">Last Month</option>
                  <option value="this_year">This Year</option>
                </select>
              </div>
              <div class="col-md-2">
                <button class="btn btn-primary w-100" @click="applyFilters">
                  <i class="fas fa-search me-1"></i>Search
                </button>
              </div>
            </div>

            <!-- Advanced Search Fields -->
            <div v-show="showAdvancedSearch" class="advanced-search">
              <hr class="my-3" />
              <div class="row g-3">
                <div class="col-md-3">
                  <label class="form-label">Order Number</label>
                  <input
                    v-model="searchFilters.order_no"
                    class="form-control"
                    type="text"
                    placeholder="ORD-461A17..."
                    @blur="applyFilters"
                  />
                </div>
                <div class="col-md-3">
                  <label class="form-label">Customer Name</label>
                  <input
                    v-model="searchFilters.customer_name"
                    class="form-control"
                    type="text"
                    placeholder="Customer name"
                    @blur="applyFilters"
                  />
                </div>
                <div class="col-md-3">
                  <label class="form-label">Email</label>
                  <input
                    v-model="searchFilters.email"
                    class="form-control"
                    type="email"
                    placeholder="customer@email.com"
                    @blur="applyFilters"
                  />
                </div>
                <div class="col-md-3">
                  <label class="form-label">Phone</label>
                  <input
                    v-model="searchFilters.phone"
                    class="form-control"
                    type="text"
                    placeholder="Phone number"
                    @blur="applyFilters"
                  />
                </div>
                <div class="col-md-3">
                  <label class="form-label">City</label>
                  <input
                    v-model="searchFilters.city"
                    class="form-control"
                    type="text"
                    placeholder="City"
                    @blur="applyFilters"
                  />
                </div>
                <div class="col-md-3">
                  <label class="form-label">State</label>
                  <input
                    v-model="searchFilters.state"
                    class="form-control"
                    type="text"
                    placeholder="State"
                    @blur="applyFilters"
                  />
                </div>
                <div class="col-md-3">
                  <label class="form-label">Min Amount</label>
                  <input
                    v-model="searchFilters.min_amount"
                    class="form-control"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    @blur="applyFilters"
                  />
                </div>
                <div class="col-md-3">
                  <label class="form-label">Max Amount</label>
                  <input
                    v-model="searchFilters.max_amount"
                    class="form-control"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    @blur="applyFilters"
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Date From</label>
                  <input
                    v-model="searchFilters.date_from"
                    class="form-control"
                    type="date"
                    @change="applyFilters"
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Date To</label>
                  <input
                    v-model="searchFilters.date_to"
                    class="form-control"
                    type="date"
                    @change="applyFilters"
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Payment Method</label>
                  <select
                    v-model="searchFilters.payment_method"
                    class="form-select"
                    @change="applyFilters"
                  >
                    <option value="">All Payment Methods</option>
                    <option value="cash_on_delivery">Cash on Delivery</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>

                <div class="col-md-12">
                  <div class="form-check">
                    <input
                      v-model="searchFilters.has_discount"
                      class="form-check-input"
                      type="checkbox"
                      id="hasDiscount"
                      @change="applyFilters"
                    />
                    <label class="form-check-label" for="hasDiscount">
                      Only orders with discount
                    </label>
                  </div>
                </div>

                <div class="col-12">
                  <div class="d-flex gap-2">
                    <button class="btn btn-primary" @click="applyFilters">
                      <i class="fas fa-search me-1"></i>Apply Filters
                    </button>
                    <button class="btn btn-outline-secondary" @click="clearFilters">
                      <i class="fas fa-times me-1"></i>Clear Filters
                    </button>
                    <div class="dropdown">
                      <button
                        class="btn btn-outline-success dropdown-toggle"
                        type="button"
                        data-bs-toggle="dropdown"
                      >
                        <i class="fas fa-download me-1"></i>Export
                      </button>
                      <ul class="dropdown-menu">
                        <li>
                          <a class="dropdown-item" href="#" @click="exportResults('csv')">
                            <i class="fas fa-file-csv me-2"></i>Export as CSV
                          </a>
                        </li>
                        <li>
                          <a class="dropdown-item" href="#" @click="exportResults('pdf')">
                            <i class="fas fa-file-pdf me-2"></i>Export as PDF
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Results Summary -->
      <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center">
          <div class="text-muted">
            <i class="fas fa-info-circle me-1"></i>
            Showing {{ state.invoices.length }} of {{ pagination.total }} invoices
            <span v-if="hasActiveFilters" class="badge bg-primary ms-2"> Filtered </span>
          </div>
          <div class="d-flex align-items-center gap-2">
            <label class="form-label mb-0 me-2">Sort by:</label>
            <select
              v-model="searchFilters.sort_by"
              class="form-select form-select-sm"
              style="width: auto"
              @change="applyFilters"
            >
              <option value="order_date">Order Date</option>
              <option value="order_no">Order Number</option>
              <option value="first_name">Customer Name</option>
              <option value="total_amount">Total Amount</option>
              <option value="payment_status">Payment Status</option>
            </select>
            <select
              v-model="searchFilters.sort_direction"
              class="form-select form-select-sm"
              style="width: auto"
              @change="applyFilters"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="state.isLoading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <div class="mt-2">Loading invoices...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="state.error" class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>
        {{ state.error }}
      </div>

      <!-- Invoice Table -->
      <div v-else class="table-responsive">
        <table class="table table-sm fs-9 mb-0">
          <thead class="table-light">
            <tr>
              <th class="align-middle ps-0">#</th>
              <th class="align-middle">Order No</th>
              <th class="align-middle">Customer</th>
              <th class="align-middle">Contact</th>
              <th class="align-middle">Address</th>
              <th class="align-middle">Payment</th>
              <th class="align-middle">Amount</th>
              <th class="align-middle">Date</th>
              <th class="align-middle">Status</th>
              <th class="align-middle text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="state.invoices.length === 0">
              <td colspan="10" class="text-center py-4">
                <i class="fas fa-inbox fa-2x text-muted mb-2"></i>
                <div>No invoices found</div>
                <small class="text-muted">Try adjusting your search criteria</small>
              </td>
            </tr>
            <tr
              v-else
              v-for="(invoice, index) in state.invoices"
              :key="invoice.id"
              class="invoice-row"
            >
              <td class="align-middle ps-0">
                {{ (pagination.current_page - 1) * searchFilters.per_page + index + 1 }}
              </td>
              <td class="align-middle">
                <div class="fw-semibold">{{ invoice.order_no }}</div>
                <small class="text-muted">{{ formatDate(invoice.created_at) }}</small>
              </td>
              <td class="align-middle">
                <div class="fw-semibold">
                  {{ invoice.first_name }} {{ invoice.last_name }}
                </div>
                <small class="text-muted">{{ invoice.email }}</small>
              </td>
              <td class="align-middle">
                <div>{{ invoice.phone }}</div>
              </td>
              <td class="align-middle">
                <div
                  class="text-truncate"
                  style="max-width: 150px"
                  :title="invoice.address_to_receive"
                >
                  {{ invoice.address_to_receive }}
                </div>
                <small class="text-muted">{{ invoice.city }}, {{ invoice.state }}</small>
              </td>
              <td class="align-middle">
                <div class="d-flex flex-column">
                  <span class="badge bg-light text-dark mb-1">{{
                    formatPaymentMethod(invoice.payment_method)
                  }}</span>
                  <span :class="getPaymentStatusClass(invoice.payment_status)">
                    {{ formatPaymentStatus(invoice.payment_status) }}
                  </span>
                </div>
              </td>
              <td class="align-middle">
                <div class="fw-semibold">${{ invoice.total_amount }}</div>
                <small
                  v-if="parseFloat(invoice.discount_amount) > 0"
                  class="text-success"
                >
                  -${{ invoice.discount_amount }} discount
                </small>
              </td>
              <td class="align-middle">
                <div>{{ formatDate(invoice.order_date) }}</div>
                <small class="text-muted">{{ formatTime(invoice.order_date) }}</small>
              </td>
              <td class="align-middle">
                <span :class="getStatusClass(invoice.status)">
                  {{ formatStatus(invoice.status) }}
                </span>
              </td>
              <td class="align-middle text-end">
                <div class="dropdown">
                  <button
                    class="btn btn-sm btn-outline-secondary dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    <i class="fas fa-ellipsis-v"></i>
                  </button>
                  <ul class="dropdown-menu">
                    <li>
                      <a class="dropdown-item" href="#" @click="viewInvoice(invoice.id)">
                        <i class="fas fa-eye me-2"></i>View Details
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" @click="printInvoice(invoice.id)">
                        <i class="fas fa-print me-2"></i>Print
                      </a>
                    </li>
                    <li>
                      <a
                        class="dropdown-item"
                        href="#"
                        @click="downloadInvoice(invoice.id)"
                      >
                        <i class="fas fa-download me-2"></i>Download PDF
                      </a>
                    </li>
                    <li><hr class="dropdown-divider" /></li>
                    <li>
                      <a class="dropdown-item" href="#" @click="editInvoice(invoice.id)">
                        <i class="fas fa-edit me-2"></i>Edit
                      </a>
                    </li>
                  </ul>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination.total > searchFilters.per_page"
        class="d-flex justify-content-between align-items-center mt-4"
      >
        <div class="text-muted">
          Showing {{ pagination.first_item }} to {{ pagination.last_item }} of
          {{ pagination.total }} results
        </div>
        <nav>
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
              <button
                class="page-link"
                @click="changePage(pagination.current_page - 1)"
                :disabled="pagination.current_page === 1"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
            </li>

            <li
              v-for="page in visiblePages"
              :key="page"
              class="page-item"
              :class="{ active: page === pagination.current_page }"
            >
              <button class="page-link" @click="changePage(page)">{{ page }}</button>
            </li>

            <li
              class="page-item"
              :class="{ disabled: pagination.current_page === pagination.last_page }"
            >
              <button
                class="page-link"
                @click="changePage(pagination.current_page + 1)"
                :disabled="pagination.current_page === pagination.last_page"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
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
</template>

<script setup>
import { useToast } from "@/composables/useToast";
import { useGlobalStore } from "@/stores/global";
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";

// Composables and stores
const { toasts, showNotification, removeToast } = useToast();
const globalStore = useGlobalStore();

// Reactive state
const state = reactive({
  invoices: [],
  isLoading: false,
  error: null,
});

const pagination = reactive({
  current_page: 1,
  last_page: 1,
  total: 0,
  first_item: 0,
  last_item: 0,
  has_more_pages: false,
});

// Refs
const showAdvancedSearch = ref(false);

// Search filters
const searchFilters = reactive({
  search: "",
  order_no: "",
  customer_name: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  payment_method: "",
  payment_status: "",
  min_amount: "",
  max_amount: "",
  currency: "",
  date_from: "",
  date_to: "",
  date_range: "",
  has_discount: false,
  sort_by: "order_date",
  sort_direction: "desc",
  per_page: 15,
  page: 1,
});

// Timeout for debounced search
let searchTimeout = null;

// Debug function
const debugFilters = (filters) => {
  console.log("Current filters:", filters);
  console.log(
    "Active filters:",
    Object.entries(filters).filter(([key, value]) => {
      if (["sort_by", "sort_direction", "per_page", "page"].includes(key)) return false;
      if (key === "has_discount") return value === true;
      return value !== "" && value !== null && value !== undefined && value !== false;
    })
  );
};

// Computed properties
const hasActiveFilters = computed(() => {
  const activeFilters = Object.entries(searchFilters).filter(([key, value]) => {
    if (["sort_by", "sort_direction", "per_page", "page"].includes(key)) return false;
    if (key === "has_discount") return value === true;
    return value !== "" && value !== null && value !== undefined;
  });

  console.log("Has active filters:", activeFilters.length > 0, activeFilters);
  return activeFilters.length > 0;
});

const visiblePages = computed(() => {
  const current = pagination.current_page;
  const last = pagination.last_page;
  const delta = 2;
  const range = [];
  const rangeWithDots = [];

  for (
    let i = Math.max(2, current - delta);
    i <= Math.min(last - 1, current + delta);
    i++
  ) {
    range.push(i);
  }

  if (current - delta > 2) {
    rangeWithDots.push(1, "...");
  } else {
    rangeWithDots.push(1);
  }

  rangeWithDots.push(...range);

  if (current + delta < last - 1) {
    rangeWithDots.push("...", last);
  } else {
    rangeWithDots.push(last);
  }

  return rangeWithDots.filter(
    (item, index, arr) => (arr.indexOf(item) === index && item !== 1) || index === 0
  );
});

// Methods
const toggleAdvancedSearch = () => {
  showAdvancedSearch.value = !showAdvancedSearch.value;
};

const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyFilters();
  }, 500);
};

const fetchInvoices = async () => {
  state.isLoading = true;
  state.error = null;

  try {
    // Debug the filters being sent
    debugFilters(searchFilters);

    const params = new URLSearchParams();

    // Add all non-empty filter parameters
    Object.keys(searchFilters).forEach((key) => {
      const value = searchFilters[key];

      // Skip empty values, but include has_discount when it's true
      if (key === "has_discount") {
        if (value === true) {
          params.append(key, "1");
        }
      } else if (value !== "" && value !== null && value !== undefined) {
        params.append(key, value);
      }
    });

    console.log("API URL:", `/api/invoices?${params.toString()}`);

    const response = await axios.get(
      `/api/invoices?${params.toString()}`,
      globalStore.getAxiosHeader()
    );

    console.log("API Response:", response.data);

    if (response.data.result && Array.isArray(response.data.data)) {
      state.invoices = response.data.data;

      // Update pagination info
      if (response.data.paginate) {
        Object.assign(pagination, response.data.paginate);
      } else {
        // Handle non-paginated response
        pagination.current_page = 1;
        pagination.last_page = 1;
        pagination.total = response.data.data.length;
        pagination.first_item = response.data.data.length > 0 ? 1 : 0;
        pagination.last_item = response.data.data.length;
        pagination.has_more_pages = false;
      }
    } else {
      state.error = response.data.message || "Failed to fetch invoices";
      console.error("API error when fetching invoices:", response.data);
    }
  } catch (error) {
    console.error("Error fetching invoices:", error);
    state.error = "An error occurred while fetching invoices.";
    await globalStore.onCheckError(error);
  }

  state.isLoading = false;
};

const applyFilters = async () => {
  console.log("Applying filters...");
  searchFilters.page = 1; // Reset to first page when applying filters
  await fetchInvoices();
};

const clearFilters = () => {
  console.log("Clearing filters...");
  Object.assign(searchFilters, {
    search: "",
    order_no: "",
    customer_name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    payment_method: "",
    payment_status: "",
    min_amount: "",
    max_amount: "",
    currency: "",
    date_from: "",
    date_to: "",
    date_range: "",
    has_discount: false,
    sort_by: "order_date",
    sort_direction: "desc",
    per_page: 15,
    page: 1,
  });
  applyFilters();
};

const changePage = (page) => {
  if (page >= 1 && page <= pagination.last_page) {
    searchFilters.page = page;
    fetchInvoices();
  }
};

const exportResults = async (format = "csv") => {
  try {
    if (format === "csv") {
      exportAsCSV(state.invoices);
    } else if (format === "pdf") {
      exportAsPDF(state.invoices);
    }
  } catch (error) {
    console.error("Error exporting invoices:", error);
    showNotification("error", "Error", "An error occurred while exporting invoices");
    await globalStore.onCheckError(error);
  }
};

// Helper function to export data as PDF using jsPDF
const exportAsPDF = (invoices) => {
  if (!invoices || invoices.length === 0) {
    showNotification("warning", "Warning", "No data to export");
    return;
  }

  try {
    // Simple HTML to PDF conversion using print functionality
    const printContent = generateInvoiceListHTML(invoices);

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load, then trigger save as PDF
    printWindow.onload = () => {
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        // Note: User will need to select "Save as PDF" in the print dialog
      }, 500);
    };

    showNotification(
      "success",
      "Success",
      `Ready to export ${invoices.length} invoices as PDF. Choose "Save as PDF" in the print dialog.`
    );
  } catch (error) {
    console.error("Error generating PDF:", error);
    showNotification("error", "Error", "Failed to generate PDF export");
  }
};

// Helper function to generate invoice list HTML for PDF export
const generateInvoiceListHTML = (invoices) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoices Export - ${new Date().toLocaleDateString()}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Arial', sans-serif; 
          font-size: 12px;
          line-height: 1.4;
          color: #333;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #007bff;
          padding-bottom: 20px;
        }
        .export-title {
          font-size: 24px;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 10px;
        }
        .export-info {
          color: #666;
          margin-bottom: 5px;
        }
        .invoices-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .invoices-table th {
          background: #007bff;
          color: white;
          padding: 10px 8px;
          text-align: left;
          font-weight: 600;
          font-size: 11px;
          border: 1px solid #0056b3;
        }
        .invoices-table td {
          padding: 8px;
          border: 1px solid #dee2e6;
          font-size: 10px;
        }
        .invoices-table tbody tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .status-badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-completed { background-color: #d4edda; color: #155724; }
        .status-pending { background-color: #fff3cd; color: #856404; }
        .status-cancelled { background-color: #f8d7da; color: #721c24; }
        .summary {
          margin-top: 30px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 5px;
        }
        .summary-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        @media print {
          body { padding: 10px; }
          .invoices-table th {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="export-title">INVOICES EXPORT</div>
        <div class="export-info">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
        <div class="export-info">Total Records: ${invoices.length}</div>
      </div>
      
      <table class="invoices-table">
        <thead>
          <tr>
            <th style="width: 12%;">Order No</th>
            <th style="width: 15%;">Customer</th>
            <th style="width: 12%;">Email</th>
            <th style="width: 10%;">Phone</th>
            <th style="width: 12%;">City</th>
            <th style="width: 10%;">Payment</th>
            <th style="width: 8%;">Amount</th>
            <th style="width: 8%;">Status</th>
            <th style="width: 10%;">Order Date</th>
          </tr>
        </thead>
        <tbody>
          ${invoices
            .map(
              (invoice) => `
            <tr>
              <td>${invoice.order_no}</td>
              <td>${invoice.first_name} ${invoice.last_name}</td>
              <td>${invoice.email}</td>
              <td>${invoice.phone}</td>
              <td>${invoice.city}, ${invoice.state}</td>
              <td>${formatPaymentMethod(invoice.payment_method)}</td>
              <td class="text-right">${parseFloat(invoice.total_amount).toFixed(2)}</td>
              <td><span class="status-badge status-${invoice.status}">${formatStatus(
                invoice.status
              )}</span></td>
              <td>${formatDate(invoice.order_date)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      
      <div class="summary">
        <div class="summary-item">
          <strong>Total Records:</strong>
          <strong>${invoices.length}</strong>
        </div>
        <div class="summary-item">
          <strong>Total Amount:</strong>
          <strong>${invoices
            .reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0)
            .toFixed(2)}</strong>
        </div>
        <div class="summary-item">
          <strong>Total Discount:</strong>
          <strong>${invoices
            .reduce((sum, inv) => sum + parseFloat(inv.discount_amount || 0), 0)
            .toFixed(2)}</strong>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Helper function to export data as CSV
const exportAsCSV = (invoices) => {
  if (!invoices || invoices.length === 0) {
    showNotification("warning", "Warning", "No data to export");
    return;
  }

  // Define CSV headers
  const headers = [
    "Order Number",
    "Customer Name",
    "Email",
    "Phone",
    "Address",
    "City",
    "State",
    "Payment Method",
    "Payment Status",
    "Total Amount",
    "Currency",
    "Discount Amount",
    "Status",
    "Order Date",
    "Created At",
    "Notes",
  ];

  // Convert invoices to CSV rows
  const csvRows = invoices.map((invoice) => [
    invoice.order_no,
    `${invoice.first_name} ${invoice.last_name}`,
    invoice.email,
    invoice.phone,
    invoice.address_to_receive,
    invoice.city,
    invoice.state,
    formatPaymentMethod(invoice.payment_method),
    formatPaymentStatus(invoice.payment_status),
    invoice.total_amount,
    invoice.currency,
    invoice.discount_amount,
    formatStatus(invoice.status),
    formatDate(invoice.order_date),
    formatDate(invoice.created_at),
    invoice.notes || "",
  ]);

  // Combine headers and data
  const csvContent = [headers, ...csvRows]
    .map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  // Create and download the file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `invoices-export-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showNotification("success", "Success", `Exported ${invoices.length} invoices to CSV`);
};

// Format functions
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString();
};

const formatPaymentMethod = (method) => {
  const methods = {
    cash_on_delivery: "Cash on Delivery",
    bank_transfer: "Bank Transfer",
    credit_card: "Credit Card",
    paypal: "PayPal",
  };
  return methods[method] || method;
};

const formatPaymentStatus = (status) => {
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : "";
};

const formatStatus = (status) => {
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : "";
};

const getPaymentStatusClass = (status) => {
  const classes = {
    completed: "badge bg-success",
    pending: "badge bg-warning",
    failed: "badge bg-danger",
  };
  return classes[status] || "badge bg-secondary";
};

const getStatusClass = (status) => {
  const classes = {
    completed: "badge bg-success",
    pending: "badge bg-warning",
    cancelled: "badge bg-danger",
    processing: "badge bg-info",
  };
  return classes[status] || "badge bg-secondary";
};

const viewInvoice = (invoiceId) => {
  const invoice = state.invoices.find((inv) => inv.id === invoiceId);
  if (invoice) {
    showNotification("info", "Info", `Viewing invoice ${invoice.order_no}`);
    // Add your navigation logic here
    // Example: router.push(`/invoices/${invoiceId}`)
  }
};

const editInvoice = (invoiceId) => {
  const invoice = state.invoices.find((inv) => inv.id === invoiceId);
  if (invoice) {
    showNotification("info", "Info", `Editing invoice ${invoice.order_no}`);
    // Add your navigation logic here
    // Example: router.push(`/invoices/${invoiceId}/edit`)
  }
};

const printInvoice = async (invoiceId) => {
  try {
    const invoice = state.invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) {
      showNotification("error", "Error", "Invoice not found");
      return;
    }
    const printContent = generatePrintableInvoice(invoice);
    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
    showNotification("success", "Success", `Invoice ${invoice.order_no} sent to printer`);
  } catch (error) {
    console.error("Error printing invoice:", error);
    showNotification("error", "Error", "Failed to print invoice");
  }
};

const downloadInvoice = async (invoiceId) => {
  try {
    const invoice = state.invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) {
      showNotification("error", "Error", "Invoice not found");
      return;
    }

    downloadAsJSON(invoice);
    showNotification("success", "Success", `Invoice ${invoice.order_no} downloaded`);
  } catch (error) {
    console.error("Error downloading invoice:", error);
    showNotification("error", "Error", "Failed to download invoice");
  }
};

const generatePrintableInvoice = (invoice) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.order_no}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .invoice-details { margin-bottom: 20px; }
        .customer-details { margin-bottom: 20px; }
        .order-details { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
        .total { font-weight: bold; }
        .text-right { text-align: right; }
        @media print {
          body { margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>INVOICE</h1>
        <h2>${invoice.order_no}</h2>
      </div>
      
      <div class="invoice-details">
        <p><strong>Invoice Date:</strong> ${formatDate(invoice.created_at)}</p>
        <p><strong>Order Date:</strong> ${formatDate(invoice.order_date)}</p>
        <p><strong>Status:</strong> ${formatStatus(invoice.status)}</p>
      </div>
      
      <div class="customer-details">
        <h3>Bill To:</h3>
        <p><strong>${invoice.first_name} ${invoice.last_name}</strong></p>
        <p>${invoice.email}</p>
        <p>${invoice.phone}</p>
        <p>${invoice.address_to_receive}</p>
        <p>${invoice.city}, ${invoice.state}</p>
      </div>
      
      <div class="order-details">
        <h3>Order Details:</h3>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${(invoice.order_details || [])
              .map(
                (detail) => `
              <tr>
                <td>Product ID: ${detail.product_id} ${
                  detail.variant_id ? `(Variant: ${detail.variant_id})` : ""
                }</td>
                <td>${detail.qty}</td>
                <td>${detail.price}</td>
                <td>${detail.subtotal}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
      
      <div class="totals">
        <table style="width: 300px; margin-left: auto;">
          <tr>
            <td><strong>Subtotal:</strong></td>
            <td class="text-right">${(
              parseFloat(invoice.total_amount) + parseFloat(invoice.discount_amount || 0)
            ).toFixed(2)}</td>
          </tr>
          ${
            parseFloat(invoice.discount_amount || 0) > 0
              ? `
          <tr>
            <td><strong>Discount:</strong></td>
            <td class="text-right">-${invoice.discount_amount}</td>
          </tr>
          `
              : ""
          }
          <tr class="total">
            <td><strong>Total:</strong></td>
            <td class="text-right"><strong>${invoice.total_amount} ${
    invoice.currency || "USD"
  }</strong></td>
          </tr>
        </table>
      </div>
      
      <div style="margin-top: 30px;">
        <p><strong>Payment Method:</strong> ${formatPaymentMethod(
          invoice.payment_method
        )}</p>
        <p><strong>Payment Status:</strong> ${formatPaymentStatus(
          invoice.payment_status
        )}</p>
        ${invoice.notes ? `<p><strong>Notes:</strong> ${invoice.notes}</p>` : ""}
      </div>
    </body>
    </html>
  `;
};

// Helper function to download data as JSON
const downloadAsJSON = (invoice) => {
  const dataStr = JSON.stringify(invoice, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `invoice-${invoice.order_no}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Initialize component
onMounted(async () => {
  try {
    console.log("Component mounted, fetching invoices...");
    await fetchInvoices();
  } catch (error) {
    console.error("Error during initialization:", error);
    showNotification("error", "Error", "Failed to initialize the component");
    await globalStore.onCheckError(error);
  }
});
</script>

<style scoped>
.invoice-row:hover {
  background-color: rgba(0, 123, 255, 0.05);
}

.advanced-search {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}

.search-box {
  position: relative;
}

.search-input {
  padding-left: 2.5rem;
}

.search-box::before {
  content: "\f002";
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 10;
}

.table th {
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
}

.dropdown-toggle::after {
  display: none;
}

.pagination {
  --bs-pagination-padding-x: 0.5rem;
  --bs-pagination-padding-y: 0.25rem;
}

.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1055;
}

.toast-notification {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 0.375rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
  margin-bottom: 0.5rem;
  padding: 0.75rem;
  min-width: 300px;
}

.toast-notification.success {
  border-left: 4px solid #198754;
}

.toast-notification.error {
  border-left: 4px solid #dc3545;
}

.toast-notification.info {
  border-left: 4px solid #0dcaf0;
}

.toast-icon {
  margin-right: 0.75rem;
  font-size: 1.25rem;
}

.toast-content {
  flex: 1;
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
  color: #6c757d;
  cursor: pointer;
  margin-left: 0.75rem;
}

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
</style>
