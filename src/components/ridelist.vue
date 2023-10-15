<script setup  lang="ts">
import { ref, onBeforeMount, type Ref } from 'vue'
import { apiMethods, myFetch } from '../utils/fetch'
import { Ride } from '../utils/ride'
import { Already} from '../utils/already'
import { AlertError } from '../utils/alert'
import { User } from '../utils/user'
import Routes  from '../utils/routes'
import RideDetails from './rideDetails.vue'
import TimesDates  from '../utils/timesdates'
import { Route } from '@/utils/route'


const props = defineProps<{
  date : Date
  user : User
}>()

const emit = defineEmits(['showRoute','logIn','editRide','participantsUpdated']);
const showTooltips = ref(true);
const rides = ref() as Ref<Ride[]>

// data to be shown for each ride
const participants = ref() as Ref<string[][]>;
const reserves = ref() as Ref<string[][]>;
const distanceStr = ref() as Ref<string[]>;
const climbingStr = ref() as Ref<string[]>;
const climbingColour = ref() as Ref<string[]>;
const destination = ref() as Ref<string[]>;

// used to check if a rider is 'already' doing doing a ride on a given day
const already = ref() as Ref<Already[]>;
let currentRoute : Route = new Route();

onBeforeMount(async() => {

  initialiseArrays();
  await getData();
  createRideList();
  viewRoute(0);
 
});
// onUpdated(async() => {

//   await getData();
//   createRideList();
//   viewRoute(0);

// });

function initialiseArrays() {
  rides.value =         [] as Ride[];
  participants.value =  [] as string[][];
  reserves.value =      [] as string[][];
  destination.value =   [] as string[];
  distanceStr.value =   [] as string[];
  climbingStr.value =   [] as string[];
  climbingColour.value =[] as string[];
  already.value =       [] as Already[];
}

function allDataLoaded(i : number) {
  if (participants.value[i] && reserves.value[i] && destination.value[i])
    return true;
  return false;
}

async function getData() {

  var intdays = TimesDates.toIntDays(props.date);
  var rideIDs: number[] = [];

  try {
    const result = await Routes.getRouteSummaries();
    if (result === null)    throw new Error(`Cannot get routes`);

    rides.value   = await myFetch(apiMethods.getRides,intdays);
    if (rides.value  === null)  throw new Error(`Cannot get rides`);

    rides.value.forEach((ride) => {
        rideIDs.push(ride.rideID);
    });
  
    const ppts = await myFetch(apiMethods.getPpts, rideIDs);
    if (ppts === null)    throw new Error(`Cannot get participants`);
   
    for (let index in rideIDs)
    {
      // get a list of all participants and reserves for the ride, split into two lists
      const list = ppts[index].split(',');
      const reserveList = [] as string[];
      const riderList =  [] as string[];
      var numberOfRiders = 1; // leader
      list.forEach((person : string) => {
          if (person[0] == '+') {
              reserveList.push(person);
          }
          else if (person.length > 2) {
              riderList.push(person);
              ++numberOfRiders;
          }
      });
      participants.value.push(riderList);
      reserves.value.push(reserveList);
    };
  }
  catch (e) {
    const err = e as Error;
    AlertError('Unsuccessful',err.message);
  }
}   

function createRideList() {

    rides.value.forEach((ride,index) => {
      const route  = Routes.findRoute(ride.routeID);
      if (route.id > 0)
      {
        destination.value[index] = route?.dest;
        distanceStr.value[index] = Routes.distanceStr(route,props.user.units);
        climbingStr.value[index] = Routes.climbingStr(route,props.user.units);
        climbingColour.value[index] = Routes.climbingColour(route);
      }
    });

    // now see if this rider is already booked on a ride for this date

    
    if (props.user !== undefined && props.user.role > 0) {
        let riderName = props.user.name;
        rides.value.forEach((ride,index) => {
          let ridingAlready = new Already();
          try {
            const dest = destination.value[index]
            if (participants.value[index].includes(riderName)) {
              ridingAlready.ridingToDest = dest;
              ridingAlready.ridingOnDate = ride.date;
            }
            if (reserves.value[index].includes(riderName)) {
              ridingAlready.reservedToDest = dest;
              ridingAlready.reservedOnDate = ride.date;
            }
            const leader = ride.leaderName;
            if (leader === riderName) {
              ridingAlready.leadingToDest = dest;
              ridingAlready.leadingOnDate = ride.date;
            }
            already.value.push(ridingAlready);
          }
          catch (e ) {
            const err = e as Error;
            AlertError('Unsuccessful',err.message);
          }
        
        });
    }
 }


var prevDate = 'x';
var thisDate = '';
function newDateReqd(date : number) {
  thisDate = TimesDates.StrFromIntDays(date);
  if (thisDate != prevDate) {
    prevDate = thisDate;
    return true;
  }
  return false;
}

async function viewRoute(index : number) {
  const ride : Ride = rides.value[index];
  if (ride === null || ride==undefined) {
    AlertError('internal problem','Ride not found');
    return;
  }
  currentRoute = Routes.findRoute(ride.routeID);
  if (currentRoute.id == 0) {
    AlertError('internal problem','Route not found for this ride');
    return;
  }
  if (currentRoute.url == null || currentRoute.url.length < 100) {
    // don't yet have the GPX data
    let gpxData  = await myFetch(apiMethods.getGpx, currentRoute.id, true);
    if (gpxData != null) {
      currentRoute.url = gpxData;
    }
  }
  emit('showRoute',currentRoute,true);
  // no need to show tooltip again?
  showTooltips.value = false;
}

</script>

<template>
<v-list lines="three"  density="compact">
    <v-list-item v-for="(ride, i) in rides" :key="i" >
      <v-list-item-title v-if="newDateReqd(ride.date)" style="background-color:rgb(46, 195, 245);" >{{TimesDates.StrFromIntDays(ride.date)}}</v-list-item-title>
      <v-row  no-gutters>
        <v-col cols="1">
          <!-- <small>{{ TimesDates.fromIntTime( ride.time) }}</small>  -->
          <v-chip size="small" color="blue" variant="outlined">{{ TimesDates.fromIntTime( ride.time) }}</v-chip>
        </v-col>
        <v-col cols="4">
          <v-btn variant='elevated' color="blue" density="compact"  @click="viewRoute(i)" title="Click to show route on map">
            <span class="text-truncate" style="width:150px" >{{ destination[i]  }}</span>
            <!-- <v-tooltip   activator="parent"  location="end" >Click to show route on map</v-tooltip> -->
          </v-btn>
        </v-col>
        <v-col cols="1">
          <small>{{ distanceStr[i] }}</small> 
        </v-col>
        <v-col cols="1.3">
          <small v-bind:style="{'color': climbingColour[i]}"><b>&uarr;&darr;</b>{{ climbingStr[i] }}</small>
        </v-col>
        <v-col cols="2">
          <v-list-item-title v-text="ride.leaderName"></v-list-item-title>
        </v-col>

        <v-col  cols="2">
          <RideDetails v-if="allDataLoaded(i)"
            :ride="ride" 
            :participants="participants[i]" 
            :reserves="reserves[i]" 
            :user="props.user"
            :dest="destination[i]"
            :already="already"
            :route="currentRoute"
            @log-in="$emit('logIn')"
            @participants-updated="$emit('participantsUpdated')"
            @edit-ride="emit('editRide',ride)"
            @view-route="viewRoute(i)"
          > </RideDetails>

        </v-col>
      </v-row>
      <v-list-item-subtitle v-text="ride.description"></v-list-item-subtitle>
      
    </v-list-item>
  </v-list>
</template>

