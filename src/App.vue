<script setup lang="ts">
import { ref, computed, type Ref } from 'vue'
import accountActions from './components/accountActions.vue'
import RideEdit from './components/editRide.vue'
import RideMap from './components/ridemap.vue'
import RideList from './components/ridelist.vue'
import DateSelector  from './components/dateSelector.vue'
import Help from './components/help.vue'
import RouteList from './components/routeList.vue'
import Stats from './components/stats.vue'
import { Route } from '../../ridehub-server/src/common/route'
import { Ride} from '../../ridehub-server/src/common/ride'
import { User} from '../../ridehub-server/src/common/user'
import { Message } from './utils/alert'
import { Tabs } from './utils/tabs'
import type { Map } from 'leaflet';
import { mdiCalendarMonth, mdiAccountEdit ,mdiBike,mdiCoffee, mdiHelp, mdiMap , mdiDoorOpen, mdiFormatListNumberedRtl} from '@mdi/js'

const currentTab = ref(Tabs.account);
const currentUser = ref(new User('',''));
const ridesDate = ref(new Date());
const currentRouteList = ref() as Ref<Route[]>
const currentRideIndex = ref(0);
const newRoute = ref(new Route());
const routeFromList = ref(new Route() );
const currentRide = ref(new Ride());
const editing = ref(false);
const rideListChanged = ref(0);
const routeListChanged = ref(0);
const highlightChanged = ref(0);

import { useDisplay } from 'vuetify'
const { mobile } = useDisplay();

var map: Map | null = null;
currentRouteList.value = [];
let rideDates : number[]  = [];

function switchTab(tab: Tabs) {
  currentTab.value = tab;


}
function logIn()
{
  switchTab(Tabs.account);
}
function editRide(ride : Ride)
{
  currentRide.value = ride;
  switchTab(Tabs.newRide);
  editing.value = true;

}
function checkLogIn()
{

  if (currentUser.value.role==0)
    {
        // not logged in, not allowed to see details or join a ride
        Message('You need to sign in to continue')
        logIn();
        return false;
    }
    return true;
}

function doneLogin(user : User) {
  if (user===null || user==undefined)
    return;

  if (user.role==0)
  {
    console.log("guest user");
  }
  else {
    console.log("login by " + user.name);
  }
  currentUser.value = user;
  switchTab(Tabs.calendar);
  ++routeListChanged.value;
  // if (mobile.value) {
  //   var elem = document.documentElement;
  //   if (elem.requestFullscreen) {
  //   elem.requestFullscreen();
  //   } 
  // }
  // else if (elem.webkitRequestFullscreen) { /* Safari */
  //   elem.webkitRequestFullscreen();
  // } else if (elem.msRequestFullscreen) { /* IE11 */
  //   elem.msRequestFullscreen();
  // }
}


function doneAccount(user : User) {
  currentUser.value = user;
     switchTab(Tabs.calendar);
}
/**
 * called after password has been reset
 */
function logout()
{
  currentUser.value = new User('','');
  switchTab(Tabs.calendar);
}
function doneRideEdit() {
  editing.value = false;
  ++rideListChanged.value;
  switchTab(Tabs.calendar);
}

/**
 * called from ridemap when different route chosen
 */
function highlightRoute(r : Route ) {
  // find this route in the list and mark it as highlighted
  // also place it at end of list so that profile will be shown by ridemap

   currentRouteList.value.forEach((route,index) => {
    if (route.id === r.id)
      route.highlighted = true;
    else
      route.highlighted = false;
  });
 
  // force update of ride map
  ++highlightChanged.value;
}
function chooseRouteFromList()
{
  ++routeListChanged.value;
  switchTab(Tabs.routes);
}

function newRouteList(routes : Route[]) {
  currentRouteList.value = routes;
 // ++routelistChanged.value;
}

function showUploadedRoute(r : Route) {
  currentRouteList.value = [];
  currentRouteList.value.push(r);
  highlightRoute(r);
}
/**
 * Called from edit ride when route is chosen
 */
function showRouteFromList(r : Route, chosen : boolean) {
  routeFromList.value = new Route();
  if (chosen) {

      if (checkLogIn()) {
      // go straight to editing ride
        editing.value = true;
        routeFromList.value = r;
        switchTab(Tabs.newRide);
      }
    }
  //else {
    highlightRoute(r);
  //}
}
function gotRides(routes : Route[], dates : number[] ) {
    currentRouteList.value = routes;
    rideDates = dates;
}


function newDate(date : Date) {
  ridesDate.value = date;
  ++rideListChanged.value;
}
function tabChanged() {
  console.log('tab: '+ currentTab.value);
  if (currentTab.value === Tabs.exit) {
    //window.close();
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    
  }
  if (currentTab.value === Tabs.newRide) {
    routeFromList.value = new Route();
    currentRide.value = new Ride();
    // force just one (empty) route into ridemap
     currentRouteList.value = [];
    currentRouteList.value.push(new Route());
    editing.value = true;
  }
    
  if (currentTab.value === Tabs.calendar) {
    // force reload of data
    ++rideListChanged.value;
  }
  if (currentTab.value === Tabs.routes) {
    // force reload of data
    ++routeListChanged.value;
  }
  
}
function defineMap(newmap : Map) {
  map = newmap;
}
/**
 * this route has just had destination and distanceinfo extracted from its GPX file, via ridemap
 */
function updateRouteInfo(r : Route) {
  newRoute.value = currentRouteList.value[0];
  newRoute.value.dest = r.dest;
  newRoute.value.distance = r.distance;
}
function calendarClicked() {
  ++rideListChanged.value;
}
function routesClicked() {
  ++routeListChanged.value;
}
const tabWidth= computed(() => {
    return mobile.value? {'min-width': '20vw'} : {'min-width': '70px'} 
})

</script>

<template>
  <v-sheet >
    <v-row no-gutters>
    <v-col > 
      <v-tabs 
      v-model="currentTab"
      bg-color="blue-lighten-4"
      center-active
      color="blue"
      show-arrows
      stacked
      height="8vh"
      :grow="mobile===false"
      @update:model-value="tabChanged"
      >
      <v-tab :value=Tabs.calendar :style="{...tabWidth}" @click="calendarClicked">  <v-icon :icon="mdiCalendarMonth"/>      Rides</v-tab>
      <v-tab :value=Tabs.newRide :style="{...tabWidth}">   <v-icon :icon="mdiBike"/>               New</v-tab>
      <v-tab :value=Tabs.routes :style="{...tabWidth}" @click="routesClicked">    <v-icon :icon="mdiMap"/>                Routes</v-tab>
      <!-- <v-tab :value=Tabs.coffee>    <v-icon :icon="mdiCoffee"/>             Coffee</v-tab>
      <v-tab :value=Tabs.library>   <v-icon :icon="mdiBookOpenPageVariant"/>Library</v-tab> -->
      <v-tab :value=Tabs.account :style="{...tabWidth}">    <v-icon :icon="mdiAccountEdit"/>        Account</v-tab>
      <v-tab :value=Tabs.stats :style="{...tabWidth}">    <v-icon :icon="mdiFormatListNumberedRtl"/>        Stats</v-tab>
      <v-tab :value=Tabs.help :style="{...tabWidth}">      <v-icon :icon="mdiHelp"/>               Help</v-tab>
      <!-- <v-tab v-if="mobile" :value=Tabs.exit>      <v-icon :icon="mdiDoorOpen"/> Exit</v-tab> -->
    </v-tabs>

      <v-window v-model="currentTab">
        <v-window-item :value=Tabs.calendar>
          <v-container >
                <RideList
                 :key = "rideListChanged"
                 :date = "ridesDate" 
                 :user = "currentUser"
                 
                 @show-route = "highlightRoute"
                 @got-rides = "gotRides"
                 @log-in="logIn"
                 @edit-ride="editRide"
                 @participants-updated="++rideListChanged"
                 @new-date="newDate"
                 >
                </RideList>
                
            </v-container>

        </v-window-item>

        <v-window-item :value=Tabs.routes>
          <v-container  >
            <RouteList
              :key = "routeListChanged"
              :user="currentUser"
              :allRoutes = "true"
              @show-route="showRouteFromList"
              @new-route-list="newRouteList">
            </RouteList>
          </v-container>
        </v-window-item>


        <v-window-item :value=Tabs.newRide>
          <v-container  class=" scrollable">
                <RideEdit v-if="checkLogIn() && editing"
                :ride="currentRide"
                :user="currentUser"
                :newRoute="newRoute"
                :routeFromList = "routeFromList"
                :ridedates = "rideDates"
                @log-in="logIn"
                @done-ride-edit="doneRideEdit"
                @show-route = "showRouteFromList"
                @new-route-list="newRouteList"
                @choose-route-from-list="chooseRouteFromList"
                @show-uploaded-route="showUploadedRoute"
                >
              </RideEdit>
          </v-container>
        </v-window-item>
        
        <!-- <v-window-item :value=Tabs.coffee>
          <v-container   class="tab-item-wrapper">
          Coffee  stops - not yet implemented in this version
          </v-container>
        </v-window-item>


        <v-window-item :value=Tabs.library>
          <v-container class="tab-item-wrapper">
          library - not yet implemented in this version
          </v-container>
        </v-window-item> -->

        <v-window-item :value=Tabs.account>
          <v-container  class=" scrollable">
            <account-actions 
              :user="currentUser"
              @done-login="doneLogin"
              @done-account="doneAccount"
              @logout="logout"
             ></account-actions>
        </v-container>
        </v-window-item>
        <v-window-item :value=Tabs.help>
          <v-container  class="">
            <Help></Help>
          </v-container>
        </v-window-item>
        <v-window-item :value=Tabs.stats>
          <v-container  class="">
            <Stats
            :user="currentUser"
            >
            </Stats>
          </v-container>
        </v-window-item>
      </v-window>
    </v-col>
    <v-col >
      <RideMap
        :map="map"
        :updates = "highlightChanged"
        :routes = "currentRouteList"
        :user = "currentUser"
        @define-map="defineMap"
        @update-route-info="updateRouteInfo"
        @set-route= "highlightRoute"
      ></RideMap>

    </v-col>
    </v-row>
  </v-sheet>
</template>

<style>
  .scrollable {
   overflow-y: auto;
}
.v-btn--stacked.v-tab.v-btn {
    padding: 0 4px;
    /* min-width: 70px; */
    /* min-width: 20vw; */
  }
.v-btn {
  text-transform: none;
  padding: 0;
}
</style>
