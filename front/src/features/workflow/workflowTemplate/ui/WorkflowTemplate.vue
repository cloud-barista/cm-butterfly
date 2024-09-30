<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { useFlowChart } from '@/features/workflow/workflowTemplate/flowChart.ts';
import { PButton } from '@cloudforet-test/mirinae';

let flowChart;
const name = reactive({ _name: 'Vue 컴포넌트' });
onMounted(function () {
  let refs = this.$refs;

  flowChart = useFlowChart(refs);
  flowChart.initDesigner();
});
</script>

<template>
  <div>
    <div class="w-[1000px] h-[1000px] m-[50px]">
      <div ref="placeholder" class="w-[500px] h-[500px]"></div>
    </div>
  </div>
</template>

<style lang="postcss">
@import 'sequential-workflow-designer/css/designer.css';
@import 'sequential-workflow-designer/css/designer-light.css';
@import 'sequential-workflow-designer/css/designer-dark.css';
</style>
