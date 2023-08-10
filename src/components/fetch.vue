<script setup lang="ts">

defineOptions({
  inheritAttrs: false
})

import { ref  } from 'vue'

const props = defineProps({
  data : Object,
  url: String,
  waitDlg : Boolean,

})
const waiting = ref(false);
const webError = ref(false);
const emit = defineEmits(['fetched'])
var updated = false;

function quilkinUrlBase() {

    //return "https://www.quilkin.co.uk/routes.svc/";
    return "http://localhost/routes/routes.svc/";

}

const myFetch = () => {
  myFetch2();
}
defineExpose({ myFetch })

async function myFetch2() {

    updated = true;
    console.log('onUpdated');
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(props.data)
    }
    if (props.waitDlg) {
        waiting.value = true;
    }

    const url = quilkinUrlBase() + props.url;
    
    fetch(url, options)
        .then(res=>res.json()).then((response) => {
            emit("fetched",response);
            waiting.value = false;
              })
        .catch((error) => {
            webError.value = true;
            waiting.value = false;
            });
};
</script>

<template>
    <v-alert v-if = waiting  text="Please wait..."/>
    <v-alert closable v-model= webError  type="error" text="There is a problem with the web service"/>
</template>