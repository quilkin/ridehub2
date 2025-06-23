<script setup lang="ts">
  import { ref , onMounted, onBeforeMount} from 'vue'
  //import { Ride  } from '../../../ridehub-common'
  import { Ride } from '../../../ridehub-server/src/common/ride'
  import { Route} from '../../../ridehub-server/src/common/route'
  import { TimesDates} from '../../../ridehub-server/src/common/timesdates'
  import { User, Roles } from '../../../ridehub-server/src/common/user'
  //import { User } from '../utils/user'
  import { Message } from '../utils/alert'
  import { Already} from '../utils/already'
  import rideData  from '../utils/ridedata'
  import routeFuncs  from '../utils/routeFuncs'
  //import { Route } from '@/utils/route'
  import Routes  from '../utils/routes'
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
  //const editRideText = 'Edit/Cancel';
  let buttonText = joinText;
  let spacesLeft = 0;
  let numberOfRiders = 0;

  onMounted(() => {
    participants.unshift(ride.leaderName);
    numberOfRiders = participants.length;
   // participants.push('Leader: ' + ride.leaderName);
   // spacesLeft = ride.groupSize - numberOfRiders - 1; // allow for ride leader!
    if (props.reserves.length > 0) {
        participants.push(" (full): Reserves: ");
        for (const reserve of props.reserves)
            participants.push(reserve);
    }
    else if (numberOfRiders < 2 ) {
        // i.e. only the leader
        participants.push('No riders (yet)');
    }
    // else {
    //     participants.push(spacesLeft.toString() + ' spaces left')
    // }

    // now decide wether to show 'Join' or 'leave' etc
    if (participants.includes(rider)) {
        // rider is already signed up for this ride
        buttonText = meText;
        if (participants.includes(rider + '+')) {
            // guest aleady added
            buttonText = mePlusText;
        }
    }
    else if (props.reserves.includes('+' + rider)) {
        // member is on reserve list for this ride
        buttonText = leaveReserveText;
    }
    else if (participants.length >= ride.groupSize) {     
        buttonText = reserveText;
    }

  });

  async function checkLogin() {
    if (props.user.role === Roles.None)
    {
        // not logged in, not allowed to see details or join a ride
        await Message('You need to sign in to continue');
        emit('logIn');
    }
    detailsActive.value = true;
    emit('viewRoute');
  }
  async function OK2Join(ride : Ride, rider : string) {
    
    const cannotJoin = ", and cannot join more than one ride each day";
    // if (ride.leaderName === rider && buttonText != reserveText) {
    //     await Message("You cannot join your own ride!!");
    //     return false;
    // }
    for (const already of props.already) {
      if (already.reservedToDest.length > 0 && already.reservedOnDate == ride.date) {
          await Message("You are aleady reserved for " + already.reservedToDest + cannotJoin);
          return false;
      }
      else if (already.ridingToDest.length > 0 && already.ridingOnDate == ride.date) {
          await Message("You are aleady listed for " + already.ridingToDest + cannotJoin);
          return false;
      }
      else if (already.leadingToDest.length > 0 && already.leadingOnDate == ride.date && buttonText != reserveText) {
          await Message("You are aleady leading " + already.leadingToDest + cannotJoin);
          return false;
      }
    }
    return true;
  };

  function editRide() {
        emit('editRide',ride);
        detailsActive.value = false;
  }
  async function removeRider(remove: string) {
    await rideData.leaveParticipant(ride.rideID, remove,rider, props.route.dest);
    emit("participantsUpdated");
  }

  async function joinRide() {
  
    // if (buttonText === editRideText) {
    //     emit('editRide',ride);
    //     detailsActive.value = false;
    //     return;
    // }
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
        await rideData.meParticipant(ride.rideID, rider, ride.leaderName);
    }
    else if (buttonText === mePlusText) {
        await rideData.mePlusParticipant(ride.rideID, rider, ride.leaderName);

    }
    else if (buttonText === leaveReserveText) {
        var reserve = '+' + rider;
        await rideData.leaveParticipant(ride.rideID, reserve);
    }
    // force re-render of whole rides list to update participants
    emit("participantsUpdated");

}

function rideTimePassed() : boolean {
    let now = new Date();
    let rideDate = ride.date;
    let nowDate = TimesDates.toIntDays(now);
    if (nowDate > rideDate)
        return true;
    if (nowDate === rideDate) {
        if (now.getHours() > ride.time / 60)
            return true;
    }
    return false;
}

function speedStr() {
    let speeds = rideData.speedsToString(ride.minSpeed,ride.maxSpeed,props.user.units);
    if (speeds =='') return '';
    return speeds + (props.user.units=='k'?' kph':' mph');
}
function joinStr() {
    if (props.user.name === ride.leaderName)
        return "Edit + more";
    return "Join + more"
}
function riderList() {
    let list ='';
    participants.forEach((p)=> {
        list += p;
        list += ', ';
    })
    list += ' [' + (ride.groupSize - numberOfRiders) + ' spaces left]'
    return list;
}

</script>

<template>
  <div class="text-center">
    <v-btn size="small"  variant='outlined'  color="blue" :prepend-icon="mdiBike" width="110" @click="checkLogin()">
        {{ joinStr()}}
    </v-btn>
    
      <v-dialog 
        
        v-if="detailsActive"
        activator="parent"
        
        content-class="details-dialog"
      >
      <v-card :title="props.dest" max-width="550">
        <v-card-text>    {{ ride.description }}   </v-card-text>
        <v-spacer></v-spacer>
        <v-row no-gutters>
            <v-col cols="3"><v-chip class="mt-3">Leader</v-chip></v-col>
            <v-col cols="3"><v-card-text > {{ ride.leaderName }}   </v-card-text></v-col>
            <v-col cols="3"><v-chip v-if="(speedStr().length > 0)" class="mt-3">Speed</v-chip></v-col>
            <v-col cols="3"><v-card-text > {{ speedStr() }}   </v-card-text></v-col>
        </v-row>
        <v-row no-gutters v-if="props.route.distance > 0" >
            <v-col cols="3" class="mt-n4"><v-chip class="mt-3">Distance</v-chip></v-col>
            <v-col cols="3" class="mt-n4"><v-card-text > {{ routeFuncs.distanceStr(props.route,props.user.units) }}   </v-card-text></v-col>
            <v-col cols="3" class="mt-n4"><v-chip v-if="props.route.climbing > 0" class="mt-3">Climbing</v-chip></v-col>
            <v-col cols="3" class="mt-n4"><v-card-text> {{ routeFuncs.climbingStr(props.route,props.user.units)  }}   </v-card-text></v-col>
        </v-row>
        <v-row no-gutters>
            <v-col cols="3" class="mt-n4"><v-chip class="mt-3">Meeting at</v-chip></v-col>
            <v-col cols="9" class="mt-n4"><v-card-text> {{ ride.meetingAt + ' @ ' + TimesDates.fromIntTime(ride.time)}}   </v-card-text></v-col>
        </v-row>
        <v-row no-gutters>
            <v-col cols="3" class="mt-n4"><v-chip class="mt-3">{{props.route.distance > 0? 'Riders':'Participants'  }}</v-chip></v-col>
            <!-- <v-col cols="9" class="mt-n4"><v-card-text> {{ ride.groupSize + ' riders: (' + (ride.groupSize - numberOfRiders - 1) + ' spaces left)'}}   </v-card-text></v-col> -->
            <v-col cols="9" class="mt-n4"><v-card-text> {{ riderList()}}   </v-card-text></v-col>
        </v-row>


        <v-card-actions>
            <v-btn v-if="((rider === ride.leaderName || props.user.role>Roles.Rider) && rideTimePassed()==false)"
                variant="elevated" color="blue" id="edit" @click="editRide()"
                > Edit/Cancel</v-btn>
            <v-btn v-if="((rider === ride.leaderName || props.user.role>Roles.Rider) && rideTimePassed())"
                variant="elevated" color="blue" id="edit"
                > Remove rider
                <v-menu activator="parent">
                    <v-list>
                        <v-list-item
                            v-for="(pp, index) in participants"
                            :key="index"
                            :value="index"
                            @click="removeRider(pp)"
                        >
                            <v-list-item-title>{{ pp }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-btn>

            <v-btn v-if="(rideTimePassed()==false)" variant="elevated" color="blue" id="join" @click="joinRide()">{{buttonText}}</v-btn>
            <v-btn 
                @click.prevent="Routes.downloadGpx(props.route)"
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
