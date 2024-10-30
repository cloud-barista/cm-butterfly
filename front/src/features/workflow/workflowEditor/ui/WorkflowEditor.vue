<script setup lang="ts">
import { CreateForm } from '@/widgets/layout';
import {
  PButton,
  PFieldGroup,
  PSelectDropdown,
  PTextInput,
} from '@cloudforet-test/mirinae';
import { useWorkflowToolModel } from '@/features/workflow/workflowEditor/model/workflowEditorModel.ts';
import { useInputModel } from '@/shared/hooks/input/useInputModel.ts';
import { onBeforeMount, reactive, ref, Ref } from 'vue';
import { Step } from '@/features/workflow/workflowEditor/model/types.ts';
import {
  IWorkflow,
  useCreateWorkflow,
  useGetWorkflowTemplateList,
  useUpdateWorkflowV2,
} from '@/entities';
import { Designer } from 'sequential-workflow-designer';
import SequentialDesigner from '@/features/workflow/workflowEditor/sequential/designer/ui/SequentialDesigner.vue';
import { showErrorMessage, showSuccessMessage } from '@/shared/utils';
import { getTaskComponentList } from '@/features/workflow/workflowEditor/sequential/designer/toolbox/model/api';

interface IProps {
  wftId: string;
  toolType: 'edit' | 'viewer' | 'add';
}

const props = defineProps<IProps>();
const emit = defineEmits(['update:close-modal', 'update:trigger']);

const workflowToolModel = useWorkflowToolModel();
const workflowName = useInputModel<string>('');
const workflowDescription = useInputModel<string>('');
const workflowData = ref<IWorkflow>();
const sequentialSequence: Ref<Step[]> = ref<Step[]>([]);

const resWorkflowTemplateData = useGetWorkflowTemplateList();
const resTaskComponentList = getTaskComponentList();
const resUpdateWorkflow = useUpdateWorkflowV2(null, null, null);
const resAddWorkFlow = useCreateWorkflow(null);
const loading = ref<boolean>(true);

const trigger = reactive({ value: false });

onBeforeMount(function () {
  Promise.all<any>([
    resWorkflowTemplateData.execute(),
    resTaskComponentList.execute(),
  ]).then(res => {
    workflowToolModel.workflowStore.setWorkflowTemplates(
      res[0].data.responseData,
    );
    workflowToolModel.setTaskComponent(res[1].data.responseData);
    workflowToolModel.setDropDownData(
      workflowToolModel.workflowStore.workflowTemplates,
    );
    load();
  });
});

function load() {
  loading.value = true;
  loadWorkflow();
  loadSequence();
  reorderingSequence();
  loading.value = false;
}

function loadWorkflow() {
  if (props.toolType === 'edit') {
    workflowData.value = workflowToolModel.getWorkflowData(props.wftId);
  } else if (props.toolType === 'add') {
    workflowData.value = workflowToolModel.getWorkflowTemplateData(
      workflowToolModel.dropDownModel.selectedItemId,
    );
  }

  workflowName.value.value = workflowData.value?.name || '';
  workflowDescription.value.value = workflowData.value?.description || '';
}

function loadSequence() {
  if (workflowData.value) {
    sequentialSequence.value =
      workflowToolModel.convertCicadaToDesignerFormData(
        workflowData.value,
        resTaskComponentList.data.value?.responseData!,
      ).sequence;

    console.log(sequentialSequence.value);
  }
}

function reorderingSequence() {
  sequentialSequence.value = workflowToolModel.designerFormDataReordering(
    sequentialSequence.value,
  );
}

function getCicadaData(designer: Designer | null): IWorkflow {
  const workflow: IWorkflow = {
    created_at: '',
    data: { description: '', task_groups: [] },
    description: '',
    id: '',
    name: '',
    updated_at: '',
  };
  if (designer) {
    const definition = designer.getDefinition();
    Object.assign(workflow, {
      data: {
        description: '',
        task_groups: workflowToolModel.convertDesignerSequenceToCicada(
          definition.sequence as Step[],
        ),
      },
      description: workflowDescription.value.value,
      id: '',
      name: workflowName.value.value,
    });
  }
  return workflow;
}

function postWorkflow(workflow: IWorkflow) {
  if (props.toolType === 'edit') {
    resUpdateWorkflow
      .execute({
        pathParams: {
          wfId: props.wftId,
        },
        request: {
          data: workflow.data,
          name: workflow.name,
        },
      })
      .then(res => {
        showSuccessMessage('Success', 'Success');
        emit('update:trigger');
      })
      .catch(err => {
        showErrorMessage('Error', err.errorMsg.value);
      });
  } else if (props.toolType === 'add') {
    resAddWorkFlow
      .execute({
        request: {
          data: workflow.data,
          name: workflow.name,
        },
      })
      .then(res => {
        showSuccessMessage('Success', 'Success');
        emit('update:trigger');
      })
      .catch(err => {
        showErrorMessage('Error', err.errorMsg.value);
      });
  }
}

function handleSaveCallback(designer: Designer | null) {
  trigger.value = false;
  try {
    const cicadaData = getCicadaData(designer);
    postWorkflow(cicadaData);
  } catch (e) {
    console.log(e);
  }
}

function handleCancel() {
  emit('update:close-modal', false);
  emit('update:trigger');
}

function handleSave() {
  trigger.value = true;
}

function handleSelectTemplate(e) {
  workflowToolModel.dropDownModel.selectedItemId = e;
  load();
}
</script>

<template>
  <div>
    <create-form
      class="page-modal-layout"
      title="Workflow Tool"
      :need-widget-layout="false"
      :loading="loading"
      @update:modal-state="handleCancel"
    >
      <template #add-content="{ loading }">
        <div v-if="!loading" class="workflow-tool-modal-page w-full">
          <header class="h-[54px] workflow-tool-header mb-[16px]">
            <PFieldGroup class="flex-1" :label="'Workflow Name'" required>
              <p-text-input
                v-model="workflowName.value.value"
                block
              ></p-text-input>
            </PFieldGroup>
            <PFieldGroup class="flex-1" :label="'Description'">
              <p-text-input
                v-model="workflowDescription.value.value"
                block
              ></p-text-input>
            </PFieldGroup>
            <PFieldGroup class="flex-1" :label="'Workflow Template'" required>
              <p-select-dropdown
                class="w-full"
                :menu="workflowToolModel.dropDownModel.data"
                :disabled="props.toolType !== 'add'"
                @select="handleSelectTemplate"
              ></p-select-dropdown>
            </PFieldGroup>
          </header>
          <section class="workflow-tool-body">
            <SequentialDesigner
              :sequence="sequentialSequence"
              :trigger="trigger.value"
              @getDesigner="handleSaveCallback"
            ></SequentialDesigner>
          </section>
        </div>
      </template>
      <template #buttons>
        <p-button
          style-type="tertiary"
          @click="emit('update:close-modal', false)"
        >
          Cancel
        </p-button>
        <p-button @click="handleSave">Save</p-button>
      </template>
    </create-form>
  </div>
</template>

<style scoped lang="postcss">
:deep(.workflow-tool-modal-page) {
  height: calc(100% - 7.4rem);
  max-height: calc(100% - 7.4rem);
}

.workflow-tool-header {
  @apply h-[54px] flex gap-[16px];
}

.workflow-tool-body {
  @apply h-[calc(100%-70px)];
}
</style>
