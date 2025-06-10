<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
const props = defineProps({
  msg: String,
  title: String
})

// const show = ref(false)
// onBeforeMount(() => {

//         show.value = props.msg?.length > 0;
// });
function show()
{
    return props.msg?.length > 0;
}
</script>


<template>
        <v-alert v-if="show()"
          
          closable
          type="info"
          title=title
          text=msg
          
        ></v-alert>
  </template>