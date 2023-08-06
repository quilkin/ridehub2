
<script setup lang="ts">

import { ref } from 'vue'

//const signupDialog = ref(false)

const userName = ref('');
const email = ref('');
const password1 = ref('');
const password2 = ref('');
const showPass = ref(false);
const accountForm = ref(null);

const distance = ref('k')
const climbing = ref('y')
const notify = ref('y')

const nameRules = [
    (value: string) => {
    if (value.length == 0) return true;  // hasn't been changed
    if (value.length >= 3 && value.length <= 10) return true
    return 'If changed, Username must be 3 to 10 characters.'
  },
];

const emailRules = [
    (value: string) => {
    if (value.length == 0) return true;  // hasn't been changed
    if (/.+@.+\..+/.test(value)) return true
    return 'If changed, E-mail must be a valid address.'
  },
];
const pwRules = [
    (value: string) => {
      if (value.length == 0) return true;  // hasn't been changed
    if (value?.length >= 6) return true
    return 'If changed, password must be at least 6 characters.'
  },
];
const pwConfirmRules = [
   (value: string) => {
    if (value.length == 0) return true;  // hasn't been changed
    if (value?.length >= 6) return true
    return 'If changed, password must be at least 6 characters.'
  },
  (value: string) => {
    if (password1.value === value) return true;
    return 'passwords do not match.'
  },
];
async function submit() {
  const {valid} = await accountForm.value?.validate()
  if (valid) {
    alert("todo: send to server")
  }
}
</script>

<template>
    
    <v-container fluid>
      <v-card-title class="headline black" primary-title>
        Your RideHub account
      </v-card-title>
      <v-card-text class="pa-3">
        <v-form @submit.prevent="submit" >
          <v-row >
            <v-col   >
              <v-text-field v-model="userName"  :rules="nameRules"  label="Username"
               placeholder="my name" hint="Leave blank if you don't want to change" persistent-hint>
              </v-text-field>
            </v-col>
            <v-col   >
              <v-text-field v-model="email"     :rules="emailRules" label="Email"
               placeholder="my@email.com" hint="Leave blank if you don't want to change" persistent-hint>
              </v-text-field>
            </v-col>
          </v-row>
          <v-row >
            <v-col   >
              <v-text-field v-model="password1" :append-inner-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPass = !showPass"   :type="showPass ? 'text' : 'password'" 
                :rules="pwRules"  label="Password" placeholder="******"  
                hint="Leave blank if you don't want to change" persistent-hint>
              </v-text-field>
            </v-col>
            <v-col    >
              <v-text-field v-model="password2" :append-inner-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="() => (showPass = !showPass)" :type="showPass ? 'text' : 'password'"
                :rules="pwConfirmRules" label="Confirm password" placeholder="******"
                 hint="Leave blank if you don't want to change" persistent-hint>
              </v-text-field>
            </v-col>
          </v-row>
          
          <v-row >
            <v-col>
              <v-chip variant="outlined">Preferred distance units</v-chip>
            </v-col>
            <v-col>
              <v-radio-group inline v-model="distance">
                <v-radio label=" km " value="k"></v-radio>
                <v-radio label="miles" value="m"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
          <v-row >
            <v-col>
              <v-chip variant="outlined">Show amount of climbing in listings</v-chip>
            </v-col>
            <v-col>
              <v-radio-group inline v-model="climbing">
                <v-radio label="Yes" value="y"></v-radio>
                <v-radio label="No" value="n"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
          <v-row >
            <v-col>
              <v-chip variant="outlined">Notify me when a new ride is posted</v-chip>
            </v-col>
            <v-col>
              <v-radio-group inline v-model="notify">
                <v-radio label="Yes" value="y"></v-radio>
                <v-radio label="No" value="n"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
  
          <v-row >
            <v-col>
              <v-btn color="blue"  variant="outlined"  class="mt-2">    Cancel       </v-btn>
            </v-col>
            <v-col>
              <v-btn color="blue" type="submit"  class="mt-2">   Update your account   </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-container>

  </template>
  <style scoped>
 
  </style>