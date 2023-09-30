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
  
const Map = {
  showRoute = async function () {

// will call stage 2 when ready

var currentroute = Route.currentRoute();
if (currentroute === null) {
    qPopup.Alert("No route found!");
    return null;
}
if (currentroute.hasGPX === false) {

    TCCMap.showRouteStage2(null, false);
    return null;
}
var gpxdata = currentroute.url;
if (gpxdata !== null && gpxdata.length > 1000) {
    // already have it
    TCCMap.showRouteStage2(gpxdata, true);
    return null;
}


rideData.Post("GetGPXforRoute", currentroute.id)
    .then((result) => {
        gpxdata = result;
        if (gpxdata.length === 0) {
            TCCMap.showRouteStage2(null, false);
            return null;
        }
        TCCMap.showRouteStage2(gpxdata, true);
        currentroute.url = gpxdata;
        return gpxdata;
    })



}

}
export default Map;

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