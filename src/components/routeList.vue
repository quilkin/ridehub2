<script setup lang="ts">

import { ref , watch, type Ref } from 'vue'
import { myFetch } from '../utils/fetch'
import  { Alert} from '../utils/alert'
import { User } from '../utils/user'
import { Route } from '../utils/route'
import Routes  from '../utils/routes'

const minRouteLength = ref(0);
const alphaOrder = ref(true);
const maxRouteLength = ref(999);
const emit = defineEmits(['showRoute']);
const routeList= ref() as Ref<Route[]>;
//const hover = ref() as Ref<boolean[]>;
//const hover= ref(false);

const props = defineProps<{
  user : User
}>()

// watch(hover, (hover, prevCount) => {
//   console.log('hover')
// })

function DestinationString(dest : string) {
  return (dest.length > 30) ? dest.slice(0, 29) + '...' : dest;
}
function RouteDetail(route : Route) {
  var distance = 0;
  var climbingStr = '';
  if (route.distance !== undefined) {
      distance = route.distance;
  }
  if (distance === 0)
      return '?';
  var distUnits = ' km ';
  if (props.user.units === 'm') {
      distUnits = ' miles ';
      distance = Math.round(distance * 0.62137);
  }
  if (props.user.climbs > 0) {
        if (route.climbing !== undefined) {
            let climbing = route.climbing;
            if (climbing > 0)
            {
              var style = '<span style="color:orange; ';
              var climbRatio = climbing / route.distance;
              if (climbRatio < 12)
                  style = '<span style="color:green; ';
              else if (climbRatio > 17)
                  style = '<span style="color:red; ';

              var heightUnits = 'metres';
              if (props.user.units === 'm') {
                heightUnits = 'feet';
                climbing = Math.round(climbing * 3.3);
              }
              climbingStr = style + 'font-weight: bold">&uarr;&darr;' + climbing + heightUnits + '</span>';
            }
          }
        }
        return distance.toString() + distUnits + ' ' + climbingStr;

}
async function viewRoute( index : number) {
 
  const route = routeList.value[index];
  if (route === null) {
    Alert('internal problem','Route not found','','error','OK');
    return;
  }
  if (route.url != null && route.url.length > 100) {
    console.log('route gpx aleady in store');
  }
  else {
    const gpxdata  = await myFetch("GetGPXforRoute", route.id, true);
    if (gpxdata != null) {

        route.url = gpxdata;
  
    }
  }
  emit('showRoute',route,false);
}
function changeDistance(min: number,max: number)
{
    minRouteLength.value = min;
    maxRouteLength.value = max;
    routeList.value = Routes.filteredList(min,max,alphaOrder.value);
}
function changeOrder(alpha: boolean) {
    alphaOrder.value = alpha;
    routeList.value = Routes.filteredList(minRouteLength.value,maxRouteLength.value,alphaOrder.value);
}

</script>

<template>
    <v-menu :close-on-content-click='false'>
        <v-list density="compact" min-width="480" >
            <v-list-subheader >Choose route distance and sorting order:</v-list-subheader>
                <v-list-item>
                    <v-row  no-gutters>
                        <v-col>
                            <v-chip   @click="changeDistance(0,50)">Short </v-chip>
                            <v-chip   @click="changeDistance(50,75)">Medium </v-chip>
                            <v-chip   @click="changeDistance(75,999)">Long </v-chip>
                        </v-col>
                        <v-col class="text-right">
                            <v-chip   @click="changeOrder(true)">Alphabetic</v-chip>
                            <v-chip   @click="changeOrder(false)">Distance</v-chip>
                        </v-col>
                    </v-row>
                </v-list-item>
      
            <v-list-subheader >Click to show route, double-click to select:</v-list-subheader>

            
            <v-list-item density="compact" 
                v-for="(item, i) in routeList" :key="i"  :value="i">
                
                    <v-row  no-gutters>
                        <v-col cols="7" >
                            <!-- <v-hover  v-model="hover"> -->
                            <v-btn variant='outlined' density="compact"  @click="viewRoute(i)" >
                                <span class="text-truncate" style="max-width:200px" >{{ DestinationString(item.dest) }}</span>
                            </v-btn>
                        <!-- </v-hover> -->
                        </v-col>
                        <v-col cols="5"><div v-html="RouteDetail(item)"></div></v-col>
                    </v-row>
              
            </v-list-item>
 
        </v-list>
    </v-menu>
</template>

<style scoped>
.v-list-item {
  min-height: 10px !important;
  padding-top: 0;
  padding-bottom: 0;
}
</style>