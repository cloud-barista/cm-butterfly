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

let flowChart;

//클릭시 해당 데이터를 저장할 변수
const targetModel = ref({});
const workflowToolModel = useWorkflowToolModel();
// let tt = workflowToolModel.setWorkflowSequenceModel(t2);
//TODO task 정보 등록 (api호출)
const resGetTaskComponentList = getTaskComponentList();
const loadStepsFunc = toolboxSteps();

const taskStepsModels: Step[] = [];

function convertTaskGroupStep() {}

function convertTaskStep() {}

onMounted(function () {
  let refs = this.$refs;

  resGetTaskComponentList.execute().then(res => {
    res.data.responseData?.forEach((res: ITaskInfoResponse) => {
      res.data.options.request_body = parseRequestBody(
        res.data.options.request_body,
      );

      const taskRequestData: ITaskRequestBody = res.data.options.request_body;
      console.log(taskRequestData);
      taskStepsModels.push(
        loadStepsFunc.defineBettleTaskStep(
          getRandomId(),
          taskRequestData.name ?? 'undefined',
          taskRequestData.label ?? 'undefined',
          {
            mci: {
              name: taskRequestData.name,
              description: taskRequestData.description,
              vms: taskRequestData.vm
                ? taskRequestData.vm.map(vm => ({
                    id: getRandomId(),
                    name: vm.name,
                    serverQuantity: vm.subGroupSize,
                    commonSpec: vm.commonSpec,
                    osImage: vm.commonImage,
                    diskType: vm.rootDiskType,
                    diskSize: vm.rootDiskSize,
                    password: vm.vmUserPassword,
                    connectionName: vm.connectionName,
                  }))
                : [],
            },
          },
        ),
      );
    });
    flowChart = useFlowChartModel(refs);
    flowChart.setToolboxGroupsSteps(
      [],
      [
        loadStepsFunc.defineTaskGroupStep(
          getRandomId(),
          'TaskGroup',
          'taskGroup',
        ),
        ...taskStepsModels,
      ],
    );
    // flowChart.setDefaultSequence(tt.sequence);
    flowChart.initDesigner();
    flowChart.draw();
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
