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
import { onBeforeMount, onMounted, reactive, ref, Ref } from 'vue';
import { Step } from '@/features/workflow/workflowEditor/model/types.ts';
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
import { DEFAULT_NAMESPACE } from '@/shared/constants/namespace';

interface IProps {
  wftId: string;
  toolType: 'edit' | 'viewer' | 'add';
  targetModel?: ITargetModelResponse;
  migrationType?: 'infra' | 'software';
  recommendedModel?: any;
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
    
    if (props.targetModel) {
      console.log('TargetModel received:', props.targetModel);
      console.log('TargetModel type check:', {
        hasCloudInfraModel: !!props.targetModel.cloudInfraModel,
        cloudInfraModel: props.targetModel.cloudInfraModel,
        isCloudModel: props.targetModel.isCloudModel,
        csp: props.targetModel.csp,
        region: props.targetModel.region,
        zone: props.targetModel.zone
      });
      
      // Determine if this is infra or software model based on migrationType
      // Note: migrationType should be passed from the parent component
      // For now, fallback to the existing logic if migrationType is not available
      let isInfraModel = false;
      let isSoftwareModel = false;
      
      // Check if migrationType is available (this should be passed from parent)
      if (props.targetModel.migrationType) {
        isInfraModel = props.targetModel.migrationType === 'infra';
        isSoftwareModel = props.targetModel.migrationType === 'software';
        console.log('Using migrationType for classification:', {
          migrationType: props.targetModel.migrationType,
          isInfraModel,
          isSoftwareModel
        });
      } else {
        // Fallback to existing logic based on cloudInfraModel
        isInfraModel = !!props.targetModel.cloudInfraModel && props.targetModel.isCloudModel;
        isSoftwareModel = !props.targetModel.cloudInfraModel && props.targetModel.isCloudModel;
        console.log('Using fallback logic (cloudInfraModel) for classification:', {
          isInfraModel,
          isSoftwareModel
        });
      }
      
      console.log('Final model classification:', {
        isInfraModel,
        isSoftwareModel
      });
      
      if (isInfraModel) {
        // Select migrate_infra_workflow template
        const infraTemplate = workflowToolModel.workflowStore.workflowTemplates.find(
          template => template.name === 'migrate_infra_workflow'
        );
        if (infraTemplate) {
          workflowToolModel.dropDownModel.selectedItemId = infraTemplate.id;
          console.log('Selected infra workflow template:', infraTemplate);
        } else {
          console.warn('migrate_infra_workflow template not found');
        }
      } else if (isSoftwareModel) {
        // Select migrate_software_workflow template
        const softwareTemplate = workflowToolModel.workflowStore.workflowTemplates.find(
          template => template.name === 'migrate_software_workflow'
        );
        if (softwareTemplate) {
          workflowToolModel.dropDownModel.selectedItemId = softwareTemplate.id;
          console.log('Selected software workflow template:', softwareTemplate);
        } else {
          console.warn('migrate_software_workflow template not found');
        }
      }
      
      // Load workflow after template selection
      load();
      
      mapTargetModelToTaskComponent(
        props.targetModel,
        workflowToolModel.taskComponentList,
      );
    } else if (props.toolType === 'add') {
      // For add mode, use recommendedModel from props
      console.log('Add mode detected, using recommendedModel from props...');
      
      // Determine migrationType from props or default to 'infra'
      const migrationType = props.migrationType || 'infra';
      
      // Select appropriate workflow template based on migrationType
      if (migrationType === 'infra') {
        const infraTemplate = workflowToolModel.workflowStore.workflowTemplates.find(
          template => template.name === 'migrate_infra_workflow'
        );
        if (infraTemplate) {
          workflowToolModel.dropDownModel.selectedItemId = infraTemplate.id;
          console.log('Selected infra workflow template:', infraTemplate);
        }
      } else if (migrationType === 'software') {
        const softwareTemplate = workflowToolModel.workflowStore.workflowTemplates.find(
          template => template.name === 'migrate_software_workflow'
        );
        if (softwareTemplate) {
          workflowToolModel.dropDownModel.selectedItemId = softwareTemplate.id;
          console.log('Selected software workflow template:', softwareTemplate);
        }
      }
      
      if (props.recommendedModel) {
        console.log('RecommendedModel received:', props.recommendedModel);
        
        // Add migrationType to the recommended model
        const modelWithMigrationType = {
          ...props.recommendedModel,
          migrationType: migrationType
        };
        
        console.log('Using recommended model with migrationType:', {
          recommendedModel: modelWithMigrationType,
          migrationType
        });
        
        // Create task based on migrationType
        createTaskForModel(modelWithMigrationType, workflowToolModel.taskComponentList);
      } else {
        console.warn('No recommendedModel provided for add mode');
      }
      
      // Load workflow after template selection
      load();
    } else {
      // No targetModel, load default
      load();
    }
  });
});
onMounted(() => {});

function load() {
  loading.value = true;
  
  // Only load workflow if no targetModel or if targetModel template selection is already done
  if (!props.targetModel || workflowToolModel.dropDownModel.selectedItemId) {
    loadWorkflow();
    loadSequence();
    reorderingSequence();
  }
  
  loading.value = false;
}

/** targetModel에서 진입시 targetModel의 특정 정보를 가지고 있어야한다는 요구사항에 의한 함수 */
function mapTargetModelToTaskComponent(
  targetModel: ITargetModelResponse,
  taskComponentList: Array<ITaskComponentInfoResponse>,
) {
  // Determine if this is infra or software model based on migrationType
  let isInfraModel = false;
  let isSoftwareModel = false;
  
  // Check if migrationType is available
  if (targetModel.migrationType) {
    isInfraModel = targetModel.migrationType === 'infra';
    isSoftwareModel = targetModel.migrationType === 'software';
    console.log('mapTargetModelToTaskComponent - Using migrationType:', {
      migrationType: targetModel.migrationType,
      isInfraModel,
      isSoftwareModel
    });
  } else {
    // Fallback to existing logic based on cloudInfraModel
    isInfraModel = !!targetModel.cloudInfraModel && targetModel.isCloudModel;
    isSoftwareModel = !targetModel.cloudInfraModel && targetModel.isCloudModel;
    console.log('mapTargetModelToTaskComponent - Using fallback logic:', {
      isInfraModel,
      isSoftwareModel
    });
  }
  
  console.log('mapTargetModelToTaskComponent - Final model type:', {
    isInfraModel,
    isSoftwareModel,
    targetModel
  });
  
  let taskComponentName = '';
  let taskComponent: ITaskComponentInfoResponse | undefined = undefined;
  
  if (isInfraModel) {
    // Use infra migration task for infra models
    taskComponentName = 'beetle_task_infra_migration';
    taskComponent = taskComponentList.find(
      taskComponent => taskComponent.name === taskComponentName,
    );
    console.log('Using infra migration task component:', taskComponent);
  } else if (isSoftwareModel) {
    // Use software migration task for software models
    taskComponentName = 'grasshopper_task_software_migration';
    taskComponent = taskComponentList.find(
      taskComponent => taskComponent.name === taskComponentName,
    );
    console.log('Using software migration task component:', taskComponent);
  } else {
    console.warn('Unknown model type, using default infra migration task');
    taskComponentName = 'beetle_task_infra_migration';
    taskComponent = taskComponentList.find(
      taskComponent => taskComponent.name === taskComponentName,
    );
  }

  if (!taskComponent) {
    console.error(`Task component '${taskComponentName}' not found`);
    throw new Error(`Task component '${taskComponentName}' not found`);
  }

  const taskGroup = workflowToolModel
    .toolboxSteps()
    .defineTaskGroupStep(getRandomId(), 'TaskGroup', 'MCI', { model: {} });

  const parseString = parseRequestBody(taskComponent.data.options.request_body);
  
  if (isInfraModel && targetModel?.cloudInfraModel?.targetVmInfra) {
    // Handle infra model data - use targetVmInfra from cloudInfraModel
    console.log('Processing infra model with targetVmInfra:', targetModel.cloudInfraModel.targetVmInfra);
    
    if (parseString) {
      // Set the targetVmInfra data directly
      parseString['targetVmInfra'] = targetModel.cloudInfraModel.targetVmInfra;
      
      // Also set other related infra data if available
      if (targetModel.cloudInfraModel.targetSecurityGroupList) {
        parseString['targetSecurityGroupList'] = targetModel.cloudInfraModel.targetSecurityGroupList;
      }
      if (targetModel.cloudInfraModel.targetSshKey) {
        parseString['targetSshKey'] = targetModel.cloudInfraModel.targetSshKey;
      }
      if (targetModel.cloudInfraModel.targetVNet) {
        parseString['targetVNet'] = targetModel.cloudInfraModel.targetVNet;
      }
      if (targetModel.cloudInfraModel.targetVmOsImageList) {
        parseString['targetVmOsImageList'] = targetModel.cloudInfraModel.targetVmOsImageList;
      }
      if (targetModel.cloudInfraModel.targetVmSpecList) {
        parseString['targetVmSpecList'] = targetModel.cloudInfraModel.targetVmSpecList;
      }
    }
    console.log('Processed infra model data:', parseString);
  } else if (isSoftwareModel && (targetModel as any)?.targetSoftwareModel) {
    // Handle software model data - use targetSoftwareModel
    const targetSoftwareModel = (targetModel as any).targetSoftwareModel;
    console.log('Processing software model with targetSoftwareModel:', targetSoftwareModel);
    
    if (parseString) {
      // Set the targetSoftwareModel data directly
      parseString['targetSoftwareModel'] = targetSoftwareModel;
      
      // Also set other related software data if available
      if (targetSoftwareModel.softwareList) {
        parseString['softwareList'] = targetSoftwareModel.softwareList;
      }
      if (targetSoftwareModel.targetVmSpecList) {
        parseString['targetVmSpecList'] = targetSoftwareModel.targetVmSpecList;
      }
      if (targetSoftwareModel.targetVmOsImageList) {
        parseString['targetVmOsImageList'] = targetSoftwareModel.targetVmOsImageList;
      }
      if (targetSoftwareModel.targetSecurityGroupList) {
        parseString['targetSecurityGroupList'] = targetSoftwareModel.targetSecurityGroupList;
      }
      if (targetSoftwareModel.targetSshKey) {
        parseString['targetSshKey'] = targetSoftwareModel.targetSshKey;
      }
      if (targetSoftwareModel.targetVNet) {
        parseString['targetVNet'] = targetSoftwareModel.targetVNet;
      }
      
      // Set basic model information
      parseString['softwareModel'] = {
        id: targetModel.id,
        name: targetModel.userModelName,
        description: targetModel.description,
        csp: targetModel.csp,
        region: targetModel.region,
        zone: targetModel.zone
      };
    }
    console.log('Processed software model data:', parseString);
  }

  const task: ITaskResponse = {
    dependencies: [],
    name: taskComponentName,
    path_params: null,
    query_params: null,
    request_body: JSON.stringify(parseString),
    id: '',
    task_component: taskComponentName,
  };

  const step = workflowToolModel.convertToDesignerTask(task, task.request_body);
  taskGroup.sequence?.push(step);
  sequentialSequence.value = [taskGroup];
  
  console.log('Created workflow sequence with task:', {
    taskGroup,
    step,
    sequence: sequentialSequence.value
  });
}

/** Add 모드에서 GetModels API 결과를 사용하여 task를 생성하는 함수 */
function createTaskForModel(
  targetModel: ITargetModelResponse,
  taskComponentList: Array<ITaskComponentInfoResponse>,
) {
  // Determine if this is infra or software model based on migrationType
  let isInfraModel = false;
  let isSoftwareModel = false;
  
  // Check if migrationType is available
  if (targetModel.migrationType) {
    isInfraModel = targetModel.migrationType === 'infra';
    isSoftwareModel = targetModel.migrationType === 'software';
    console.log('createTaskForModel - Using migrationType:', {
      migrationType: targetModel.migrationType,
      isInfraModel,
      isSoftwareModel
    });
  } else {
    // Fallback to existing logic based on cloudInfraModel
    isInfraModel = !!targetModel.cloudInfraModel && targetModel.isCloudModel;
    isSoftwareModel = !targetModel.cloudInfraModel && targetModel.isCloudModel;
    console.log('createTaskForModel - Using fallback logic:', {
      isInfraModel,
      isSoftwareModel
    });
  }
  
  console.log('createTaskForModel - Final model type:', {
    isInfraModel,
    isSoftwareModel,
    targetModel
  });
  
  let taskComponentName = '';
  let taskComponent: ITaskComponentInfoResponse | undefined = undefined;
  
  if (isInfraModel) {
    // Use infra migration task for infra models
    taskComponentName = 'beetle_task_infra_migration';
    taskComponent = taskComponentList.find(
      taskComponent => taskComponent.name === taskComponentName,
    );
    console.log('Using infra migration task component:', taskComponent);
  } else if (isSoftwareModel) {
    // Use software migration task for software models
    taskComponentName = 'grasshopper_task_software_migration';
    taskComponent = taskComponentList.find(
      taskComponent => taskComponent.name === taskComponentName,
    );
    console.log('Using software migration task component:', taskComponent);
  } else {
    console.warn('Unknown model type, using default infra migration task');
    taskComponentName = 'beetle_task_infra_migration';
    taskComponent = taskComponentList.find(
      taskComponent => taskComponent.name === taskComponentName,
    );
  }

  if (!taskComponent) {
    console.error(`Task component '${taskComponentName}' not found`);
    throw new Error(`Task component '${taskComponentName}' not found`);
  }

  const taskGroup = workflowToolModel
    .toolboxSteps()
    .defineTaskGroupStep(getRandomId(), 'TaskGroup', 'MCI', { model: {} });

  const parseString = parseRequestBody(taskComponent.data.options.request_body);
  
  if (isInfraModel && targetModel?.cloudInfraModel?.targetVmInfra) {
    // Handle infra model data - use targetVmInfra from cloudInfraModel
    console.log('Processing infra model with targetVmInfra:', targetModel.cloudInfraModel.targetVmInfra);
    
    if (parseString) {
      // Set the targetVmInfra data directly
      parseString['targetVmInfra'] = targetModel.cloudInfraModel.targetVmInfra;
      
      // Also set other related infra data if available
      if (targetModel.cloudInfraModel.targetSecurityGroupList) {
        parseString['targetSecurityGroupList'] = targetModel.cloudInfraModel.targetSecurityGroupList;
      }
      if (targetModel.cloudInfraModel.targetSshKey) {
        parseString['targetSshKey'] = targetModel.cloudInfraModel.targetSshKey;
      }
      if (targetModel.cloudInfraModel.targetVNet) {
        parseString['targetVNet'] = targetModel.cloudInfraModel.targetVNet;
      }
      if (targetModel.cloudInfraModel.targetVmOsImageList) {
        parseString['targetVmOsImageList'] = targetModel.cloudInfraModel.targetVmOsImageList;
      }
      if (targetModel.cloudInfraModel.targetVmSpecList) {
        parseString['targetVmSpecList'] = targetModel.cloudInfraModel.targetVmSpecList;
      }
    }
    console.log('Processed infra model data:', parseString);
  } else if (isSoftwareModel && (targetModel as any)?.targetSoftwareModel) {
    // Handle software model data - use targetSoftwareModel
    const targetSoftwareModel = (targetModel as any).targetSoftwareModel;
    console.log('Processing software model with targetSoftwareModel:', targetSoftwareModel);
    
    if (parseString) {
      // Set the targetSoftwareModel data directly
      parseString['targetSoftwareModel'] = targetSoftwareModel;
      
      // Also set other related software data if available
      if (targetSoftwareModel.softwareList) {
        parseString['softwareList'] = targetSoftwareModel.softwareList;
      }
      if (targetSoftwareModel.targetVmSpecList) {
        parseString['targetVmSpecList'] = targetSoftwareModel.targetVmSpecList;
      }
      if (targetSoftwareModel.targetVmOsImageList) {
        parseString['targetVmOsImageList'] = targetSoftwareModel.targetVmOsImageList;
      }
      if (targetSoftwareModel.targetSecurityGroupList) {
        parseString['targetSecurityGroupList'] = targetSoftwareModel.targetSecurityGroupList;
      }
      if (targetSoftwareModel.targetSshKey) {
        parseString['targetSshKey'] = targetSoftwareModel.targetSshKey;
      }
      if (targetSoftwareModel.targetVNet) {
        parseString['targetVNet'] = targetSoftwareModel.targetVNet;
      }
      
      // Set basic model information
      parseString['softwareModel'] = {
        id: targetModel.id,
        name: targetModel.userModelName,
        description: targetModel.description,
        csp: targetModel.csp,
        region: targetModel.region,
        zone: targetModel.zone
      };
    }
    console.log('Processed software model data:', parseString);
  }

  const task: ITaskResponse = {
    dependencies: [],
    name: taskComponentName,
    path_params: null,
    query_params: null,
    request_body: JSON.stringify(parseString),
    id: '',
    task_component: taskComponentName,
  };

  const step = workflowToolModel.convertToDesignerTask(task, task.request_body);
  taskGroup.sequence?.push(step);
  sequentialSequence.value = [taskGroup];
  
  console.log('Created workflow sequence with task:', {
    taskGroup,
    step,
    sequence: sequentialSequence.value
  });
}

function loadWorkflow() {
  if (props.toolType === 'edit') {
    workflowData.value = workflowToolModel.getWorkflowData(props.wftId);
  } else if (props.toolType === 'add') {
    workflowData.value = workflowToolModel.getWorkflowTemplateData(
      workflowToolModel.dropDownModel.selectedItemId,
    );
  }

  // Set workflow name and description
  if (props.toolType === 'add') {
    // For add mode, set default name based on migrationType
    const defaultName = props.migrationType === 'infra' 
      ? 'Infra Migration Workflow' 
      : 'Software Migration Workflow';
    workflowName.value.value = workflowData.value?.name || defaultName;
  } else {
    workflowName.value.value = workflowData.value?.name || '';
  }
  
  workflowDescription.value.value = workflowData.value?.description || '';
  
  console.log('loadWorkflow - Set workflow name:', {
    toolType: props.toolType,
    migrationType: props.migrationType,
    workflowName: workflowName.value.value,
    workflowDataName: workflowData.value?.name
  });
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
    } catch (e: any) {
      showErrorMessage('Error', e);
    }
  }
  return workflow;
}

function postWorkflow(workflow: IWorkflow) {
  console.log('postWorkflow - workflow data:', {
    toolType: props.toolType,
    workflowName: workflow.name,
    workflowData: workflow.data,
    workflowDescription: workflow.description
  });
  
  if (props.toolType === 'edit') {
    resUpdateWorkflow
      .execute({
        pathParams: {
          wfId: props.wftId,
        },
        request: {
          data: workflow.data,
          name: workflow.name,
          spec_version: '1.0', // Add spec_version
          nsId: DEFAULT_NAMESPACE, // Add namespace ID
        } as any, // Type assertion for additional parameters
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
          spec_version: '1.0', // Add spec_version
          nsId: DEFAULT_NAMESPACE, // Add namespace ID
        } as any, // Type assertion for additional parameters
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
