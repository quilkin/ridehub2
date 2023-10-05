<script setup lang="ts">
import { ref , type Ref } from 'vue'
import accountActions from './components/accountActions.vue'
import RideEdit from './components/editRide.vue'
import RideMap from './components/ridemap.vue'
import { User } from './utils/user'
import RideList from './components/ridelist.vue'
import { Route }  from './utils/route'
import { Ride }  from './utils/ride'
import type { Map } from 'leaflet';

import  baseDatePicker  from './components/baseDatePicker.vue'


const currentTab = ref('account');
const currentUser = ref(new User());
const ridesDate = ref(new Date('2022-03-01'));
const currentRoute = ref(new Route());
const currentRide = ref(new Ride());
const showProfile = ref(true);
//const mapData = ref(new MapData());
//const datepicker = ref(null);
const routes= ref() as Ref<Route[]>

var map: Map | null = null;

function switchTab(tab: string) {
  currentTab.value = tab;
}
function logIn()
{
  switchTab('account');
}
function editRide(ride : Ride)
{
  currentRide.value = ride;
  switchTab('newRide');
}
function doneLogin(user : User) {
  //myAlert();
  if (user===null)
  {
    console.log("guest user");
    //accountTab.value.setTabView(false);
  }
  else {
    console.log("login by " + user.name);
    currentUser.value = user;
  }
  //await Routes.getRouteSummaries();

  switchTab('calendar');
 
}
function doneRideEdit() {
  console.log("done ride edit");
}

function showRoute(route : Route, profile : boolean) {
    currentRoute.value = route;
    showProfile.value = profile;
    //currentTab.value = 'calendar';
    //console.log('*****showRoute: '+ (route.url.length > 100? 'OK' : 'no route'));
}
const dateChanged = ref(0);

function newDate(date : Date) {
  ridesDate.value = date;
  ++dateChanged.value;
}
function tabChanged() {
  console.log('tab: '+ currentTab);
  if (currentTab.value === 'newRide') {
    currentRoute.value = new Route();
  }
}
function defineMap(newmap : Map) {
  map = newmap;
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
      <v-tab value="calendar"><v-icon>mdi-calendar-month</v-icon>Calendar</v-tab>
      <v-tab value="routes"><v-icon>mdi-map</v-icon>All routes</v-tab>
      <v-tab value="newRide"><v-icon>mdi-bike</v-icon>New Ride</v-tab>
      <v-tab value="coffee"><v-icon>mdi-coffee</v-icon>Coffee</v-tab>
      <v-tab value="library"><v-icon>mdi-book-open-page-variant</v-icon>Library</v-tab>
      <v-tab value="account"><v-icon>mdi-account-edit</v-icon>Account</v-tab>
    </v-tabs>

      <v-window v-model="currentTab">
        <v-window-item value="calendar">
          <v-container   height="100%">
            <v-row no-gutters>
              <v-col> 
                
                <RideList
                 :key = "dateChanged"
                 :date = "ridesDate" 
                 :user = "currentUser"
                 @showRoute = "showRoute"
                 @log-in="logIn"
                 @edit-ride="editRide"
                 >
                </RideList>
                 
                <baseDatePicker  :large='false' text="Select other dates" :date="ridesDate"    @new-date="newDate"   />
              </v-col>
              <!-- <v-col>
                <RideMap
                  :map="map"
                 :route = "currentRoute"
                 :tab = "currentTab"
                 :user = "currentUser"
                 @define-map="defineMap"
                ></RideMap>

              </v-col> -->
            </v-row>
          </v-container>

        </v-window-item>

        <v-window-item value="routes">
          Routes
        </v-window-item>


        <v-window-item value="newRide">
          <v-container   height="100%">
            <v-row no-gutters>
              <v-col> 
                <RideEdit
                :ride="currentRide"
                :user="currentUser"
                @done-ride-edit="doneRideEdit"
                @showRoute = "showRoute"
                >
              </RideEdit>
              </v-col>
              <!-- <v-col>
                <RideMap
                 :map="map"
                 :route = "currentRoute"
                 :tab = "currentTab"
                 :user = "currentUser"
                 @define-map="defineMap"
                ></RideMap>

              </v-col> -->
            </v-row>
          </v-container>
        </v-window-item>
        
        <v-window-item value="coffee">
          Coffee
        </v-window-item>


        <v-window-item value="library">
          library
        </v-window-item>

        <v-window-item value="account">
          <account-actions 
       
            :user="currentUser"
            @done-login="doneLogin"
          ></account-actions>
                   
        </v-window-item>
      </v-window>
    </v-col>
    <v-col>
      <RideMap
        :map="map"
        :show-profile="showProfile"
        :route = "currentRoute"
        :tab = "currentTab"
        :user = "currentUser"
        @define-map="defineMap"
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
