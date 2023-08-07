<script setup lang="ts">
import { ref } from 'vue'

const signupDialog = ref(false)

const userName = ref('');
const email = ref('');
const password1 = ref('');
const password2 = ref('');
const showPass = ref(false);
const signupForm = ref(null);

const emit = defineEmits(['doneSignUp'])

const nameRules = [
  (value: string) => !!value || 'Required.',
  (value: string) => {
    if (value.length >= 3 && value.length <= 10) return true
    return 'Username must be 3 to 10 characters.'
  },
];

const emailRules = [
  (value: string) => !!value || 'Required.',
  (value: string) => {
    if (/.+@.+\..+/.test(value)) return true
    return 'E-mail must be a valid address.'
  },
];
const pwRules = [
  (value: string) => !!value || 'Required.',
  (value: string) => {
    if (value?.length >= 6) return true
    return 'password must be at least 6 characters.'
  },
];
const pwConfirmRules = [
  (value: string) => !!value || 'Required.',
  (value: string) => {
    if (value?.length >= 6) return true
    return 'password must be at least 6 characters.'
  },
  (value: string) => {
    if (password1.value === value) return true;
    return 'passwords do not match.'
  },
];

async function submit() {
  const {valid} = await signupForm.value?.validate()
  if (valid) {
    signupDialog.value = false;
    emit('doneSignUp');
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
        <v-text-field v-model="email"     :rules="emailRules" label="Email"></v-text-field>
        <v-text-field v-model="password1" :append-inner-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="showPass = !showPass"   :type="showPass ? 'text' : 'password'" 
          :rules="pwRules"  label="Password">
        </v-text-field>
        <v-text-field v-model="password2" :append-inner-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="() => (showPass = !showPass)" :type="showPass ? 'text' : 'password'"
          :rules="pwConfirmRules" label="Confirm password">
        </v-text-field>
        <v-btn color="blue" type="submit"  @click="submit()" block class="mt-2">     Submit      </v-btn>
        <v-btn color="blue" variant="outlined" @click="cancel()" block class="mt-2">   Cancel    </v-btn>
      </v-form>
    </v-card-text>
    <!-- <v-card-actions class="pa-5">
        <v-btn block class="mt-2"  type="submit" @click="submit()" color="blue">Submit</v-btn>
    </v-card-actions> -->
  </v-card>
</v-dialog>
</template>


