<script setup lang="ts">
  import { ref } from 'vue'
  //import { VDatePicker } from 'vuetify/labs/VDatePicker'
  import { mdiCalendarMonth } from '@mdi/js'
  import { setupCalendar, Calendar, DatePicker } from 'v-calendar';
import 'v-calendar/style.css';



  const props = defineProps<{ date : Date, text : string, large: boolean }>()
  const emit = defineEmits(['newDate']);
  const datePickerActive = ref(false);
  const workingDate = ref(props.date);

  function newDate() {
    datePickerActive.value = false;
    emit("newDate",workingDate.value);
  }
  function cancel() {
    datePickerActive.value = false;
  }

//   const attributes = ref([
//   {
//     highlight: 'green',
//     dates: [
//       new Date(2023, 10, 23),
//       new Date(2023, 11, 7),
//       new Date(2023, 11, 17),
//       new Date(2023, 11, 23),
//     ],
//   },
// ]);

</script>

<template>
  <div class="text-center">
    <v-btn  :size="props.large?'large':'medium'" :color="props.large? 'grey':'blue'"  variant=outlined :prepend-icon="mdiCalendarMonth" width="200">
        {{props.text}}
      <v-dialog
        v-model="datePickerActive"
        activator="parent"
        width="auto"
        content-class="datepicker-dialog"
      >
        <DatePicker
          v-model="workingDate"
           @update:modelValue="newDate"
           
           />

      </v-dialog>
    </v-btn>
  </div>
</template>
  
<style scoped>
  .v-dialog  :deep(.datepicker-dialog) {
    /* align-self: flex-start; */
    /* align-items: start;
    justify-content: start; */
    position: absolute;
    bottom: 0;
    left: 0;
  }
</style>