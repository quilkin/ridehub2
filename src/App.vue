<script setup lang="ts">
import { ref } from 'vue'
import accountActions from './components/accountActions.vue'
import myMap from './components/map.vue'
import { User } from './utils/user'

const currentTab = ref('account');
const user = ref(new User);

function switchTab(tab: string) {
  currentTab.value = tab;
}
function loggedIn(user : User) {
  console.log("login by " + user.email);
  switchTab('calendar');
}
const items = [
    {
      title: 'Item #1',
      value: 1,
    },
    {
      title: 'Item #2',
      value: 2,
    },
    {
      title: 'Item #3',
      value: 3,
    },
  ]

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
          <v-container>
            <v-row no-gutters>
              <v-col>
                <v-card
   
                >
                  <v-list :items="items"></v-list>
                </v-card>
              </v-col>
              <v-col>
                <v-card
                >
                <myMap></myMap>
              </v-card>
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
          <account-actions :logged-in="user.role>0"
            @logged-in="loggedIn"
            @guest="switchTab('calendar')"
          ></account-actions>
                   
        </v-window-item>
      </v-window>
    <!-- </v-card-text> -->
  </v-sheet>
  <!-- <notifications position="top center" duration="-1"/> -->
</template>