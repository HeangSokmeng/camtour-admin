<template>
  <div class="search-box navbar-top-search-box d-none d-lg-block" style="width: 25rem">
    <form
      class="position-relative"
      :class="{ show: state.is_show_search }"
      aria-expanded="false"
    >
      <input
        class="form-control search-input fuzzy-search rounded-pill form-control-sm"
        type="search"
        placeholder="Search..."
        aria-label="Search"
        v-model="state.frm.search"
        @input="onInputSearch()"
        @focusin="state.is_show_search = true"
      />
      <span class="fas fa-search search-box-icon"></span>
    </form>

    <div
      v-show="state.is_show_search"
      class="btn-close position-absolute end-0 top-50 translate-middle cursor-pointer shadow-none"
      @click="state.is_show_search = false"
    >
      <button class="btn btn-link p-0" aria-label="Close"></button>
    </div>
    <div
      class="dropdown-menu border start-0 py-0 overflow-hidden w-100"
      :class="{ show: state.is_show_search }"
    >
      <div class="scrollbar-overlay" style="max-height: 30rem">
        <div v-show="state.is_show_result" class="list pb-3">
          <h6
            v-show="state.result.block.length > 0"
            class="dropdown-header text-body-highlight fs-9 border-bottom border-translucent py-2 lh-sm"
          >
            Block
          </h6>
          <div v-show="state.result.block.length > 0" class="py-2">
            <RouterLink
              v-for="block in state.result.block"
              :key="block.id"
              :to="`/blocks/${block.id}`"
              class="dropdown-item"
            >
              <div class="d-flex align-items-center">
                <div class="fw-normal text-body-highlight title">
                  <span class="fa-solid fa-box" data-fa-transform="shrink-2"></span>
                  &nbsp;{{ block.title }}
                </div>
              </div>
            </RouterLink>
          </div>
          <hr v-show="state.result.block.length > 0" class="my-0" />
          <h6
            v-show="state.result.tree.length > 0"
            class="dropdown-header text-body-highlight fs-9 border-bottom border-translucent py-2 lh-sm"
          >
            Tree
          </h6>
          <div v-show="state.result.tree.length > 0" class="py-2">
            <RouterLink
              v-for="tree in state.result.tree"
              :key="tree.id"
              :to="`/trees/${tree.id}`"
              class="dropdown-item py-2 d-flex align-items-center"
            >
              <div class="file-thumbnail me-2">
                <img
                  class="h-100 w-100 object-fit-cover rounded-3"
                  :src="`${
                    parseInt(tree.category.id) === 1
                      ? '/other_asset/img/png/jack_fruit.png'
                      : '/other_asset/img/png/coconut.png'
                  }`"
                  alt="jack-fruit.png"
                />
              </div>
              <div class="flex-1">
                <h6 class="mb-0 text-body-highlight title">{{ tree.title }}</h6>
                <p class="fs-10 mb-0 d-flex text-body-tertiary">
                  <span class="fw-medium text-body-tertiary text-opactity-85"
                    >{{ tree.block.title }} . R{{ tree.row }}</span
                  >
                </p>
              </div>
            </RouterLink>
          </div>
          <hr v-show="state.result.tree.length > 0" class="my-0" />
          <h6
            v-show="state.result.fruit.length > 0"
            class="dropdown-header text-body-highlight fs-9 border-bottom border-translucent py-2 lh-sm"
          >
            Fruit
          </h6>
          <div v-show="state.result.fruit.length > 0" class="py-2">
            <RouterLink
              v-for="fruit in state.result.fruit"
              :key="fruit.id"
              :to="`/fruits/${fruit.id}`"
              class="dropdown-item py-2 d-flex align-items-center"
            >
              <div class="file-thumbnail me-2">
                <img
                  class="h-100 w-100 object-fit-cover rounded-3"
                  :src="`${
                    parseInt(fruit.category.id) === 1
                      ? '/other_asset/img/png/jack_fruit.png'
                      : '/other_asset/img/png/coconut.png'
                  }`"
                  alt="coconut.png"
                />
              </div>
              <div class="flex-1">
                <h6 class="mb-0 text-body-highlight title">
                  {{ fruit.category.title }} #{{ fruit.id }}
                </h6>
                <p class="fs-10 mb-0 d-flex text-body-tertiary">
                  <span class="fw-medium text-body-tertiary text-opactity-85">{{
                    fruit.tree.title
                  }}</span>
                </p>
              </div>
            </RouterLink>
          </div>
        </div>
        <div v-show="state.is_no_result" class="text-center">
          <p class="fallback fs-7">No Result Found.</p>
        </div>
        <div
          v-show="state.frm.search.length === 0 && !state.is_show_result"
          class="text-center mt-3"
        >
          <p class="fallback fs-7 fw-bold mb-0">Search Something?</p>
          <p>You can search block, tree code, fruit here.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";

let timeout = null;
const router = useRouter();
const state = reactive({
  result: {
    block: [],
    tree: [],
    fruit: [],
  },
  frm: {
    search: "",
  },
  is_show_search: false,
  is_show_result: false,
  is_no_result: false,
});

const onInputSearch = () => {
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(async () => {
    await onSearchFruit();
  }, 700);
};

const onSearchFruit = async () => {
  if (timeout) {
    clearTimeout(timeout);
  }
  if (state.frm.search.length > 0) {
    state.is_show_result = true;
  } else {
    state.is_show_result = false;
    state.result.block = [];
    state.result.tree = [];
    state.result.fruit = [];
    return;
  }
  // Search here
};
</script>
