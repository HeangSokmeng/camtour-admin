import { defineStore } from 'pinia'
import { clearToken } from '@/utilities.js'

export const useGlobalStore = defineStore('global', {
    state: () => ({
        profile: null,
        token: '',
        is_remember: true,
        mdl_logout: null
    }),
    actions: {
        getAxiosHeader() {
            return {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        },
        async onCheckError(err, router = null) {
            if (err.code === 'ERR_NETWORK') {
                alert('Error connection! Please check internet connection, then try again.')
            } else if (err.response.status === 401) {
                alert('No authorization')
            } else if (err.response.status === 403) {
                clearToken()
                sessionStorage.removeItem('is_check_usr')
                if (router) {
                    await router.push('/login')
                }
            }
        }
    }
})