<script setup  lang="ts">
import { ref, reactive, onBeforeMount, onUpdated, type Ref } from 'vue'
import { myFetch } from './fetch'
import  Dates  from '../utils/timesdates'
import { Ride } from '../utils/ride'
import  { Alert} from './alert'
import { User } from '../utils/user'

const props = defineProps<{
  date : Date
  user : User
}>()

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
const destination = ref() as Ref<string[]>;


// curently chosen ride from the list, used for getting participants
var currentIndex = 0;
    // to check that riders don't join two rides on same day
var alreadyRidingDest ='', alreadyRidingDate=0,
    alreadyReservedDest ='', alreadyReservedDate=0,
    alreadyLeadingDest='', alreadyLeadingDate=0;

// number of signed-up riders for each ride
var numRiders: Number[];

onBeforeMount(async() => {
  await getRides();
});
onUpdated(async() => {
  await getRides();
});

async function getRides() {
  console.log('getRides')
  var intdays = Dates.toIntDays(props.date);
  var rideIDs: number[] = [];
    myFetch("GetRidesForDate",intdays,true)
      .then( (response) => {
        rides.value = response;
        if (rides.value.length === 0) {
            // $('#ridelist').empty();  // this will also remove any handlers
            Alert( Dates.dateString(props.date),'No rides found for 60 days','info','OK');
            return null;
        }
        rides.value.forEach((ride) => {
            rideIDs.push(ride.rideID);
        });
        GetParticipants(rideIDs);
      })
};
function GetParticipants(rideIDs : number[]) {
        pp.value = [] as string[][];
        rs.value = [] as string[][];
        participants.value = [] as string[];
        reserves.value = [] as string[];
        numRiders = [];
  
        myFetch("GetParticipants", rideIDs, true)
          .then ((response) => {
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

            // all ready now to show the rides list??
            createRideList();
        });
}

 function createRideList() {
  // initialise checks for invalid entries
    alreadyRidingDest = '';
    alreadyReservedDest = '';
    alreadyLeadingDest= '';
    alreadyRidingDate = 0;
    alreadyReservedDate = 0;
    alreadyLeadingDate = 0;

 // split participant and reserve lists into arrays for each ride

    //$.each(rides, function (index, ride) {
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
    destination.value = [] as string[];
    distanceStr.value = [] as string[];
    climbingStr.value = [] as string[];
    joinButton.value = [] as string[];

    rides.value.forEach((ride,index) => {
      destination.value[index] = "dest todo";
      distanceStr.value[index] = "xx km";
      climbingStr.value[index] = "mm m ";
    });

    // now see if this rider is already booked on a  ride for this date
    var riderName = 'nobody';
    if (props.user !== undefined && props.user.role > 0)
        riderName = props.user?.name;
    rides.value.forEach((ride,index) => {
        try {
            //const dest = TCCroutes.findDestFromID(ride.routeID);
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
    ///$('#rides-tab').tab('show');
    //showRideList(rides);

    // var route = TCCroutes.findRoute(currentride.routeID);
    // TCCroutes.SetRoute(route);
    // // load new map
    // TCCMap.showRoute();

 }

function testClick(data : String) {
  alert('Item: ' + data)
};

</script>

<template>
<v-list lines="three"  density="compact">
    <v-list-item v-for="(item, i) in rides" :key="i" >
      <v-row  no-gutters>
        <v-col>
          <v-list-item-title v-text="item.time"></v-list-item-title>
        </v-col>

        <v-col>
          <v-btn variant='tonal' density="compact" @click="testClick(item.meetingAt )">
            <!-- {{ destination[i]  }} -->
            dest
          </v-btn>
        </v-col>
        <v-col>
          <small>dist</small>
          <!-- <small>{{ distanceStr[i] }}</small> -->
        </v-col>
        <v-col>
          <small>climb</small>
          <!-- <small>{{ climbingStr[i] }}</small> -->
        </v-col>
        <v-col>
          <v-list-item-title v-text="item.leaderName"></v-list-item-title>
        </v-col>
        <v-col>
          <v-btn variant='tonal' size="small" @click="testClick(item.meetingAt + 'B')">
            join
            <!-- {{ joinButton[i] }} -->
          </v-btn>
        </v-col>
        <v-col>
          <v-btn variant='tonal' size="small" @click="testClick(item.meetingAt + 'B')">
            Rider List
          </v-btn>
        </v-col>
      </v-row>
      <v-list-item-subtitle v-text="item.description"></v-list-item-subtitle>
      <v-list-item-subtitle v-text="item.meetingAt"></v-list-item-subtitle>
    </v-list-item>
  </v-list>
</template>
