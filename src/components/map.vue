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
      window.dispatchEvent(new Event('resize'));
 

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