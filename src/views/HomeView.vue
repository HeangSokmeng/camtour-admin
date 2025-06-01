<template>
  <div class="dashboard">
    <!-- Header -->
    <div class="header">
      <div>
        <h1><i class="fas fa-mountain"></i> CamTour Recommender</h1>
        <p class="subtitle">Mountain Trails • Outdoor Gear • Adventure Analytics</p>
      </div>
      <div class="controls">
        <select v-model="timeRange" class="time-selector" @change="fetchDashboardData">
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 3 Months</option>
          <option value="1y">Last Year</option>
        </select>
        <button @click="refreshData" class="refresh-btn" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ spinner: loading }"></i>
          Refresh
        </button>
      </div>
    </div>

    <!-- Hero Cards Section -->
    <div class="hero-cards">
      <div
        class="hero-card"
        style="
          background-image: linear-gradient(45deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2)),
            url('https://cms-image-bucket-production-ap-northeast-1-a7d2.s3.ap-northeast-1.amazonaws.com/images/7/3/5/9/23219537-1-eng-GB/003.jpg');
        "
      >
        <div class="hero-content">
          <h3>Cardamom Mountains</h3>
          <div class="hero-location">
            <i class="fas fa-map-marker-alt"></i>
            Cambodia
          </div>
          <div class="hero-rating">
            <i class="fas fa-star"></i>
            4.8
          </div>
        </div>
      </div>

      <div
        class="hero-card"
        style="
          background-image: linear-gradient(45deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2)),
            url('https://travelsetu.com/apps/uploads/new_destinations_photos/destination/2024/06/28/c6223b7daeeb62fecc8f97165691d895_1000x1000.jpg');
        "
      >
        <div class="hero-content">
          <h3>Elephant Mountains</h3>
          <div class="hero-location">
            <i class="fas fa-map-marker-alt"></i>
            Koh Kong
          </div>
          <div class="hero-rating">
            <i class="fas fa-star"></i>
            4.6
          </div>
        </div>
      </div>

      <div
        class="hero-card"
        style="
          background-image: linear-gradient(45deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2)),
            url('https://preview.redd.it/kulen-mountain-waterfall-in-siem-reap-cambodia-v0-1dgyq7e834z91.jpg?width=640&crop=smart&auto=webp&s=3954821b909492435fd095d30ada2ca1c0bf45db');
        "
      >
        <div class="hero-content">
          <h3>Kulen Mountain</h3>
          <div class="hero-location">
            <i class="fas fa-map-marker-alt"></i>
            Siem Reap
          </div>
          <div class="hero-rating">
            <i class="fas fa-star"></i>
            4.9
          </div>
        </div>
      </div>
    </div>
    <div class="stats-grid" v-if="dashboardStats">
      <div class="stat-card">
        <div class="stat-header">
          <div>
            <div class="stat-value">
              {{ formatNumber(dashboardStats.total_locations) }}
            </div>
            <div class="stat-label">Hiking Trails</div>
          </div>
          <div class="stat-icon trails">
            <i class="fas fa-hiking"></i>
          </div>
        </div>
        <div class="stat-change positive">
          <i class="fas fa-arrow-up"></i>
          Active trails
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <div>
            <div class="stat-value">
              {{ formatNumber(dashboardStats.total_products) }}
            </div>
            <div class="stat-label">Outdoor Gear</div>
          </div>
          <div class="stat-icon gear">
            <i class="fas fa-backpack"></i>
          </div>
        </div>
        <div class="stat-change positive">
          <i class="fas fa-arrow-up"></i>
          Available gear
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <div>
            <div class="stat-value">{{ formatNumber(dashboardStats.total_users) }}</div>
            <div class="stat-label">Adventurers</div>
          </div>
          <div class="stat-icon adventurers">
            <i class="fas fa-users"></i>
          </div>
        </div>
        <div class="stat-change positive">
          <i class="fas fa-arrow-up"></i>
          Registered hikers
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <div>
            <div class="stat-value">{{ formatNumber(dashboardStats.total_views) }}</div>
            <div class="stat-label">Trail Views</div>
          </div>
          <div class="stat-icon views">
            <i class="fas fa-binoculars"></i>
          </div>
        </div>
        <div class="stat-change positive">
          <i class="fas fa-arrow-up"></i>
          Trail explorations
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <div>
            <div class="stat-value">
              {{ dashboardStats.average_location_rating?.toFixed(1) || "0.0" }}
            </div>
            <div class="stat-label">Trail Rating</div>
          </div>
          <div class="stat-icon rating">
            <i class="fas fa-medal"></i>
          </div>
        </div>
        <div class="stat-change positive">
          <i class="fas fa-arrow-up"></i>
          Average rating
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <div>
            <div class="stat-value">
              {{ dashboardStats.average_product_rating?.toFixed(1) || "0.0" }}
            </div>
            <div class="stat-label">Gear Rating</div>
          </div>
          <div class="stat-icon gear-rating">
            <i class="fas fa-award"></i>
          </div>
        </div>
        <div class="stat-change positive">
          <i class="fas fa-arrow-up"></i>
          Gear quality
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <div>
            <div class="stat-value">
              {{ formatNumber(dashboardStats.total_categories) }}
            </div>
            <div class="stat-label">Trail Types</div>
          </div>
          <div class="stat-icon trail-types">
            <i class="fas fa-route"></i>
          </div>
        </div>
        <div class="stat-change positive">
          <i class="fas fa-arrow-up"></i>
          Trail categories
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <div>
            <div class="stat-value">
              {{ formatNumber(dashboardStats.total_provinces) }}
            </div>
            <div class="stat-label">Provinces</div>
          </div>
          <div class="stat-icon regions">
            <i class="fas fa-map-marked"></i>
          </div>
        </div>
        <div class="stat-change positive">
          <i class="fas fa-arrow-up"></i>
          Hiking regions
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="section-header">
      <h2>Trail Insights 📊</h2>
      <p>Discover popular hiking destinations and trail categories</p>
    </div>
    <div class="charts-grid">
      <div class="chart-card">
        <div class="chart-title">
          <i class="fas fa-mountain"></i>
          Trails by Category
        </div>
        <div class="chart-container">
          <canvas ref="categoryChart"></canvas>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-title">
          <i class="fas fa-map-signs"></i>
          Trails by Region
        </div>
        <div class="chart-container">
          <canvas ref="provinceChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Bottom Section -->
    <div class="bottom-section">
      <div class="data-table">
        <div class="table-header">
          <i class="fas fa-trophy"></i>
          Top Hiking Trails
        </div>
        <div class="table-content">
          <div v-for="location in topLocations" :key="location.id" class="table-row">
            <div class="location-info">
              <div class="location-name">{{ location.name }}</div>
              <div class="location-details">
                {{ location.province }} • {{ location.category }}
              </div>
            </div>
            <div class="location-stats">
              <span
                ><i class="fas fa-eye"></i> {{ formatNumber(location.total_views) }}</span
              >
              <span
                ><i class="fas fa-star"></i>
                {{ location.average_rating?.toFixed(1) || "N/A" }}</span
              >
              <span
                ><i class="fas fa-dollar-sign"></i> ${{ location.min_price }}-${{
                  location.max_price
                }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="data-table">
        <div class="table-header">
          <i class="fas fa-tools"></i>
          Top Outdoor Gear
        </div>
        <div class="table-content">
          <div v-for="product in topProducts" :key="product.id" class="table-row">
            <div class="location-info">
              <div class="location-name">{{ product.name }}</div>
              <div class="location-details">
                {{ product.brand }} • {{ product.category }}
              </div>
            </div>
            <div class="location-stats">
              <span
                ><i class="fas fa-eye"></i> {{ formatNumber(product.total_views) }}</span
              >
              <span
                ><i class="fas fa-star"></i>
                {{ product.average_rating?.toFixed(1) || "N/A" }}</span
              >
              <span><i class="fas fa-dollar-sign"></i> ${{ product.price }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="state.isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading dashboard data...</p>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="state.error" class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ state.error }}</p>
      <button @click="fetchDashboardData" class="retry-btn">Retry</button>
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
            <i :class="getToastIcon(toast.type)"></i>
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
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";

// Initialize global store
const globalStore = useGlobalStore();

// State management
const state = reactive({
  isLoading: false,
  error: null,
});

// UI state
const timeRange = ref("30d");
const categoryChart = ref(null);
const provinceChart = ref(null);

// Dashboard data
const dashboardStats = ref(null);
const topLocations = ref([]);
const topProducts = ref([]);
const categoryData = ref([]);
const provinceData = ref([]);

// Chart instances
let categoryChartInstance = null;
let provinceChartInstance = null;

// Toast notifications
const toasts = ref([]);
let nextToastId = 1;

const showNotification = (type, title, message) => {
  const id = nextToastId++;
  toasts.value.push({ id, type, title, message });

  // Auto-remove after 5 seconds
  setTimeout(() => {
    removeToast(id);
  }, 5000);
};

const removeToast = (id) => {
  toasts.value = toasts.value.filter((toast) => toast.id !== id);
};

// Methods
const formatNumber = (num) => {
  if (!num) return "0";
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

const fetchDashboardStats = async () => {
  state.isLoading = true;
  state.error = null;

  try {
    const params = new URLSearchParams();
    if (timeRange.value) params.append("time_range", timeRange.value);

    const res = await axios.get(
      `/api/dashboard/stats?${params.toString()}`,
      globalStore.getAxiosHeader()
    );

    if (res.data.status === "OK") {
      dashboardStats.value = res.data.data || {};
    } else {
      state.error = res.data.message || "Failed to fetch dashboard stats";
      showNotification("error", "Error", state.error);
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    state.error = "An error occurred while fetching dashboard stats.";
    showNotification("error", "Error", state.error);
    await globalStore.onCheckError(error);
  }
};

const fetchTopLocations = async () => {
  try {
    const res = await axios.get(
      "/api/dashboard/locations/top?limit=10",
      globalStore.getAxiosHeader()
    );

    if (res.data.status === "OK") {
      topLocations.value = res.data.data || [];
    } else {
      console.error("Failed to fetch top locations:", res.data.message);
    }
  } catch (error) {
    console.error("Error fetching top locations:", error);
    await globalStore.onCheckError(error);
  }
};

const fetchTopProducts = async () => {
  try {
    const res = await axios.get(
      "/api/dashboard/products/top?limit=10",
      globalStore.getAxiosHeader()
    );

    if (res.data.status === "OK") {
      topProducts.value = res.data.data || [];
    } else {
      console.error("Failed to fetch top products:", res.data.message);
    }
  } catch (error) {
    console.error("Error fetching top products:", error);
    await globalStore.onCheckError(error);
  }
};

const fetchCategoryData = async () => {
  try {
    const res = await axios.get(
      "/api/dashboard/locations/by-category",
      globalStore.getAxiosHeader()
    );

    if (res.data.status === "OK") {
      categoryData.value = res.data.data || [];
    } else {
      console.error("Failed to fetch category data:", res.data.message);
    }
  } catch (error) {
    console.error("Error fetching category data:", error);
    await globalStore.onCheckError(error);
  }
};

const fetchProvinceData = async () => {
  try {
    const res = await axios.get(
      "/api/dashboard/locations/by-province",
      globalStore.getAxiosHeader()
    );

    if (res.data.status === "OK") {
      provinceData.value = res.data.data || [];
    } else {
      console.error("Failed to fetch province data:", res.data.message);
    }
  } catch (error) {
    console.error("Error fetching province data:", error);
    await globalStore.onCheckError(error);
  }
};

const fetchDashboardData = async () => {
  state.isLoading = true;
  state.error = null;

  try {
    // Fetch all dashboard data
    await Promise.all([
      fetchDashboardStats(),
      fetchTopLocations(),
      fetchTopProducts(),
      fetchCategoryData(),
      fetchProvinceData(),
    ]);

    // Update charts after data is loaded
    await nextTick();
    initCharts();

    showNotification("success", "Success", "Dashboard data updated successfully");
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    state.error = err.response?.data?.message || "Failed to load dashboard data";
    showNotification("error", "Error", state.error);
  } finally {
    state.isLoading = false;
  }
};

const refreshData = async () => {
  await fetchDashboardData();
};

const initCharts = () => {
  // Check if Chart.js is available
  if (typeof Chart === "undefined") {
    console.warn("Chart.js not found. Please include Chart.js library.");
    return;
  }

  // Destroy existing charts
  if (categoryChartInstance) {
    categoryChartInstance.destroy();
  }
  if (provinceChartInstance) {
    provinceChartInstance.destroy();
  }

  // Category Chart
  if (categoryChart.value && categoryData.value.length > 0) {
    categoryChartInstance = new Chart(categoryChart.value, {
      type: "doughnut",
      data: {
        labels: categoryData.value.map((item) => item.category),
        datasets: [
          {
            data: categoryData.value.map((item) => item.location_count),
            backgroundColor: [
              "#ff6b6b",
              "#4ecdc4",
              "#45b7d1",
              "#f9ca24",
              "#6c5ce7",
              "#00b894",
              "#fdcb6e",
              "#e17055",
            ],
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value = context.formattedValue;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.parsed * 100) / total).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  }

  // Province Chart
  if (provinceChart.value && provinceData.value.length > 0) {
    provinceChartInstance = new Chart(provinceChart.value, {
      type: "bar",
      data: {
        labels: provinceData.value.map((item) => item.province_en || item.province),
        datasets: [
          {
            label: "Locations",
            data: provinceData.value.map((item) => item.location_count),
            backgroundColor: "rgba(102, 126, 234, 0.8)",
            borderColor: "#667eea",
            borderWidth: 2,
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              afterLabel: function (context) {
                const dataIndex = context.dataIndex;
                const views = provinceData.value[dataIndex]?.total_views || 0;
                return `Total Views: ${formatNumber(views)}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(0,0,0,0.1)",
            },
            ticks: {
              font: {
                size: 11,
              },
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: {
                size: 11,
              },
              maxRotation: 45,
            },
          },
        },
      },
    });
  }
};

const getToastIcon = (type) => {
  switch (type) {
    case "success":
      return "fas fa-check-circle";
    case "error":
      return "fas fa-exclamation-circle";
    case "warning":
      return "fas fa-exclamation-triangle";
    case "info":
      return "fas fa-info-circle";
    default:
      return "fas fa-info-circle";
  }
};

// Lifecycle hooks
onMounted(async () => {
  await fetchDashboardData();
});

// Cleanup
onBeforeUnmount(() => {
  if (categoryChartInstance) {
    categoryChartInstance.destroy();
  }
  if (provinceChartInstance) {
    provinceChartInstance.destroy();
  }
});
</script>

<style scoped>
.dashboard {
  padding: 5px;
  max-width: 1400px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f8fffe 0%, #f0f9ff 100%);
  min-height: 100vh;
  position: relative;
}

/* Hero Cards Section */
.hero-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.hero-card {
  height: 240px;
  border-radius: 20px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  position: relative;
  overflow: hidden;
  /* box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); */
  transition: all 0.4s ease;
}

.hero-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.hero-content {
  padding: 25px;
  color: white;
  width: 100%;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
}

.hero-content h3 {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  color: white;
}

.hero-location {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 1rem;
  opacity: 0.9;
}

.hero-rating {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 1.1rem;
}

/* Section Headers */
.section-header {
  text-align: center;
  margin-bottom: 30px;
}

.section-header h2 {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1e40af;
  margin-bottom: 8px;
}

.section-header p {
  font-size: 1.1rem;
  color: #64748b;
  font-weight: 500;
}

.header {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  padding: 30px;
  border-radius: 24px;
  /* box-shadow: 0 8px 32px rgba(30, 64, 175, 0.1); */
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.header h1 {
  color: #1a7e8c;
  font-size: 2.4rem;
  font-weight: 800;
  margin: 0;
  text-shadow: 0 2px 4px rgba(30, 64, 175, 0.1);
}

.header .subtitle {
  color: #3b82f6;
  font-size: 1.2rem;
  margin-top: 8px;
  font-weight: 600;
}

.controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.time-selector {
  padding: 12px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.time-selector:hover,
.time-selector:focus {
  border-color: #3b82f6;
  outline: none;
  /* box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); */
}

.refresh-btn {
  background: linear-gradient(135deg, #3b82f6, #1a7e8c);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  /* box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); */
}

.refresh-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  /* box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4); */
}

.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
}

.toast-notification {
  background: white;
  border-radius: 8px;
  /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); */
  margin-bottom: 10px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  max-width: 400px;
  position: relative;
  border-left: 4px solid;
}

.toast-notification.success {
  border-left-color: #28a745;
}

.toast-notification.error {
  border-left-color: #dc3545;
}

.toast-notification.warning {
  border-left-color: #ffc107;
}

.toast-notification.info {
  border-left-color: #17a2b8;
}

.toast-icon {
  margin-right: 12px;
  font-size: 20px;
}

.toast-notification.success .toast-icon {
  color: #28a745;
}

.toast-notification.error .toast-icon {
  color: #dc3545;
}

.toast-notification.warning .toast-icon {
  color: #ffc107;
}

.toast-notification.info .toast-icon {
  color: #17a2b8;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-weight: bold;
  margin-bottom: 4px;
}

.toast-message {
  font-size: 14px;
  color: #6c757d;
}

.toast-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #6c757d;
  margin-left: 12px;
  padding: 0;
  line-height: 1;
}

.toast-close:hover {
  color: #000;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 15px;
  /* box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(45deg, #667eea, #764ba2);
}

.stat-card:hover {
  transform: translateY(-5px);
  /* box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15); */
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.locations {
  background: linear-gradient(45deg, #ff6b6b, #ee5a52);
}
.stat-icon.products {
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
}
.stat-icon.users {
  background: linear-gradient(45deg, #45b7d1, #2980b9);
}
.stat-icon.views {
  background: linear-gradient(45deg, #f9ca24, #f0932b);
}
.stat-icon.rating {
  background: linear-gradient(45deg, #fdcb6e, #e17055);
}
.stat-icon.categories {
  background: linear-gradient(45deg, #6c5ce7, #a29bfe);
}
.stat-icon.provinces {
  background: linear-gradient(45deg, #00b894, #00a085);
}

.stat-value {
  font-size: 2.8rem;
  font-weight: 800;
  color: #1a7e8c;
  margin-bottom: 8px;
  /* text-shadow: 0 2px 4px rgba(45, 80, 22, 0.1); */
}

.stat-label {
  color: #1a7e8c;
  font-size: 1.1rem;
  margin-bottom: 12px;
  font-weight: 600;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.95rem;
  font-weight: 600;
}

.stat-change.positive {
  color: #2e7d32;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.chart-card {
  background: linear-gradient(135deg, #ffffff 0%, #f9fdf7 100%);
  padding: 30px;
  border-radius: 20px;
  /* box-shadow: 0 10px 40px rgba(45, 80, 22, 0.1); */
  /* border: 1px solid rgba(139, 195, 74, 0.2); */
}

.chart-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1a7e8c;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.chart-container {
  position: relative;
  height: 300px;
}

.bottom-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.data-table {
  background: linear-gradient(135deg, #ffffff 0%, #f9fdf7 100%);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(45, 80, 22, 0.1);
  overflow: hidden;
  border: 1px solid rgba(139, 195, 74, 0.2);
}

.table-header {
  background: linear-gradient(135deg, #daddd8, #5b9aa2);
  color: white;
  padding: 25px 30px;
  font-size: 1.3rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  /* text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); */
}

.table-content {
  padding: 0;
  max-height: 400px;
  overflow-y: auto;
}

.table-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid rgba(139, 195, 74, 0.1);
  transition: all 0.3s ease;
}

/* Destination Cards */
.destination-card,
.gear-card {
  display: flex;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
  /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); */
  transition: all 0.3s ease;
}

.destination-card:hover,
.gear-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.destination-image,
.gear-image {
  width: 120px;
  height: 100px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}

.destination-info,
.gear-info {
  padding: 16px 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.destination-header,
.gear-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.destination-header h4,
.gear-header h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e40af;
  margin: 0;
}

.destination-price,
.gear-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: #059669;
}

.destination-price span,
.gear-price span {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

.destination-location,
.gear-brand {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.destination-stats,
.gear-stats {
  display: flex;
  gap: 16px;
  font-size: 0.85rem;
  color: #9ca3af;
}

.destination-stats span,
.gear-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}
table-row:hover {
  background-color: #f8f9fa;
}

.table-row:last-child {
  border-bottom: none;
}

.location-info {
  flex: 1;
}

.location-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.location-details {
  font-size: 0.85rem;
  color: #666;
}

.location-stats {
  display: flex;
  gap: 15px;
  font-size: 0.9rem;
  color: #666;
}

.location-stats span {
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(45, 80, 22, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.loading-spinner {
  background: linear-gradient(135deg, #ffffff 0%, #f9fdf7 100%);
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  /* box-shadow: 0 20px 60px rgba(45, 80, 22, 0.3); */
  border: 2px solid rgba(139, 195, 74, 0.3);
}

.loading-spinner i {
  font-size: 2.5rem;
  color: #1a7e8c;
  margin-bottom: 20px;
}

.loading-spinner p {
  color: #1a7e8c;
  margin: 0;
  font-weight: 600;
  font-size: 1.1rem;
}

.error-message {
  background: linear-gradient(135deg, #ffebee 0%, #ffffff 100%);
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(244, 67, 54, 0.2);
  /* margin: 25px 0; */
  border: 2px solid rgba(244, 67, 54, 0.2);
}

.error-message i {
  font-size: 2.5rem;
  color: #d32f2f;
  margin-bottom: 20px;
}

.error-message p {
  color: #b71c1c;
  margin-bottom: 25px;
  font-weight: 600;
  font-size: 1.1rem;
}

.retry-btn {
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  /* box-shadow: 0 4px 15px rgba(211, 47, 47, 0.3); */
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(211, 47, 47, 0.4);
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard {
    padding: 10px;
  }

  .header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .header h1 {
    font-size: 1.5rem;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .bottom-section {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-value {
    font-size: 2rem;
  }

  .location-stats {
    flex-direction: column;
    gap: 8px;
    align-items: flex-end;
  }

  .table-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .stat-card {
    padding: 20px;
  }

  .chart-card {
    padding: 20px;
  }

  .location-stats {
    align-items: flex-start;
  }
}
</style>
