<script setup lang="ts">
import { ref } from 'vue'

const loginDialog = ref(false)

const userOrEmail = ref('');
const password = ref('');
const showPass = ref(false);
const loginForm = ref(null);
var valid = false;

const nameRules =   [  (value: string) => !!value || 'Required.', ];
const pwRules =     [  (value: string) => !!value || 'Required.', ];

async function submit() {
  const isValid = await loginForm.value.validate()
  if (isValid) {
        alert("submitted");
        loginDialog.value = false;
    }
}
// function register() {
//   alert("register");
//   loginDialog.value = false;
// }
// function guest() {
//   alert("guest");
//   loginDialog.value = false;
// }
// function forgot() {
//   alert("forgot");
//   loginDialog.value = false;
// }
</script>

<template>
  <v-dialog v-model="loginDialog" activator="parent" width="300">
  <v-card>
    <v-card-title class="headline black" primary-title>
      Sign in to TCC RideHub
    </v-card-title>
    <v-card-text class="pa-5">
      <v-form @submit.prevent="submit" ref="loginForm"  >
        <v-text-field v-model="userOrEmail"  :rules="nameRules"  label="User name or email" hint="Username will be 3 to 10 characters">
        </v-text-field>
        <v-text-field v-model="password" :append-inner-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="showPass = !showPass"   :type="showPass ? 'text' : 'password'" 
          hint="password will be at least 6 characters"
          :rules="pwRules"  label="Password">
        </v-text-field>
        <v-btn color="blue" type="submit" block class="mt-2">    Sign in     </v-btn>
        <!-- <v-btn color="blue" variant="outlined" @click="register()" block class="mt-2">   No account? Sign up    </v-btn>
        <v-btn color="blue" variant="outlined" @click="guest()" block class="mt-2">      Continue as a guest   </v-btn>
        <v-btn color="blue" variant="outlined" @click="forgot()" block class="mt-2">      Forgot password?   </v-btn> -->
        
      </v-form>
    </v-card-text>
  </v-card>
</v-dialog>
</template>


