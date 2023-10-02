
import { createApp } from 'vue'
import App from './App.vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { fa } from "vuetify/iconsets/fa";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import "@mdi/font/css/materialdesignicons.css";
import "@fortawesome/fontawesome-free/css/all.css";
import { VDatePicker } from 'vuetify/labs/VDatePicker';

const vuetify = createVuetify({
    icons: {
        defaultSet: "mdi",
        aliases,
        sets: {
          mdi,
          fa,
        },
      },

      components: {
        VDatePicker,
      },
    directives,
  })

createApp(App).use(vuetify).mount('#app')
