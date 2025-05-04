<template>
  <div class="home-debug">
    <h2>Home View Test</h2>
    <div class="card">
      <div class="card-body">
        <p>
          <strong>Profile:</strong> {{ globalStore.profile ? "Loaded" : "Not Loaded" }}
        </p>
        <p><strong>Role ID:</strong> {{ globalStore.profile?.role_id }}</p>
        <p><strong>At Least Staff:</strong> {{ globalStore.atLeastStaff }}</p>
        <p>
          <strong>Can Access User Management:</strong>
          {{ globalStore.canAccessUserManagement }}
        </p>
        <p><strong>Is System Admin:</strong> {{ globalStore.isSystemAdmin }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGlobalStore } from "@/stores/global";

const globalStore = useGlobalStore();
</script>

<style scoped>
.home-debug {
  padding: 20px;
}

.card {
  margin-top: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-body {
  padding: 20px;
}
</style>
