// src/composables/useToast.js
import { ref } from 'vue';

// Create a shared state that will be used across components
let toastIdCounter = 0;
const sharedToasts = ref([]);

export function useToast() {
  // Show toast notification
  const showNotification = (type, title, message) => {
    const id = toastIdCounter++;
    let icon = 'fas fa-bell';
    
    // Set appropriate icon based on notification type
    switch (type) {
      case 'success':
        icon = 'fas fa-check-circle';
        break;
      case 'error':
        icon = 'fas fa-times-circle';
        break;
      case 'warning':
        icon = 'fas fa-exclamation-triangle';
        break;
      case 'info':
        icon = 'fas fa-info-circle';
        break;
    }
    
    // Add toast to the array
    sharedToasts.value.push({
      id,
      type,
      title,
      message,
      icon
    });
    
    // Auto-remove toast after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  // Remove a specific toast by ID
  const removeToast = (id) => {
    const index = sharedToasts.value.findIndex(toast => toast.id === id);
    if (index !== -1) {
      sharedToasts.value.splice(index, 1);
    }
  };

  return {
    toasts: sharedToasts,
    showNotification,
    removeToast
  };
}