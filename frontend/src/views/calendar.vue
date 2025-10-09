<!-- 
// calendarInstance.addEvent({
//         title: 'BCH237',
//         start: '2025-10-12T10:30:00',
//         end: '2025-10-12T11:30:00',
//         extendedProps: {
//           department: 'BioChemistry'
//         },
//         description: 'Lecture'
//       })
 -->
<template>
  <div class='col-lg-8'>
    <div class="row mb-2">
      <input type="file" accept=".ics" class='col-lg-4' @change="handleIcsUpload" />
      <div class="col-lg-2"></div>
      <div class="col-lg-4"></div>
      <button class="col-lg-2 border text-white" style="border-radius: 10px; background-color: #2C3E50" @click="addEvent">
        Add Event
      </button>
    </div>
    
    
    <div ref="calendarRef"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import ICAL from 'ical.js'

const calendarRef = ref(null)
let calendarInstance = null

const handleIcsUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const text = await file.text()
  const jcalData = ICAL.parse(text)
  const comp = new ICAL.Component(jcalData)
  const vevents = comp.getAllSubcomponents('vevent')

  const events = vevents.map(vevent => {
    const e = new ICAL.Event(vevent)
    return {
      title: e.summary,
      start: e.startDate.toJSDate(),
      end: e.endDate ? e.endDate.toJSDate() : undefined,
      allDay: e.startDate.isDate
    }
  })
  if (calendarInstance) {
    calendarInstance.removeAllEvents()
    calendarInstance.addEventSource(events)
  }
}

function addEvent() {
  if (calendarInstance) {
    calendarInstance.addEvent({
        title: 'BCH237',
        start: '2025-10-12T10:30:00',
        end: '2025-10-12T11:30:00',
        extendedProps: {
          department: 'BioChemistry'
        },
        description: 'Lecture'
    })
  } else {
    console.error('Calendar is not initialized yet.')
  }
}

onMounted(async () => {
  await nextTick()
  if (calendarRef.value) {
    calendarInstance = new Calendar(calendarRef.value, {
      plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      themeSystem: 'bootstrap5',
      navLinks: false,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
      },
      editable: true,
      selectable: true,
      nowIndicator: true
    })
    calendarInstance.render()
  } else {
    console.error('calendarRef is null')
  }
})
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
