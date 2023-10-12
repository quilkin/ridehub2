
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
import type { User } from '@/utils/user';
import bikeMarker from '../assets/bike2.png';

const props = defineProps<{
  route : Route
  showProfile : boolean
  tab : string
  user : User
  map : Map | null
}>()

const emit = defineEmits(['defineMap','updateRouteInfo']);

const currentGPX = computed(()=>props.route.url);
var map: Map | null = null;
const mapMessage = ref('no map available');
const gpxLinkText = ref('no link available');
const gpxLink = ref('');
const downloadName = ref('');
let gpx : L.GPX ;
let marker : L.Marker;
let mapKey = 0;

function setupMap() {
    if (map != null) {
        map.off();
        map.remove();
    }
    console.log('map: ' + (props.route.dest.length>2 ? props.route.dest : 'General' ))
        map = L.map('mapContainer', {
          center: [50.18,-5.05],    // or centre of cornwall?
          zoom:     9.5
        });
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(map);

        // add a title to the map, on the map itself.
        // code from here https://stackoverflow.com/questions/33767463/overlaying-a-text-box-on-a-leaflet-js-map
        // worls but not typed correctly.....
        L.Control.textbox = L.Control.extend({
            onAdd: function(map) {
                
            var text = L.DomUtil.create('div');
            text.id = "info_text";
            text.innerHTML = "<strong>" + mapMessage.value + "</strong>"
            return text;
            },

            // onRemove: function(map) {
            //     // Nothing to do here
            // }
        });
        L.control.textbox = function(opts: any) { return new L.Control.textbox(opts);}
        L.control.textbox({ position: 'topleft' }).addTo(map);

        emit('defineMap',map)
        //window.dispatchEvent(new Event('resize'));
     
}

onMounted(() => {
    map = props.map;
    setupMap();
    
    
})
onBeforeUnmount(() => {
        if (map) {
          map.remove();
        }
})

onUpdated(() => {
  const route = props.route;
  if (route.dest == undefined) {
    route.dest = '';
  }
  console.log('updated map: ' + (route.dest.length>2 ? route.dest : 'General' ))
  mapMessage.value = route.dest;
  showRoute(route);
  // force profile to update
  ++mapKey;

})

function showRoute(route : Route )
{
// listedRoute is true only if the route has already been added to the list of routes
    const listedRoute  : boolean = (route.id>0)
    const tab = props.tab;
    setupMap();


window.dispatchEvent(new Event('resize'));

if (route.url === '')
    return;


new L.GPX(route.url, {
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

    // if (props.showProfile) {
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
    // }
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


    // get some details from the GPX to hand back to the app

    if (route.distance === 0 || isNaN(route.distance) || route.dest === '' || (route.climbing === 0 && elev_gain > 0)) {
        route.distance = distance;
        route.dest = name;
        route.climbing = elev_gain;
        emit('updateRouteInfo',route);
        if (listedRoute)
            // also need to update the database
            await myFetch("UpdateRoute", route, true);
    }
    

    gpxLinkText.value = "Get GPX ";

    if (tab !== 'new' && route.id > 0) {
        // add a download link

        gpxLink.value = 'data:application/gpx+xml;base64,' + btoa(route.url);
        downloadName.value = name + '.gpx';
 
    }

    }).addTo(map);


  }    

  var bikeIcon = L.icon({
    iconUrl: bikeMarker,
    iconSize:     [40, 35], 
    shadowSize:   [50, 40], 
    iconAnchor:   [20, 17], 
    shadowAnchor: [4, 2],  
    popupAnchor:  [-3, -7] 
});
  
  function updateMarker(latlng: L.LatLngExpression ) {
    if (map === null)
        return;
    if (marker != null) {
        map.removeLayer(marker);
        
    }

    marker = new L.Marker(latlng, {icon: bikeIcon}).addTo(map);

  }
  function help() {
            var win = window.open("Rides-signup.htm");
            if (win != null)
                win.focus();
            else
               Alert('Help','sorry, help file cannot be found','','error','OK');
    };

</script>

<template>
    <!--     do we need these?    -->
    <!-- <v-chip> {{ mapMessage }}</v-chip>
    <v-btn  density="compact"  
        :href="gpxLink"
        :download="downloadName"
        >
        {{ gpxLinkText }}
    </v-btn>
    <v-btn density="compact"   @click="help()" >
        Help
    </v-btn> -->
    <div id="mapContainer"></div> 
    <Profile v-if="gpx != undefined && props.showProfile" :key="mapKey"
        :gpx = "gpx"
        :tab= "props.tab"
        :user = "props.user"
        @latlng = "updateMarker"
    ></Profile>
</template>
<style>
#mapContainer { height: 60%; }
</style>