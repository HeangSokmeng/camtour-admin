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
                  <td class="align-middle">{{ userData.orders.length }}</td>
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
                            <tr v-if="userData.orders.length === 0">
                              <td colspan="7" class="text-center">No orders found</td>
                            </tr>
                            <tr
                              v-else
                              v-for="(order, index) in userData.orders"
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
        <div class="order-header mb-4">
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
        </div>

        <!-- Order Items -->
        <h6 class="mb-3">Order Items</h6>
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
                <td class="text-end">{{ currentOrder.currency }} {{ item.subtotal }}</td>
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
      <div class="modal-footer">
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

// Get toast functionality from the composable
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

const searchQuery = ref("");
const showOrderModal = ref(false);
const showStatusModal = ref(false);
const currentOrder = ref(null);
const currentOrderId = ref(null);
const newStatus = ref("pending");
const selectedUserId = ref(null);

// Format date utility function
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

// Format payment method
const formatPaymentMethod = (method) => {
  if (!method) return "";

  return method
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Capitalize first letter
const capitalizeFirstLetter = (string) => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Get status badge class
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

// Toggle user orders display
const toggleUserOrders = (userId) => {
  if (selectedUserId.value === userId) {
    selectedUserId.value = null; // Hide orders if already showing
  } else {
    selectedUserId.value = userId; // Show orders for this user
  }
};

// Get selected user's orders
const selectedUserOrders = computed(() => {
  if (!selectedUserId.value) return [];
  const user = state.users.find((u) => u.user_id === selectedUserId.value);
  return user ? user.orders : [];
});

// Get selected user's name
const selectedUserName = computed(() => {
  if (!selectedUserId.value) return "";

  const user = state.users.find((u) => u.user_id === selectedUserId.value);
  return user ? `${user.first_name} ${user.last_name}` : "";
});

// Fetch orders from API
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

// Filter users based on search query
const filteredUsers = computed(() => {
  if (!searchQuery.value) return state.users;

  const query = searchQuery.value.toLowerCase();
  return state.users.filter((user) => {
    return (
      user.first_name.toLowerCase().includes(query) ||
      user.last_name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.phone.includes(query)
    );
  });
});

// View order details
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

// Close order details modal
const closeOrderModal = () => {
  showOrderModal.value = false;
  currentOrder.value = null;
  currentOrderId.value = null;
};

// Update order status
const updateOrderStatus = (orderId) => {
  currentOrderId.value = orderId;

  // Find the current status of the order
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

// Close status update modal
const closeStatusModal = () => {
  showStatusModal.value = false;
  currentOrderId.value = null;
  state.statusModalError = null;
};

// Submit status update
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
      // Update the status in the local state
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

// Calculate subtotal
const calculateSubtotal = () => {
  if (!currentOrder.value || !currentOrder.value.items) return "0.00";

  const subtotal = currentOrder.value.items.reduce((total, item) => {
    return total + parseFloat(item.subtotal || 0);
  }, 0);

  return `${currentOrder.value.currency} ${subtotal.toFixed(2)}`;
};

// Fetch data on component mount
onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
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

/* User orders container */
.user-orders-container {
  background-color: #f8f9fa;
  border-radius: 0.5rem;
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

/* User orders styles */
.user-info {
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
</style>
