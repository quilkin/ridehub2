<script setup lang="ts">

/**
 * Log in to a user's Ridehub account
 */

import { ref, onBeforeMount, onMounted} from 'vue'
// @ts-ignore
import { nameRules,pwRules} from '../../utils/rules'
import { myFetch } from '../../utils/fetch'
import { apiMethods} from '../../../../ridehub-server/src/common/apimethods'
import { User, Roles } from '../../../../ridehub-server/src/common/user'
import { Alert, AlertError } from '../../utils/alert'
import { mdiEye } from '@mdi/js'
import { mdiEyeOff } from '@mdi/js'

const loginForm = ref();
const userOrEmail = ref('');
const password = ref('');
const showPass = ref(false);
const passwordField = ref();
const showDBMemorial = ref(false);


const emit = defineEmits(['loggedIn','signUp','forgotPass','guestVisit'])

onBeforeMount(() => {
  const storedUsername = window.localStorage.getItem('username');
  if (storedUsername) {
    userOrEmail.value = storedUsername;

  }
  const today = new Date();
  //todo: ideally these dates would come from the server so they can be updated without an app update
  const memorialStart = new Date('2026-05-01');
  const memorialEnd = new Date('2026-06-13');
  if (today >= memorialStart && today <= memorialEnd) {
    showDBMemorial.value = true;
  }
})
onMounted(() => {
  // Force a click on the password field to trigger browser autofill
  setTimeout(() => {
    const input = passwordField.value?.$el?.querySelector('input');
    if (input) {
      input.click();

    }
  }, 100);
})
async function submit() {
  const {valid} = await loginForm.value?.validate()
  if (valid) {
    const username = userOrEmail.value;
    const pass = password.value;
    //if (remember.value) {
      window.localStorage.setItem('username', username);
    //} else {
    // for existing installations
     window.localStorage.removeItem('password');
    //}
    let user = new User(username, pass);
        
    myFetch(apiMethods.login,user)
      .then((response) => {
        
          const user : User = response;
          if (user != null) {
            
            if (user.id > 0) {
                if (user.role === Roles.None) {
                  Alert('Registration','You need to reply to your email to complete registration','','info','OK')
                  return;
                }
                //console.log('user: ' + user.name);
                emit('loggedIn',user);
                return;

            } else {
              AlertError('Login unsuccessful','Username or password incorrect')
              emit('loggedIn',null);
              return;
            }
          }
          AlertError('Login unsuccessful','Could not contact server');
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
// function crash() {
//   myFetch('crashtest1',null);
//   setTimeout(function() { myFetch('test',null); }, 5000);
// }
</script>

<template>
  <div class="d-flex align-center flex-column">
  <v-card >
     <v-card-text class="pa-2" v-if="showDBMemorial">
      <div class="text-center">Don't forget to enter the <a href="https://tinyurl.com/DBMR2026" target="_blank">DB Memorial Ride</a>.</div>
    </v-card-text>
    <v-card-title class="headline black" primary-title>
      Sign in to TCC RideHub
    </v-card-title>
    <v-card-text class="pa-2">
   
      <v-form @submit.prevent="submit" ref="loginForm">
        <v-text-field v-model="userOrEmail" name="username" autocomplete="username" :rules="nameRules" autocapitalize="off"
         label="User name or email" hint="Username will be 3 to 10 characters">
        </v-text-field>
        <v-text-field ref="passwordField" v-model="password" name="password" autocomplete="current-password" :append-inner-icon="showPass ? mdiEye : mdiEyeOff"
          @click:append-inner="showPass = !showPass"   :type="showPass ? 'text' : 'password'" 
          :rules="pwRules"  label="Password">
        </v-text-field>

        <v-btn color="blue" type="submit" block class="mt-2">    Sign in     </v-btn>

        <v-btn color="blue" variant="outlined" @click="signup()" block class="mt-2">   No account? Sign up    </v-btn>
        <v-btn color="blue" variant="outlined" @click="guest()" block class="mt-2">      Continue as a guest   </v-btn>
        <v-btn color="blue" variant="outlined" @click="forgot()" block class="mt-2">      Forgot password?   </v-btn>

      </v-form>
    </v-card-text>
    <v-card-text class="pa-2">
      <div class="text-center">&copy 2021-6 Version 2.3.0 <a href="https://truro.cc" target="_blank">Learn more about TCC</a>.</div>
    </v-card-text>
  </v-card>
  </div>
<!-- </v-dialog> -->

</template>

