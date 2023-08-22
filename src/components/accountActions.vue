<script setup lang="ts">
import { ref, onBeforeMount, onUpdated } from 'vue'
import signup from './account/Signup.vue'
import login from './account/login.vue'
import account from './account/account.vue'
import reqpass from './account/reqpassword.vue'
import { User } from '../utils/user'

const props = defineProps<{
  user : User
}>()

const status = ref('loggingIn')
var updated = false;

onBeforeMount(() => {
        if (props.user != undefined)
                status.value =  props.user.role>0 ? 'loggedIn' : 'loggingIn'
  })
  onUpdated(() => {
        if (updated) 
                return;
        if (props.user != undefined)
                status.value =  props.user.role>0 ? 'loggedIn' : 'loggingIn'
        updated = true;
  })
  
const emit = defineEmits(['doneLogin','guest'])

function loggedIn(user : User) {
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

