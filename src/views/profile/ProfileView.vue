<template>
  <div class="row align-items-center justify-content-between g-3 mb-4">
    <div class="col-auto">
      <h2 class="mb-0">Profile</h2>
    </div>
    <div class="col-auto">
      <div class="row g-2 g-sm-3">
        <div class="col-auto">
          <button
            class="btn btn-phoenix-secondary btn-edit-profile me-2"
            @click="toggleEditModal"
          >
            <span class="fas fa-user-edit me-2"></span>Edit Profile
          </button>
          <button
            class="btn btn-phoenix-secondary btn-reset-password"
            @click="togglePasswordModal"
          >
            <span class="fas fa-key me-2"></span>Reset password
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="row g-3 mb-6" v-if="!state.isLoading">
    <div class="col-12 col-lg-8">
      <div class="card h-100 card-profile">
        <div class="card-body">
          <div class="border-bottom border-dashed pb-4">
            <div class="row align-items-center g-3 g-sm-5 text-center text-sm-start">
              <div class="col-12 col-sm-auto">
                <input class="d-none" id="avatarFile" type="file" />
                <label class="cursor-pointer avatar avatar-5xl" for="avatarFile">
                  <img
                    class="rounded-circle avatar-image"
                    :src="profile.image || 'https://via.placeholder.com/150'"
                    alt="Profile Image"
                  />
                </label>
              </div>
              <div class="col-12 col-sm-auto flex-1">
                <h3 class="profile-name">{{ fullName }}</h3>
                <p class="text-muted">Joined {{ joinedAgo }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12 col-lg-4">
      <div class="card h-100 card-default-address">
        <div class="card-body">
          <div class="border-bottom border-dashed">
            <h4 class="mb-3">
              Contact Information
              <button class="btn btn-link p-0 address-edit-btn" type="button" @click="toggleEditModal">
                <span class="fas fa-edit fs-9 ms-3 text-body-quaternary"></span>
              </button>
            </h4>
          </div>

          <div class="border-top border-dashed pt-4">
            <div class="row flex-between-center mb-2">
              <div class="col-auto">
                <h5 class="text-body-highlight mb-0">Gender</h5>
              </div>
              <div class="col-auto">
                <span v-if="profile.gender == 1">Male</span>
                <span v-else-if="profile.gender == 2">Female</span>
                <span v-else>Not specified</span>
              </div>
            </div>
            <div class="row flex-between-center mb-2">
              <div class="col-auto">
                <h5 class="text-body-highlight mb-0">Email</h5>
              </div>
              <div class="col-auto">
                <a class="lh-1 email-link" :href="`mailto:${profile.email}`">{{
                  profile.email
                }}</a>
              </div>
            </div>

            <div class="row flex-between-center">
              <div class="col-auto">
                <h5 class="text-body-highlight mb-0">Phone</h5>
              </div>
              <div class="col-auto">
                <a class="phone-link" :href="`tel:${profile.phone}`">{{
                  profile.phone
                }}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

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
        <div class="modal-body">
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
              <div class="mt-2" v-if="editForm.imagePreview">
                <img :src="editForm.imagePreview" alt="Preview" class="img-thumbnail" style="max-height: 100px;" />
                <button type="button" class="btn btn-sm btn-danger ms-2" @click="removeImage">Remove</button>
              </div>
              <div class="invalid-feedback" v-if="profileErrors.image">
                {{ profileErrors.image }}
              </div>
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

  <!-- Password Reset Modal -->
  <div
    class="modal fade"
    :class="{ show: showPasswordModal }"
    tabindex="-1"
    :style="{ display: showPasswordModal ? 'block' : 'none' }"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Reset Password</h5>
          <button type="button" class="btn-close" @click="togglePasswordModal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitPasswordReset">
            <div class="mb-3">
              <label for="current_password" class="form-label">Current Password</label>
              <div class="input-group">
                <input
                  :type="passwordVisibility.current ? 'text' : 'password'"
                  class="form-control"
                  id="current_password"
                  v-model="passwordForm.current_password"
                  required
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
              <div class="invalid-feedback" v-if="errors.current_password">
                {{ errors.current_password }}
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
              <div class="invalid-feedback" v-if="errors.new_password">
                {{ errors.new_password }}
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
              <div class="invalid-feedback" v-if="errors.new_password_confirmation">
                {{ errors.new_password_confirmation }}
              </div>
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
    :class="{ show: showPasswordModal || showEditModal }"
    v-if="showPasswordModal || showEditModal"
  ></div>

</template>

<script setup>
import { useGlobalStore } from "@/stores/global";
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";

const state = reactive({
  isLoading: false,
  error: null,
  profile: null,
});

const profile = computed(
  () =>
    state.profile || {
      first_name: "",
      last_name: "",
      image: "https://via.placeholder.com/150", // fallback if no image
      phone: "",
      email: "",
      created_at: "",
      role: { id: 0, name: "" },
      gender: 0,
      is_email_verified: false,
    }
);

const fullName = computed(() =>
  `${profile.value.first_name} ${profile.value.last_name}`.trim()
);

const joinedAgo = computed(() => {
  if (!profile.value.created_at) return "N/A";
  const createdDate = new Date(profile.value.created_at);
  const now = new Date();
  const diffInMs = now - createdDate;
  const diffInMonths = diffInMs / (1000 * 60 * 60 * 24 * 30);
  if (diffInMonths < 1) return "Less than a month ago";
  return `${Math.floor(diffInMonths)} months ago`;
});

// Password Reset Modal Variables
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
const errors = reactive({
  current_password: "",
  new_password: "",
  new_password_confirmation: "",
});

// Edit Profile Modal Variables
const showEditModal = ref(false);
const editForm = reactive({
  first_name: "",
  last_name: "",
  gender: 0,
  phone: "",
  email: "",
  image: null,
  imagePreview: null,
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

const togglePasswordModal = () => {
  showPasswordModal.value = !showPasswordModal.value;
  if (showPasswordModal.value) showEditModal.value = false;
  
  if (!showPasswordModal.value) {
    // Reset form when closing modal
    passwordForm.current_password = "";
    passwordForm.new_password = "";
    passwordForm.new_password_confirmation = "";
    // Clear any errors
    errors.current_password = "";
    errors.new_password = "";
    errors.new_password_confirmation = "";
    // Reset password visibility
    passwordVisibility.current = false;
    passwordVisibility.new = false;
    passwordVisibility.confirmation = false;
  }
};

const toggleEditModal = () => {
  showEditModal.value = !showEditModal.value;
  if (showEditModal.value) {
    // Populate form with current data
    showPasswordModal.value = false;
    editForm.first_name = profile.value.first_name;
    editForm.last_name = profile.value.last_name;
    editForm.gender = profile.value.gender.toString();
    editForm.phone = profile.value.phone;
    editForm.email = profile.value.email;
    editForm.imagePreview = null;
  } else {
    // Clear form and errors when closing
    profileErrors.first_name = "";
    profileErrors.last_name = "";
    profileErrors.gender = "";
    profileErrors.phone = "";
    profileErrors.email = "";
    profileErrors.image = "";
  }
};

const togglePasswordVisibility = (field) => {
  passwordVisibility[field] = !passwordVisibility[field];
};

const handleImageChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  editForm.image = file;
  
  // Create a preview
  const reader = new FileReader();
  reader.onload = (e) => {
    editForm.imagePreview = e.target.result;
  };
  reader.readAsDataURL(file);
};

const removeImage = () => {
  editForm.image = null;
  editForm.imagePreview = null;
  document.getElementById('edit_image').value = '';
};

const fetchProfile = async () => {
  state.isLoading = true;
  try {
    const globalStore = useGlobalStore();
    const res = await axios.get("/api/auth/me", globalStore.getAxiosHeader());
    if (res.data.result) {
      state.profile = res.data.data;
    } else {
      state.error = res.data.message || "Failed to fetch profile.";
    }
  } catch (error) {
    state.error = "Something went wrong.";
  } finally {
    state.isLoading = false;
  }
};

const submitProfileEdit = async () => {
  // Reset errors
  Object.keys(profileErrors).forEach(key => {
    profileErrors[key] = "";
  });
  
  editForm.isSubmitting = true;
  
  try {
    const globalStore = useGlobalStore();
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('first_name', editForm.first_name);
    formData.append('last_name', editForm.last_name);
    formData.append('gender', editForm.gender);
    formData.append('phone', editForm.phone);
    formData.append('email', editForm.email);
    
    if (editForm.image) {
      formData.append('image', editForm.image);
    }
    
    const res = await axios.post(
      "/api/profile/info",
      formData,
      {
        ...globalStore.getAxiosHeader(),
        headers: {
          ...globalStore.getAxiosHeader().headers,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    if (res.data.result) {
      // Update local profile data
      fetchProfile();
      alert("Profile updated successfully!");
      toggleEditModal();
    } else {
      // Handle validation errors from backend
      if (res.data.errors) {
        for (const [key, value] of Object.entries(res.data.errors)) {
          if (profileErrors.hasOwnProperty(key)) {
            profileErrors[key] = value[0];
          }
        }
      } else {
        alert(res.data.message || "Failed to update profile.");
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
      alert("Error updating profile.");
    }
  } finally {
    editForm.isSubmitting = false;
  }
};

const submitPasswordReset = async () => {
  // Reset errors
  errors.current_password = "";
  errors.new_password = "";
  errors.new_password_confirmation = "";

  // Validate passwords match
  if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
    errors.new_password_confirmation = "Passwords do not match";
    return;
  }

  passwordForm.isSubmitting = true;
  try {
    const globalStore = useGlobalStore();
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
      alert("Password changed successfully!");
      togglePasswordModal();
    } else {
      // Handle validation errors from backend
      if (res.data.errors) {
        for (const [key, value] of Object.entries(res.data.errors)) {
          if (errors.hasOwnProperty(key)) {
            errors[key] = value[0];
          }
        }
      } else {
        alert(res.data.message || "Failed to change password.");
      }
    }
  } catch (error) {
    if (error.response && error.response.data.errors) {
      for (const [key, value] of Object.entries(error.response.data.errors)) {
        if (errors.hasOwnProperty(key)) {
          errors[key] = value[0];
        }
      }
    } else {
      alert("Error changing password.");
    }
  } finally {
    passwordForm.isSubmitting = false;
  }
};

onMounted(fetchProfile);
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
/* General Styling */
.cursor-pointer {
  cursor: pointer;
}

/* Card Styling */
.card-profile {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: linear-gradient(145deg, #ffffff, #f0f0f0);
}

.card-default-address {
  background: #fdfdfd;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  transition: transform 0.3s ease;
}

.card-default-address:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

/* Profile Image Styling */
.avatar-image {
  border: 4px solid #007bff;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.avatar-image:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Typography */
.profile-name {
  font-weight: bold;
  font-size: 1.5rem;
  color: #333;
}

.email-link,
.phone-link {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.email-link:hover,
.phone-link:hover {
  text-decoration: underline;
}

/* Buttons */
.btn-reset-password,
.btn-edit-profile {
  background-color: #007bff;
  color: white;
  transition: background-color 0.3s ease;
}

.btn-reset-password:hover,
.btn-edit-profile:hover {
  background-color: #0056b3;
}

.address-edit-btn {
  color: #6c757d;
}

.address-edit-btn:hover {
  color: #007bff;
}
</style>