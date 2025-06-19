<script setup lang="ts">

/**
 * Controlling the four sub-views under ./account
 */
import { ref, onMounted, onUpdated } from 'vue'
import signup from './account/Signup.vue'
import login from './account/login.vue'
import account from './account/account.vue'
import reqpass from './account/reqpassword.vue'
import { myFetch } from '../utils/fetch'
import { apiMethods} from '../../../ridehub-server/src/common/apimethods'
import { User } from '../../../ridehub-server/src/common/user'
import { Message, AlertError } from '../utils/alert'
//import { Events } from '../utils/events'

const props = defineProps<{
  user : User
}>()

enum Status {
        loggingIn,
        loggedIn,
        signingUp,
        reqPassword,
        acccountPage
}

const status = ref(Status.loggingIn)
let currentUser : User;

let updated = false;

onMounted(async() => {

  currentUser = props.user;
  // check for (and act on) any URL params for registration
  // when app is accessed automatically from registration or 'forgot pw' emails
  let urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get('user');
  const regcode = urlParams.get('regcode');
  const userWhoForgotPW = urlParams.get('pwuser');

  if (username !== null && regcode !== null) {
        await completeRegistration(username, regcode);
  }
  else if (userWhoForgotPW !== null && regcode !== null) {
        await resetAccount(userWhoForgotPW);
  }
  else if (props.user != undefined)
        status.value =  props.user.role>0 ? Status.loggedIn : Status.loggingIn;

  })
  onUpdated(() => {
        if (updated) 
                return;
        if (props.user != undefined && props.user.id>0)
        {
                currentUser = props.user;
                if (status.value != Status.reqPassword && status.value != Status.signingUp)
                        status.value =  props.user.role>0. ? Status.loggedIn : Status.loggingIn;
        }
        updated = true;
  })
  
const emit = defineEmits(['doneLogin','doneAccount','logout'])

function loggedIn(user : User) {
        emit('doneLogin',user);
}
function doneAccount() {
        emit('doneAccount',props.user);
}

/**
 * will be called automaticfally when user clciks link in registration email
 * @param user the rider's username
 * @param regcode the unique code sent in the email
 */
async function completeRegistration(user: string,regcode: string) {
        var creds = { name: user, code: regcode };
        const res = await myFetch(apiMethods.register, creds);
        if (res===null)
                await AlertError("Credentials","Invalid username , code or email");
        else if (res.substring(0, 9) === "Thank you")           //"Thank you, you have now registered" sent from server
        {
                await Message("Thank you, you can now log in");
                
        // close current page and re-open, in normal fashion (i.e.no URL parameters)
                let thisWindow = window.location.href;
                let qmark = thisWindow.indexOf('?');
                thisWindow = thisWindow.substring(0,qmark-1);
                window.open(thisWindow,"_self")
        } else {
                await AlertError("Credentials",res);
        }

}

/**
 * will be called automaticfally when user clciks link in 'lost password' email
 * @param lostPWuser 
 */
async function resetAccount(lostPWuser : string) {
        // get user's details
        // server will check that timeout hasn't expired
        var success = false;
        const user : User = await myFetch(apiMethods.findUser,  lostPWuser);
        if (user != null) {

                success = true;
                await Message(`OK ${user.name}, now please set new password`);
                currentUser = user;
                status.value = Status.acccountPage;
        }

        else {
                await AlertError("Credentials",'email or username problem');
        }
}
function guest() {
        console.log('guest visit emit donelogin')
        emit('doneLogin',new User('',''));
}
</script>

<template>
    <login  v-if="status===Status.loggingIn"
            @logged-in="loggedIn"
            @sign-up="status=Status.signingUp"
            @forgot-pass="status=Status.reqPassword"
            @guest-visit="guest"
            ></login>
    <reqpass v-else-if="status===Status.reqPassword"
            @done-pass="status=Status.loggingIn"
    ></reqpass>
    <signup v-else-if="status===Status.signingUp"
            @done-sign-up="status=Status.loggingIn"
    ></signup>
    <account v-else
            :user="currentUser"
            @done-account="doneAccount"
            @logout="emit('logout')"
    ></account>
</template>

