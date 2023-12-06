<script setup lang="ts">
  import { ref } from 'vue'
  import { mdiCalendarMonth } from '@mdi/js'
   import DatePicker from '@vuepic/vue-datepicker';
  import '@vuepic/vue-datepicker/dist/main.css';
  
  const props = defineProps<{ date : Date, text : string, icon: boolean }>()
  const emit = defineEmits(['newDate']);
  //const datePickerActive = ref(false);
  const workingDate = ref(props.date);
 
  function newDate() {
    //datePickerActive.value = false;
    emit("newDate",workingDate.value);
  }
  // function cancel() {
  //   datePickerActive.value = false;
  // }
  const startTime = ref({ hours: 9, minutes: 0 });

  //const date = ref(new Date());
  const format = (date : Date) => {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const hrs = date.getHours().toString().padStart(2,'0');
    const mins = date.getMinutes().toString().padStart(2,'0');

    return `${day} ${month} ${year} at ${hrs}:${mins}`;
}
</script>

<template>
  <div class="text-center">
    <!-- <v-btn class="pa-2 ma-2" size='large'  variant=outlined  >
      <v-icon start v-if="props.icon" :icon="mdiCalendarMonth">  </v-icon>
        {{props.text}}
      <v-dialog
        v-model="datePickerActive"
        activator="parent"
        width="auto"
        content-class="datepicker-dialog"
      > -->
        <DatePicker
           locale="en-UK"
           :format="format"
           time-picker-inline
           v-model="workingDate"
           minutes-increment="15"
           no-hours-overlay
           no-minutes-overlay
           :highlight-week-days="[0]"
           :clearable="false"
           @update:modelValue="newDate" 
           :min-date="new Date()"
           :six-weeks="true"   />
      <!-- </v-dialog>
    </v-btn> -->
  </div>
</template>
  
<!-- <style scoped>
  .v-dialog  :deep(.datepicker-dialog) {
    position: absolute;
    bottom: 0;
    left: 0;
  } 
</style>-->