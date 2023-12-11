
<script setup lang="ts">

import { ref, type Ref, onBeforeMount, onMounted, onBeforeUpdate} from 'vue'
import { destinationRules, distanceRules, meetingRules, ridersRules, speedRules, gpxRules, descriptionRules} from '../utils/rules'

import { myFetch } from '@/utils/fetch'
import { apiMethods } from '../../../ridehub-server/src/common/apimethods'
import { Ride } from '../../../ridehub-server/src/common/ride'
import { Route } from '../../../ridehub-server/src/common/route'
import { User  } from '../../../ridehub-server/src/common/user'
import { Alert, Message, YesNo, AlertError } from '../utils/alert'
import Routes  from '../utils/routes'
import RouteList from './routeList.vue'
import TimesDates  from '../utils/timesdates'
import DateSelector  from './dateSelector.vue'
import ChooseRoute from './chooseRoute.vue'
import { watch } from 'vue'
import rideData from '@/utils/ridedata'
import { mdiRoutes} from '@mdi/js'
import { mdiCalendarMonth } from '@mdi/js'

const userName = ref('');
const destination = ref('');
const leader = ref('');
const gpxfiles= ref() as Ref<File[]>;
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
const minSpeed = ref();
const maxSpeed = ref();
const speedStr = ref('');

let newRide = true;
//let newRoute : Route ;
let thisRide : Ride;
let hour='';
let minute='';
const members= ref() as Ref<string[]>;
const emit = defineEmits(['doneRideEdit','showRoute','logIn','newRouteList','chooseRouteFromList','showUploadedRoute']);

const props = defineProps<{
  ride : Ride
  user : User
  newRoute : Route
  routeFromList : Route
  ridedates : number[]
}>()

onBeforeMount(async() => {
  console.log('edit - before mount');
  currentRoute.value = new Route();
  if (props.ride.rideID> 0) {
    // editing existing ride
    currentRoute.value.id = props.ride.routeID;
    newRide = false;
  }
  routeHasBeenChosen.value = false;
  thisRide = props.ride;
})

onBeforeUpdate(async() => {
  console.log('edit - before update');
  routeHasBeenChosen.value = false;
  update();
})

function update() {
    if (props.user === undefined || props.ride === undefined)
    {
        AlertError('Internal error','invalid user or ride data');
        return;
    } 
    currentRoute.value = new Route();

    thisRide = props.ride;
    date.value = TimesDates.fromIntDays(thisRide.date);
    if (thisRide.rideID > 0) {
      // editing ride
      currentRoute.value  = Routes.findRoute(thisRide.routeID);
      if (currentRoute.value.id > 0) {
        destination.value = currentRoute.value.dest;
        distance.value = currentRoute.value.distance;

      }
      date.value.setHours(thisRide.time / 60);
      date.value.setMinutes(thisRide.time % 60);
      
    }
    else {
      if (props.routeFromList.id > 0) {
        routeHasBeenChosen.value = true;
        currentRoute.value = props.routeFromList;
        destination.value = currentRoute.value.dest;
        distance.value = currentRoute.value.distance;
        showRoute(currentRoute.value, true);
      }
      else if (props.newRoute.hasGPX) {
        routeHasBeenChosen.value = true;
        currentRoute.value = props.newRoute;
        destination.value = currentRoute.value.dest;
        distance.value = currentRoute.value.distance;
      }
      else {
        currentRoute.value.id = 0;
      }
   //   newRide = true;
        // default to have ride on a Sunday at 9am
      const day = date.value.getDay();
      const daysToAdd = 7-day;
      date.value.setDate(date.value.getDate() + daysToAdd);
      date.value.setHours(9);
    }
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
     // if (minSpeed.value != undefined) minSpeed.value = Math.round(minSpeed.value/1.6);
     // if (maxSpeed.value != undefined) maxSpeed.value = Math.round(maxSpeed.value/1.6);
      distance.value = Math.round(distance.value/1.6);
    }
    speedStr.value = rideData.speedsToString(minSpeed.value,maxSpeed.value,props.user.units);
    meetingAt.value = thisRide.meetingAt;

      // starttime is stored as total number of minutes
    hour = (startTime.value / 60).toString();
    if (hour.length == 1) hour = '0' + hour;
    minute = (startTime.value % 15).toString();
    if (minute.length == 1) minute = '0' + minute;

    if (props.user.role > 1)
       getMembers();
   
}
function cancel() {
    rideDialog.value = false;
    emit('doneRideEdit');
}
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
    const res = await myFetch(apiMethods.deleteRide,thisRide.rideID);
    if (res != null) {
      if (res == 'OK') {
        await Message('You have deleted this ride');
      }
      else {
        await AlertError(res,'Ride may not be deleted');
      }
    }
    emit('doneRideEdit');

  })
}

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
    else {
      await AlertError('Speed','Invalid average speed');
      return;
    }
    if (props.user.units=='m' && props.user.role < 2) {
       // store as km, not miles, so adjust
      // but if admin is adjusting someone else's ride, leave this alone
      thisRide.minSpeed = Math.round(thisRide.minSpeed*1.6);
      thisRide.maxSpeed = Math.round(thisRide.maxSpeed*1.6);
      distance.value = Math.round(distance.value*1.6);
    }
    if (thisRide.routeID == 0 /* && newRoute != null  && newRoute.hasGPX */) {
      //  need to save the route first
      let newRoute : Route | null = currentRoute.value;
      if (newRoute == null) {
        // new ride without a route
        newRoute = new Route();
        newRoute.dest = destination.value;
        newRoute.distance = distance.value;
      }
      newRoute.owner = props.user.name;
      const res = await myFetch(apiMethods.saveRoute,newRoute);
      if (res===null)
        return;
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
    if (newRide == false && currentRoute.value.id != thisRide.routeID) {
      routeID = currentRoute.value.id;
      // todo: need to warn riders that route has changed
      
      await Alert('Route has changed','Please inform any riders that have signed up','using the WhatsApp RideInfo group','info','OK');
    }
    if (newRide == false && thisRide.date != TimesDates.toIntDays(date.value)) {
      // todo: need to warn riders that route has changed
      
      await Alert('Ride date has changed','Please inform any riders that have signed up','using the WhatsApp RideInfo group','info','OK');
    }
    
    thisRide.leaderName = props.user.name;
    thisRide.date = TimesDates.toIntDays(date.value);
    thisRide.time = date.value.getHours() * 60 + date.value.getMinutes();
    thisRide.description = description.value;
    thisRide.groupSize = maxRiders.value;
    thisRide.meetingAt = meetingAt.value;
    thisRide.routeID = routeID;
    thisRide.leaderName = leader.value;

     if (newRide) {
      const res = await myFetch(apiMethods.saveRide,thisRide);
      if (res === null) 
        return;
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

function showRoute(route : Route, chosen: boolean) {
  if (chosen)
    console.log(`chosen route: ${route.dest}`);
  else
    console.log(`show route: ${route.dest}`);

  route.highlighted = true;
  // setTimeout(()=> {   // todo: why a timeout????
  //   emit('showRoute',route,chosen);
  // },500)
  emit('showRoute',route,chosen);
  destination.value = route.dest;
  distance.value = route.distance;
  currentRoute.value = route;
  //showRouteList.value = !chosen;
  if (thisRide)
    thisRide.routeID = route.id;

}

function newDate(newDate : Date) {
  date.value = newDate;
}

function newRouteList(routes : Route[]) {
  emit('newRouteList',routes);
}
function routeChosen(route : Route) {
  routeHasBeenChosen.value = true;
  currentRoute.value = route;
  update();
}
function showUploadedRoute(r : Route) {
  emit('showUploadedRoute',r);
  //if (thisRide)
   // thisRide.routeID = r.id;
}
</script>

<template>
    <v-card  >
      <v-card-title class="headline black" primary-title>
        {{newRide? 'Plan to lead a ride':'Edit your ride'}}
      </v-card-title>
      <ChooseRoute v-if="routeHasBeenChosen==false"
        :existing-route="currentRoute"
        @route-chosen="routeChosen"
        @show-route="showRoute"
        @choose-route-from-list="emit('chooseRouteFromList')"
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
                  <v-text-field density="compact" variant="outlined" label="Destination" 
                    v-model="destination"
                    :rules="destinationRules"

                    hint='Where are you riding to? Coffee stop?'/>
              </v-col>
              <v-col cols="6"   >
                  <v-text-field density="compact"   variant="outlined" label="Approx Distance" 
                   v-model="distance"
                   :suffix="props.user.units==='k'?'km':'miles'"
                   :rules="distanceRules"
                   :disabled="currentRoute.distance>0" 
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
              <v-col cols ="3" class="mt-n6" >
              </v-col>
              <v-col cols ="3" class="mt-n6" >
                Ride date and time:
              </v-col>
              <v-col cols="6" class="mt-n6" >
                    <DateSelector :icon="false" :dates="ridedates"
                      :text="TimesDates.dateString(date)"
                      :date="date"
                      @new-date="newDate"   />
              </v-col>

              <!-- <v-col cols="3" >
                  <v-combobox density="compact" variant="underlined" v-model="hour"
                      label="Hour"
                    :items="['6', '7', '8', '9', '10', '11','12', '13','14', '15','16','17', '18']"
                  ></v-combobox>
            </v-col>
              <v-col cols="3" >
                  <v-combobox  density="compact" variant="underlined" v-model="minute"
                    label="Minute"
                    :items="['00', '15', '30', '45']"
                  ></v-combobox>
              </v-col> -->

            </v-row>
        
            <v-row   no-gutters>
              <v-col cols="6"  class="mt-6" >
                  <v-text-field variant="outlined" density="compact" v-model="meetingAt"  :rules="meetingRules"  label="Starting At" 
                      hint="Please be precise if ride is not starting at the usual place" />
              </v-col>
              <v-col cols="3"  class="mt-6" >
                  <v-text-field variant="outlined" density="compact" v-model="maxRiders"  :rules="ridersRules"  label="Max riders" 
                   hint="Limit rider numbers if you don't want a big group" />
              </v-col>
              <v-col cols="3"  class="mt-6" >
                  <v-text-field variant="outlined" density="compact" v-model="speedStr"
                      :rules="speedRules"
                    :label="props.user.units==='k'?'km/hr':'mph'" 
                  hint="Suggested speed. May depend on riders present"  />
              </v-col>

            </v-row>
          <!-- </v-container> -->
          </div>
  
          <v-row >
            <v-col  v-if="!newRide">
              <v-btn block color="blue"    @click="deleteRide()">Delete Ride</v-btn>
            </v-col>
            <v-col>
              <v-btn block color="blue"  variant="outlined" @click="cancel()" >Cancel Edit</v-btn>
            </v-col>
            <v-col  v-if="routeHasBeenChosen">
              <v-btn block color="blue" type="submit"  >{{newRide? 'Save ride':'Save edits'}}</v-btn>
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


../utils/classes/ride