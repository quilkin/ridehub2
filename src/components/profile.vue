<script setup lang="ts">
import {  ref, onMounted,onBeforeMount, onBeforeUpdate, type Ref} from 'vue'

import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler,
     type ChartData, type ChartOptions, type Chart } from 'chart.js'
import { getRelativePosition } from 'chart.js/helpers';
import { Line } from 'vue-chartjs'

import type { GPX } from 'leaflet'
//import 'leaflet-gpx';
//import 'leaflet-polylineDecorator';
import { User  } from '../../../ridehub-server/src/common/user'

const props = defineProps<{
  latlngs : L.LatLng[] | L.LatLng[][] | L.LatLng[][][]
  user : User
  gpx : GPX;

}>()

const emit = defineEmits(['latlng'])

const profile = ref() as Ref<Chart>;
    
const profileData   = ref({
        // dummy distance/height data 
        labels: [ { data: [10,20,39] } ],
        datasets: [ { data: [50, 150, 100] } ]
    }) as Ref<ChartData>;
      
const profileOptions  = ref( {
          responsive: true,
          maintainAspectRatio: true
    }) as Ref<ChartOptions>;



ChartJS.register(Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale, Filler);

onMounted(() => {
    console.log('Profile mounted')
    if ( props.gpx != null) {
         showProfile(props.gpx,props.latlngs);
     }
})
onBeforeUpdate(() => {
    console.log('Profile updated')
        if ( props.gpx != null) {
         showProfile(props.gpx,props.latlngs);
     }
})


function showProfile(gpx : GPX, latlngs : L.LatLng[] | L.LatLng[][] | L.LatLng[][][]) {
  
    var elev_data;
    var maxDistance = Math.floor(gpx.get_distance() / 1000);
    var elev_gain = Math.floor(gpx.get_elevation_gain());
    var elev_loss = Math.floor(gpx.get_elevation_loss());
    var name = gpx.get_name();

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

    if (gpx.get_elevation_gain() < 1 ||  gpx.get_elevation_loss() < 1 )
    {
        console.log('Insufficient or no elevation data');
        return;
    } 

    //var maxheight = 0;
    if (metric) {
        elev_data = gpx.get_elevation_data();
        //maxheight = gpx.get_elevation_max();
    }
    else {
        elev_data = gpx.get_elevation_data_imp();
        //maxheight = gpx.get_elevation_max_imp();
    }
    // convert array to json for profile 
//
    let json_elev : { Distance : number, Height : number} [] = []
    let json_latlng: any[]  = []
    for (let i = 0; i < elev_data.length; i++) {
        json_elev.push({Distance: elev_data[i][0], Height: Math.round(elev_data[i][1])});
        json_latlng.push(latlngs[i]);
    }

    profileData.value =      {

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
    profileOptions.value = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
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
            if (profile.value === null)
                return;
            const thisChart = profile.value.chart;
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
        ref="profile"
        :data = "profileData"
        :options = "profileOptions"
      />

</v-container>
</template>

<style>
.chart-container {
    height: 25vh;

}
</style>
