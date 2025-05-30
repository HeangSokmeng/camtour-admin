import { useGlobalStore } from '@/stores/global.js'
import { clearToken, loadProfile } from '@/utilities.js'
import axios from 'axios'
import { createRouter, createWebHistory } from 'vue-router'

const HomeView = () => import('@/views/HomeView.vue')
const LoginView = () => import('@/views/auth/LoginView.vue')
const ForgotView = () => import('@/views/auth/ForgotView.vue')
const OTPView = () => import('@/views/auth/OTPView.vue')
const ResetView = () => import('@/views/auth/ResetView.vue')
const CategoryView = () => import('@/views/categories/CategoryView.vue')
const TagView = () => import('@/views/tags/TagView.vue')
const ProvincesView = () => import('@/views/address/ProvinceView.vue')
const DistrictView = () => import('@/views/address/DistrictView.vue')
const CommuneView = () => import('@/views/address/CommuneView.vue')
const VillageVue = () => import('@/views/address/VillageView.vue')
const ProductColorView = () => import('@/views/products/ProductColorView.vue')
const ProductSizeView = () => import('@/views/products/ProductSizeView.vue')
const LocationView = () => import('@/views/locations/LocationView.vue')
const LocationPhotoView = () => import('@/views/locations/LocationPhotoView.vue')
const ProfileView = () => import('@/views/profile/ProfileView.vue')
const ProductBrandView = () => import('@/views/products/ProductBrandView.vue')
const ProductCategoryView = () => import('@/views/products/ProductCategoryView.vue')
const ProductView = () => import('@/views/products/ProductView.vue')
const ProductVariantView = () => import('@/views/products/ProductVariantView.vue')
const ProductPhotoView = () => import('@/views/products/ProductPhoto.vue')
const UsersView = () => import('@/views/users/UserView.vue')
const ForbiddenView = () => import('@/views/error/ForbiddenView.vue')
const CustomerCommment = () => import('@/views/customers/CommentView.vue')
const ProductOrder = () => import('@/views/products/ProductOrderView.vue')
const LocationGuide = () => import('@/views/locations/LocationGuideView.vue')
const SettingProfile = () => import('@/views/settings/ProfileSettingView.vue')
const UserRole = () => import('@/views/users/UserRoleView.vue')
const ChatBot = () => import('@/views/chatbot/ChatbotView.vue')

// Role constants
const ROLES = {
    SYSTEM_ADMIN: 1,
    ADMIN: 2,
    STAFF: 3,
    CUSTOMER: 4
}

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
            meta: {
                title: 'Admin Camtour . Dashboard',
                layout: 'board',
                auth: true
                // No roles specified - accessible to all authenticated users
            }
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView,
            meta: {
                title: 'Admin Camtour . Login',
                layout: 'auth',
                auth: false
            }
        },
        {
            path: '/forbidden',
            name: 'forbidden',
            component: ForbiddenView,
            meta: {
                title: 'Admin Camtour . Access Forbidden',
                 layout: null,
            }
        },
        {
            path: '/user',
            name: 'user',
            component: UsersView,
            meta: {
                title: 'Admin Camtour . User Management',
                layout: 'board',
                auth: true,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.ADMIN] // Only admin and system admin
            }
        },{
            path: '/user-role',
            name: 'user role',
            component: UserRole,
            meta: {
                title: 'Admin Camtour . Role Management',
                layout: 'board',
                auth: true,
                roles: [ROLES.SYSTEM_ADMIN] // Only admin and system admin
            }
        },
        {
            path: '/forgot-password',
            name: 'forgot.password',
            component: ForgotView,
            meta: {
                title: 'Admin Camtour . Forgot Password',
                layout: 'auth',
                auth: false
            }
        },
        {
            path: '/otp/forgot-verify',
            name: 'otp.forgot.verify',
            component: OTPView,
            meta: {
                title: 'Admin Camtour . Verify OTP',
                layout: 'auth',
                auth: false
            }
        },
        {
            path: '/reset-password',
            name: 'reset.password',
            component: ResetView,
            meta: {
                title: 'Admin Camtour . Reset Password',
                layout: 'auth',
                auth: false
            }
        },
        {
            path: '/category',
            name: 'category',
            component: CategoryView,
            meta: {
                title: 'Admin Camtour . Categories',
                layout: 'board',
                auth: true,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.STAFF]
            }
        },{
            path: '/chatbot',
            name: 'chatbot',
            component: ChatBot,
            meta: {
                title: 'Admin Camtour . ChatBot',
                layout: 'board',
                auth: true,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.STAFF]
            }
        }, {
            path: '/setting',
            name: 'setting',
            component: SettingProfile,
            meta: {
                title: 'Admin Camtour . Categories',
                layout: 'board',
                auth: true,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.STAFF]
            }
        }, {
            path: '/location/guide',
            name: 'location guide',
            component: LocationGuide,
            meta: {
                title: 'Admin Camtour . Categories',
                layout: 'board',
                auth: true,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.STAFF]
            }
        },
        {
            path: '/location',
            name: 'location',
            component: LocationView,
            meta: {
                title: 'Admin Camtour . Location Management',
                layout: 'board',
                auth: true,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.STAFF]
            }
        },
        {
            path: '/location/photo',
            name: 'location.photo',
            component: LocationPhotoView,
            meta: {
                title: 'Admin Camtour . Location Photos',
                layout: 'board',
                auth: true,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.STAFF]
            }
        },
        {
            path: '/color',
            name: 'product.color',
            component: ProductColorView,
            meta: {
                title: 'Admin Camtour . Product Colors',
                layout: 'board',
                auth: true,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.STAFF]
            }
        },
        {
            path: '/product/variant',
            name: 'product.variant',
            component: ProductVariantView,
            meta: {
                title: 'Admin Camtour . Product Variants',
                layout: 'board',
                auth: true,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.STAFF]
            }
        }, 
        {
            path: '/product/order',
            name: 'product.order',
            component: ProductOrder,
            meta: {
                title: 'Admin Camtour . Product Variants',
                layout: 'board',
                auth: true,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.STAFF]
            }
        },
        {
            path: '/product/size',
            name: 'product.size',
            component: ProductSizeView,
            meta: {
                title: 'Admin Camtour . Product Sizes',
                layout: 'board',
                auth: true,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.STAFF]
            }
        },
        {
            path: '/product/photo',
            name: 'product.photo',
            component: ProductPhotoView,
            meta: {
                title: 'Admin Camtour . Product Sizes',
                layout: 'board',
                auth: true,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.STAFF]
            }
        },
        {
            path: '/customer/comment',
            name: 'customer.comment',
            component: CustomerCommment,
            meta: {
                title: 'Admin Camtour . Product Sizes',
                layout: 'board',
                auth: true,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.STAFF]
            }
        },
        {
            path: '/tag',
            name: 'tag',
            component: TagView,
            meta: {
                title: 'Admin Camtour . Tags',
                layout: 'board',
                auth: true,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.STAFF]
            }
        },
        {
            path: '/province',
            name: 'province',
            component: ProvincesView,
            meta: {
                title: 'Admin Camtour . Provinces',
                layout: 'board',
                auth: true,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.STAFF]
            }
        },
        {
            path: '/district',
            name: 'district',
            component: DistrictView,
            meta: {
                title: 'Admin Camtour . Districts',
                layout: 'board',
                auth: true,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.STAFF]
            }
        },
        {
            path: '/commune',
            name: 'commune',
            component: CommuneView,
            meta: {
                title: 'Admin Camtour . Communes',
                layout: 'board',
                auth: true,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.STAFF]
            }
        },
        {
            path: '/village',
            name: 'village',
            component: VillageVue,
            meta: {
                title: 'Admin Camtour . Villages',
                layout: 'board',
                auth: true,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.STAFF]
            }
        },
        {
            path: '/profile/edit-profile',
            name: 'edit.profile',
            component: ProfileView,
            meta: {
                title: 'Admin Camtour . Profile',
                layout: 'board',
                auth: true
                // No roles specified - accessible to all authenticated users
            }
        },
        {
            path: '/product/brand',
            name: 'product.brand',
            component: ProductBrandView,
            meta: {
                title: 'Admin Camtour . Product Brands',
                layout: 'board',
                auth: true,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.STAFF]
            }
        },
        {
            path: '/product/category',
            name: 'product.category',
            component: ProductCategoryView,
            meta: {
                title: 'Admin Camtour . Product Categories',
                layout: 'board',
                auth: true,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.STAFF]
            }
        },
        {
            path: '/product',
            name: 'product',
            component: ProductView,
            meta: {
                title: 'Admin Camtour . Products',
                layout: 'board',
                auth: true,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.STAFF]
            }
        },
    ]
})

router.beforeEach(async (to, from) => {
    const gStore = useGlobalStore()
    gStore.ldi_page = true

    // Authentication check
    if (to.meta.auth) {
        try {
            const { is_remember, usr_obj, usr_tk } = loadProfile()

            // No token or user object - redirect to login
            if (!usr_tk || !usr_obj) {
                clearToken()
                return { name: 'login' }
            }

            // Set store data
            gStore.profile = usr_obj
            gStore.token = usr_tk
            gStore.is_remember = is_remember

            // Verify token validity if not already checked
            if (!sessionStorage.getItem('is_check_usr')) {
                const res = await axios.get('/api/auth/me', gStore.getAxiosHeader())

                if (!res.data.result) {
                    clearToken()
                    return { name: 'login' }
                }

                // Store profile
                if (is_remember) {
                    localStorage.setItem('usr_pr', JSON.stringify(res.data.data))
                } else {
                    sessionStorage.setItem('usr_pr', JSON.stringify(res.data.data))
                }

                gStore.profile = res.data.data
                sessionStorage.setItem('is_check_usr', '1')
            }

            // Role-based access control (only if roles are specified)
            if (to.meta.roles && Array.isArray(to.meta.roles)) {
                const userRole = gStore.profile?.role_id

                if (!userRole || !to.meta.roles.includes(userRole)) {
                    return {
                        name: 'forbidden',
                        query: {
                            roles: to.meta.roles.join(',')
                        }
                    }
                }
            }

        } catch (err) {
            console.error('Router error:', err)
            if (err.code === 'ERR_NETWORK') {
                alert('Error connection! Please check internet connection, then try again.')
            } else if (err.response?.status === 401) {
                clearToken()
                return { name: 'login' }
            } else if (err.response?.status === 403) {
                clearToken()
                sessionStorage.removeItem('is_check_usr')
                return { name: 'login' }
            } else {
                // Other errors - go to login
                clearToken()
                return { name: 'login' }
            }
        }
    } else {
        // Handle public routes
        if (['login', 'forgot.password', 'otp.forgot.verify', 'reset.password'].includes(to.name)) {
            const { is_remember, usr_obj, usr_tk } = loadProfile()

            if (!usr_tk || !usr_obj) {
                clearToken()
            } else {
                gStore.profile = usr_obj
                gStore.token = usr_tk
                gStore.is_remember = is_remember

                try {
                    const res = await axios.get('/api/auth/me', gStore.getAxiosHeader())

                    if (!res.data.result) {
                        clearToken()
                    } else {
                        if (is_remember) {
                            localStorage.setItem('usr_pr', JSON.stringify(res.data.data))
                        } else {
                            sessionStorage.setItem('usr_pr', JSON.stringify(res.data.data))
                        }

                        gStore.profile = res.data.data
                        sessionStorage.setItem('is_check_usr', '1')
                        return { name: 'home' }
                    }
                } catch (err) {
                    clearToken()
                }
            }
        }
    }
})

router.afterEach((to, from, failure) => {
    const gStore = useGlobalStore()
    gStore.ldi_page = false
    document.title = to.meta.title

    if (failure) {
        console.error('Navigation failed:', failure)
    }
})

export default router