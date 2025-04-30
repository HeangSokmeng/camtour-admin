import '@/assets/css/main.css'
import '@/assets/css/theme.css'
import '@fortawesome/fontawesome-free/css/all.css'
import 'quill/dist/quill.snow.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

import axios from 'axios'
import App from './App.vue'
import router from './router'

axios.defaults.baseURL = import.meta.env.VITE_API_HOST

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
