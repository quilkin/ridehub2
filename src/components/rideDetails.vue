<script setup lang="ts">
  import { ref , onMounted, onBeforeMount} from 'vue'
  import { Ride } from '../utils/ride'
  import { User } from '../utils/user'
  import { Message } from '../utils/alert'
  import { Already} from '../utils/already'
  import rideData  from '../utils/ridedata'

  const props = defineProps<{ 
    ride : Ride ,
    participants : string[],
    reserves: string[],
    user: User,
    dest : string,
    already : Already[]
    }>();

  const emit = defineEmits(['logIn','detailsDone','detailsUpdated','editRide']);
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
    else if (rider === ride.leaderName) {
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
  
    if (buttonText === joinText) {
        if (await OK2Join(ride, rider)) {
            await rideData.saveParticipant(ride.rideID, rider, props.dest);
        }
    }
    else if (buttonText === editRideText) {
        emit('editRide',ride);
    }
    else if (buttonText === reserveText) {
        if (await OK2Join(ride, rider) === true) {
            await rideData.saveReserveParticipant(ride.rideID, rider);
        }
    }
    else if (buttonText === meText) {
        await rideData.meParticipant(ride.rideID, rider);
    }
    else if (buttonText === mePlusText) {
        await rideData.mePlusParticipant(ride.rideID, rider);

    }
    else if (buttonText === leaveReserveText) {
        var reserve = '+' + rider;
        rideData.leaveParticipant(ride.rideID, reserve);
    }
    // force re-render of whole rides list
    emit("detailsUpdated");

}

  // function detailsDone() {
  //   detailsActive.value = false;
  //   emit("detailsDone");
  // }


</script>

<template>
  <div class="text-center">
    <v-btn size="small" variant='tonal' prepend-icon="mdi-bike" width="150" @click="checkLogin()">
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
        <v-card-text>   Leader: {{ ride.leaderName }}   </v-card-text>
        <v-spacer></v-spacer>
        <v-card-text>   Meeting at: {{ ride.meetingAt }}   </v-card-text>

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
            <v-btn variant="outlined" id="rider-list" color="primary" >Rider list</v-btn>
            <v-btn variant="outlined" id="join" color="primary" @click="joinRide()">{{buttonText}}</v-btn>
            <v-btn variant="outlined" text="OK" color="blue" @click="detailsActive = false"></v-btn>
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
