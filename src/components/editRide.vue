
<script setup lang="ts">

import { ref, type Ref, onBeforeMount} from 'vue'
import {destinationRules, distanceRules} from '../utils/rules'
import { myFetch } from '../utils/fetch'
import  { Alert} from '../utils/alert'
import { User } from '../utils/user'
import { Ride } from '../utils/ride'
import { Route } from '../utils/route'
import Routes  from '../utils/routes'
import RouteList from './routeList.vue'


const thisRide = ref(new Ride);
const userName = ref('');
const destination = ref('');
const distance = ref(0);
const rideDialog = ref(false);
const rideForm = ref();
const routeType = ref();
const units = ref('k');
const emit = defineEmits(['doneRideEdit','showRoute'])

const props = defineProps<{
  ride : Ride
  user : User
}>()


onBeforeMount(() => {
    if (props.user === undefined || props.ride === undefined)
    {
        Alert('Internal error','invalid user or ride data','','error','OK');
        return;
    } 
    thisRide.value = props.ride;
    units.value = props.user.units;
    userName.value = props.user.name;
    const route  = Routes.findRoute(thisRide.value.routeID);
    if (route != null)
    {
        destination.value = route.dest;
    }
    

  })

async function submit() {
  if (rideForm.value != null) {
  const {valid} = await rideForm.value.validate()

  if (valid) {
    let creds  = { 
    //   id: props.user?.id,
    //   // only send user and email if they have been changed
    //   name: props.user?.name === userName.value? '':userName.value,
    //   email: props.user?.email === email.value? '' : email.value,
    //   pw: password1.value,
    //   units: units.value,
    //   climbs: climbing.value === 'y'? 1:0,
    //   notifications: notify.value === 'y'? 1:0
    };
    myFetch('ChangeAccount',creds,true)
    .then((response) => {
      if (response != null) {
        if (response == 'OK') {
          Alert('Registration', "Your details have been saved",'','info','OK');
          emit('doneRideEdit');
        }
        else {
          Alert('Registration',response,'','error','OK');
        }
      }
      else {
        Alert( 'Update unsuccessful','Could not contact server','','error','OK');
      }
    })
  }
}
}
function routeTypeChanged()
{
    console.log('route type: ' + routeType.value);
}
function DistanceStr() {
    return 'Distance (' + (props.user.units==='k'?'km':'miles') + ')';
}

function showRoute(route : Route) {
  emit('showRoute',route,false);
}

function cancel() {
    rideDialog.value = false;
    emit('doneRideEdit');
}
</script>

<template>
    
  <div class="d-flex align-center flex-column">
   <v-card  width="600">
      <v-card-title class="headline black" primary-title>
        Plan to lead a ride
      </v-card-title>
      <v-card-text class="pa-3">
        <v-form @submit.prevent="submit" ref="rideForm">
          <v-row >
              A ride needs a route of some sort. So, please choose one of the following:
              <v-radio-group inline v-model="routeType" @update:model-value="routeTypeChanged">
                <v-radio id="route-menu-activator" label="Use an existing route from the RideHub list (there's over 100 of them!)" value="oldGpx"></v-radio>
                <v-radio label="Upload a GPX route that you have created or found elsewhere" value="newGpx"></v-radio>
                <v-radio label="Enter a simple ride to somewhere, with an undefined route" value="noGpx"></v-radio>
              </v-radio-group>
              <RouteList activator="#route-menu-activator" :user="props.user" @show-route="showRoute"></RouteList>
              
          </v-row>
          <v-row >
            <v-col>
                <v-text-field v-model="destination"  :rules="destinationRules"  label="Destination" :enabled="routeType==='noGpx'" />
            </v-col>
            <v-col>
                <v-text-field v-model="distance"  :rules="distanceRules"  :label="DistanceStr()"  :enabled="routeType==='noGpx'" />
            </v-col>
          </v-row>
          
  
          <v-row >
            <v-col>
              <v-btn color="blue"  variant="outlined" @click="cancel()" class="mt-3">Cancel</v-btn>
            </v-col>
            <v-col>
              <v-btn color="blue" type="submit"  class="mt-3">Save ride</v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </div>

  </template>

