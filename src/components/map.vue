<script setup  lang="ts">
import {  onMounted,onBeforeUnmount} from 'vue'
import "leaflet/dist/leaflet.css";
import L from 'leaflet';

var map: L.Map ;


onMounted(() => {
    map = L.map('mapContainer', {
      center: [50.2, -5.1],    // centre of cornwall?
      zoom:10
    });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
      }).addTo(map);
    // map.on('locationfound', onLocationFound);
    // map.on('locationerror', onLocationError);
    //map.on('zoom',onZoom);
    //map.locate({watch: true});
    // var bounds = [[50.1, -5.4], [50.3, - 4.8]];  // most of Cornwall
    //     map.fitBounds(bounds);
    // map.setZoom(10);
    //circle = L.circle([51.505, -0.09], 10).addTo(map);
})
onBeforeUnmount(() => {
    if (map) {
      map.remove();
    }
  })
  

</script>
<template>
    <div id="mapContainer"></div>
</template>
<style scoped>
#mapContainer {
  width: auto;
  height: 80vh;
}
</style>