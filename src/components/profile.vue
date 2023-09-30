<script setup lang="ts">
import {  ref, onMounted,onBeforeMount, onUpdated} from 'vue'
import type { Ref } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, type ChartData, type ChartOptions  } from 'chart.js'

import "leaflet/dist/leaflet.css";
import * as L from 'leaflet';
import 'leaflet-gpx';
import 'leaflet-polylineDecorator';
import { Alert} from '../utils/alert'
import type { LeafletEvent } from 'leaflet';
import type { User } from '@/utils/user';

const props = defineProps<{
  gpx : L.GPX
  tab : string
  user : User

}>()

const chartData   = ref({
        // dummy distance/height data 
        labels: [ { data: [10,20,39] } ],
        datasets: [ { data: [50, 150, 100] } ]
    }) as Ref<ChartData>;


const chartOptions  = ref( {
          responsive: true
        }) as Ref<ChartOptions>;

onBeforeMount(() => {
    
    ChartJS.register(Title, Tooltip, Legend, PointElement,LineElement, CategoryScale, LinearScale);
    console.log('profile: onBeforeMount');

})
onMounted(() => {
    console.log('updating profile: onMounted')
  
    if (props.tab !== 'new' && props.gpx != null) {
        //const route = props.route;
        
        //mapMessage.value = route.dest;
        showProfile(props.gpx);
    }
})
// onUpdated(() => {
//     console.log('updating profile: onUpdated')
//     // if (chart !== undefined)
//     //             chart.dispose();
//     if (props.tab !== 'new' && props.gpx != null) {
//         //const route = props.route;
//         //console.log('updating profile: onUpdated')
//         //mapMessage.value = route.dest;
//         showProfile(props.gpx);
//     }

// })


function get_latlngs(gpx :LeafletEvent["target"]) { return gpx._info.latlngs; }

function showProfile(gpx : L.GPX) {
    console.log('showProfile')
    
    var elev_data;
    var latlng_data;
    var distance = Math.floor(gpx.get_distance() / 1000);
    var elev_gain = Math.floor(gpx.get_elevation_gain());
    var elev_loss = Math.floor(gpx.get_elevation_loss());

    var distanceUnits =' km';
    var heightUnits = ' m';
    var distanceText ='';
    var elevGainText = '';
    var elevLossText ='';

    var metric = (props.user.units === 'k');



    if (! metric) {

        distanceUnits = ' miles';
        heightUnits = ' ft';
        distance = Math.round(distance * 0.62137);
        elev_gain = Math.round(elev_gain * 3.28);
        elev_loss = Math.round(elev_loss * 3.28);

    }
    distanceText = distance.toString() + distanceUnits;
    elevGainText= elev_gain.toString() + heightUnits;
    elevLossText = elev_loss.toString() + heightUnits;

    latlng_data = get_latlngs(gpx);

    if (gpx.get_elevation_gain() > 0 && gpx.get_elevation_loss() > 0) {
        var maxheight = 0;
        if (metric) {
            elev_data = gpx.get_elevation_data();
            maxheight = gpx.get_elevation_max();
        }
        else {
            elev_data = gpx.get_elevation_data_imp();
            maxheight = gpx.get_elevation_max_imp();
        }
        // convert array to json for profile 
        var i, n = elev_data.length;
        // 200 points should be enough to show trend
        const spacing = Math.round(n / 200);
        let json_elev : { Distance : number, Height : number} [] = []
        for (i = 0; i < n; i+=spacing) {
            json_elev.push({Distance: Math.round(elev_data[i][0]), Height: Math.round(elev_data[i][1])});

        }
        drawProfile( json_elev, maxheight, distance, metric);
    }

}


function drawProfile(elevationData: { Distance : number, Height : number}[], maxheight: number, distance : number,metric: boolean) {

    chartData.value =      {

            labels: elevationData.map(row => row.Distance),
            datasets: [
            {
                label: 'Elevation',
                data: elevationData.map(row => row.Height)
            }
            ]
        };
    
   // var dist = metric ? 'km' : 'miles';
   // var height = metric ? 'm' : 'ft';



};
</script>

<template>
    <Line
        :data = "chartData"
        :options = "chartOptions"
    />
</template>
