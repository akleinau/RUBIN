import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus';
import {ElMain} from 'element-plus'
import 'element-plus/lib/theme-chalk/index.css';

createApp(App)
    .use(ElementPlus)
    .use(ElMain)
    .mount('#app')

