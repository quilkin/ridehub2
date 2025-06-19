
<script setup lang="ts">

/**
 * Create a new ride or edit an existing one
 */
import { ref, type Ref, onBeforeMount, onMounted, onBeforeUpdate} from 'vue'
import { destinationRules, distanceRules, meetingRules, ridersRules, speedRules, gpxRules, descriptionRules} from '../utils/rules'

import { myFetch } from '@/utils/fetch'
import { apiMethods } from '../../../ridehub-server/src/common/apimethods'
import { Ride } from '../../../ridehub-server/src/common/ride'
import { Route } from '../../../ridehub-server/src/common/route'
import { User  } from '../../../ridehub-server/src/common/user'
import { Alert, Message, YesNo, AlertError } from '../utils/alert'
import Routes  from '../utils/routes'
import TimesDates  from '../utils/timesdates'
import DateSelector  from './dateSelector.vue'
import ChooseRoute from './chooseRoute.vue'
import rideData from '@/utils/ridedata'
import { useDisplay } from 'vuetify'

//const { mobile } = useDisplay();

const userName = ref('');
const destination = ref('');
const leader = ref('');
//const gpxfiles= ref() as Ref<File[]>;
const distance = ref(0);
const rideDialog = ref(false);
const rideForm = ref();

const currentRoute = ref() as Ref<Route >;
const routeHasBeenChosen = ref(false);
const units = ref('k');

const meetingAt = ref ('Lemon Quay, Truro');
const description = ref ('');
const date = ref(new Date());
const startTime = ref(540);  // default start at 9 am
const maxRiders = ref(10);
const minSpeed = ref(0);
const maxSpeed = ref(0);
const speedStr = ref(' ');
const showDate = ref(0);

let newRide = true;     // false for editing an existing one
let newRouteForThisRide = false;
let changedRouteForThisRide = false;
let thisRide : Ride;
const hour=ref('');
const minute=ref('');
const members= ref() as Ref<string[]>;
/* possible outcomes of this edit */
const emit = defineEmits(['doneRideEdit','showRoute','logIn','newRouteList','chooseRouteFromList','showUploadedRoute']);

const props = defineProps<{
  ride : Ride
  user : User
  newRoute : Route
  routeFromList : Route
  ridedates : number[]
}>()

onBeforeMount(async() => {
  currentRoute.value = new Route();
  if (props.ride.rideID> 0) {
    // editing existing ride
    currentRoute.value.id = props.ride.routeID;
    newRide = false;
    newRouteForThisRide = false;
    changedRouteForThisRide = false;
  }
  routeHasBeenChosen.value = false;
  thisRide = props.ride;
})

onBeforeUpdate(async() => {
  routeHasBeenChosen.value = false;
  update();
})

/**
 * update the page with new values
 */
function update() {
    if (props.user === undefined || props.ride === undefined)
    {
        AlertError('Internal error','invalid user or ride data');
        return;
    } 

    thisRide = props.ride;
    date.value = TimesDates.fromIntDays(thisRide.date);
    if (thisRide.rideID > 0) {
      // editing ride
      let gpx = currentRoute.value.route;
      currentRoute.value  = Routes.findRoute(thisRide.routeID);
      currentRoute.value.route = gpx;
      if (currentRoute.value.id > 0) {
        routeHasBeenChosen.value = true;
        destination.value = currentRoute.value.dest;
        distance.value = currentRoute.value.distance;

      }
      date.value.setHours(thisRide.time / 60);
      date.value.setMinutes(thisRide.time % 60);
      
    }
    else {   // new ride
      distance.value = currentRoute.value.distance;
      if (props.routeFromList.id > 0) {
        routeHasBeenChosen.value = true;
        currentRoute.value = props.routeFromList;
        destination.value = currentRoute.value.dest;
        showRoute(currentRoute.value, true);
      }
      else if (props.newRoute.hasGPX) {
        routeHasBeenChosen.value = true;
        currentRoute.value = props.newRoute;
        destination.value = currentRoute.value.dest;
      }
      else {  //  ride has not been furnished with a route
        currentRoute.value.id = 0;

      }

      // default to have ride on a Sunday at 9am
      const day = date.value.getDay();
      const daysToAdd = 7-day;
      date.value.setDate(date.value.getDate() + daysToAdd);
      date.value.setHours(9);
    }
    ++showDate.value;
    units.value = props.user.units;
    userName.value = props.user.name;
    description.value = thisRide.description;
    startTime.value = thisRide.time;
    maxRiders.value = thisRide.groupSize;
    minSpeed.value = thisRide.minSpeed;
    maxSpeed.value = thisRide.maxSpeed;
    if (thisRide.leaderName == '') 
        thisRide.leaderName = props.user.name;
    leader.value = thisRide.leaderName;
    if (props.user.units=='m') {
      // stored as km, not miles, so adjust
      distance.value = Math.round(distance.value/1.6);
    }
    speedStr.value = rideData.speedsToString(minSpeed.value,maxSpeed.value,props.user.units);
    meetingAt.value = thisRide.meetingAt;

      // starttime is stored as total number of minutes
    hour.value = Math.floor((startTime.value / 60)).toString();
    if (hour.value.length == 1) hour.value = '0' + hour.value;
    minute.value = (startTime.value % 60).toString();
    if (minute.value.length == 1) minute.value = '0' + minute.value;

    if (props.user.role > 1)
    // admins can edit others' rides, so need a list of all signups to choose from
       getMembers();
   
}
function cancel() {
    rideDialog.value = false;
    emit('doneRideEdit');
}

/**
 * Get a list of all users, so one can be chosen by admins
 */
async function getMembers() {
  const logins : User[] = await myFetch(apiMethods.getLogins,0);
  if (logins != null) {
    members.value = [];
    logins.forEach((login) => {
      const member = login.name;
      members.value.push(member);
    });
  }
  return members.value;
}

async function deleteRide()
{
  await YesNo('Delete this ride, are you sure?', async ()=> {
    await Alert('Deleting ride','Please inform any riders that have signed up','using the WhatsApp RideInfo group','info','OK');
    const res = await myFetch(apiMethods.deleteRide,thisRide);
    if (res != null) {
      if (res == 'OK') {
        await Alert('You have deleted this ride','Notifications will be sent to any signed-up riders','','info','OK');
      }
      else {
        await AlertError(res,'Ride may not be deleted');
      }
    }
    emit('doneRideEdit');

  })
}

/**
 * Submit the new data for validation
 */
async function submit() {
  if (rideForm.value == null) 
    return;
  const {valid} = await rideForm.value.validate()
  if (!valid ) {
    await Alert('Missing info','Please complete highlighted items','','info','OK');
    return;
  }

  await YesNo('Save this ride, are you sure?', async ()=> {

    let routeID  = thisRide.routeID;
    const speeds : number[] = rideData.stringToSpeeds(speedStr.value);
    if (speeds.length==2) {
      thisRide.minSpeed =  speeds[0];
      thisRide.maxSpeed =  speeds[1];
    }
    else if (distance.value > 0) {
      await AlertError('Speed','Invalid average speed');
      return;
    }
    if (distance.value > 0 && props.user.units=='m' && props.user.role < 2) {
       // store as km, not miles, so adjust
      // but if admin is adjusting someone else's ride, leave this alone
      thisRide.minSpeed = Math.round(thisRide.minSpeed*1.6);
      thisRide.maxSpeed = Math.round(thisRide.maxSpeed*1.6);
      distance.value = Math.round(distance.value*1.6);
    }
    if (thisRide.routeID == 0 || newRouteForThisRide) {
      //  need to save the route first
      let newRoute : Route = currentRoute.value;
      if (newRoute.id === 0 && newRoute.hasGPX===false) {
        // new ride without a route
        newRoute.dest = destination.value;
        newRoute.distance = distance.value;

      }
      else if (newRouteForThisRide) {
        newRoute.hasGPX = true;
      }
      newRoute.owner = props.user.name;
      const res = await myFetch(apiMethods.saveRoute,newRoute);
      if (res===null)
        return;   // todo:: this doesn't look right
      const id = parseInt(res);
      if (Number.isInteger(id)) {
   
        newRoute.id = id;
        routeID = id;
        Routes.addNewRoute (newRoute);
      }
      else {
        if (res.includes("XML parse error"))
              await AlertError("File Error","Please ensure that this is a GPX file");
        else
              await Message(res);
      }
    }
    else if (changedRouteForThisRide) {
      currentRoute.value = props.routeFromList; 

    }

    if (newRide == false && currentRoute.value.id != thisRide.routeID) {
      routeID = currentRoute.value.id;
      thisRide.emailRequired = true;
    }
    if (newRide == false && thisRide.date != TimesDates.toIntDays(date.value)) {
      thisRide.emailRequired = true;
    }
    if (newRide == false && thisRide.time != parseInt(hour.value)* 60 + parseInt(minute.value)) {
      thisRide.emailRequired = true;
    }
    if (thisRide.emailRequired) {
      await Alert('Ride details have changed','Notifications will be sent to any signed-up riders','','info','OK');
      // notifications will be handled by the server
    }
    thisRide.leaderName = props.user.name;
    thisRide.date = TimesDates.toIntDays(date.value);
    thisRide.time = parseInt(hour.value)* 60 + parseInt(minute.value);
    thisRide.description = description.value;
    thisRide.groupSize = maxRiders.value;
    thisRide.meetingAt = meetingAt.value;
    thisRide.routeID = routeID;
    thisRide.leaderName = leader.value;

     if (newRide) {
      const res = await myFetch(apiMethods.saveRide,thisRide);
      if (res === null) 
        return;   // ??? is this correct ???
      const id = parseInt(res);
      if (Number.isInteger(id)) {
        await Message('Ride has been saved');
      }
      else {
        await AlertError('Save Ride Error',res);
        return;
      }
    }
    else {
      const res = await myFetch(apiMethods.editRide,thisRide);
      if (res === null) 
        return;
      if (res=="OK") {
        await Message('Edited ride has been saved');
      }
      else {
        await AlertError('Save Ride Error',res);
        return;
      }
    }
    rideDialog.value = false;
    emit('doneRideEdit');
  })

}

/**
 * (emit a message to) display the ride's route on the map
 * @param route 
 * @param chosen ???? always true???
 */
function showRoute(route : Route, chosen: boolean) {
  // if (chosen)
  //   console.log(`chosen route: ${route.dest}`);
  // else
  //   console.log(`show route: ${route.dest}`);

  route.highlighted = true;
 
  emit('showRoute',route,chosen);
  destination.value = route.dest;
  distance.value = route.distance;
  currentRoute.value = route;

  if (thisRide)
    thisRide.routeID = route.id;

}

function newDate(newDate : Date) {
  date.value = newDate;
}

// function newRouteList(routes : Route[]) {
//   emit('newRouteList',routes);
// }
function routeChosen(route : Route) {
  if (route.id === 0)
    props.newRoute.hasGPX = false;
  routeHasBeenChosen.value = true;
  currentRoute.value = route;
  update();
}
function chooseRouteFromList() {
  changedRouteForThisRide = true;
  emit('chooseRouteFromList');
}
function showUploadedRoute(r : Route) {
  routeHasBeenChosen.value = true;
  currentRoute.value = r;
  newRouteForThisRide = true;
 
  emit('showUploadedRoute',r);
}
function speedLabel() {
  return props.user.units==='k'?'km/hr':'mph';
}
</script>

<template>
    
    <v-card class="pa-3" >
    
      <v-card-title class="headline black" primary-title>
        {{newRide? 'Plan to lead a ride or event':'Edit your ride or Event'}}
      </v-card-title>
      <ChooseRoute v-if="routeHasBeenChosen==false"
        :existing-route="currentRoute"
        @route-chosen="routeChosen"
        @show-route="showRoute"
        @choose-route-from-list="chooseRouteFromList"
        @show-uploaded-route="showUploadedRoute"
      
      >
      </ChooseRoute>
      <v-card-text class="pa-3">
        <v-form @submit.prevent="submit"  ref="rideForm">
      
          <div  v-if="routeHasBeenChosen" >
          <!-- <v-container  class="pa-0"> -->
            <v-row v-if="props.user.role>1" >
              <!-- only for admin users, to change ride leader -->
              <!-- todo: maybe add a special secret button to override this? -->
              <v-col cols="6"  >
                <v-autocomplete
                  v-model = "leader"
                  label="Leader"
                   :items="members"
                ></v-autocomplete>
              </v-col>
            </v-row>
            <v-row >
              <v-col cols="6"   >
                  <v-text-field density="compact" variant="outlined" :label="currentRoute.distance>0? 'Destination':'Event'" 
                    v-model="destination"
                    :rules="destinationRules"

                    hint='Where are you riding to? Coffee stop?'/>
              </v-col>
              <v-col cols="6"  v-if="currentRoute.distance>0" >
                  <v-text-field density="compact"   variant="outlined" label="Approx Distance" 
                   v-model="distance"
                   :suffix="props.user.units==='k'?'km':'miles'"
                   :rules="distanceRules"
                   :disabled="currentRoute.hasGPX" 
                   hint="A rough indication, need not be exact"/>
              </v-col>
            </v-row>
            <v-row >
              <v-col cols="12"  class="mt-n6" >
                  <v-textarea density="compact" variant="outlined" rows="1" label="Description"
                  v-model="description"
                  :rules="descriptionRules"   
                  hint="Help others to know if they would like to ride this route. e.g. mention 'Gravel' if it's off-road"/>
              </v-col>
            </v-row>
            <!-- <v-row  > <v-col class="mt-n8">   </v-col> </v-row> -->
            <v-row >
              <!-- <v-col cols ="3" class="mt-n6" >
              </v-col> -->
              <!-- <v-col cols ="3" class="mt-n6" >
                Ride date and time:
              </v-col> -->
              <v-col cols="6" class="mt-n6" >
                    <DateSelector :icon="false" 
                    :key="showDate"
                      :dates="ridedates"
                      :text="TimesDates.dateString(date)"
                      :date="date"
                      @new-date="newDate"   />
              </v-col>

              <v-col cols="3" class="mt-n6"  >
                  <v-select density="compact" variant="underlined" v-model="hour"
                      label="Hour"
                    :items="['06', '07', '08', '09', '10', '11','12', '13','14', '15','16','17', '18','19', '20']"
                  ></v-select>
            </v-col>
              <v-col cols="3" class="mt-n6" >
                  <v-select  density="compact" variant="underlined" v-model="minute"
                    label="Minute"
                    :items="['00', '15', '30', '45']"
                  ></v-select>
              </v-col>

            </v-row>
        
            <v-row   no-gutters>
              <v-col cols="6"  class="mt-6" v-if="currentRoute.distance>0">
                  <v-text-field variant="outlined" density="compact" v-model="meetingAt"  :rules="meetingRules"
                      label="Starting At"
                      hint="Please be precise if ride is not starting at the usual place" />
              </v-col>
              <v-col cols="6"  class="mt-6" v-else>
                  <v-text-field variant="outlined" density="compact" v-model="meetingAt"  :rules="meetingRules"
                      label='Location'
                      hint="Where this event is being held (or started)" />
              </v-col>
              <v-col v-if="currentRoute.distance>0" cols="3"  class="mt-6" >
                  <v-text-field variant="outlined" density="compact" v-model="maxRiders"  :rules="ridersRules"  label="Max riders" 
                   hint="Limit rider numbers if you don't want a big group" />
              </v-col>
              <v-col v-if="currentRoute.distance>0" cols="3"  class="mt-6" >
                  <v-text-field variant="outlined" density="compact" v-model="speedStr"  :rules="speedRules"  :label="speedLabel()" 
                  hint="Suggested speed. You can enter a range, e.g. 18-20"  />
              </v-col>

            </v-row>
          <!-- </v-container> -->
          </div>
  
          <v-row >
            <v-col  v-if="!newRide">
              <v-btn v-if = "currentRoute.distance>0" block color="blue"    @click="deleteRide()">Delete Ride</v-btn>
              <v-btn v-else block color="blue"    @click="deleteRide()">Delete Event</v-btn>
            </v-col>
            <v-col>
              <v-btn block color="blue"  variant="outlined" @click="cancel()" >Cancel Edit</v-btn>
            </v-col>
            <v-col  v-if="routeHasBeenChosen">
              <v-btn block color="blue" type="submit"  >{{newRide? (currentRoute.distance===0? 'Save Event':'Save ride'):'Save edits'}}</v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
  
    </v-card>
  <!-- </div> -->
  
  </template>
<style>
  .scrollable {
   overflow-y: scroll;
   }
   .v-btn__content {
    white-space: normal;
    flex: auto;
  }

</style>

