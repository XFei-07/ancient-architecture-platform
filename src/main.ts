import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import '@/assets/css/main.scss'
import '@/assets/css/tailwind.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)

const compactDevice = window.matchMedia('(max-width: 768px)').matches
  || window.matchMedia('(pointer: coarse)').matches
const forceDesktop = new URLSearchParams(window.location.search).get('view') === 'desktop'
const needsDashboardRuntime = !compactDevice
  || forceDesktop
  || window.location.hash.startsWith('#/decision-sandbox')

const bootstrap = async () => {
  // 手机首页不加载 ECharts 与 MockJS；两者只服务完整大屏和决策沙盘。
  if (needsDashboardRuntime) {
    const [{ registerEcharts }, { mockXHR }] = await Promise.all([
      import('@/plugins/echarts'),
      import('@/mock/index'),
    ])
    registerEcharts(app)
    mockXHR()
  }

  app.mount('#app')
}

bootstrap()
