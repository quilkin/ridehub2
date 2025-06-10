
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
  title : string
  tab : Tabs
  user : User
  map : Map | null
}>()

const emit = defineEmits(['defineMap','updateRouteInfo']);

var map: Map | null = null;
const mapMessage = ref(props.title);
const gpxLinkText = ref('no link available');
const gpxLink = ref('');
const downloadName = ref('');
const gpx = ref() as Ref<L.GPX>;
let marker : L.Marker;
let mapKey = 0;
let latlngs = ref() as Ref<L.LatLng[] | L.LatLng[][] | L.LatLng[][][]>;
let routeLine: L.Polyline<LineString, any>;
let numOfRoutes = 1;


function setupMap() {
    if (map != null) {
        map.off();
        map.remove();
    }
    //console.log('map: ' + (props.route.dest.length>2 ? props.route.dest : 'General' ))
        map = L.map('multiContainer', {
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
        numOfRoutes = routes.length;
        $.each(routes, function (index, route) {
            showRoute(index, route);
        });
        // var bounds = [[50.1, -5.4], [50.3, - 4.8]];  // most of Cornwall
        // map.fitBounds(bounds);

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
  //mapMessage.value = route.dest;
//   if (route.hasGPX == false)
//     mapMessage.value += ': no route available for this ride'
  showRoute(route);
  // force profile to update
  //++mapKey;
  }
)

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

function showRoute(route : Route )
{
// listedRoute is true only if the route has already been added to the list of routes
    const listedRoute  : boolean = (route.id>0)
    const tab = props.tab;
    //setupMap();
    let popup : L.Popup;
    

    window.dispatchEvent(new Event('resize'));

    if (route.gpxData === '')
        return;
    if (map === null)
    {
        mapMessage.value = "leaflet: map load error";
        return;
    }

    // shouldn't need to do this - how to get routeline direct from L.GPX?
    //latlngs.value = LatLngs(route.gpxData);
    //const routeLine =  L.polyline(latlngs.value);
 
    new L.GPX(route.gpxData, {
        async: true,
        polyline_options: {
                color: routeColour(index),
                opacity: 0.6,
                weight: 3
            },
        marker_options: {
            startIconUrl: '',
            endIconUrl: '',
            shadowUrl: ''
        }
    }).on('addline', function (e) {
         e.line.on('mouseover', function (e: { target: any; latlng: L.LatLngExpression; }) {
                var layer = e.target;
                layer.setStyle({
                    opacity: 1,
                    weight: 5
                });
                popup = L.popup(
                    {
                     className: 'custompopup2',
                     closeButton: false
                    }
                )
                .setLatLng(e.latlng)
                .setContent(route.dest + ": " + route.distance + " km<p></p>Click to display")
                .openOn(map);
            });
            e.line.on('mouseout', function (e: { target: any; }) {
                var layer = e.target;
                layer.setStyle({
                    opacity: 0.6,
                    weight: 3
                });
                if (popup != undefined)
                    popup.remove();
            });
            e.line.on('click', function (e: any) {
                $("#routes-elev").show();
                $('.info').show();
                TCCroutes.SetRoute(route);
                TCCMap.showRouteStage2(route.url, true);
            });
    }).on('loaded', async function (e) {

    
    }).addTo(map);
  }    

 


</script>

<template>
    <div id="multiContainer"></div> 
    <v-row>
        <v-col cols="1" class="mt-10 mb-5">
            <v-btn stacked variant="outlined" color="blue"
            v-if="gpx != undefined" 
            :prepend-icon="mdiRoutes"
             @click="Routes.downloadGpx(props.route)" >Get GPX</v-btn>
        </v-col>
        <v-col cols="11" class="pa-0 ma-0">
            <Profile v-if="gpx != undefined && props.showProfile" 
                :gpx ="gpx"
                :latlngs = "latlngs"
                :tab= "props.tab"
                :user = "props.user"
                @latlng = "updateMarker"
            ></Profile>
        </v-col>
    </v-row>
</template>
<style>
#multiContainer { height: 75vh; }
</style>