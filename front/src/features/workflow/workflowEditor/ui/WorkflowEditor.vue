<script setup lang="ts">
import { CreateForm } from '@/widgets/layout';
import {
  PButton,
  PFieldGroup,
  PSelectDropdown,
  PTextInput,
} from '@cloudforet-test/mirinae';
import { useWorkflowToolModel } from '@/features/workflow/workflowEditor/model/workflowEditorModel';
import { useInputModel } from '@/shared/hooks/input/useInputModel';
import { onBeforeMount, onMounted, reactive, ref, Ref } from 'vue';
import { Step } from '@/features/workflow/workflowEditor/model/types';
import {
  ITargetModelResponse,
  ITaskResponse,
  IWorkflow,
  useCreateWorkflow,
  useGetWorkflowTemplateList,
  useUpdateWorkflowV2,
} from '@/entities';
import { Designer } from 'sequential-workflow-designer';
import { showErrorMessage, showSuccessMessage } from '@/shared/utils';
import {
  getTaskComponentList,
  ITaskComponentInfoResponse,
} from '@/features/sequential/designer/toolbox/model/api';
import getRandomId from '@/shared/utils/uuid';
import { parseRequestBody } from '@/shared/utils/stringToObject';
import SequentialDesigner from '@/features/sequential/designer/ui/SequentialDesigner.vue';

interface IProps {
  wftId: string;
  toolType: 'edit' | 'viewer' | 'add';
  targetModel?: ITargetModelResponse;
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

console.log(props);

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
    if (props.targetModel) {
      mapTargetModelToTaskComponent(
        props.targetModel,
        workflowToolModel.taskComponentList,
      );
    }
  });
});
onMounted(() => {});

function load() {
  loading.value = true;
  loadWorkflow();
  loadSequence();
  reorderingSequence();
  loading.value = false;
}

/** targetModel에서 진입시 targetModel의 특정 정보를 가지고 있어야한다는 요구사항에 의한 함수 */
function mapTargetModelToTaskComponent(
  targetModel: ITargetModelResponse,
  taskComponentList: Array<ITaskComponentInfoResponse>,
) {
  const taskComponent = taskComponentList.find(
    taskComponent => taskComponent.name === 'beetle_task_infra_migration',
  );

  if (!taskComponent) {
    throw new Error('Task component not found');
  }

  const taskGroup = workflowToolModel
    .toolboxSteps()
    .defineTaskGroupStep(getRandomId(), 'TaskGroup', 'MCI', { model: {} });

  const parseString = parseRequestBody(taskComponent.data.options.request_body);
  if (parseString && parseString['vm']) {
    parseString['vm'] = Array(targetModel.cloudInfraModel.vm?.length)
      .fill(undefined)
      .map(_ => JSON.parse(JSON.stringify(parseString['vm'][0])));
  }

  if (targetModel.cloudInfraModel.vm) {
    targetModel.cloudInfraModel.vm.forEach((targetVm, index) => {
      parseString['vm'][index]['commonSpec'] = targetVm.commonSpec;
      parseString['vm'][index]['commonImage'] = targetVm.commonImage;
    });
  }

  const task: ITaskResponse = {
    dependencies: [],
    name: 'beetle_task_infra_migration',
    path_params: null,
    query_params: null,
    request_body: JSON.stringify(parseString),
    id: '',
    task_component: 'beetle_task_infra_migration',
  };

  const step = workflowToolModel.convertToDesignerTask(task, task.request_body);
  taskGroup.sequence?.push(step);
  sequentialSequence.value = [taskGroup];
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
    try {
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
    } catch (e: string) {
      showErrorMessage('Error', e);
    }
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
  // emit('update:trigger');
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
              :taskComponentList="resTaskComponentList.data.value?.responseData"
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
        <p-button
          :loading="resUpdateWorkflow.isLoading.value"
          @click="handleSave"
          >Save
        </p-button>
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
