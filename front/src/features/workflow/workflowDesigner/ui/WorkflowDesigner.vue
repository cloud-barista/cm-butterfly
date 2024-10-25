<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { PButton } from '@cloudforet-test/mirinae';
import { useFlowChartModel } from '@/features/workflow/workflowDesigner/model/flowChartModel.ts';
import { useWorkflowToolModel } from '@/features/workflow/model/workflowToolModel.ts';
import { IWorkflow } from '@/entities/workflow/model/types.ts';

let flowChart;
const name = reactive({ _name: 'Vue 컴포넌트' });

//클릭시 해당 데이터를 저장할 변수
const targetModel = ref({});

const workflowToolModel = useWorkflowToolModel();

let t: IWorkflow = {
  createdDatetime: '',
  data: {
    description: 'Create Server',
    task_groups: [
      {
        description: 'Migrate Server',
        name: 'migrate_infra',
        tasks: [
          {
            dependencies: [],
            name: 'infra_create',
            path_params: 's',
            request_body: {
              name: 'recommended-infra01',
              installMonAgent: 'no',
              label: 'DynamicVM',
              systemLabel: '',
              description: 'Made in CB-TB',
              vm: [
                {
                  name: 'recommended-vm01',
                  subGroupSize: '3',
                  label: 'DynamicVM',
                  description: 'Description',
                  commonSpec: 'azure-koreacentral-standard-b4ms',
                  commonImage: 'ubuntu22-04',
                  rootDiskType: 'default',
                  rootDiskSize: 'default',
                  vmUserPassword: 'test',
                  connectionName: 'azure-koreacentral',
                },
              ],
            },
            task_component: 'beetle_task_infra_migration',
          },
        ],
      },
    ],
  },
  description: '',
  id: '',
  name: '',
  updateDatetime: '',
};

let t2: IWorkflow = {
  createdDatetime: '',
  data: {
    description: '',
    task_groups: [
      {
        description: 'string',
        name: 'Task Group',
        tasks: [
          {
            dependencies: ['any[]'],
            name: 'bettle_task',
            path_params: 'any',
            request_body: {
              name: 'bettle_task',
              installMonAgent: 'string',
              label: 'string',
              systemLabel: 'string',
              description: 'string',
              vm: [],
            },
            task_component: 'string',
          },
        ],
        task_groups: [
          {
            description: 'string',
            name: 'Task Group',
            tasks: [
              {
                dependencies: ['any[]'],
                name: 'bettle_task',
                path_params: 'any',
                request_body: {
                  name: 'string',
                  installMonAgent: 'string',
                  label: 'string',
                  systemLabel: 'string',
                  description: 'string',
                  vm: [],
                },
                task_component: 'string',
              },
            ],
            task_groups: [],
          },
        ],
      },
    ],
  },
  description: '',
  id: '',
  name: '',
  updateDatetime: '',
};

let tt = workflowToolModel.setWorkflowSequenceModel(t2);
onMounted(function () {
  let refs = this.$refs;

  flowChart = useFlowChartModel(refs);
  flowChart.setDefaultSequence(tt.sequence);
  flowChart.initDesigner();
  flowChart.draw();
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
