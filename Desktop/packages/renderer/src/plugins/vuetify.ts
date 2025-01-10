import type { App } from 'vue'
import { createVuetify } from 'vuetify'
import { lightTheme, darkTheme } from '@/styles/theme'

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default function (app: App) {
  const vuetify = createVuetify({
    components,
    directives,
    icons: {
      defaultSet: 'mdi',
    },
    theme: {
      defaultTheme: 'dark',
      themes: {
        light: {
          colors: lightTheme.colors,
        },
        dark: {
          colors: darkTheme.colors,
        },
      },
    },
    defaults: {
      VBtn: {
        variant: 'text',
        density: 'comfortable',
        class: 'text-none',
      },
      VList: {
        bgColor: 'transparent',
        class: 'pa-2',
      },
      VListItem: {
        minHeight: '40px',
        rounded: 'sm',
      },
      VCard: {
        rounded: 'lg',
        elevation: 1,
      },
      VNavigationDrawer: {
        elevation: 0,
      },
      VDialog: {
        width: '400px',
      },
    },
  })

  app.use(vuetify)
}