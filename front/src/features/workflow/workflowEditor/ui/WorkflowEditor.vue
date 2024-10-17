<script setup lang="ts">
import { useWorkflowToolModel } from '../model/workflowEditorModel.ts';
import {
  ITaskResponse,
  ITaskVmResponse,
  IWorkflow,
} from '@/entities/workflow/model/types.ts';
import WorkflowEditor from '@/features/workflow/temp/workflowEditor/sequential/designer/ui/SequentialDesigner.vue';
import { useInputModel } from '@/shared/hooks/input/useInputModel.ts';
import {
  PTextInput,
  PSelectDropdown,
  PFieldGroup,
  PButton,
} from '@cloudforet-test/mirinae';
import { watch } from 'vue';

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

const workflowToolModel = useWorkflowToolModel();

const workflowName = useInputModel<string>('');
const description = useInputModel<string>('');

if (props.toolType === 'edit') {
  workflowToolModel.getWorkflowToolData(props.wftId);
} else if (props.toolType === 'add') {
  workflowToolModel.getWorkflowToolData(props.wftId, 'template');
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
      <WorkflowEditor></WorkflowEditor>
    </section>
    <footer class="h-[40px]">
      <PButton>Cancel</PButton>
      <PButton>Save</PButton>
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
