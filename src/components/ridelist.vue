<script setup  lang="ts">

function testClick(data : String) {
  alert('Item: ' + data)
}
const items = [
    { title: 'Item 1', value: 1, subtitle: 'subtitle',   },
    { title: 'Item 2', value: 2, subtitle: 'this is a test for a long description  this is a test for a long description this is a test for a long description',    },
    { title: 'Item 3', value: 3, subtitle: 'subtitle',     },
    { title: 'Item 4', value: 4, subtitle: 'subtitle',   },
    { title: 'Item 5', value: 5, subtitle: 'this is a test for a long description  this is a test for a long description this is a test for a long description',    },
    { title: 'Item 6', value: 6, subtitle: 'subtitle',     },
    { title: 'Item 7', value: 7, subtitle: 'subtitle',   },
    { title: 'Item 8', value: 8, subtitle: 'this is a test for a long description  this is a test for a long description this is a test for a long description',    },
    { title: 'Item 9', value: 9, subtitle: 'subtitle',     },
    { title: 'Item 10', value: 10, subtitle: 'subtitle',   },
    { title: 'Item 11', value: 11, subtitle: 'this is a test for a long description  this is a test for a long description this is a test for a long description',    },
    { title: 'Item 12', value: 12, subtitle: 'subtitle',     },
  ]
</script>

<template>
<v-list lines="three"  density="compact">
    <v-list-item v-for="(item, i) in items" :key="i" >
      <v-row  no-gutters>
        <v-col>
      <v-list-item-title v-text="item.title"></v-list-item-title>
    </v-col>
    <v-col>
        <v-btn variant='tonal' density="compact" @click="testClick(item.value  + 'A')">
          {{ item.value  }}A
        </v-btn>
      </v-col>
      <v-col>
        <small>some more text</small>
      </v-col>
      <v-col>
        <v-btn variant='tonal' size="small" @click="testClick(item.value + 'B')">
          {{ item.value }}B
        </v-btn>
      </v-col>
      </v-row>
        <v-list-item-subtitle v-text="item.subtitle"></v-list-item-subtitle>
    </v-list-item>
  </v-list>
</template>
