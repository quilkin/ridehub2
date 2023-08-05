<script setup lang="ts">
import signup from './components/Signup.vue'
import login from './components/login.vue'
import account from './components/account.vue'
import { ref } from 'vue'

const tab = ref(null);
const loggedIn = ref(true);
</script>


<template>
    <v-sheet width="auto" class="mx-auto">
    <v-tabs
      v-model="tab"
      bg-color="blue"
      show-arrows
    >
      <v-tab value="calendar">Calendar</v-tab>
      <v-tab value="routes">All routes</v-tab>
      <v-tab value="new">New Ride</v-tab>
      <v-tab value="coffee">Coffee</v-tab>
      <v-tab value="library">Library</v-tab>
      <v-tab value="account">Account</v-tab>
    </v-tabs>

    <v-card-text>
      <v-window v-model="tab">
        <v-window-item value="calendar">
          One
        </v-window-item>

        <v-window-item value="routes">
          Two
        </v-window-item>


        <v-window-item value="new">
          Two
        </v-window-item>
        
        <v-window-item value="coffee">
          Two
        </v-window-item>


        <v-window-item value="library">
          Two
        </v-window-item>

        <v-window-item value="account">
          <v-btn v-if="loggedIn===false" color="blue">
            Log In
            <login></login>
          </v-btn>
          <account v-else></account>
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-sheet>
</template>