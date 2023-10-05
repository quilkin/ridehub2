
<script setup lang="ts">

import { ref, type Ref, onBeforeMount} from 'vue'
import {destinationRules, distanceRules, meetingRules, ridersRules, speedRules} from '../utils/rules'
import { myFetch } from '../utils/fetch'
import  { Alert} from '../utils/alert'
import { User } from '../utils/user'
import { Ride } from '../utils/ride'
import { Route } from '../utils/route'
import Routes  from '../utils/routes'
import RouteList from './routeList.vue'
import  TimesDates  from '../utils/timesdates'
import  baseDatePicker  from './baseDatePicker.vue'


const thisRide = ref(new Ride);
const userName = ref('');
const destination = ref('');
const distance = ref(0);
const rideDialog = ref(false);
const rideForm = ref();
const routeType = ref();
const units = ref('k');

const meetingAt = ref ('Lemon Quay');
const description = ref ('');
const date = ref(new Date());
const startTime = ref(540);  // default start at 9 am
const maxRiders = ref(10);
const aveSpeed = ref(20);
let hour='';
let minute='';

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
    description.value = props.ride.description;
    startTime.value = props.ride.time;
    date.value = TimesDates.fromIntDays(props.ride.date);
    maxRiders.value = props.ride.groupSize;
    aveSpeed.value = props.ride.speed;
    meetingAt.value = props.ride.meetingAt;

    const route  = Routes.findRoute(thisRide.value.routeID);
    if (route != null)
    {
        destination.value = route.dest;
    }
    // starttime is stored as total number of minutes
    hour = (startTime.value / 60).toString();
    if (hour.length == 1) hour = '0' + hour;
    minute = (startTime.value % 15).toString();
    if (minute.length == 1) minute = '0' + minute;
   
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
    return 'Approx Distance (' + (props.user.units==='k'?'km':'miles') + ')';
}
function SpeedStr() {
    return 'Ave. speed (' + (props.user.units==='k'?'km/hr':'mph') + ')';
}
function showRoute(route : Route) {
  emit('showRoute',route,false);
}

function cancel() {
    rideDialog.value = false;
    emit('doneRideEdit');
}
function routeChosen(route : Route) {
  console.log("Chosen route: " + route.dest);
  destination.value = route.dest;
  distance.value = route.distance;
}
function newDate(newDate : Date) {
  date.value = newDate;
//  ++dateChanged.value;
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
                <v-radio label="Upload a new GPX route that you have created or found elsewhere" value="newGpx"></v-radio>
                <v-radio label="Enter a simple ride to somewhere, with an undefined route" value="noGpx"></v-radio>
              </v-radio-group>
              <RouteList :user="props.user" @show-route="showRoute" @route-chosen="routeChosen"></RouteList>
              
          </v-row>
          <v-row >
            <v-col>
                <v-text-field v-model="destination"  :rules="destinationRules"  label="Destination" :enabled="routeType==='noGpx'" 
                    hint="Where are you riding to? Coffee stop?"/>
            </v-col>
            <v-col>
                <v-text-field v-model="distance"  :rules="distanceRules"  :label="DistanceStr()"  :enabled="routeType==='noGpx'" />
            </v-col>
          </v-row>

          <v-row >
            <v-col cols="6">
                  <baseDatePicker :large="true" :text="TimesDates.dateString(date)" :date="date"    @new-date="newDate"   />
            </v-col>

            <v-col cols="3">
                <v-combobox v-model="hour"
                  label="Time: Hour"
                  :items="['6', '7', '8', '9', '10', '11','12', '13','14', '15','16','17', '18']"
                ></v-combobox>
            </v-col>
            <v-col cols="3">
                <v-combobox  v-model="minute"
                  label="Minute"
                  :items="['00', '15', '30', '45']"
                ></v-combobox>
            </v-col>

          </v-row>
          <v-row >
            <v-col cols="6">
                <v-text-field v-model="meetingAt"  :rules="meetingRules"  label="Starting At"  />
            </v-col>
            <v-col cols="3">
                <v-text-field v-model="maxRiders"  :rules="ridersRules"  label="Maximum riders"  hint="Limit rider numbers if you don't want a big group" />
            </v-col>
            <v-col cols="3">
                <v-text-field v-model="aveSpeed"  :rules="speedRules"  :label="SpeedStr()" hint="Suggested average speed. Actual speed will depend on riders present"  />
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
<style scoped>
.v-row {
  padding-top: 0;
  padding-bottom: 0;
}
.v-radio{
  padding-top: 0;
  padding-bottom: 0;
}
</style>

