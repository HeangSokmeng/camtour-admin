<template>
  <main class="main" id="top">
    <SideMenu />
    <TopMenu />
    <div class="content fs-9">
      <slot></slot>
    </div>
  </main>
  <ModalLogout />
</template>

<script setup>
import ModalLogout from "@/components/layouts/ModalLogout.vue";
import SideMenu from "@/components/layouts/SideMenu.vue";
import TopMenu from "@/components/layouts/TopMenu.vue";
</script>
