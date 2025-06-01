<template>
  <div class="mb-9">
    <div class="row g-2 mb-4">
      <div class="col-auto">
        <h2 class="mb-0">Users with Orders</h2>
      </div>
    </div>
    <div id="orders">
      <div class="mb-4">
        <div class="row g-3 justify-content-between">
          <div class="col-auto">
            <div class="search-box">
              <input
                v-model="searchQuery"
                class="form-control search-input search"
                type="search"
                placeholder="Search users"
              />
            </div>
          </div>
          <div class="col-auto">
            <button
              class="btn btn-outline-secondary"
              @click="toggleFilters"
              :class="{ 'btn-primary': showFilters }"
            >
              <i class="fas fa-filter me-1"></i>
              Filters
              <span v-if="activeFiltersCount > 0" class="badge bg-danger ms-1">
                {{ activeFiltersCount }}
              </span>
            </button>
          </div>
        </div>

        <!-- Filter Panel -->
        <div v-if="showFilters" class="filter-panel mt-3 p-3 bg-light rounded">
          <div class="row g-3">
            <!-- Date Range Filter -->
            <div class="col-md-3">
              <label class="form-label">From Date</label>
              <input
                v-model="filters.dateFrom"
                type="date"
                class="form-control"
                @change="applyFilters"
              />
            </div>
            <div class="col-md-3">
              <label class="form-label">To Date</label>
              <input
                v-model="filters.dateTo"
                type="date"
                class="form-control"
                @change="applyFilters"
              />
            </div>

            <!-- Status Filter -->
            <div class="col-md-3">
              <label class="form-label">Order Status</label>
              <select v-model="filters.status" class="form-select" @change="applyFilters">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <!-- Payment Method Filter -->
            <div class="col-md-3">
              <label class="form-label">Payment Method</label>
              <select
                v-model="filters.paymentMethod"
                class="form-select"
                @change="applyFilters"
              >
                <option value="">All Methods</option>
                <option
                  v-for="method in availablePaymentMethods"
                  :key="method"
                  :value="method"
                >
                  {{ formatPaymentMethod(method) }}
                </option>
              </select>
            </div>

            <!-- Amount Range Filter -->
            <div class="col-md-3">
              <label class="form-label">Min Amount</label>
              <input
                v-model.number="filters.minAmount"
                type="number"
                step="0.01"
                class="form-control"
                placeholder="0.00"
                @input="applyFilters"
              />
            </div>
            <div class="col-md-3">
              <label class="form-label">Max Amount</label>
              <input
                v-model.number="filters.maxAmount"
                type="number"
                step="0.01"
                class="form-control"
                placeholder="999999.99"
                @input="applyFilters"
              />
            </div>

            <!-- Quick Date Filters -->
            <div class="col-md-6">
              <label class="form-label">Quick Date Filters</label>
              <div class="btn-group w-100" role="group">
                <button
                  type="button"
                  class="btn btn-outline-primary btn-sm"
                  @click="setDateFilter('today')"
                >
                  Today
                </button>
                <button
                  type="button"
                  class="btn btn-outline-primary btn-sm"
                  @click="setDateFilter('week')"
                >
                  This Week
                </button>
                <button
                  type="button"
                  class="btn btn-outline-primary btn-sm"
                  @click="setDateFilter('month')"
                >
                  This Month
                </button>
                <button
                  type="button"
                  class="btn btn-outline-primary btn-sm"
                  @click="setDateFilter('year')"
                >
                  This Year
                </button>
              </div>
            </div>
          </div>

          <!-- Filter Actions -->
          <div class="row mt-3">
            <div class="col-12">
              <button class="btn btn-secondary btn-sm me-2" @click="clearFilters">
                <i class="fas fa-times me-1"></i>Clear Filters
              </button>
              <small class="text-muted">
                Found {{ filteredUsers.length }} users with
                {{ totalFilteredOrders }} orders
              </small>
            </div>
          </div>
        </div>
      </div>

      <div v-if="state.isLoading" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-else-if="state.error" class="text-center text-danger">
        {{ state.error }}
      </div>
      <div v-else>
        <!-- Users Table -->
        <div class="table-responsive">
          <table class="table table-sm fs-9 mb-0">
            <thead>
              <tr>
                <th class="align-middle ps-0">#</th>
                <th class="align-middle">Name</th>
                <th class="align-middle">Email</th>
                <th class="align-middle">Phone</th>
                <th class="align-middle">Orders Count</th>
                <th class="align-middle text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredUsers.length === 0">
                <td colspan="6" class="text-center">No users found</td>
              </tr>
              <template
                v-else
                v-for="(userData, userIndex) in filteredUsers"
                :key="userIndex"
              >
                <tr>
                  <td class="align-middle ps-0">{{ userIndex + 1 }}</td>
                  <td class="align-middle">
                    {{ userData.first_name }} {{ userData.last_name }}
                  </td>
                  <td class="align-middle">{{ userData.email }}</td>
                  <td class="align-middle">{{ userData.phone }}</td>
                  <td class="align-middle">{{ userData.filteredOrders.length }}</td>
                  <td class="align-middle text-end">
                    <button
                      class="btn btn-sm btn-primary"
                      @click="toggleUserOrders(userData.user_id)"
                    >
                      {{
                        selectedUserId === userData.user_id
                          ? "Hide Orders"
                          : "View Orders"
                      }}
                    </button>
                  </td>
                </tr>
                <!-- Orders row that expands when user is selected -->
                <tr v-if="selectedUserId === userData.user_id">
                  <td colspan="6" class="p-0">
                    <div class="user-orders-container p-3">
                      <h5 class="mb-3">
                        Orders for {{ userData.first_name }} {{ userData.last_name }}
                        <small class="text-muted"
                          >({{ userData.filteredOrders.length }} orders)</small
                        >
                      </h5>

                      <div class="table-responsive">
                        <table class="table table-sm fs-9 mb-0">
                          <thead>
                            <tr>
                              <th class="align-middle ps-3">#</th>
                              <th class="align-middle">Order No</th>
                              <th class="align-middle">Date</th>
                              <th class="align-middle">Payment Method</th>
                              <th class="align-middle">Total Amount</th>
                              <th class="align-middle text-center">Status</th>
                              <th class="align-middle text-end">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-if="userData.filteredOrders.length === 0">
                              <td colspan="7" class="text-center">No orders found</td>
                            </tr>
                            <tr
                              v-else
                              v-for="(order, index) in userData.filteredOrders"
                              :key="order.order_id"
                            >
                              <td class="align-middle ps-3">{{ index + 1 }}</td>
                              <td class="align-middle">{{ order.order_no }}</td>
                              <td class="align-middle">
                                {{ formatDate(order.created_at) }}
                              </td>
                              <td class="align-middle">
                                {{ formatPaymentMethod(order.payment_method) }}
                              </td>
                              <td class="align-middle">
                                {{ order.currency }} {{ order.total_amount }}
                              </td>
                              <td class="align-middle text-center">
                                <span class="badge" :class="getStatusClass(order.status)">
                                  {{ capitalizeFirstLetter(order.status) }}
                                </span>
                              </td>
                              <td class="align-middle text-end">
                                <button
                                  class="btn btn-sm btn-primary me-2"
                                  @click="viewOrderDetails(order.order_id)"
                                >
                                  <span class="fas fa-eye me-1"></span>View
                                </button>
                                <button
                                  class="btn btn-sm btn-secondary me-2"
                                  @click="updateOrderStatus(order.order_id)"
                                >
                                  <span class="fas fa-edit me-1"></span>Status
                                </button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <div v-if="filteredUsers.length === 0" class="text-center p-4 bg-light rounded">
          <p class="mb-0">No users found matching your search criteria.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Order Details Modal -->
  <div v-if="showOrderModal" class="modal-overlay">
    <div class="modal-content order-modal">
      <div class="modal-header">
        <h4>Order Details</h4>
        <button class="close-btn" @click="closeOrderModal">&times;</button>
      </div>
      <div v-if="state.modalLoading" class="text-center my-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-else-if="state.modalError" class="alert alert-danger">
        {{ state.modalError }}
      </div>
      <div v-else-if="currentOrder" class="modal-body">
        <!-- Order Info -->
        <div class="order-header mb-4" id="printable-order-content">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0">{{ currentOrder.order_no }}</h5>
            <span class="badge" :class="getStatusClass(currentOrder.status)">
              {{ capitalizeFirstLetter(currentOrder.status) }}
            </span>
          </div>
          <div class="order-meta">
            <div class="row">
              <div class="col-md-6">
                <p class="mb-1">
                  <strong>Customer:</strong> {{ currentOrder.first_name }}
                  {{ currentOrder.last_name }}
                </p>
                <p class="mb-1"><strong>Email:</strong> {{ currentOrder.email }}</p>
                <p class="mb-1"><strong>Phone:</strong> {{ currentOrder.phone }}</p>
              </div>
              <div class="col-md-6">
                <p class="mb-1">
                  <strong>Date:</strong> {{ formatDate(currentOrder.created_at) }}
                </p>
                <p class="mb-1">
                  <strong>Payment Method:</strong>
                  {{ formatPaymentMethod(currentOrder.payment_method) }}
                </p>
                <p v-if="currentOrder.notes" class="mb-1">
                  <strong>Notes:</strong> {{ currentOrder.notes }}
                </p>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <h6 class="mb-3 mt-4">Order Items</h6>
          <div class="table-responsive">
            <table class="table table-sm table-bordered">
              <thead class="table-light">
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Variant</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th class="text-end">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!currentOrder.items || currentOrder.items.length === 0">
                  <td colspan="6" class="text-center">No items in this order</td>
                </tr>
                <tr v-else v-for="(item, index) in currentOrder.items" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td>{{ item.product_name }}</td>
                  <td>
                    <div v-if="item.color_name" class="d-flex align-items-center">
                      <span
                        v-if="item.color_code"
                        class="color-sample me-2"
                        :style="{ backgroundColor: item.color_code }"
                      ></span>
                      {{ item.color_name }}
                      <span v-if="item.size" class="ms-1">({{ item.size }})</span>
                    </div>
                    <span v-else>-</span>
                  </td>
                  <td>{{ currentOrder.currency }} {{ item.price }}</td>
                  <td>{{ item.qty }}</td>
                  <td class="text-end">
                    {{ currentOrder.currency }} {{ item.subtotal }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="5" class="text-end"><strong>Subtotal:</strong></td>
                  <td class="text-end">{{ calculateSubtotal() }}</td>
                </tr>
                <tr>
                  <td colspan="5" class="text-end"><strong>Discount:</strong></td>
                  <td class="text-end">
                    -{{ currentOrder.currency }} {{ currentOrder.discount_amount }}
                  </td>
                </tr>
                <tr>
                  <td colspan="5" class="text-end"><strong>Total:</strong></td>
                  <td class="text-end fw-bold">
                    {{ currentOrder.currency }} {{ currentOrder.total_amount }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-success me-2" @click="printOrder">
          <span class="fas fa-print me-1"></span>Print
        </button>
        <button class="btn btn-secondary" @click="closeOrderModal">Close</button>
      </div>
    </div>
  </div>

  <!-- Status Update Modal -->
  <div v-if="showStatusModal" class="modal-overlay">
    <div class="modal-content status-modal">
      <div class="modal-header">
        <h4>Update Order Status</h4>
        <button class="close-btn" @click="closeStatusModal">&times;</button>
      </div>
      <div v-if="state.statusModalError" class="alert alert-danger">
        {{ state.statusModalError }}
      </div>
      <form class="needs-validation" novalidate @submit.prevent="submitStatusUpdate">
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label" for="orderStatus">Status</label>
            <select v-model="newStatus" class="form-select" id="orderStatus" required>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" type="button" @click="closeStatusModal">
            Cancel
          </button>
          <button class="btn btn-primary" type="submit" :disabled="state.isSubmitting">
            {{ state.isSubmitting ? "Processing..." : "Update Status" }}
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
</template>

<script setup>
import "@/assets/css/toast-styles.css";
import { useToast } from "@/composables/useToast";
import { useGlobalStore } from "@/stores/global";
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";

const { toasts, showNotification, removeToast } = useToast();
const state = reactive({
  users: [],
  isLoading: false,
  error: null,
  modalLoading: false,
  modalError: null,
  statusModalError: null,
  isSubmitting: false,
});

// Search and Filter states
const searchQuery = ref("");
const showFilters = ref(false);
const filters = reactive({
  dateFrom: "",
  dateTo: "",
  status: "",
  paymentMethod: "",
  minAmount: null,
  maxAmount: null,
});

// Modal states
const showOrderModal = ref(false);
const showStatusModal = ref(false);
const currentOrder = ref(null);
const currentOrderId = ref(null);
const newStatus = ref("pending");
const selectedUserId = ref(null);

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return "";
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

const formatPaymentMethod = (method) => {
  if (!method) return "";
  return method
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const capitalizeFirstLetter = (string) => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const getStatusClass = (status) => {
  switch (status) {
    case "pending":
      return "bg-warning";
    case "processing":
      return "bg-info";
    case "shipped":
      return "bg-primary";
    case "delivered":
      return "bg-success";
    case "completed":
      return "bg-success";
    case "cancelled":
      return "bg-danger";
    default:
      return "bg-secondary";
  }
};

// Filter functions
const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const activeFiltersCount = computed(() => {
  let count = 0;
  if (filters.dateFrom) count++;
  if (filters.dateTo) count++;
  if (filters.status) count++;
  if (filters.paymentMethod) count++;
  if (filters.minAmount !== null && filters.minAmount !== "") count++;
  if (filters.maxAmount !== null && filters.maxAmount !== "") count++;
  return count;
});

const availablePaymentMethods = computed(() => {
  const methods = new Set();
  state.users.forEach((user) => {
    user.orders.forEach((order) => {
      if (order.payment_method) {
        methods.add(order.payment_method);
      }
    });
  });
  return Array.from(methods).sort();
});

const setDateFilter = (period) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case "today":
      filters.dateFrom = today.toISOString().split("T")[0];
      filters.dateTo = today.toISOString().split("T")[0];
      break;
    case "week":
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      filters.dateFrom = weekStart.toISOString().split("T")[0];
      filters.dateTo = today.toISOString().split("T")[0];
      break;
    case "month":
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      filters.dateFrom = monthStart.toISOString().split("T")[0];
      filters.dateTo = today.toISOString().split("T")[0];
      break;
    case "year":
      const yearStart = new Date(today.getFullYear(), 0, 1);
      filters.dateFrom = yearStart.toISOString().split("T")[0];
      filters.dateTo = today.toISOString().split("T")[0];
      break;
  }
  applyFilters();
};

const clearFilters = () => {
  filters.dateFrom = "";
  filters.dateTo = "";
  filters.status = "";
  filters.paymentMethod = "";
  filters.minAmount = null;
  filters.maxAmount = null;
  applyFilters();
};

const applyFilters = () => {
  // Trigger reactivity by updating a reactive property
  // The computed filteredUsers will automatically recalculate
};

const isOrderInDateRange = (orderDate) => {
  if (!filters.dateFrom && !filters.dateTo) return true;

  const date = new Date(orderDate);
  const from = filters.dateFrom ? new Date(filters.dateFrom) : null;
  const to = filters.dateTo ? new Date(filters.dateTo + "T23:59:59") : null;

  if (from && date < from) return false;
  if (to && date > to) return false;

  return true;
};

const isOrderMatchingFilters = (order) => {
  // Date filter
  if (!isOrderInDateRange(order.created_at)) return false;

  // Status filter
  if (filters.status && order.status !== filters.status) return false;

  // Payment method filter
  if (filters.paymentMethod && order.payment_method !== filters.paymentMethod)
    return false;

  // Amount filters
  const amount = parseFloat(order.total_amount);
  if (
    filters.minAmount !== null &&
    filters.minAmount !== "" &&
    amount < filters.minAmount
  )
    return false;
  if (
    filters.maxAmount !== null &&
    filters.maxAmount !== "" &&
    amount > filters.maxAmount
  )
    return false;

  return true;
};

const filteredUsers = computed(() => {
  let users = state.users;

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    users = users.filter((user) => {
      return (
        user.first_name.toLowerCase().includes(query) ||
        user.last_name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone.includes(query)
      );
    });
  }

  // Apply order filters and add filteredOrders to each user
  return users
    .map((user) => {
      const filteredOrders = user.orders.filter(isOrderMatchingFilters);
      return {
        ...user,
        filteredOrders,
      };
    })
    .filter((user) => user.filteredOrders.length > 0); // Only show users with matching orders
});

const totalFilteredOrders = computed(() => {
  return filteredUsers.value.reduce(
    (total, user) => total + user.filteredOrders.length,
    0
  );
});

const toggleUserOrders = (userId) => {
  if (selectedUserId.value === userId) {
    selectedUserId.value = null;
  } else {
    selectedUserId.value = userId;
  }
};

const selectedUserOrders = computed(() => {
  if (!selectedUserId.value) return [];
  const user = filteredUsers.value.find((u) => u.user_id === selectedUserId.value);
  return user ? user.filteredOrders : [];
});

const fetchOrders = async () => {
  state.isLoading = true;
  state.error = null;
  const globalStore = useGlobalStore();
  try {
    const res = await axios.get("/api/web/product/order", globalStore.getAxiosHeader());
    if (res.data.error === false && Array.isArray(res.data.data)) {
      state.users = res.data.data;
    } else {
      state.error = res.data.message || "Failed to fetch orders";
      showNotification("error", "Error", state.error);
    }
  } catch (error) {
    state.error = "An error occurred while fetching orders.";
    showNotification("error", "Error", state.error);
  } finally {
    state.isLoading = false;
  }
};

const viewOrderDetails = async (orderId) => {
  currentOrderId.value = orderId;
  showOrderModal.value = true;
  state.modalLoading = true;
  state.modalError = null;
  const globalStore = useGlobalStore();
  try {
    const res = await axios.get(
      `/api/web/product/order/${orderId}`,
      globalStore.getAxiosHeader()
    );
    if (res.data.error === false) {
      currentOrder.value = res.data.data;
    } else {
      state.modalError = res.data.message || "Failed to fetch order details";
    }
  } catch (error) {
    state.modalError = "An error occurred while fetching order details.";
  } finally {
    state.modalLoading = false;
  }
};

const closeOrderModal = () => {
  showOrderModal.value = false;
  currentOrder.value = null;
  currentOrderId.value = null;
};

const updateOrderStatus = (orderId) => {
  currentOrderId.value = orderId;
  let currentStatus = "pending";
  for (const user of state.users) {
    const order = user.orders.find((o) => o.order_id === orderId);
    if (order) {
      currentStatus = order.status;
      break;
    }
  }
  newStatus.value = currentStatus;
  showStatusModal.value = true;
};

const closeStatusModal = () => {
  showStatusModal.value = false;
  currentOrderId.value = null;
  state.statusModalError = null;
};

const submitStatusUpdate = async () => {
  if (!currentOrderId.value || !newStatus.value) {
    state.statusModalError = "Order ID and status are required";
    return;
  }
  state.isSubmitting = true;
  state.statusModalError = null;
  const globalStore = useGlobalStore();
  try {
    const res = await axios.put(
      `/api/web/product/order/update/status/${currentOrderId.value}`,
      { status: newStatus.value },
      globalStore.getAxiosHeader()
    );
    if (res.data.error === false) {
      for (const user of state.users) {
        const order = user.orders.find((o) => o.order_id === currentOrderId.value);
        if (order) {
          order.status = newStatus.value;
          break;
        }
      }
      closeStatusModal();
      showNotification("success", "Success", "Order status updated successfully!");
    } else {
      state.statusModalError = res.data.message || "Failed to update order status";
    }
  } catch (error) {
    state.statusModalError = "An error occurred while updating the order status.";
  } finally {
    state.isSubmitting = false;
  }
};

const calculateSubtotal = () => {
  if (!currentOrder.value || !currentOrder.value.items) return "0.00";
  const subtotal = currentOrder.value.items.reduce((total, item) => {
    return total + parseFloat(item.subtotal || 0);
  }, 0);
  return `${currentOrder.value.currency} ${subtotal.toFixed(2)}`;
};

// Print function
const printOrder = () => {
  if (!currentOrder.value) return;

  const printWindow = window.open("", "_blank");
  const orderContent = document.getElementById("printable-order-content");
  if (!orderContent) return;

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order ${currentOrder.value.order_no}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .order-header {
          border-bottom: 2px solid #ddd;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .order-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .order-title h1 {
          margin: 0;
          color: #2c3e50;
        }
        .status-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 12px;
        }
        .status-pending { background-color: #fff3cd; color: #856404; }
        .status-processing { background-color: #d1ecf1; color: #0c5460; }
        .status-shipped { background-color: #cce5ff; color: #004085; }
        .status-delivered, .status-completed { background-color: #d4edda; color: #155724; }
        .status-cancelled { background-color: #f8d7da; color: #721c24; }
        .customer-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }
        .info-section p {
          margin: 5px 0;
        }
        .info-section strong {
          color: #2c3e50;
        }
        .items-section h2 {
          color: #2c3e50;
          border-bottom: 1px solid #ddd;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          padding: 12px 8px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background-color: #f8f9fa;
          font-weight: bold;
          color: #2c3e50;
        }
        .text-end {
          text-align: right;
        }
        .color-sample {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 1px solid #ddd;
          display: inline-block;
          margin-right: 8px;
          vertical-align: middle;
        }
        .total-row {
          font-weight: bold;
          background-color: #f8f9fa;
        }
        .print-date {
          text-align: center;
          color: #666;
          font-size: 12px;
          margin-top: 30px;
          border-top: 1px solid #ddd;
          padding-top: 15px;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="order-header">
        <div class="order-title">
          <h1>Order ${currentOrder.value.order_no}</h1>
          <span class="status-badge status-${currentOrder.value.status}">
            ${capitalizeFirstLetter(currentOrder.value.status)}
          </span>
        </div>
        
        <div class="customer-info">
          <div class="info-section">
            <p><strong>Customer:</strong> ${currentOrder.value.first_name} ${
    currentOrder.value.last_name
  }</p>
            <p><strong>Email:</strong> ${currentOrder.value.email}</p>
            <p><strong>Phone:</strong> ${currentOrder.value.phone}</p>
          </div>
          <div class="info-section">
            <p><strong>Date:</strong> ${formatDate(currentOrder.value.created_at)}</p>
            <p><strong>Payment Method:</strong> ${formatPaymentMethod(
              currentOrder.value.payment_method
            )}</p>
            ${
              currentOrder.value.notes
                ? `<p><strong>Notes:</strong> ${currentOrder.value.notes}</p>`
                : ""
            }
          </div>
        </div>
      </div>

      <div class="items-section">
        <h2>Order Items</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Variant</th>
              <th>Price</th>
              <th>Qty</th>
              <th class="text-end">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${
              currentOrder.value.items && currentOrder.value.items.length > 0
                ? currentOrder.value.items
                    .map(
                      (item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.product_name}</td>
                  <td>
                    ${
                      item.color_name
                        ? `
                      ${
                        item.color_code
                          ? `<span class="color-sample" style="background-color: ${item.color_code}"></span>`
                          : ""
                      }
                      ${item.color_name}${item.size ? ` (${item.size})` : ""}
                    `
                        : "-"
                    }
                  </td>
                  <td>${currentOrder.value.currency} ${item.price}</td>
                  <td>${item.qty}</td>
                  <td class="text-end">${currentOrder.value.currency} ${
                        item.subtotal
                      }</td>
                </tr>
              `
                    )
                    .join("")
                : '<tr><td colspan="6" style="text-align: center;">No items in this order</td></tr>'
            }
          </tbody>
          <tfoot>
            <tr>
              <td colspan="5" class="text-end"><strong>Subtotal:</strong></td>
              <td class="text-end">${calculateSubtotal()}</td>
            </tr>
            <tr>
              <td colspan="5" class="text-end"><strong>Discount:</strong></td>
              <td class="text-end">-${currentOrder.value.currency} ${
    currentOrder.value.discount_amount
  }</td>
            </tr>
            <tr class="total-row">
              <td colspan="5" class="text-end"><strong>Total:</strong></td>
              <td class="text-end"><strong>${currentOrder.value.currency} ${
    currentOrder.value.total_amount
  }</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="print-date">
        Printed on ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
};

onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
/* Filter Panel Styles */
.filter-panel {
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

.filter-panel .btn-group .btn {
  font-size: 0.8rem;
  padding: 0.375rem 0.5rem;
}

/* Badge styles for active filters */
.badge {
  font-size: 0.65rem;
}

/* Search box enhancement */
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

/* Enhanced button styles */
.btn-outline-secondary:hover {
  background-color: #6c757d;
  border-color: #6c757d;
  color: white;
}

.btn.btn-primary {
  background-color: #4e73df;
  border-color: #4e73df;
}

/* Form control enhancements */
.form-control:focus,
.form-select:focus {
  border-color: #4e73df;
  box-shadow: 0 0 0 0.2rem rgba(78, 115, 223, 0.25);
}

/* Filter statistics */
.text-muted {
  font-size: 0.85rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .filter-panel .col-md-3,
  .filter-panel .col-md-6 {
    margin-bottom: 1rem;
  }

  .btn-group {
    flex-direction: column;
  }

  .btn-group .btn {
    border-radius: 0.375rem !important;
    margin-bottom: 0.25rem;
  }
}

/* Table enhancements */
.table th {
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
  color: #495057;
}

.table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.025);
}

/* User orders container enhancements */
.user-orders-container {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-left: 4px solid #4e73df;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

.user-orders-container h5 {
  color: #495057;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 0.5rem;
}

/* Status badge enhancements */
.badge {
  font-size: 0.75rem;
  padding: 0.35em 0.65em;
  font-weight: 500;
}

.badge.bg-warning {
  color: #000;
}

/* Loading and error states */
.spinner-border {
  width: 2rem;
  height: 2rem;
}

.text-danger {
  font-weight: 500;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.order-modal {
  max-height: 90vh;
  max-width: 800px;
}

.status-modal {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  max-height: calc(90vh - 130px);
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.close-btn:hover {
  opacity: 1;
}

/* User rows styles */
.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  background-color: #f8f9fa;
}

.selected-row {
  background-color: rgba(78, 115, 223, 0.1);
  border-left: 4px solid #4e73df;
}

/* Color sample */
.color-sample {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #dee2e6;
}

/* Toast Styles */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 350px;
}

.toast-notification {
  display: flex;
  background: white;
  border-radius: 6px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  margin-bottom: 15px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.toast-icon {
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
}

.toast-notification.success .toast-icon {
  background: #d4edda;
  color: #155724;
}

.toast-notification.error .toast-icon {
  background: #f8d7da;
  color: #721c24;
}

.toast-content {
  padding: 15px;
  flex: 1;
}

.toast-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.toast-close {
  background: none;
  border: none;
  font-size: 20px;
  padding: 10px;
  cursor: pointer;
  opacity: 0.6;
}

.toast-close:hover {
  opacity: 1;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Print-specific styles */
@media print {
  .modal-overlay,
  .modal-content,
  .modal-header,
  .modal-footer,
  .toast-container {
    display: none !important;
  }
}
</style>
