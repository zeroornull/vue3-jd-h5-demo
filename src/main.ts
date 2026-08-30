import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { installVant } from './plugins/vant'
import router from './router'
import './styles/index.scss'
import './styles/auth.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)
installVant(app)

app.mount('#app')
