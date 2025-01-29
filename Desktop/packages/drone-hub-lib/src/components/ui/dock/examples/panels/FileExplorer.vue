<template>
  <div class="p-4">
    <div class="text-sm text-surface-300 mb-2">File Explorer Panel</div>
    <div class="space-y-2">
      <div v-for="item in items" :key="item.name" class="flex items-center gap-2">
        <span class="material-symbols-outlined text-surface-400">{{ item.icon }}</span>
        <span>{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const items = [
  { name: 'Project 1', icon: 'folder' },
  { name: 'Project 2', icon: 'folder' },
  { name: 'notes.txt', icon: 'description' },
  { name: 'data.json', icon: 'data_object' }
]
</script>
