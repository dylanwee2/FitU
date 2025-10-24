<template>
  <div class="calendar-component">
    <!-- Calendar Controls -->
    <div class="calendar-controls mb-3" v-if="showControls">
      <div class="row align-items-center">
        <div class="col-6 mb-2 mb-md-0" v-if="showFileUpload">
          
          <div class="file-upload-container info-icon-tooltip-wrapper">
            <template v-if="!hasImportedIcs">
              <input type="file" class="upload-box visually-hidden" accept=".ics" @change="handleIcsUpload" ref="fileInput" id="icsFileInput" />
              <label for="icsFileInput" class="custom-upload-btn u-btn u-btn--primary">Import ICS File</label>
              <span class="ics-info-icon-btn" tabindex="0" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false" @focus="showTooltip = true" @blur="showTooltip = false">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="8" fill="var(--primary)"/>
                  <text x="8" y="12" text-anchor="middle" font-size="10" fill="#fff" font-family="Arial" font-weight="bold">?</text>
                </svg>
              </span>
              <div v-if="showTooltip" class="custom-tooltip custom-tooltip-icon">
                You can export an ICS file from your Google Calendar and import it here.
              </div>
            </template>
            <template v-else>
              <button class="u-btn u-btn--danger" @click="clearCalendar">Clear calendar</button>
            </template>
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
          <button @click="closeEventForm" class="btn-close btn-close-white">
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label class="u-muted">Title</label>
            <input 
              v-model="newEvent.title" 
              class="form-control" 
              placeholder="Event title"
              required 
            />
          </div>
          
          <div class="form-group">
            <label class="u-muted">Start Date & Time</label>
            <input 
              v-model="newEvent.start" 
              type="datetime-local" 
              class="form-control" 
              required 
            />
          </div>
          
          <div class="form-group">
            <label class="u-muted">End Date & Time</label>
            <input 
              v-model="newEvent.end" 
              type="datetime-local" 
              class="form-control" 
            />
          </div>
          
          <div class="form-group">
            <label class="u-muted" >
              <input v-model="newEvent.allDay" type="checkbox" id="allDayCheck"/>
              All Day Event
            </label>
          </div> 
          
          <div class="form-group">
            <label class="u-muted">Description</label>
            <textarea 
              v-model="newEvent.description" 
              class="form-control" 
              rows="3"
              placeholder="Event description (optional)"
            ></textarea>
          </div>
          

        </div>
        
        <div class="modal-footer">
          <button @click="closeEventForm" class="u-btn u-btn--secondary">Cancel</button>
          <button v-if="editingEvent" @click="deleteEvent" class="u-btn u-btn--danger ms-2">
            Delete
          </button>
          <button @click="submitEvent" class="u-btn u-btn--primary" :disabled="!newEvent.title">
            {{ editingEvent ? 'Update' : 'Add' }} Event
          </button>
          
        </div>
      </div>
    </div>
    
    <!-- Import Success Modal -->
    <div 
      v-if="showImportSuccess"
      class="modal-backdrop"
      @click.self="closeImportSuccess"
    >
      <div class="event-form-modal">
        <div class="modal-header">
          <h5 class="modal-title">Import Successful</h5>
          <button @click="closeImportSuccess" class="btn-close btn-close-white"></button>
        </div>
        <div class="modal-body">
          <p>{{ importSuccessMsg }}</p>
        </div>
        <div class="modal-footer">
          <button @click="closeImportSuccess" class="u-btn u-btn--primary">OK</button>
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
import { ref, onMounted, nextTick, onUnmounted, watch } from 'vue'

// Tooltip state for ICS input
const showTooltip = ref(false)
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import ICAL from 'ical.js'
import { db } from '../firebase.js'
import { collection, query, where, onSnapshot, getDocs, addDoc, updateDoc, doc as firestoreDoc, serverTimestamp, deleteField } from 'firebase/firestore'
import { useAuth } from '../composables/useAuth.js'

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
  
  editable: {
    type: Boolean,
    default: true
  },
  selectable: {
    type: Boolean,
    default: true
  },
  
  events: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'event-added',
  'event-updated', 
  'event-deleted',
  'event-clicked',
  'date-selected',
  'events-imported'
])

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

// Track whether the current user already has an imported ICS in Firestore
const hasImportedIcs = ref(false)
const importedDocId = ref(null)

// Import success popup state
const showImportSuccess = ref(false)
const importSuccessMsg = ref('')
let importSuccessTimeout = null

const openImportSuccess = (msg) => {
  importSuccessMsg.value = msg || 'Import successful'
  showImportSuccess.value = true
  if (importSuccessTimeout) clearTimeout(importSuccessTimeout)
  importSuccessTimeout = setTimeout(() => {
    closeImportSuccess()
  }, 3500)
}

const closeImportSuccess = () => {
  showImportSuccess.value = false
  importSuccessMsg.value = ''
  if (importSuccessTimeout) {
    clearTimeout(importSuccessTimeout)
    importSuccessTimeout = null
  }
}

let calendarInstance = null
let calendarUnsubscribe = null

// Auth
const { currentUser, isLoading } = useAuth()

// Subscribe to Firestore 'calendar' collection for the logged-in user
const subscribeToCalendar = () => {
  // unsubscribe previous listener if any
  if (calendarUnsubscribe) {
    try { calendarUnsubscribe() } catch (e) { /* ignore */ }
    calendarUnsubscribe = null
  }

  if (!currentUser.value || !currentUser.value.uid) {
    // No user: clear calendar
    if (calendarInstance) calendarInstance.removeAllEvents()
    console.debug('[Calendar] No currentUser - cleared calendar')
    return
  }

  const q = query(
    collection(db, 'calendar'),
    where('userId', '==', currentUser.value.uid)
  )
  console.debug('[Calendar] Subscribing to calendar for uid:', currentUser.value.uid)

  calendarUnsubscribe = onSnapshot(q, (snapshot) => {
    try {
      console.debug('[Calendar] snapshot received, docs:', snapshot.size)
      // Reset ICS tracking; we'll set if we find a doc with `ics` field
      hasImportedIcs.value = false
      importedDocId.value = null

      // Build events array by iterating documents. Some docs store the raw ICS string in `ics`.
      const events = []
      snapshot.docs.forEach(doc => {
        const d = doc.data()

        // If the document stores raw ICS content, parse it and extract VEVENTs
        if (d.ics && typeof d.ics === 'string') {
          // mark that this user has an imported ICS doc
          if (!hasImportedIcs.value) {
            hasImportedIcs.value = true
            importedDocId.value = doc.id
          }
          try {
            const jcal = ICAL.parse(d.ics)
            const comp = new ICAL.Component(jcal)
            const vevents = comp.getAllSubcomponents('vevent')
            vevents.forEach((vevent, idx) => {
              try {
                const e = new ICAL.Event(vevent)
                events.push({
                  id: vevents.length > 1 ? `${doc.id}_${idx}` : doc.id,
                  title: e.summary || d.title || 'Untitled',
                  start: e.startDate ? e.startDate.toJSDate() : undefined,
                  end: e.endDate ? e.endDate.toJSDate() : undefined,
                  allDay: e.startDate ? !!e.startDate.isDate : !!d.allDay,
                  extendedProps: {
                    description: e.description || d.description || ''
                  }
                })
              } catch (err) {
                console.warn('[Calendar] failed to parse vevent in doc', doc.id, idx, err)
              }
            })
          } catch (err) {
            console.warn('[Calendar] failed parsing ICS in doc', doc.id, err)
          }

          return
        }

        // Robust date parsing helper for non-ICS docs
        const parseDateValue = (val) => {
          if (!val && val !== 0) return undefined
          if (val && typeof val.toDate === 'function') return val.toDate()
          if (val && typeof val.seconds === 'number') return new Date(val.seconds * 1000)
          if (typeof val === 'number') return (val > 1e12) ? new Date(val) : new Date(val * 1000)
          if (typeof val === 'string') {
            const parsed = new Date(val)
            if (!isNaN(parsed.getTime())) return parsed
            return undefined
          }
          return undefined
        }

        const startCandidates = ['start', 'startDate', 'start_time', 'date', 'timestamp', 'startAt', 'startTs', 'startTimestamp', 'when', 'begin']
        const endCandidates = ['end', 'endDate', 'end_time', 'until', 'finish']

        const findFirstDate = (candidates) => {
          for (const f of candidates) {
            if (d[f] !== undefined) {
              const parsed = parseDateValue(d[f])
              if (parsed) return parsed
            }
          }
          return undefined
        }

        const start = findFirstDate(startCandidates)
        const end = findFirstDate(endCandidates)

        if (!start) console.warn('[Calendar] document', doc.id, 'has no parseable start date. Fields found:', Object.keys(d))

        events.push({
          id: doc.id,
          title: d.title || 'Untitled',
          start,
          end,
          allDay: !!d.allDay || (start && (d.allDay === undefined) && /^\d{4}-\d{2}-\d{2}$/.test((d.date || d.startDate || '') + '')),
          extendedProps: {
            description: d.description || ''
          }
        })
      })

      console.debug('[Calendar] mapped events:', events)

      if (calendarInstance) {
        calendarInstance.removeAllEvents()
        // add a visible color for debugging in case CSS makes events invisible
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#1976d2'
        const debugEvents = events.map(ev => ({
          ...ev,
          backgroundColor: ev.backgroundColor || primaryColor,
          borderColor: ev.borderColor || primaryColor,
          textColor: ev.textColor || '#ffffff'
        }))

        calendarInstance.addEventSource(debugEvents)
        console.debug('[Calendar] events added to FullCalendar')
        // Log the events FullCalendar currently has
        try {
          const fcEvents = calendarInstance.getEvents().map(e => ({ id: e.id, title: e.title, start: e.start, end: e.end, allDay: e.allDay }))
          console.debug('[Calendar] FullCalendar internal events:', fcEvents)
          if (fcEvents.length && fcEvents[0].start) {
            // jump to first event date to ensure it's in view for debugging
            calendarInstance.gotoDate(fcEvents[0].start)
            console.debug('[Calendar] moved calendar to first event date')
          }
        } catch (err) {
          console.warn('[Calendar] could not read internal events:', err)
        }
      } else {
        console.debug('[Calendar] calendarInstance not ready yet - events mapped but not added')
      }
    } catch (err) {
      console.error('Error mapping calendar snapshot:', err)
    }
  }, (err) => {
    console.error('Calendar onSnapshot error:', err)
  })
}

// watch for user changes and (re)subscribe
watch(currentUser, (val) => {
  if (val && val.uid) {
    subscribeToCalendar()
  } else {
    // clear events if user signed out
    if (calendarInstance) calendarInstance.removeAllEvents()
    if (calendarUnsubscribe) { try { calendarUnsubscribe() } catch(e){}; calendarUnsubscribe = null }
  }
}, { immediate: true })

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
    height: props.height === 'auto' ? 600 : props.height,
    headerToolbar: props.headerToolbar,
    themeSystem: 'bootstrap5',
    navLinks: false,
    editable: props.editable,
    selectable: props.selectable,
    nowIndicator: true,
    events: props.events,
    eventColor: getComputedStyle(document.documentElement).getPropertyValue('--muted').trim(),

    //eventColor: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(),
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
    
    // Render parsed events immediately
    if (calendarInstance) {
      calendarInstance.removeAllEvents()
      calendarInstance.addEventSource(events)
      emit('events-imported', events)
    }

    // Persist the raw ICS content to Firestore under this user's calendar doc
    try {
      if (currentUser.value && currentUser.value.uid) {
        const q = query(collection(db, 'calendar'), where('userId', '==', currentUser.value.uid))
        const snap = await getDocs(q)
        if (!snap.empty) {
          const existing = snap.docs[0]
          await updateDoc(firestoreDoc(db, 'calendar', existing.id), {
            ics: text,
            updatedAt: serverTimestamp()
          })
          console.debug('[Calendar] updated ICS for doc', existing.id)
        } else {
          const newRef = await addDoc(collection(db, 'calendar'), {
            userId: currentUser.value.uid,
            ics: text,
            createdAt: serverTimestamp()
          })
          console.debug('[Calendar] created calendar doc', newRef.id)
        }
      } else {
        console.debug('[Calendar] user not signed in; ICS not saved to Firestore')
      }
    } catch (err) {
      console.error('[Calendar] error saving ICS to Firestore:', err)
    }
    // Show success popup (even if user not signed in, we rendered locally)
    try {
      openImportSuccess(`${events.length} event${events.length === 1 ? '' : 's'} imported`)
    } catch (e) {
      // ignore
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

// Clear the imported ICS from Firestore (if present) and clear calendar UI
const clearCalendar = async () => {
  if (importedDocId.value && currentUser.value && currentUser.value.uid) {
    try {
      await updateDoc(firestoreDoc(db, 'calendar', importedDocId.value), {
        ics: deleteField(),
        updatedAt: serverTimestamp()
      })
      console.debug('[Calendar] cleared ICS field from doc', importedDocId.value)
      openImportSuccess('Calendar cleared')
      // local state will update when snapshot triggers
      return
    } catch (err) {
      console.error('[Calendar] error clearing ICS:', err)
      alert('Could not clear calendar. Please try again.')
      return
    }
  }

  // If no Firestore doc, just clear the displayed events
  if (calendarInstance) {
    calendarInstance.removeAllEvents()
  }
  hasImportedIcs.value = false
  importedDocId.value = null
  openImportSuccess('Calendar cleared')
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
  if (calendarUnsubscribe) {
    try { calendarUnsubscribe() } catch (e) { /* ignore */ }
    calendarUnsubscribe = null
  }
  // clear any import success timeout
  if (importSuccessTimeout) {
    try { clearTimeout(importSuccessTimeout) } catch(e){}
    importSuccessTimeout = null
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

<style>
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
  background: var(--surface-subtle);
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

.fc a, 
.fc-daygrid-day-number, 
.fc-event {
  text-decoration: none !important;
  color: white !important;
}

.fc-toolbar-title { /*Month Year color*/
  color: white;
}

.fc-event {
  border-radius: 4px;
  margin: 1px 0;
}

.calendar-component {
  width: 100%;
}

.calendar-controls {
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

.calendar-container {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-height: 70vh;
  overflow-y: auto;
  position: relative;
}

.calendar-element {
  min-height: 400px;
  padding: 10px;
}

/* Custom scrollbar styling for better UX */
.calendar-container::-webkit-scrollbar {
  width: 8px;
}

.calendar-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.calendar-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.calendar-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.fc-col-header-cell-cushion:hover, .fc-daygrid-day-number:hover {
  cursor: pointer;
  

}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.6) !important; /* Set a translucent black background */
}

.event-form-modal {
  background: var(--bg);
  border-radius: 12px;
  padding: 20px;
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
  margin: 0;
  color: white;
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

.form-check-label {
  margin-left: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  
  .event-form-modal {
    margin: 1rem;
    width: calc(100% - 2rem);
  }
}
</style>
