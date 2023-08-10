
import { createApp } from 'vue'
import App from './App.vue'
//import Notifications from '@kyvg/vue3-notification'
// @ts-ignore
//import  {Alert}  from './components/alert.js'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { fa } from "vuetify/iconsets/fa";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import "@mdi/font/css/materialdesignicons.css";
import "@fortawesome/fontawesome-free/css/all.css";

const vuetify = createVuetify({
    icons: {
        defaultSet: "mdi",
        aliases,
        sets: {
          mdi,
          fa,
        },
      },

    components,
    directives,
  })

createApp(App).use(vuetify).mount('#app')
