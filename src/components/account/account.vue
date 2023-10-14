
<script setup lang="ts">

import { ref, onBeforeMount, onUpdated } from 'vue'
import {nameRules, emailRules} from '../../utils/rules'
import { apiMethods, myFetch } from '../../utils/fetch'
import { Alert, AlertError } from '../../utils/alert'
import { User } from '../../utils/user'

const userName = ref('');
const email = ref('');
const password1 = ref('');
const password2 = ref('');
const showPass = ref(false);
const accountDialog = ref(false)
const accountForm = ref();
const units = ref('k')
const climbing = ref('y')
const notify = ref('y')
const emit = defineEmits(['doneAccount'])
const props = defineProps<{
  user : User
}>()

onBeforeMount(() => {
        if (props.user != undefined) {
            units.value = props.user.units;
            climbing.value = props.user.climbs? 'y':'n';
            notify.value = props.user.notifications? 'y':'n';
            userName.value = props.user.name;
            email.value = props.user.email;
            password1.value = '';
            password2.value = '';

        }

  })

async function submit() {
  if (accountForm.value != null) {
  const {valid} = await accountForm.value.validate()

  if (valid) {
    let creds  = { 
      id: props.user?.id,
      // only send user and email if they have been changed
      name: props.user?.name === userName.value? '':userName.value,
      email: props.user?.email === email.value? '' : email.value,
      pw: password1.value,
      units: units.value,
      climbs: climbing.value === 'y'? 1:0,
      notifications: notify.value === 'y'? 1:0
    };
    myFetch(apiMethods.changeAccount,creds,true)
    .then((response) => {
      if (response != null) {
        if (response == 'OK') {
          Alert('Registration', "Your details have been saved",'','info','OK');
          emit('doneAccount');
        }
        else {
          AlertError('Registration',response);
        }
      }
      else {
        AlertError( 'Update unsuccessful','Could not contact server');
      }
    })
  }
}
}
function cancel() {
    accountDialog.value = false;
    emit('doneAccount');
}
</script>

<template>
    
  <div class="d-flex align-center flex-column">
   <v-card  width="600">
      <v-card-title class="headline black" primary-title>
        Your RideHub account
      </v-card-title>
      <v-card-text class="pa-3">
        <v-form @submit.prevent="submit" ref="accountForm">
          <v-row >
            <v-col   >
              <v-text-field v-model="userName"  :rules="nameRules"  label="Username"
               :placeholder=userName >
              </v-text-field>
            </v-col>
            <v-col   >
              <v-text-field v-model="email"     :rules="emailRules" label="Email"
               :placeholder=email >
              </v-text-field>
            </v-col>
          </v-row>
          <v-row >
            <v-col   >
              <v-text-field v-model="password1" :append-inner-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPass = !showPass"   :type="showPass ? 'text' : 'password'" 
                label="Password" placeholder="******"  
                hint="Leave blank if you don't want to change" persistent-hint>
              </v-text-field>
            </v-col>
            <v-col    >
              <v-text-field v-model="password2" :append-inner-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="() => (showPass = !showPass)" :type="showPass ? 'text' : 'password'"
                label="Confirm password" placeholder="******"
                 hint="Leave blank if you don't want to change" persistent-hint>
              </v-text-field>
            </v-col>
          </v-row>
          
          <v-row >
            <!-- <v-col align="right">
              Preferred distance units

            </v-col> -->
            <v-col>
              Preferred distance units
              <v-radio-group inline v-model="units">
                <v-radio label=" km " value="k"></v-radio>
                <v-radio label="miles" value="m"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
          <v-row >
            <!-- <v-col align="right">
              Show amount of climbing in listings
              <v-chip variant="outlined">Show amount of climbing in listings</v-chip> 
            </v-col> -->
            <v-col>
              Show amount of climbing in listings
              <v-radio-group inline v-model="climbing">
                <v-radio label="Yes" value="y"></v-radio>
                <v-radio label="No" value="n"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
          <v-row >
            <!-- <v-col align="right">
              Notify me when a new ride is posted
            </v-col> -->
            <v-col>
              Notify me when a new ride is posted
              <v-radio-group inline v-model="notify">
                <v-radio label="Yes" value="y"></v-radio>
                <v-radio label="No" value="n"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
  
          <v-row >
            <v-col>
              <v-btn color="blue"  variant="outlined" @click="cancel()" class="mt-2">    Cancel       </v-btn>
            </v-col>
            <v-col>
              <v-btn color="blue" type="submit"  class="mt-2">   Update your account   </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </div>

  </template>
