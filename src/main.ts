
import { createApp } from 'vue'
import App from './App.vue'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from "vuetify/iconsets/mdi-svg";
import './assets/main.css'

import  VCalendar  from 'v-calendar';
import 'v-calendar/style.css';

const vuetify = createVuetify({
    icons: {
        defaultSet: "mdi",
        aliases,
        sets: {
          mdi,
        },
      },
    directives,
   
  })

createApp(App).use(vuetify).use(VCalendar, {}).mount('#app')


