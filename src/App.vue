<script setup lang="ts">
import { ref } from 'vue'
import accountActions from './components/accountActions.vue'
import myMap from './components/map.vue'
import { User } from './utils/user'
import RideList from './components/ridelist.vue'

const currentTab = ref('account');
const currentUser = ref(new User);
const accountTab = ref();
const setAccountView = () => {
  accountTab.value.setTabView(currentUser.value.role > 0);
}

function switchTab(tab: string) {
  currentTab.value = tab;
}
function loggedIn(user : User) {
  if (user===null)
  {
    console.log("failed login");
    accountTab.value.setTabView(false);
    return;

  }

  console.log("login by " + user.email);
  currentUser.value = user;
  switchTab('calendar');
 
}
function switchedToAccountTab() {
  setAccountView();
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
      <v-tab value="account" @click="setAccountView"><v-icon>mdi-account-edit</v-icon>Account</v-tab>
    </v-tabs>

    <!-- <v-card-text> -->
      <v-window v-model="currentTab">
        <v-window-item value="calendar">
          <v-container   height="100%">
            <v-row no-gutters>
              <v-col>    <RideList></RideList>   </v-col>
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
            ref="accountTab" 
            :logged-in="currentUser.role>0"
            @logged-in="loggedIn"
            @guest="switchTab('calendar')"
          ></account-actions>
                   
        </v-window-item>
      </v-window>
    <!-- </v-card-text> -->
  </v-sheet>
  <!-- <notifications position="top center" duration="-1"/> -->
</template>