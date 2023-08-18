<script setup lang="ts">
import { ref, onBeforeMount, onUpdated } from 'vue'
import signup from './account/Signup.vue'
import login from './account/login.vue'
import account from './account/account.vue'
import reqpass from './account/reqpassword.vue'
import { User } from '../utils/user'

const props = defineProps({
  //loggedIn: Boolean
  user : User
})
//const loggingIn = ref(!props.loggedIn);
//const signingUp = ref(false);
//const requestPass = ref(false);
const status = ref('loggingIn')
var updated = false;

onBeforeMount(() => {
        if (props.user != undefined)
        //         status.value = props.status
                status.value =  props.user.role>0 ? 'loggedIn' : 'loggingIn'
  })
  onUpdated(() => {
        if (updated) 
                return;
                if (props.user != undefined)
        //         status.value = props.status
                status.value =  props.user.role>0 ? 'loggedIn' : 'loggingIn'
        updated = true;
  })
  
const emit = defineEmits(['doneLogin','guest'])
// function showLogin() {
//     if (props.loggedIn===false && signingUp.value===false && requestPass.value===false)
//         return true;
// }

// const setTabView = (loggedIn : Boolean) => {
//         loggingIn.value = !loggedIn;
//         //setTabView2(loggedIn);
// }
// // needs to be called from parent
// defineExpose({ setTabView })

function loggedIn(user : User) {
  //loggingIn.value=false;
  emit('doneLogin',user);
}
</script>

<template>
    <login  v-if="status==='loggingIn'"
            @logged-in="loggedIn"
            @sign-up="status='signingUp'"
            @forgot-pass="status='reqPassword'"
            @guest-visit="emit('doneLogin',null)"
            ></login>
    <reqpass v-else-if="status==='reqPassword'"
            @done-pass="status='loggingIn'"
    ></reqpass>
    <signup v-else-if="status==='signingUp'"
            @done-sign-up="status='loggingIn'"
    ></signup>
    <account v-else
            :user="user"
            @done-account="loggedIn"
    ></account>
</template>

<!-- <template>
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
</template> -->