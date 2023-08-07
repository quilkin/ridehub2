<script setup lang="ts">
import { ref } from 'vue'

const passDialog = ref(false)
const passForm = ref(null);
const email = ref('');

const emit = defineEmits(['donePass'])

const emailRules = [
  (value: string) => !!value || 'Required.',
  (value: string) => {
    if (/.+@.+\..+/.test(value)) return true
    return 'E-mail must be a valid address.'
  },
];


async function submit() {
  const {valid} = await passForm.value?.validate()
  if (valid) {
    passDialog.value = false;
    alert('todo: send password email')
    emit('donePass');
  }
}
function cancel() {
    passDialog.value = false;
    emit('donePass');
}
</script>

<template>
  <v-dialog v-model="passDialog" activator="parent" width="300">
  <v-card>
    <v-card-title class="headline black" primary-title>
      Forgotten login details?
    </v-card-title>
    <v-card-text class="pa-5">
      <v-form @submit.prevent="submit" ref="passForm">
        <v-text-field v-model="email"  :rules="emailRules"  label="Your email address">
        </v-text-field>

        <v-btn color="blue" type="submit" block class="mt-2">    Sign in     </v-btn>
        <v-btn color="blue" variant="outlined" @click="cancel()" block class="mt-2">   Cancel    </v-btn>
       
      </v-form>
    </v-card-text>
  </v-card>
</v-dialog>
</template>


