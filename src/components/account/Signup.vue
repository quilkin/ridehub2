<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'

import {nameRules,pwRules,emailRules} from '../../utils/rules'
import { myFetch, apiMethods } from '../../utils/./fetch'
import { Alert } from '../../utils/alert'
import { mdiEye } from '@mdi/js'
import { mdiEyeOff } from '@mdi/js'

const signupDialog = ref(false)

const userName = ref('');
const eMail = ref('');
const password1 = ref('');
const password2 = ref('');
const creds = ref();
const showPass = ref(false);
const signupForm = ref();

const emit = defineEmits(['doneSignUp'])

// onBeforeMount(() => {
//   console.log('signup starting');
//   })
const pwConfirmRules  = [

  (value: string) => {
    if (password1.value === value) return true;
    return 'passwords do not match.'
  },
];

async function submit() {
  const {valid} = await signupForm.value?.validate()
  if (valid) {
    const username = userName.value;
    const pass = password1.value;
    const email = eMail.value;

    creds.value = { name: username, pw: pass, email: email, code: 0 };
    
    myFetch(apiMethods.signup,creds.value,true)
      .then((response) => {
        Alert('Registration',response,'','info','OK');
        signupDialog.value = false;
        emit('doneSignUp');
      })
  }
}
function cancel() {
    signupDialog.value = false;
    emit('doneSignUp');
}
</script>

<template>
  <v-dialog v-model="signupDialog" activator="parent" width="300">
  <v-card>
    <v-card-title class="headline black" primary-title>
      Sign Up to RideHub
    </v-card-title>
    <v-card-text class="pa-5">
      <v-form @submit.prevent ref="signupForm">
        <v-text-field v-model="userName"  :rules="nameRules"  label="User name"></v-text-field>
        <v-text-field v-model="eMail"     :rules="emailRules" label="Email"></v-text-field>
        <v-text-field v-model="password1" :append-inner-icon="showPass ? mdiEye : mdiEyeOff"
          @click:append-inner="showPass = !showPass"   :type="showPass ? 'text' : 'password'" 
          :rules="pwRules"  label="Password">
        </v-text-field>
        <v-text-field v-model="password2" :append-inner-icon="showPass ? mdiEye : mdiEyeOff"
          @click:append-inner="() => (showPass = !showPass)" :type="showPass ? 'text' : 'password'"
          :rules="pwConfirmRules" label="Confirm password">
        </v-text-field>
        <v-btn color="blue" type="submit"  @click="submit()" block class="mt-2">     Submit      </v-btn>
        <v-btn color="blue" variant="outlined" @click="cancel()" block class="mt-2">   Cancel    </v-btn>
      </v-form>
    </v-card-text>

  </v-card>
</v-dialog>
</template>


../../utils/alert