<script setup lang="ts">

import { ref, type Ref, watch, onMounted, onBeforeMount} from 'vue'
import { gpxRules} from '../utils/rules'
import { mdiRoutes} from '@mdi/js'
import { AlertError } from '../utils/alert'
import { apiMethods } from '../../../ridehub-server/src/common/apimethods'
import { Route } from '../../../ridehub-server/src/common/route'
import { myFetch } from '@/utils/fetch'


const props = defineProps<{
  existingRoute : Route;

}>()

const gpxfiles= ref() as Ref<File[]>;
const emit = defineEmits(['routeChosen','showRoute','chooseRouteFromList','showUploadedRoute']);
const showFileUpload = ref(false);
let routeXML='' ;

// onBeforeMount(() => {
//   console.log('choose Route before mount: ' + props.existingRoute.id);
// })
// onMounted(() => {
//   console.log('choose Route mounted: ' + props.existingRoute.id);
// })
function loadGpx() {
  try {
    const file = gpxfiles.value[0];
    var reader = new FileReader();
    reader.onload = readSuccess;
    reader.readAsText(file);
    showFileUpload.value = false;
  } catch (error) {
    
  }

   
}

async function readSuccess(event: ProgressEvent<FileReader>) {
  if (event.target === null) {
    AlertError('File error','Cannot read file');
          return;
  }
  if (typeof event.target.result !== "string") {
    AlertError('File error','File contents have incorrect type');
          return;
  }
  routeXML = event.target.result;

  var oParser = new DOMParser();
  var oDOM = oParser.parseFromString(routeXML, "text/xml");
  if (oDOM.documentElement.nodeName === "parsererror") {
          AlertError('File error','File does not appear to be valid GPX or TCX');
          return;
  }
  if (routeXML.includes("TrainingCenterDatabase")) {
    // tcx needs converting to gpx
    const res = await myFetch(apiMethods.tcx2gpx,routeXML);
    if (res === null) 
        return;
    if (res.length > 0) {
      routeXML = res;
    }
    else {
      AlertError('File error','Error converting from TCX to GPX');
    }
  }
  let newRoute = new Route();
  //const route = new Route();
  newRoute.hasGPX = true;
  newRoute.route = routeXML;

  emit('showUploadedRoute',newRoute);
  watch(() => newRoute.distance, (first,second) => {
    // wait for emit to finish (map will update and find data from gpx) then update the distance etc
    emit('routeChosen',newRoute)

  })
  
}

</script>

<template>
    <v-card  class="pa-3">

        <v-row >
            <v-card-text v-if="props.existingRoute.id===0">
               A ride could do with a route of some sort. So, please choose one of the following:
            </v-card-text>

            <v-btn v-else block  class="pa-2 ma-1" color="blue" 
                @click="emit('routeChosen',props.existingRoute)"  
                >
                Edit ride details without changing your route </v-btn>

            <v-btn block  class="pa-2 ma-1" color="blue" variant="outlined"
                @click="emit('chooseRouteFromList')"  
                >
                Use an existing route from the RideHub list (there's over 100 of them!)</v-btn>
               
            <v-btn block class="pa-2 ma-1" color="blue" variant="outlined"
                 @click="showFileUpload=true"
                 >
                 Upload a new GPX route that you have created or found elsewhere</v-btn>
                
                 <v-row v-if="showFileUpload">
              <v-col cols="8" class="mt-6" >
                  <v-file-input v-model="gpxfiles"  density="compact" variant="outlined"
                      accept=".gpx,.tcx"
                      label="Find GPX or TCX file"
                      :prepend-icon="mdiRoutes"
                      :rules="gpxRules"
                  ></v-file-input> 
              </v-col>
              <v-col cols = "4" class="mt-6" >
                  <v-btn
                   color="blue" class="ma-2"  variant="outlined" @click="loadGpx"
                   title="Please ensure that file name is correct, it cannot be edited later"
                   >Load into RideHub</v-btn>
              </v-col>
            </v-row>

            <v-btn block class="pa-2 ma-1" color="blue" variant="outlined"
                @click="emit('routeChosen',props.existingRoute)"
                >  
                Have a simple ride to somewhere, with no defined route</v-btn>
            <v-card-text v-if="props.existingRoute.id===0">
               Or.....:
            </v-card-text>
            <v-btn block class="pa-2 ma-1" color="darkblue" variant="outlined"
                @click="props.existingRoute.distance=0; emit('routeChosen',props.existingRoute)"
                >  
                List another type of event</v-btn>
            
          </v-row>
    </v-card>
</template>