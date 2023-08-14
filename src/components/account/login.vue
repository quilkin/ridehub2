<script setup lang="ts">
import { ref, onBeforeMount, inject } from 'vue'
// @ts-ignore
import {serverPost} from '../server.vue'
import {nameRules,pwRules} from '../../utils/rules'
import { User } from '../../utils/user'
import { myFetch } from '../fetch'
import Swal from 'sweetalert2'

const loginForm = ref();
const userOrEmail = ref('');
const password = ref('');
const showPass = ref(false);
const remember = ref(false);
//const register = ref(false);

const creds = ref();
//const badCreds = ref(false);

// const fetching = ref (false);
// const myChildFetch = ref();
// const callFetch = () => {
//   myChildFetch.value.myFetch()
// }

const emit = defineEmits(['loggedIn','signUp','forgotPass','guestVisit'])

onBeforeMount(() => {
  if (window.localStorage.username !== undefined && window.localStorage.password !== undefined) {
    if (window.localStorage.username !== 'undefined' && window.localStorage.password !== 'undefined') {
            userOrEmail.value = window.localStorage.username;
            password.value = window.localStorage.password;
            remember.value = true;
        }
      }
  })

async function submit() {
  const {valid} = await loginForm.value?.validate()
  if (valid) {
    const username = userOrEmail.value;
    const pass = password.value;
    if (remember.value) {
        window.localStorage.username = username;
        window.localStorage.password = pass;
      }
    console.log(username + ' ' + pass);
    creds.value = { name: username, pw: pass, email: "", code: 0 };
    
    myFetch('Login',creds.value,true)
      .then((response) => {
        console.log('response: ' + response);
          const user : User = response;
          if (user != null) {
            if (user.id > 0) {
                if (user.role === 0) {
                  Swal.fire({
                    title: 'Registration',
                    text: 'You need to reply to your email to complete registration',
                    icon: 'info',
                    confirmButtonText: 'OK'
                  }).then();
                  return;
                }
                emit('loggedIn',user);

            } else {
              Swal.fire({
                    title: 'Login unsuccessful',
                    text: 'Username or password incorrect',
                    icon: 'error',
                    confirmButtonText: 'OK'
                  }).then();
                  emit('loggedIn',null);
                return;
            }
          }
          Swal.fire({
                    title: 'Login unsuccessful',
                    text: 'Could not contact server',
                    icon: 'error',
                    confirmButtonText: 'OK'
                  }).then();
                  emit('loggedIn',null);
      })
  }
}


function signup() {
  emit('signUp');

}
function guest() {
  emit('guestVisit');

}
function forgot() {
  emit("forgotPass");

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

        <!-- <v-alert closable v-model = register  type="info"  text="You need to reply to your email to complete registration"/>
        <v-alert closable v-model = badCreds  type="error" text="Username or password incorrect"/> -->

        <v-checkbox
          v-model="remember"
          label="Remember me"
          value="false"
        ></v-checkbox>
        <v-btn color="blue" type="submit" block class="mt-2">    Sign in     </v-btn>
        <!-- <fetch v-model="fetching"
          ref="myChildFetch"
          :url="'login'"
          :data = creds
          :wait-dlg="true"
          @fetched="fetched"
        ></fetch> -->
        <v-btn color="blue" variant="outlined" @click="signup()" block class="mt-2">   No account? Sign up    </v-btn>
        <v-btn color="blue" variant="outlined" @click="guest()" block class="mt-2">      Cancel / Continue as a guest   </v-btn>
        <v-btn color="blue" variant="outlined" @click="forgot()" block class="mt-2">      Forgot password?   </v-btn>
        
      </v-form>
    </v-card-text>
  </v-card>
  
</v-dialog>

</template>

