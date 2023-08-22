<script setup lang="ts">
import { ref } from 'vue'
import accountActions from './components/accountActions.vue'
import myMap from './components/map.vue'
import { User } from './utils/user'
import RideList from './components/ridelist.vue'

const currentTab = ref('account');
const currentUser = ref(new User());
const ridesDate = ref(new Date());

function switchTab(tab: string) {
  currentTab.value = tab;
}
function doneLogin(user : User) {
  if (user===null)
  {
    console.log("guest user");
    //accountTab.value.setTabView(false);
  }
  else {
    console.log("login by " + user.email);
    currentUser.value = user;
  }
  switchTab('calendar');
 
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

    <!-- <v-card-text> -->
      <v-window v-model="currentTab">
        <v-window-item value="calendar">
          <v-container   height="100%">
            <v-row no-gutters>
              <v-col>    <RideList :date = "ridesDate" :user="currentUser"></RideList>   </v-col>
              <v-col>    <myMap></myMap>         </v-col>
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
    <!-- </v-card-text> -->
  </v-sheet>
</template>