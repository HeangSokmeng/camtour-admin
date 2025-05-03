<template>
  <div class="mt-4">
    <nav aria-label="Page navigation">
      <ul class="pagination justify-content-center">
        <!-- First Page Button -->
        <li class="page-item" :class="{ disabled: !canGoPrevious }">
          <a class="page-link" href="#" @click.prevent="goToPage(1)" aria-label="First">
            <span aria-hidden="true">&laquo;&laquo;</span>
          </a>
        </li>

        <!-- Previous Button -->
        <li class="page-item" :class="{ disabled: !canGoPrevious }">
          <a
            class="page-link"
            href="#"
            @click.prevent="goToPage(currentPage - 1)"
            aria-label="Previous"
          >
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>

        <!-- Page Numbers -->
        <li
          v-for="page in visiblePageNumbers"
          :key="page"
          class="page-item"
          :class="{ active: page === currentPage }"
        >
          <a class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
        </li>

        <!-- Next Button -->
        <li class="page-item" :class="{ disabled: !canGoNext }">
          <a
            class="page-link"
            href="#"
            @click.prevent="goToPage(currentPage + 1)"
            aria-label="Next"
          >
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>

        <!-- Last Page Button -->
        <li class="page-item" :class="{ disabled: !canGoNext }">
          <a
            class="page-link"
            href="#"
            @click.prevent="goToPage(lastPage)"
            aria-label="Last"
          >
            <span aria-hidden="true">&raquo;&raquo;</span>
          </a>
        </li>
      </ul>
    </nav>

    <!-- Page info -->
    <div class="text-center text-muted fs-9 mt-2">
      Showing {{ firstItem }} to {{ lastItem }} of {{ total }} entries
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  lastPage: {
    type: Number,
    required: true,
  },
  firstItem: {
    type: Number,
    required: true,
  },
  lastItem: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["page-changed"]);

// Calculate visible page numbers
const visiblePageNumbers = computed(() => {
  const maxVisiblePages = 5;
  let startPage = Math.max(1, props.currentPage - 2);
  let endPage = Math.min(props.lastPage, startPage + maxVisiblePages - 1);

  // Adjust start page if we're near the end
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
});

// Navigation conditions
const canGoPrevious = computed(() => props.currentPage > 1);
const canGoNext = computed(() => props.currentPage < props.lastPage);

// Navigation handler
const goToPage = (page) => {
  if (page >= 1 && page <= props.lastPage && page !== props.currentPage) {
    emit("page-changed", page);
  }
};
</script>
