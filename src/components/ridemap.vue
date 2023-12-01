
<script setup lang="ts">
import {  ref, watch,onMounted,onBeforeUnmount, onUpdated, type Ref} from 'vue'
import type { Map } from 'leaflet';
import "leaflet/dist/leaflet.css";
import * as L from 'leaflet';
import 'leaflet-gpx';

import 'leaflet-polylineDecorator';
import { myFetch } from '@/utils/fetch'
import { apiMethods } from '../../../ridehub-server/src/common/apimethods'
import { Ride } from '../../../ridehub-server/src/common/ride'
import { Route} from '../../../ridehub-server/src/common/route'
import { TimesDates} from '../../../ridehub-server/src/common/timesdates'
import { User } from '../../../ridehub-server/src/common/user'
import Profile from './profile.vue'
import { Tabs } from '../utils/tabs'
import bikeMarker from '../assets/bike2.png';
import Routes  from '@/utils/routes'
import { mdiRoutes} from '@mdi/js'
import type { LatLngExpression } from 'leaflet';
import type { LineString, MultiLineString } from 'geojson';

const props = defineProps<{
  routes : Route[]
  currentRoute : Route
  // showProfile : boolean
  //tab : Tabs
  user : User
  map : Map | null
}>()

const emit = defineEmits(['defineMap','updateRouteInfo']);

var map: Map | null = null;
const mapMessage = ref('');
const gpxLinkText = ref('no link available');
const gpxLink = ref('');
const downloadName = ref('');
const gpx = ref() as Ref<L.GPX>;
let marker : L.Marker;
let mapTitle: L.Layer | ({ onAdd: () => HTMLDivElement; } & L.Control) | null;
let mapKey = 0;
let latlngs = ref() as Ref<L.LatLng[] | L.LatLng[][] | L.LatLng[][][]>;
let routeLine: L.Polyline<LineString, any>;
let numOfRoutes = 0;
let bounds: L.LatLngBounds;
let mapItems : L.Layer[] = [];
let showProfile = false;

function setupMap() {
    if (map != null) {
        map.off();
        map.remove();
    }
    latlngs.value = [];

    //console.log('map: ' + (props.route.dest.length>2 ? props.route.dest : 'General' ))
        map = L.map('mapContainer', {
          center: [50.19,-5.05],    // or centre of cornwall?
          zoom:     9.5,
          zoomControl: false 
        });
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(map);

        // add a title to the map, on the map itself.
        // code from here https://stackoverflow.com/questions/33767463/overlaying-a-text-box-on-a-leaflet-js-map

        // let textbox   = L.Control.extend({
        //     onAdd: function() {
        //         var text = L.DomUtil.create('div');
        //         text.innerHTML = "<h2>" + mapMessage.value + "</h2>"
        //         return text;
        //         },
        // });
        // new textbox({ position: 'topleft' }).addTo(map);

        emit('defineMap',map);
    window.dispatchEvent(new Event('resize'));
     
}

onMounted(() => {
    map = props.map;
    // if (map === null)
    // return;
    setupMap();

    // var bounds = [[50.1, -5.4], [50.3, - 4.8]];  // most of Cornwall
    // map.fitBounds(bounds);
    
})
onBeforeUnmount(() => {
        if (map) {
          map.remove();
        }
})

function updateRoutes() {
    // if (map) 
    //       map.remove();
    //setupMap();
    if (mapTitle != null) {
         mapTitle.remove()
    }
    mapItems.forEach((item) => {
        item.remove();
    });
    mapItems = [];

    numOfRoutes = props.routes.length;
   let index = 0;
    for (const route of  props.routes) {
        if (route.hasGPX)
            showRoute(route,numOfRoutes,index++);
    }
}
watch(() => props.routes,  () => {
  console.log('ridemap: route list changed');
  updateRoutes();
  }
)

watch(() => props.currentRoute,  () => {

    console.log('ridemap: current route changed');
    updateRoutes();
  }
)
/**
 * increase map bounds to accommodate latest track
 * @param bounds 
 */
function adjustBounds(newBounds: L.LatLngBounds) {
    if (bounds === undefined)
        bounds = newBounds;
    else if (newBounds.overlaps(bounds))
    // don't expand to show routes not starting in Truro
        bounds.extend(newBounds);

}
function routeColour(index: number) {
    // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
    // Adam Cole, 2011-Sept-14
    // https://stackoverflow.com/questions/1484506/random-color-generator
    
    var r=0, g=0, b=0;
    var h = index / numOfRoutes;
    var i = ~~(h * 6);
    var f = h * 6 - i;
    var q = 1 - f;
    switch (i % 6) {
        case 0: r = 1; g = f; b = 0; break;
        case 1: r = q; g = 1; b = 0; break;
        case 2: r = 0; g = 1; b = f; break;
        case 3: r = 0; g = q; b = 1; break;
        case 4: r = f; g = 0; b = 1; break;
        case 5: r = 1; g = 0; b = q; break;
    }
    var c = "#" + ("00" + (~ ~(r * 200)).toString(16)).slice(-2) + ("00" + (~ ~(g * 200)).toString(16)).slice(-2) + ("00" + (~ ~(b * 200)).toString(16)).slice(-2);

    return c;
}

function showRoute(route : Route , numOfRoutes: number, index: number)
{
    if (route.miniroute === '')
        return;
    if (map === null)
    {
        //mapMessage.value = "leaflet: map load error";
        return;
    }
// listedRoute is true only if the route has already been added to the list of routes
    const listedRoute  : boolean = (route.id>0);
    let colour = routeColour(index);
    let lineOpacity = 0.4;

    if (props.currentRoute.id > 0) {
        if (  props.currentRoute.id === route.id) {
          lineOpacity = 1;
          colour = '#000000' ; // black
          mapMessage.value = props.currentRoute.dest;
        }
        // else {
        //    colour = '#808080';  // grey?
        //    lineOpacity = 0.5;
        // }
    }

    mapItems.push(new L.GPX(route.miniroute, {
        async: true,
        polyline_options: {
                color: colour,
                opacity: lineOpacity,
                weight: 3
        },
        marker_options: {
            startIconUrl: '',
            endIconUrl: '',
            shadowUrl: ''
        }
    }).on('addline', function (e) {
        if (map === null)    {    return;   }
        routeLine = e.line;
        //console.log('add line: ' + route.id)
        if (lineOpacity == 1) {
            // add a title to the map, on the map itself.
            // code from here https://stackoverflow.com/questions/33767463/overlaying-a-text-box-on-a-leaflet-js-map
            let textbox   = L.Control.extend({
                onAdd: function() {
                    var text = L.DomUtil.create('div');
                    text.innerHTML = "<h2>" + mapMessage.value + "</h2>"
                    return text;
                    },
            });
            // let gpxButton   = L.Control.extend({
            //     onAdd: function() {
            //         var text = L.DomUtil.create('div');
            //         text.innerHTML = "<button onclick='getGPX()'>" + mapMessage.value + "</button>"
            //         return text;
            //         },
            // });
            mapTitle = new textbox({ position: 'topleft' }).addTo(map);
            //let mapButton = new gpxButton({ position: 'topleft' }).addTo(map);
            mapItems.push( L.polylineDecorator(routeLine, {
                patterns: [{
                    offset: 50,
                    repeat: 50,
                    symbol: L.Symbol.arrowHead({
                        pixelSize: 10,
                        polygon: false,
                        pathOptions: { stroke: true, color: colour, }
                    })
                }]
            }).addTo(map));
            latlngs.value = routeLine.getLatLngs();
            showProfile = true;
        }
        else {
            showProfile = false;
        }
        

    }).on('loaded', async function (e) {

        if (map === null)    {    return;   }

        gpx.value = e.target;
        adjustBounds(gpx.value.getBounds());
        if (index >= numOfRoutes-1)
            map.fitBounds(bounds);

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
                await myFetch(apiMethods.updateRoute, route);
        }
    
    }).addTo(map)
    );
  }    

  function getGPX()
  {
    console.log('gpx button')
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
             @click="Routes.downloadGpx(props.currentRoute)" >Get GPX</v-btn>
        </v-col>
        <v-col cols="11" class="pa-0 ma-0">
            <Profile v-if="gpx != undefined && showProfile" 
                :gpx ="gpx"
                :latlngs = "latlngs"
                :user = "props.user"
                @latlng = "updateMarker"
            ></Profile>
        </v-col>
    </v-row>
</template>
<style>
#mapContainer { height: 75vh; }
</style>