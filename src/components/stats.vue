<script setup lang="ts">

import { ref ,onMounted, computed, onUpdated, watch, type Ref } from 'vue'
import { myFetch } from '@/utils/fetch'
import { apiMethods} from '../../../ridehub-server/src/common/apimethods'
import { User } from '../../../ridehub-server/src/common/user'
import { AlertError} from '../utils/alert'
import { useDisplay } from 'vuetify'

const riderList= ref() as Ref<string[]>;
const riderStr = ref() as Ref<string[]>;
const countStr = ref() as Ref<string[]>;

const props = defineProps<{
  user : User
}>()

const { mobile } = useDisplay();

onMounted(() => {
  
    riderStr.value =[] as string[];
    countStr.value =   [] as string[];
    
    updateList();
    
})
// onUpdated(() => {
//   console.log("routelist updated");
// })
async function updateList(getData : boolean = true)
{

    const res : string[] = await myFetch(apiMethods.touristTrophy,0);
    if (res === null) 
        return;
    if (res.length == 0) {
      AlertError('File error','Cannot get results, sorry');
      return;
    }
    riderList.value = res;

    riderList.value.forEach((item,index) => {
        const cols = item.split(':');
        riderStr.value[index] = cols[0];
        countStr.value[index]    = cols[1];
    });

}

const listHeight= computed(() => {
  return mobile.value ? '25vh':'70vh';
})
</script>

<template>
  <v-container  class="pa-0" >

          <v-list density="compact"  :height="listHeight">
            <!-- <v-list density="compact"  style="height: 50vh;"> -->
            <v-list-item class="pa-0" density="compact" 
                v-for="(item, i) in riderList" :key="i"  :value="i" :active="true">
                    <v-row  no-gutters    >
                        <v-col cols="7"> <span class="d-block text-truncate">{{ riderStr[i] }} </span>    </v-col>
                        <v-col cols="4"  >
                           <small>{{ countStr[i] }}&nbsp;
                             </small>
                          </v-col>
                    </v-row>
            </v-list-item>
          </v-list>

  </v-container>
</template>

<style scoped>
/* .v-list {
  height: 450px;
  overflow-y: auto;
} */
.v-list-item {
  min-height: 10px !important;
  padding-top: 0;
  padding-bottom: 0;
}
</style>