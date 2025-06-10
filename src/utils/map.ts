import "leaflet/dist/leaflet.css";
import * as L from 'leaflet';
import 'leaflet-gpx';
import 'leaflet-polylineDecorator';
import Routes  from './routes';
import { myFetch } from '../utils/fetch'
import  { Alert} from './alert'

var map: L.Map ;

 
const Map = {

  showRoute: async function () {

  // will call stage 2 when ready

    const currentroute = Routes.currentRoute();
    if (currentroute === null) {
        Alert("?","No route found!",'','error','OK');
        return null;
    }
    if (currentroute.hasGPX === false) {

        this.showRouteStage2('', false);
        return null;
    }
    var gpxdata = currentroute.url;
    if (gpxdata !== null && gpxdata.length > 1000) {
        // already have it
        this.showRouteStage2(gpxdata, true);
        return null;
    }

    console.log('getting GPX data');
    gpxdata  = await myFetch("GetGPXforRoute", currentroute.id, true);
    if (gpxdata != null) {

            if (gpxdata.length === 0) {
                this.showRouteStage2('', false);
                return null;
            }
            this.showRouteStage2(gpxdata, true);
            currentroute.url = gpxdata;
            return gpxdata;
        }
  },
  showRouteStage2: function(gpxdata :string, listedRoute  : boolean)
  {
// listedRoute is true only if the route has already been added to the list of routes

// ****** todo: sort out maps tab using vue

// var tab = rideData.getCurrentTab();
// var mapid = "routes-map";
// var elevid = "routes-elev";
// var elev_data;
// var latlng_data;

// var map_pane = document.getElementById('routes');
// if (tab === 'setup-tab') {
//     mapid = "setup-map";
//     elevid = "setup-elev";
//     map_pane = document.getElementById('setup');
// }
// else if (tab === 'rides-tab') {
//     mapid = "rides-map";
//     elevid = "rides-elev";
//     map_pane = document.getElementById('rides');
// }

// if (gpxdata === null || gpxdata === 'none' || gpxdata.length < 100) {
//     $("#" + mapid).hide();
//     $("#" + elevid).hide();
//     _t('h4').textContent = Routes.currentRoute().dest + ": No route map provided";
//     $('.info').hide();
//     return;
// }
// else {
//     $("#" + mapid).show();
//     $("#" + elevid).show();
//     $('.info').show();

// }

// _t('h4').textContent = "please wait...";

// function _t(t) { return map_pane.getElementsByTagName(t)[0]; }
// function _c(c) { return map_pane.getElementsByClassName(c)[0]; }

if (map !== undefined) { map.remove(); }

map = L.map(mapid);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.osm.org">OpenStreetMap</a>'
}).addTo(map);
window.dispatchEvent(new Event('resize'));
var pl = new L.GPX(gpxdata, {
    async: true,
    marker_options: {
        startIconUrl: '',
        endIconUrl: '',
        shadowUrl: ''
    }

    // removed popuop distances because we now have direction arrows instead


}).on('loaded', async function (e) {

    var gpx = e.target;
    var elev_data;

    // add direction arrows to GPX polyline
    L.polylineDecorator(gpx.get_latlngs(gpx), {
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
    var bounds = gpx.getBounds();
    map.fitBounds(bounds);


    var distance = (gpx.get_distance() / 1000).toFixed(0);
    var elev_gain = gpx.get_elevation_gain().toFixed(0);
    var elev_loss = gpx.get_elevation_loss().toFixed(0);

    var name = '';
    const route = Routes.currentRoute();
    if (route !== null)
        name = route.dest;
    if (name === '' || listedRoute === false) {
        name = gpx.get_name();
    }

    if (listedRoute === true) {
        // get some details from the GPX to hand back to the app
        //var route = TCCroutes.currentRoute();
        if (route.distance === 0 || isNaN(route.distance) || route.dest === '' || (route.climbing === 0 && elev_gain > 0)) {
            route.distance = distance;
            route.dest = name;
            route.climbing = elev_gain;
            await myFetch("UpdateRoute", route, true);
            // rideData.Post("UpdateRoute", route).then ((response) => {
            //     var reply = response;
            // });
        }
    }
    _t('h4').textContent = name + ":  ";

    if (tab !== 'setup-tab' && route.id > 0) {
        // add a download link
        var a = document.createElement('a');
        var linkText = document.createTextNode("Get GPX");
        a.setAttribute('class', "btn btn-lifted  btn-info btn-sm btn-responsive");
        a.appendChild(linkText);
        a.title = "Get this into your PC's download folder so you can load into Garmin etc";
        a.href = 'data:application/gpx+xml;base64,' + btoa(gpxdata);
        a.download = name + '.gpx';

        _t('h4').appendChild(a);

        // add a help button
        var h = document.createElement('h');
        linkText = document.createTextNode("Help");
        h.setAttribute('class', "btn btn-lifted  btn-info btn-sm btn-responsive pull-right");
        h.appendChild(linkText);
        h.onclick = function () {
            var win = window.open("Rides-signup.htm");
            win.focus();
        };

        _t('h4').appendChild(a);
        _t('h4').appendChild(h);

        if (tab === 'routes-tab') {
            var b = document.createElement('a');
            linkText = document.createTextNode("Lead Ride");
            b.setAttribute('class', "btn btn-lifted  btn-info btn-sm btn-responsive");
            b.appendChild(linkText);
            b.title = "Lead a ride based on this route";
            b.onclick = function () {
                login.Then(function () {
                    rideData.switchingFromLeadRide = true;
                    // move to different tab
                    rideData.setCurrentTab('setup-tab');
                    $('#setup-tab').tab('show');
                    $('#uploadRoute').hide();
                    $('#manualRoute').hide();
                    $('#existingRoute').hide();

                    setTimeout(function () {
                        // no idea why this is needed, but map does not show correctly if not used
                        TCCMap.showRoute();
                        Ride.leadRide();
                    }, 1000);

                });
 
            };

            _t('h4').appendChild(b);
         }

        // prepare a profile chart
        var metric = (login.Units() === 'k');
        if (metric) {
            _c('myunits1').textContent = 'km';
            _c('myunits2').textContent = 'm';
        }
        else {
            _c('myunits1').textContent = 'miles';
            _c('myunits2').textContent = 'ft';
            distance = Math.round(distance * 0.62137);
            elev_gain = Math.round(elev_gain * 3.28);
            elev_loss = Math.round(elev_loss * 3.28);

        }
        _c('distance').textContent = distance;
        _c('elevation-gain').textContent = elev_gain;
        _c('elevation-loss').textContent = elev_loss;

        latlng_data = gpx.get_latlngs();

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
            var json_elev = new Array();
            for (i = 0; i < n; i++) {
                json_elev.push(new height(elev_data[i][0].toFixed(1), elev_data[i][1].toFixed(0)));

            }
            _c('elevation-none').textContent = "";
            drawProfile(elevid, json_elev, maxheight, metric);
        }
        else {
            clearChart();
            _c('elevation-none').textContent = " : No elevation data in this route";

        }
    }

}).addTo(map);


  },

}
export default Map;

