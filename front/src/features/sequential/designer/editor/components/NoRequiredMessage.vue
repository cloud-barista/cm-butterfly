<template>
  <div class="no-required-message">
    <p class="text-gray-500 text-sm">no required</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'NoRequiredMessage'
});
</script>

<style scoped>
.no-required-message {
  padding: 16px;
  text-align: center;
}

.text-gray-500 {
  color: #6b7280;
}

.text-sm {
  font-size: 0.875rem;
}
</style>
