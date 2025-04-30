<template>
    <div v-if="route.meta.layout === 'board'">
        <LayoutBoard>
            <RouterView />
        </LayoutBoard>
    </div>
    <div v-else>
        <LayoutAuth>
            <RouterView/>
            <template #modal>
                <LoginFail v-if="route.name === 'login'" />
                <OTPWrong v-if="['otp.forgot.verify', 'reset.password'].includes(route.name)"/>
                <OTPExpired v-if="['otp.forgot.verify', 'reset.password'].includes(route.name)"/>
                <ResetSuccess v-if="'reset.password' === route.name"/>
            </template>
        </LayoutAuth>
    </div>
</template>

<script setup>
import { RouterView, useRoute } from 'vue-router'
import LayoutAuth from '@/components/layouts/LayoutAuth.vue'
import LoginFail from '@/components/views/auth/login/LoginFail.vue'
import LayoutBoard from '@/components/layouts/LayoutBoard.vue'
import OTPWrong from '@/components/views/auth/otp/OTPWrong.vue'
import OTPExpired from '@/components/views/auth/otp/OTPExpired.vue'
import ResetSuccess from '@/components/views/auth/reset/ResetSuccess.vue'

const route = useRoute()
</script>