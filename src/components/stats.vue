<script setup lang="ts">

/**
 * Display a  page of statistics, e.g. how many rides have been done by members
 * 
 */
import { ref ,onMounted, computed, onUpdated, watch, type Ref } from 'vue'
import { myFetch } from '@/utils/fetch'
import { apiMethods} from '../../../ridehub-server/src/common/apimethods'
import { rideCount} from '../../../ridehub-server/src/common/participant'
import { User } from '../../../ridehub-server/src/common/user'
import { AlertError} from '../utils/alert'
import { useDisplay } from 'vuetify'
import { TimesDates} from '../../../ridehub-server/src/common/timesdates'

const riderList= ref() as Ref<rideCount[]>;
const leaderList= ref() as Ref<rideCount[]>;
const thisyear = ref(2025);

const props = defineProps<{
  // todo: highight current user in lists
  user : User
}>()

const { mobile } = useDisplay();

onMounted(() => {
    
    updateLists('y2d');
    
})

function ordinal_suffix_of(i: number) {
    let j = i % 10,
        k = i % 100;
    if (j === 1 && k !== 11) { return i + "st";  }
    if (j === 2 && k !== 12) { return i + "nd";  }
    if (j === 3 && k !== 13) { return i + "rd";  }
    return i + "th";
}

async function updateLists(period : string )
{
    let today = new Date();
    thisyear.value = today.getFullYear();
    
    let jan1 =  new Date(thisyear.value,0,1);
    let todate,fromdate;
    if (period == 'y2d') {
      todate = TimesDates.toIntDays(today);
      fromdate = TimesDates.toIntDays(jan1);
    }
    else if (period == '3') {
      todate = TimesDates.toIntDays(today);
      fromdate = todate - 91;
    }
    else // last year
    {
      todate = TimesDates.toIntDays(jan1);
      fromdate = todate-365;
    }

    const res2 : rideCount[] = await myFetch(apiMethods.leaderTrophy,[fromdate,todate]);
    if (res2 === null) 
        return;
    if (res2.length == 0) {
      AlertError('File error','Cannot get results for leaders, sorry');
      return;
    }
    leaderList.value = res2;

    const res1 : rideCount[] = await myFetch(apiMethods.touristTrophy,[fromdate,todate]);
    if (res1 === null) 
        return;
    if (res1.length == 0) {
      AlertError('File error','Cannot get results, sorry');
      return;
    }
    riderList.value = res1;

    // now combine leaders into rider list, as they are not listed as participants
     riderList.value.forEach((rider,riderIndex) => {
        // foreach rider, check through the leader list to see if that rider has led rides
      leaderList.value.forEach((leader,leaderIndex) => {
        if (rider.rider==leader.rider) {
            rider.count += leader.count; 
          }
        }); 
    });
    // now check for leaders that haven't been on any rides except as leaders
    leaderList.value.forEach((leader,leaderIndex) => {
        // foreach leader, check through the rider list to see if that leader exists
        let exists = false;
        riderList.value.forEach((rider,riderIndex) => {
          if (rider.rider === leader.rider)
            exists = true;
          }); 
        if (exists === false)
        {
          riderList.value.push(new rideCount(leader.rider,leader.count));
        }
    });
    // but list will now be out of order....
    riderList.value.sort((a,b)=>b.count-a.count);
    // we only want to show top 20
    // while (riderList.value.length > 20)
    //   riderList.value.pop();

}

const listHeight= computed(() => {
  return mobile.value ? '25vh':'50vh';
})

const choosePeriod = ref('y2d');
function changePeriod(p: string) {
  choosePeriod.value = p;
  updateLists(p);
}
function yearLabel(type: number): string {
  if (type==2)
    return  `${thisyear.value} to date`;
  if (type==1)
    return `Last Year (${thisyear.value-1} )` ;
  return 'Last 3 months';

}

</script>

<template>
  <v-container  class="pa-0" >
      <v-row>
        <v-col cols="12" class="mt-3">TCC Tourist Trophy (and Leader Trophy) covering the period...</v-col>
      </v-row>
      <v-row no-gutters>
        <v-radio-group class="pa-1" inline v-model="choosePeriod">
          <v-radio :label=yearLabel(1)  value="last" @click="changePeriod('last')"></v-radio>
          <v-radio :label=yearLabel(2) value="y2d" @click="changePeriod('y2d')"></v-radio>
          <v-radio :label=yearLabel(3) value="3" @click="changePeriod('3')"></v-radio>
      </v-radio-group>
  </v-row>
    <v-row no-gutters>
      <v-col class="mr 1">
        <v-chip size="large" color="blue">No. of rides by each rider</v-chip>
          <v-list density="compact" :height="listHeight" >
            <v-list-item  density="compact" base-color="blue"
                v-for="(item, i) in riderList" :key="i"  :value="i" :active="true">
                    <v-row     >
                      <v-col cols="2" > <span >{{ordinal_suffix_of(i +1)}} </span>    </v-col>
                        <v-col cols="8" > <span >{{ riderList[i].rider }} </span>    </v-col>
                        <v-col cols="2"  >        {{ riderList[i].count }}                           </v-col>
                    </v-row>
            </v-list-item>
          </v-list>
        </v-col>
        <v-col class="ml-3">
          <v-chip size="large" color="blue">Rides led by each ride leader</v-chip>
          <v-list density="compact"  :height="listHeight" :min-height="listHeight" base-color="blue">
            <v-list-item density="compact" 
                v-for="(item, i) in leaderList" :key="i"  :value="i" :active="true">
                    <v-row   >
                      <v-col cols="2" > <span >{{ordinal_suffix_of(i +1)}} </span>    </v-col>
                        <v-col cols="8" > <span >{{ leaderList[i].rider }} </span>    </v-col>
                        <v-col cols="2" >        {{ leaderList[i].count }}                           </v-col>
                    </v-row>
            </v-list-item>
          </v-list>
        </v-col>
  </v-row>
  </v-container>
</template>

<style scoped>

.v-list-item {
  min-height: 10px !important;
  padding-top: 0;
  padding-bottom: 0;
}
</style>