<template>
  <LayoutBoard v-if="route.meta.layout === 'board'">
    <RouterView />
  </LayoutBoard>

  <LayoutAuth v-else-if="route.meta.layout === 'auth'">
    <RouterView />
    <template #modal>
      <LoginFail v-if="route.name === 'login'" />
      <OTPWrong v-if="['otp.forgot.verify', 'reset.password'].includes(route.name)" />
      <OTPExpired v-if="['otp.forgot.verify', 'reset.password'].includes(route.name)" />
      <ResetSuccess v-if="'reset.password' === route.name" />
    </template>
  </LayoutAuth>

  <div v-else>
    <RouterView />
  </div>
</template>

<script setup>
import LayoutAuth from "@/components/layouts/LayoutAuth.vue";
import LayoutBoard from "@/components/layouts/LayoutBoard.vue";
import LoginFail from "@/components/views/auth/login/LoginFail.vue";
import OTPExpired from "@/components/views/auth/otp/OTPExpired.vue";
import OTPWrong from "@/components/views/auth/otp/OTPWrong.vue";
import ResetSuccess from "@/components/views/auth/reset/ResetSuccess.vue";
import { RouterView, useRoute } from "vue-router";
const route = useRoute();
</script>
