<template>
  <div class="calendar-component">
    <div class="calendar-controls mb-3" v-if="showControls">
      <div class="row align-items-center">
        <div class="col-6 mb-2 mb-md-0" v-if="showFileUpload">
          
          <div class="file-upload-container info-icon-tooltip-wrapper">
            <input type="file" class="upload-box visually-hidden" accept=".ics" @change="handleIcsUpload" ref="fileInput" id="icsFileInput" />
            <label for="icsFileInput" id="importBtn" class="custom-upload-btn u-btn u-btn--primary">Import ICS</label>
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
        <div class="col-6 d-flex justify-content-end mb-1">
          <div class="d-flex gap-2 align-items-center">
            <button id="clearCalendar"
              v-if="hasImportedIcs" 
              class="u-btn u-btn--danger" 
              @click="clearCalendar" 
              title="Clear all calendar events"
            >
          
              Clear Calendar
            </button>
            <button v-if="showAddEvent" id = 'addEvent' class="u-btn u-btn--primary" @click="openEventForm">
              + Event
            </button>
          </div>
        </div>
      </div>
    </div>


    <div 
      v-if="showEventForm" 
      class="modal-backdrop"
      @click.self="closeEventForm" 
    > 
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
    

    <div class="calendar-container">
      <div ref="calendarRef" class="calendar-element"></div>
    </div>
  </div>


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


const props = defineProps({
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


const showDeleteConfirm = ref(false)

const hasImportedIcs = ref(false)
const importedDocId = ref(null)

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


const subscribeToCalendar = () => {
  if (calendarUnsubscribe) {
    try { calendarUnsubscribe() } catch (e) { /* ignore */ }
    calendarUnsubscribe = null
  }

  if (!currentUser.value || !currentUser.value.uid) {
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
      hasImportedIcs.value = false
      importedDocId.value = null

      const events = []
      snapshot.docs.forEach(doc => {
        const d = doc.data()

        if (d.ics && typeof d.ics === 'string') {
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
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#1976d2'
        const debugEvents = events.map(ev => ({
          ...ev,
          backgroundColor: ev.backgroundColor || primaryColor,
          borderColor: ev.borderColor || primaryColor,
          textColor: ev.textColor || '#ffffff'
        }))

        calendarInstance.addEventSource(debugEvents)
        console.debug('[Calendar] events added to FullCalendar')
        try {
          const fcEvents = calendarInstance.getEvents().map(e => ({ id: e.id, title: e.title, start: e.start, end: e.end, allDay: e.allDay }))
          console.debug('[Calendar] FullCalendar internal events:', fcEvents)
          if (fcEvents.length && fcEvents[0].start) {
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

watch(currentUser, (val) => {
  if (val && val.uid) {
    subscribeToCalendar()
  } else {
    if (calendarInstance) calendarInstance.removeAllEvents()
    if (calendarUnsubscribe) { try { calendarUnsubscribe() } catch(e){}; calendarUnsubscribe = null }
  }
}, { immediate: true })

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
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'lowercase', 
      hour12: true,
      omitZeroMinute: true   
    },
    slotLabelFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'lowercase',
      hour12: true,
      omitZeroMinute: true
    },
    eventColor: getComputedStyle(document.documentElement).getPropertyValue('--muted').trim(),


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

const handleEventClick = (info) => {
  const event = info.event
  editingEvent.value = event
  
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
  let endDate = info.end ? new Date(info.end) : null;
  newEvent.value = {
    title: '',
    start: formatDateForInput(info.start),
    end: endDate ? formatDateForInput(endDate) : '',
    allDay: info.allDay, 
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
  if (info.draggedEl && info.draggedEl.classList.contains('playlist-card')) {
    try {
      const transferElement = info.draggedEl.querySelector('[data-transfer]')
      if (transferElement) {
        const data = JSON.parse(transferElement.getAttribute('data-transfer'))
        
        if (data.type === 'workout' && data.workout) {
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

const timeError = computed(() => {
  const s = newEvent.value?.start
  const e = newEvent.value?.end
  if (!s || !e) return false
  const sd = new Date(s)
  const ed = new Date(e)
  if (isNaN(sd) || isNaN(ed)) return false
  return sd > ed
})

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
      calendarInstance.addEventSource(events)
      emit('events-imported', events)
    }

    try {
      if (currentUser.value && currentUser.value.uid) {
        const q = query(collection(db, 'calendar'), where('userId', '==', currentUser.value.uid))
        const snap = await getDocs(q)
        
        let mergedIcs = text 
        let duplicateCount = 0
        
        if (!snap.empty) {
          const existing = snap.docs[0]
          const existingData = existing.data()
          const existingIcs = existingData.ics || ''
          
          if (existingIcs) {
            try {
              const existingJcal = ICAL.parse(existingIcs)
              const existingComp = new ICAL.Component(existingJcal)
              const existingVevents = existingComp.getAllSubcomponents('vevent')
              
              const importedVevents = vevents
              
              const existingEventKeys = new Set()
              existingVevents.forEach(vevent => {
                try {
                  const event = new ICAL.Event(vevent)
                  const uid = event.uid
                  const key = uid || `${event.summary}-${event.startDate.toJSDate().getTime()}`
                  existingEventKeys.add(key)
                } catch (e) {
                }
              })
              
              const uniqueImportedVevents = importedVevents.filter(vevent => {
                try {
                  const event = new ICAL.Event(vevent)
                  const uid = event.uid
                  const key = uid || `${event.summary}-${event.startDate.toJSDate().getTime()}`
                  const isDuplicate = existingEventKeys.has(key)
                  if (isDuplicate) duplicateCount++
                  return !isDuplicate
                } catch (e) {
                  return true 
                }
              })
              
              const allVevents = [...existingVevents, ...uniqueImportedVevents]
              
              const mergedComp = new ICAL.Component(['vcalendar', [], []])
              mergedComp.updatePropertyWithValue('version', '2.0')
              mergedComp.updatePropertyWithValue('prodid', '-//FitU//EN')
              

              allVevents.forEach(vevent => {
                mergedComp.addSubcomponent(vevent)
              })
              
              mergedIcs = mergedComp.toString()
              
            } catch (parseErr) {
              console.warn('[Calendar] Error parsing existing ICS for merge, will append:', parseErr)
              if (/END:VCALENDAR/i.test(existingIcs)) {
                const importedEventsText = text.replace(/BEGIN:VCALENDAR.*?\n/i, '').replace(/END:VCALENDAR.*$/i, '').trim()
                mergedIcs = existingIcs.replace(/\r?\n?END:VCALENDAR\s*$/i, '\r\n' + importedEventsText + '\r\nEND:VCALENDAR')
              } else {
                mergedIcs = existingIcs + '\r\n' + text
              }
            }
          }
          
          await updateDoc(firestoreDoc(db, 'calendar', existing.id), {
            ics: mergedIcs,
            updatedAt: serverTimestamp()
          })
          console.debug('[Calendar] merged and updated ICS for doc', existing.id)
          
        } else {
          const userDocRef = firestoreDoc(db, 'calendar', currentUser.value.uid)
          await setDoc(userDocRef, {
            userId: currentUser.value.uid,
            ics: mergedIcs,
            createdAt: serverTimestamp()
          }, { merge: true })
          console.debug('[Calendar] created new calendar doc with imported ICS', currentUser.value.uid)
        }
        
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
    
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (error) {
    console.error('Error parsing ICS file:', error)
    alert('Error importing calendar file. Please check the file format.')
  }
}

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
    allDay: newEvent.value.allDay,
    description: newEvent.value.description,
    extendedProps: {

      description: newEvent.value.description
    }
  }

  if (editingEvent.value) {
    editingEvent.value.setProp('title', eventData.title)
    editingEvent.value.setStart(eventData.start)
    editingEvent.value.setEnd(eventData.end)
    editingEvent.value.setAllDay(eventData.allDay)
    editingEvent.value.setExtendedProp('description', eventData.description)

    
    emit('event-updated', {
      id: editingEvent.value.id,
      ...eventData
    })
    try {
      const outgoing = { ...eventData, extendedProps: editingEvent.value.extendedProps || {} }
      await updateEventInIcs(editingEvent.value.id, outgoing)
    } catch (err) {
      console.error('[Calendar] updateEventInIcs error:', err)
    }
  } else {
    if (calendarInstance) {
      const event = calendarInstance.addEvent(eventData)
      emit('event-added', {
        id: event.id,
        ...eventData
      })
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
  if (editingEvent.value) {
    showDeleteConfirm.value = true
  }
}

const confirmDelete = async () => {
  showDeleteConfirm.value = false
  if (!editingEvent.value) return

  const event = editingEvent.value
  const eventId = event.id

  try {
    event.remove()
  } catch (e) {
    console.warn('[Calendar] event remove failed (already removed?)', e)
  }


  try {
    await deleteEventInIcs(eventId, event)
  } catch (err) {
    console.error('[Calendar] deleteEventInIcs error:', err)
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

const deleteEventInIcs = async (editingEventId, eventObj) => {
  if (!currentUser.value || !currentUser.value.uid) return

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

    if (typeof idx === 'number' && idx >= 0 && idx < matches.length) {
      const original = matches[idx]
      let newIcs = currentIcs.replace(original, '')
      newIcs = newIcs.replace(/\r?\n{2,}/g, '\r\n')
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

  if (docId) {
    try {
      const docRef = firestoreDoc(db, 'calendar', docId)
      const removed = await tryRemoveFromDoc(docRef)
      if (removed) return
    } catch (err) {
      console.error('[Calendar] deleteEventInIcs by docId failed:', err)
    }
  }

  if (importedDocId.value) {
    try {
      const docRef = firestoreDoc(db, 'calendar', importedDocId.value)
      const removed = await tryRemoveFromDoc(docRef)
      if (removed) return
    } catch (err) {
      console.error('[Calendar] deleteEventInIcs by importedDoc failed:', err)
    }
  }

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

const showClearConfirm = ref(false)

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
      return
    } catch (err) {
      console.error('[Calendar] error clearing ICS:', err)
      alert('Could not clear calendar. Please try again.')
      return
    }
  }

  if (calendarInstance) {
    calendarInstance.removeAllEvents()
  }
  hasImportedIcs.value = false
  importedDocId.value = null
  openImportSuccess('Calendar cleared', 'Reset successful')
}

const clearCalendar = () => {
  showClearConfirm.value = true
}

const pad = (n) => n.toString().padStart(2, '0')
const toIcsDateTime = (d) => {
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

const appendEventToIcs = async (ev) => {
  if (!currentUser.value || !currentUser.value.uid) return

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
        newIcs = currentIcs.replace(/\r?\n?END:VCALENDAR\s*$/i, '\r\n' + veventString + '\r\nEND:VCALENDAR')
      } else if (currentIcs) {
        newIcs = currentIcs + '\r\n' + veventString
      } else {
        newIcs = wrapWithVCalendar(veventString)
      }

      await updateDoc(docRef, { ics: newIcs, updatedAt: serverTimestamp() })
      console.debug('[Calendar] appended VEVENT to existing calendar doc', importedDocId.value)
      return
    }
  }

  const newIcs = wrapWithVCalendar(veventString)
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

const updateEventInIcs = async (editingEventId, ev) => {
  if (!currentUser.value || !currentUser.value.uid) return

  let docId = null
  let idx = null
  const m = String(editingEventId).match(/^(.+?)_(\d+)$/)
  if (m) {
    docId = m[1]
    idx = parseInt(m[2], 10)
  }

  const buildAndReplace = async (docRef, currentIcs, targetIndex, existingUid) => {
    const veventString = buildVEventString(ev, existingUid)
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

const addEvent = async (eventData) => {
  if (calendarInstance) {
    const event = calendarInstance.addEvent(eventData)
    
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
  if (importSuccessTimeout) {
    try { clearTimeout(importSuccessTimeout) } catch(e){}
    importSuccessTimeout = null
  }
})

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


.fc a, 
.fc-daygrid-day-number, 
.fc-event {
  text-decoration: none !important;
  color: white !important;
}

.fc-toolbar-title { 
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

.calendar-component .calendar-container,
.calendar-component .event-form-modal,
.calendar-component .fc-scroller {
  scrollbar-color: #555 var(--surface-subtle); 
  scrollbar-width: thin; 
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

.calendar-component .fc .fc-list-day-cushion {
  background-color: var(--surface-subtle) !important;
}
.calendar-component .fc .fc-list-day:hover .fc-list-day-cushion {
  background-color: var(--surface-subtle) !important;
}

.calendar-component .fc .fc-list-event:hover td {
  background-color: black !important;
}

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
  background-color: rgba(0, 0, 0, 0.6) !important; 
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

@media (max-width: 768px) {
  
  .event-form-modal {
    margin: 1rem;
    width: calc(100% - 2rem);
  }
  #importBtn {
    margin-top: 10px;
  }
}



@media (max-width: 648px) {
  #clearCalendar,
  #addEvent,
  #importBtn {
    font-size: 0.65rem !important;
    padding: 10px;
  }
}

@media (max-width: 522px) {
  #clearCalendar,
  #addEvent,
  #importBtn {
    font-size: 0.55rem !important;
    padding: 10px;
  }
}

@media (max-width: 422px) {
  #clearCalendar,
  #addEvent,
  #importBtn {
    font-size: 0.50rem !important;
    padding: 8px;
  }
}


@media (max-width: 720px) {
  .calendar-element {
    padding: 6px;
    min-height: 280px;
  }

  .fc .fc-toolbar {
    padding: 6px 8px !important;
    gap: 6px !important;
  }

  .fc .fc-toolbar .fc-toolbar-title {
    font-size: 14px !important;
    line-height: 1 !important;
  }

  .fc .fc-button,
  .fc .fc-button:where(:not(.fc-button-active)) {
    font-size: 12px !important;
    padding: 4px 8px !important;
    min-width: 36px !important;
  }

  .fc .fc-toolbar-chunk {
    padding: 0 !important;
    margin: 0 !important;
  }

  .fc .fc-daygrid-day-number,
  .fc-col-header-cell-cushion {
    font-size: 12px !important;
  }
}

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

  .event-form-modal {
    padding: 12px !important;
    max-width: 95% !important;
  }
}

@media (max-width: 470px) {
  .fc .fc-toolbar {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 6px !important;
  }

  .fc .fc-toolbar .fc-toolbar-title {
    display: block !important;
    text-align: center !important;
    width: 100% !important;
    font-size: 13px !important;
    margin: 6px 0 !important;
  }

  .fc .fc-toolbar .fc-toolbar-chunk {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    width: 100% !important;
    gap: 6px !important;
    flex-wrap: wrap !important;
  }

  .fc .fc-button {
    font-size: 11px !important;
    padding: 3px 6px !important;
  }
}

@media (max-width: 432px) {
  .calendar-controls ,
  .calendar-controls ,
  .calendar-controls .custom-upload-btn {
    font-size: 11px !important;
    padding: 4px 8px !important;
    min-height: 28px !important;
    line-height: 1 !important;
  }

  .calendar-controls {
    padding: 0.5rem !important;
  }

  .calendar-controls .row > [class*="col-"] {
    display: flex;
    align-items: center;
  }
}

.calendar-component .fc .fc-toolbar {
  background: transparent !important;
}

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
  outline: 2px solid rgba(100, 149, 237, 0.35) !important; 
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

.calendar-component .fc .fc-toolbar-title {
  color: #ffffff !important;
}

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

.calendar-component .fc-highlight {
  background-color: rgba(0, 191, 255, 0.2) !important;
}
</style>
