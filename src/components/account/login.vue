<script setup lang="ts">
import { ref, onBeforeMount} from 'vue'
// @ts-ignore
import { nameRules,pwRules} from '../../utils/rules'
import { User } from '../../utils/user'
import { apiMethods, myFetch } from '../../utils/fetch'
import { Alert, AlertError } from '../../utils/alert'
import { mdiEye } from '@mdi/js'
import { mdiEyeOff } from '@mdi/js'

const loginForm = ref();
const userOrEmail = ref('');
const password = ref('');
const showPass = ref(false);
const remember = ref(false);

const emit = defineEmits(['loggedIn','signUp','forgotPass','guestVisit'])

onBeforeMount( () => {
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
    let creds = { name: username, pw: pass, email: "", code: 0 };
    
    myFetch(apiMethods.login,creds)
      .then((response) => {
        
          const user : User = response;
          if (user != null) {
            
            if (user.id > 0) {
                if (user.role === 0) {
                  Alert('Registration','You need to reply to your email to complete registration','','info','OK')
                  return;
                }
                console.log('user: ' + user.name);
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
</script>

<template>
  <div class="d-flex align-center flex-column">
  <v-card >
    <v-card-title class="headline black" primary-title>
      Sign in to TCC RideHub
    </v-card-title>
    <v-card-text class="pa-2">
      <v-form @submit.prevent="submit" ref="loginForm">
        <v-text-field v-model="userOrEmail"  :rules="nameRules"  label="User name or email" hint="Username will be 3 to 10 characters">
        </v-text-field>
        <v-text-field v-model="password" :append-inner-icon="showPass ? mdiEye : mdiEyeOff"
          @click:append-inner="showPass = !showPass"   :type="showPass ? 'text' : 'password'" 
          hint="password will be at least 6 characters"
          :rules="pwRules"  label="Password">
        </v-text-field>

        <v-checkbox v-if="remember===false" 
          v-model="remember"
          label="Remember me on this browser"
          value="false"
        ></v-checkbox>
        <v-btn color="blue" type="submit" block class="mt-2">    Sign in     </v-btn>

        <v-btn color="blue" variant="outlined" @click="signup()" block class="mt-2">   No account? Sign up    </v-btn>
        <v-btn color="blue" variant="outlined" @click="guest()" block class="mt-2">      Cancel / Continue as a guest   </v-btn>
        <v-btn color="blue" variant="outlined" @click="forgot()" block class="mt-2">      Forgot password?   </v-btn>
        
      </v-form>
    </v-card-text>
  </v-card>
  </div>
<!-- </v-dialog> -->

</template>

