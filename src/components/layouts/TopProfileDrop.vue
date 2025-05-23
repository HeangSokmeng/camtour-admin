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
              <a
                href="#"
                class="nav-link px-3 d-block"
                @click.prevent="openEditProfileModal"
              >
                <span class="me-2 text-body align-bottom" data-feather="user"></span>
                <span>Edit Profile</span>
              </a>
            </li>
            <li class="nav-item">
              <a
                href="#"
                class="nav-link px-3 d-block"
                @click.prevent="openPasswordModal"
              >
                <span class="me-2 text-body align-bottom" data-feather="shield"></span>
                <span>Change Password</span>
              </a>
            </li>
            <li class="nav-item">
              <RouterLink to="/" class="nav-link px-3 d-block">
                <span class="me-2 text-body align-bottom" data-feather="tablet"></span>
                <span>Devices</span>
              </RouterLink>
            </li>
            <li class="nav-item">
              <a
                href="#"
                class="nav-link px-3 d-block"
                @click.prevent="openLanguageSettings"
              >
                <span class="me-2 text-body align-bottom" data-feather="globe"></span>
                <span>Language</span>
              </a>
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

  <!-- Edit Profile Modal -->
  <div
    class="modal fade"
    :class="{ show: showEditModal }"
    tabindex="-1"
    :style="{ display: showEditModal ? 'block' : 'none' }"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Edit Profile Information</h5>
          <button type="button" class="btn-close" @click="toggleEditModal"></button>
        </div>
        <div v-if="isLoading" class="modal-body text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else class="modal-body">
          <form @submit.prevent="submitProfileEdit">
            <div class="mb-3">
              <label for="edit_first_name" class="form-label">First Name</label>
              <input
                type="text"
                class="form-control"
                id="edit_first_name"
                v-model="editForm.first_name"
                required
              />
              <div class="invalid-feedback" v-if="profileErrors.first_name">
                {{ profileErrors.first_name }}
              </div>
            </div>
            <div class="mb-3">
              <label for="edit_last_name" class="form-label">Last Name</label>
              <input
                type="text"
                class="form-control"
                id="edit_last_name"
                v-model="editForm.last_name"
                required
              />
              <div class="invalid-feedback" v-if="profileErrors.last_name">
                {{ profileErrors.last_name }}
              </div>
            </div>
            <div class="mb-3">
              <label for="edit_gender" class="form-label">Gender</label>
              <select class="form-select" id="edit_gender" v-model="editForm.gender">
                <option value="0">Not specified</option>
                <option value="1">Male</option>
                <option value="2">Female</option>
              </select>
              <div class="invalid-feedback" v-if="profileErrors.gender">
                {{ profileErrors.gender }}
              </div>
            </div>
            <div class="mb-3">
              <label for="edit_phone" class="form-label">Phone</label>
              <input
                type="tel"
                class="form-control"
                id="edit_phone"
                v-model="editForm.phone"
              />
              <div class="invalid-feedback" v-if="profileErrors.phone">
                {{ profileErrors.phone }}
              </div>
            </div>
            <div class="mb-3">
              <label for="edit_email" class="form-label">Email</label>
              <input
                type="email"
                class="form-control"
                id="edit_email"
                v-model="editForm.email"
                required
              />
              <div class="invalid-feedback" v-if="profileErrors.email">
                {{ profileErrors.email }}
              </div>
            </div>
            <div class="mb-3">
              <label for="edit_image" class="form-label">Profile Image</label>
              <input
                type="file"
                class="form-control"
                id="edit_image"
                @change="handleImageChange"
                accept="image/*"
              />
              <div class="mt-2" v-if="profileImagePreview">
                <img
                  :src="profileImagePreview"
                  alt="Preview"
                  class="img-thumbnail"
                  style="max-height: 100px"
                />
                <button
                  type="button"
                  class="btn btn-sm btn-danger ms-2"
                  @click="removeImage"
                >
                  Remove
                </button>
              </div>
              <div class="invalid-feedback" v-if="profileErrors.image">
                {{ profileErrors.image }}
              </div>
            </div>
            <div v-if="editSuccessMessage" class="alert alert-success">
              {{ editSuccessMessage }}
            </div>
            <div v-if="editErrorMessage" class="alert alert-danger">
              {{ editErrorMessage }}
            </div>
            <div class="d-flex justify-content-end">
              <button
                type="button"
                class="btn btn-secondary me-2"
                @click="toggleEditModal"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="editForm.isSubmitting"
              >
                <span
                  class="spinner-border spinner-border-sm me-2"
                  v-if="editForm.isSubmitting"
                ></span>
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Password Change Modal -->
  <div
    class="modal fade"
    :class="{ show: showPasswordModal }"
    tabindex="-1"
    :style="{ display: showPasswordModal ? 'block' : 'none' }"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Change Password</h5>
          <button type="button" class="btn-close" @click="togglePasswordModal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitPasswordChange">
            <div class="mb-3">
              <label for="current_password" class="form-label">Current Password</label>
              <div class="input-group">
                <input
                  :type="passwordVisibility.current ? 'text' : 'password'"
                  class="form-control"
                  id="current_password"
                  v-model="passwordForm.current_password"
                  required
                  autocomplete="current-password"
                />
                <button
                  class="btn btn-outline-secondary"
                  type="button"
                  @click="togglePasswordVisibility('current')"
                >
                  <span v-if="passwordVisibility.current" class="fas fa-eye-slash"></span>
                  <span v-else class="fas fa-eye"></span>
                </button>
              </div>
              <div class="invalid-feedback" v-if="passwordErrors.current_password">
                {{ passwordErrors.current_password }}
              </div>
            </div>

            <div class="mb-3">
              <label for="new_password" class="form-label">New Password</label>
              <div class="input-group">
                <input
                  :type="passwordVisibility.new ? 'text' : 'password'"
                  class="form-control"
                  id="new_password"
                  v-model="passwordForm.new_password"
                  required
                  autocomplete="new-password"
                />
                <button
                  class="btn btn-outline-secondary"
                  type="button"
                  @click="togglePasswordVisibility('new')"
                >
                  <span v-if="passwordVisibility.new" class="fas fa-eye-slash"></span>
                  <span v-else class="fas fa-eye"></span>
                </button>
              </div>
              <div class="invalid-feedback" v-if="passwordErrors.new_password">
                {{ passwordErrors.new_password }}
              </div>
            </div>

            <div class="mb-3">
              <label for="new_password_confirmation" class="form-label"
                >Confirm New Password</label
              >
              <div class="input-group">
                <input
                  :type="passwordVisibility.confirmation ? 'text' : 'password'"
                  class="form-control"
                  id="new_password_confirmation"
                  v-model="passwordForm.new_password_confirmation"
                  required
                  autocomplete="new-password"
                />
                <button
                  class="btn btn-outline-secondary"
                  type="button"
                  @click="togglePasswordVisibility('confirmation')"
                >
                  <span
                    v-if="passwordVisibility.confirmation"
                    class="fas fa-eye-slash"
                  ></span>
                  <span v-else class="fas fa-eye"></span>
                </button>
              </div>
              <div
                class="invalid-feedback"
                v-if="passwordErrors.new_password_confirmation"
              >
                {{ passwordErrors.new_password_confirmation }}
              </div>
            </div>

            <div v-if="passwordSuccessMessage" class="alert alert-success">
              {{ passwordSuccessMessage }}
            </div>

            <div v-if="passwordErrorMessage" class="alert alert-danger">
              {{ passwordErrorMessage }}
            </div>

            <div class="d-flex justify-content-end">
              <button
                type="button"
                class="btn btn-secondary me-2"
                @click="togglePasswordModal"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="passwordForm.isSubmitting"
              >
                <span
                  class="spinner-border spinner-border-sm me-2"
                  v-if="passwordForm.isSubmitting"
                ></span>
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Language Settings Modal -->
  <div
    class="modal fade"
    :class="{ show: showLanguageModal }"
    tabindex="-1"
    :style="{ display: showLanguageModal ? 'block' : 'none' }"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Language Settings</h5>
          <button type="button" class="btn-close" @click="toggleLanguageModal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitLanguageSettings">
            <div class="mb-3">
              <label class="form-label">Select Language</label>
              <select class="form-select" v-model="languageForm.language">
                <option value="en">English</option>
                <option value="km">Khmer</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
                <option value="ar">Arabic</option>
                <option value="zh">Chinese</option>
              </select>
            </div>
            <div v-if="languageSuccessMessage" class="alert alert-success">
              {{ languageSuccessMessage }}
            </div>
            <div v-if="languageErrorMessage" class="alert alert-danger">
              {{ languageErrorMessage }}
            </div>
            <div class="d-flex justify-content-end">
              <button
                type="button"
                class="btn btn-secondary me-2"
                @click="toggleLanguageModal"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="languageForm.isSubmitting"
              >
                <span
                  class="spinner-border spinner-border-sm me-2"
                  v-if="languageForm.isSubmitting"
                ></span>
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  <div
    class="modal-backdrop fade"
    :class="{ show: showEditModal || showPasswordModal || showLanguageModal }"
    v-if="showEditModal || showPasswordModal || showLanguageModal"
  ></div>
</template>

<script setup>
import "@/assets/css/main.css";
import "@/assets/css/toast-styles.css";
import { useGlobalStore } from "@/stores/global.js";
import axios from "axios";
import "bootstrap";
import { replace } from "feather-icons";
import { onMounted, reactive, ref } from "vue";
const globalStore = useGlobalStore();
const isLoading = ref(false);
const profileData = ref(null);
const profileImagePreview = ref(null);
const showEditModal = ref(false);
const editForm = reactive({
  first_name: "",
  last_name: "",
  gender: "0",
  phone: "",
  email: "",
  image: null,
  isSubmitting: false,
});
const profileErrors = reactive({
  first_name: "",
  last_name: "",
  gender: "",
  phone: "",
  email: "",
  image: "",
});
const editSuccessMessage = ref("");
const editErrorMessage = ref("");
const showPasswordModal = ref(false);
const passwordForm = reactive({
  current_password: "",
  new_password: "",
  new_password_confirmation: "",
  isSubmitting: false,
});
const passwordVisibility = reactive({
  current: false,
  new: false,
  confirmation: false,
});
const passwordErrors = reactive({
  current_password: "",
  new_password: "",
  new_password_confirmation: "",
});
const passwordSuccessMessage = ref("");
const passwordErrorMessage = ref("");
const showLanguageModal = ref(false);
const languageForm = reactive({
  language: "en",
  isSubmitting: false,
});
const languageSuccessMessage = ref("");
const languageErrorMessage = ref("");

onMounted(() => {
  replace({ width: 16, height: 16 });
  fetchProfile();
});

const onConfirmLogout = () => {
  globalStore.mdl_logout.show();
};
async function changePassword() {
  if (!validatePasswordFields()) return;
  isSubmitting.value = true;
  try {
    const passwordPayload = {
      current_password: passwordData.current_password,
      password: passwordData.new_password,
      password_confirmation: passwordData.new_password_confirmation,
    };
    const headers = globalStore.getAxiosHeader();
    const response = await axios.put("/api/profile/pass", passwordPayload, headers);
    if (response.data.result) {
      showStatusMessage("success", t("password-updated-successfully"));
      showPasswordSection.value = false;
      passwordData.current_password = "";
      passwordData.new_password = "";
      passwordData.new_password_confirmation = "";
    } else {
      showStatusMessage("error", response.data.message || t("password-update-failed"));
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      const apiErrors = error.response.data.errors;
      Object.keys(apiErrors).forEach((key) => {
        const errorKey = key === "password" ? "new_password" : key;
        if (errors[errorKey] !== undefined) {
          errors[errorKey] = apiErrors[key][0];
        }
      });
    }
    showStatusMessage(
      "error",
      error.response?.data?.message || t("password-update-failed")
    );
    await globalStore.onCheckError(error);
  } finally {
    isSubmitting.value = false;
  }
}

function validatePasswordFields() {
  let isValid = true;
  errors.current_password = "";
  errors.new_password = "";
  errors.new_password_confirmation = "";
  if (!passwordData.current_password) {
    errors.current_password = t("current-password-required");
    isValid = false;
  }
  if (!passwordData.new_password) {
    errors.new_password = t("new-password-required");
    isValid = false;
  } else if (passwordData.new_password.length < 8) {
    errors.new_password = t("password-min-length");
    isValid = false;
  }
  if (passwordData.new_password !== passwordData.new_password_confirmation) {
    errors.new_password_confirmation = t("passwords-dont-match");
    isValid = false;
  }
  return isValid;
}

const fetchProfile = async () => {
  try {
    isLoading.value = true;
    const response = await axios.get("/api/auth/me", globalStore.getAxiosHeader());
    if (response.data.result) {
      profileData.value = response.data.data;
      editForm.first_name = profileData.value.first_name || "";
      editForm.last_name = profileData.value.last_name || "";
      editForm.gender = profileData.value.gender
        ? profileData.value.gender.toString()
        : "0";
      editForm.phone = profileData.value.phone || "";
      editForm.email = profileData.value.email || "";
    }
  } catch (error) {
  } finally {
    isLoading.value = false;
  }
};

const toggleEditModal = () => {
  showEditModal.value = !showEditModal.value;
  if (showEditModal.value) {
    showPasswordModal.value = false;
    showLanguageModal.value = false;
    editSuccessMessage.value = "";
    editErrorMessage.value = "";
    if (profileData.value) {
      editForm.first_name = profileData.value.first_name || "";
      editForm.last_name = profileData.value.last_name || "";
      editForm.gender = profileData.value.gender
        ? profileData.value.gender.toString()
        : "0";
      editForm.phone = profileData.value.phone || "";
      editForm.email = profileData.value.email || "";
      profileImagePreview.value = null;
    }
  } else {
    Object.keys(profileErrors).forEach((key) => {
      profileErrors[key] = "";
    });
  }
};

const togglePasswordModal = () => {
  showPasswordModal.value = !showPasswordModal.value;
  if (showPasswordModal.value) {
    showEditModal.value = false;
    showLanguageModal.value = false;
    passwordForm.current_password = "";
    passwordForm.new_password = "";
    passwordForm.new_password_confirmation = "";
    passwordSuccessMessage.value = "";
    passwordErrorMessage.value = "";
    passwordVisibility.current = false;
    passwordVisibility.new = false;
    passwordVisibility.confirmation = false;
  } else {
    Object.keys(passwordErrors).forEach((key) => {
      passwordErrors[key] = "";
    });
  }
};

const toggleLanguageModal = () => {
  showLanguageModal.value = !showLanguageModal.value;
  if (showLanguageModal.value) {
    showEditModal.value = false;
    showPasswordModal.value = false;
    languageSuccessMessage.value = "";
    languageErrorMessage.value = "";
    languageForm.language = localStorage.getItem("app_language") || "en";
  }
};

const openEditProfileModal = () => {
  toggleEditModal();
};

const openPasswordModal = () => {
  togglePasswordModal();
};

const openLanguageSettings = () => {
  toggleLanguageModal();
};

const togglePasswordVisibility = (field) => {
  passwordVisibility[field] = !passwordVisibility[field];
};

const handleImageChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    profileErrors.image = "Image size must be less than 2MB";
    return;
  }
  editForm.image = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    profileImagePreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

const removeImage = () => {
  editForm.image = null;
  profileImagePreview.value = null;
  document.getElementById("edit_image").value = "";
};

const submitProfileEdit = async () => {
  Object.keys(profileErrors).forEach((key) => {
    profileErrors[key] = "";
  });
  editSuccessMessage.value = "";
  editErrorMessage.value = "";
  editForm.isSubmitting = true;
  try {
    const formData = new FormData();
    formData.append("first_name", editForm.first_name);
    formData.append("last_name", editForm.last_name);
    formData.append("gender", editForm.gender);
    formData.append("phone", editForm.phone);
    formData.append("email", editForm.email);
    if (editForm.image) {
      formData.append("image", editForm.image);
    }
    const res = await axios.put("/api/profile/info", formData, {
      ...globalStore.getAxiosHeader(),
      headers: {
        ...globalStore.getAxiosHeader().headers,
        "Content-Type": "multipart/form-data",
      },
    });
    if (res.data.result) {
      await fetchProfile();
      editSuccessMessage.value = "Profile updated successfully!";
      editForm.image = null;
      profileImagePreview.value = null;
      setTimeout(() => {
        toggleEditModal();
      }, 2000);
    } else {
      if (res.data.errors) {
        for (const [key, value] of Object.entries(res.data.errors)) {
          if (profileErrors.hasOwnProperty(key)) {
            profileErrors[key] = value[0];
          }
        }
      } else {
        editErrorMessage.value = res.data.message || "Failed to update profile.";
      }
    }
  } catch (error) {
    if (error.response && error.response.data.errors) {
      for (const [key, value] of Object.entries(error.response.data.errors)) {
        if (profileErrors.hasOwnProperty(key)) {
          profileErrors[key] = value[0];
        }
      }
    } else {
      editErrorMessage.value = "An error occurred while updating your profile.";
    }
  } finally {
    editForm.isSubmitting = false;
  }
};

const submitPasswordChange = async () => {
  Object.keys(passwordErrors).forEach((key) => {
    passwordErrors[key] = "";
  });
  passwordSuccessMessage.value = "";
  passwordErrorMessage.value = "";
  if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
    passwordErrors.new_password_confirmation = "Passwords do not match";
    return;
  }
  passwordForm.isSubmitting = true;
  try {
    const res = await axios.put(
      "/api/profile/pass",
      {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        new_password_confirmation: passwordForm.new_password_confirmation,
      },
      globalStore.getAxiosHeader()
    );
    if (res.data.result) {
      passwordSuccessMessage.value = "Password changed successfully!";
      passwordForm.current_password = "";
      passwordForm.new_password = "";
      passwordForm.new_password_confirmation = "";
      setTimeout(() => {
        togglePasswordModal();
      }, 2000);
    } else {
      if (res.data.errors) {
        for (const [key, value] of Object.entries(res.data.errors)) {
          if (passwordErrors.hasOwnProperty(key)) {
            passwordErrors[key] = value[0];
          }
        }
      } else {
        passwordErrorMessage.value = res.data.message || "Failed to change password.";
      }
    }
  } catch (error) {
    if (error.response && error.response.data.errors) {
      for (const [key, value] of Object.entries(error.response.data.errors)) {
        if (passwordErrors.hasOwnProperty(key)) {
          passwordErrors[key] = value[0];
        }
      }
    } else {
      passwordErrorMessage.value = "An error occurred while changing your password.";
    }
  } finally {
    passwordForm.isSubmitting = false;
  }
};

const submitLanguageSettings = async () => {
  languageForm.isSubmitting = true;
  languageSuccessMessage.value = "";
  languageErrorMessage.value = "";

  try {
    localStorage.setItem("app_language", languageForm.language);
    languageSuccessMessage.value = "Language settings updated successfully!";
    setTimeout(() => {
      toggleLanguageModal();
    }, 2000);
  } catch (error) {
    languageErrorMessage.value = "Failed to update language settings";
    console.error("Language settings error:", error);
  } finally {
    languageForm.isSubmitting = false;
  }
};
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
.modal.show {
  display: block;
}
.invalid-feedback {
  display: block;
}

/* Active state styles for dropdown menu items */
.nav-link {
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background-color: var(--falcon-sidebar-link-hover-bg, rgba(115, 103, 240, 0.08));
  border-radius: 4px;
}

.nav-link:active {
  background-color: var(--falcon-sidebar-link-active-bg, rgba(115, 103, 240, 0.15));
  color: var(--falcon-sidebar-link-active-color, #7367f0) !important;
  font-weight: 500;
  border-radius: 4px;
}

/* Dropdown item styling */
.dropdown-menu {
  min-width: 280px;
}

.avatar img {
  object-fit: cover;
}

/* Alert styling */
.alert {
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
}
</style>
