<script setup lang="ts">
import { PButton } from '@cloudforet-test/mirinae';
import { Ref } from 'vue';
import LoadTestEvaluationMetric from '@/widgets/workload/vm/vmEvaluatePerf/ui/LoadTestEvaluationMetric.vue';
import LoadTestResourceMetric from '@/widgets/workload/vm/vmEvaluatePerf/ui/LoadTestResourceMetric.vue';
import LoadTestAggregationTable from '@/widgets/workload/vm/vmEvaluatePerf/ui/LoadTestAggregationTable.vue';

interface IProps {
  mciId: string;
  nsId: string;
  vmId: string;
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
    <div class="flex flex-col gap-4">
      <div class="font-bold text-2xl">
        Aggregation Table
        <LoadTestAggregationTable
          :mciId="mciId"
          :nsId="nsId"
          :vmId="vmId"
        ></LoadTestAggregationTable>
      </div>
      <div class="chart w-full">
        <div class="font-bold text-2xl">Result metric</div>
        <div class="h-[calc(100%-2rem)]">
          <LoadTestEvaluationMetric
            :mciId="mciId"
            :nsId="nsId"
            :vmId="vmId"
          ></LoadTestEvaluationMetric>
        </div>
      </div>
      <div class="chart w-full font-bold text-2xl">
        <div class="font-bold text-2xl">Resource Metric</div>
        <div class="h-[calc(100%-2rem)]">
          <LoadTestResourceMetric
            :mciId="mciId"
            :nsId="nsId"
            :vmId="vmId"
          ></LoadTestResourceMetric>
        </div>
      </div>
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
  height: 500px;
  border-radius: 4px 0px 0px 0px;
}
</style>
