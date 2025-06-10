 
<script setup lang="ts">
  import { ref, onBeforeMount } from 'vue'
  import type { Ref } from 'vue'
  import { Bar } from 'vue-chartjs'

  import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, Chart, type ChartData, type ChartOptions } from 'chart.js'

  const chartData = ref({
          labels: [ 'January', 'February', 'March' ],
          datasets: [ { data: [50, 30, 35] } ]
        }) as Ref<ChartData>;
          
  const chartOptions  = ref( {
          responsive: true
        }) as Ref<ChartOptions>;

  onBeforeMount(() => {
    
      ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);
      console.log('bartest: onBeforeMount');

  })


  </script>

<template>
  <Bar
    :options = "chartOptions"
    :data ="chartData"
  />
</template>   
 


 <!-- <template>
  <Bar
    id="my-chart-id"
    :options="chartOptions"
    :data="chartData"
  />
</template>

<script lang="ts">
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default {
  name: 'BarChart',
  components: { Bar },
  data() {
    return {
      chartData:  {
        labels: [ 'January', 'February', 'March' ],
        datasets: [ { data: [40, 20, 12] } ]
      },
      chartOptions: {
        responsive: true
      }
    }
  }
}
</script>     -->
