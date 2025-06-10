<script setup lang="ts">

import { useOverlay } from '@overlays/vue'


const props = defineProps<{
  title: String,
}>()


const { visible, resolve, reject } = useOverlay({
  // Duration of overlay duration to avoid premature destruction of the component
  duration: 1000,
})
</script>

<template>

  <v-dialog v-model="visible">
    <v-card>
    <v-card-text>{{ title }}</v-card-text>
        <v-card-actions>
          <v-btn color="primary" block @click="resolve(`${title}:confirmed`)">Close Dialog</v-btn>
        </v-card-actions>
    </v-card>
  </v-dialog>
</template>