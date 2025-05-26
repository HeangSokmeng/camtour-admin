<template>
  <div class="mb-9">
    <div class="row g-2 mb-4">
      <div class="col-auto">
        <h2 class="mb-0">User Profile</h2>
      </div>
    </div>

    <div id="user-profile">
      <!-- Profile Information Card -->
      <div v-if="state.isLoading" class="text-center">Loading...</div>
      <div v-else-if="state.error" class="text-center text-danger">
        {{ state.error }}
      </div>
      <div v-else class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Profile Information</h5>
          <button class="btn btn-primary" @click="openEditModal">
            <span class="fas fa-edit me-2"></span>Edit Profile
          </button>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-3 text-center mb-3">
              <div class="profile-image-container">
                <img
                  :src="userProfile.image || '/default-avatar.png'"
                  :alt="userProfile.first_name + ' ' + userProfile.last_name"
                  class="profile-image"
                  @error="handleImageError"
                />
              </div>
            </div>
            <div class="col-md-9">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label text-muted">First Name</label>
                  <div class="profile-info">
                    {{ userProfile.first_name || "Not provided" }}
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted">Last Name</label>
                  <div class="profile-info">
                    {{ userProfile.last_name || "Not provided" }}
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted">Gender</label>
                  <div class="profile-info">{{ getGenderText(userProfile.gender) }}</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted">Phone</label>
                  <div class="profile-info">
                    {{ userProfile.phone || "Not provided" }}
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted">Email</label>
                  <div class="profile-info">
                    {{ userProfile.email || "Not provided" }}
                    <!-- <span
                      v-if="!userProfile.is_email_verified"
                      class="badge bg-warning ms-2"
                      >Unverified</span
                    >
                    <span v-else class="badge bg-success ms-2">Verified</span> -->
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted">Member Since</label>
                  <div class="profile-info">{{ formatDate(userProfile.created_at) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Password Management Card -->
    </div>
  </div>

  <!-- Edit Profile Modal -->
  <div v-if="showEditModal" class="modal-overlay">
    <div class="modal-content edit-profile-form">
      <h4>Edit Profile</h4>
      <div v-if="modalMessage" class="alert alert-danger">
        {{ modalMessage }}
      </div>
      <form
        class="row g-3 needs-validation"
        novalidate
        @submit.prevent="handleUpdateProfile"
      >
        <!-- Profile Image Upload -->
        <div class="col-12 text-center mb-3">
          <div class="profile-image-upload">
            <img
              :src="editForm.imagePreview || formData.image || '/default-avatar.png'"
              alt="Profile Preview"
              class="profile-image-preview"
            />
            <input
              type="file"
              ref="imageInput"
              accept="image/*"
              @change="handleImageUpload"
              class="d-none"
            />
            <button
              type="button"
              class="btn btn-sm btn-outline-primary mt-2"
              @click="$refs.imageInput.click()"
            >
              Change Photo
            </button>
          </div>
        </div>

        <!-- Personal Information -->
        <div class="col-md-6">
          <label class="form-label" for="firstName">First Name</label>
          <input
            v-model="formData.first_name"
            class="form-control"
            id="firstName"
            type="text"
            required
          />
          <div v-if="errors.first_name" class="text-danger">{{ errors.first_name }}</div>
          <div class="invalid-feedback">First name is required</div>
        </div>

        <div class="col-md-6">
          <label class="form-label" for="lastName">Last Name</label>
          <input
            v-model="formData.last_name"
            class="form-control"
            id="lastName"
            type="text"
            required
          />
          <div v-if="errors.last_name" class="text-danger">{{ errors.last_name }}</div>
          <div class="invalid-feedback">Last name is required</div>
        </div>

        <div class="col-md-6">
          <label class="form-label" for="gender">Gender</label>
          <select v-model="formData.gender" class="form-select" id="gender" required>
            <option value="0">Unknown</option>
            <option value="1">Male</option>
            <option value="2">Female</option>
          </select>
          <div v-if="errors.gender" class="text-danger">{{ errors.gender }}</div>
          <div class="invalid-feedback">Gender is required</div>
        </div>

        <div class="col-md-6">
          <label class="form-label" for="phone">Phone</label>
          <input
            v-model="formData.phone"
            class="form-control"
            id="phone"
            type="tel"
            required
          />
          <div v-if="errors.phone" class="text-danger">{{ errors.phone }}</div>
          <div class="invalid-feedback">Phone number is required</div>
        </div>

        <div class="col-md-12">
          <label class="form-label" for="email">Email</label>
          <input
            v-model="formData.email"
            class="form-control"
            id="email"
            type="email"
            required
          />
          <div v-if="errors.email" class="text-danger">{{ errors.email }}</div>
          <div class="invalid-feedback">Valid email is required</div>
        </div>

        <!-- Form Buttons -->
        <div class="col-12 d-flex justify-content-end">
          <button class="btn btn-secondary me-2" type="button" @click="closeEditModal">
            Cancel
          </button>
          <button class="btn btn-primary" type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? "Updating..." : "Update Profile" }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Change Password Modal -->
  <div v-if="showChangePasswordModal" class="modal-overlay">
    <div class="modal-content password-form">
      <h4>Change Password</h4>
      <div v-if="passwordModalMessage" class="alert alert-danger">
        {{ passwordModalMessage }}
      </div>
      <form
        class="row g-3 needs-validation"
        novalidate
        @submit.prevent="handleChangePassword"
      >
        <div class="col-12">
          <label class="form-label" for="currentPassword">Current Password</label>
          <input
            v-model="passwordData.current_password"
            class="form-control"
            id="currentPassword"
            type="password"
            required
          />
          <div v-if="errors.current_password" class="text-danger">
            {{ errors.current_password }}
          </div>
          <div class="invalid-feedback">Current password is required</div>
        </div>

        <div class="col-12">
          <label class="form-label" for="newPassword">New Password</label>
          <input
            v-model="passwordData.new_password"
            class="form-control"
            id="newPassword"
            type="password"
            minlength="6"
            required
          />
          <div v-if="errors.new_password" class="text-danger">
            {{ errors.new_password }}
          </div>
          <div class="invalid-feedback">New password must be at least 6 characters</div>
        </div>

        <div class="col-12">
          <label class="form-label" for="confirmPassword">Confirm New Password</label>
          <input
            v-model="passwordData.new_password_confirmation"
            class="form-control"
            id="confirmPassword"
            type="password"
            required
          />
          <div v-if="errors.new_password_confirmation" class="text-danger">
            {{ errors.new_password_confirmation }}
          </div>
          <div class="invalid-feedback">Password confirmation is required</div>
        </div>

        <div class="col-12 d-flex justify-content-end">
          <button
            class="btn btn-secondary me-2"
            type="button"
            @click="closeChangePasswordModal"
          >
            Cancel
          </button>
          <button class="btn btn-primary" type="submit" :disabled="isSubmittingPassword">
            {{ isSubmittingPassword ? "Changing..." : "Change Password" }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Reset Password Modal -->
  <div v-if="showResetPasswordModal" class="modal-overlay">
    <div class="modal-content password-form">
      <h4>Reset Password</h4>
      <div
        v-if="resetModalMessage"
        class="alert"
        :class="resetMessageType === 'success' ? 'alert-success' : 'alert-danger'"
      >
        {{ resetModalMessage }}
      </div>
      <form
        class="row g-3 needs-validation"
        novalidate
        @submit.prevent="handleResetPassword"
      >
        <div class="col-12">
          <label class="form-label" for="resetEmail">Email Address</label>
          <input
            v-model="resetForm.email"
            class="form-control"
            id="resetEmail"
            type="email"
            required
          />
          <div class="invalid-feedback">Valid email is required</div>
        </div>

        <div class="col-12 d-flex justify-content-end">
          <button
            class="btn btn-secondary me-2"
            type="button"
            @click="closeResetPasswordModal"
          >
            Cancel
          </button>
          <button class="btn btn-primary" type="submit" :disabled="isResetSubmitting">
            {{ isResetSubmitting ? "Sending..." : "Send Reset Link" }}
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
import { useToast } from "@/composables/useToast";
import { useGlobalStore } from "@/stores/global";
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";

// Uncomment this if you have translation composable
// import { useTranslation } from "@/components/useTranslation";

const { toasts, showNotification, removeToast } = useToast();
const globalStore = useGlobalStore();

// Create a mock translation function if useTranslation is not available
// const { t } = useTranslation();
const t = (key) => {
  const translations = {
    male: "Male",
    female: "Female",
    unknown: "Unknown",
    "not-available": "Not available",
    "invalid-date": "Invalid date",
    "error-fetching-profile": "An error occurred while fetching your profile",
    "invalid-image-format": "Invalid image format",
    "image-too-large": "Image file size should be less than 5MB",
    "first-name-required": "First name is required",
    "last-name-required": "Last name is required",
    "phone-required": "Phone number is required",
    "email-required": "Email is required",
    "current-password-required": "Current password is required",
    "new-password-required": "New password is required",
    "password-min-length": "Password must be at least 6 characters",
    "confirm-password-required": "Password confirmation is required",
    "passwords-dont-match": "Passwords do not match",
    success: "Success",
    "profile-updated-successfully": "Profile updated successfully!",
    "update-failed": "Failed to update profile",
    "password-updated-successfully": "Password updated successfully!",
    "password-update-failed": "Failed to update password",
    "reset-link-sent": "Password reset link sent to your email successfully!",
    "reset-failed": "Failed to send reset link",
    error: "Error",
    "initialization-failed": "Failed to initialize the profile component",
  };
  return translations[key] || key;
};

// State management
const state = reactive({
  isLoading: false,
  error: null,
});

// Form data
const formData = reactive({
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  gender: "0",
  image: "",
});

// Password change data
const passwordData = reactive({
  current_password: "",
  new_password: "",
  new_password_confirmation: "",
});

// UI states
const isSubmitting = ref(false);
const isSubmittingPassword = ref(false);
const isResetSubmitting = ref(false);
const showEditModal = ref(false);
const showChangePasswordModal = ref(false);
const showResetPasswordModal = ref(false);
const profileImageLoaded = ref(true);

// Modal messages
const modalMessage = ref("");
const passwordModalMessage = ref("");
const resetModalMessage = ref("");
const resetMessageType = ref("error");

// Form errors
const errors = reactive({
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  gender: "",
  image: "",
  current_password: "",
  new_password: "",
  new_password_confirmation: "",
});

// Reset password form
const resetForm = reactive({
  email: "",
});

// Edit form for image preview
const editForm = reactive({
  imagePreview: "",
  imageFile: null,
});

// Computed properties
const userProfile = computed(() => globalStore.profile || {});

// Utility Functions
const getGenderText = (gender) => {
  switch (String(gender)) {
    case "1":
      return t("male");
    case "2":
      return t("female");
    default:
      return t("unknown");
  }
};

const formatDate = (dateString) => {
  if (!dateString) return t("not-available");
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    return t("invalid-date");
  }
};

const handleImageError = (event) => {
  event.target.src = "/default-avatar.png";
  profileImageLoaded.value = false;
};

// Data loading functions
const loadUserData = () => {
  const userData = globalStore.profile;
  if (userData) {
    // Reset form data
    Object.keys(formData).forEach((key) => {
      if (userData[key] !== undefined) {
        formData[key] = userData[key];
      }
    });

    // Convert gender to string if it's numeric
    if (typeof formData.gender === "number") {
      formData.gender = formData.gender.toString();
    }

    // Check if profile has image
    if (formData.image) {
      profileImageLoaded.value = true;
    } else {
      profileImageLoaded.value = false;
    }
  } else {
    fetchUserData();
  }

  // Reset errors
  Object.keys(errors).forEach((key) => {
    errors[key] = "";
  });
};

const fetchUserData = async () => {
  state.isLoading = true;
  state.error = null;
  try {
    const response = await axios.get("/api/auth/me", globalStore.getAxiosHeader());

    if (response.data.result && response.data.data) {
      const userData = response.data.data;

      // Update global store
      globalStore.profile = userData;

      // Update form data
      Object.keys(formData).forEach((key) => {
        if (userData[key] !== undefined) {
          formData[key] = userData[key];
        }
      });

      // Convert gender to string if it's numeric
      if (typeof formData.gender === "number") {
        formData.gender = formData.gender.toString();
      }

      // Check if profile has image
      if (formData.image) {
        profileImageLoaded.value = true;
      } else {
        profileImageLoaded.value = false;
      }
    } else {
      state.error = response.data.message || t("error-fetching-profile");
      console.error("Failed to load user data:", response.data.message);
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    state.error = t("error-fetching-profile");
    await globalStore.onCheckError(error);
  }
  state.isLoading = false;
};

// Image handling functions
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Check file type
  if (!file.type.match("image.*")) {
    modalMessage.value = t("invalid-image-format");
    return;
  }

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    modalMessage.value = t("image-too-large");
    return;
  }

  editForm.imageFile = file;

  // Preview image
  const reader = new FileReader();
  reader.onload = (e) => {
    editForm.imagePreview = e.target.result;
    formData.image = e.target.result;
    profileImageLoaded.value = true;
  };
  reader.readAsDataURL(file);
};

// Validation functions
const validateForm = () => {
  let isValid = true;

  // Reset errors
  Object.keys(errors).forEach((key) => {
    errors[key] = "";
  });

  // Validate fields
  if (!formData.first_name.trim()) {
    errors.first_name = t("first-name-required");
    isValid = false;
  }

  if (!formData.last_name.trim()) {
    errors.last_name = t("last-name-required");
    isValid = false;
  }

  if (!formData.phone.trim()) {
    errors.phone = t("phone-required");
    isValid = false;
  }

  if (!formData.email.trim()) {
    errors.email = t("email-required");
    isValid = false;
  }

  return isValid;
};

const validatePasswordForm = () => {
  let isValid = true;

  // Reset password-related errors
  errors.current_password = "";
  errors.new_password = "";
  errors.new_password_confirmation = "";

  // Validate password fields
  if (!passwordData.current_password) {
    errors.current_password = t("current-password-required");
    isValid = false;
  }

  if (!passwordData.new_password) {
    errors.new_password = t("new-password-required");
    isValid = false;
  } else if (passwordData.new_password.length < 6) {
    errors.new_password = t("password-min-length");
    isValid = false;
  }

  if (!passwordData.new_password_confirmation) {
    errors.new_password_confirmation = t("confirm-password-required");
    isValid = false;
  } else if (passwordData.new_password !== passwordData.new_password_confirmation) {
    errors.new_password_confirmation = t("passwords-dont-match");
    isValid = false;
  }

  return isValid;
};

// API functions
const updateProfile = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;
  modalMessage.value = "";

  try {
    // Create FormData object for multipart/form-data
    const formDataToSend = new FormData();

    formDataToSend.append("first_name", formData.first_name);
    formDataToSend.append("last_name", formData.last_name);
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("gender", formData.gender);

    // Add image if it's a File object or base64 data
    if (editForm.imageFile) {
      formDataToSend.append("image", editForm.imageFile);
    } else if (
      formData.image &&
      typeof formData.image === "string" &&
      formData.image.startsWith("data:image")
    ) {
      try {
        // Convert base64 to file
        const response = await fetch(formData.image);
        const blob = await response.blob();
        const file = new File([blob], "profile-image.jpg", { type: blob.type });
        formDataToSend.append("image", file);
      } catch (imgError) {
        console.error("Error converting base64 to file:", imgError);
      }
    }

    const response = await axios.post(
      `/api/profile/update/${userProfile.value.id}`,
      formDataToSend,
      {
        ...globalStore.getAxiosHeader(),
        headers: {
          ...globalStore.getAxiosHeader().headers,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.result) {
      // Force refresh user profile in global store
      await fetchUserData();

      showNotification("success", t("success"), t("profile-updated-successfully"));
      closeEditModal();
    } else {
      modalMessage.value = response.data.message || t("update-failed");
    }
  } catch (error) {
    console.error("Profile update error:", error);

    // Handle validation errors from API
    if (error.response && error.response.data && error.response.data.errors) {
      const apiErrors = error.response.data.errors;
      Object.keys(apiErrors).forEach((key) => {
        if (errors[key] !== undefined) {
          errors[key] = apiErrors[key][0];
        }
      });
    }

    modalMessage.value = error.response?.data?.message || t("update-failed");
    await globalStore.onCheckError(error);
  } finally {
    isSubmitting.value = false;
  }
};

const updatePassword = async () => {
  if (!validatePasswordForm()) return;

  isSubmittingPassword.value = true;
  passwordModalMessage.value = "";

  try {
    const response = await axios.post(
      "/api/profile/pass",
      {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        new_password_confirmation: passwordData.new_password_confirmation,
      },
      globalStore.getAxiosHeader()
    );

    if (response.data.result) {
      showNotification("success", t("success"), t("password-updated-successfully"));
      closeChangePasswordModal();
      resetPasswordForm();
    } else {
      passwordModalMessage.value = response.data.message || t("password-update-failed");
    }
  } catch (error) {
    console.error("Password update error:", error);

    // Handle validation errors from API
    if (error.response && error.response.data && error.response.data.errors) {
      const apiErrors = error.response.data.errors;
      Object.keys(apiErrors).forEach((key) => {
        if (key in errors) {
          errors[key] = apiErrors[key][0];
        }
      });
    }

    passwordModalMessage.value =
      error.response?.data?.message || t("password-update-failed");
    await globalStore.onCheckError(error);
  } finally {
    isSubmittingPassword.value = false;
  }
};

const resetPassword = async () => {
  isResetSubmitting.value = true;
  resetModalMessage.value = "";

  try {
    const response = await axios.post(
      "/api/auth/reset-pass",
      {
        email: resetForm.email,
      },
      globalStore.getAxiosHeader()
    );

    if (response.data.result) {
      resetMessageType.value = "success";
      resetModalMessage.value = t("reset-link-sent");
    } else {
      resetMessageType.value = "error";
      resetModalMessage.value = response.data.message || t("reset-failed");
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    resetMessageType.value = "error";
    resetModalMessage.value = error.response?.data?.message || t("reset-failed");
    await globalStore.onCheckError(error);
  } finally {
    isResetSubmitting.value = false;
  }
};

// Modal functions
const openEditModal = () => {
  loadUserData();
  editForm.imagePreview = "";
  editForm.imageFile = null;
  showEditModal.value = true;
  modalMessage.value = "";
};

const closeEditModal = () => {
  showEditModal.value = false;
  modalMessage.value = "";
  resetEditForm();
};

const openChangePasswordModal = () => {
  showChangePasswordModal.value = true;
  passwordModalMessage.value = "";
  resetPasswordForm();
};

const closeChangePasswordModal = () => {
  showChangePasswordModal.value = false;
  passwordModalMessage.value = "";
  resetPasswordForm();
};

const openResetPasswordModal = () => {
  resetForm.email = formData.email || "";
  showResetPasswordModal.value = true;
  resetModalMessage.value = "";
};

const closeResetPasswordModal = () => {
  showResetPasswordModal.value = false;
  resetModalMessage.value = "";
  resetForm.email = "";
};

// Form reset functions
const resetEditForm = () => {
  editForm.imagePreview = "";
  editForm.imageFile = null;
  Object.keys(errors).forEach((key) => {
    errors[key] = "";
  });
};

const resetPasswordForm = () => {
  passwordData.current_password = "";
  passwordData.new_password = "";
  passwordData.new_password_confirmation = "";
  errors.current_password = "";
  errors.new_password = "";
  errors.new_password_confirmation = "";
};

// Form submit handlers
const handleUpdateProfile = async (event) => {
  event.preventDefault();
  if (!event.target.checkValidity()) {
    event.stopPropagation();
    event.target.classList.add("was-validated");
    return;
  }

  await updateProfile();
};

const handleChangePassword = async (event) => {
  event.preventDefault();
  if (!event.target.checkValidity()) {
    event.stopPropagation();
    event.target.classList.add("was-validated");
    return;
  }

  await updatePassword();
};

const handleResetPassword = async (event) => {
  event.preventDefault();
  if (!event.target.checkValidity()) {
    event.stopPropagation();
    event.target.classList.add("was-validated");
    return;
  }

  if (!resetForm.email.trim()) {
    resetModalMessage.value = t("email-required");
    resetMessageType.value = "error";
    return;
  }

  await resetPassword();
};

// Initialize component
onMounted(async () => {
  try {
    await fetchUserData();
  } catch (error) {
    console.error("Error during initialization:", error);
    showNotification("error", t("error"), t("initialization-failed"));
    await globalStore.onCheckError(error);
  }
});
</script>

<style scoped>
/* Profile Image Styles */
.profile-image-container {
  position: relative;
  display: inline-block;
}

.profile-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #e9ecef;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.profile-image-upload {
  text-align: center;
}

.profile-image-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #dee2e6;
  margin-bottom: 0.5rem;
}

/* Profile Information Styles */
.profile-info {
  padding: 0.5rem 0;
  font-weight: 500;
  color: #495057;
  border-bottom: 1px solid #f8f9fa;
}

/* Card Styles */
.card {
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 1rem 1.25rem;
}

.card-body {
  padding: 1.25rem;
}

/* Modal Styles */
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
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.edit-profile-form .modal-content {
  max-width: 700px;
}

.password-form .modal-content {
  max-width: 450px;
}

/* Form Styles */
.form-control,
.form-select {
  border-color: #e5e5e5;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
}

.form-control:focus,
.form-select:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-label {
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.5rem;
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #dc3545;
}

/* Badge Styles */
.badge {
  font-size: 0.75em;
  padding: 0.25em 0.5em;
}

.badge.bg-warning {
  background-color: #ffc107 !important;
  color: #212529;
}

.badge.bg-success {
  background-color: #198754 !important;
}

/* Button Styles */
.btn {
  border-radius: 0.375rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  transition: all 0.15s ease-in-out;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.btn-primary:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
}

.btn-outline-primary {
  color: #0d6efd;
  border-color: #0d6efd;
}

.btn-outline-primary:hover {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: #fff;
}

.btn-outline-secondary {
  color: #6c757d;
  border-color: #6c757d;
}

.btn-outline-secondary:hover {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}

/* Alert Styles */
.alert {
  border-radius: 0.375rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
}

.alert-danger {
  color: #721c24;
  background-color: #f8d7da;
  border-color: #f5c2c7;
}

.alert-success {
  color: #0f5132;
  background-color: #d1e7dd;
  border-color: #badbcc;
}

/* Toast Notification Styles */
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
  border-radius: 0.375rem;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
  width: 300px;
  margin-bottom: 0.5rem;
  padding: 0.75rem 1rem;
  animation: toast-in 0.3s ease-out;
  border: 1px solid #e9ecef;
}

.toast-notification.success {
  border-left: 4px solid #198754;
}

.toast-notification.error {
  border-left: 4px solid #dc3545;
}

.toast-notification.warning {
  border-left: 4px solid #ffc107;
}

.toast-notification.info {
  border-left: 4px solid #0dcaf0;
}

.toast-icon {
  margin-right: 0.75rem;
  color: #6c757d;
  font-size: 1.1rem;
}

.toast-notification.success .toast-icon {
  color: #198754;
}

.toast-notification.error .toast-icon {
  color: #dc3545;
}

.toast-notification.warning .toast-icon {
  color: #ffc107;
}

.toast-notification.info .toast-icon {
  color: #0dcaf0;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #212529;
  font-size: 0.9rem;
}

.toast-message {
  color: #6c757d;
  font-size: 0.875rem;
  line-height: 1.4;
}

.toast-close {
  margin-left: auto;
  background: none;
  border: none;
  color: #6c757d;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.15s ease-in-out;
}

.toast-close:hover {
  background-color: #f8f9fa;
  color: #495057;
}

/* Toast Animations */
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

/* Error message styles */
.text-danger {
  color: #dc3545 !important;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    padding: 15px;
    margin: 10px;
  }

  .profile-image {
    width: 100px;
    height: 100px;
  }

  .profile-image-preview {
    width: 80px;
    height: 80px;
  }

  .toast-notification {
    width: 280px;
  }

  .card-body {
    padding: 1rem;
  }

  .btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }
}

@media (max-width: 576px) {
  .modal-content {
    width: 98%;
    padding: 10px;
  }

  .toast-container {
    left: 1rem;
    right: 1rem;
  }

  .toast-notification {
    width: 100%;
  }

  .profile-image {
    width: 80px;
    height: 80px;
  }

  .profile-image-preview {
    width: 60px;
    height: 60px;
  }
}

/* Loading and Error States */
.text-center {
  text-align: center;
}

.text-muted {
  color: #6c757d;
}

/* Form Validation Styles */
.was-validated .form-control:invalid,
.was-validated .form-select:invalid {
  border-color: #dc3545;
  padding-right: calc(1.5em + 0.75rem);
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath d='m5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}

.was-validated .form-control:valid,
.was-validated .form-select:valid {
  border-color: #198754;
  padding-right: calc(1.5em + 0.75rem);
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%23198754' d='m2.3 6.73.94-.94 1.96 1.96 3.98-3.98.94.94-4.92 4.92z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}

/* Utility Classes */
.mb-0 {
  margin-bottom: 0;
}
.mb-2 {
  margin-bottom: 0.5rem;
}
.mb-3 {
  margin-bottom: 1rem;
}
.mb-4 {
  margin-bottom: 1.5rem;
}
.mb-9 {
  margin-bottom: 3rem;
}

.me-2 {
  margin-right: 0.5rem;
}
.ms-2 {
  margin-left: 0.5rem;
}

.w-100 {
  width: 100%;
}

.d-none {
  display: none;
}
.d-flex {
  display: flex;
}

.justify-content-end {
  justify-content: flex-end;
}
.justify-content-between {
  justify-content: space-between;
}
.align-items-center {
  align-items: center;
}

/* Hover Effects */
.card:hover {
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.15s ease-in-out;
}

.profile-image:hover {
  transform: scale(1.02);
  transition: transform 0.2s ease-in-out;
}

/* Focus States */
.btn:focus,
.form-control:focus,
.form-select:focus {
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

/* File Input Styling */
input[type="file"] {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Custom Scrollbar for Modal */
.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
