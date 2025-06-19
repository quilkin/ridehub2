<script setup lang="ts">

/**
 * a simple help page - not ineractive
 */
</script>


<template>
<v-card title="TCC RideHub: help">
  <v-card-text>
    If you cannot find what you need to know below, please

    <a target="_blank" href="mailto:rides@truro.cc?subject=RideHub%20help">
      send an email
    </a>
    to us and we'll try to help some more.
  </v-card-text>
<v-expansion-panels>
  <v-expansion-panel title="Rides: see which rides are planned for the following month or so">
    <v-expansion-panel-text>
      <v-list >
        <v-list-item>View distances, amount of climbing, and proposed average speed</v-list-item>
        <v-list-item>See who is leading each ride</v-list-item>
        <v-list-item>Click the ride destination to view it on the map and see the climbing profile </v-list-item>
        <v-list-item>Run your mouse (or finger) along the profile to trace through the route </v-list-item>
        <v-list-item>join one of the rides, by clicking 'Join + more' (see below)</v-list-item>
        <v-list-item>You can choose other dates to see other planned rides, or view past rides</v-list-item>
      </v-list>
    </v-expansion-panel-text>
  </v-expansion-panel>
  <v-expansion-panel title="Join (and more)">
    <v-expansion-panel-text>
      <v-list >
        <v-list-item>It's good for the ride leader to know how many are joining</v-list-item>
        <v-list-item>If you have registered with RideHub (see below), you can sign up for a ride, by clicking 'Join'</v-list-item>
        <v-list-item>If you have already signed up, click 'Me' to remove yourself....</v-list-item>
        <v-list-item>..... or to add a guest rider that you want to bring along</v-list-item>
        <v-list-item>You can grab the GPS route route for your Garmin/Wahoo ...</v-list-item>
      </v-list>
    </v-expansion-panel-text>
  </v-expansion-panel>
  <v-expansion-panel title="Routes: see a list of local routes (of varying distance) that you can choose">
    <v-expansion-panel-text>
      <v-list>
        <v-list-item>to ride yourself (click 'Get GPX' to download and load into your Garmin/Wahoo etc)</v-list-item>
        <v-list-item>or lead a ride using the route (click the 'Bike' icon)</v-list-item>
      </v-list>
    </v-expansion-panel-text>
  </v-expansion-panel>
  <v-expansion-panel title="New: Create and lead your own ride...">
    <v-expansion-panel-text>
      <v-list>
        <v-list-item>lead a ride using one of the predefined routes....</v-list-item>
        <v-list-item>... or upload your own route (e.g. from RideWithGPS, Cycle.travel, Strava) ...</v-list-item>
        <v-list-item>... or lead a ride without a defined route</v-list-item>
        <v-list-item>Choose the size of your group</v-list-item>
        <v-list-item>Decide on date, time and your proposed average speed</v-list-item>
        <v-list-item>You can edit (or remove) a ride that you have planned to lead, by going to the monthly ride list and using 'Join and More'</v-list-item>
      </v-list>
    </v-expansion-panel-text>
  </v-expansion-panel>
  <v-expansion-panel title="Signing up">
    <v-expansion-panel-text>
      <v-list>
        <v-list-item>You can use the app to view routes and rides without creating an account</v-list-item>
        <v-list-item>To join rides or organise your own rides, you will need to create an account.</v-list-item>
        <v-list-item>Click ‘Sign Up’ on the login page to get started. You will be sent an email to confirm your registration</v-list-item>
        <v-list-item>If you forget your password we can email you a link to set a new one</v-list-item>
      </v-list>
    </v-expansion-panel-text>
  </v-expansion-panel>
  <v-expansion-panel title="Account: Personal options">
    <v-expansion-panel-text>
      <v-list>
        <v-list-item>You can choose whether to have your distances in miles or kilometres</v-list-item>
        <v-list-item>You can choose to show (or not) the amount of climbing involved in a ride</v-list-item>
        <v-list-item>You can choose whether or not to have an email sent to you automatically if a new ride is posted by another member, or if a ride that you have joined has changed date etc.</v-list-item>
        <v-list-item></v-list-item>
      </v-list>
    </v-expansion-panel-text>
  </v-expansion-panel>
  <v-expansion-panel title="Extra features">
    <v-expansion-panel-text>
      <v-list>
        <v-list-item>(Not yet imlemented in this version)</v-list-item>
        <v-list-item>See a map of suggested local coffee stops, with opening details.</v-list-item>
        <v-list-item>View a list of cycling books that you can borrow from other TCC members</v-list-item>
      </v-list>
    </v-expansion-panel-text>
  </v-expansion-panel>

</v-expansion-panels>


</v-card>
</template>