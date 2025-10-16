<template>
  <div class="debug-section">
    <div class="section-header">
      <h4>Debug Information</h4>
      <p-button 
        size="sm" 
        style-type="secondary" 
        @click="toggleDebugInfo"
      >
        {{ showDebugInfo ? 'Hide Debug' : 'Show Debug' }}
      </p-button>
    </div>
    <div v-if="showDebugInfo" class="debug-content">
      <h5>Task Model:</h5>
      <pre>{{ JSON.stringify(taskModel, null, 2) }}</pre>
      
      <h5>Body Params (from targetSoftwareModel, modelProperties, or data.body_params):</h5>
      <pre>{{ JSON.stringify(taskModel.body_params, null, 2) }}</pre>
      
      <h5>Step Model Properties (used for body_params schema):</h5>
      <pre>{{ JSON.stringify(stepProperties, null, 2) }}</pre>
      
      <h5>Generated Schema:</h5>
      <pre>{{ JSON.stringify(taskSchema, null, 2) }}</pre>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';
import { PButton } from '@cloudforet-test/mirinae';

export default defineComponent({
  name: 'TaskDebugInformation',
  components: {
    PButton
  },
  props: {
    taskModel: {
      type: Object,
      required: true
    },
    taskSchema: {
      type: Object,
      required: true
    },
    stepProperties: {
      type: Object,
      required: true
    }
  },
  setup() {
    const showDebugInfo = ref(true); // 디버그 정보를 기본적으로 표시

    const toggleDebugInfo = () => {
      showDebugInfo.value = !showDebugInfo.value;
    };

    return {
      showDebugInfo,
      toggleDebugInfo
    };
  }
});
</script>

<style scoped lang="postcss">
.debug-section {
  @apply mt-6 p-4 bg-gray-100 rounded-lg;
}

.section-header {
  @apply flex justify-between items-center mb-4 pb-2 border-b border-gray-200;
}

.section-header h4 {
  @apply text-lg font-semibold text-gray-800;
}

.debug-content {
  @apply mt-2;
}

.debug-content h5 {
  @apply text-sm font-medium text-gray-700 mt-4 mb-2;
}

.debug-content pre {
  @apply text-xs text-gray-600 bg-white p-3 rounded-md border overflow-auto;
  max-height: 300px;
}
</style>
