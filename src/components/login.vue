<script setup lang="ts">
import { ref } from 'vue'

const loginDialog = ref(false)
const loginForm = ref(null);
const userOrEmail = ref('');
const password = ref('');
const showPass = ref(false);


const emit = defineEmits(['loggedIn','signUp','forgotPass'])

const nameRules =   [ (value: string) => !!value || 'Required.', 
                      (value: string) => {
                          if (value.length >= 3) return true
                          return 'Username will be 3 to 10 characters.'
                        },];
const pwRules =     [ (value: string) => !!value || 'Required.', 
                      (value: string) => {
                          if (value?.length >= 6) return true
                          return 'password will be 6 characters or more.'
                        },];


async function submit() {
  const {valid} = await loginForm.value?.validate()
  if (valid) {
    loginDialog.value = false;
    emit('loggedIn');
  }
}
function signup() {
  emit('signUp');
  loginDialog.value = false;
}
function guest() {
  //emit('guestVisit');
  loginDialog.value = false;
}
function forgot() {
  emit("forgotPass");
  loginDialog.value = false;
}
</script>

<template>
  <v-dialog v-model="loginDialog" activator="parent" width="300">
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
        <v-btn color="blue" type="submit" block class="mt-2">    Sign in     </v-btn>
        <v-btn color="blue" variant="outlined" @click="signup()" block class="mt-2">   No account? Sign up    </v-btn>
        <v-btn color="blue" variant="outlined" @click="guest()" block class="mt-2">      Continue as a guest   </v-btn>
        <v-btn color="blue" variant="outlined" @click="forgot()" block class="mt-2">      Forgot password?   </v-btn>
        
      </v-form>
    </v-card-text>
  </v-card>
</v-dialog>
</template>


