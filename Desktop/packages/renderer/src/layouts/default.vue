<template>
  <v-main class="d-flex">
    <RouterView />

    <div class="version-container">DJI Mission Creator v{{ APP_VERSION }}</div>
  </v-main>
</template>

<script lang="ts" setup>
const APP_VERSION = import.meta.env.VITE_APP_VERSION;
</script>

<style lang="scss">
.v-main {
  height: 100vh;
}

.v-container {
  position: relative;
  padding: 0;
  margin: 0;
  height: 100%;
}

.version-container {
  @include floating-panel;
  position: fixed;
  bottom: var(--spacing-sm);
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(var(--color-surface-rgb), 0.8);
  font-size: var(--font-size-caption);
  font-weight: normal;
  padding: var(--spacing-xs) var(--spacing-sm);
  color: rgba(var(--color-opposite-rgb), 0.85);
}
</style>
