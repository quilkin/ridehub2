<script setup lang="ts">
import accountActions from './components/accountActions.vue'

import { ref } from 'vue'

const currentTab = ref('account');
const loggedIn = ref(false);
const loginDialog = ref(false);


function switchTab(tab: string) {
  currentTab.value = tab;
}
</script>


<template>
    <v-sheet width="auto" class="mx-auto">
    <v-tabs
      v-model="currentTab"
      bg-color="blue"
      show-arrows
      stacked
    >
      <v-tab value="calendar"><v-icon>mdi-calendar-month</v-icon>Calendar</v-tab>
      <v-tab value="routes"><v-icon>mdi-map</v-icon>All routes</v-tab>
      <v-tab value="new"><v-icon>mdi-bike</v-icon>New Ride</v-tab>
      <v-tab value="coffee"><v-icon>mdi-coffee</v-icon>Coffee</v-tab>
      <v-tab value="library"><v-icon>mdi-book-open-page-variant</v-icon>Library</v-tab>
      <v-tab value="account" @click="loginDialog=true"><v-icon>mdi-account-edit</v-icon>Account</v-tab>
    </v-tabs>

    <!-- <v-card-text> -->
      <v-window v-model="currentTab">
        <v-window-item value="calendar">
          <v-container>
            <v-row>
              <v-col>
                will be list of month's rides
              </v-col>
              <v-col>
                will be a map
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
          <account-actions :logged-in="loggedIn"
            @logged-in="loggedIn=true; switchTab('calendar')"
            @guest="switchTab('calendar')"
          ></account-actions>
                   
        </v-window-item>
      </v-window>
    <!-- </v-card-text> -->
  </v-sheet>
</template>