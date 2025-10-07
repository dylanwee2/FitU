<template>
  <div ref="calendarRef"></div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'

const calendarRef = ref(null)

onMounted(async () => {
  await nextTick()
  if (calendarRef.value) {
    const calendar = new Calendar(calendarRef.value, {
      plugins: [dayGridPlugin],
      initialView: 'dayGridMonth',
      editable: true
    })
    calendar.render()
  } else {
    console.error('calendarRef is null')
  }
})
</script>