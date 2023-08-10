<script setup lang="ts">
import { ref, onBeforeMount, inject } from 'vue'
// @ts-ignore
import {serverPost} from '../../utils/server'
import {nameRules,pwRules} from '../../utils/rules'
import { User } from '../../utils/user'
//import  myAlert from '../alert.vue'
//import { useNotification } from "@kyvg/vue3-notification";

//const loginDialog = ref(false)
const loginForm = ref();
const userOrEmail = ref('');
const password = ref('');
const showPass = ref(false);
const remember = ref(false);
const register = ref(false);
const webError = ref(false);
const badCreds = ref(false);

const emit = defineEmits(['loggedIn','signUp','forgotPass','guestVisit'])

onBeforeMount(() => {
  if (window.localStorage.username !== undefined && window.localStorage.password !== undefined) {
            userOrEmail.value = window.localStorage.username;
            password.value = window.localStorage.password;
            remember.value = true;
        }
  })

async function submit() {
  const {valid} = await loginForm.value?.validate()
  if (valid) {
    const user = userOrEmail.value;
    const pass = password.value;
    console.log(user + ' ' + pass);
    const creds = { name: user, pw: pass, email: "", code: 0 };

    serverPost('Login', creds, true)
        .then((res: User) => {
                if (res != null) {
                  if (res.id < 0) {
                        webError.value = true;
                        return;
                  }
                  if (res.id > 0) {
                      if (res.role === 0) {
                        register.value = true;
                        return;
                      }
                      emit('loggedIn',res);

                      if (remember.value) {
                        window.localStorage.username = user;
                        window.localStorage.password = pass;
                      }

                  } else {
                      badCreds.value = true;
                      return;
                  }
                }

            });
  }

}
function signup() {
  emit('signUp');
  //loginDialog.value = false;
}
function guest() {
  emit('guestVisit');
  //loginDialog.value = false;
}
function forgot() {
  emit("forgotPass");
  //loginDialog.value = false;
}
</script>

<template>
  <v-dialog  activator="parent" width="300">
  <v-card>
    <v-card-title class="headline black" primary-title>
      Sign in to TCC RideHub
    </v-card-title>
    <v-card-text class="pa-5">
      <v-form @submit.prevent="submit" ref="loginForm">
        <v-text-field v-model="userOrEmail"  :rules="nameRules"  label="User name or email" hint="Username will be 3 to 10 characters">
        </v-text-field>
        <v-text-field v-model="password" :append-inner-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="showPass = !showPass"   :type="showPass ? 'text' : 'password'" 
          hint="password will be at least 6 characters"
          :rules="pwRules"  label="Password">
        </v-text-field>

        <v-alert closable v-model = register  type="info"  text="You need to reply to your email to complete registration"/>
        <v-alert closable v-model = badCreds  type="error" text="Username or password incorrect"/>
        <v-alert closable v-model = webError  type="error" text="There is a problem with the web service"/>

        <v-checkbox
          v-model="remember"
          label="Remember me"
          value="false"
        ></v-checkbox>
        <v-btn color="blue" type="submit" block class="mt-2">    Sign in     </v-btn>
        <v-btn color="blue" variant="outlined" @click="signup()" block class="mt-2">   No account? Sign up    </v-btn>
        <v-btn color="blue" variant="outlined" @click="guest()" block class="mt-2">      Cancel / Continue as a guest   </v-btn>
        <v-btn color="blue" variant="outlined" @click="forgot()" block class="mt-2">      Forgot password?   </v-btn>
        
      </v-form>
    </v-card-text>
  </v-card>
  
</v-dialog>

</template>


