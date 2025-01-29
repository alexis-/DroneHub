<template>
  <div class="p-4">
    <div class="text-sm text-surface-300 mb-4">Properties Panel</div>
    <div class="space-y-4">
      <div v-for="prop in properties" :key="prop.name" class="space-y-1">
        <label class="text-sm text-surface-400">{{ prop.name }}</label>
        <input 
          :type="prop.type" 
          :value="prop.value"
          class="w-full bg-surface-700 border border-surface-600 rounded px-2 py-1"
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const properties = [
  { name: 'Name', type: 'text', value: 'Sample Item' },
  { name: 'Width', type: 'number', value: 100 },
  { name: 'Height', type: 'number', value: 100 },
  { name: 'Color', type: 'color', value: '#ff0000' }
]
</script>
