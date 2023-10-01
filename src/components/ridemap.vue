
<script setup lang="ts">
import {  ref, computed,onMounted,onBeforeUnmount, onUpdated} from 'vue'
import type { Map } from 'leaflet';
import "leaflet/dist/leaflet.css";
import * as L from 'leaflet';
import 'leaflet-gpx-coords';

import 'leaflet-polylineDecorator';
import { Route } from '../utils/route'
import { Alert} from '../utils/alert'
import { myFetch } from '../utils/fetch'
import type { LeafletEvent } from 'leaflet';
import Profile from './profile.vue'
import  bartest  from './bartest.vue'
import type { User } from '@/utils/user';


const props = defineProps<{
  route : Route
  tab : string
  user : User
}>()

const currentGPX = computed(()=>props.route.url);
var map: Map | null = null;
const mapMessage = ref('no map available');
const gpxLinkText = ref('no link available');
const gpxLink = ref('');
const downloadName = ref('');
let gpx : L.GPX;
let marker : L.Marker;

//function get_latlngs(gpx :LeafletEvent["target"]) { return gpx._info.latlngs; }



onMounted(() => {
    console.log('map: ' + (props.route.dest.length>2 ? props.route.dest : 'General' ))
        map = L.map('mapContainer', {
          center: [50,-5],    // or centre of cornwall?
          zoom:     10
        });
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
          }).addTo(map);
          //window.dispatchEvent(new Event('resize'));
     
    
})
onBeforeUnmount(() => {
        if (map) {
          map.remove();
        }
})

onUpdated(() => {
  const route = props.route;
  console.log('updated map: ' + (route.dest.length>2 ? route.dest : 'General' ))
  mapMessage.value = route.dest;
  showRoute(route, true);

})

function showRoute(route : Route, listedRoute  : boolean)
{
// listedRoute is true only if the route has already been added to the list of routes

    const tab = props.tab;

if (map !== null) { map.remove(); }

map = L.map('mapContainer', {
          zoom:     10
        });
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.osm.org">OpenStreetMap</a>'
}).addTo(map);
window.dispatchEvent(new Event('resize'));


var pl = new L.GPX(route.url, {
    async: true,
    marker_options: {
        startIconUrl: '',
        endIconUrl: '',
        shadowUrl: ''
    }


}).on('loaded', async function (e) {

    if (map === null)
    {
        mapMessage.value = "leaflet: map load error";
        return;
    }

    gpx = e.target;

    // no type info for my added method as yet
    const coords = gpx.get_coords();

    // add direction arrows to GPX polyline
    L.polylineDecorator(coords, {
        patterns: [{
            offset: 50,
            repeat: 50,
            symbol: L.Symbol.arrowHead({
                pixelSize: 10,
                polygon: false,
                pathOptions: { stroke: true, color: 'blue', }
            })
        }]
    }).addTo(map);
    var bounds : L.LatLngBounds = gpx.getBounds();
    map.fitBounds(bounds);

    var distance = Math.floor(gpx.get_distance() / 1000);
    var elev_gain = Math.floor(gpx.get_elevation_gain());
    var elev_loss = Math.floor(gpx.get_elevation_loss());

    var name = '';

    if (route !== null)
        name = route.dest;
    if (name === '' || listedRoute === false) {
        name = gpx.get_name();
    }

    if (listedRoute === true) {
        // get some details from the GPX to hand back to the app
  
        if (route.distance === 0 || isNaN(route.distance) || route.dest === '' || (route.climbing === 0 && elev_gain > 0)) {
            route.distance = distance;
            route.dest = name;
            route.climbing = elev_gain;
            await myFetch("UpdateRoute", route, true);
        }
    }

    gpxLinkText.value = "Get GPX ";

    if (tab !== 'new' && route.id > 0) {
        // add a download link

        gpxLink.value = 'data:application/gpx+xml;base64,' + btoa(route.url);
        downloadName.value = name + '.gpx';

// todo: later *********************

        // if (tab === 'routes-tab') {
        //     var b = document.createElement('a');
        //     linkText = document.createTextNode("Lead Ride");
        //     b.setAttribute('class', "btn btn-lifted  btn-info btn-sm btn-responsive");
        //     b.appendChild(linkText);
        //     b.title = "Lead a ride based on this route";
        //     b.onclick = function () {
        //         login.Then(function () {
        //             rideData.switchingFromLeadRide = true;
        //             // move to different tab
        //             rideData.setCurrentTab('setup-tab');
        //             $('#setup-tab').tab('show');
        //             $('#uploadRoute').hide();
        //             $('#manualRoute').hide();
        //             $('#existingRoute').hide();

        //             setTimeout(function () {
        //                 // no idea why this is needed, but map does not show correctly if not used
        //                 TCCMap.showRoute();
        //                 Ride.leadRide();
        //             }, 1000);

        //         });
 
        //     };

        //     _t('h4').appendChild(b);
        //  }

  
    }

    }).addTo(map);


  }    
  
  function updateMarker(latlng: L.LatLngExpression ) {
    if (map === null)
        return;
    if (marker != null) {
        map.removeLayer(marker);
        
    }
    marker = new L.Marker(latlng).addTo(map);

  }
  function help() {
   // ++helpClicks.clicks;
            var win = window.open("Rides-signup.htm");
            if (win != null)
                win.focus();
            else
               Alert('Help','sorry, help file cannot be found','','error','OK');
    };

</script>

<template>
    <v-chip> {{ mapMessage }}</v-chip>
    <v-btn  density="compact"  
        :href="gpxLink"
        :download="downloadName"
        >
        {{ gpxLinkText }}
    </v-btn>
    <v-btn density="compact"   @click="help()" >
        Help
    </v-btn>
    <div id="mapContainer"></div> 
    <Profile v-if="gpx != undefined"
        :gpx = "gpx"
        :tab= "props.tab"
        :user = "props.user"
        @latlng = "updateMarker"
    ></Profile>
</template>
<style>
#mapContainer { height: 60%; }
</style>