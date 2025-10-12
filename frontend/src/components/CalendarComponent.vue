<template>
  <div class="calendar-component">
    <!-- Calendar Controls -->
    <div class="calendar-controls mb-3" v-if="showControls">
      <div class="row align-items-center">
        <div class="col-6 mb-2 mb-md-0" v-if="showFileUpload">
          
          <div class="file-upload-container info-icon-tooltip-wrapper">
            <input type="file" class="upload-box visually-hidden" accept=".ics" @change="handleIcsUpload" ref="fileInput" id="icsFileInput" />
            <label for="icsFileInput" class="custom-upload-btn">Import ICS File</label>
            <span class="ics-info-icon-btn" tabindex="0" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false" @focus="showTooltip = true" @blur="showTooltip = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="8" fill="var(--primary)"/>
                <text x="8" y="12" text-anchor="middle" font-size="10" fill="#fff" font-family="Arial" font-weight="bold">?</text>
              </svg>
            </span>
            <div v-if="showTooltip" class="custom-tooltip custom-tooltip-icon">
              You can export an ICS file from your Google Calendar and import it here.
            </div>
          </div>
        </div>
        <div class="col-6 d-flex justify-content-end">

          <button v-if="showAddEvent" class="u-btn u-btn--primary" @click="openEventForm">
            Add Event
          </button>
        </div>
      </div>
    </div>

    <!-- Event Form Modal -->
    <div 
      v-if="showEventForm" 
      class="modal-backdrop"
      @click.self="closeEventForm" 
    > <!--click.self part basically closes the form when you click outside the modal-->
      <div class="event-form-modal">
        <div class="modal-header">
          <h5 class="modal-title">{{ editingEvent ? 'Edit Event' : 'Add Event' }}</h5>
          <button @click="closeEventForm" class="btn-close">
            x
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Title</label>
            <input 
              v-model="newEvent.title" 
              class="form-control" 
              placeholder="Event title"
              required 
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Start Date & Time</label>
            <input 
              v-model="newEvent.start" 
              type="datetime-local" 
              class="form-control" 
              required 
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">End Date & Time</label>
            <input 
              v-model="newEvent.end" 
              type="datetime-local" 
              class="form-control" 
            />
          </div>
          
          <div class="form-group">
            <div class="form-check">
              <input 
                v-model="newEvent.allDay"
                class="form-check-input" 
                type="checkbox" 
                id="allDayCheck"
              />
              <label class="form-check-label" for="allDayCheck">
                All Day Event
              </label>
            </div>
          </div> 
          
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea 
              v-model="newEvent.description" 
              class="form-control" 
              rows="3"
              placeholder="Event description (optional)"
            ></textarea>
          </div>
          

        </div>
        
        <div class="modal-footer">
          <button @click="closeEventForm" class="btn btn-secondary">Cancel</button>
          <button @click="submitEvent" class="u-btn u-btn--primary" :disabled="!newEvent.title">
            {{ editingEvent ? 'Update' : 'Add' }} Event
          </button>
          <button v-if="editingEvent" @click="deleteEvent" class="u-btn u-btn--danger ms-2">
            Delete
          </button>
        </div>
      </div>
    </div>
    
    <!-- Calendar Container -->
    <div class="calendar-container">
      <div ref="calendarRef" class="calendar-element"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'

// Tooltip state for ICS input
const showTooltip = ref(false)
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import ICAL from 'ical.js'

// Props
const props = defineProps({
  // Calendar configuration
  initialView: {
    type: String,
    default: 'dayGridMonth'
  },
  height: {
    type: [String, Number],
    default: 'auto'
  },
  headerToolbar: {
    type: Object,
    default: () => ({
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
    })
  },
  
  // Feature toggles
  showControls: {
    type: Boolean,
    default: true
  },
  showAddEvent: {
    type: Boolean,
    default: true
  },
  showFileUpload: {
    type: Boolean,
    default: true
  },
  showDepartmentField: {
    type: Boolean,
    default: false
  },
  
  // Calendar behavior
  editable: {
    type: Boolean,
    default: true
  },
  selectable: {
    type: Boolean,
    default: true
  },
  
  // Initial events
  events: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits([
  'event-added',
  'event-updated', 
  'event-deleted',
  'event-clicked',
  'date-selected',
  'events-imported'
])

// Reactive state
const calendarRef = ref(null)
const fileInput = ref(null)
const showEventForm = ref(false)
const editingEvent = ref(null)
const newEvent = ref({
  title: '',
  start: '',
  end: '',
  allDay: false,
  description: '',

})

let calendarInstance = null

// Calendar instance management
const initializeCalendar = async () => {
  await nextTick()
  
  if (!calendarRef.value) {
    console.error('Calendar ref is not available')
    return
  }

  calendarInstance = new Calendar(calendarRef.value, {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    initialView: props.initialView,
    height: props.height,
    headerToolbar: props.headerToolbar,
    themeSystem: 'bootstrap5',
    navLinks: false,
    editable: props.editable,
    selectable: props.selectable,
    nowIndicator: true,
    events: props.events,
    eventColor: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(),
    // eventContent: function(arg) {
    //   // Only show the event title, not the time
    //   return { domNodes: [document.createTextNode(arg.event.title)] };
    // },
    // Event handlers
    eventClick: (info) => {
      handleEventClick(info)
    },
    select: (info) => {
      handleDateSelect(info)
    },
    eventDrop: (info) => {
      handleEventUpdate(info)
    },
    eventResize: (info) => {
      handleEventUpdate(info)
    }
  })
  
  calendarInstance.render()
}

// Event handlers
const handleEventClick = (info) => {
  const event = info.event
  editingEvent.value = event
  
  // Populate form with event data
  newEvent.value = {
    title: event.title,
    start: formatDateForInput(event.start),
    end: event.end ? formatDateForInput(event.end) : '',
    allDay: event.allDay,
    description: event.extendedProps.description || '',

  }
  
  showEventForm.value = true
  emit('event-clicked', event)
}

const handleDateSelect = (info) => {
  // Pre-fill form with selected date
  // If end is provided, set it to 23:59 of the previous day (if time is 00:00)
  let endDate = info.end ? new Date(info.end) : null;
  // if (endDate && endDate.getHours() === 0 && endDate.getMinutes() === 0) {
  //   endDate.setMinutes(endDate.getMinutes() - 1); // Go to 23:59 of previous day
  // }
  newEvent.value = {
    title: '',
    start: formatDateForInput(info.start),
    end: endDate ? formatDateForInput(endDate) : '',
    allDay: info.allDay, 
    //allDay: false,
    description: '',

  }
  showEventForm.value = true
  emit('date-selected', info)
}

const handleEventUpdate = (info) => {
  const event = info.event
  emit('event-updated', {
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    allDay: event.allDay,
  })
}

// File upload handling
const handleIcsUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
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
        allDay: e.startDate.isDate,
        description: e.description || '',
        extendedProps: {
          imported: true
        }
      }
    })
    
    if (calendarInstance) {
      calendarInstance.removeAllEvents()
      calendarInstance.addEventSource(events)
      emit('events-imported', events)
    }
    
    // Clear the file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (error) {
    console.error('Error parsing ICS file:', error)
    alert('Error importing calendar file. Please check the file format.')
  }
}

// Event form management
const openEventForm = () => {
  editingEvent.value = null
  newEvent.value = {
    title: '',
    start: '',
    end: '',
    allDay: false,
    description: '',

  }
  showEventForm.value = true
}

const closeEventForm = () => {
  showEventForm.value = false
  editingEvent.value = null
  newEvent.value = {
    title: '',
    start: '',
    end: '',
    allDay: false,
    description: '',
    department: ''
  }
}

const submitEvent = () => {
  if (!newEvent.value.title) return

  const eventData = {
    title: newEvent.value.title,
    start: newEvent.value.start,
    end: newEvent.value.end || undefined,
    //allDay: false,
    allDay: newEvent.value.allDay,//disabled this, only allowing non full day inputs
    description: newEvent.value.description,
    extendedProps: {

      description: newEvent.value.description
    }
  }

  if (editingEvent.value) {
    // Update existing event
    editingEvent.value.setProp('title', eventData.title)
    editingEvent.value.setStart(eventData.start)
    editingEvent.value.setEnd(eventData.end)
    editingEvent.value.setAllDay(eventData.allDay)
    editingEvent.value.setExtendedProp('description', eventData.description)

    
    emit('event-updated', {
      id: editingEvent.value.id,
      ...eventData
    })
  } else {
    // Add new event
    if (calendarInstance) {
      const event = calendarInstance.addEvent(eventData)
      emit('event-added', {
        id: event.id,
        ...eventData
      })
    }
  }

  closeEventForm()
}

const deleteEvent = () => {
  if (editingEvent.value && confirm('Are you sure you want to delete this event?')) {
    const eventId = editingEvent.value.id
    editingEvent.value.remove()
    emit('event-deleted', eventId)
    closeEventForm()
  }
}

// Utility functions
// Format date for datetime-local input in local time (not UTC)
const formatDateForInput = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const pad = (n) => n.toString().padStart(2, '0')
  const year = d.getFullYear()
  const month = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  const hours = pad(d.getHours())
  const minutes = pad(d.getMinutes())
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// Public methods (exposed via defineExpose)
const addEvent = (eventData) => {
  if (calendarInstance) {
    return calendarInstance.addEvent(eventData)
  }
}

const removeEvent = (eventId) => {
  if (calendarInstance) {
    const event = calendarInstance.getEventById(eventId)
    if (event) {
      event.remove()
    }
  }
}

const removeAllEvents = () => {
  if (calendarInstance) {
    calendarInstance.removeAllEvents()
  }
}

const getEvents = () => {
  if (calendarInstance) {
    return calendarInstance.getEvents()
  }
  return []
}

const gotoDate = (date) => {
  if (calendarInstance) {
    calendarInstance.gotoDate(date)
  }
}

const changeView = (viewName) => {
  if (calendarInstance) {
    calendarInstance.changeView(viewName)
  }
}

// Lifecycle
onMounted(() => {
  initializeCalendar()
})

onUnmounted(() => {
  if (calendarInstance) {
    calendarInstance.destroy()
  }
})

// Expose methods for parent components
defineExpose({
  addEvent,
  removeEvent,
  removeAllEvents,
  getEvents,
  gotoDate,
  changeView,
  calendarInstance: () => calendarInstance
})
</script>

<style scoped>
.info-icon-tooltip-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5em;
}
.ics-info-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 0.25em;
  outline: none;
}
.ics-info-icon-btn svg {
  display: block;
}
.custom-tooltip.custom-tooltip-icon {
  left: auto;
  right: 0;
  top: 120%;
  transform: none;
  min-width: 220px;
}
.input-tooltip-wrapper {
  position: relative;
  display: inline-block;
}
.custom-tooltip {
  position: absolute;
  left: 50%;
  top: 100%;
  transform: translateX(-50%);
  margin-top: 0.5em;
  background: var(--primary-700);
  color: #fff;
  padding: 0.5em 1em;
  border-radius: 6px;
  font-size: 0.85em;
  white-space: pre-line;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  pointer-events: none;
}

/* Global FullCalendar styles */
.fc-daygrid-day-frame, 
.fc-scrollgrid-sync-inner {
  background-color: white;
}

.fc a, 
.fc-daygrid-day-number, 
.fc-event {
  text-decoration: none !important;
}

.fc-event {
  border-radius: 4px;
  margin: 1px 0;
}

.fc-day-today {
  background-color: rgba(0, 123, 255, 0.1) !important;
}


.calendar-component {
  width: 100%;
}

.calendar-controls {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.file-upload-container {
  position: relative;
}


.upload-box.visually-hidden {
  position: absolute !important;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  border: 0;
}

.custom-upload-btn {
  display: inline-block;
  background: var(--primary);
  color: #fff;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  margin-right: 0.5rem;
  transition: background 0.2s;
}
.custom-upload-btn:hover {
  background: var(--primary-700);
}

.calendar-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.calendar-element {
  min-height: 400px;
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1050;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.event-form-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem 1.5rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 1rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #adb5bd;
  cursor: pointer;
  padding: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #495057;
}

.modal-body {
  padding: 0 1.5rem 1rem;
}

.modal-footer {
  padding: 1rem 1.5rem 1.5rem;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  border-top: 1px solid #e9ecef;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.form-control {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.9rem;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-check-input {
  width: 1rem;
  height: 1rem;
}

.form-check-label {
  font-size: 0.9rem;
  color: #495057;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 768px) {
  
  .event-form-modal {
    margin: 1rem;
    width: calc(100% - 2rem);
  }
}
</style>
