<script setup lang="ts">


</script>


<template>
<v-card title="TCC RideHub can be used to do the following">

<v-expansion-panels>
  <v-expansion-panel title="See which rides are planned for the following month or so...">
    <v-expansion-panel-text>
      <v-list >
        <v-list-item>view distances, amount of climbing, and proposed average speed</v-list-item>
        <v-list-item>see who is leading the ride</v-list-item>
        <v-list-item>sign up for one of them </v-list-item>
        <v-list-item>choose other dates to see other planned rides, or view past rides</v-list-item>
      </v-list>
    </v-expansion-panel-text>
  </v-expansion-panel>
  <v-expansion-panel title="Sign up for a ride">
    <v-expansion-panel-text>
      <v-list >
        <v-list-item>It's good for the ride leader to know how many are joining</v-list-item>
        <v-list-item>Grab the GPS route route for your Garmin/Wahoo ...</v-list-item>
        <v-list-item>Add a guest rider, if you have already joined a ride yourself</v-list-item>
        <v-list-item>Remove yourself from a ride that you have previously signed up for</v-list-item>
      </v-list>
    </v-expansion-panel-text>
  </v-expansion-panel>
  <v-expansion-panel title="See a list of local routes (of varying distance) that you can choose to...">
    <v-expansion-panel-text>
      <v-list>
        <v-list-item>ride yourself</v-list-item>
        <v-list-item>lead a ride using the route</v-list-item>
        <v-list-item>download to put into your Garmin/Wahoo etc</v-list-item>
      </v-list>
    </v-expansion-panel-text>
  </v-expansion-panel>
  <v-expansion-panel title="Create and lead your own ride...">
    <v-expansion-panel-text>
      <v-list>
        <v-list-item>Upload your own route (e.g. from RideWithGPS, Cycle.travel, Strava) ...</v-list-item>
        <v-list-item>..or lead a ride without a defined route</v-list-item>
        <v-list-item>Choose the size of your group</v-list-item>
        <v-list-item>Decide on date, time and your proposed average speed</v-list-item>
        <v-list-item>Edit (or remove) a ride that you have planned to lead</v-list-item>
      </v-list>
    </v-expansion-panel-text>
  </v-expansion-panel>
  <v-expansion-panel title="Signing up">
    <v-expansion-panel-text>
      <v-list>
        <v-list-item>You can use the app to view routes and rides without creating an account</v-list-item>
        <v-list-item>To join rides or organise your own rides, you will need to create an account.</v-list-item>
        <v-list-item>Click ‘Sign Up’ on the 'Account' page to get started. You will be sent an email to confirm your registration</v-list-item>
        <v-list-item>If you forget your password we can email you a link to set a new one</v-list-item>
      </v-list>
    </v-expansion-panel-text>
  </v-expansion-panel>
  <v-expansion-panel title="Personal options">
    <v-expansion-panel-text>
      <v-list>
        <v-list-item>You can choose whether to have your distances in miles or kilometres</v-list-item>
        <v-list-item>You can choose to show (or not) the amount of climbing involved in a ride</v-list-item>
        <v-list-item>You can choose whether or not to have an email sent to you automatically if a new ride is posted by another member</v-list-item>
        <v-list-item></v-list-item>
      </v-list>
    </v-expansion-panel-text>
  </v-expansion-panel>
  <v-expansion-panel title="Extra features">
    <v-expansion-panel-text>
      <v-list>
        <v-list-item>See a map of suggested local coffee stops, with opening details.</v-list-item>
        <v-list-item>View a list of cycling books that you can borrow from other TCC members</v-list-item>
      </v-list>
    </v-expansion-panel-text>
  </v-expansion-panel>

</v-expansion-panels>


</v-card>
</template>