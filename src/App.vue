<script setup lang="ts">
import { ref , type Ref } from 'vue'
import accountActions from './components/accountActions.vue'
import RideMap from './components/ridemap.vue'

import { User } from './utils/user'
import { myFetch } from './utils/fetch'
import RideList from './components/ridelist.vue'
import { Route }  from './utils/route'
import { myAlert } from './utils/myAlert'
//import { MapData } from './utils/mapdata'


const currentTab = ref('account');
const currentUser = ref(new User());
const ridesDate = ref(new Date());
const currentRoute = ref(new Route());
//const mapData = ref(new MapData());


function switchTab(tab: string) {
  currentTab.value = tab;
}
async function doneLogin(user : User) {
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

function showRoute(route : Route) {
    //mapData.value.currentRoute = route;
    //mapData.value.currentTab = 'calendar';
    currentRoute.value = route;
    currentTab.value = 'calendar';
    console.log('*****showRoute: '+ (route.url.length > 100? 'OK' : 'no route'));
}


</script>

<template>
    <v-sheet width="auto" class="mx-auto">
    <v-tabs
      v-model="currentTab"
      bg-color="transparent"
      color="blue"
      show-arrows
      stacked
    >
      <v-tab value="calendar"><v-icon>mdi-calendar-month</v-icon>Calendar</v-tab>
      <v-tab value="routes"><v-icon>mdi-map</v-icon>All routes</v-tab>
      <v-tab value="new"><v-icon>mdi-bike</v-icon>New Ride</v-tab>
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
                 :date = "ridesDate" 
                 :user = "currentUser"
                 @showRoute = "showRoute"
                 >
                </RideList>
              </v-col>
              <v-col>
                <RideMap
                 :route = "currentRoute"
                 :tab = "currentTab"
                 :user = "currentUser"
                ></RideMap>

              </v-col>
            </v-row>
          </v-container>

        </v-window-item>

        <v-window-item value="routes">
          Routes
        </v-window-item>


        <v-window-item value="new">
          New ride
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

  </v-sheet>
</template>

<style>
.v-btn {
  text-transform: none;
  padding: 0;
}
</style>
<style scoped>
#mapContainer {
  width: auto;
  height: 80vh;
}
</style>./utils/routes