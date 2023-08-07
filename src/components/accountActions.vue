<script setup lang="ts">
import { ref } from 'vue'
import signup from './account/Signup.vue'
import login from './account/login.vue'
import account from './account/account.vue'
import reqpass from './account/reqpassword.vue'

const props = defineProps({
  loggedIn: Boolean
})
const loggingIn = ref(!props.loggedIn);
const signingUp = ref(false);
const requestPass = ref(false);

const emit = defineEmits(['loggedIn','guest'])

</script>

<template>
    <login v-model=loggingIn v-if="loggedIn===false && signingUp===false && requestPass===false"
            @logged-in="emit('loggedIn')"
            @sign-up="signingUp = true"
            @forgot-pass="requestPass = true"
            @guest-visit="loggingIn=false; emit('guest')"
            ></login>
    <reqpass v-model=requestPass v-else-if="requestPass"
            @done-pass="requestPass = false"
    ></reqpass>
    <signup v-model=signingUp v-else-if="signingUp"
            @done-sign-up="signingUp = false"
    ></signup>
    <account v-else></account>
</template>