import { createApp } from 'vue'
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import axios from 'axios'
import App from './App.vue'
import router from './router'

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// Använd app.config.globalProperties.$http i Vue 3
app.config.globalProperties.$http = axios.create({
    baseURL: "http://localhost:3001/api"
})

app.use(ElementPlus);
app.use(router)

app.mount('#app')
