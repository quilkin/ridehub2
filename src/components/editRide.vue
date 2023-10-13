
<script setup lang="ts">

import { ref, type Ref, onBeforeMount} from 'vue'
import { destinationRules, distanceRules, meetingRules, ridersRules, speedRules, gpxRules, descriptionRules} from '../utils/rules'

import { myFetch } from '../utils/fetch'
import { Alert, Message, YesNo } from '../utils/alert'
import { User } from '../utils/user'
import { Ride } from '../utils/ride'
import { Route } from '../utils/route'
import Routes  from '../utils/routes'
import RouteList from './routeList.vue'
import TimesDates  from '../utils/timesdates'
import baseDatePicker  from './baseDatePicker.vue'
import { watch } from 'vue'

enum RouteTypes {
  none,
  oldGpx,
  newGpx,
  noGpx
}
//const loggedIn = ref(true);
const thisRide = ref(new Ride);
const userName = ref('');
const destination = ref('');
const gpxfiles= ref() as Ref<File[]>;
const distance = ref(0);
const rideDialog = ref(false);
const rideForm = ref();
const routeType = ref(RouteTypes.none);
//const newRoute = ref() as Ref<Route>;
var newRoute : Route ;
const selectedRoute = ref(new Route);
//const oldGPX = ref(false);
const units = ref('k');

const meetingAt = ref ('Lemon Quay, Truro');
const description = ref ('');
const date = ref(new Date());
const startTime = ref(540);  // default start at 9 am
const maxRiders = ref(10);
const aveSpeed = ref(20);
const showFileUpload = ref(false);

let newRide = false;

let hour='';
let minute='';
let myXML = '';
//const routeListShown = ref(false);

const emit = defineEmits(['doneRideEdit','showRoute','logIn'])

const props = defineProps<{
  ride : Ride
  user : User
  newRoute : Route
}>()



onBeforeMount(() => {
    if (props.user === undefined || props.ride === undefined)
    {
        Alert('Internal error','invalid user or ride data','','error','OK');
        return;
    } 
    
    thisRide.value = props.ride;
    if (thisRide.value.rideID > 0) {
      // existing ride being edited
      const route  = Routes.findRoute(thisRide.value.routeID);
      if (route != null) {
        if (route.hasGPX==false)
          routeType.value = RouteTypes.noGpx;
        else
          routeType.value = RouteTypes.oldGpx;

        destination.value = route.dest;
        distance.value = route.distance;
      }
    }
    else {
      routeType.value = RouteTypes.none;
      newRide = true;
    }
    units.value = props.user.units;
    userName.value = props.user.name;
    description.value = props.ride.description;
    startTime.value = props.ride.time;
    date.value = TimesDates.fromIntDays(props.ride.date);
    maxRiders.value = props.ride.groupSize;
    aveSpeed.value = props.ride.speed;
    meetingAt.value = props.ride.meetingAt;

    //const route  = Routes.findRoute(thisRide.value.routeID);

    // default to have ride on a Sunday
    const day = date.value.getDay();
    const daysToAdd = 7-day;
    date.value.setDate(date.value.getDate() + daysToAdd);

    // starttime is stored as total number of minutes
    hour = (startTime.value / 60).toString();
    if (hour.length == 1) hour = '0' + hour;
    minute = (startTime.value % 15).toString();
    if (minute.length == 1) minute = '0' + minute;
   
  })

async function submit() {
  if (rideForm.value == null) 
    return;
  const {valid} = await rideForm.value.validate()
  if (!valid ) return;

  await YesNo('Save this ride, are you sure?', async ()=> {

    let routeID  = thisRide.value.rideID;
    if (thisRide.value.routeID == 0 && newRoute != null  && newRoute.hasGPX) {
      console.log('saving route: '+  newRoute.dest);
      //  need to save this new route first
      newRoute.owner = props.user.name;
      const res = await myFetch('SaveRoute',newRoute,true);
      const id = parseInt(res);
      if (Number.isInteger(id)) {
   
        newRoute.id = id;
        routeID = id;
        Routes.addNewRoute (newRoute);
      }
      else {
        if (res.includes("XML parse error"))
              await Message("Error: please ensure that this is a GPX file");
        else
              await Message(res);
      }
    }
    if (newRide == false && selectedRoute.value.id != thisRide.value.routeID) {
      console.log('warn riders: ' + selectedRoute.value.id  + ' ' +   thisRide.value.routeID);
      routeID = selectedRoute.value.id;
      // todo: need to warn riders that route has changed
    }
    
    thisRide.value.leaderName = props.user.name;
    thisRide.value.date = TimesDates.toIntDays(date.value);
    thisRide.value.time = parseInt(hour) * 60 + parseInt(minute);
    thisRide.value.description = description.value;
    thisRide.value.groupSize = maxRiders.value;
    thisRide.value.meetingAt = meetingAt.value;
    thisRide.value.routeID = routeID;
    thisRide.value.speed = aveSpeed.value;

    if (newRide) {
      const res = await myFetch('SaveRide',thisRide.value,true);
      const id = parseInt(res);
      if (Number.isInteger(id)) {
        await Message('Ride has been saved');
      }
      else {
        await Alert('Save Ride Error',res,'','error','OK');
      }
    }
    else {
      const res = await myFetch('EditRide',thisRide,true);
      if (res=="OK") {
        await Message('Edited ride has been saved');
      }
      else {
        await Alert('Save Ride Error',res,'','error','OK');
      }
    }
  })

}

function changeRouteType(t : RouteTypes)
{
  routeType.value = t;
  console.log('route type: ' + routeType.value);
  if (t===RouteTypes.noGpx) {
    // clear old route from map by showing plain Cornwall
    //const blank : Route = new Route();
    emit('showRoute',new Route(),false);
    //showRoute(blank);
  }
  else if (t===RouteTypes.newGpx) {
    showFileUpload.value = true;
    // prompt for file to upload....
  }
  // else (RouteTypes.oldGpx) routes menu will be displayed by button press
  
}

function showRoute(route : Route) {
  emit('showRoute',route,false);
  destination.value = route.dest;
  distance.value = route.distance;
  selectedRoute.value = route;

}
function buttonType(t : RouteTypes) {
  if (routeType.value === t)
    return "tonal";
  return "outlined";
}
function cancel() {
    rideDialog.value = false;
    emit('doneRideEdit');
}

function newDate(newDate : Date) {
  date.value = newDate;
}

 function readSuccess(event: ProgressEvent<FileReader>) {
  if (event.target === null) {
    Alert('File error','Cannot read file','','error','OK');
          return;
  }
  if ((typeof event.target.result) != "string") {
    Alert('File error','File contents have incorrect type','','error','OK');
          return;
  }
  myXML = event.target.result;

  var oParser = new DOMParser();
  var oDOM = oParser.parseFromString(myXML, "text/xml");
  if (oDOM.documentElement.nodeName === "parsererror") {
          Alert('File error','File does not appear to be valid GPX or TCX','','error','OK');
          return;
  }
  newRoute = new Route();
  //const route = new Route();
  newRoute.hasGPX = true;
  newRoute.url = myXML;

  emit('showRoute',newRoute,false);
  watch(() => props.newRoute, (first,second) => {
    // wait for emit to finish (map will update and find data from gpx) then update the distance etc
    console.log( "Watch props function called with args:", first.dest,  second.dest  );
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
}

</script>

<template>
    
  <div class="d-flex align-center flex-column">
   <v-card  width="600" >
      <v-card-title class="headline black" primary-title>
        {{newRide? 'Plan to lead a ride':'Edit your ride'}}
      </v-card-title>
      <v-card-text class="pa-3">
        <v-form @submit.prevent="submit"  ref="rideForm">
          <v-row >
              A ride could do with a route of some sort. So, please choose one of the following:

            <v-btn block :variant="buttonType(RouteTypes.oldGpx)" class="mt-2" color="blue" id="btn-existing" @click="changeRouteType(RouteTypes.oldGpx)">
              Use an existing route from the RideHub list (there's over 100 of them!)</v-btn>
            <v-btn block :variant="buttonType(RouteTypes.newGpx)" class="mt-2" color="blue" @click="changeRouteType(RouteTypes.newGpx)">
              Upload a new GPX route that you have created or found elsewhere</v-btn>
            <v-row v-if="showFileUpload">
              <v-col cols="8" class="mt-6" >
                <v-file-input v-model="gpxfiles"  density="compact" variant="outlined"
                    accept=".gpx,.tcx"
                    label="Find GPX or TCX file"
                    prepend-icon="mdi-routes"
                    :rules="gpxRules"
                  ></v-file-input> 
                  
              </v-col>
              <v-col cols = "4" class="mt-6" >
                <v-btn color="blue" class="mt-2"  variant="outlined" @click="loadGpx">Select this file</v-btn>
              </v-col>
            </v-row>
            <v-btn block :variant="buttonType(RouteTypes.noGpx)" class="mt-2" color="blue" @click="changeRouteType(RouteTypes.noGpx)">
              Have a simple ride to somewhere, with no defined route</v-btn>

            <RouteList  :user="props.user" @show-route="showRoute" ></RouteList>
          </v-row>
          <v-spacer></v-spacer>
          <div  v-if="routeType!=RouteTypes.none" >
          <v-container >

            <v-row >
              <v-col cols="6"  class="mt-6" >
                  <v-text-field density="compact"  v-model="destination" variant="outlined"  :rules="destinationRules"  label="Destination" 
                      hint="Where are you riding to? Coffee stop?"/>
              </v-col>
              <v-col cols="6"  class="mt-6" >
                  <v-text-field density="compact"  v-model="distance" variant="outlined"  :suffix="props.user.units==='k'?'km':'miles'" :rules="distanceRules"  label="Approx Distance"  :disabled="routeType!=RouteTypes.noGpx"
                      hint="A rough indication, need not be exact"/>
              </v-col>
            </v-row>
            <v-row >
              <v-col cols="12"  class="mt-n4" >
                  <v-textarea density="compact" rows="1" v-model="description" variant="outlined"  :rules="descriptionRules"  label="Description" 
                      hint="Help others to know if they would like to ride this route. e.g. mention 'Gravel' if it's off-road"/>
              </v-col>
            </v-row>
            <v-row  >
              <v-col cols="1" class="pr-0 mt-n4">Ride Date</v-col>
              <v-col cols="5" class="mt-n4">
                    <baseDatePicker :large="true" :text="TimesDates.dateString(date)" :date="date"    @new-date="newDate"   />
              </v-col>

              <v-col cols="3" class="mt-n4">
                  <v-combobox density="compact" variant="outlined" v-model="hour"
                    label="Time: Hour"
                    :items="['6', '7', '8', '9', '10', '11','12', '13','14', '15','16','17', '18']"
                  ></v-combobox>
              </v-col>
              <v-col cols="3" class="mt-n4">
                  <v-combobox  density="compact" variant="outlined" v-model="minute"
                    label="Minute"
                    :items="['00', '15', '30', '45']"
                  ></v-combobox>
              </v-col>

            </v-row>
        
            <v-row  >
              <v-col cols="6">
                  <v-text-field variant="outlined" density="compact" v-model="meetingAt"  :rules="meetingRules"  label="Starting At" 
                      hint="Please be precise if ride is not starting at the usual place" />
              </v-col>
              <v-col cols="3">
                  <v-text-field variant="outlined" density="compact" v-model="maxRiders"  :rules="ridersRules"  label="Maximum riders" 
                   hint="Limit rider numbers if you don't want a big group" />
              </v-col>
              <v-col cols="3">
                  <v-text-field variant="outlined" density="compact" v-model="aveSpeed"  :suffix="props.user.units==='k'?'km/hr':'mph'" :rules="speedRules"  label="Ave speed" 
                  hint="Suggested average speed. Actual speed will depend on riders present"  />
              </v-col>

            </v-row>
          </v-container>
          </div>
  
          <v-row >
            <v-col>
              <v-btn block color="blue"  variant="outlined" @click="cancel()" class="mt-2">Cancel</v-btn>
            </v-col>
            <v-col  v-if="routeType!=RouteTypes.none">
              <v-btn block color="blue" type="submit"  class="mt-2">{{newRide? 'Save ride':'Save edits'}}</v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </div>

  </template>


