<script setup lang="ts">
import { ref } from 'vue'
import {emailRules} from '../../utils/rules'
import { myFetch } from '../fetch'
import Swal from 'sweetalert2'

const passDialog = ref(false)
const passForm = ref();
const email = ref('');
const creds = ref();
const pwReqDone = ref(false);
const pwMessage = ref();
const emit = defineEmits(['donePass'])

// const fetching = ref (false);
// const myChildFetch = ref();
// const callFetch = () => {
//   myChildFetch.value.myFetch()
// }

async function submit() {
  const {valid} = await passForm.value?.validate()
  if (valid) {
    //passDialog.value = false;
    //fetching.value = true;
    creds.value = email.value;
    myFetch('ForgetPassword',creds.value,true)
    .then((response) => {
      
        Swal.fire({
                    title: 'Registration',
                    text: response,
                    icon: 'info',
                    confirmButtonText: 'OK'
                  }).then();
    
        emit('donePass');
          
    })
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

        <v-btn color="blue" type="submit" block class="mt-2">    Request new password    </v-btn>
        <!-- <fetch v-model="fetching"
          ref="myChildFetch"
          :url="'ForgetPassword'"
          :data = creds
          :wait-dlg="true"
          @fetched="fetched"
        ></fetch> -->
        <v-alert closable v-model= pwReqDone  type="info" :text="pwMessage"/>
        <v-btn color="blue" variant="outlined" @click="cancel()" block class="mt-2">   Cancel    </v-btn>
       
      </v-form>
    </v-card-text>
  </v-card>
</v-dialog>
</template>


