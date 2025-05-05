<template>
  <div v-if="route.meta.layout === 'board'">
    <LayoutBoard>
      <RouterView />
    </LayoutBoard>
  </div>
  <div v-else-if="route.meta.layout === 'auth'">
    <LayoutAuth>
      <RouterView />
      <template #modal>
        <LoginFail v-if="route.name === 'login'" />
        <OTPWrong v-if="['otp.forgot.verify', 'reset.password'].includes(route.name)" />
        <OTPExpired v-if="['otp.forgot.verify', 'reset.password'].includes(route.name)" />
        <ResetSuccess v-if="'reset.password' === route.name" />
      </template>
    </LayoutAuth>
  </div>
  <div v-else>
    <ForbiddenPage>
      <RouterView />
    </ForbiddenPage>
  </div>
</template>

<script setup>
import LayoutAuth from "@/components/layouts/LayoutAuth.vue";
import LayoutBoard from "@/components/layouts/LayoutBoard.vue";
import LoginFail from "@/components/views/auth/login/LoginFail.vue";
import OTPExpired from "@/components/views/auth/otp/OTPExpired.vue";
import OTPWrong from "@/components/views/auth/otp/OTPWrong.vue";
import ResetSuccess from "@/components/views/auth/reset/ResetSuccess.vue";
import ForbiddenPage from "@/views/error/ForbiddenView.vue";
import { RouterView, useRoute } from "vue-router";
const route = useRoute();
</script>
