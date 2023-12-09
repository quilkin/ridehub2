<script setup lang="ts">
import { ref, type Ref } from 'vue'
import accountActions from './components/accountActions.vue'
import RideEdit from './components/editRide.vue'
import RideMap from './components/ridemap.vue'
import RideList from './components/ridelist.vue'
import DateSelector  from './components/dateSelector.vue'
import Help from './components/help.vue'
import RouteList from './components/routeList.vue'
import { Route } from '../../ridehub-server/src/common/route'
import { Ride} from '../../ridehub-server/src/common/ride'
import { User} from '../../ridehub-server/src/common/user'
import { Message } from './utils/alert'
import { Tabs } from './utils/tabs'
import type { Map } from 'leaflet';
import { mdiCalendarMonth, mdiBookOpenPageVariant,mdiAccountEdit ,mdiBike,mdiCoffee, mdiHelp, mdiMap } from '@mdi/js'

const currentTab = ref(Tabs.account);
const currentUser = ref(new User('',''));
const ridesDate = ref(new Date());
const currentRouteList = ref() as Ref<Route[]>
const currentRideIndex = ref(0);
const newRoute = ref(new Route());
const routeFromList = ref(new Route() );
const currentRide = ref(new Ride());
const editing = ref(false);
const dataChanged = ref(0);
const routelistChanged = ref(0);

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
  ++dataChanged.value;
  switchTab(Tabs.calendar);
}

/**
 * called from ridemap when different route chosen
 */
function highlightRoute(r : Route ) {
  // find this route in the list and mark it as highlighted
  // also place it at end of list so that profile will be shown by ridemap

  // function compare(a:Route,b:Route) {
  //   if (a.highlighted) return 1;
  //   if (b.highlighted) return -1;
  //   return 0;
  // }
   currentRouteList.value.forEach((route,index) => {
    if (route.id === r.id)
      route.highlighted = true;
    else
      route.highlighted = false;
  });
  //currentRouteList.value.sort(compare);
 
  // force update of ride map
  ++routelistChanged.value;
}
function chooseRouteFromList()
{
  switchTab(Tabs.routes);
}

function newRouteList(routes : Route[]) {
  currentRouteList.value = routes;
  //++routelistChanged.value;
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
  ++dataChanged.value;
}
function tabChanged() {
  console.log('tab: '+ currentTab.value);
  if (currentTab.value === Tabs.newRide) {
    routeFromList.value = new Route();
    currentRide.value = new Ride();
    // force just one (empty) route into ridemap
     currentRouteList.value = [];
    currentRouteList.value.push(new Route());
    editing.value = true;
  }
    
  // if (currentTab.value === Tabs.routes) {
  //    currentRouteList.value = routes;
  // }
   
  
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

</script>

<template>
    <v-sheet >
    <v-row no-gutters>
    <v-col > 
      <v-tabs
      v-model="currentTab"
      bg-color="transparent"
      color="blue"
      show-arrows
      stacked
      @update:model-value="tabChanged"
      >
      <v-tab :value=Tabs.calendar>  <v-icon :icon="mdiCalendarMonth"/>      Rides</v-tab>
      <v-tab :value=Tabs.newRide>   <v-icon :icon="mdiBike"/>               New</v-tab>
      <v-tab :value=Tabs.routes>    <v-icon :icon="mdiMap"/>                All routes</v-tab>
      <!-- <v-tab :value=Tabs.coffee>    <v-icon :icon="mdiCoffee"/>             Coffee</v-tab>
      <v-tab :value=Tabs.library>   <v-icon :icon="mdiBookOpenPageVariant"/>Library</v-tab> -->
      <v-tab :value=Tabs.account>   <v-icon :icon="mdiAccountEdit"/>        Account</v-tab>
      <v-tab :value=Tabs.help>      <v-icon :icon="mdiHelp"/>               Help</v-tab>
    </v-tabs>

      <v-window v-model="currentTab">
        <v-window-item :value=Tabs.calendar>
          <v-container   class="tab-item-wrapper">
                <RideList
                 :key = "dataChanged"
                 :date = "ridesDate" 
                 :user = "currentUser"
                 
                 @show-route = "highlightRoute"
                 @got-rides = "gotRides"
                 @log-in="logIn"
                 @edit-ride="editRide"
                 @participants-updated="++dataChanged"
                 @new-date="newDate"
                 >
                </RideList>
                
                <!-- <DateSelector  :icon='true' text="Select other dates" :date="ridesDate"    @new-date="newDate"   /> -->
          </v-container>

        </v-window-item>

        <v-window-item :value=Tabs.routes>
          <v-container   class="tab-item-wrapper">
            <RouteList  :user="currentUser" :allRoutes = "true" @show-route="showRouteFromList" @new-route-list="newRouteList"></RouteList>
          </v-container>
        </v-window-item>


        <v-window-item :value=Tabs.newRide>
          <v-container  class="tab-item-wrapper scrollable">
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
          <v-container  class="tab-item-wrapper  scrollable">
            <account-actions 
              :user="currentUser"
              @done-login="doneLogin"
              @done-account="doneAccount"
              @logout="logout"
             ></account-actions>
        </v-container>
        </v-window-item>
        <v-window-item :value=Tabs.help>
          <v-container  class="tab-item-wrapper">
            <Help></Help>
          </v-container>
        </v-window-item>
      </v-window>
    </v-col>
    <v-col >
      <RideMap
        :map="map"
        :updates = "routelistChanged"
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
.tab-item-wrapper {
  /* vuetify sets the v-tabs__container height to 48px */
  height: calc(100vh - 48px);

}
.v-btn {
  text-transform: none;
  padding: 0;
}
</style>
./utils/classes/ride./utils/routeFuncs