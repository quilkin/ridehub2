<script setup lang="ts">
import {  ref, onMounted,onBeforeMount, onBeforeUpdate} from 'vue'
import type { Ref } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler, type ChartData, type ChartOptions } from 'chart.js'
import type { Chart} from 'chart.js'
import { getRelativePosition } from 'chart.js/helpers';

import "leaflet/dist/leaflet.css";
import * as L from 'leaflet';
import 'leaflet-gpx-coords';
//import 'leaflet-gpx';
import 'leaflet-polylineDecorator';
//import type { User } from '@/utils/user';
import { User  } from '../../../ridehub-common'
import { Tabs } from '../utils/tabs'

const props = defineProps<{
  gpx : L.GPX
  tab : Tabs
  user : User

}>()

const emit = defineEmits(['latlng'])

const chart = ref() as Ref<Chart>;
const datapoints = 200;

const chartData   = ref({
        // dummy distance/height data 
        labels: [ { data: [10,20,39] } ],
        datasets: [ { data: [50, 150, 100] } ]
    }) as Ref<ChartData>;


const chartOptions  = ref( {
          responsive: true,
          maintainAspectRatio: true
    }) as Ref<ChartOptions>;

onBeforeMount(() => {
     ChartJS.register(Title, Tooltip, Legend, PointElement,LineElement, CategoryScale, LinearScale, Filler);
})

onMounted(() => {
    console.log('Profile mounted')
    //if (props.tab !== Tabs.newRide && props.gpx != null) {
    if ( props.gpx != null) {
         showProfile(props.gpx);
     }
})
onBeforeUpdate(() => {
    console.log('Profile before update')
    //if (props.tab !== Tabs.newRide && props.gpx != null) {
        if ( props.gpx != null) {
         showProfile(props.gpx);
     }
})


function showProfile(gpx : L.GPX) {
  
   
    var elev_data;
    var latlng_data;
    var maxDistance = Math.floor(gpx.get_distance() / 1000);
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
        maxDistance = Math.round(maxDistance * 0.62137);
        elev_gain = Math.round(elev_gain * 3.28);
        elev_loss = Math.round(elev_loss * 3.28);

    }
    distanceText = maxDistance.toString() + distanceUnits;
    elevGainText= elev_gain.toString() + heightUnits;
    elevLossText = elev_loss.toString() + heightUnits;

    latlng_data = gpx.get_coords();

    if (gpx.get_elevation_gain() < 1 ||  gpx.get_elevation_loss() < 1 )
    {
        console.log('Insufficient or no elevation data');
        return;
    } 

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
   const spacing = Math.round(n / datapoints);
   //const spacing = 1;
    let json_elev : { Distance : number, Height : number} [] = []
    let json_latlng: any[]  = []
    for (i = 0; i < n; i+=spacing) {
        json_elev.push({Distance: elev_data[i][0], Height: Math.round(elev_data[i][1])});
        json_latlng.push(latlng_data[i]);
    }

    chartData.value =      {

           labels: json_elev.map(row => row.Distance),
           
            datasets: [
            {
                label: '',
                data: json_elev.map(row => row.Height),
                fill : true,
                pointStyle: 'false',
                pointRadius: 0
            }
            ]
        };
    chartOptions.value = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            // decimation: {
            //     enabled: true,
            //     algorithm: 'min-max'
            //     //samples: datapoints
            // },
            legend: {
    	        display: false
            },
          },
          scales: {
            x: {
                type: 'linear',
                ticks:{maxRotation: 0},
                display: true,
                title: {
                    display: true,
                    padding: {top: -5},
                    text: metric ? 'km' : 'miles'
                },
            },
            y: {
                display: true,
                title: {
                    display: true,
                    padding: {top: 15},
                    text: metric ? 'metres' : 'feet'
                },

            }
        },
        onHover: (e) => {
            if (chart.value === null)
                return;
            const thisChart = chart.value.chart;
            const canvasPosition = getRelativePosition(e, thisChart);

            // Substitute the appropriate scale IDs
            const points = json_latlng.length;
            const dataX = thisChart.scales.x.getValueForPixel(canvasPosition.x);
            const indexX = Math.round(dataX *  points / maxDistance); 
            if (indexX >= 0 && indexX < points) {
                //console.log(indexX);
                const latlng =  json_latlng[indexX];

                // send to map for animation.....
                emit("latlng",latlng);
            }
        }
        
    }

};
</script>

<template>
    <v-container class="chart-container">
    <Line
        ref="chart"
        :data = "chartData"
        :options = "chartOptions"
    />
</v-container>
</template>

<style>
.chart-container {
    height: 25vh;

}
</style>
