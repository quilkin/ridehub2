<script setup  lang="ts">
import { ref, reactive, onBeforeMount, onBeforeUpdate, onMounted, onUpdated, type Ref } from 'vue'
import { myFetch } from '../utils/fetch'
import  TimesDates  from '../utils/timesdates'
import { Ride } from '../utils/ride'
import  { Alert, Message, chooseFromTwo} from '../utils/alert'
import { User } from '../utils/user'
import Routes  from '../utils/routes'
import rideData  from '../utils/ridedata'


const props = defineProps<{
  date : Date
  user : User
}>()

const emit = defineEmits(['showRoute','logIn']);

// text for buttons etc

    const message = ", and cannot join more than one ride each day";
    const joinText = 'Join';
    const reserveText = 'Reserve';
    const meText = 'me';
    const mePlusText = 'me+';
    const leaveReserveText = 'UnReserve';
    const editRideText = 'Edit/Cancel';

const rides = ref() as Ref<Ride[]>

//array of lists of participants, each member will be a string of participants for that ride
const participants = ref() as Ref<string[]>;
//array of lists of reserve participants, as above
const reserves = ref() as Ref<string[]>;
// will be used to break up participant strings into 2D arrays
const pp = ref() as Ref<string[][]>;
const rs= ref() as Ref<string[][]>;

// text for ride list items
const joinButton = ref() as Ref<string[]>;
const distanceStr = ref() as Ref<string[]>;
const climbingStr = ref() as Ref<string[]>;
const climbingColour = ref() as Ref<string[]>;
const destination = ref() as Ref<string[]>;
//const numRiders = ref() as Ref<number[]>;

    // the latest one to be downloaded from web. Includes URL only, not full gpx
var currentride : Ride;
// curently chosen ride from the list, used for getting participants
var currentIndex = 0;
    // to check that riders don't join two rides on same day
var alreadyRidingDest ='', alreadyRidingDate=0,
    alreadyReservedDest ='', alreadyReservedDate=0,
    alreadyLeadingDest='', alreadyLeadingDate=0;

// number of signed-up riders for each ride
var numRiders: number[];

onBeforeMount(async() => {
  console.log('onBeforeMount');
  initialiseArrays();
  getRides();
});

function initialiseArrays() {

  pp.value = [] as string[][];
  rs.value = [] as string[][];
  participants.value = [] as string[];
  reserves.value = [] as string[];
  destination.value = [] as string[];
  distanceStr.value = [] as string[];
  climbingStr.value = [] as string[];
  climbingColour.value = [] as string[];
  joinButton.value = [] as string[];
  numRiders = [] as number[];
}
async function getRides() {

  var intdays = TimesDates.toIntDays(props.date);
  var rideIDs: number[] = [];
  try {
    const result = await Routes.getRouteSummaries();
    console.log('getRoutes: result: '+ result) ;
    if (result === null) 
      return;


    console.log('gettingRides');
    const response : Ride[]  = await myFetch("GetRidesForDate",intdays,true);

    
    if (response != null)
    {

      rides.value = response;
      console.log('got rides');
      if (rides.value.length === 0) {
          // $('#ridelist').empty();  // this will also remove any handlers
          Alert( TimesDates.dateString(props.date),'No rides found for 60 days','','info','OK');
          return null;
      }
      rides.value.forEach((ride) => {
          rideIDs.push(ride.rideID);
      });
      await GetParticipants(rideIDs);
    }
    else
    {
        Alert('Unsuccessful','Could not get rides from server','','error','OK');
    }
  }
  catch (err) {
    Alert('Unsuccessful','Could not get rides from server','','error','OK');
  }
}   


async function GetParticipants(rideIDs : number[]) {

  const response = await myFetch("GetParticipants", rideIDs, true)
        //  .then ((response) => {
            console.log('got participants');
            for (let index in rideIDs)
            {
              // get a list of all participants and reserves for the ride, split into two lists
              var list = response[index].split(',');
              var reserveList = '';
              var riderList = '';
              var numberOfRiders = 1; // leader
              list.forEach((person : string) => {
                  if (person[0] == '+') {
                      reserveList += person.substring(1);
                      reserveList += ' ';
                  }
                  else if (person.length > 2) {
                      riderList += person;
                      riderList += ' ';
                      ++numberOfRiders;
                  }
              });
              if (riderList.endsWith(' ')) {
                  riderList = riderList.substring(0, riderList.length - 1);
              }
              if (reserveList.endsWith(' ')) {
                  reserveList = reserveList.substring(0, reserveList.length - 1);
              }
              participants.value.push(riderList);
              reserves.value.push(reserveList);
              numRiders.push(numberOfRiders);
            };

            // // all ready now to show the rides list??
             createRideList();
    //    });

}

 function createRideList() {
    console.log('createRideList');
  // initialise checks for invalid entries
    alreadyRidingDest = '';
    alreadyReservedDest = '';
    alreadyLeadingDest= '';
    alreadyRidingDate = 0;
    alreadyReservedDate = 0;
    alreadyLeadingDate = 0;

    Message('createRideList test message');

 // split participant and reserve lists into arrays for each ride

    for (let index in rides.value) {
      try {
          if (participants.value.length > 0)
              pp.value[index] = participants.value[index].split(' ');

          if (reserves.value.length > 0)
              rs.value[index] = reserves.value[index].split(' ');
      }
      catch (e) {
        const err = e as Error;
        console.log(err.message);
      }
    };


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
            if (pp.value[index].includes(riderName)) {
                alreadyRidingDest = dest;
                alreadyRidingDate = ride.date;
            }
            if (rs.value[index].includes(riderName)) {
                alreadyReservedDest = dest;
                alreadyReservedDate = ride.date;
            }
            const leader = ride.leaderName;
            if (leader === riderName) {
                alreadyLeadingDest = dest;
                alreadyLeadingDate = ride.date;
            }
        }
        catch (e ) {
          const err = e as Error;
          console.log(err.message);
        }
    });

    // decide wether to show 'Join' or 'leave' for each ride
    rides.value.forEach((ride,index) => {
        var joinButtonText = joinText;
        if (pp.value[index].includes(riderName)) {
            // rider is already signed up for this ride
            joinButtonText = meText;
            var riders = pp.value[index];
            if (riders.includes(riderName + '+')) {
                // guest aleady added
                joinButtonText = mePlusText;
            }
        }
        else if (rs.value[index].includes(riderName)) {
            // member is on reserve list for this ride
            joinButtonText = leaveReserveText;
        }
        else if (pp.value[index].length >= ride.groupSize) {     
            joinButtonText = reserveText;
        }
        else if (riderName === ride.leaderName /*&& pp[index][0] === ''*/) {
            // can edit your own ride, but not join it
            joinButtonText = editRideText;
        }
        joinButton.value[index] =  joinButtonText;
    });

    viewRoute(0);

 }


var prevDate = 'x';
var thisDate = '';
function newDateReqd(date : number) {
  thisDate = TimesDates.fromIntDays(date);
  if (thisDate != prevDate) {
    prevDate = thisDate;
    return true;
  }
  return false;
}
function rideDateString(date : number) {
  return TimesDates.fromIntDays(date);
}

async function viewRoute(index : number) {
  console.log('*****viewRoute');
  var ride : Ride = rides.value[index];
  currentride = ride;
  var route = Routes.findRoute(ride.routeID);
  if (route === null) {
    Alert('internal problem','Route not found for this ride','','error','OK');
    return;
  }
  
  console.log('getting GPX data');
  const gpxdata  = await myFetch("GetGPXforRoute", route.id, true);
  if (gpxdata != null) {

      route.url = gpxdata;
      emit('showRoute',route);
  }

}



function riderList(index : number) {
    
    var riderList;
    var participantsWithCommas = participants.value[index].replace(/ /g, ", ");
    var ride : Ride = rides.value[index];
    var popupDest = destination.value[index] + ": " + '(Leader: ' + ride.leaderName + ') ';
    var spacesLeft = ride.groupSize - numRiders[index];
    var spacesLeftStr = "Riders (" + spacesLeft + " spaces left): ";
    if (reserves.value[index].length > 4) {
        riderList = participantsWithCommas + " (full): Reserves: " + reserves.value[index];
    }
    else if (participantsWithCommas.length < 4) {
        riderList = 'No riders (yet)';
    }
    else {
        riderList = spacesLeftStr + participantsWithCommas;
    }
    Alert('',riderList,popupDest,'info','OK')

}



async function joinRide( index: number) {
  
  function OK2Join(ride : Ride, rider : string) {

        const cannotJoin = ", and cannot join more than one ride each day";
        if (ride.leaderName === rider) {
            Message("You cannot join your own ride!!");
            return false;
        }
        else if (alreadyReservedDest.length > 0 && alreadyReservedDate == ride.date) {
            Message("You are aleady reserved for " + alreadyReservedDest + cannotJoin);
            return false;
        }
        else if (alreadyRidingDest.length > 0 && alreadyRidingDate == ride.date) {
            Message("You are aleady listed for " + alreadyRidingDest + cannotJoin);
            return false;
        }
        else if (alreadyLeadingDest.length > 0 && alreadyLeadingDate == ride.date) {
            Message("You are aleady leading " + alreadyLeadingDest + cannotJoin);
            return false;
        }
        return true;
  };

  var ride : Ride = rides.value[index];
  currentride = ride;
  if (props.user.role === 0)
  {
    // not logged in, not allowed to join a ride
    emit('logIn');
    return;
  }
  const rider = props.user.name;
  const buttontext = joinButton.value[index];

  if (buttontext === joinText) {
      if (OK2Join(ride, rider)) {
           await rideData.saveParticipant(ride.rideID, rider);
      }
  }
  else if (buttontext === editRideText) {
      currentIndex = index;
     // $('#editRideModal').modal();
  }
  else if (buttontext === reserveText) {
      if (OK2Join(ride, rider) === true) {
          await rideData.saveReserveParticipant(ride.rideID, rider);
      }
  }
  else if (buttontext === meText) {
      await rideData.meParticipant(ride.rideID, rider);
      
  }
  else if (buttontext === mePlusText) {
    await rideData.mePlusParticipant(ride.rideID, rider);

  }
                // else if (buttontext === leaveReserveText) {
                //     var reserve = '+' + login.User();
                //     rideData.leaveParticipant(ride.rideID, reserve);
                // }
                // refresh to show new status
                //showRideList(rides);
    createRideList();
}


function descriptionText(item: { description: string; meetingAt: string })
{
  var text = item.description + '....Meeting at: ' + item.meetingAt;
  return text;
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
        <v-col cols="1">
          <v-btn variant='tonal' size="small" @click="joinRide(i)">
            {{ joinButton[i] }} 
          </v-btn>
        </v-col>
        <v-col  cols="2">
          <v-btn variant='tonal' size="small"  @click="riderList(i)">
            Rider List
          </v-btn>
        </v-col>
      </v-row>
      <v-list-item-subtitle v-text="descriptionText(item)"></v-list-item-subtitle>
      
      <!-- <v-list-item-subtitle v-text="item.meetingAt"></v-list-item-subtitle> -->
    </v-list-item>
  </v-list>
</template>

<!-- <style scoped>
small.climbColour {
  color: v-bind('climbingColour[i]');
  /* color: red; */
}
</style> -->../utils/alert../utils/routes../utils/routes