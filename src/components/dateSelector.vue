<script setup lang="ts">
  import { ref } from 'vue'
  import { mdiCalendarMonth } from '@mdi/js'
  //import { DatePicker } from 'v-calendar';
  import DatePicker from '@vuepic/vue-datepicker';
  import '@vuepic/vue-datepicker/dist/main.css';
  
  const props = defineProps<{ date : Date, text : string, icon: boolean }>()
  const emit = defineEmits(['newDate']);
  const datePickerActive = ref(false);
  const workingDate = ref(props.date);
  const flow = ref(['calendar','month', 'year' ]);

  function newDate() {
    datePickerActive.value = false;
    emit("newDate",workingDate.value);
  }
  function cancel() {
    datePickerActive.value = false;
  }

</script>

<template>
  <div class="text-center">
    <v-btn class="pa-2 ma-2" size='large'  variant=outlined  >
      <v-icon start v-if="props.icon" :icon="mdiCalendarMonth">  </v-icon>
        {{props.text}}
      <v-dialog
        v-model="datePickerActive"
        activator="parent"
        width="auto"
        content-class="datepicker-dialog"
      >
        <DatePicker
          inline auto-apply 
           v-model="workingDate"
           locale="en-UK"
           @update:modelValue="newDate" 
           :six-weeks="true"   />
      </v-dialog>
    </v-btn>
  </div>
</template>
  
<style scoped>
  .v-dialog  :deep(.datepicker-dialog) {
    position: absolute;
    bottom: 0;
    left: 0;
  }
</style>