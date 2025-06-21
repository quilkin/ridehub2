<script setup lang="ts">

/**
 * Select a date using vuepic/vue-datepicker library 
 */
import { ref, type Ref } from 'vue'
//import { mdiCalendarMonth } from '@mdi/js'
import DatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { TimesDates} from '../../../ridehub-server/src/common/timesdates'
  
  const props = defineProps<{
    date : Date,
    text : string,
    icon: boolean ,
    dates : number[],  /*  dates already having rides */
    }>()
  const emit = defineEmits(['newDate']);
  const workingDate = ref(props.date);
 
  function newDate() {
      emit("newDate",workingDate.value);
  }

 
  const highlightedDates = ref() as Ref<Date[]>;
  highlightedDates.value = [];
  props.dates.forEach((intDate)=> {
    highlightedDates.value.push(TimesDates.fromIntDays(intDate))
  });

  const format = (date : Date) => {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}


</script>

<template>
  <div class="text-center">
        <DatePicker
           locale="en-UK"
           auto-apply
           :enable-time-picker="false"
           :format="format"
           :teleport="true"
           v-model="workingDate"
           no-hours-overlay
           no-minutes-overlay
           :clearable="false"
           @update:modelValue="newDate" 
           :min-date="new Date()"
           :highlight="highlightedDates"
           :six-weeks="true"   />
  </div>
</template>
  
