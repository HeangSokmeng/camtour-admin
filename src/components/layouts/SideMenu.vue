<template>
  <nav class="navbar navbar-vertical navbar-expand-lg">
    <div class="collapse navbar-collapse" id="navbarVerticalCollapse">
      <div class="navbar-vertical-content">
        <ul class="navbar-nav flex-column" id="navbarVerticalNav">
          <!-- Dashboard - Accessible to all logged-in users -->
          <li class="nav-item">
            <div class="nav-item-wrapper">
              <RouterLink to="/" custom v-slot="{ navigate, isActive }">
                <a
                  class="nav-link dropdown-indicator label-1"
                  :class="{ active: isActive || route.path === '/' }"
                  @click="navigate"
                  href="#"
                >
                  <div class="d-flex align-items-center">
                    <div class="dropdown-indicator-icon-wrapper"></div>
                    <span class="nav-link-icon">
                      <span data-feather="home"></span>
                    </span>
                    <span class="nav-link-text">Dashboard</span>
                  </div>
                </a>
              </RouterLink>
            </div>
          </li>

          <!-- User Management - Only for admin and system admin -->
          <li class="nav-item" v-if="globalStore.canAccessUserManagement">
            <p class="navbar-vertical-label">Customers Management</p>
            <hr class="navbar-vertical-line" />
            <div class="nav-item-wrapper">
              <RouterLink to="/customer/comment" custom v-slot="{ navigate, isActive }">
                <a
                  class="nav-link dropdown-indicator label-1"
                  :class="{ active: isActive || route.path.startsWith('/customer') }"
                  @click="navigate"
                  href="#"
                >
                  <div class="d-flex align-items-center">
                    <div class="dropdown-indicator-icon-wrapper"></div>
                    <span class="nav-link-icon">
                      <span data-feather="shield"></span>
                    </span>
                    <span class="nav-link-text">Customer Comment</span>
                  </div>
                </a>
              </RouterLink>
            </div>
          </li>

          <!-- Location Management - Accessible to staff and above -->
          <li class="nav-item" v-if="globalStore.atLeastStaff">
            <p class="navbar-vertical-label">Address Management</p>
            <hr class="navbar-vertical-line" />
            <div class="nav-item-wrapper">
              <a
                class="nav-link dropdown-indicator label-1"
                href="#nv-address"
                role="button"
                data-bs-toggle="collapse"
                :aria-expanded="isAddressMenuExpanded"
                aria-controls="nv-address"
                :class="{ active: isAddressRouteActive }"
              >
                <div class="d-flex align-items-center">
                  <div class="dropdown-indicator-icon-wrapper">
                    <span class="fas fa-caret-right dropdown-indicator-icon"></span>
                  </div>
                  <span class="nav-link-icon">
                    <span data-feather="map-pin"></span>
                  </span>
                  <span class="nav-link-text">Address Hierarchy</span>
                </div>
              </a>
              <div class="parent-wrapper label-1">
                <ul
                  class="nav collapse parent"
                  :class="{ show: isAddressMenuExpanded }"
                  data-bs-parent="#navbarVerticalCollapse"
                  id="nv-address"
                >
                  <li class="collapsed-nav-item-title d-none">Address</li>
                  <li class="nav-item">
                    <RouterLink to="/province" custom v-slot="{ navigate, isActive }">
                      <a
                        class="nav-link"
                        :class="{ active: isActive || route.path === '/province' }"
                        @click="navigate"
                        href="#"
                      >
                        <div class="d-flex align-items-center">
                          <span class="nav-link-icon">
                            <span data-feather="globe"></span>
                          </span>
                          <span class="nav-link-text">Provinces</span>
                        </div>
                      </a>
                    </RouterLink>
                  </li>
                  <li class="nav-item">
                    <RouterLink to="/district" custom v-slot="{ navigate, isActive }">
                      <a
                        class="nav-link"
                        :class="{ active: isActive || route.path === '/district' }"
                        @click="navigate"
                        href="#"
                      >
                        <div class="d-flex align-items-center">
                          <span class="nav-link-icon">
                            <span data-feather="map"></span>
                          </span>
                          <span class="nav-link-text">Districts</span>
                        </div>
                      </a>
                    </RouterLink>
                  </li>
                  <li class="nav-item">
                    <RouterLink to="/commune" custom v-slot="{ navigate, isActive }">
                      <a
                        class="nav-link"
                        :class="{ active: isActive || route.path === '/commune' }"
                        @click="navigate"
                        href="#"
                      >
                        <div class="d-flex align-items-center">
                          <span class="nav-link-icon">
                            <span data-feather="flag"></span>
                          </span>
                          <span class="nav-link-text">Communes</span>
                        </div>
                      </a>
                    </RouterLink>
                  </li>
                  <li class="nav-item">
                    <RouterLink to="/village" custom v-slot="{ navigate, isActive }">
                      <a
                        class="nav-link"
                        :class="{ active: isActive || route.path === '/village' }"
                        @click="navigate"
                        href="#"
                      >
                        <div class="d-flex align-items-center">
                          <span class="nav-link-icon">
                            <span data-feather="home"></span>
                          </span>
                          <span class="nav-link-text">Villages</span>
                        </div>
                      </a>
                    </RouterLink>
                  </li>
                </ul>
              </div>
            </div>
            <div class="nav-item-wrapper">
              <RouterLink to="/location" custom v-slot="{ navigate, isActive }">
                <a
                  class="nav-link dropdown-indicator label-1"
                  :class="{ active: isActive || route.path === '/location' }"
                  @click="navigate"
                  href="#"
                >
                  <div class="d-flex align-items-center">
                    <div class="dropdown-indicator-icon-wrapper"></div>
                    <span class="nav-link-icon">
                      <span data-feather="navigation"></span>
                    </span>
                    <span class="nav-link-text">Location Management</span>
                  </div>
                </a>
              </RouterLink>
            </div>
            <div class="nav-item-wrapper">
              <RouterLink to="/location/guide" custom v-slot="{ navigate, isActive }">
                <a
                  class="nav-link dropdown-indicator label-1"
                  :class="{ active: isActive || route.path === '/location/guide' }"
                  @click="navigate"
                  href="#"
                >
                  <div class="d-flex align-items-center">
                    <div class="dropdown-indicator-icon-wrapper"></div>
                    <span class="nav-link-icon">
                      <span data-feather="navigation"></span>
                    </span>
                    <span class="nav-link-text">Location Guide</span>
                  </div>
                </a>
              </RouterLink>
            </div>
            <div class="nav-item-wrapper">
              <RouterLink to="/location/photo" custom v-slot="{ navigate, isActive }">
                <a
                  class="nav-link dropdown-indicator label-1"
                  :class="{ active: isActive || route.path === '/location/photo' }"
                  @click="navigate"
                  href="#"
                >
                  <div class="d-flex align-items-center">
                    <div class="dropdown-indicator-icon-wrapper"></div>
                    <span class="nav-link-icon">
                      <span data-feather="image"></span>
                    </span>
                    <span class="nav-link-text">Location Photo</span>
                  </div>
                </a>
              </RouterLink>
            </div>
          </li>

          <!-- Product Management - Accessible to staff and above -->
          <li class="nav-item" v-if="globalStore.atLeastStaff">
            <p class="navbar-vertical-label">Product Management</p>
            <hr class="navbar-vertical-line" />

            <!-- Product Order item -->
            <div class="nav-item-wrapper">
              <RouterLink to="/product/order" custom v-slot="{ navigate, isActive }">
                <a
                  class="nav-link"
                  :class="{ active: isActive || route.path === '/product/order' }"
                  @click="navigate"
                  href="#"
                >
                  <div class="d-flex align-items-center">
                    <span class="nav-link-icon">
                      <span data-feather="shopping-cart"></span>
                    </span>
                    <span class="nav-link-text">Product Order</span>
                  </div>
                </a>
              </RouterLink>
            </div>

            <!-- Products dropdown -->
            <div class="nav-item-wrapper">
              <a
                class="nav-link dropdown-indicator label-1"
                href="#nv-product"
                role="button"
                data-bs-toggle="collapse"
                :aria-expanded="isProductMenuExpanded"
                aria-controls="nv-product"
                :class="{ active: isProductRouteActive }"
              >
                <div class="d-flex align-items-center">
                  <div class="dropdown-indicator-icon-wrapper">
                    <span class="fas fa-caret-right dropdown-indicator-icon"></span>
                  </div>
                  <span class="nav-link-icon">
                    <span data-feather="package"></span>
                  </span>
                  <span class="nav-link-text">Products</span>
                </div>
              </a>
              <div class="parent-wrapper label-1">
                <ul
                  class="nav collapse parent"
                  :class="{ show: isProductMenuExpanded }"
                  data-bs-parent="#navbarVerticalCollapse"
                  id="nv-product"
                >
                  <li class="collapsed-nav-item-title d-none">Products</li>
                  <li class="nav-item">
                    <RouterLink to="/product" custom v-slot="{ navigate, isActive }">
                      <a
                        class="nav-link"
                        :class="{ active: isActive || route.path === '/product' }"
                        @click="navigate"
                        href="#"
                      >
                        <div class="d-flex align-items-center">
                          <span class="nav-link-icon">
                            <span data-feather="box"></span>
                          </span>
                          <span class="nav-link-text">Product</span>
                        </div>
                      </a>
                    </RouterLink>
                  </li>
                  <li class="nav-item">
                    <RouterLink
                      to="/product/category"
                      custom
                      v-slot="{ navigate, isActive }"
                    >
                      <a
                        class="nav-link"
                        :class="{
                          active: isActive || route.path === '/product/category',
                        }"
                        @click="navigate"
                        href="#"
                      >
                        <div class="d-flex align-items-center">
                          <span class="nav-link-icon">
                            <span data-feather="grid"></span>
                          </span>
                          <span class="nav-link-text">Product Categories</span>
                        </div>
                      </a>
                    </RouterLink>
                  </li>
                  <li class="nav-item">
                    <RouterLink
                      to="/product/photo"
                      custom
                      v-slot="{ navigate, isActive }"
                    >
                      <a
                        class="nav-link"
                        :class="{ active: isActive || route.path === '/product/photo' }"
                        @click="navigate"
                        href="#"
                      >
                        <div class="d-flex align-items-center">
                          <span class="nav-link-icon">
                            <span data-feather="image"></span>
                          </span>
                          <span class="nav-link-text">Product Photo</span>
                        </div>
                      </a>
                    </RouterLink>
                  </li>
                  <li class="nav-item">
                    <RouterLink
                      to="/product/brand"
                      custom
                      v-slot="{ navigate, isActive }"
                    >
                      <a
                        class="nav-link"
                        :class="{ active: isActive || route.path === '/product/brand' }"
                        @click="navigate"
                        href="#"
                      >
                        <div class="d-flex align-items-center">
                          <span class="nav-link-icon">
                            <span data-feather="award"></span>
                          </span>
                          <span class="nav-link-text">Product Brands</span>
                        </div>
                      </a>
                    </RouterLink>
                  </li>
                  <li class="nav-item">
                    <RouterLink to="/color" custom v-slot="{ navigate, isActive }">
                      <a
                        class="nav-link"
                        :class="{ active: isActive || route.path === '/color' }"
                        @click="navigate"
                        href="#"
                      >
                        <div class="d-flex align-items-center">
                          <span class="nav-link-icon">
                            <span data-feather="droplet"></span>
                          </span>
                          <span class="nav-link-text">Product Colors</span>
                        </div>
                      </a>
                    </RouterLink>
                  </li>
                  <li class="nav-item">
                    <RouterLink to="/product/size" custom v-slot="{ navigate, isActive }">
                      <a
                        class="nav-link"
                        :class="{ active: isActive || route.path === '/product/size' }"
                        @click="navigate"
                        href="#"
                      >
                        <div class="d-flex align-items-center">
                          <span class="nav-link-icon">
                            <span data-feather="maximize-2"></span>
                          </span>
                          <span class="nav-link-text">Product Sizes</span>
                        </div>
                      </a>
                    </RouterLink>
                  </li>
                  <li class="nav-item">
                    <RouterLink
                      to="/product/variant"
                      custom
                      v-slot="{ navigate, isActive }"
                    >
                      <a
                        class="nav-link"
                        :class="{ active: isActive || route.path === '/product/variant' }"
                        @click="navigate"
                        href="#"
                      >
                        <div class="d-flex align-items-center">
                          <span class="nav-link-icon">
                            <span data-feather="layers"></span>
                          </span>
                          <span class="nav-link-text">Product Variants</span>
                        </div>
                      </a>
                    </RouterLink>
                  </li>
                </ul>
              </div>
            </div>
          </li>

          <!-- User Management - Only for admin and system admin -->
          <li class="nav-item" v-if="globalStore.canAccessUserManagement">
            <p class="navbar-vertical-label">User Management</p>
            <hr class="navbar-vertical-line" />
            <div class="nav-item-wrapper">
              <RouterLink to="/user" custom v-slot="{ navigate, isActive }">
                <a
                  class="nav-link dropdown-indicator label-1"
                  :class="{ active: isActive || route.path === '/user' }"
                  @click="navigate"
                  href="#"
                >
                  <div class="d-flex align-items-center">
                    <div class="dropdown-indicator-icon-wrapper"></div>
                    <span class="nav-link-icon">
                      <span data-feather="user"></span>
                    </span>
                    <span class="nav-link-text">Users</span>
                  </div>
                </a>
              </RouterLink>
            </div>
            <!-- Role Management - Only for system admin -->
            <div class="nav-item-wrapper" v-if="globalStore.isSystemAdmin">
              <RouterLink to="/roles" custom v-slot="{ navigate, isActive }">
                <a
                  class="nav-link dropdown-indicator label-1"
                  :class="{ active: isActive || route.path === '/roles' }"
                  @click="navigate"
                  href="#"
                >
                  <div class="d-flex align-items-center">
                    <div class="dropdown-indicator-icon-wrapper"></div>
                    <span class="nav-link-icon">
                      <span data-feather="shield"></span>
                    </span>
                    <span class="nav-link-text">Roles</span>
                  </div>
                </a>
              </RouterLink>
            </div>
          </li>

          <!-- General Settings - Accessible to staff and above -->
          <li class="nav-item" v-if="globalStore.atLeastStaff">
            <p class="navbar-vertical-label">General Settings</p>
            <hr class="navbar-vertical-line" />
            <div class="nav-item-wrapper">
              <RouterLink to="/category" custom v-slot="{ navigate, isActive }">
                <a
                  class="nav-link dropdown-indicator label-1"
                  :class="{ active: isActive || route.path === '/category' }"
                  @click="navigate"
                  href="#"
                >
                  <div class="d-flex align-items-center">
                    <div class="dropdown-indicator-icon-wrapper"></div>
                    <span class="nav-link-icon">
                      <span data-feather="grid"></span>
                    </span>
                    <span class="nav-link-text">Categories</span>
                  </div>
                </a>
              </RouterLink>
            </div>
            <div class="nav-item-wrapper">
              <RouterLink to="/tag" custom v-slot="{ navigate, isActive }">
                <a
                  class="nav-link dropdown-indicator label-1"
                  :class="{ active: isActive || route.path === '/tag' }"
                  @click="navigate"
                  href="#"
                >
                  <div class="d-flex align-items-center">
                    <div class="dropdown-indicator-icon-wrapper"></div>
                    <span class="nav-link-icon">
                      <span data-feather="tag"></span>
                    </span>
                    <span class="nav-link-text">Tags</span>
                  </div>
                </a>
              </RouterLink>
            </div>
          </li>

          <!-- System Settings - Only for system admin -->
          <li class="nav-item" v-if="globalStore.isSystemAdmin">
            <p class="navbar-vertical-label">System Settings</p>
            <hr class="navbar-vertical-line" />
            <div class="nav-item-wrapper">
              <RouterLink to="/system/settings" custom v-slot="{ navigate, isActive }">
                <a
                  class="nav-link dropdown-indicator label-1"
                  :class="{ active: isActive || route.path.startsWith('/system') }"
                  @click="navigate"
                  href="#"
                >
                  <div class="d-flex align-items-center">
                    <div class="dropdown-indicator-icon-wrapper"></div>
                    <span class="nav-link-icon">
                      <span data-feather="settings"></span>
                    </span>
                    <span class="nav-link-text">System Settings</span>
                  </div>
                </a>
              </RouterLink>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div class="navbar-vertical-footer">
      <button
        class="btn navbar-vertical-toggle border-0 fw-semibold w-100 white-space-nowrap d-flex align-items-center"
      >
        <span class="uil uil-info-circle fs-8"></span>
        <span class="navbar-vertical-footer-text ms-2">Version 1.0.0</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import "@/assets/js/side_menu.js";
import { useGlobalStore } from "@/stores/global";
import { replace } from "feather-icons";
import { computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const globalStore = useGlobalStore();

// Computed properties to determine active states
const isAddressRouteActive = computed(() => {
  const addressRoutes = ["/province", "/district", "/commune", "/village"];
  return addressRoutes.some((path) => route.path.startsWith(path));
});

const isAddressMenuExpanded = computed(() => {
  return isAddressRouteActive.value;
});

const isProductRouteActive = computed(() => {
  return (
    route.path.includes("/product") ||
    route.path.includes("/color") ||
    route.path.includes("/product/size") ||
    route.path.includes("/product/variant") ||
    route.path.includes("/product/brand") ||
    route.path.includes("/product/category") ||
    route.path.includes("/customer/comment") ||
    route.path.includes("/profile/edit-profile") ||
    route.path.includes("/product/photo")
  );
});

const isProductMenuExpanded = computed(() => {
  return isProductRouteActive.value;
});

onMounted(() => {
  replace({
    width: 16,
    height: 16,
  });

  // Initialize Bootstrap collapse elements if needed
  initializeBootstrapCollapse();
});

function initializeBootstrapCollapse() {
  const addressCollapse = document.getElementById("nv-address");
  const productCollapse = document.getElementById("nv-product");

  if (isAddressMenuExpanded.value && addressCollapse) {
  }

  if (isProductMenuExpanded.value && productCollapse) {
    // Same for product collapse
  }
}
watch(
  () => globalStore.profile,
  (newProfile) => {
    console.log("Profile changed:", newProfile);
    console.log("Role ID:", newProfile?.role_id);
    console.log("Role checks recalculated:", {
      atLeastStaff: globalStore.atLeastStaff,
      canAccessUserManagement: globalStore.canAccessUserManagement,
      isSystemAdmin: globalStore.isSystemAdmin,
    });
  },
  { immediate: true }
);

// Watch for route changes to update active states
watch(
  () => route.path,
  (newPath) => {
    console.log("Route changed:", newPath);
    // This might be needed if Bootstrap collapse doesn't respond to class changes
    initializeBootstrapCollapse();
  }
);
</script>

<style scoped>
/* Base styles for nav links */
.nav-link {
  transition: all 0.2s ease;
}

/* Active state styles */
.nav-link.active {
  background-color: var(
    --falcon-sidebar-link-active-bg,
    rgba(115, 103, 240, 0.15)
  ) !important;
  color: var(--falcon-sidebar-link-active-color, #7367f0) !important;
  font-weight: 500;
  border-radius: 4px;
}

/* Active parent with dropdown */
.dropdown-indicator.active {
  background-color: var(
    --falcon-sidebar-link-active-bg,
    rgba(115, 103, 240, 0.15)
  ) !important;
  color: var(--falcon-sidebar-link-active-color, #7367f0) !important;
  border-radius: 4px;
}

/* Hover effects */
.nav-item .nav-link:hover {
  background-color: var(--falcon-sidebar-link-hover-bg, rgba(115, 103, 240, 0.08));
  color: var(--falcon-sidebar-link-hover-color, #5e50ee);
  border-radius: 4px;
}

/* Dropdown indicator icon when menu is expanded */
.parent.show + .nav-link .dropdown-indicator-icon {
  transform: rotate(90deg);
}

/* Ensure transition for dropdown indicator */
.dropdown-indicator-icon {
  transition: transform 0.2s ease;
}

/* Submenu indentation */
.parent .nav-item .nav-link {
  padding-left: 2.5rem;
}

/* Additional visual cue for active items */
.nav-link.active .nav-link-icon,
.dropdown-indicator.active .nav-link-icon {
  color: var(--falcon-sidebar-link-active-color, #7367f0) !important;
}

/* Visual indicator for parent items with active children */
.parent.show {
  background-color: var(--falcon-sidebar-submenu-bg, rgba(115, 103, 240, 0.05));
  border-radius: 4px;
}
</style>
