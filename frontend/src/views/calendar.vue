<template>
  <div class="calendar-page">
    <div class="container mt-4">
      <CalendarComponent 
        :show-controls="true"
        :show-add-event="true"
        :show-file-upload="true"
        :show-department-field="false"
        :editable="true"
        :selectable="true"
        @event-added="handleEventAdded"
        @event-updated="handleEventUpdated"
        @event-deleted="handleEventDeleted"
        @event-clicked="handleEventClicked"
        @date-selected="handleDateSelected"
        @events-imported="handleEventsImported"
      />
    </div>
  </div>
</template>

<script setup>
import CalendarComponent from "@/components/CalendarComponent.vue"

// Event handlers
const handleEventAdded = (event) => {
  console.log("Event added:", event)
}

const handleEventUpdated = (event) => {
  console.log("Event updated:", event)
}

const handleEventDeleted = (eventId) => {
  console.log("Event deleted:", eventId)
}

const handleEventClicked = (event) => {
  console.log("Event clicked:", event)
}

const handleDateSelected = (info) => {
  console.log("Date selected:", info)
}

const handleEventsImported = (events) => {
  console.log("Events imported:", events.length, "events")
}
</script>

<style scoped>
.calendar-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.container {
  max-width: 1200px;
}
</style>
