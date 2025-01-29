<template>
  <div class="p-4">
    <div class="text-sm text-surface-300 mb-4">Preview Panel</div>
    <div class="aspect-video bg-surface-700 rounded flex items-center justify-center">
      <span class="material-symbols-outlined text-6xl text-surface-400">view_in_ar</span>
    </div>
    <div class="mt-4 flex gap-2">
      <button 
        v-for="tool in tools" 
        :key="tool.icon"
        class="p-2 hover:bg-surface-700 rounded"
        :title="tool.name"
      >
        <span class="material-symbols-outlined">{{ tool.icon }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const tools = [
  { name: 'Pan', icon: 'pan_tool' },
  { name: 'Zoom', icon: 'zoom_in' },
  { name: 'Rotate', icon: '3d_rotation' },
  { name: 'Measure', icon: 'straighten' }
]
</script>
