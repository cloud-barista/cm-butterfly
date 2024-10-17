<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useFlowChartModel } from '@/features/workflow/workflowEditor/sequential/designer/model/sequentialDesignerModel.ts';

import { useSequentialToolboxModel } from '@/features/workflow/workflowEditor/sequential/designer/toolbox/model/toolboxModel.ts';

let flowChartModel;

const sequentialToolBoxModel = useSequentialToolboxModel();

onMounted(function () {
  let refs = this.$refs;

  sequentialToolBoxModel.then(taskComponents => {
    console.log(taskComponents);
    flowChartModel = useFlowChartModel(refs);
    flowChartModel.setToolboxGroupsSteps(null, null, [...taskComponents]);

    //TODO 초기 디자이너를 그리기위한 작업
    // flowChart.setDefaultSequence(tt.sequence);
    flowChartModel.initDesigner();
    flowChartModel.draw();
  });
});
</script>

<template>
  <div class="w-[100%] h-[100%] source-template-workflow-edit-container">
    <section class="w-[100%] h-[100%] workflow-box">
      <div ref="placeholder" class="w-[100%] h-[100%]"></div>
    </section>
  </div>
</template>

<style lang="postcss">
@import '@/../node_modules/sequential-workflow-designer/css/designer.css';
@import '@/../node_modules/sequential-workflow-designer/css/designer-light.css';
@import '@/../node_modules/sequential-workflow-designer/css/designer-dark.css';

.source-template-workflow-edit-container {
  .workflow-box {
    @apply border-gray-200;
    width: 100%;
    height: 100%;
    border-style: solid;
    border-width: 1px;
    border-radius: 6px;
    padding: 2px;

    .sqd-smart-editor-toggle {
      right: 500px;
    }

    .sqd-smart-editor-toggle.sqd-collapsed {
      right: 0;
    }

    .sqd-smart-editor {
      width: 500px;

      .sqd-editor {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
