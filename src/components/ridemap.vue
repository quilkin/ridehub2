
<script setup lang="ts">

/**
 * Display the map for a collection of routes, and the gradient profile for a selected route
 * Uses leafletjs
 */
import {  ref, watch,onMounted,onBeforeUnmount, computed, type Ref} from 'vue'
import { type Map } from 'leaflet';
import "leaflet/dist/leaflet.css";
import * as L from 'leaflet';
import 'leaflet-gpx';

import 'leaflet-polylineDecorator';
import { myFetch } from '@/utils/fetch'
import { apiMethods } from '../../../ridehub-server/src/common/apimethods'
import { Route} from '../../../ridehub-server/src/common/route'
import { User } from '../../../ridehub-server/src/common/user'
import Profile from './profile.vue'
import bike from '../assets/bike2.png';
import Routes  from '@/utils/routes'
import { mdiRoutes} from '@mdi/js'
import type { LineString } from 'geojson';
import { useDisplay } from 'vuetify'
import { Localise } from '@/utils/localise';

const { mobile } = useDisplay();


const props = defineProps<{
  routes : Route[]   // one of which (current route?) may be highlighted
  updates : number;
  user : User
  map : Map | null  // see leafletjs.com
}>()

const emit = defineEmits(['defineMap','updateRouteInfo','setRoute']);

var map: Map | null = null;
const mapMessage = ref('');                     // title overlaid on map
const gpx = ref() as Ref<L.GPX>;                // .gpx file for each route to be displayed
const chosenGPX = ref() as Ref<L.GPX | null>;   // .gpx file for the highlighted route
let bikeMarker : L.Marker;                      // for animation when traversing the route
let mapTitle: L.Layer | ({ onAdd: () => HTMLDivElement; } & L.Control) | null;
const latlngs = ref() as Ref<L.LatLng[] | L.LatLng[][] | L.LatLng[][][]>;       // position array for each route
const chosenLatLngs = ref() as Ref<L.LatLng[] | L.LatLng[][] | L.LatLng[][][]>; // position array for selected route
let routeLine: L.Polyline<LineString, any>;
let numOfRoutes = 0;
let bounds: L.LatLngBounds | null;              // determin egeographic extent of map shown
let newBounds = ref(0)
let mapItems : L.Layer[] = [];                  // all things displayed on the map
let mapBounds : L.LatLngBounds;                 // localization. 


/**
 * See leafletjs.com for more info
 */
function setupMap() {
    //console.log('set up map: routes: ' + props.routes.length)
    if (map != null) {
        map.off();
        map.remove();
    }
    latlngs.value = [];


    let topLeft = L.latLng(Localise.topLeft.lat,Localise.topLeft.lng);
    let bottomright = L.latLng(Localise.botRight.lat,Localise.botRight.lng);
    mapBounds = L.latLngBounds(topLeft,bottomright);

    map = L.map('mapContainer', {
        zoomControl: false ,
        zoomSnap: 0.1,
        zoom: 9
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 15,
        minZoom: 8,
        attribution: '© OpenStreetMap'
    }).addTo(map);
    map.fitBounds(mapBounds).setZoom(9);

    emit('defineMap',map);
      
}

onMounted(() => {
    map = props.map;
    if (map === null)
        setupMap();
    newBounds.value = 0;
    
})

/**
 * get rid of map items before displaying a new one
 */
onBeforeUnmount(() => {
    if (mapTitle != null) {
         mapTitle.remove()
    }
        if (map) {
          map.remove();
        }
})

function updateRoutes() {

    mapItems.forEach((item) => {
        item.remove();
    });
    if (mapTitle) {
         mapTitle.remove()
    }
    if (bikeMarker)
        bikeMarker.remove();
    
    mapItems = [];

    bounds = null;
    numOfRoutes = props.routes.length;
    for (const route of  props.routes) {
        if (route.hasGPX == false)
            --numOfRoutes;
        }

    
    var highlightedIndex = props.routes.findIndex(route => {
        return route.highlighted === true;
    })
    var highlighted = props.routes.find(route => {
        return route.highlighted === true;
    })
    // put highlighted route at end so it shows up best over others
    // no, causes other issues
    // if (highlightedIndex >= 0 && highlighted) {
    //     props.routes.splice(highlightedIndex,1);
    //     props.routes.push(highlighted)
    // }

    let index = 0;
    for (const route of  props.routes) {
        if (route.hasGPX) 
            showRoute(route,numOfRoutes,index++);
        else {
            chosenGPX.value = null;

        }
    }
    window.dispatchEvent(new Event('resize'));
 }

 /**
  * Need to redraw map if a new route is added
  */
watch(() => props.routes,  () => {
  //console.log('ridemap: route list changed');
  updateRoutes();
  }
)

/**
 * Need to redraw map if the highlighted route is changed
 */
watch(() => props.updates,  () => {
  //console.log('ridemap: updates changed');
  updateRoutes();
    }
)


/**
 * increase geographic map boundary to accommodate latest track
 * @param newBounds 
 * @param hightlighted 
 */
function adjustBounds(newBounds: L.LatLngBounds, hightlighted : boolean) {

    if (hightlighted === false)
            return;
    if (hightlighted ===undefined ) {
        // show all routes and set bounds to fit all, if they are in our map area 
        if (bounds === null)
            bounds = newBounds;
        else if (newBounds.overlaps(mapBounds) )
        // don't expand to show routes not starting in our map area
            bounds.extend(newBounds);
    }
    else if (hightlighted) {
        // set bounds to fit the highlighted route only
        bounds = newBounds;
    }

}

/**
 *   This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
    https://stackoverflow.com/questions/1484506/random-color-generator
 * @param index which route to colour
 */
function routeColour(index: number) {
  
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

/**
 * Show one route (track) on the map
 * (note that we have some 'ts-ignore' statements here - leafletjs doesn't seem to be 100% typescript compliant)
 * @param route which route to show
 * @param numOfRoutes total number of rotes being shown (nneded to correctly display the highlighted route )
 * @param index just increments for each route shown
 */
function showRoute(route : Route , numOfRoutes: number, index: number)
{
    if (route.miniroute === '') {
        if (route.route === '')
         return;
        else {
            // new route just loaded; miniroute not yet produced 
            route.miniroute = route.route;
            route.highlighted = true;
        }
    }
    if (map === null)
        return;

// listedRoute is true only if the route has already been added to the list of routes
    const listedRoute  : boolean = (route.id>0);
    let colour = routeColour(index);
    let lineOpacity = 0.4;

    if (route.highlighted)
    {
        lineOpacity = 1;
        colour = '#000000' ; // black
        mapMessage.value = route.dest;
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
        // @ts-ignore Property 'line' does not exist on type 'LeafletEvent'.
        routeLine = e.line;
        let popup : L.Popup;
        
        if (route.highlighted) {  
            // add a title to the map, on the map itself.
            // code from here https://stackoverflow.com/questions/33767463/overlaying-a-text-box-on-a-leaflet-js-map
            let textbox   = L.Control.extend({
                onAdd: function() {
                    var text = L.DomUtil.create('div');
                    text.innerHTML = "<h2>" + mapMessage.value + "</h2>"
                    return text;
                    },
            });
            if (mapTitle)
                mapTitle.remove();
            mapTitle = new textbox({ position: 'topleft' }).addTo(map);
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
            chosenLatLngs.value = latlngs.value;
        }
        // @ts-ignore Property 'line' does not exist on type 'LeafletEvent'.
        e.line.on('mouseover', function (e: { target: any; latlng: L.LatLngExpression; }) {
                var layer = e.target;
                layer.setStyle({
                    opacity: 1,
                    weight: 5
                });
                popup  = L.popup(
                    {
                        className: 'custompopup2',
                        closeButton: false
                    }
                )   .setLatLng(e.latlng)
                    .setContent(route.dest + ": " + route.distance + " km<p></p>Click to select")
                    // @ts-ignore of type 'Map | null' is not assignable to parameter of type 'Map'.
                    .openOn(map);
            });
            // @ts-ignore Property 'line' does not exist on type 'LeafletEvent'.
            e.line.on('mouseout', function (e: { target: any; }) {
                var layer = e.target;
                layer.setStyle({
                    opacity: lineOpacity,
                    weight: 3
                });
                if (L.popup != undefined)
                    popup.remove();
            });
            // @ts-ignore Property 'line' does not exist on type 'LeafletEvent'.
            e.line.on('click', function (e) {
                emit('setRoute',route);
            });

    }).on('loaded', async function (e) {

        if (map === null)    {    return;   }

        gpx.value = e.target;
        if (route.highlighted) { 
            chosenGPX.value = gpx.value;
        }
        adjustBounds(gpx.value.getBounds(),route.highlighted);
        if (index >= numOfRoutes-1 && bounds != null)
            map.fitBounds(bounds,{ padding: [20, 20] });


        const distance = Math.floor(gpx.value .get_distance() / 1000);
        const elev_gain = Math.floor(gpx.value .get_elevation_gain());
        
        var name = '';

        if (route !== null)
            name = route.dest;
        if (name === '' || listedRoute === false) {
            name = gpx.value .get_name();
        }

        // if this is a new route, get some details from the GPX to hand back to the app / database
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

/**
 * animation shown on map as user traverses the gradient profile with mouse
 */
  const bikeIcon = L.icon({
    iconUrl:        bike,
    iconSize:     [40, 35], 
    shadowSize:   [50, 40], 
    iconAnchor:   [20, 17], 
    shadowAnchor: [4, 2],  
    popupAnchor:  [-3, -7] 
});
  
/**
 * 
 * @param latlng where to place the bike icon animation 
 */
function updateMarker(latlng: L.LatLngExpression ) {
    if (map === null)
        return;
    if (bikeMarker != null) {
        map.removeLayer(bikeMarker);
    }
    bikeMarker = new L.Marker(latlng, {icon: bikeIcon}).addTo(map);
}

/**
 * sizes depend on phone (mobile) or PC screen displays
 */
const mapHeight= computed(() => {
    return mobile.value? {'height': '30vh'} : {'height': '70vh'} 
})
const profileHeight= computed(() => {
    return mobile.value ? {'height': '18vh'} : {'height': '30vh'}
})

</script>

<template>
    <div id="mapContainer" :style="{...mapHeight}"></div> 
    <v-row>
        <v-col cols="2" class="mt-2">
            <v-btn stacked variant="outlined" color="blue"
            v-if="gpx != undefined" 
            :prepend-icon="mdiRoutes"
             @click="Routes.downloadGpx(props.routes.find(r => r.highlighted))" >Get GPX</v-btn>
        </v-col>
        <v-col cols="10" class="pa-0 ma-0">
            <Profile v-if="chosenGPX" 
            :height = "profileHeight"
                :gpx ="chosenGPX"
                :latlngs = "chosenLatLngs"
                :user = "props.user"
                @latlng = "updateMarker"
            ></Profile>
        </v-col>
    </v-row>
</template>
