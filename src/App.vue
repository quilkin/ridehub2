<script setup lang="ts">
import { ref , type Ref } from 'vue'
import accountActions from './components/accountActions.vue'
import RideEdit from './components/editRide.vue'
import RideMap from './components/ridemap.vue'
import RideList from './components/ridelist.vue'
import datePicker  from './components/datePicker.vue'
import Help from './components/help.vue'
import { User } from './utils/user'
import { Route }  from './utils/route'
import { Ride }  from './utils/ride'
import { Message } from './utils/alert'
import { Tabs } from './utils/tabs'
import type { Map } from 'leaflet';
import { mdiMap } from '@mdi/js'
import { mdiCalendarMonth } from '@mdi/js'
import { mdiBookOpenPageVariant } from '@mdi/js'
import { mdiAccountEdit } from '@mdi/js'
import { mdiBike } from '@mdi/js'
import { mdiCoffee } from '@mdi/js'
import { mdiHelp } from '@mdi/js'

const currentTab = ref(Tabs.account);
const currentUser = ref(new User());
const ridesDate = ref(new Date());
//const ridesDate = ref(new Date('2022-03-01'));
const currentRoute = ref(new Route());
const newRoute = ref(new Route());
const currentRide = ref(new Ride());
const showProfile = ref(true);
const editing = ref(false);
//const routes= ref() as Ref<Route[]>


var map: Map | null = null;

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
function doneAccount() {
  switchTab(Tabs.calendar);
}
function doneRideEdit() {
  editing.value = false;
  ++dataChanged.value;
  switchTab(Tabs.calendar);
}

function updateCurrentRoute(route : Route, profile : boolean ) {
    currentRoute.value = route;
    showProfile.value = profile;
}
const dataChanged = ref(0);

function newDate(date : Date) {
  ridesDate.value = date;
  ++dataChanged.value;
}
function tabChanged() {
  console.log('tab: '+ currentTab);
  if (currentTab.value === Tabs.newRide) {
    currentRide.value = new Ride();
    currentRoute.value = new Route();
    editing.value = true;
  }
    
}
function defineMap(newmap : Map) {
  map = newmap;
}
function updateRouteInfo(r : Route) {
  newRoute.value = currentRoute.value;
  newRoute.value.dest = r.dest;
  newRoute.value.distance = r.distance;
}
</script>

<template>
    <v-sheet width="auto" class="mx-auto">
    <v-row no-gutters>
    <v-col> 
      <v-tabs
      v-model="currentTab"
      bg-color="transparent"
      color="blue"
      show-arrows
      stacked
      @update:model-value="tabChanged"
      >
      <v-tab :value=Tabs.calendar>  <v-icon :icon="mdiCalendarMonth"/>      Calendar</v-tab>
      <!-- <v-tab :value=Tabs.routes>    <v-icon :icon="mdiMap"/>                All routes</v-tab> -->
      <v-tab :value=Tabs.newRide>   <v-icon :icon="mdiBike"/>               New Ride</v-tab>
      <v-tab :value=Tabs.coffee>    <v-icon :icon="mdiCoffee"/>             Coffee</v-tab>
      <v-tab :value=Tabs.library>   <v-icon :icon="mdiBookOpenPageVariant"/>Library</v-tab>
      <v-tab :value=Tabs.account>   <v-icon :icon="mdiAccountEdit"/>        Account</v-tab>
      <v-tab :value=Tabs.help>      <v-icon :icon="mdiHelp"/>               Help</v-tab>
    </v-tabs>

      <v-window v-model="currentTab">
        <v-window-item :value=Tabs.calendar>
          <v-container   height="100%">
            <v-row no-gutters>
              <v-col> 
                
                <RideList
                 :key = "dataChanged"
                 :date = "ridesDate" 
                 :user = "currentUser"
                 @show-route = "updateCurrentRoute"
                 @log-in="logIn"
                 @edit-ride="editRide"
                 @participants-updated="++dataChanged"
                 >
                </RideList>
                
                <datePicker  :large='false' text="Select other dates" :date="ridesDate"    @new-date="newDate"   />
              </v-col>
            </v-row>
          </v-container>

        </v-window-item>

        <!-- <v-window-item :value=Tabs.routes>
          Routes
        </v-window-item> -->


        <v-window-item :value=Tabs.newRide>
          <v-container   height="100%">
            <v-row no-gutters>
              <v-col> 
                <RideEdit v-if="checkLogIn() && editing"
                :ride="currentRide"
                :user="currentUser"
                :newRoute="newRoute"
                @log-in="logIn"
                @done-ride-edit="doneRideEdit"
                @show-route = "updateCurrentRoute"
                >
              </RideEdit>
              </v-col>
            </v-row>
          </v-container>
        </v-window-item>
        
        <v-window-item :value=Tabs.coffee>
          Coffee  stops - not yet implemented in this version
        </v-window-item>


        <v-window-item :value=Tabs.library>
          library - not yet implemented in this version
        </v-window-item>

        <v-window-item :value=Tabs.account>
          <account-actions 
       
            :user="currentUser"
            @done-login="doneLogin"
            @done-account="doneAccount"
          ></account-actions>
                   
        </v-window-item>
        <v-window-item :value=Tabs.help>
          <Help></Help>
        </v-window-item>
      </v-window>
    </v-col>
    <v-col  >
      <RideMap
        :map="map"
        :show-profile="showProfile"
        :route = "currentRoute"
        :tab = "currentTab"
        :user = "currentUser"
        @define-map="defineMap"
        @update-route-info="updateRouteInfo"
      ></RideMap>

    </v-col>
    </v-row>
  </v-sheet>
</template>

<style>
.v-btn {
  text-transform: none;
  padding: 0;
}
</style>
