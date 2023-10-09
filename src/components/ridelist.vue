<script setup  lang="ts">
import { ref, reactive, onBeforeMount, onBeforeUpdate, onMounted, watch, type Ref } from 'vue'
import { myFetch } from '../utils/fetch'
import  TimesDates  from '../utils/timesdates'
import { Ride } from '../utils/ride'
import { Already} from '../utils/already'
import  { Alert, Message, chooseFromTwo} from '../utils/alert'
import { User } from '../utils/user'
import Routes  from '../utils/routes'
import rideData  from '../utils/ridedata'
import RideDetails from './rideDetails.vue'


const props = defineProps<{
  date : Date
  user : User
}>()

const emit = defineEmits(['showRoute','logIn','editRide','rideDetailsUpdated']);
const showTooltips = ref(true);

const rides = ref() as Ref<Ride[]>

////array of lists of participants, each member will be a string of participants for that ride
//array of participants for each ride ride
const participants = ref() as Ref<string[][]>;

//array of reserve participants, as above
const reserves = ref() as Ref<string[][]>;

// text for ride list items
//const joinButton = ref() as Ref<string[]>;
const distanceStr = ref() as Ref<string[]>;
const climbingStr = ref() as Ref<string[]>;
const climbingColour = ref() as Ref<string[]>;
const destination = ref() as Ref<string[]>;
//const numRiders = ref() as Ref<number[]>;

const detailsActive = ref(false);
const allDataFetched = ref(false);


var already : Already;

onBeforeMount(async() => {

  initialiseArrays();
  const result = await getData();
  createRideList();
  viewRoute(0);
  console.log('ridelist: onBeforeMount end: ' + result);
  
});

function allDataLoaded(i : number) {
  if (participants.value[i] && reserves.value[i] && destination.value[i])
    return true;
  return false;
}
function initialiseArrays() {

  rides.value = [] as Ride[];
  participants.value = [] as string[][];
  reserves.value = [] as string[][];
  destination.value = [] as string[];
  distanceStr.value = [] as string[];
  climbingStr.value = [] as string[];
  climbingColour.value = [] as string[];
  //joinButton.value = [] as string[];
  already = new Already();
}
async function getData() {

  var intdays = TimesDates.toIntDays(props.date);
  var rideIDs: number[] = [];

    try {
    const result = await Routes.getRouteSummaries();
    //console.log('getRoutes: result: '+ result) ;
    if (result === null)    throw new Error(`Cannot get routes`);

    //console.log('gettingRides');
    rides.value   = await myFetch("GetRidesForDate",intdays);
    if (rides.value  === null)  throw new Error(`Cannot get rides`);

    //rides.value = ridesResponse;
    //console.log('got rides');

    // if (rides.value.length === 0) {
    //     Alert( TimesDates.dateString(props.date),'No rides found for 60 days','','info','OK');
    // }
    rides.value.forEach((ride) => {
        rideIDs.push(ride.rideID);
    });
    //console.log('getting participants');

    const ppts = await myFetch("GetParticipants", rideIDs);
    if (ppts === null)    throw new Error(`Cannot get participants`);
    //console.log('got participant list');

    for (let index in rideIDs)
    {
      // get a list of all participants and reserves for the ride, split into two lists
      var list = ppts[index].split(',');
      var reserveList = [] as string[];
      var riderList =  [] as string[];
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
    
    allDataFetched.value = true;
    // createRideList();
    // viewRoute(0);
    return 'get rides success';
    

  }
  catch (err : any) {
    Alert('Unsuccessful',err,'','error','OK');
    return 'get rides try/catch error';
  }
}   


 function createRideList() {
    console.log('createRideList');
  // initialise checks for invalid entries
    already.reservedToDest = '';
    already.reservedToDest = '';
    already.leadingToDest= '';
    already.ridingOnDate = 0;
    already.reservedOnDate = 0;
    already.leadingOnDate = 0;

   // Message('createRideList test message');

    rides.value.forEach((ride,index) => {
      const route  = Routes.findRoute(ride.routeID);
      if (route != null)
      {
        destination.value[index] = route?.dest;
        distanceStr.value[index] = Routes.distanceStr(route,props.user.units);
        climbingStr.value[index] = Routes.climbingStr(route,props.user.units);
        climbingColour.value[index] = Routes.climbingColour(route);
      }
    });

    // now see if this rider is already booked on a  ride for this date
    var riderName = 'nobody';
    if (props.user !== undefined && props.user.role > 0)
        riderName = props.user?.name;
        rides.value.forEach((ride,index) => {
        try {

            const dest = destination.value[index]
              if (participants.value[index].includes(riderName)) {
                already.ridingToDest = dest;
                already.ridingOnDate = ride.date;
            }
            if (reserves.value[index].includes(riderName)) {
                already.reservedToDest = dest;
                already.reservedOnDate = ride.date;
            }
            const leader = ride.leaderName;
            if (leader === riderName) {
                already.leadingToDest = dest;
                already.leadingOnDate = ride.date;
            }
        }
        catch (e ) {
          const err = e as Error;
          console.log(err.message);
        }
    });



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
function rideDateString(date : number) {
  return TimesDates.StrFromIntDays(date);
}

async function viewRoute(index : number) {
  console.log('*****viewRoute');
  var ride : Ride = rides.value[index];
  //currentride = ride;
  var route = Routes.findRoute(ride.routeID);
  if (route === null) {
    Alert('internal problem','Route not found for this ride','','error','OK');
    return;
  }
  if (route.url != null && route.url.length > 100) {
    console.log(route.dest + ': route gpx aleady in store');
  }
  else {
    console.log('getting GPX data');
    const gpxdata  = await myFetch("GetGPXforRoute", route.id, true);
    if (gpxdata != null) {

        route.url = gpxdata;


    }
  }
  emit('showRoute',route,true);
  // no need to show tooltip again?
  showTooltips.value = false;

}


</script>

<template>
<v-list lines="three"  density="compact">
    <v-list-item v-for="(item, i) in rides" :key="i" >
      <v-list-item-title v-if="newDateReqd(item.date)" style="background-color:rgb(46, 195, 245);" >{{rideDateString(item.date)}}</v-list-item-title>
      <v-row  no-gutters>
        <v-col cols="1">
          <small>{{ TimesDates.fromIntTime( item.time) }}</small> 
        </v-col>
        <v-col cols="3.5">
          <v-btn variant='tonal' density="compact"  @click="viewRoute(i)">
            <span class="text-truncate" style="max-width:100px" >{{ destination[i]  }}</span>
            <v-tooltip   activator="parent"  location="end" >Click to show route on map</v-tooltip>
          </v-btn>
        </v-col>
        <v-col cols="1">
          <small>{{ distanceStr[i] }}</small> 
        </v-col>
        <v-col cols="1">
          <small v-bind:style="{'color': climbingColour[i]}"><b>&uarr;&darr;</b>{{ climbingStr[i] }}</small>
        </v-col>
        <v-col cols="2.5">
          <v-list-item-title v-text="item.leaderName"></v-list-item-title>
        </v-col>
        <!-- <v-col cols="1">
          <v-btn variant='tonal' size="small" @click="joinRide(i)">
            {{ joinButton[i] }} 
          </v-btn>
        </v-col> -->
        <v-col  cols="2">
          <RideDetails v-if="allDataLoaded(i)"
            :ride="item" 
            :participants="participants[i]" 
            :reserves="reserves[i]" 
            :user="props.user"
            :dest="destination[i]"
            :already="already"
            @log-in="$emit('logIn')"
            @details-updated="$emit('rideDetailsUpdated')"
          > </RideDetails>
          <!-- <v-btn variant='tonal' size="small"  @click="riderList(i)">
            Rider List
          </v-btn> -->

        </v-col>
      </v-row>
      <v-list-item-subtitle v-text="item.description"></v-list-item-subtitle>
      
      <!-- <v-list-item-subtitle v-text="item.meetingAt"></v-list-item-subtitle> -->
    </v-list-item>
  </v-list>
</template>

