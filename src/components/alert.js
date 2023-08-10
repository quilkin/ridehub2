// components/modules/alert/alert.js
import { createApp } from 'vue'
import AlertComponent from './Alert.vue'

// export default {
//   install: (app, options) => {
//     /* declare global component */
//     app.component("my-alert", AlertComponent);
//   },
// };
export const Alert = {}

Alert.install = (app) => {
  const instance = createApp(AlertComponent).mount(document.createElement('div'))

  app.config.globalProperties.$myAlert = (msg) => {
    document.body.appendChild(instance.$el)
    // alert logic
    instance.type = 'alert'
    instance.msg = msg
    instance.isShow = true
    instance.instance = instance
  }

  // app.config.globalProperties.$confirm = (msg, success, cancel) => {
  //   document.body.appendChild(instance.$el)
  //   // confirm logic
  //   instance.type = 'confirm'
  //   instance.msg = msg
  //   instance.isShow = true
  //   instance.instance = instance
  //   if (typeof success !== 'undefined') {
  //     instance.success = success
  //   }
  //   if (typeof cancel !== 'undefined') {
  //     instance.cancel = cancel
  //   }
  // }

}

