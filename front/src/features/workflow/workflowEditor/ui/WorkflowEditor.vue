<script setup lang="ts">
import { useWorkflowToolModel } from '../model/workflowEditorModel.ts';
import SequentialDesigner from '@/features/workflow/workflowEditor/sequential/designer/ui/SequentialDesigner.vue';
import { useInputModel } from '@/shared/hooks/input/useInputModel.ts';
import {
  PTextInput,
  PSelectDropdown,
  PFieldGroup,
  PButton,
} from '@cloudforet-test/mirinae';
import Vue, { onBeforeMount, onMounted, reactive, Ref, ref, watch } from 'vue';
import { getWorkflowTemplateList } from '@/entities/workflow/api';
import { IWorkflow } from '@/entities/workflow/model/types.ts';
import { Step } from '@/features/workflow/workflowEditor/model/types.ts';
import { SourceServicePage } from '@/pages/sourceServices';
import { Designer } from 'sequential-workflow-designer';

interface IProps {
  wftId: string;
  toolType: 'edit' | 'viewer' | 'add';
}

const props = defineProps<IProps>();

//목적: 서버에서 받아온 workflow관련 데이터를 flowchart 라이브러리에 맞게 변환후 props로 내려주는 역할.

watch(
  () => props.toolType,
  nv => {
    nv;
  },
);
const resWorkflowTemplate = getWorkflowTemplateList();

const workflowToolModel = useWorkflowToolModel();
const workflowName = useInputModel<string>('');
const description = useInputModel<string>('');
const sequence: Ref<Step[]> = ref<Step[]>([]);

onBeforeMount(() => {
  //TODO 실제 workflowTemplate 넣어야함.
  sequence.value =
    workflowToolModel.convertCicadaToDesignerFormData(temp).sequence;
});
onMounted(() => {
  resWorkflowTemplate.execute();
});

let temp: IWorkflow = {
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
            path_params: null,
            request_body:
              '{\n    "name": "recommended-infra01",\n    "installMonAgent": "no",\n    "label": "DynamicVM",\n    "systemLabel": "",\n    "description": "Made in CB-TB",\n    "vm": [\n        {\n            "name": "recommended-vm01",\n            "subGroupSize": "3",\n            "label": "DynamicVM",\n            "description": "Description",\n            "commonSpec": "azure-koreacentral-standard-b4ms",\n            "commonImage": "ubuntu22-04",\n            "rootDiskType": "default",\n            "rootDiskSize": "default",\n            "vmUserPassword": "test",\n            "connectionName": "azure-koreacentral"\n        }\n    ]\n}',
            task_component: 'beetle_task_infra_migration',
          },
        ],
      },
    ],
  },
  id: '15a47239-0080-4eb6-b530-9a54a189c506',
  name: 'create_infra_workflow',
  description: 'test',
  createdDatetime: 'set',
  updateDatetime: 'string;',
};

let temp2: IWorkflow = {
  data: {
    description: 'Migrate Server',
    task_groups: [
      {
        description: 'Migrate Server',
        id: '4e64cd27-5109-414e-b891-2f4af87e0328',
        name: 'migrate_infra',
        tasks: [
          {
            dependencies: [],
            id: '1a1e906d-13cb-4f00-8141-190db59eda2c',
            name: 'infra_import',
            path_params: {
              sgId: '3e635238-0c4b-4f6e-9062-906f3dd5f571',
            },
            query_params: null,
            request_body: '',
            task_component: 'honeybee_task_import_infra',
          },
          {
            dependencies: ['infra_import'],
            id: 'ca9a8307-34a8-4bbd-a299-de54feb3a6e5',
            name: 'infra_get',
            path_params: {
              CSP: 'aws',
              region: 'ap-northeast-2',
              sgId: '3e635238-0c4b-4f6e-9062-906f3dd5f571',
            },
            query_params: null,
            request_body: '',
            task_component:
              'honeybee_task_get_infra_refined_for_recommendation_request',
          },
          {
            dependencies: ['infra_get'],
            id: 'f1a370a5-3eb3-4cd6-9c35-2146f94e9cac',
            name: 'infra_recommend',
            path_params: null,
            query_params: null,
            request_body: 'infra_get',
            task_component: 'beetle_task_recommend_infra',
          },
          {
            dependencies: ['infra_recommend'],
            id: 'b69f8f27-0aa1-48d8-acd2-1cc5454d034b',
            name: 'infra_migration',
            path_params: null,
            query_params: null,
            request_body: 'infra_recommend',
            task_component: 'beetle_task_infra_migration',
          },
          {
            dependencies: ['infra_migration'],
            id: '9e878aee-b48c-48b9-a9d8-1b7e188974b2',
            name: 'register_target_to_source_group',
            path_params: {
              sgId: '3e635238-0c4b-4f6e-9062-906f3dd5f571',
            },
            query_params: null,
            request_body: 'infra_migration',
            task_component: 'honeybee_register_target_info_to_source_group',
          },
        ],
      },
    ],
  },
  id: '15a47239-0080-4eb6-b530-9a54a189c506',
  name: 'create_infra_workflow',
  description: 'test',
  createdDatetime: 'set',
  updateDatetime: 'string;',
};

// let temp3: IWorkflow = {
//   data: {
//     description: 'Create Server',
//     task_groups: [
//       {
//         description: 'Migrate Server',
//         name: 'migrate_infra',
//         tasks: [
//           {
//             dependencies: [],
//             name: 'infra_create',
//             path_params: null,
//             request_body:
//
//             task_component: 'beetle_task_infra_migration',
//           },
//         ],
//       },
//     ],
//   },
//   id: '15a47239-0080-4eb6-b530-9a54a189c506',
//   name: 'create_infra_workflow',
//   description: 'test',
//   createdDatetime: 'set',
//   updateDatetime: 'string;',
// };

if (props.toolType === 'edit') {
  workflowToolModel.getWorkflowToolData(props.wftId);
} else if (props.toolType === 'add') {
  workflowToolModel.getWorkflowToolData(props.wftId, 'template');
}
const trigger = reactive({ trigger: false });

function getDesigner(designer: Designer | null) {
  trigger.trigger = false;

  const workflow = {};
  if (designer) {
    const definition = designer.getDefinition();

    Object.assign(workflow, {
      data: {
        description: '',
        task_groups: workflowToolModel.convertDesignerSequenceToCicada(
          definition.sequence as Step[],
        ),
      },
      description: '',
      id: '',
      name: '',
    });
  }
  return workflow;
}

function handleSave() {
  trigger.trigger = true;
}

function handleCancel() {
  trigger.trigger = true;
}

//TODO workflow template get api
</script>

<template>
  <div class="workflow-tool-modal-page w-full h-full">
    <header class="h-[54px] workflow-tool-header mb-[16px]">
      <PFieldGroup class="flex-1" :label="'Workflow Name'" required>
        <p-text-input v-model="workflowName.value.value" block></p-text-input>
      </PFieldGroup>
      <PFieldGroup class="flex-1" :label="'Description'">
        <p-text-input v-model="description.value.value" block></p-text-input>
      </PFieldGroup>
      <PFieldGroup class="flex-1" :label="'Workflow Template'" required>
        <p-select-dropdown class="w-full"></p-select-dropdown>
      </PFieldGroup>
    </header>
    <section class="workflow-tool-body">
      <SequentialDesigner
        :sequence="sequence"
        :trigger="trigger"
        @getDesigner="getDesigner"
      ></SequentialDesigner>
    </section>
    <footer class="h-[40px]">
      <PButton @click="handleCancel">Cancel</PButton>
      <PButton @click="handleSave">Save</PButton>
    </footer>
  </div>
</template>

<style scoped lang="postcss">
.workflow-tool-header {
  @apply h-[54px] flex gap-[16px];
}

.workflow-tool-body {
  @apply h-[calc(100%-94px)];
}
</style>
