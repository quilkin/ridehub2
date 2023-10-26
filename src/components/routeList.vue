<script setup lang="ts">

import { ref , onMounted, type Ref } from 'vue'
import { apiMethods, myFetch } from '../utils/fetch'
import { AlertError} from '../utils/alert'
import { User } from '../utils/user'
import { Route } from '../utils/route'
import Routes  from '../utils/routes'

const minRouteLength = ref(0);
const alphaOrder = ref(1);
const maxRouteLength = ref(50);
const emit = defineEmits(['showRoute','routeChosen']);
const routeList= ref() as Ref<Route[]>;
const chosenRoute = ref() as Ref<Route>;
const menuOpen = ref(true);
const destinationStr = ref() as Ref<string[]>;
const distanceStr = ref() as Ref<string[]>;
const climbingStr = ref() as Ref<string[]>;
const climbingColour = ref() as Ref<string[]>;
const climbingRatio = ref() as Ref<number[]>;

const chooseDistance = ref('s');
const chooseOrder = ref('a');
let alphaReverse = false;
let distanceReverse = false;
let climbingReverse = false;

const props = defineProps<{
  user : User
}>()

onMounted(() => {
    destinationStr.value =[] as string[];
    distanceStr.value =   [] as string[];
    climbingStr.value =   [] as string[];
    climbingColour.value =[] as string[];
    climbingRatio.value =[] as number[];
    routeList.value = Routes.filteredList(minRouteLength.value,maxRouteLength.value,alphaOrder.value);
    updateList();
    
})
function updateList()
{
    routeList.value.forEach((route,index) => {
      if (route.id > 0)
      {
        destinationStr.value[index] = DestinationString(route.dest);
       // distanceStr.value[index]    = Routes.distanceStr(route,props.user.units);
        distanceStr.value[index]    = Route.distanceStr(route,props.user.units);
        climbingStr.value[index]    = Route.climbingStr(route,props.user.units);
        climbingColour.value[index] = Route.climbingColour(route);
        climbingRatio.value[index] = Route.climbingRatio(route);
      }
    });
}

function DestinationString(dest : string) {
  return (dest.length >= 30) ? dest.slice(0, 29) + '...' : dest;
}

async function viewRoute( index : number) {
 
  const route = routeList.value[index];
  if (route === null || route === undefined) {
    AlertError('internal problem','Route not found');
    return;
  }
  if (route.url != null && route.url.length > 100) {
    console.log('route gpx aleady in store');
  }
  else {
    const gpxdata  = await myFetch(apiMethods.getGpx, route.id, true);
    if (gpxdata != null) {

        route.url = gpxdata;
  
    }
  }
  emit('showRoute',route,false);

  chosenRoute.value = route;
}

function routeChosen(index : number)
{   
    viewRoute(index);
    if (chosenRoute.value != null) {
       emit("routeChosen",chosenRoute.value);
        menuOpen.value = false;
    }
}

function changeDistance(min: number,max: number)
{
    minRouteLength.value = min;
    maxRouteLength.value = max;
    routeList.value = Routes.filteredList(min,max,alphaOrder.value,distanceReverse);
    updateList();
    distanceReverse = !distanceReverse;
}
function changeOrder(alpha: number) {
    alphaOrder.value = alpha;
    routeList.value = Routes.filteredList(minRouteLength.value,maxRouteLength.value,alphaOrder.value,alphaReverse);
    updateList();
    alphaReverse = !alphaReverse;
}

</script>

<template>
  <v-container  class="pa-1">

        <v-row no-gutters>  <v-col cols="4"><v-chip color="blue">Route distance </v-chip></v-col>
          <v-col cols="8">
            <v-radio-group inline v-model="chooseDistance">
                <v-radio label="Short" value="s" @click="changeDistance(0,50)"></v-radio>
                <v-radio label="Medium" value="m" @click="changeDistance(50,75)"></v-radio>
                <v-radio label="Long" value="l" @click="changeDistance(75,999)"></v-radio>
            </v-radio-group>
          </v-col>
        </v-row>

        <v-row no-gutters> <v-col  cols="4" class="mt-n4"><v-chip color="blue">Order routes by</v-chip></v-col> 
          <v-col cols="8" class="mt-n4">
            <v-radio-group inline v-model="chooseOrder">
                <v-radio label="Alpha" value="a" @click="changeOrder(1)"></v-radio>
                <v-radio label="Distance" value="d" @click="changeOrder(2)"></v-radio>
                <v-radio label="Climbs" value="c" @click="changeOrder(3)"></v-radio>
            </v-radio-group>
          </v-col>
        </v-row>

        <v-row no-gutters>
        <v-col cols="12" class="mt-n4">
          <v-chip color="blue"
            >Click route to show map, dble-click/hold to select for your ride</v-chip
          >
        </v-col>
      </v-row>

          <v-list density="compact"  >
            <v-list-item class="pa-0" density="compact" 
                v-for="(item, i) in routeList" :key="i"  :value="i" :active="item === chosenRoute">
                    <v-row  no-gutters  @click="viewRoute(i)"  @hold="routeChosen(i)" @dblclick="routeChosen(i)">
                        <v-col cols="7"> <span class="d-block text-truncate">{{ destinationStr[i] }} </span>    </v-col>
                        <v-col cols="2" title="distance"> <small>{{ distanceStr[i] }}</small></v-col>
                        <v-col cols="2"   title="climbing"> <small v-bind:style="{'color': climbingColour[i]}"><b>&uarr;&darr;</b>{{ climbingStr[i] }}</small></v-col>
                        <v-col cols="1" title="climb ratio: metres climb per km riding"><small v-bind:style="{'color': climbingColour[i]}"> {{ climbingRatio[i] }}</small></v-col>
                    </v-row>
            </v-list-item>
          </v-list>

  </v-container>
</template>

<style scoped>
/* .v-list {
  height: 450px;
  overflow-y: auto;
} */
.v-list-item {
  min-height: 10px !important;
  padding-top: 0;
  padding-bottom: 0;
}
</style>