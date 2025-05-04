<template>
  <li class="nav-item dropdown">
    <a
      class="nav-link lh-1 pe-0"
      id="navbarDropdownUser"
      data-bs-toggle="dropdown"
      data-bs-auto-close="outside"
      role="button"
      aria-haspopup="true"
      aria-expanded="false"
    >
      <div class="avatar avatar-l">
        <img
          class="rounded-circle"
          :src="
            globalStore.profile
              ? globalStore.profile.image
              : '/cr_assets/png/user_default.png'
          "
          alt="avatar"
        />
      </div>
    </a>
    <div
      class="dropdown-menu dropdown-menu-end navbar-dropdown-caret py-0 dropdown-profile shadow border"
    >
      <div class="card position-relative border-0">
        <div class="card-body p-0">
          <div class="text-center pt-4 pb-2">
            <div class="avatar avatar-xl">
              <img
                class="rounded-circle"
                :src="
                  globalStore.profile
                    ? globalStore.profile.image
                    : '/cr_assets/png/user_default.png'
                "
                alt="avatar"
              />
            </div>
            <h6 class="mt-2 text-body-emphasis">
              {{
                globalStore.profile
                  ? globalStore.profile.first_name + " " + globalStore.profile.last_name
                  : ""
              }}
            </h6>
          </div>
        </div>
        <div class="overflow-auto scrollbar">
          <hr />
          <ul class="nav d-flex flex-column mb-0 pb-1">
            <li class="nav-item">
              <RouterLink to="/profile/edit-profile" class="nav-link px-3 d-block">
                <span class="me-2 text-body align-bottom" data-feather="user"></span>
                <span>Edit Profile</span>
              </RouterLink>
            </li>
            <!-- <li class="nav-item">
                            <RouterLink to="/profile/change-password"
                                        class="nav-link px-3 d-block">
                                            <span class="me-2 text-body align-bottom"
                                                  data-feather="shield"></span>
                                <span>Change Password</span>
                            </RouterLink>
                        </li> -->
            <li class="nav-item">
              <RouterLink to="/profile/devices" class="nav-link px-3 d-block">
                <span class="me-2 text-body align-bottom" data-feather="tablet"></span>
                <span>Devices</span>
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/profile/edit-profile" class="nav-link px-3 d-block">
                <span class="me-2 text-body align-bottom" data-feather="globe"></span>
                <span>Language</span>
              </RouterLink>
            </li>
          </ul>
        </div>
        <div class="card-footer p-0 border-top-0">
          <hr />
          <div class="px-3">
            <a
              class="btn btn-phoenix-secondary d-flex flex-center w-100"
              role="button"
              @click="onConfirmLogout()"
            >
              <span class="me-2" data-feather="log-out"> </span>
              Sign out
            </a>
          </div>
          <div class="my-2 text-center fw-bold fs-10 text-body-quaternary">
            <a class="text-body-quaternary me-1" href="#">Privacy policy</a>•<a
              class="text-body-quaternary mx-1"
              href="#"
              >Terms</a
            >•<a class="text-body-quaternary ms-1" href="#">Cookies</a>
          </div>
        </div>
      </div>
    </div>
  </li>
</template>

<script setup>
import { useGlobalStore } from "@/stores/global.js";
import "bootstrap";
import { replace } from "feather-icons";
import { onMounted } from "vue";

const globalStore = useGlobalStore();

onMounted(() => {
  replace({ width: 16, height: 16 });
});

const onConfirmLogout = () => {
  globalStore.mdl_logout.show();
};
</script>
