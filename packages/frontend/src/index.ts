import './styles/index.css'

import { Classic } from '@caido/primevue'
import PrimeVue from 'primevue/config'
import { createApp } from 'vue'

import App from './views/App.vue'
import { SDKPlugin } from './plugins/sdk'
import type { FrontendSDK } from './types'
import { setupQuickActionShortcut } from './services/quickActions'

let quickActionCleanup: (() => void) | null = null

export const init = (sdk: FrontendSDK) => {
  const app = createApp(App)

  app.use(PrimeVue, {
    unstyled: true,
    pt: Classic,
  })

  app.use(SDKPlugin, sdk)

  const root = document.createElement('div')
  Object.assign(root.style, {
    height: '100%',
    width: '100%',
  })

  root.id = `plugin--chatio`
  root.className = `chatio-app`

  app.mount(root)

  sdk.navigation.addPage('/chatio', {
    body: root,
  })

  sdk.sidebar.registerItem('Chatio', '/chatio', {
    icon: 'fas fa-robot',
  })

  quickActionCleanup = setupQuickActionShortcut(sdk)
}
