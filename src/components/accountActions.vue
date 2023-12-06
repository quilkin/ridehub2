<script setup lang="ts">
import { ref, onMounted, onUpdated } from 'vue'
import signup from './account/Signup.vue'
import login from './account/login.vue'
import account from './account/account.vue'
import reqpass from './account/reqpassword.vue'
import { myFetch } from '@/utils/fetch'
import { apiMethods} from '../../../ridehub-server/src/common/apimethods'
import { User } from '../../../ridehub-server/src/common/user'
import { Message, AlertError } from '../utils/alert'
import { Events } from '../utils/events'

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

        // const response = await myFetch('test',null);
        // alert(response);
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
        //status.value =  currentUser.role>0 ? Status.loggedIn : Status.loggingIn;
        emit('doneAccount',props.user);
}
async function completeRegistration(user: string,regcode: string) {
        var creds = { name: user, code: regcode };
        const res = await myFetch(apiMethods.register, creds);
        if (res===null)
                await AlertError("Credentials","Invalid username , code or email");
        else if (res.substring(0, 9) === "Thank you")           //"Thank you, you have now registered"
        {
                await Message("Thank you, you can now log in");
                //status.value = Status.loggingIn;
                          // close current page and re-open, in normal fashion (i.e.no attributes)
                let thisWindow = window.location.href;
                let qmark = thisWindow.indexOf('?');
                thisWindow = thisWindow.substring(0,qmark-1);
                window.open(thisWindow,"_self")
        } else {
                await AlertError("Credentials",res);
        }

}
async function resetAccount(lostPWuser : string) {
        // get user's details
        // server will check that timeout hasn't expired
        var success = false;
        const user : User = await myFetch(apiMethods.findUser,  lostPWuser);
        if (user != null) {

                success = true;
                //passwordReset = true;
                // remainder of res has login id
                // const userID = result.substring(2);
                // const id = parseInt(userID);
                await Message(`OK ${user.name}, now please set new password`);
                currentUser = user;
                status.value = Status.acccountPage;
        }

        else {
                await AlertError("Credentials",'email or username problem');
        }
}
</script>

<template>
    <login  v-if="status===Status.loggingIn"
            @logged-in="loggedIn"
            @sign-up="status=Status.signingUp"
            @forgot-pass="status=Status.reqPassword"
            @guest-visit="emit('doneLogin',new User('',''))"
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

