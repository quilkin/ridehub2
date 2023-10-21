
import { createApp } from 'vue'
import App from './App.vue'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as directives from 'vuetify/directives'
//import { fa } from "vuetify/iconsets/fa";
import { aliases, mdi } from "vuetify/iconsets/mdi-svg";
//import "@mdi/font/css/materialdesignicons.css";
//import "@fortawesome/fontawesome-free/css/all.css";
import DateFnsAdapter from '@date-io/date-fns'
// import enUS from 'date-fns/locale/en-US'
// import enGB from 'date-fns/locale/en-GB'
// import svSE from 'date-fns/locale/sv'
import { VDatePicker } from 'vuetify/labs/VDatePicker';

import './assets/main.css'

const vuetify = createVuetify({
    icons: {
        defaultSet: "mdi",
        aliases,
        sets: {
          mdi,
        },
      },
      components: {
        VDatePicker,
      },
    directives,
    // date: {
    //   adapter: DateFnsAdapter,
    //   locale: {
    //     en: enUS,
    //     sv: svSE,
    //     gb: enGB
    //   },
    // },
    
  })

createApp(App).use(vuetify).mount('#app')
