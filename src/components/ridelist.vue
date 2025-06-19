<script setup  lang="ts">

/**
 * Display a list of rides for the next two months
 */
import { ref, onBeforeMount, computed, type Ref } from 'vue'
import { myFetch } from '@/utils/fetch'
import { apiMethods } from '../../../ridehub-server/src/common/apimethods'
import { Ride } from '../../../ridehub-server/src/common/ride'
import { Route} from '../../../ridehub-server/src/common/route'
import { TimesDates} from '../../../ridehub-server/src/common/timesdates'
import { User } from '../../../ridehub-server/src/common/user'
import  routeFuncs  from '../utils/routeFuncs'
import { Already} from '../utils/already'
import { AlertError, Message } from '../utils/alert'
import Routes  from '../utils/routes'
import RideDetails from './rideDetails.vue'
import rideData from '@/utils/ridedata'
import DatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { mdiCalendarMonth } from '@mdi/js'
import { useDisplay } from 'vuetify'
const { mobile } = useDisplay();

const props = defineProps<{
  date : Date
  user : User
}>()

const emit = defineEmits(['showRoute','gotRides','logIn','editRide','participantsUpdated','updateRideIndex','newDate']);
const showTooltips = ref(true);
const changeDate = ref(false);
const rides = ref() as Ref<Ride[]>

// data to be shown for each ride
const participants = ref() as Ref<string[][]>;
const reserves = ref() as Ref<string[][]>;
const distanceStr = ref() as Ref<string[]>;
const climbingStr = ref() as Ref<string[]>;
const climbingColour = ref() as Ref<string[]>;
const destination = ref() as Ref<string[]>;
const rideSpeed = ref() as Ref<string[]>;

// used to check if a rider is 'already' doing doing a ride on a given day
const already = ref() as Ref<Already[]>;
// routes whoen on map
let currentRouteList : Route[] | null = [];
///highlighted routeFuncs, chosen from list
let currentRoute : Route = new Route();
let currentRideIndex = 0;
let rideDates : number[]  = [];


onBeforeMount(async() => {

  initialiseArrays();
  await getData();
  if (rides.value.length == 0)
    return;
  createRideList();
 
});

function initialiseArrays() {
  rides.value =         [] as Ride[];
  participants.value =  [] as string[][];
  reserves.value =      [] as string[][];
  destination.value =   [] as string[];
  distanceStr.value =   [] as string[];
  climbingStr.value =   [] as string[];
  climbingColour.value =[] as string[];
  already.value =       [] as Already[];
  rideSpeed.value =     [] as string[];
}

/**
 * don't want to try to display any data until its all ready
 * * @param i index of data in the tables
 */
function allDataLoaded(i : number) {
  if (participants.value[i] && reserves.value[i] && destination.value[i] )
    return true;
  return false;
}

/**
 * Get all the rides, routes and participant lists from the database
 */
async function getData() {

  const rideIDs: number[] = [];
  const routeIDs: number[] = [];

  try {
    rideDates = [];
    rides.value   = await myFetch(apiMethods.getRides,TimesDates.toIntDays(props.date)-1);
    if (!rides.value  )  throw new Error(`Cannot get rides`);

    if (rides.value.length == 0)
    {
      await Message('No rides found for these dates; please try another date');
      changeDate.value = true;
      return;
    }

    rides.value.forEach((ride) => {
        rideIDs.push(ride.rideID);
        routeIDs.push(ride.routeID);
        rideDates.push(ride.date);
    });

    // to start with, get routes for displayed rides
    currentRouteList = await Routes.getRoutesByID(routeIDs);
    if (currentRouteList === null)    throw new Error(`Cannot get routes`);

    emit('gotRides',currentRouteList, rideDates);

    const ppts = await myFetch(apiMethods.getPpts, rideIDs);
    if (!ppts )    throw new Error(`Cannot get participants`);
   
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
   await  AlertError('Unsuccessful',err.message);
  }
}

/**
 * convert ride speed (kph) into a displayable string, depending on user's preference
 * @param ride ride to display speed for
 */
function speedStr(ride : Ride) {
    let speeds = rideData.speedsToString(ride.minSpeed,ride.maxSpeed,props.user.units);
    if (speeds =='') return '';
    return speeds + (props.user.units=='k'?' kph':' mph');
}

/**
 * does what is says on the tin
 */
function createRideList() {

    rides.value.forEach((ride,index) => {
      const route  = Routes.findRoute(ride.routeID);
      if (route.id > 0)
      {
        destination.value[index] = route?.dest;
        climbingStr.value[index] = routeFuncs.climbingStr(route,props.user.units);
        distanceStr.value[index] = routeFuncs.distanceStr(route,props.user.units);
        climbingColour.value[index] = routeFuncs.climbingColour(route);
        rideSpeed.value[index] = speedStr(ride);
        // not alowed by Typescript but this gives three states without defining an enum!
        // @ts-ignore
        route.highlighted = undefined;
      }
    });

    // now see if this rider is already booked on a ride for this date
    // see 'Already' for more info
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
    if (rides.value.length>0)
      viewRoute(0);
 }

 // global vars needed just for date functions
var prevDate = 'x';
var thisDate = '';
const workingDate = ref(props.date);

/**
 * Calculate if a new date is required in the rides list (sometimes there is more than one ride on a certian date)
 * @param date 
 * @param index 
 */
function dateTitleReqd(date : number, index: number) {
  if (index==0) {
    prevDate = 'x';
    return true;
  }
  thisDate = TimesDates.StrFromIntDays(date);
  if (thisDate != prevDate) {
    prevDate = thisDate;
    return true;
  }
  return false;
}

/**
 * used by the template to determine if a new date should be displayed
 */
function newDate() {
    changeDate.value = false;
    emit("newDate",workingDate.value);
}

/**
 * Initiate showing one of the routes listed in the rides list
 * @param index which ride
 */
async function viewRoute(index : number) {
    const ride : Ride = rides.value[index];
    if (ride === null || ride==undefined) {
      AlertError('internal problem','Ride not found');
      return;
    }
    currentRoute = Routes.findRoute(ride.routeID);

    if (currentRoute.id > 0) {
      emit('showRoute',currentRoute,true);
    }
    // no need to show tooltip again?
    showTooltips.value = false;
}

/**
 * variations for phone (mobile) / PC screen displays
 */
const listHeight= computed(() => {
  return mobile.value ? '40vh':'80vh';
})
const listItemLines= computed(() => {
  return mobile.value ? 'two':'three';
})
</script>

<template>
  <DatePicker v-if="changeDate"
      inline auto-apply 
      :teleport="true"
      :enable-time-picker="false"
        v-model="workingDate"
        locale="en-UK"
        @update:modelValue="newDate" 
        six-weeks="center"   />
  <v-container  class="pa-0" >
  <v-list :lines="listItemLines"  density="compact" class="pa-0" :height="listHeight">
    <v-list-item v-for="(ride, i) in rides" :key="i" class="pl-0 pr-0 mt-n1 mb-n3"  @click="viewRoute(i)">
      <v-list-item-title v-if="dateTitleReqd(ride.date,i)" style="background-color:rgb(164, 189, 197);" @click.stop>
        <v-row>
          <v-col cols="4"  >
            {{TimesDates.StrFromIntDays(ride.date)}}
          </v-col>
          <v-col v-if="i==0" cols="8"   @click.stop="changeDate=true">
            <small>change</small><v-icon start :icon="mdiCalendarMonth">  </v-icon> 
            </v-col>
        </v-row>

      </v-list-item-title>
      <v-row  no-gutters>
        <v-col cols="2" sm="1">
          <v-chip size="small" color="blue" variant="outlined">{{ TimesDates.fromIntTime( ride.time) }}</v-chip>        </v-col>
        <v-col cols="6" sm="3">
          <v-chip size="small"   variant="elevated"
            :color="distanceStr[i]==='?'?'indigo':'blue'"
            :title="climbingStr[i]===''?'No route map available':'Click to show route on map'">
            <span class="text-truncate" style="width:170px" >{{ destination[i]  }}</span>
          </v-chip>
        </v-col>
        <v-col cols="4" sm="2" title="ride leader"> &nbsp;{{ ride.leaderName }}   </v-col>

         <!-- 12 cols below sm breakpoint -->
         <v-col cols="3" sm="1">
          <small>&nbsp;{{ distanceStr[i] }}</small> 
        </v-col>
        <v-col cols="3" sm="2" title="amount of climbing">
          <small v-bind:style="{'color': climbingColour[i]}"><b>&uarr;&darr;</b>{{ climbingStr[i] }}</small>
        </v-col>
        <v-col cols="2" sm="1"  title="average speed suggested">
          <small style="color:blue"> {{ rideSpeed[i] }}</small>
        </v-col>
        <v-col  cols="4" sm="2">
          <RideDetails v-if="allDataLoaded(i)"
            :ride="ride" 
            :participants="participants[i]" 
            :reserves="reserves[i]" 
            :user="props.user"
            :dest="destination[i]"
            :already="already"
            :route="Routes.findRoute(ride.routeID)"
            @log-in="$emit('logIn')"
            @participants-updated="$emit('participantsUpdated')"
            @edit-ride="emit('editRide',ride)"
            @view-route="viewRoute(i)"
          > </RideDetails>

        </v-col>
      </v-row>
      <v-list-item-subtitle v-if="mobile==false" v-text="ride.description" ></v-list-item-subtitle>
      
    </v-list-item>
  </v-list>
  </v-container>
</template>

<style>

.v-container {
    padding: 1vh 1vw;
  }

</style>