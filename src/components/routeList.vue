<script setup lang="ts">

import { ref ,onMounted, computed,type Ref } from 'vue'
import { myFetch } from '@/utils/fetch'
import { apiMethods} from '../../../ridehub-server/src/common/apimethods'
import { User } from '../../../ridehub-server/src/common/user'
import { Route } from '../../../ridehub-server/src/common/route'
import { AlertError} from '../utils/alert'
//import { User } from '../utils/user'
//import { Route } from '../utils/route'
import Routes  from '../utils/routes'
import  routeFuncs  from '../utils/routeFuncs'
import { mdiBike } from '@mdi/js'

import { useDisplay } from 'vuetify'

const minRouteLength = ref(0);
const alphaOrder = ref(1);
const maxRouteLength = ref(50);
const routeList= ref() as Ref<Route[]>;
const chosenRoute = ref() as Ref<Route>;
//const menuOpen = ref(true);
const destinationStr = ref() as Ref<string[]>;
const distanceStr = ref() as Ref<string[]>;
const climbingStr = ref() as Ref<string[]>;
const climbingColour = ref() as Ref<string[]>;
const climbingRatio = ref() as Ref<string[]>;

const chooseDistance = ref('s');
const chooseOrder = ref('a');
let alphaReverse = false;
let distanceReverse = false;
let climbingReverse = false;

const props = defineProps<{
  user : User
  // called from the 'all routes' page , not from ride edit
  allRoutes : boolean
}>()

const emit = defineEmits(['showRoute','newRouteList']);
const { mobile } = useDisplay();

onMounted(() => {
  
    destinationStr.value =[] as string[];
    distanceStr.value =   [] as string[];
    climbingStr.value =   [] as string[];
    climbingColour.value =[] as string[];
    climbingRatio.value =[] as string[];
    
    updateList();
    
})
async function updateList(getData : boolean = true)
{
    function DestinationString(dest : string) {
      let str = (dest.length >= 30) ? dest.slice(0, 29) + '...' : dest;
      // reove any silly characters
      //str = str.replace(/[^0-9a-z ]/gi, '');
      return str;
    }
    if (getData) {
      const result = await Routes.getRoutesByDistance([minRouteLength.value,maxRouteLength.value]);
      if (result === null)    throw new Error(`Cannot get routes`);

      routeList.value = Routes.filteredList(minRouteLength.value,maxRouteLength.value,alphaOrder.value);
    }
    routeList.value.forEach((route,index) => {
      if (route.id > 0)
      {
        destinationStr.value[index] = DestinationString(route.dest);
        distanceStr.value[index]    = routeFuncs.distanceStr(route,props.user.units);
        climbingStr.value[index]    = routeFuncs.climbingStr(route,props.user.units);
        climbingColour.value[index] = routeFuncs.climbingColour(route);
        climbingRatio.value[index] =  mobile.value? '' : routeFuncs.climbingRatioStr(route);
        // not alowed by Typescript but this gives three states without defining an enum!
        // @ts-ignore
        route.highlighted = undefined;
      }
    });
    emit('newRouteList',routeList.value);
}



async function viewRoute( index : number, chosen : boolean) {
 
  console.log('viewRoute: chosen? ' + chosen);
  const route = routeList.value[index];
  if (route === null || route === undefined) {
    AlertError('internal problem','Route not found');
    return;
  }
  // if (route.route != null && route.route.length > 100) {
  //   console.log('route gpx aleady in store');
  //   emit('showRoute',route,chosen);
  // }
  // else {
    emit('showRoute',route,chosen,props.allRoutes);

    // const gpxdata  = await myFetch(apiMethods.getGpx, route.id);
    // if (gpxdata != null) {

    //     route.route = gpxdata.route;
    //     emit('showRoute',route,chosen);
    // }
//}
  chosenRoute.value = route;
}

// async function routeChosen(index : number)
// {   
//     await viewRoute(index);
//     if (chosenRoute.value != null) {
//        emit("routeChosen",chosenRoute.value);
//     }
// }

function changeDistance(min: number,max: number)
{
    minRouteLength.value = min;
    maxRouteLength.value = max;
    routeList.value = Routes.filteredList(min,max,alphaOrder.value,distanceReverse);
    updateList();
    distanceReverse = !distanceReverse;
    emit('newRouteList',routeList.value);
}
function changeOrder(alpha: number) {
    alphaOrder.value = alpha;
    routeList.value = Routes.filteredList(minRouteLength.value,maxRouteLength.value,alphaOrder.value,alphaReverse);
    updateList(false);
    alphaReverse = !alphaReverse;
    emit('newRouteList',routeList.value);
}
const listHeight= computed(() => {
  return mobile.value ? '25vh':'70vh';
})
</script>

<template>
  <v-container  class="pa-0" >

        <v-row no-gutters>
          <v-col cols="3" class="ml-n2 mr-n2 mt-n2"><v-chip color="blue">Distance </v-chip></v-col>
          <v-col cols="9" class="ma-n3">
            <v-radio-group inline v-model="chooseDistance">
                <v-radio label="Short" value="s" @click="changeDistance(0,50)"></v-radio>
                <v-radio label="Medium" value="m" @click="changeDistance(50,75)"></v-radio>
                <v-radio label="Long" value="l" @click="changeDistance(75,999)"></v-radio>
            </v-radio-group>
          </v-col>
        </v-row>

        <v-row no-gutters>
          <v-col cols="3" class="ml-n2 mr-n2 mt-n2"><v-chip color="blue">Order by</v-chip></v-col> 
          <v-col cols="9" class="ma-n3">
            <v-radio-group inline v-model="chooseOrder">
                <v-radio label="ABC" value="a" @click="changeOrder(1)"></v-radio>
                <v-radio label="Length" value="d" @click="changeOrder(2)"></v-radio>
                <v-radio label="Climbs" value="c" @click="changeOrder(3)"></v-radio>
            </v-radio-group>
          </v-col>
        </v-row>

        <v-row no-gutters>
        <v-col cols="12" class="ml-n2 mr-n2 mt-n2">
          <v-chip color="blue"
            >Click text to show map, click bike to select for your ride</v-chip
          >
        </v-col>
      </v-row>

          <v-list density="compact"  :height="listHeight">
            <!-- <v-list density="compact"  style="height: 50vh;"> -->
            <v-list-item class="pa-0" density="compact" 
                v-for="(item, i) in routeList" :key="i"  :value="i" :active="item === chosenRoute">
                    <v-row  no-gutters    >
                        <v-col cols="7" @click.prevent="viewRoute(i,false)"> <span class="d-block text-truncate">{{ destinationStr[i] }} </span>    </v-col>
                        <v-col cols="4" @click.prevent="viewRoute(i,false)" title="distance, climbing, climb ratio (metres climb per km riding)">
                           <small>{{ distanceStr[i] }}&nbsp;
                            <span v-bind:style="{'color': climbingColour[i]}"><b>&uarr;&darr;</b>{{ climbingStr[i] }}&nbsp; <b>{{ climbingRatio[i] }}</b></span>
                             </small>
                          </v-col>
                          <v-col cols="1">
                            <v-btn size="x-small" height="20" :icon="mdiBike" @click.prevent="viewRoute(i,true)" ></v-btn>
                          </v-col>
                        <!-- <v-col cols="2" title="climbing"> <small v-bind:style="{'color': climbingColour[i]}"><b>&uarr;&darr;</b>{{ climbingStr[i] }}</small></v-col>
                        <v-col cols="1" title="climb ratio: metres climb per km riding"><small v-bind:style="{'color': climbingColour[i]}"> {{ climbingRatio[i] }}</small></v-col> -->
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