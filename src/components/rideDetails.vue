<script setup lang="ts">
  import { ref , onMounted, onBeforeMount} from 'vue'
  import { Ride } from '../utils/ride'
  import { User } from '../utils/user'
  import { Message } from '../utils/alert'
  import { Already} from '../utils/already'
  import rideData  from '../utils/ridedata'
  import { Route } from '@/utils/route'
  import Routes  from '@/utils/routes'
  import TimesDates from '@/utils/timesdates'
  import {Buffer} from 'buffer'
import { myFetch } from '@/utils/fetch'
  import { mdiBike } from '@mdi/js'

  const props = defineProps<{ 
    ride : Ride ,
    participants : string[],
    reserves: string[],
    user: User,
    dest : string,
    already : Already[]
    route : Route
    }>();

  const emit = defineEmits(['logIn','viewRoute','detailsDone','participantsUpdated','editRide']);
  const detailsActive = ref(false);
  const ride = props.ride;
  const rider = props.user.name;
  const participants = props.participants;

  // possible texts for the 'join' button
  const joinText = 'Join';
  const reserveText = 'Reserve';
  const meText = 'me';
  const mePlusText = 'me+';
  const leaveReserveText = 'UnReserve';
  const editRideText = 'Edit/Cancel';
  let buttonText = joinText;
  let spacesLeft = 0;

  onMounted(() => {

    let numberOfRiders = participants.length;
    spacesLeft = ride.groupSize - numberOfRiders - 1; // allow for ride leader!
    if (props.reserves.length > 0) {
        participants.push(" (full): Reserves: ");
        for (const reserve of props.reserves)
            participants.push(reserve);
    }
    else if (numberOfRiders ==0 ) {
        participants.push('No riders (yet)');
    }
    else {
        participants.push(spacesLeft.toString() + ' spaces left')
    }

    // now decide wether to show 'Join' or 'leave' etc
    if (participants.includes(rider)) {
        // rider is already signed up for this ride
        buttonText = meText;
        if (participants.includes(rider + '+')) {
            // guest aleady added
            buttonText = mePlusText;
        }
    }
    else if (props.reserves.includes(rider)) {
        // member is on reserve list for this ride
        buttonText = leaveReserveText;
    }
    else if (participants.length >= ride.groupSize) {     
        buttonText = reserveText;
    }
    else if (rider === ride.leaderName || props.user.role>1) {
        // can edit your own ride, but not join it
        buttonText = editRideText;
    }
  });

  function checkLogin() {
    if (props.user.role === 0)
    {
        // not logged in, not allowed to see details or join a ride
        Message('You need to sign in to continue')
        emit('logIn');
    }
    detailsActive.value = true;
    emit('viewRoute');
  }
  async function OK2Join(ride : Ride, rider : string) {
    
    const cannotJoin = ", and cannot join more than one ride each day";
    if (ride.leaderName === rider) {
        await Message("You cannot join your own ride!!");
        return false;
    }
    for (const already of props.already) {
      if (already.reservedToDest.length > 0 && already.reservedOnDate == ride.date) {
          await Message("You are aleady reserved for " + already.reservedToDest + cannotJoin);
          return false;
      }
      else if (already.ridingToDest.length > 0 && already.ridingOnDate == ride.date) {
          await Message("You are aleady listed for " + already.ridingToDest + cannotJoin);
          return false;
      }
      else if (already.leadingToDest.length > 0 && already.leadingOnDate == ride.date) {
          await Message("You are aleady leading " + already.leadingToDest + cannotJoin);
          return false;
      }
    }
    return true;
  };

  async function joinRide() {
  
    if (buttonText === editRideText) {
        emit('editRide',ride);
        detailsActive.value = false;
        return;
    }
    if (buttonText === joinText) {
        if (await OK2Join(ride, rider)) {
            await rideData.saveParticipant(ride.rideID, rider, props.dest);
        }
        else return;
    }

    else if (buttonText === reserveText) {
        if (await OK2Join(ride, rider) === true) {
            await rideData.saveReserveParticipant(ride.rideID, rider);
        }
        else return;
    }
    else if (buttonText === meText) {
        await rideData.meParticipant(ride.rideID, rider);
    }
    else if (buttonText === mePlusText) {
        await rideData.mePlusParticipant(ride.rideID, rider);

    }
    else if (buttonText === leaveReserveText) {
        var reserve = '+' + rider;
        await rideData.leaveParticipant(ride.rideID, reserve);
    }
    // force re-render of whole rides list to update participants
    emit("participantsUpdated");

}

async function downloadGpx (route: Route) {
    let gpx: string = route.url;

    if (gpx.length>0) {
        const link = document.createElement('a');
        link.href = 'data:application/gpx+xml;base64,' + Buffer.from(gpx).toString('base64');
        link.download = route.dest + '.gpx';
        link.click();
        URL.revokeObjectURL(link.href);
    }
    else
        await Message('Sorry, no GPX available for this route');
  }
function speedStr() {
    let speeds = rideData.speedsToString(ride.minSpeed,ride.maxSpeed);
    if (speeds =='0') return ''
    return speeds + (props.user.units=='k'?' kph':' mph');
}

</script>

<template>
  <div class="text-center">
    <v-btn size="small" variant='outlined'  color="blue" :prepend-icon="mdiBike" width="100" @click="checkLogin()">
        More...
    </v-btn>
    
      <v-dialog 
        v-if="detailsActive"
        activator="parent"
        width=400
        content-class="details-dialog"
      >
      <v-card :title="props.dest">
        <v-card-text>    {{ ride.description }}   </v-card-text>
        <v-spacer></v-spacer>
        <v-row no-gutters>
            <v-col cols="3"><v-chip class="mt-3">Leader</v-chip></v-col>
            <v-col cols="3"><v-card-text > {{ ride.leaderName }}   </v-card-text></v-col>
            <v-col cols="3"><v-chip v-if="(speedStr().length > 0)" class="mt-3">Speed</v-chip></v-col>
            <v-col cols="3"><v-card-text > {{ speedStr() }}   </v-card-text></v-col>
        </v-row>
        <v-row no-gutters>
            <v-col cols="3" class="mt-n4"><v-chip class="mt-3">Distance</v-chip></v-col>
            <v-col cols="3" class="mt-n4"><v-card-text > {{ Route.distanceStr(props.route,props.user.units) }}   </v-card-text></v-col>
            <v-col cols="3" class="mt-n4"><v-chip v-if="props.route.climbing > 0" class="mt-3">Climbing</v-chip></v-col>
            <v-col cols="3" class="mt-n4"><v-card-text> {{ Route.climbingStr(props.route,props.user.units)  }}   </v-card-text></v-col>
        </v-row>
        <v-row no-gutters>
            <v-col cols="3" class="mt-n4"><v-chip class="mt-3">Meeting at</v-chip></v-col>
            <v-col cols="9" class="mt-n4"><v-card-text> {{ ride.meetingAt + ' @ ' + TimesDates.fromIntTime(ride.time)}}   </v-card-text></v-col>
        </v-row>
        <v-menu activator="#rider-list">
            <v-list>
                <v-list-item
                v-for="(item, index) in participants"
                :key="index"
                :value="index"
                >
                <v-list-item-title>{{ item }}</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
        <v-card-actions>
            <v-btn variant="elevated" color="blue" id="rider-list"  >Rider list</v-btn>
            <v-btn variant="elevated" color="blue" id="join" @click="joinRide()">{{buttonText}}</v-btn>
     
            <v-btn 
                @click.prevent="downloadGpx(props.route)"
                variant="elevated" color="blue" 
                title ="Get this into your PC's download folder so you can load into Garmin etc"
                > Get GPX </v-btn>
            <v-col class="text-right">
                <v-btn variant="outlined" text="OK" color="blue" @click="detailsActive = false"></v-btn>
            </v-col>
        </v-card-actions>
    </v-card>
      </v-dialog>
   
  </div>
</template>
  
<style scoped>
.v-list-item {
  min-height: 10px !important;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
