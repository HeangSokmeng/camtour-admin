<template>
  <nav class="navbar navbar-vertical navbar-expand-lg">
    <div class="collapse navbar-collapse" id="navbarVerticalCollapse">
      <div class="navbar-vertical-content">
        <ul class="navbar-nav flex-column" id="navbarVerticalNav">
          <!-- Dashboard -->
          <li class="nav-item">
            <div class="nav-item-wrapper">
              <RouterLink
                to="/"
                class="nav-link dropdown-indicator label-1"
                :class="{ active: ['home'].includes(route.name) }"
              >
                <div class="d-flex align-items-center">
                  <div class="dropdown-indicator-icon-wrapper"></div>
                  <span class="nav-link-icon">
                    <span data-feather="home"></span>
                  </span>
                  <span class="nav-link-text">Dashboard</span>
                </div>
              </RouterLink>
            </div>
          </li>

          <!-- Location Management -->
          <li class="nav-item">
            <p class="navbar-vertical-label">Address Management</p>
            <hr class="navbar-vertical-line" />
            <div class="nav-item-wrapper">
              <a
                class="nav-link dropdown-indicator label-1"
                href="#nv-address"
                role="button"
                data-bs-toggle="collapse"
                aria-expanded="false"
                aria-controls="nv-address"
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
                  data-bs-parent="#navbarVerticalCollapse"
                  id="nv-address"
                >
                  <li class="collapsed-nav-item-title d-none">Address</li>
                  <RouterLink to="/province">
                    <li class="nav-item">
                      <a class="nav-link" href="#">
                        <div class="d-flex align-items-center">
                          <span class="nav-link-icon">
                            <span data-feather="globe"></span>
                          </span>
                          <span class="nav-link-text">Provinces</span>
                        </div>
                      </a>
                    </li>
                  </RouterLink>
                  <RouterLink to="/district">
                    <li class="nav-item">
                      <a class="nav-link" href="#">
                        <div class="d-flex align-items-center">
                          <span class="nav-link-icon">
                            <span data-feather="map"></span>
                          </span>
                          <span class="nav-link-text">Districts</span>
                        </div>
                      </a>
                    </li>
                  </RouterLink>
                  <RouterLink to="/commune">
                    <li class="nav-item">
                      <a class="nav-link" href="#">
                        <div class="d-flex align-items-center">
                          <span class="nav-link-icon">
                            <span data-feather="flag"></span>
                          </span>
                          <span class="nav-link-text">Communes</span>
                        </div>
                      </a>
                    </li>
                  </RouterLink>
                  <RouterLink to="/village">
                    <li class="nav-item">
                      <a class="nav-link" href="#">
                        <div class="d-flex align-items-center">
                          <span class="nav-link-icon">
                            <span data-feather="home"></span>
                          </span>
                          <span class="nav-link-text">Villages</span>
                        </div>
                      </a>
                    </li>
                  </RouterLink>
                </ul>
              </div>
            </div>
            <div class="nav-item-wrapper">
              <RouterLink to="/location" class="nav-link dropdown-indicator label-1">
                <div class="d-flex align-items-center">
                  <div class="dropdown-indicator-icon-wrapper"></div>
                  <span class="nav-link-icon">
                    <span data-feather="navigation"></span>
                  </span>
                  <span class="nav-link-text">Location Management</span>
                </div>
              </RouterLink>
            </div>
            <div class="nav-item-wrapper">
              <RouterLink
                to="/location/photo"
                class="nav-link dropdown-indicator label-1"
              >
                <div class="d-flex align-items-center">
                  <div class="dropdown-indicator-icon-wrapper"></div>
                  <span class="nav-link-icon">
                    <span data-feather="image"></span>
                  </span>
                  <span class="nav-link-text">Location Photo</span>
                </div>
              </RouterLink>
            </div>
          </li>

          <!-- Product Management -->
          <li class="nav-item">
            <p class="navbar-vertical-label">Product Management</p>
            <hr class="navbar-vertical-line" />
            <div class="nav-item-wrapper">
              <a
                class="nav-link dropdown-indicator label-1"
                href="#nv-product"
                role="button"
                data-bs-toggle="collapse"
                aria-expanded="false"
                aria-controls="nv-product"
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
                  data-bs-parent="#navbarVerticalCollapse"
                  id="nv-product"
                >
                  <li class="collapsed-nav-item-title d-none">Products</li>
                  <RouterLink to="/product">
                    <li class="nav-item">
                      <a class="nav-link" href="#">
                        <div class="d-flex align-items-center">
                          <span class="nav-link-icon">
                            <span data-feather="box"></span>
                          </span>
                          <span class="nav-link-text">Product</span>
                        </div>
                      </a>
                    </li>
                  </RouterLink>
                  <RouterLink to="/product/category">
                    <li class="nav-item">
                      <a class="nav-link" href="#">
                        <div class="d-flex align-items-center">
                          <span class="nav-link-icon">
                            <span data-feather="grid"></span>
                          </span>
                          <span class="nav-link-text">Product Categories</span>
                        </div>
                      </a>
                    </li>
                  </RouterLink>
                  <RouterLink to="/product/brand">
                    <li class="nav-item">
                      <a class="nav-link" href="#">
                        <div class="d-flex align-items-center">
                          <span class="nav-link-icon">
                            <span data-feather="award"></span>
                          </span>
                          <span class="nav-link-text">Product Brands</span>
                        </div>
                      </a>
                    </li>
                  </RouterLink>
                  <RouterLink to="/color">
                    <li class="nav-item">
                      <a class="nav-link" href="#">
                        <div class="d-flex align-items-center">
                          <span class="nav-link-icon">
                            <span data-feather="droplet"></span>
                          </span>
                          <span class="nav-link-text">Product Colors</span>
                        </div>
                      </a>
                    </li>
                  </RouterLink>
                  <RouterLink to="/product/size">
                    <li class="nav-item">
                      <a class="nav-link" href="#">
                        <div class="d-flex align-items-center">
                          <span class="nav-link-icon">
                            <span data-feather="maximize-2"></span>
                          </span>
                          <span class="nav-link-text">Product Sizes</span>
                        </div>
                      </a>
                    </li>
                  </RouterLink>
                  <RouterLink to="/product/variant">
                    <li class="nav-item">
                      <a class="nav-link" href="#">
                        <div class="d-flex align-items-center">
                          <span class="nav-link-icon">
                            <span data-feather="layers"></span>
                          </span>
                          <span class="nav-link-text">Product Variants</span>
                        </div>
                      </a>
                    </li>
                  </RouterLink>
                </ul>
              </div>
            </div>
          </li>

          <!-- Settings -->
          <li class="nav-item">
            <p class="navbar-vertical-label">General Settings</p>
            <hr class="navbar-vertical-line" />
            <div class="nav-item-wrapper">
              <RouterLink to="/category" class="nav-link dropdown-indicator label-1">
                <div class="d-flex align-items-center">
                  <div class="dropdown-indicator-icon-wrapper"></div>
                  <span class="nav-link-icon">
                    <span data-feather="grid"></span>
                  </span>
                  <span class="nav-link-text">Categories</span>
                </div>
              </RouterLink>
            </div>
            <div class="nav-item-wrapper">
              <RouterLink to="/tag" class="nav-link dropdown-indicator label-1">
                <div class="d-flex align-items-center">
                  <div class="dropdown-indicator-icon-wrapper"></div>
                  <span class="nav-link-icon">
                    <span data-feather="tag"></span>
                  </span>
                  <span class="nav-link-text">Tags</span>
                </div>
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
import { replace } from "feather-icons";
import { onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

onMounted(() => {
  replace({
    width: 16,
    height: 16,
  });
});
</script>
