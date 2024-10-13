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

const target = [
  {
    componentType: 'switch',
    id: '6f8510aaaf062a7d323a4db822e12df9',
    type: 'if',
    name: 'If',
    properties: {
      isDeletable: true,
    },
    branches: {
      true: [
        {
          componentType: 'task',
          id: '4e42702929bebb818f2d806c749b9fd9',
          type: 'bettle_task',
          name: 'bettle_task',
          properties: {
            isDeletable: true,
          },
          sequence: [],
        },
      ],
      false: [
        {
          componentType: 'container',
          id: 'a494f0fb11b86a393e2183be8fe97ab5',
          type: 'MCI',
          name: 'Task Group',
          properties: {
            isDeletable: true,
          },
          sequence: [],
        },
      ],
    },
  },
  {
    componentType: 'switch',
    id: '6a6fe61a5b3634da89d964fce09324f8',
    type: 'if',
    name: 'If',
    properties: {
      isDeletable: true,
    },
    branches: {
      true: [
        {
          componentType: 'container',
          id: '9a0028d73ca05e5d2404c331f7db9928',
          type: 'MCI',
          name: 'Task Group',
          properties: {
            isDeletable: true,
          },
          sequence: [
            {
              componentType: 'task',
              id: '052fcc0a0cedd8bd7d0953e31445bdb1',
              type: 'bettle_task',
              name: 'bettle_task',
              properties: {
                isDeletable: true,
              },
              sequence: [],
            },
          ],
        },
      ],
      false: [],
    },
  },
];
const workflowToolModel = useWorkflowToolModel();

let t: IWorkflow = {
  createdDatetime: '',
  data: {
    description: '',
    task_groups: [
      {
        description: 'string',
        name: '',
        tasks: [
          {
            dependencies: ['any[]'],
            name: 'string',
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
        task_groups: [
          {
            description: 'string',
            name: '',
            tasks: [
              {
                dependencies: ['any[]'],
                name: 'string',
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

let tt = workflowToolModel.setWorkflowSequenceModel(t);
onMounted(function () {
  let refs = this.$refs;

  flowChart = useFlowChartModel(refs);
  flowChart.designerOptionsState.sequence = tt.sequence;
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
