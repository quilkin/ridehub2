<script setup lang="ts">
  import { ref, onMounted  } from 'vue'
  import { VDatePicker } from 'vuetify/labs/VDatePicker'

  const props = defineProps<{ date : Date, text : string, large: boolean }>()
  const emit = defineEmits(['newDate']);
  const datePickerActive = ref(false);
  const workingDate = ref(props.date);

  onMounted(() => {
    console.log('baseDatePicker onMounted');

  });
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
    <v-btn  :size="props.large?'large':'medium'" :color="props.large? 'grey':'blue'"  variant=outlined prepend-icon="mdi-calendar-month" width="200">
        {{props.text}}
      <v-dialog
        v-model="datePickerActive"
        activator="parent"
        width="auto"
        content-class="datepicker-dialog"
      >
        <v-date-picker title="Start Date" width = "200" height = "550" v-model="workingDate" @click:save="newDate" @click:cancel="cancel()"/>
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