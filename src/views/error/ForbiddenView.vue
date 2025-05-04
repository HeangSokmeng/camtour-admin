<template>
  <div class="forbidden-page">
    <div class="forbidden-content">
      <div class="error-animation">
        <div class="lock-icon">
          <i class="fa fa-lock fa-5x text-danger"></i>
        </div>
      </div>

      <h1 class="error-code">403</h1>
      <h2 class="error-title">Access Forbidden</h2>
      <p class="error-message">You don't have permission to access this page.</p>

      <div class="action-buttons mt-4">
        <button class="btn btn-primary me-2 animated-btn" @click="goBack">
          <i class="fa fa-arrow-left me-2 looping-icon"></i>
          <span class="looping-text">Go Back</span>
        </button>

        <button class="btn btn-secondary" @click="goHome">
          <i class="fa fa-home me-2"></i>Go to Dashboard
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGlobalStore } from "@/stores/global";
import { useRouter, useRoute } from "vue-router";
import { computed } from "vue";

const globalStore = useGlobalStore();
const router = useRouter();
const route = useRoute();

const roleName = computed(() => globalStore.roleName);

const roleMapping = {
  1: "System Admin",
  2: "Admin",
  3: "Staff",
  4: "Customer",
};

const requiredRoles = computed(() => {
  // Get roles from route meta or fallback to route params
  const roles = route.meta?.roles || route.query?.roles?.split(",").map(Number) || [];
  return roles.map((roleId) => roleMapping[roleId] || `Role ${roleId}`);
});

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1);
  } else {
    router.push("/");
  }
};

const goHome = () => {
  router.push("/");
};
</script>

<style scoped>
/* Looping icon movement */
@keyframes iconBounce {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-6px);
  }
}

.looping-icon {
  animation: iconBounce 1s infinite ease-in-out;
}

/* Looping text glow or pulse */
@keyframes textPulse {
  0%,
  100% {
    color: white;
  }
  50% {
    color: #bfdbfe; /* light blue */
  }
}

.looping-text {
  animation: textPulse 2s infinite;
}

.forbidden-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
}

.forbidden-content {
  text-align: center;
  background: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
}

.error-animation {
  margin-bottom: 2rem;
}

.lock-icon {
  background: #fee2e2;
  width: 120px;
  height: 120px;
  margin: 0 auto;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

.error-code {
  font-size: 6rem;
  font-weight: bold;
  color: #ef4444;
  margin: 0;
  line-height: 1;
}

.error-title {
  font-size: 2rem;
  color: #1f2937;
  margin: 1rem 0;
}

.error-message {
  color: #6b7280;
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
}

.error-details {
  background: #f9fafb;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.role-list {
  list-style-type: none;
  padding-left: 1rem;
  margin: 0.5rem 0;
}

.role-list li {
  color: #374151;
  margin: 0.25rem 0;
}

.role-list li::before {
  content: "•";
  color: #ef4444;
  margin-right: 0.5rem;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background-color: #4b5563;
}
</style>
