import { clearToken } from '@/utilities.js';
import { defineStore } from 'pinia';

export const useGlobalStore = defineStore('global', {
    state: () => ({
        profile: null, // Keep the original profile property
        token: '',
        is_remember: true,
        mdl_logout: null,
        ldi_page: false,
        roleName: null
    }),
    persist: true,
    getters: {
        // Use profile instead of user for role checking
        isSystemAdmin: (state) => state.profile?.role_id === 1,
        isAdmin: (state) => state.profile?.role_id === 2,
        isStaff: (state) => state.profile?.role_id === 3,
        isCustomer: (state) => state.profile?.role_id === 4,
        
        // Permission checkers
        canAccessUserManagement: (state) => state.profile?.role_id <= 2, // system_admin or admin
        canAccessAdminPanel: (state) => state.profile?.role_id <= 2, // system_admin or admin
        canAccessSystemSettings: (state) => state.profile?.role_id === 1, // only system_admin
        canModifyData: (state) => state.profile?.role_id <= 3, // system_admin, admin, staff
        
        // Role level checking
        atLeastAdmin: (state) => state.profile?.role_id <= 2,
        atLeastStaff: (state) => state.profile?.role_id <= 3,
        atMostStaff: (state) => state.profile?.role_id >= 3,
        
        // Short role checks
        hasRole: (state) => (role) => state.profile?.role_id === role,
        hasAnyRole: (state) => (...roles) => roles.includes(state.profile?.role_id),
        
        // Role name getter
        roleName: (state) => {
            if (!state.profile?.role_id) return 'Guest';
            switch(state.profile.role_id) {
                case 1: return 'System Admin';
                case 2: return 'Admin';
                case 3: return 'Staff';
                case 4: return 'Customer';
                default: return 'Unknown';
            }
        },
        
        // Alias for user property for consistency
        user: (state) => state.profile
    },
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
                alert('Error connection! Please check your internet connection and try again.')
            } else if (err.response?.status === 401) {
                clearToken()
                this.logout()
                if (router) {
                    await router.push('/login')
                }
            } else if (err.response?.status === 403) {
                clearToken()
                sessionStorage.removeItem('is_check_usr')
                this.logout()
                if (router) {
                    await router.push('/login')
                }
            }
        },
        
        logout() {
            clearToken()
            this.profile = null
            this.token = ''
            sessionStorage.removeItem('is_check_usr')
        },
        
        // Helper method to check multiple roles
        checkRoles(...roles) {
            return roles.includes(this.profile?.role_id)
        }
    }
})