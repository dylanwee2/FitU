<template>
  <div class="calendar-component">
    <!-- Calendar Controls -->
    <div class="calendar-controls mb-3" v-if="showControls">
      <div class="row align-items-center">
        <div class="col-12 col-md-8 col-lg-6 col-xl-6 col-xxl-9 mb-2 mb-md-0" v-if="showFileUpload">
          <div class="file-upload-container">
            <input 
              type="file" 
              class="upload-box" 
              accept=".ics" 
              @change="handleIcsUpload" 
              ref="fileInput"
            />
            <label class="upload-label">Import ICS File</label>
          </div>
        </div>
        <div class="col-12 col-md-4 col-lg-6 col-xl-6 col-xxl-3 d-flex justify-content-end">
          <button 
            v-if="showAddEvent"
            class="btn btn-primary" 
            @click="openEventForm"
          >
            <i class="fas fa-plus me-2"></i>Add Event
          </button>
        </div>
      </div>
    </div>

    <!-- Event Form Modal -->
    <div 
      v-if="showEventForm" 
      class="modal-backdrop"
    >
      <div class="event-form-modal">
        <div class="modal-header">
          <h5 class="modal-title">{{ editingEvent ? 'Edit Event' : 'Add Event' }}</h5>
          <button @click="closeEventForm" class="btn-close">
            <i class="fas fa-times"></i>
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
          
          <div class="form-group" v-if="showDepartmentField">
            <label class="form-label">Department/Category</label>
            <input 
              v-model="newEvent.department" 
              class="form-control" 
              placeholder="e.g., Work, Personal, School"
            />
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeEventForm" class="btn btn-secondary">Cancel</button>
          <button 
            @click="submitEvent" 
            class="btn btn-primary"
            :disabled="!newEvent.title"
          >
            {{ editingEvent ? 'Update' : 'Add' }} Event
          </button>
          <button 
            v-if="editingEvent" 
            @click="deleteEvent" 
            class="btn btn-danger ms-2"
          >
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
  department: ''
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
    department: event.extendedProps.department || ''
  }
  
  showEventForm.value = true
  emit('event-clicked', event)
}

const handleDateSelect = (info) => {
  // Pre-fill form with selected date
  newEvent.value = {
    title: '',
    start: formatDateForInput(info.start),
    end: formatDateForInput(info.end),
    allDay: info.allDay,
    description: '',
    department: ''
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
    allDay: event.allDay
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
    department: ''
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
    allDay: newEvent.value.allDay,
    description: newEvent.value.description,
    extendedProps: {
      department: newEvent.value.department,
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
    editingEvent.value.setExtendedProp('department', eventData.department)
    
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
const formatDateForInput = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toISOString().slice(0, 16)
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

.upload-box {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}

.upload-box::-webkit-file-upload-button {
  color: white;
  background: #2C3E50;
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 4px;
  margin-right: 0.5rem;
  cursor: pointer;
}

.upload-box::-webkit-file-upload-button:hover {
  background-color: #3c556e;
}

.upload-label {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 0.875rem;
  pointer-events: none;
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
  .calendar-controls .row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .event-form-modal {
    margin: 1rem;
    width: calc(100% - 2rem);
  }
}
</style>

<style>
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

.fc-button-primary {
  background-color: #007bff;
  border-color: #007bff;
}

.fc-button-primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

.fc-button-primary:disabled {
  background-color: #6c757d;
  border-color: #6c757d;
}
</style>