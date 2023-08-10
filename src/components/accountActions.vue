<script setup lang="ts">
import { ref, onBeforeMount, onUpdated } from 'vue'
import signup from './account/Signup.vue'
import login from './account/login.vue'
import account from './account/account.vue'
import reqpass from './account/reqpassword.vue'
import { User } from '../utils/user'

const props = defineProps({
  loggedIn: Boolean
})
const loggingIn = ref(!props.loggedIn);
const signingUp = ref(false);
const requestPass = ref(false);
const status = ref('')

const emit = defineEmits(['loggedIn','guest'])
function showLogin() {
    if (props.loggedIn===false && signingUp.value===false && requestPass.value===false)
        return true;
}
onBeforeMount(() => {
    status.value = props.loggedIn ? 'showAccount':'loggingIn';
    console.log('before mount: ' + status.value + ' ' + props.loggedIn)
});
onUpdated(() => {
    status.value = props.loggedIn ? 'showAccount':'loggingIn';
    console.log('updated: ' + status.value + ' ' + props.loggedIn)

});
function loggedIn(user : User) {
  loggingIn.value=false;
  emit('loggedIn',user);
}
</script>

<!-- <template>
    <login  v-if="status==='loggingIn'"
            @logged-in="emit('loggedIn')"
            @sign-up="status='signingUp'"
            @forgot-pass="status='reqPassword'"
            @guest-visit="status=''; emit('guest')"
            ></login>
    <reqpass v-else-if="status==='reqPassword'"
            @done-pass="status='loggingIn'"
    ></reqpass>
    <signup v-else-if="status==='signingUp'"
            @done-sign-up="status='loggingIn'"
    ></signup>
    <account v-else></account>
</template> -->

<template>
    <login v-model=loggingIn v-if="showLogin()"
            @logged-in="loggedIn"
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