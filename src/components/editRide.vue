
<script setup lang="ts">

import { ref, type Ref, onBeforeMount} from 'vue'
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
import { watch } from 'vue'
import rideData from '@/utils/ridedata'
import { mdiRoutes} from '@mdi/js'
import { mdiCalendarMonth } from '@mdi/js'

enum RouteTypes {
  none,
  oldGpx,
  newGpx,
  noGpx
}
//const loggedIn = ref(true);

const userName = ref('');
const destination = ref('');
const leader = ref('');
const gpxfiles= ref() as Ref<File[]>;
const distance = ref(0);
const rideDialog = ref(false);
const rideForm = ref();
const routeType = ref(RouteTypes.none);
//const newRoute = ref() as Ref<Route>;
let newRoute : Route ;
let thisRide : Ride;
const selectedRoute = ref(new Route);
//const oldGPX = ref(false);
const units = ref('k');

const meetingAt = ref ('Lemon Quay, Truro');
const description = ref ('');
const date = ref(new Date());
const startTime = ref(540);  // default start at 9 am
const maxRiders = ref(10);
const minSpeed = ref(18);
const maxSpeed = ref(20);
const speedStr = ref('');
const showFileUpload = ref(false);
const showRouteList = ref(false);

let newRide = false;

let hour='';
let minute='';
let routeXML='' ;
const members= ref() as Ref<string[]>;
//const routeListShown = ref(false);


const emit = defineEmits(['doneRideEdit','showRoute','logIn','newRouteList']);

const props = defineProps<{
  ride : Ride
  user : User
  newRoute : Route
}>()

// watch(() => members, (first,second) => {
//     // wait for member list to load
//     if (second.length > 0 && first.length==0) {


//     }
//   })


onBeforeMount(async() => {
    if (props.user === undefined || props.ride === undefined)
    {
        AlertError('Internal error','invalid user or ride data');
        return;
    } 
    
    thisRide = props.ride;
    date.value = TimesDates.fromIntDays(thisRide.date);
    if (thisRide.rideID > 0) {
      // editing ride
      const route  = Routes.findRoute(thisRide.routeID);
      if (route.id > 0) {
        if (route.hasGPX==false)
          routeType.value = RouteTypes.noGpx;
        else
          routeType.value = RouteTypes.oldGpx;

        destination.value = route.dest;
        distance.value = route.distance;
        showRoute(route, false);
      }
      showRouteList.value = false;
      date.value.setHours(thisRide.time / 60);
      date.value.setMinutes(thisRide.time % 60);
      
    }
    else {
      routeType.value = RouteTypes.none;
      newRide = true;
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
      if (minSpeed.value != undefined) minSpeed.value = Math.round(minSpeed.value/1.6);
      if (maxSpeed.value != undefined) maxSpeed.value = Math.round(maxSpeed.value/1.6);
      distance.value = Math.round(distance.value/1.6);
    }
    speedStr.value = rideData.speedsToString(minSpeed.value,maxSpeed.value);
    meetingAt.value = thisRide.meetingAt;

      // starttime is stored as total number of minutes
    hour = (startTime.value / 60).toString();
    if (hour.length == 1) hour = '0' + hour;
    minute = (startTime.value % 15).toString();
    if (minute.length == 1) minute = '0' + minute;

    if (props.user.role > 1)
       getMembers();
   
  })
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
      // but if admin is asjuting someoen else's ride, leave this alone
      thisRide.minSpeed = Math.round(thisRide.minSpeed*1.6);
      thisRide.maxSpeed = Math.round(thisRide.maxSpeed*1.6);
      distance.value = Math.round(distance.value*1.6);
    }
    if (thisRide.routeID == 0 /* && newRoute != null  && newRoute.hasGPX */) {
      //  need to save the route first
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
    if (newRide == false && selectedRoute.value.id != thisRide.routeID) {
      routeID = selectedRoute.value.id;
      // todo: need to warn riders that route has changed
      
      await Alert('Route has changed','Please inform any riders that have signed up','using the WhatsApp RideInfo group','info','OK');
    }
    if (newRide == false && thisRide.date != TimesDates.toIntDays(date.value)) {
      // todo: need to warn riders that route has changed
      
      await Alert('Ride date has changed','Please inform any riders that have signed up','using the WhatsApp RideInfo group','info','OK');
    }
    
    thisRide.leaderName = props.user.name;
    thisRide.date = TimesDates.toIntDays(date.value);
   // thisRide.time = parseInt(hour) * 60 + parseInt(minute);
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

function changeRouteType(t : RouteTypes)
{
  routeType.value = t;
  if (t===RouteTypes.noGpx) {
    // clear old route from map by showing plain Cornwall
    emit('showRoute',new Route(),false);
    showRouteList.value = false;
    showFileUpload.value = false;

  }
  else if (t===RouteTypes.newGpx) {
    showFileUpload.value = !showFileUpload.value;
    showRouteList.value = false;
    // prompt for file to upload....
  }
 else if (t === RouteTypes.oldGpx)  {
     showRouteList.value = !showRouteList.value;
     showFileUpload.value = false;
  }
  
}

function showRoute(route : Route, chosen: boolean) {
  if (chosen)
    console.log(`chosen route: ${route.dest}`);
  else
    console.log(`show route: ${route.dest}`);

    route.highlighted = true;
    setTimeout(()=> {   // todo: why a timeout????
      emit('showRoute',route,chosen);
    },500)
    destination.value = route.dest;
    distance.value = route.distance;
    selectedRoute.value = route;
    showRouteList.value = !chosen;
    thisRide.routeID = route.id;

}
// function routeChosen(route : Route) {
//   console.log(`route chosen: ${route.dest}`);
//   showRouteList.value = false;
//   showRoute(route);

// }
function buttonType(t : RouteTypes) {
  if (routeType.value === t)
    return "tonal";
  return "outlined";
}


function newDate(newDate : Date) {
  // if (newDate.getTime() < new Date().getTime()) {
  //   AlertError('Do you have a time machine?!','Please reset the date');
  //         return;
  // }
  date.value = newDate;
}

function newRouteList(routes : Route[]) {
  emit('newRouteList',routes);
}

async function readSuccess(event: ProgressEvent<FileReader>) {
  if (event.target === null) {
    AlertError('File error','Cannot read file');
          return;
  }
  if (typeof event.target.result !== "string") {
    AlertError('File error','File contents have incorrect type');
          return;
  }
  routeXML = event.target.result;

  var oParser = new DOMParser();
  var oDOM = oParser.parseFromString(routeXML, "text/xml");
  if (oDOM.documentElement.nodeName === "parsererror") {
          AlertError('File error','File does not appear to be valid GPX or TCX');
          return;
  }
  if (routeXML.includes("TrainingCenterDatabase")) {
    // tcx needs converting to gpx
    const res = await myFetch(apiMethods.tcx2gpx,routeXML);
    if (res === null) 
        return;
    if (res.length > 0) {
      routeXML = res;
    }
    else {
      AlertError('File error','Error converting from TCX to GPX');
    }
  }
  newRoute = new Route();
  //const route = new Route();
 newRoute.hasGPX = true;
  newRoute.route = routeXML;

  emit('showRoute',newRoute,false);
  watch(() => props.newRoute, (first,second) => {
    // wait for emit to finish (map will update and find data from gpx) then update the distance etc
    if (first.id == 0) {
      // ony change if this is a new route just uploaded
       destination.value = first.dest;
       distance.value = first.distance;
    }
  })

}

function loadGpx() {
  const file = gpxfiles.value[0];
  var reader = new FileReader();
  reader.onload = readSuccess;
  reader.readAsText(file);
  showFileUpload.value = false;
  // put route into map

  
}



</script>

<template>
    
  <!-- <div class="d-flex align-center flex-column"> -->
   <v-card  >
      <v-card-title class="headline black" primary-title>
        {{newRide? 'Plan to lead a ride':'Edit your ride'}}
      </v-card-title>
      <v-card-text class="pa-3">
        <v-form @submit.prevent="submit"  ref="rideForm">
          <v-row >
            <div v-if="newRide"> A ride could do with a route of some sort. So, please choose one of the following:</div>

            <v-btn block  class="pa-2 ma-1" color="blue" 
                @click="changeRouteType(RouteTypes.oldGpx)"
                :variant="buttonType(RouteTypes.oldGpx)">
              Use an existing route from the RideHub list (there's over 100 of them!)</v-btn>
            <RouteList  v-if="showRouteList" :user="props.user" @show-route="showRoute" @new-route-list="newRouteList"></RouteList>

            <v-btn block class="pa-2 ma-1" color="blue"
                :variant="buttonType(RouteTypes.newGpx)"
                 @click="changeRouteType(RouteTypes.newGpx)">
              Upload a new GPX route that you have created or found elsewhere</v-btn>
            <v-row v-if="showFileUpload">
              <v-col cols="8" class="mt-6" >
                <v-file-input v-model="gpxfiles"  density="compact" variant="outlined"
                    accept=".gpx,.tcx"
                    label="Find GPX or TCX file"
                    :prepend-icon="mdiRoutes"
                    :rules="gpxRules"
                  ></v-file-input> 
                  
              </v-col>
              <v-col cols = "4" class="mt-6" >
                <v-btn color="blue" class="ma-2"  variant="outlined" @click="loadGpx">Load into RideHub</v-btn>
              </v-col>
            </v-row>
            <v-btn block class="pa-2 ma-1" color="blue"
                :variant="buttonType(RouteTypes.noGpx)"
                @click="changeRouteType(RouteTypes.noGpx)">
              Have a simple ride to somewhere, with no defined route</v-btn>
          </v-row>
          <!-- <v-spacer></v-spacer> -->
          <div  v-if="routeType!=RouteTypes.none && showRouteList==false &&  showFileUpload==false" >
          <!-- <v-container  class="pa-0"> -->
            <v-row v-if="props.user.role>1" >
              <!-- only for admin users, to change ride leader -->
              <!-- todo: maybe add a special secret button to override this? -->
              <v-col cols="6"  class="mt-6" >
                <v-autocomplete
                  v-model = "leader"
                  label="Leader"
                   :items="members"
                ></v-autocomplete>
              </v-col>
            </v-row>
            <v-row >
              <v-col cols="6"  class="mt-n6" >
                  <v-text-field density="compact" variant="outlined" label="Destination" 
                    v-model="destination"
                    :rules="destinationRules"

                    hint='Where are you riding to? Coffee stop?'/>
              </v-col>
              <v-col cols="6"  class="mt-n6" >
                  <v-text-field density="compact"   variant="outlined" label="Approx Distance" 
                   v-model="distance"
                   :suffix="props.user.units==='k'?'km':'miles'"
                   :rules="distanceRules"
                   :disabled="routeType!=RouteTypes.noGpx" 
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
                <!-- <v-icon :icon="mdiCalendarMonth"/>Ride date and time -->
              </v-col>
              <v-col cols="6" class="mt-n6" >
                    <DateSelector :icon="false"
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
            <v-col  v-if="routeType!=RouteTypes.none && showRouteList==false">
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