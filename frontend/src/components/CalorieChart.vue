<template>
  <div class="card">
    <div class="card-body">
      <Bar :data="data" :options="options" />
    </div>
  </div>
</template>

<script>
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default {
  name: 'CalorieChart',
  components: { Bar },
  props: {
    series: { type: Array, required: true }
  },
  computed: {
    data() {
      const labels = this.series.map(s => this.formatLabel(s.date))
      const values = this.series.map(s => s.consumed || 0)
      return {
        labels,
        datasets: [
          {
            label: 'Calories',
            data: values,
            backgroundColor: '#2200e4'
          }
        ]
      }
    },
    options() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 600,
          easing: 'easeOutQuart'
        },
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Last 7 days' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    },
  },
  methods: {
    formatLabel(ymd) {
      const [y, m, d] = ymd.split('-').map(Number)
      const date = new Date(y, m - 1, d)
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }
  }
}
</script>

<style scoped>
.card-body {
  height: 260px;
}
</style>


