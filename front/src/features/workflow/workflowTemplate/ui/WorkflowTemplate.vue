<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useFlowChart } from '@/features/workflow/workflowTemplate/flowChart.ts';
import { PButton } from '@cloudforet-test/mirinae';

let flowChart;
const name = reactive({ _name: 'Vue 컴포넌트' });

//클릭시 해당 데이터를 저장할 변수
const targetModel = ref({});

onMounted(function () {
  let refs = this.$refs;

  flowChart = useFlowChart(refs);
  flowChart.initDesigner();
});
</script>

<template>
  <div class="w-[100%] h-[100%] source-template-workflow-edit-container">
    <section class="w-[100%] h-[100%] workflow-box">
      <div ref="placeholder" class="w-[100%] h-[100%]"></div>
    </section>

    <!--    editor 관련 template 작성 -->
  </div>
</template>

<style lang="postcss">
@import 'sequential-workflow-designer/css/designer.css';
@import 'sequential-workflow-designer/css/designer-light.css';
@import 'sequential-workflow-designer/css/designer-dark.css';

.source-template-workflow-edit-container {
  .workflow-box {
    @apply border-gray-200;
    width: 100%;
    height: 100%;
    border-style: solid;
    border-width: 1px;
    border-radius: 6px;
    padding: 2px;
  }
}
</style>
