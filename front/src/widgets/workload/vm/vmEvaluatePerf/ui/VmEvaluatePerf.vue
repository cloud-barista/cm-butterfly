<script setup lang="ts">
import { PButton, PDataLoader } from '@cloudforet-test/mirinae';
import { Ref } from 'vue';
interface IProps {
  loading: Ref<boolean>;
}

const props = defineProps<IProps>();
const emit = defineEmits(['openLoadconfig']);
</script>

<template>
  <div class="vm-evaluate-perf-widget">
    <div class="widget-tab-section-header">
      <p>Evaluate Performance Result</p>
      <h5>
        when you complete the load configuration, you will see the result data.
        Please configure the load.
      </h5>
      <div class="flex gap-1.5">
        <p-button
          style-type="secondary"
          icon-left="ic_settings"
          @click="emit('openLoadconfig')"
        >
          Load Config
        </p-button>
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <p-data-loader :data="false" :loading="false" class="chart w-full">
      </p-data-loader>
      <p-data-loader :data="false" :loading="false" class="chart w-full">
      </p-data-loader>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.vm-evaluate-perf-widget {
  .widget-tab-section-header {
    padding: 18px 0 18px 0;
    display: flex;
    flex-direction: column;
    p {
      @apply text-display-lg;
      font-weight: 700;
    }

    h5 {
      font-size: 14px;
      font-weight: 400;
      line-height: 17.5px;
      text-align: left;
      margin: 16px 0 8px 0;
    }
  }
}

.chart {
  @apply border-gray-200 border;
  height: 280px;
  border-radius: 4px 0px 0px 0px;
}
</style>
