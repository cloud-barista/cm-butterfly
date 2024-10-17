<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { PButton } from '@cloudforet-test/mirinae';
import { useFlowChartModel } from '@/features/workflow/workflowDesigner/model/flowChartModel.ts';
import { useWorkflowToolModel } from '@/features/workflow/model/workflowToolModel.ts';
import { IWorkflow } from '@/entities/workflow/model/types.ts';
import {
  getTaskComponentList,
  ITaskInfoResponse,
  ITaskRequestBody,
} from '@/features/workflow/workflowDesigner/api';
import { parseRequestBody } from '@/shared/utils/stringToObject';
import { toolboxSteps } from '@/features/workflow/workflowDesigner/model/toolboxSteps.ts';
import { Step } from '@/features/workflow/model/types.ts';
import getRandomId from '@/shared/utils/uuid';
import { useWorkflowDesignerModel } from '@/features/workflow/workflowDesigner/model/workflowDesignerModel.ts';

let flowChartModel;

//클릭시 해당 데이터를 저장할 변수
const resGetTaskComponentList = getTaskComponentList();
const workflowDesignerModel = useWorkflowDesignerModel();

onMounted(function () {
  let refs = this.$refs;

  resGetTaskComponentList.execute().then(res => {
    workflowDesignerModel.processToolBoxTaskListResponse(
      res.data.responseData!,
    );

    flowChartModel = useFlowChartModel(refs);
    flowChartModel.setToolboxGroupsSteps(null, null, [
      ...workflowDesignerModel.getTaskStepsModels(),
    ]);

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
