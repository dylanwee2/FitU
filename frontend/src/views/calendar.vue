<template>
  <div class='col-lg-8'>
    <div class="row mb-2">
      <div class='col-lg-4'>
        <div class="container">
          <input type="file" class="upload-box" accept=".ics" @change="handleIcsUpload" />
        </div>
      </div>
      <div class="col-lg-2"></div>
      <div class="col-lg-4"></div>
      <button class="col-lg-2 border text-white" style="border-radius: 10px; background-color: #2C3E50" @click="openEventForm">
        Add Event
      </button>
    </div>

    <!-- Popup Form -->
    <div v-if="showEventForm" class="modal-backdrop" style="position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10000;background:rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
      <div style="background:white;padding:2rem;border-radius:10px;min-width:300px;max-width:90vw;">
        <button @click="closeEventForm"
          style="position:relative;top:-30px;left:240px;border:none;background:transparent;font-size:1.5rem;line-height:1;cursor:pointer;">
          &times;
        </button>
        <h5 class="mt-0 mb-3">Add Event</h5>
        <div class="mb-2">
          <label>Title:</label>
          <input v-model="newEvent.title" class="form-control" required />
        </div>
        <div class="mb-2">
          <label>Start:</label>
          <input v-model="newEvent.start" type="datetime-local" class="form-control" required />
        </div>
        <div class="mb-2">
          <label>End:</label>
          <input v-model="newEvent.end" type="datetime-local" class="form-control" />
        </div>
        <div class="mb-2">
          <label>
            <input type="checkbox" v-model="newEvent.allDay" />
            All Day
          </label>
        </div>
        <div class="mb-2">
          <label>Description:</label>
          <input v-model="newEvent.description" class="form-control" />
        </div>
        <!-- <div class="mb-2">
          <label>Department:</label>
          <input v-model="newEvent.department" class="form-control" />
        </div> -->
        <div class="d-flex justify-content-end">
          <button class="btn btn-secondary me-2" @click="closeEventForm">Cancel</button>
          <button class="btn btn-primary" @click="submitEvent">Add</button>
        </div>
      </div>
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


const showEventForm = ref(false)
const newEvent = ref({
  title: '',
  start: '',
  end: '',
  allDay: false,
  description: '',
  department: ''
})

function closeEventForm() {
  showEventForm.value = false
}

function openEventForm() {
  showEventForm.value = true
  // Reset form
  newEvent.value = {
    title: '',
    start: '',
    end: '',
    allDay: false,
    description: '',
    department: ''
  }
}


function submitEvent() {
  if (calendarInstance) {
    calendarInstance.addEvent({
      title: newEvent.value.title,
      start: newEvent.value.start,
      end: newEvent.value.end || undefined,
      allDay: newEvent.value.allDay,
      description: newEvent.value.description,
      extendedProps: {
        department: newEvent.value.department
      }
    })
    closeEventForm()
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
.upload-box {
  outline: none;
  box-shadow: 1px 1px 1px black;
  border-radius: 50px;
  background: white;
}

::-webkit-file-upload-button {
  color: white;
  background: #2C3E50;
  padding: 5px;
  border: none;
  border-radius: 50px;
  box-shadow: 1px 0 1px 1px #233241;
  outline: none;
}

::-webkit-file-upload-button:hover {
  background-color: #3c556e;
  cursor:pointer;
}
</style>
