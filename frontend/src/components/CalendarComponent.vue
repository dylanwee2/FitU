<template>
  <div class="calendar-component">
    <!-- Calendar Controls -->
    <div class="calendar-controls mb-3" v-if="showControls">
      <div class="row align-items-center">
        <div class="col-6 mb-2 mb-md-0" v-if="showFileUpload">
          
          <div class="file-upload-container info-icon-tooltip-wrapper">
            <input type="file" class="upload-box visually-hidden" accept=".ics" @change="handleIcsUpload" ref="fileInput" id="icsFileInput" />
            <label for="icsFileInput" class="custom-upload-btn u-btn u-btn--primary">Import ICS</label>
            <span class="ics-info-icon-btn" tabindex="0" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false" @focus="showTooltip = true" @blur="showTooltip = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="8" fill="var(--primary)"/>
                <text x="8" y="12" text-anchor="middle" font-size="10" fill="#fff" font-family="Arial" font-weight="bold">?</text>
              </svg>
            </span>
            <div v-if="showTooltip" class="custom-tooltip custom-tooltip-icon">
              Import an ICS file to merge with your existing calendar events. Events will be combined, not replaced.
            </div>
          </div>
        </div>
        <div class="col-6 d-flex justify-content-end">
          <div class="d-flex gap-2 align-items-center">
            <button id="clearCalendar"
              v-if="hasImportedIcs" 
              class="u-btn u-btn--danger mb-1" 
              @click="clearCalendar" 
              title="Clear all calendar events"
            >
          
              Clear Calendar
            </button>
            <button v-if="showAddEvent" id = 'addEvent' class="u-btn u-btn--primary mb-1" @click="openEventForm">
              Add Event
            </button>
          </div>
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
          <!-- Validation error: start must be before end -->
          <div v-if="timeError" class="text-danger small mt-1">
            Start time must be before end time.
          </div>
          

        </div>
        
        <div class="modal-footer">
          <button @click="closeEventForm" class="u-btn u-btn--secondary">Cancel</button>
                <button v-if="editingEvent" @click="deleteEvent" class="u-btn u-btn--danger ms-2">
                  Delete
                </button>
          <button @click="submitEvent" class="u-btn u-btn--primary" :disabled="!newEvent.title || timeError">
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
            <h5 class="modal-title">{{ importSuccessTitle }}</h5>
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

  <!-- Delete Confirmation Modal -->
  <div v-if="showDeleteConfirm" class="modal-backdrop" @click.self="showDeleteConfirm = false">
    <div class="event-form-modal">
      <div class="modal-header">
        <h5 class="modal-title">Confirm Deletion</h5>
        <button @click="showDeleteConfirm = false" class="btn-close btn-close-white"></button>
      </div>
      <div class="modal-body">
        <p>Are you sure you want to delete this event? This action cannot be undone.</p>
      </div>
      <div class="modal-footer">
        <button @click="showDeleteConfirm = false" class="u-btn u-btn--secondary">Cancel</button>
        <button @click="confirmDelete" class="u-btn u-btn--danger">Delete</button>
      </div>
    </div>
  </div>
  
  <!-- Clear Calendar Confirmation Modal -->
  <div v-if="showClearConfirm" class="modal-backdrop" @click.self="showClearConfirm = false">
    <div class="event-form-modal">
      <div class="modal-header">
        <h5 class="modal-title">Clear Calendar</h5>
        <button @click="showClearConfirm = false" class="btn-close btn-close-white"></button>
      </div>
      <div class="modal-body">
        <p>Are you sure you want to clear the calendar? This will remove imported events from your stored calendar and clear the view.</p>
      </div>
      <div class="modal-footer">
        <button @click="showClearConfirm = false" class="u-btn u-btn--secondary">Cancel</button>
        <button @click="performClearCalendar" class="u-btn u-btn--danger">Clear Calendar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted, watch, computed } from 'vue'

// Tooltip state for ICS input
const showTooltip = ref(false)
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import ICAL from 'ical.js'
import { db } from '../firebase.js'
import { collection, query, where, onSnapshot, getDocs, updateDoc, doc as firestoreDoc, serverTimestamp, deleteField, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
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
  'events-imported',
  'workout-dropped'
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

// Delete confirmation modal state
const showDeleteConfirm = ref(false)


// Track whether the current user already has an imported ICS in Firestore
const hasImportedIcs = ref(false)
const importedDocId = ref(null)

// Import success popup state
const showImportSuccess = ref(false)
const importSuccessMsg = ref('')
const importSuccessTitle = ref('Import Successful')
let importSuccessTimeout = null

const openImportSuccess = (msg, title) => {
  importSuccessMsg.value = msg || 'Import successful'
  importSuccessTitle.value = title || 'Import Successful'
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
                    description: e.description || d.description || '',
                    uid: e.uid || null
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
    navLinks: true,
    editable: props.editable,
    selectable: props.selectable,
    droppable: true,
    nowIndicator: true,
    events: props.events,
    // Ensure times display full meridiem (am/pm) instead of just a/p
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'lowercase', // 'am' / 'pm'
      hour12: true,
      omitZeroMinute: true   // show 12am instead of 12:00am
    },
    // Also fix slot labels for time grid views
    slotLabelFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'lowercase',
      hour12: true,
      omitZeroMinute: true
    },
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
    },
    drop: (info) => {
      handleDrop(info)
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

const handleEventUpdate = async (info) => {
  const event = info.event
  emit('event-updated', {
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    allDay: event.allDay,
  })

  // Also update the ICS content so drags/resizes persist
  try {
    const outgoing = {
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      description: event.extendedProps?.description || '',
      extendedProps: event.extendedProps || {}
    }
    await updateEventInIcs(event.id, outgoing)
  } catch (err) {
    console.error('[Calendar] failed to update ICS after drag/resize:', err)
  }
}

const handleDrop = (info) => {
  // Check if this is an external drop (from workout cards)
  if (info.draggedEl && info.draggedEl.classList.contains('playlist-card')) {
    try {
      // Get workout data from the data attribute set during drag start
      const transferElement = info.draggedEl.querySelector('[data-transfer]')
      if (transferElement) {
        const data = JSON.parse(transferElement.getAttribute('data-transfer'))
        
        if (data.type === 'workout' && data.workout) {
          // Emit the drop event to parent component
          emit('workout-dropped', {
            workout: data.workout,
            date: info.date,
            allDay: info.allDay
          })
        }
      }
    } catch (error) {
      console.error('Error parsing dropped workout data:', error)
    }
  }
}

// Validation: start time must be before end time (only when both provided)
const timeError = computed(() => {
  const s = newEvent.value?.start
  const e = newEvent.value?.end
  if (!s || !e) return false
  const sd = new Date(s)
  const ed = new Date(e)
  if (isNaN(sd) || isNaN(ed)) return false
  return sd > ed
})

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
    
    // Add imported events to calendar (don't remove existing ones)
    if (calendarInstance) {
      calendarInstance.addEventSource(events)
      emit('events-imported', events)
    }

    // Merge imported ICS with existing ICS content in Firestore
    try {
      if (currentUser.value && currentUser.value.uid) {
        const q = query(collection(db, 'calendar'), where('userId', '==', currentUser.value.uid))
        const snap = await getDocs(q)
        
        let mergedIcs = text // Start with the imported ICS
        let duplicateCount = 0
        
        if (!snap.empty) {
          // Existing ICS found - merge with imported ICS
          const existing = snap.docs[0]
          const existingData = existing.data()
          const existingIcs = existingData.ics || ''
          
          if (existingIcs) {
            // Extract VEVENTs from existing ICS
            try {
              const existingJcal = ICAL.parse(existingIcs)
              const existingComp = new ICAL.Component(existingJcal)
              const existingVevents = existingComp.getAllSubcomponents('vevent')
              
              // Extract VEVENTs from imported ICS
              const importedVevents = vevents
              
              // Simple duplicate detection based on UID, or title+start time
              const existingEventKeys = new Set()
              existingVevents.forEach(vevent => {
                try {
                  const event = new ICAL.Event(vevent)
                  const uid = event.uid
                  const key = uid || `${event.summary}-${event.startDate.toJSDate().getTime()}`
                  existingEventKeys.add(key)
                } catch (e) {
                  // Ignore parsing errors for individual events
                }
              })
              
              // Filter out duplicates from imported events
              const uniqueImportedVevents = importedVevents.filter(vevent => {
                try {
                  const event = new ICAL.Event(vevent)
                  const uid = event.uid
                  const key = uid || `${event.summary}-${event.startDate.toJSDate().getTime()}`
                  const isDuplicate = existingEventKeys.has(key)
                  if (isDuplicate) duplicateCount++
                  return !isDuplicate
                } catch (e) {
                  return true // Include events that can't be parsed
                }
              })
              
              // Combine all VEVENTs
              const allVevents = [...existingVevents, ...uniqueImportedVevents]
              
              // Create a new VCALENDAR with all events
              const mergedComp = new ICAL.Component(['vcalendar', [], []])
              mergedComp.updatePropertyWithValue('version', '2.0')
              mergedComp.updatePropertyWithValue('prodid', '-//FitU//EN')
              
              // Add all VEVENTs to the merged calendar
              allVevents.forEach(vevent => {
                mergedComp.addSubcomponent(vevent)
              })
              
              mergedIcs = mergedComp.toString()
              
            } catch (parseErr) {
              console.warn('[Calendar] Error parsing existing ICS for merge, will append:', parseErr)
              // Fallback: string concatenation approach (no duplicate detection)
              if (/END:VCALENDAR/i.test(existingIcs)) {
                // Extract events from imported ICS and insert before END:VCALENDAR
                const importedEventsText = text.replace(/BEGIN:VCALENDAR.*?\n/i, '').replace(/END:VCALENDAR.*$/i, '').trim()
                mergedIcs = existingIcs.replace(/\r?\n?END:VCALENDAR\s*$/i, '\r\n' + importedEventsText + '\r\nEND:VCALENDAR')
              } else {
                // Just append
                mergedIcs = existingIcs + '\r\n' + text
              }
            }
          }
          
          // Update the existing doc with merged ICS
          await updateDoc(firestoreDoc(db, 'calendar', existing.id), {
            ics: mergedIcs,
            updatedAt: serverTimestamp()
          })
          console.debug('[Calendar] merged and updated ICS for doc', existing.id)
          
        } else {
          // No existing ICS - create new document with imported ICS
          const userDocRef = firestoreDoc(db, 'calendar', currentUser.value.uid)
          await setDoc(userDocRef, {
            userId: currentUser.value.uid,
            ics: mergedIcs,
            createdAt: serverTimestamp()
          }, { merge: true })
          console.debug('[Calendar] created new calendar doc with imported ICS', currentUser.value.uid)
        }
        
        // Show success message with duplicate info
        const newEventsCount = events.length - duplicateCount
        let successMessage = `${newEventsCount} new event${newEventsCount === 1 ? '' : 's'} imported and merged`
        if (duplicateCount > 0) {
          successMessage += ` (${duplicateCount} duplicate${duplicateCount === 1 ? '' : 's'} skipped)`
        }
        openImportSuccess(successMessage)
        
      } else {
        console.debug('[Calendar] user not signed in; ICS not saved to Firestore')
        openImportSuccess(`${events.length} event${events.length === 1 ? '' : 's'} imported locally (not saved)`)
      }
    } catch (err) {
      console.error('[Calendar] error merging ICS to Firestore:', err)
      openImportSuccess(`${events.length} event${events.length === 1 ? '' : 's'} imported, but merge failed`)
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

const submitEvent = async () => {
  if (!newEvent.value.title) return
  if (timeError.value) return

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
    // Update the VEVENT inside stored ICS (do not create duplicate)
    try {
      // include existing extendedProps (such as uid) so updater can match the VEVENT
      const outgoing = { ...eventData, extendedProps: editingEvent.value.extendedProps || {} }
      await updateEventInIcs(editingEvent.value.id, outgoing)
    } catch (err) {
      console.error('[Calendar] updateEventInIcs error:', err)
    }
  } else {
    // Add new event
    if (calendarInstance) {
      const event = calendarInstance.addEvent(eventData)
      emit('event-added', {
        id: event.id,
        ...eventData
      })
      // Persist to ICS in Firestore (append VEVENT)
      try {
        appendEventToIcs(eventData).catch(err => console.error('[Calendar] appendEventToIcs error:', err))
      } catch (e) {
        console.error('[Calendar] appendEventToIcs call failed:', e)
      }
    }
  }

  closeEventForm()
}

const deleteEvent = () => {
  // Open confirmation modal instead of immediate deletion
  if (editingEvent.value) {
    showDeleteConfirm.value = true
  }
}

// Called when user confirms deletion
const confirmDelete = async () => {
  showDeleteConfirm.value = false
  if (!editingEvent.value) return

  const event = editingEvent.value
  const eventId = event.id

  // Remove from UI
  try {
    event.remove()
  } catch (e) {
    console.warn('[Calendar] event remove failed (already removed?)', e)
  }

  // Try delete from ICS or structured doc
  try {
    // If the event appears to be from an ICS (docId_index or importedDocId present), remove VEVENT
    await deleteEventInIcs(eventId, event)
  } catch (err) {
    console.error('[Calendar] deleteEventInIcs error:', err)
    // Fallback: if eventId looks like a document id, attempt to delete the document
    try {
      if (typeof eventId === 'string' && !eventId.includes('_')) {
        await deleteDoc(firestoreDoc(db, 'calendar', eventId))
        console.debug('[Calendar] deleted calendar doc', eventId)
      }
    } catch (e) {
      console.warn('[Calendar] fallback deleteDoc failed:', e)
    }
  }

  emit('event-deleted', eventId)
  closeEventForm()
  try { openImportSuccess('Event deleted', 'Delete successful') } catch(e){}
}

// Remove VEVENT from user's stored ICS content
const deleteEventInIcs = async (editingEventId, eventObj) => {
  if (!currentUser.value || !currentUser.value.uid) return

  // try to parse editingEventId for docId_index
  let docId = null
  let idx = null
  const m = String(editingEventId).match(/^(.+?)_(\d+)$/)
  if (m) {
    docId = m[1]
    idx = parseInt(m[2], 10)
  }

  const tryRemoveFromDoc = async (docRef) => {
    const snap = await getDoc(docRef)
    if (!snap.exists()) return false
    const data = snap.data() || {}
    const currentIcs = data.ics || ''
    if (!currentIcs) return false

    const veventRegex = /BEGIN:VEVENT[\s\S]*?END:VEVENT/gi
    const matches = currentIcs.match(veventRegex) || []
    if (matches.length === 0) return false

    // If index provided, remove that one
    if (typeof idx === 'number' && idx >= 0 && idx < matches.length) {
      const original = matches[idx]
      let newIcs = currentIcs.replace(original, '')
      // Cleanup consecutive blank lines
      newIcs = newIcs.replace(/\r?\n{2,}/g, '\r\n')
      // If no VEVENT left, delete the ics field
      const remaining = newIcs.match(veventRegex) || []
      if (remaining.length === 0) {
        await updateDoc(docRef, { ics: deleteField(), updatedAt: serverTimestamp() })
        console.debug('[Calendar] removed last VEVENT and cleared ics field in', docRef.id)
      } else {
        await updateDoc(docRef, { ics: newIcs, updatedAt: serverTimestamp() })
        console.debug('[Calendar] removed VEVENT at index', idx, 'in', docRef.id)
      }
      return true
    }

    // Try match by UID if available on eventObj.extendedProps.uid
    const uid = eventObj?.extendedProps?.uid || null
    if (uid) {
      const uidRegex = new RegExp(`BEGIN:VEVENT[\\s\\S]*?UID:${uid}[\\s\\S]*?END:VEVENT`, 'i')
      const match = currentIcs.match(uidRegex)
      if (match) {
        let newIcs = currentIcs.replace(match[0], '')
        newIcs = newIcs.replace(/\r?\n{2,}/g, '\r\n')
        const remaining = newIcs.match(veventRegex) || []
        if (remaining.length === 0) {
          await updateDoc(docRef, { ics: deleteField(), updatedAt: serverTimestamp() })
          console.debug('[Calendar] removed last VEVENT by UID and cleared ics field in', docRef.id)
        } else {
          await updateDoc(docRef, { ics: newIcs, updatedAt: serverTimestamp() })
          console.debug('[Calendar] removed VEVENT by UID', uid, 'in', docRef.id)
        }
        return true
      }
    }

    // Fallback: match by DTSTART and SUMMARY
    const dtstart = eventObj.allDay ? toIcsDate(eventObj.start) : toIcsDateTime(eventObj.start)
    const summary = (eventObj.title || '').replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
    const dtRegex = eventObj.allDay ? new RegExp(`BEGIN:VEVENT[\\s\\S]*?DTSTART;VALUE=DATE:${dtstart}[\\s\\S]*?SUMMARY:${summary}[\\s\\S]*?END:VEVENT`, 'i') : new RegExp(`BEGIN:VEVENT[\\s\\S]*?DTSTART:${dtstart}[\\s\\S]*?SUMMARY:${summary}[\\s\\S]*?END:VEVENT`, 'i')
    const match2 = currentIcs.match(dtRegex)
    if (match2) {
      let newIcs = currentIcs.replace(match2[0], '')
      newIcs = newIcs.replace(/\r?\n{2,}/g, '\r\n')
      const remaining = newIcs.match(veventRegex) || []
      if (remaining.length === 0) {
        await updateDoc(docRef, { ics: deleteField(), updatedAt: serverTimestamp() })
        console.debug('[Calendar] removed last VEVENT by DTSTART+SUMMARY and cleared ics field in', docRef.id)
      } else {
        await updateDoc(docRef, { ics: newIcs, updatedAt: serverTimestamp() })
        console.debug('[Calendar] removed VEVENT by DTSTART+SUMMARY in', docRef.id)
      }
      return true
    }

    return false
  }

  // If docId was embedded, try that specific doc
  if (docId) {
    try {
      const docRef = firestoreDoc(db, 'calendar', docId)
      const removed = await tryRemoveFromDoc(docRef)
      if (removed) return
    } catch (err) {
      console.error('[Calendar] deleteEventInIcs by docId failed:', err)
    }
  }

  // Otherwise, try the importedDocId if set (most common case)
  if (importedDocId.value) {
    try {
      const docRef = firestoreDoc(db, 'calendar', importedDocId.value)
      const removed = await tryRemoveFromDoc(docRef)
      if (removed) return
    } catch (err) {
      console.error('[Calendar] deleteEventInIcs by importedDoc failed:', err)
    }
  }

  // As a last resort, try to find any calendar doc for this user and remove from the first that contains ics
  try {
    const q = query(collection(db, 'calendar'), where('userId', '==', currentUser.value.uid))
    const snap = await getDocs(q)
    for (const sd of snap.docs) {
      const docRef = firestoreDoc(db, 'calendar', sd.id)
      const removed = await tryRemoveFromDoc(docRef)
      if (removed) return
    }
  } catch (err) {
    console.error('[Calendar] deleteEventInIcs final lookup failed:', err)
  }
}

// Show a confirmation before clearing the imported ICS from Firestore (or clearing UI)
const showClearConfirm = ref(false)

// Perform the actual clear operation (moved from previous clearCalendar implementation)
const performClearCalendar = async () => {
  showClearConfirm.value = false
  if (importedDocId.value && currentUser.value && currentUser.value.uid) {
    try {
      await updateDoc(firestoreDoc(db, 'calendar', importedDocId.value), {
        ics: deleteField(),
        updatedAt: serverTimestamp()
      })
      console.debug('[Calendar] cleared ICS field from doc', importedDocId.value)
      openImportSuccess('Calendar cleared', 'Reset successful')
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
  openImportSuccess('Calendar cleared', 'Reset successful')
}

// New clearCalendar opens the confirmation modal
const clearCalendar = () => {
  showClearConfirm.value = true
}

// Helpers to build VEVENT strings for appending to ICS
const pad = (n) => n.toString().padStart(2, '0')
const toIcsDateTime = (d) => {
  // return UTC YYYYMMDDTHHMMSSZ
  const dt = new Date(d)
  return dt.getUTCFullYear().toString()
    + pad(dt.getUTCMonth() + 1)
    + pad(dt.getUTCDate())
    + 'T'
    + pad(dt.getUTCHours())
    + pad(dt.getUTCMinutes())
    + pad(dt.getUTCSeconds())
    + 'Z'
}

const toIcsDate = (d) => {
  const dt = new Date(d)
  return dt.getFullYear().toString() + pad(dt.getMonth() + 1) + pad(dt.getDate())
}

const buildVEventString = (ev, uidOverride) => {
  // ev: { title, start, end, allDay, description }
  const uid = uidOverride || `fitu-${Date.now()}@local`
  const dtstamp = toIcsDateTime(new Date())
  let dtstart = ''
  let dtend = ''
  if (ev.allDay) {
    dtstart = `DTSTART;VALUE=DATE:${toIcsDate(ev.start)}`
    if (ev.end) dtend = `DTEND;VALUE=DATE:${toIcsDate(ev.end)}`
  } else {
    dtstart = `DTSTART:${toIcsDateTime(ev.start)}`
    if (ev.end) dtend = `DTEND:${toIcsDateTime(ev.end)}`
  }

  // Escape simple characters in SUMMARY/DESCRIPTION
  const esc = (s = '') => String(s).replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')

  const lines = [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `SUMMARY:${esc(ev.title)}`,
    ev.description ? `DESCRIPTION:${esc(ev.description)}` : null,
    dtstart,
    ev.end ? dtend : null,
    'END:VEVENT'
  ].filter(Boolean)

  return lines.join('\r\n')
}

const wrapWithVCalendar = (veventString) => {
  const header = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//FitU//EN'
  const footer = 'END:VCALENDAR'
  return `${header}\r\n${veventString}\r\n${footer}`
}

// Append created event to user's ICS content in Firestore
const appendEventToIcs = async (ev) => {
  // only proceed for signed-in users
  if (!currentUser.value || !currentUser.value.uid) return

  // normalize event object
  const evt = {
    title: ev.title || 'Untitled',
    start: ev.start,
    end: ev.end,
    allDay: !!ev.allDay,
    description: ev.description || ev.extendedProps?.description || ''
  }

  const veventString = buildVEventString(evt)

  if (importedDocId.value) {
    const docRef = firestoreDoc(db, 'calendar', importedDocId.value)
    const snap = await getDoc(docRef)
    if (snap.exists()) {
      const data = snap.data() || {}
      const currentIcs = data.ics || ''
      let newIcs = ''
      if (currentIcs && /END:VCALENDAR/i.test(currentIcs)) {
        // insert before END:VCALENDAR
        newIcs = currentIcs.replace(/\r?\n?END:VCALENDAR\s*$/i, '\r\n' + veventString + '\r\nEND:VCALENDAR')
      } else if (currentIcs) {
        // no END:VCALENDAR, just append
        newIcs = currentIcs + '\r\n' + veventString
      } else {
        newIcs = wrapWithVCalendar(veventString)
      }

      await updateDoc(docRef, { ics: newIcs, updatedAt: serverTimestamp() })
      console.debug('[Calendar] appended VEVENT to existing calendar doc', importedDocId.value)
      return
    }
  }

  // No existing doc: create one
  const newIcs = wrapWithVCalendar(veventString)
  // Write into the calendar document whose id == user uid (merge so pre-existing fields are preserved)
  const userDocRef = firestoreDoc(db, 'calendar', currentUser.value.uid)
  await setDoc(userDocRef, {
    userId: currentUser.value.uid,
    ics: newIcs,
    createdAt: serverTimestamp()
  }, { merge: true })
  importedDocId.value = currentUser.value.uid
  hasImportedIcs.value = true
  console.debug('[Calendar] created/merged calendar doc with id (uid) while appending VEVENT', currentUser.value.uid)
}

// Update an existing VEVENT inside the user's stored ICS content
const updateEventInIcs = async (editingEventId, ev) => {
  if (!currentUser.value || !currentUser.value.uid) return

  // Try parse editingEventId for docId and index (docId_idx)
  let docId = null
  let idx = null
  const m = String(editingEventId).match(/^(.+?)_(\d+)$/)
  if (m) {
    docId = m[1]
    idx = parseInt(m[2], 10)
  }

  const buildAndReplace = async (docRef, currentIcs, targetIndex, existingUid) => {
    const veventString = buildVEventString(ev, existingUid)
    // find all VEVENT blocks
    const veventRegex = /BEGIN:VEVENT[\s\S]*?END:VEVENT/gi
    const matches = currentIcs.match(veventRegex) || []
    if (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex < matches.length) {
      const original = matches[targetIndex]
      const newIcs = currentIcs.replace(original, veventString)
      await updateDoc(docRef, { ics: newIcs, updatedAt: serverTimestamp() })
      console.debug('[Calendar] updated VEVENT at index', targetIndex, 'in doc', docRef.id)
      return true
    }
    return false
  }

  if (docId) {
    try {
      const docRef = firestoreDoc(db, 'calendar', docId)
      const snap = await getDoc(docRef)
      if (!snap.exists()) return
      const data = snap.data() || {}
      const currentIcs = data.ics || ''
      if (!currentIcs) return

      // attempt to preserve existing UID if present in matched VEVENT
      const veventRegex = /BEGIN:VEVENT[\s\S]*?END:VEVENT/gi
      const matches = currentIcs.match(veventRegex) || []
      if (idx !== null && idx < matches.length) {
        const original = matches[idx]
        const uidMatch = original.match(/UID:(.+)/i)
        const existingUid = uidMatch ? uidMatch[1].trim() : undefined
        const replaced = await buildAndReplace(docRef, currentIcs, idx, existingUid)
        if (replaced) {
          console.debug('[Calendar] updated VEVENT by index')
          return
        }
      }

      // fallback: try to match by UID if ev.extendedProps.uid provided
      const uid = ev.extendedProps?.uid || ev.uid || null
      if (uid) {
        const uidRegex = new RegExp(`BEGIN:VEVENT[\\s\\S]*?UID:${uid}[\\s\\S]*?END:VEVENT`, 'i')
        const match = currentIcs.match(uidRegex)
        if (match) {
          const veventString = buildVEventString(ev, uid)
          const newIcs = currentIcs.replace(match[0], veventString)
          await updateDoc(docRef, { ics: newIcs, updatedAt: serverTimestamp() })
          console.debug('[Calendar] updated VEVENT by UID', uid)
          return
        }
      }

      // fallback: try to match by DTSTART and SUMMARY
      const dtstart = ev.allDay ? toIcsDate(ev.start) : toIcsDateTime(ev.start)
      const summary = ev.title || ''
      const summaryEsc = summary.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
      const dtRegex = ev.allDay ? new RegExp(`BEGIN:VEVENT[\\s\\S]*?DTSTART;VALUE=DATE:${dtstart}[\\s\\S]*?SUMMARY:${summaryEsc}[\\s\\S]*?END:VEVENT`, 'i') : new RegExp(`BEGIN:VEVENT[\\s\\S]*?DTSTART:${dtstart}[\\s\\S]*?SUMMARY:${summaryEsc}[\\s\\S]*?END:VEVENT`, 'i')
      const match2 = currentIcs.match(dtRegex)
      if (match2) {
        const uidMatch = match2[0].match(/UID:(.+)/i)
        const existingUid = uidMatch ? uidMatch[1].trim() : undefined
        const veventString = buildVEventString(ev, existingUid)
        const newIcs = currentIcs.replace(match2[0], veventString)
        await updateDoc(docRef, { ics: newIcs, updatedAt: serverTimestamp() })
        console.debug('[Calendar] updated VEVENT by DTSTART+SUMMARY')
        return
      }

      console.warn('[Calendar] could not find VEVENT to update in doc', docId)
    } catch (err) {
      console.error('[Calendar] updateEventInIcs error:', err)
    }
  } else if (importedDocId.value) {
    // No index info but we have importedDocId: try by UID or DTSTART+SUMMARY similarly
    try {
      const docRef = firestoreDoc(db, 'calendar', importedDocId.value)
      const snap = await getDoc(docRef)
      if (!snap.exists()) return
      const data = snap.data() || {}
      const currentIcs = data.ics || ''
      if (!currentIcs) return
      const uid = ev.extendedProps?.uid || ev.uid || null
      if (uid) {
        const uidRegex = new RegExp(`BEGIN:VEVENT[\\s\\S]*?UID:${uid}[\\s\\S]*?END:VEVENT`, 'i')
        const match = currentIcs.match(uidRegex)
        if (match) {
          const veventString = buildVEventString(ev, uid)
          const newIcs = currentIcs.replace(match[0], veventString)
          await updateDoc(docRef, { ics: newIcs, updatedAt: serverTimestamp() })
          console.debug('[Calendar] updated VEVENT by UID in importedDoc')
          return
        }
      }
      // fallback by DTSTART+SUMMARY
      const dtstart = ev.allDay ? toIcsDate(ev.start) : toIcsDateTime(ev.start)
      const summary = ev.title || ''
      const summaryEsc = summary.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
      const dtRegex = ev.allDay ? new RegExp(`BEGIN:VEVENT[\\s\\S]*?DTSTART;VALUE=DATE:${dtstart}[\\s\\S]*?SUMMARY:${summaryEsc}[\\s\\S]*?END:VEVENT`, 'i') : new RegExp(`BEGIN:VEVENT[\\s\\S]*?DTSTART:${dtstart}[\\s\\S]*?SUMMARY:${summaryEsc}[\\s\\S]*?END:VEVENT`, 'i')
      const match2 = currentIcs.match(dtRegex)
      if (match2) {
        const uidMatch = match2[0].match(/UID:(.+)/i)
        const existingUid = uidMatch ? uidMatch[1].trim() : undefined
        const veventString = buildVEventString(ev, existingUid)
        const newIcs = currentIcs.replace(match2[0], veventString)
        await updateDoc(docRef, { ics: newIcs, updatedAt: serverTimestamp() })
        console.debug('[Calendar] updated VEVENT by DTSTART+SUMMARY in importedDoc')
        return
      }
      console.warn('[Calendar] could not find VEVENT to update in importedDoc', importedDocId.value)
    } catch (err) {
      console.error('[Calendar] updateEventInIcs fallback error:', err)
    }
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
const addEvent = async (eventData) => {
  if (calendarInstance) {
    const event = calendarInstance.addEvent(eventData)
    
    // Also persist to Firebase
    try {
      await appendEventToIcs(eventData)
      console.debug('[Calendar] Event added and persisted to Firebase:', eventData.title)
    } catch (error) {
      console.error('[Calendar] Error persisting event to Firebase:', error)
    }
    
    return event
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
  // Keyboard shortcuts: ←/→ navigate, M/W/D switch views, T today, N new
  const onKey = (e) => {
    if (!calendarInstance) return
    // Ignore when typing in inputs or textareas
    const t = e.target
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
    if (e.key === 'ArrowLeft') { calendarInstance.prev(); e.preventDefault() }
    else if (e.key === 'ArrowRight') { calendarInstance.next(); e.preventDefault() }
    else if (e.key.toLowerCase() === 't') { calendarInstance.today(); e.preventDefault() }
    else if (e.key.toLowerCase() === 'm') { calendarInstance.changeView('dayGridMonth'); e.preventDefault() }
    else if (e.key.toLowerCase() === 'w') { calendarInstance.changeView('timeGridWeek'); e.preventDefault() }
    else if (e.key.toLowerCase() === 'd') { calendarInstance.changeView('timeGridDay'); e.preventDefault() }
    else if (e.key.toLowerCase() === 'n') { openEventForm(); e.preventDefault() }
  }
  window.addEventListener('keydown', onKey)
  onUnmounted(() => window.removeEventListener('keydown', onKey))
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

/* Dark themed scrollbars (Chrome-like) for scrollable widgets within calendar */
.calendar-component .calendar-container,
.calendar-component .event-form-modal,
.calendar-component .fc-scroller {
  scrollbar-color: #555 var(--surface-subtle); /* Firefox */
  scrollbar-width: thin; /* Firefox */
}

.calendar-component .calendar-container::-webkit-scrollbar,
.calendar-component .event-form-modal::-webkit-scrollbar,
.calendar-component .fc-scroller::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
.calendar-component .calendar-container::-webkit-scrollbar-track,
.calendar-component .event-form-modal::-webkit-scrollbar-track,
.calendar-component .fc-scroller::-webkit-scrollbar-track {
  background: var(--surface-subtle);
  border-radius: 8px;
}
.calendar-component .calendar-container::-webkit-scrollbar-thumb,
.calendar-component .event-form-modal::-webkit-scrollbar-thumb,
.calendar-component .fc-scroller::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 8px;
  border: 2px solid var(--surface-subtle);
}
.calendar-component .calendar-container::-webkit-scrollbar-thumb:hover,
.calendar-component .event-form-modal::-webkit-scrollbar-thumb:hover,
.calendar-component .fc-scroller::-webkit-scrollbar-thumb:hover {
  background: #666;
}

.fc-col-header-cell-cushion:hover, .fc-daygrid-day-number:hover {
  cursor: pointer;
  

}

/* FullCalendar list view: make date headings use subtle surface background */
.calendar-component .fc .fc-list-day-cushion {
  background-color: var(--surface-subtle) !important;
}
.calendar-component .fc .fc-list-day:hover .fc-list-day-cushion {
  background-color: var(--surface-subtle) !important;
}

/* FullCalendar list view: event row hover uses subtle surface background */
.calendar-component .fc .fc-list-event:hover td {
  background-color: black !important;
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

/* Responsive: smaller button text for mobile */
@media (max-width: 668px) {
  #clearCalendar,
  #addEvent {
    font-size: 0.8rem !important;
    padding: 0.4rem 0.6rem !important;
  }
}

@media (max-width: 546px) {
  #clearCalendar,
  #addEvent {
    font-size: 0.65rem !important;
    padding: 0.4rem 0.6rem !important;
  }
}


/* Responsive: shrink FullCalendar toolbar and buttons on small screens */
@media (max-width: 720px) {
  .calendar-element {
    padding: 6px;
    min-height: 280px;
  }

  /* Toolbar container spacing */
  .fc .fc-toolbar {
    padding: 6px 8px !important;
    gap: 6px !important;
  }

  /* Title smaller */
  .fc .fc-toolbar .fc-toolbar-title {
    font-size: 14px !important;
    line-height: 1 !important;
  }

  /* Buttons: smaller text and reduced padding */
  .fc .fc-button,
  .fc .fc-button:where(:not(.fc-button-active)) {
    font-size: 12px !important;
    padding: 4px 8px !important;
    min-width: 36px !important;
  }

  /* Compact grouping */
  .fc .fc-toolbar-chunk {
    padding: 0 !important;
    margin: 0 !important;
  }

  /* Reduce day number / header click target sizes slightly */
  .fc .fc-daygrid-day-number,
  .fc-col-header-cell-cushion {
    font-size: 12px !important;
  }
}

/* Extra-small screens: tighten further under 530px */
@media (max-width: 530px) {
  .calendar-element {
    padding: 4px;
    min-height: 220px;
  }

  .fc .fc-toolbar {
    padding: 4px 6px !important;
    gap: 4px !important;
  }

  .fc .fc-toolbar .fc-toolbar-title {
    font-size: 12px !important;
  }

  .fc .fc-button,
  .fc .fc-button:where(:not(.fc-button-active)) {
    font-size: 11px !important;
    padding: 3px 6px !important;
    min-width: 32px !important;
  }

  .fc .fc-toolbar-chunk {
    padding: 0 !important;
    margin: 0 !important;
  }

  .fc .fc-daygrid-day-number,
  .fc-col-header-cell-cushion {
    font-size: 11px !important;
  }

  /* Slightly reduce spacing on modal footers for tiny screens */
  .event-form-modal {
    padding: 12px !important;
    max-width: 95% !important;
  }
}

/* Very small screens: stack toolbar into rows with title on top */
@media (max-width: 470px) {
  /* Make the toolbar vertical */
  .fc .fc-toolbar {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 6px !important;
  }

  /* Ensure the title is on its own row and centered */
  .fc .fc-toolbar .fc-toolbar-title {
    display: block !important;
    text-align: center !important;
    width: 100% !important;
    font-size: 13px !important;
    margin: 6px 0 !important;
  }

  /* Make each chunk take the full width and center its contents */
  .fc .fc-toolbar .fc-toolbar-chunk {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    width: 100% !important;
    gap: 6px !important;
    flex-wrap: wrap !important;
  }

  /* Slightly reduce button size for ultra small screens */
  .fc .fc-button {
    font-size: 11px !important;
    padding: 3px 6px !important;
  }
}

/* Extra-extra-small screens: make Clear calendar and Add Event buttons smaller (<=432px) */
@media (max-width: 432px) {
  .calendar-controls .u-btn.u-btn--primary,
  .calendar-controls .u-btn.u-btn--danger,
  .calendar-controls .custom-upload-btn {
    font-size: 11px !important;
    padding: 4px 8px !important;
    min-height: 28px !important;
    line-height: 1 !important;
  }

  /* Slightly reduce spacing around the controls */
  .calendar-controls {
    padding: 0.5rem !important;
  }

  /* Ensure the left and right columns remain vertically centered */
  .calendar-controls .row > [class*="col-"] {
    display: flex;
    align-items: center;
  }
}

/* =====================
   FullCalendar toolbar (dark theme, element-level styling)
   ===================== */
/* Leave toolbar background transparent (explicitly avoid painting the whole header) */
.calendar-component .fc .fc-toolbar {
  background: transparent !important;
}

/* Buttons: prev/next/today and view toggles */
.calendar-component .fc .fc-button {
  background-color: var(--surface-subtle) !important;
  border-color: var(--border-subtle) !important;
  color: #ffffff !important;
  box-shadow: none !important;
}
.calendar-component .fc .fc-button .fc-icon {
  color: currentColor !important;
}
.calendar-component .fc .fc-button:hover,
.calendar-component .fc .fc-button:focus {
  filter: brightness(1.08);
}
.calendar-component .fc .fc-button:focus-visible {
  outline: 2px solid rgba(100, 149, 237, 0.35) !important; /* soft cornflower focus */
  outline-offset: 2px !important;
}
.calendar-component .fc .fc-button.fc-button-active,
.calendar-component .fc .fc-button:where(.fc-button-primary).fc-button-active {
  background-color: #111111 !important;
  color: #ffffff !important;
}

.calendar-component .fc .fc-button:disabled,
.calendar-component .fc .fc-button[disabled] {
  opacity: 0.6 !important;
  cursor: not-allowed !important;
}

/* Title text (already set to white above, keep consistent) */
.calendar-component .fc .fc-toolbar-title {
  color: #ffffff !important;
}

/* Drag and Drop Styling */
.calendar-component .fc-day {
  transition: background-color 0.2s ease;
}

.calendar-component .fc-day:hover {
  background-color: rgba(0, 191, 255, 0.1) !important;
}

.calendar-component .fc-timegrid-slot {
  transition: background-color 0.2s ease;
}

.calendar-component .fc-timegrid-slot:hover {
  background-color: rgba(0, 191, 255, 0.05) !important;
}

/* Drop target indicator */
.calendar-component .fc-highlight {
  background-color: rgba(0, 191, 255, 0.2) !important;
}
</style>
