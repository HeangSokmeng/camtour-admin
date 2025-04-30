import { defineStore } from 'pinia'


export const useResetStore = defineStore('views/auth/reset', {
    state: () => ({
        mdl_success: null
    })
})