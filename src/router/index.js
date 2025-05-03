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
const ProvincesView = () => import('@/views/address/ProvinceView.vue');
const DistrictView = () => import('@/views/address/DistrictView.vue');
const CommuneView = () => import('@/views/address/CommuneView.vue');
const VillageVue = () => import('@/views/address/VillageView.vue');
const ProductColorView = () => import('@/views/products/ProductColorView.vue');
const ProductSizeView = () => import('@/views/products/ProductSizeView.vue');
const LocationView = () => import('@/views/locations/LocationView.vue');
const LocationPhotoView = () => import('@/views/locations/LocationPhotoView.vue');
const ProfileView = () => import('@/views/profile/ProfileView.vue');
const ProductBrandView = () => import('@/views/products/ProductBrandView.vue');
const ProductCategoryView = () => import('@/views/products/ProductCategoryView.vue');
const ProductView = () => import('@/views/products/ProductView.vue');
const ProductVariantView = () => import('@/views/products/ProductVariantView.vue');
const UserView = () => import('@/views/users/UserView.vue');

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
            meta: {
                title: 'Admin Adventure . Dashboard',
                layout: 'board',
                auth: true
            }
        }, {
            path: '/login',
            name: 'login',
            component: LoginView,
            meta: {
                title: 'Admin Adventure . Login',
                layout: 'auth',
                auth: false
            }
        }, {
            path: '/user',
            name: 'user',
            component: UserView,
            meta: {
                title: 'Admin Adventure . Login',
                layout: 'auth',
                auth: false
            }
        }, {
            path: '/forgot-password',
            name: 'forgot.password',
            component: ForgotView,
            meta: {
                title: 'Admin Adventure . Forgot Password',
                layout: 'auth',
                auth: false
            }
        }, {
            path: '/otp/forgot-verify',
            name: 'otp.forgot.verify',
            component: OTPView,
            meta: {
                title: 'Admin Adventure . Verify OTP',
                layout: 'auth',
                auth: false
            }
        }, {
            path: '/reset-password',
            name: 'reset.password',
            component: ResetView,
            meta: {
                title: 'Admin Adventure . Reset Password',
                layout: 'auth',
                auth: false
            }
        }, {
            path: '/category',
            name: 'category',
            component: CategoryView,
            meta: {
                title: 'Admin Adventure . Dashboard',
                layout: 'board',
                auth: true
            }
        }, {
            path: '/location',
            name: 'location',
            component: LocationView,
            meta: {
                title: 'Admin Adventure . Dashboard',
                layout: 'board',
                auth: true
            }
        }, {
            path: '/location/photo',
            name: 'location photo',
            component: LocationPhotoView,
            meta: {
                title: 'Admin Adventure . Dashboard',
                layout: 'board',
                auth: true
            }
        }, {
            path: '/color',
            name: 'product color',
            component: ProductColorView,
            meta: {
                title: 'Admin Adventure . Dashboard',
                layout: 'board',
                auth: true
            }
        },  {
            path: '/product/variant',
            name: 'product variant',
            component: ProductVariantView,
            meta: {
                title: 'Admin Adventure . Dashboard',
                layout: 'board',
                auth: true
            }
        },  {
            path: '/product/size',
            name: 'product size',
            component: ProductSizeView,
            meta: {
                title: 'Admin Adventure . Dashboard',
                layout: 'board',
                auth: true
            }
        }, {
            path: '/tag',
            name: 'tag',
            component: TagView,
            meta: {
                title: 'Admin Adventure . Dashboard',
                layout: 'board',
                auth: true
            }
        }, {
            path: '/province',
            name: 'province',
            component: ProvincesView,
            meta: {
                title: 'Admin Adventure . Dashboard',
                layout: 'board',
                auth: true
            }
        },
        {
            path: '/district',
            name: 'district',
            component: DistrictView,
            meta: {
                title: 'Admin Adventure . Dashboard',
                layout: 'board',
                auth: true
            }
        }, {
            path: '/commune',
            name: 'commune',
            component: CommuneView,
            meta: {
                title: 'Admin Adventure . Dashboard',
                layout: 'board',
                auth: true
            }
        }, {
            path: '/village',
            name: 'village',
            component: VillageVue,
            meta: {
                title: 'Admin Adventure . Dashboard',
                layout: 'board',
                auth: true
            }
        }, {
            path: '/profile/edit-profile',
            name: 'edit-profile',
            component: ProfileView,
            meta: {
                title: 'Admin Adventure . Dashboard',
                layout: 'board',
                auth: true
            }
        }, {
            path: '/product/brand',
            name: 'product brand',
            component: ProductBrandView,
            meta: {
                title: 'Admin Adventure . Dashboard',
                layout: 'board',
                auth: true
            }
        }, {
            path: '/product/category',
            name: 'product category',
            component: ProductCategoryView,
            meta: {
                title: 'Admin Adventure . Dashboard',
                layout: 'board',
                auth: true
            }
        }, {
            path: '/product',
            name: 'product',
            component: ProductView,
            meta: {
                title: 'Admin Adventure . Dashboard',
                layout: 'board',
                auth: true
            }
        },
    ]
})

router.beforeEach(async (to, from) => {
    const gStore = useGlobalStore()
    gStore.ldi_page = true
    if (to.meta.auth) {
        try {
            const { is_remember, usr_obj, usr_tk } = loadProfile()
            if (!usr_tk || !usr_obj) {
                clearToken()
                return { name: 'login' }
            } else {
                gStore.profile = usr_obj
                gStore.token = usr_tk
                gStore.is_remember = is_remember
            }
            if (!sessionStorage.getItem('is_check_usr')) {
                const res = await axios.get('/api/auth/me', gStore.getAxiosHeader())
                if (!res.data.result) {
                    clearToken()
                    return { name: 'login' }
                }
                if (is_remember) {
                    localStorage.setItem('usr_pr', JSON.stringify(res.data.data))
                } else {
                    sessionStorage.setItem('usr_pr', JSON.stringify(res.data.data))
                }
                gStore.profile = res.data.data
                sessionStorage.setItem('is_check_usr', '1')
            }
        } catch (err) {
            if (err.code === 'ERR_NETWORK') {
                alert('Error connection! Please check internet connection, then try again.')
            } else if (err.response.status === 401) {
                alert('No authorization')
            } else if (err.response.status === 403) {
                clearToken()
                sessionStorage.removeItem('is_check_usr')
                if (to.name !== 'login') {
                    return { name: 'login' }
                }
            }
        }
    } else {
        if (['login', 'forgot.password', 'otp.forgot.verify'].includes(to.name)) {
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
                    if (err.code === 'ERR_NETWORK') {
                        alert('Error connection! Please check internet connection, then try again.')
                    } else if (err.response.status === 401) {
                        alert('No authorization')
                    } else if (err.response.status === 403) {
                        clearToken()
                        sessionStorage.removeItem('is_check_usr')
                    }
                }
            }
        }
    }
})

router.afterEach((to, from, failure) => {
    document.title = to.meta.title
})

export default router
