import { defineStore } from 'pinia'

export const useOTPStore = defineStore('vews/auth/otp', {
    state: () => ({
        mdl_expired: null
    })
})