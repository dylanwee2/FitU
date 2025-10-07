<template>
  <div ref="calendarRef"></div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';

const calendarRef = ref(null)

onMounted(async () => {
  await nextTick()
  if (calendarRef.value) {
    const calendar = new Calendar(calendarRef.value, {
      plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      themeSystem: 'bootstrap5',
      navLinks: false,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
      },
      events: 'https://fullcalendar.io/api/demo-feeds/events.json',
      editable: true,
      selectable: true,
      nowIndicator: true
    })
    calendar.render()
  } else {
    console.error('calendarRef is null')
  }
});
</script>

<style>
.fc-daygrid-day-frame, .fc-scrollgrid-sync-inner {
  background-color: white;
}

.fc a, .fc-daygrid-day-number, .fc-event {
  text-decoration: none !important;
}


/* .fc-day-today {
  background-color: #ffe082 !important; 
  border: 2px solid #ffb300 !important;
  border-radius: 6px; 
} */

</style>