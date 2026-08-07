<script setup lang="ts">
/**
 * TableLoadingSpinner
 *
 * Shared spinner component shown while table data is loading
 *
 * @example
 * <table-loading-spinner
 *   :loading="apiInstance.isLoading.value"
 *   :height="height"
 *   message="Loading data..."
 * />
 * <p-toolbox-table
 *   v-if="!apiInstance.isLoading.value"
 *   :items="tableModel.tableState.displayItems"
 *   @refresh="fetchData"
 * />
 *
 * @prop {boolean} loading - loading state (required)
 * @prop {string} message - message to display (optional, default: 'Loading...')
 * @prop {string|number} height - height of the spinner area (optional)
 */
import { PSpinner } from '@cloudforet-test/mirinae';
import { computed } from 'vue';

interface Props {
  loading: boolean;
  message?: string;
  height?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  message: 'Loading...',
});

const computedStyle = computed(() => {
  if (props.height) {
    const heightValue =
      typeof props.height === 'number' ? `${props.height}px` : props.height;
    return { height: heightValue };
  }
  return {};
});
</script>

<template>
  <div v-if="loading" class="table-loading-spinner" :style="computedStyle">
    <p-spinner size="xl" />
    <p>{{ message }}</p>
    <!--
      Room for a line about *why* the wait is taking as long as it is.

      A spinner on its own says only that something is happening. When the wait has a reason
      the caller knows — the server asked us to come back in a moment, say — saying it here
      keeps that with the spinner instead of putting a separate notice somewhere else on the
      screen, which would read as an error beside a screen that is still working.
    -->
    <slot name="detail" />
  </div>
</template>

<style scoped>
.table-loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: white;
  border-radius: 8px;
  min-height: 300px;
}

.table-loading-spinner p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}
</style>
