<script setup lang="ts">
import signup from './components/Signup.vue'
import login from './components/login.vue'
import account from './components/account.vue'
import { ref } from 'vue'

const tab = ref(null);
const loggedIn = ref(false);
const signingUp = ref(false);
const loginDialog = ref(false);
// const signUpDialog = ref(false);

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
      <v-tab value="account" @click="loginDialog=true">Account</v-tab>
    </v-tabs>

    <!-- <v-card-text> -->
      <v-window v-model="tab">
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
          <!-- <v-btn color="blue">
            Log In
            <login v-if="loggedIn===false"
            @logged-in="loggedIn = true">
          </login>
          </v-btn> -->
        </v-window-item>

        <v-window-item value="account">
          <login v-model=loginDialog v-if="loggedIn===false && signingUp===false"
            @logged-in="loggedIn = true"
            @sign-up="signingUp = true"
          >
          </login>
          <account v-else-if="signingUp===false"></account>
          <signup v-model=signingUp v-else></signup>
        </v-window-item>
      </v-window>
    <!-- </v-card-text> -->
  </v-sheet>
</template>