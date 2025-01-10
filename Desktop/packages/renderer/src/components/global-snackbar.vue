<template>
  <v-snackbar v-model="isVisible" multi-line>
    {{ message }}

    <template v-slot:actions>
      <v-btn color="red" variant="text" @click="hideSnackbar">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const isVisible = ref(false);
const message = ref('');

const showSnackbar = (msg: string) => {
  message.value = msg;
  isVisible.value = true;
};

const hideSnackbar = () => {
  isVisible.value = false;
};

// Expose methods to parent
defineExpose({ showSnackbar: showSnackbar, hideSnackbar: hideSnackbar });
</script>