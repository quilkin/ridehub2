<script setup lang="ts">
  import { ref  } from 'vue'
  import { VDatePicker } from 'vuetify/labs/VDatePicker'

  const props = defineProps<{ date : Date }>()
  const emit = defineEmits(['newDate']);
  const datePickerActive = ref(false);
  const workingDate = ref(props.date);

  function newDate() {
    console.log('DatePicker New Date: ' + workingDate.value);
    datePickerActive.value = false;
    emit("newDate",workingDate.value);
  }

</script>

<template>
  <div class="text-center">
    <v-btn color="blue"  variant="outlined" prepend-icon="mdi-calendar-month">
      <!-- <template v-slot:prepend>
        <v-icon  color="success"></v-icon>
      </template> -->
        Select other dates
      <v-dialog
        v-model="datePickerActive"
        activator="parent"
        width="auto"
      >
        <v-date-picker title="Start Date" width = "200" v-model="workingDate" @click:save="newDate"/>
      </v-dialog>
    </v-btn>
  </div>
</template>
  
 