
<script setup lang="ts">
import {  ref, watch,onMounted,onBeforeUnmount, onUpdated} from 'vue'
import type { Map } from 'leaflet';
import "leaflet/dist/leaflet.css";
import * as L from 'leaflet';
import 'leaflet-gpx-coords';

import 'leaflet-polylineDecorator';
import { Route } from '../utils/route'
import { myFetch } from '@/utils/fetch'
import { apiMethods } from '../../../ridehub-common'
import Profile from './profile.vue'
import type { User } from '@/utils/user';
import { Tabs } from '../utils/tabs'
import bikeMarker from '../assets/bike2.png';
import Routes  from '@/utils/routes'
import { mdiRoutes} from '@mdi/js'

const props = defineProps<{
  route : Route
  showProfile : boolean
  tab : Tabs
  user : User
  map : Map | null
}>()

const emit = defineEmits(['defineMap','updateRouteInfo']);

//const currentGPX = computed(()=>props.route.url);
var map: Map | null = null;
const mapMessage = ref('');
const gpxLinkText = ref('no link available');
const gpxLink = ref('');
const downloadName = ref('');
//let gpx : L.GPX ;
const gpx : L.GPX = ref();
let marker : L.Marker;
let mapKey = 0;

function setupMap() {
    if (map != null) {
        map.off();
        map.remove();
    }
    //console.log('map: ' + (props.route.dest.length>2 ? props.route.dest : 'General' ))
        map = L.map('mapContainer', {
          center: [50.19,-5.05],    // or centre of cornwall?
          zoom:     9.5
        });
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(map);

        // add a title to the map, on the map itself.
        // code from here https://stackoverflow.com/questions/33767463/overlaying-a-text-box-on-a-leaflet-js-map

        let textbox   = L.Control.extend({
            onAdd: function() {
                var text = L.DomUtil.create('div');
                text.innerHTML = "<h2>" + mapMessage.value + "</h2>"
                return text;
                },
        });
        new textbox({ position: 'topleft' }).addTo(map);

        emit('defineMap',map)
     
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

watch(() => props.route,  () => {
//onUpdated(() => {
  const route = props.route;
  if (route.dest == undefined) {
    route.dest = '';
  }
  console.log('ridemap watch');
  mapMessage.value = route.dest;
  if (route.hasGPX == false)
    mapMessage.value += ': no route available for this ride'
  showRoute(route);
  // force profile to update
  //++mapKey;
  }
)

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

        gpx.value = e.target;

        // add direction arrows to GPX polyline
        L.polylineDecorator(gpx.value .get_coords(), {
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

        //var bounds : L.LatLngBounds = gpx.value .getBounds();
        map.fitBounds(gpx.value.getBounds());

        const distance = Math.floor(gpx.value .get_distance() / 1000);
        const elev_gain = Math.floor(gpx.value .get_elevation_gain());
        //var elev_loss = Math.floor(gpx.value .get_elevation_loss());

        var name = '';

        if (route !== null)
            name = route.dest;
        if (name === '' || listedRoute === false) {
            name = gpx.value .get_name();
        }


        // get some details from the GPX to hand back to the app

        if (route.distance === 0 || isNaN(route.distance) || route.dest === '' || (route.climbing === 0 && elev_gain > 0)) {
            route.distance = distance;
            route.dest = name;
            route.climbing = elev_gain;
            emit('updateRouteInfo',route);
            if (listedRoute)
                // also need to update the database
                await myFetch(apiMethods.updateRoute, route, true);
        }
    
    }).addTo(map);
  }    

  const bikeIcon = L.icon({
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


</script>

<template>
    <div id="mapContainer"></div> 
    <v-row>
        <v-col cols="1" class="mt-10 mb-5">
            <v-btn stacked variant="outlined" color="blue"
            v-if="gpx != undefined" 
            :prepend-icon="mdiRoutes"
             @click="Routes.downloadGpx(props.route)" >Get GPX</v-btn>
        </v-col>
        <v-col cols="11" class="pa-0 ma-0">
            <Profile v-if="gpx != undefined && props.showProfile" 
                :gpx = "gpx"
                :tab= "props.tab"
                :user = "props.user"
                @latlng = "updateMarker"
            ></Profile>
        </v-col>
    </v-row>
</template>
<style>
#mapContainer { height: 75vh; }
</style>