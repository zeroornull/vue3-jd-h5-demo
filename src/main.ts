import { createApp } from 'vue'
import { createPinia } from 'pinia'

import { installUnauthorizedRedirect } from '@/api/unauthorized'
import App from './App.vue'
import { installVant } from './plugins/vant'
import router from './router'
import './styles/index.scss'
import './styles/auth.scss'
import './styles/order.scss'
import './styles/mine.scss'
import './styles/wallet.scss'
import './styles/node.scss'
import './styles/store.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)
installUnauthorizedRedirect(router)
installVant(app)

app.mount('#app')
