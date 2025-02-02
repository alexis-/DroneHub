<template>
  <div class="h-full max-h-full overflow-auto">
    <div class="p-4">
      <div class="text-sm text-surface-300 mb-4">Timeline Panel</div>
      <div class="space-y-2">
        <div v-for="(event, index) in events" :key="index" class="flex items-center gap-2">
          <span class="text-xs text-surface-400">{{ event.time }}</span>
          <span class="material-symbols-outlined text-sm">{{ event.icon }}</span>
          <span>{{ event.description }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const events = [
  { time: '10:00', icon: 'flight_takeoff', description: 'Drone takeoff' },
  { time: '10:05', icon: 'photo_camera', description: 'Started capture' },
  { time: '10:15', icon: 'flight_land', description: 'Drone landing' },
  { time: '10:20', icon: 'save', description: 'Data saved' }
]
</script>
