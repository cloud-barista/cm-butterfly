<script setup lang="ts">
import { CreateForm } from '@/widgets/layout';
import {
  PButton,
  PFieldGroup,
  PSelectDropdown,
  PSpinner,
  PTextInput,
} from '@cloudforet-test/mirinae';
import { useWorkflowToolModel } from '@/features/workflow/workflowEditor/model/workflowEditorModel';
import { useInputModel } from '@/shared/hooks/input/useInputModel';
import { onBeforeMount, onMounted, reactive, ref, Ref, watch } from 'vue';
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
import { DOC_LINKS, openDocLink } from '@/shared/constants/docLinks';
import {
  showErrorMessage,
  showInfoMessage,
  showSuccessMessage,
  toErrorMessage,
} from '@/shared/utils';
import {
  getTaskComponentList,
  ITaskComponentInfoResponse,
} from '@/features/sequential/designer/toolbox/model/api';
import getRandomId from '@/shared/utils/uuid';
import { parseRequestBody } from '@/shared/utils/stringToObject';
import {
  mapModelToTaskBody,
  unwrapModel,
} from '@/features/workflow/workflowEditor/lib/mapModelToTaskBody';
import SequentialDesigner from '@/features/sequential/designer/ui/SequentialDesigner.vue';
import { DEFAULT_NAMESPACE } from '@/shared/constants/namespace';
import { normalizeTaskComponentList } from '@/entities/workflow/lib/schemaAdapter';
import { hasWorkflowRunHistory } from '@/entities/workflow/lib/workflowRunHistory';
import { useTaskSchemaLoader } from '@/features/sequential/designer/editor/composables/useTaskSchemaLoader';

interface IProps {
  wftId: string;
  toolType: 'edit' | 'viewer' | 'add';
  targetModel?: ITargetModelResponse;
  migrationType?: 'infra' | 'software';
  recommendedModel?: any;
}

const props = defineProps<IProps>();
const emit = defineEmits([
  'update:close-modal',
  'update:trigger',
  'update:saved',
]);

const workflowToolModel = useWorkflowToolModel();
const workflowName = useInputModel<string>('');
const workflowDescription = useInputModel<string>('');
const workflowData = ref<IWorkflow>();
const sequentialSequence: Ref<Step[]> = ref<Step[]>([]);

// Task schema loader
const { loadTaskSchemasFromResponse, loadAllTaskSchemas, isSchemaLoaded } =
  useTaskSchemaLoader();

const resWorkflowTemplateData = useGetWorkflowTemplateList();
const resTaskComponentList = getTaskComponentList();
const resUpdateWorkflow = useUpdateWorkflowV2(null, null, null);
const resAddWorkFlow = useCreateWorkflow(null);
const loading = ref<boolean>(true);

const trigger = reactive({ value: false });
/**
 * On when the editor cannot draw this workflow's execution graph as-is.
 * In that case, instead of showing a blank screen, it records the reason and blocks saving —
 * because saving something it could not draw would change the execution order.
 */
const isUneditable = ref(false);
const loadWarnings = ref<string[]>([]);

/**
 * On when this workflow has been run before and therefore cannot be edited.
 *
 * The normal path never reaches here — the detail screen and the run viewer look at the run
 * history and send it to the run state. This is a **safety net that stays intact even if some
 * other entry path is added later**, and when it does open, it shows the workflow but prevents edits.
 */
const isRunLocked = ref(false);

/**
 * State where the workflow has not been read yet.
 *
 * A freshly created workflow has a brief window where the engine cannot read it from Airflow
 * (about 5s measured on the dev server, `get-workflow` returns 400). During that window the query
 * comes back empty, and **left as-is a blank canvas appears silently** — it looks like a workflow
 * with no tasks, and saving in that state wipes the content.
 *
 * So we wait until it can be read before drawing, and note on screen what we are waiting for.
 * (The path that comes to the editor right after cloning draws immediately because the clone
 * response is already in the cache.)
 */
const workflowLoadState = ref<'ok' | 'waiting' | 'failed'>('ok');

const WORKFLOW_READY_INTERVAL_MS = 2000;
const WORKFLOW_READY_TIMEOUT_MS = 60000;

async function fetchWorkflowForEdit() {
  const deadline = Date.now() + WORKFLOW_READY_TIMEOUT_MS;
  for (;;) {
    const found = await workflowToolModel.workflowStore.ensureWorkflowById(
      props.wftId,
    );
    if (found) return found;
    if (Date.now() + WORKFLOW_READY_INTERVAL_MS > deadline) return undefined;
    workflowLoadState.value = 'waiting';
    await new Promise(resolve =>
      setTimeout(resolve, WORKFLOW_READY_INTERVAL_MS),
    );
  }
}

console.log(props);

onBeforeMount(function () {
  Promise.all<any>([
    resWorkflowTemplateData.execute(),
    resTaskComponentList.execute(),
  ]).then(res => {
    // Normalize the cm-cicada Type/Spec response into the legacy shape the designer consumes (in place).
    // Palette/canvas/template loading all reference this array, so convert it once here.
    normalizeTaskComponentList(res[1].data.responseData);

    workflowToolModel.workflowStore.setWorkflowTemplates(
      res[0].data.responseData,
    );

    // cicada_task_run_script is now included in API response
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
        zone: props.targetModel.zone,
      });

      // ── Target model flow: load the template, but fill the migration task body with the target
      // model's literal value and put the selected target model id into the preceding lookup task (P0) ──
      //
      // The cm-cicada v0.5.1 migration template splits into two migration tasks:
      //   ① damselfly lookup task (looks up the target model at run time via path_params.id)
      //   ② migration task (beetle/grasshopper) — whose body is a "①.result" reference.
      // The console already holds a completed target model, and the user needs to edit values in the
      // right-hand table, so we fill ②'s body directly with the target model's literal value rather
      // than a reference (the engine's literal mode sends it straight to the target API —
      // docs/task-response-passing.md). We put the selected target model id into ① so it succeeds as-is
      // (since ② is literal, ①'s result is not used, but the template structure requires ① to succeed
      // for the run to complete). The actual injection happens at the end of loadSequence() right after
      // the sequence is built.
      //
      // Previously this built a 'single literal task' via mapTargetModelToTaskComponent() while at the
      // same time async-loading the template via load(), so load() later overwrote that single task (a race).
      // The result was a saved multi-task template with the reference body intact, which the console
      // collapsed to {}/a skeleton.
      const migrationType =
        props.targetModel.migrationType ||
        (props.targetModel.cloudInfraModel ? 'infra' : 'software');
      const templateName =
        migrationType === 'software'
          ? 'migrate_software_workflow'
          : 'migrate_infra_workflow';
      const migrationTemplate =
        workflowToolModel.workflowStore.workflowTemplates.find(
          template => template.name === templateName,
        );
      if (migrationTemplate) {
        workflowToolModel.dropDownModel.selectedItemId = migrationTemplate.id;
      } else {
        console.warn(`${templateName} template not found`);
      }
      // Load template → build sequence → (at the end of loadSequence) inject the target model.
      load();
    } else if (props.toolType === 'add') {
      // For add mode, use recommendedModel from props
      console.log('Add mode detected, using recommendedModel from props...');

      // Determine migrationType from props or default to 'infra'
      const migrationType = props.migrationType || 'infra';

      // Select appropriate workflow template based on migrationType
      if (migrationType === 'infra') {
        const infraTemplate =
          workflowToolModel.workflowStore.workflowTemplates.find(
            template => template.name === 'migrate_infra_workflow',
          );
        if (infraTemplate) {
          workflowToolModel.dropDownModel.selectedItemId = infraTemplate.id;
          console.log('Selected infra workflow template:', infraTemplate);
        }
      } else if (migrationType === 'software') {
        const softwareTemplate =
          workflowToolModel.workflowStore.workflowTemplates.find(
            template => template.name === 'migrate_software_workflow',
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
          migrationType: migrationType,
        };

        console.log('Using recommended model with migrationType:', {
          recommendedModel: modelWithMigrationType,
          migrationType,
        });

        // Create task based on migrationType
        createTaskForModel(
          modelWithMigrationType,
          workflowToolModel.taskComponentList,
        );
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
// Load task schemas after resTaskComponentList has loaded
watch(
  () => resTaskComponentList.data,
  async newData => {
    if (!isSchemaLoaded.value && newData) {
      try {
        console.log('Loading task schemas from resTaskComponentList data...');
        console.log('resTaskComponentList.data:', newData);

        // Check the API response structure
        if ((newData as any).responseData) {
          console.log('Using resTaskComponentList.data.responseData');
          loadTaskSchemasFromResponse(newData as any);
        } else if ((newData as any).value?.responseData) {
          console.log('Using resTaskComponentList.data.value.responseData');
          loadTaskSchemasFromResponse((newData as any).value);
        } else {
          console.log('Unexpected data structure, calling API...');
          await loadAllTaskSchemas();
        }

        console.log('Task schemas loaded successfully in WorkflowEditor');
      } catch (error) {
        console.error('Failed to load task schemas in WorkflowEditor:', error);
      }
    }
  },
  { immediate: true },
);

onMounted(async () => {
  // If the task schema has not been loaded yet, call the API
  if (!isSchemaLoaded.value) {
    try {
      console.log('No existing data, calling API...');
      await loadAllTaskSchemas();
      console.log('Task schemas loaded successfully in WorkflowEditor');
    } catch (error) {
      console.error('Failed to load task schemas in WorkflowEditor:', error);
    }
  }
});

async function load() {
  loading.value = true;

  // Only load workflow if no targetModel or if targetModel template selection is already done
  if (!props.targetModel || workflowToolModel.dropDownModel.selectedItemId) {
    await loadWorkflow();
    loadSequence();
  }

  loading.value = false;
}

/** Function driven by the requirement that entering from a targetModel must carry specific targetModel information */
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
      isSoftwareModel,
    });
  } else {
    // Fallback to existing logic based on cloudInfraModel
    isInfraModel = !!targetModel.cloudInfraModel && targetModel.isCloudModel;
    isSoftwareModel = !targetModel.cloudInfraModel && targetModel.isCloudModel;
    console.log('mapTargetModelToTaskComponent - Using fallback logic:', {
      isInfraModel,
      isSoftwareModel,
    });
  }

  console.log('mapTargetModelToTaskComponent - Final model type:', {
    isInfraModel,
    isSoftwareModel,
    targetModel,
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

  // ── Filling the body: matched by path, not by name ─────────────────────
  //
  // The body's shape comes from the other system's swagger; the model holds the values. Both use
  // the same names for the same things, so the body is filled by looking up **the same path** in
  // the model — not by matching leaf names, which collide (see mapModelToTaskBody).
  //
  // What this replaces is below, kept as a comment on purpose: it named every key in code, and a
  // field the other side added was simply never carried — with nothing said about it.
  const unwrapped = unwrapModel(targetModel);
  const mapped = mapModelToTaskBody(
    taskComponent?.data?.body_params,
    unwrapped,
    parseString ?? {},
  );
  Object.assign(parseString, mapped.body);

  // Software migration also names the model itself in the body; it is not part of the recommended
  // infra shape, so it is set here rather than being looked up.
  if (isSoftwareModel) {
    parseString['softwareModel'] = {
      id: targetModel.id,
      name: targetModel.userModelName,
      description: targetModel.description,
      csp: targetModel.csp,
      region: targetModel.region,
      zone: targetModel.zone,
    };
  }

  // **Say what could not be carried.** A body that asks for something the model has nothing for is
  // the failure this whole change exists to surface — before, it left no trace at all.
  if (mapped.missingRequired.length > 0) {
    showErrorMessage(
      'Some required values could not be filled',
      `The workflow asks for ${mapped.missingRequired.join(', ')}, and the selected target model has no value for them. Check the task before running it.`,
    );
  }
  console.log('[task body] filled:', mapped.filled);
  console.log('[task body] not filled:', mapped.missing);
  if (mapped.mismatched.length > 0) {
    console.warn('[task body] shape did not agree:', mapped.mismatched);
  }

  // ── What this replaced, kept so the change is legible: every key named in code ──
  // if (isInfraModel && targetModel?.cloudInfraModel?.targetInfra) {
  //   // Handle infra model data - use targetInfra from cloudInfraModel
  //   console.log(
  //     'Processing infra model with targetInfra:',
  //     targetModel.cloudInfraModel.targetInfra,
  //   );
  //
  //   if (parseString) {
  //     // Set the targetInfra data directly
  //     parseString['targetInfra'] = targetModel.cloudInfraModel.targetInfra;
  //
  //     // Also set other related infra data if available
  //     if (targetModel.cloudInfraModel.targetSecurityGroupList) {
  //       parseString['targetSecurityGroupList'] =
  //         targetModel.cloudInfraModel.targetSecurityGroupList;
  //     }
  //     if (targetModel.cloudInfraModel.targetSshKey) {
  //       parseString['targetSshKey'] = targetModel.cloudInfraModel.targetSshKey;
  //     }
  //     if (targetModel.cloudInfraModel.targetVNet) {
  //       parseString['targetVNet'] = targetModel.cloudInfraModel.targetVNet;
  //     }
  //     if (targetModel.cloudInfraModel.targetOsImageList) {
  //       parseString['targetOsImageList'] =
  //         targetModel.cloudInfraModel.targetOsImageList;
  //     }
  //     if (targetModel.cloudInfraModel.targetSpecList) {
  //       parseString['targetSpecList'] =
  //         targetModel.cloudInfraModel.targetSpecList;
  //     }
  //   }
  //   console.log('Processed infra model data:', parseString);
  // } else if (isSoftwareModel && (targetModel as any)?.targetSoftwareModel) {
  //   // Handle software model data - use targetSoftwareModel
  //   const targetSoftwareModel = (targetModel as any).targetSoftwareModel;
  //   console.log(
  //     'Processing software model with targetSoftwareModel:',
  //     targetSoftwareModel,
  //   );
  //
  //   if (parseString) {
  //     // Set the targetSoftwareModel data directly
  //     parseString['targetSoftwareModel'] = targetSoftwareModel;
  //
  //     // Also set other related software data if available
  //     if (targetSoftwareModel.softwareList) {
  //       parseString['softwareList'] = targetSoftwareModel.softwareList;
  //     }
  //     if (targetSoftwareModel.targetSpecList) {
  //       parseString['targetSpecList'] = targetSoftwareModel.targetSpecList;
  //     }
  //     if (targetSoftwareModel.targetOsImageList) {
  //       parseString['targetOsImageList'] =
  //         targetSoftwareModel.targetOsImageList;
  //     }
  //     if (targetSoftwareModel.targetSecurityGroupList) {
  //       parseString['targetSecurityGroupList'] =
  //         targetSoftwareModel.targetSecurityGroupList;
  //     }
  //     if (targetSoftwareModel.targetSshKey) {
  //       parseString['targetSshKey'] = targetSoftwareModel.targetSshKey;
  //     }
  //     if (targetSoftwareModel.targetVNet) {
  //       parseString['targetVNet'] = targetSoftwareModel.targetVNet;
  //     }
  //
  //     // Set basic model information
  //     parseString['softwareModel'] = {
  //       id: targetModel.id,
  //       name: targetModel.userModelName,
  //       description: targetModel.description,
  //       csp: targetModel.csp,
  //       region: targetModel.region,
  //       zone: targetModel.zone,
  //     };
  //   }
  //   console.log('Processed software model data:', parseString);
  // }

  // Set path_params and query_params from task component with nsId default value.
  // ★ A schema property's description is *explanatory text (a placeholder)*, not a value. Leave the
  //   value empty so the auto-generated task uses the backend default (for optional params) or the
  //   user fills it in. (Previously the description was put in as the value, e.g. cm-beetle migration
  //   ending up with nameSeed=<explanatory text>, which caused a 400.)
  const pathParamsKeyValue = taskComponent?.data.path_params?.properties
    ? Object.entries(taskComponent.data.path_params.properties).reduce(
        (acc, [key]) => {
          acc[key] = '';
          return acc;
        },
        {} as Record<string, string>,
      )
    : {};

  const queryParamsKeyValue = taskComponent?.data.query_params?.properties
    ? Object.entries(taskComponent.data.query_params.properties).reduce(
        (acc, [key]) => {
          acc[key] = '';
          return acc;
        },
        {} as Record<string, string>,
      )
    : {};

  // Set nsId to DEFAULT_NAMESPACE if it exists in path_params or query_params
  let pathParams =
    Object.keys(pathParamsKeyValue).length > 0 ? pathParamsKeyValue : null;
  let queryParams =
    Object.keys(queryParamsKeyValue).length > 0 ? queryParamsKeyValue : null;

  if (pathParams && 'nsId' in pathParams) {
    pathParams = { ...pathParams, nsId: DEFAULT_NAMESPACE };
  }
  if (queryParams && 'nsId' in queryParams) {
    queryParams = { ...queryParams, nsId: DEFAULT_NAMESPACE };
  }

  const task: ITaskResponse = {
    dependencies: [],
    name: taskComponentName,
    path_params: pathParams,
    query_params: queryParams,
    request_body: JSON.stringify(parseString),
    id: '',
    task_component: taskComponentName,
  };

  const step = workflowToolModel.convertToDesignerTask(task, task.request_body);

  // ❌ CRITICAL FIX: Do NOT overwrite step.properties.model with schema!
  // step.properties.model should contain actual DATA (from parseString), not SCHEMA
  // TaskComponentEditor will get schema from step.properties.taskComponentData (set in editorProviders)
  //
  // Previously this was causing schema to be saved in request_body instead of actual data:
  // if (taskComponent.data.body_params && Object.keys(taskComponent.data.body_params).length > 0) {
  //   step.properties.model = taskComponent.data.body_params;  // ❌ This overwrites DATA with SCHEMA!
  // }

  console.log('✅ step.properties.model contains actual data (not schema):', {
    modelKeys: Object.keys(step.properties.model || {}),
    modelSample: JSON.stringify(step.properties.model).substring(0, 200),
  });

  taskGroup.sequence?.push(step);
  sequentialSequence.value = [taskGroup];

  console.log('Created workflow sequence with task:', {
    taskGroup,
    step,
    sequence: sequentialSequence.value,
  });
}

/** Function that creates a task using the GetModels API result in Add mode */
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
      isSoftwareModel,
    });
  } else {
    // Fallback to existing logic based on cloudInfraModel
    isInfraModel = !!targetModel.cloudInfraModel && targetModel.isCloudModel;
    isSoftwareModel = !targetModel.cloudInfraModel && targetModel.isCloudModel;
    console.log('createTaskForModel - Using fallback logic:', {
      isInfraModel,
      isSoftwareModel,
    });
  }

  console.log('createTaskForModel - Final model type:', {
    isInfraModel,
    isSoftwareModel,
    targetModel,
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

  if (isInfraModel && targetModel?.cloudInfraModel?.targetInfra) {
    // Handle infra model data - use targetInfra from cloudInfraModel
    console.log(
      'Processing infra model with targetInfra:',
      targetModel.cloudInfraModel.targetInfra,
    );

    if (parseString) {
      // Set the targetInfra data directly
      parseString['targetInfra'] = targetModel.cloudInfraModel.targetInfra;

      // Also set other related infra data if available
      if (targetModel.cloudInfraModel.targetSecurityGroupList) {
        parseString['targetSecurityGroupList'] =
          targetModel.cloudInfraModel.targetSecurityGroupList;
      }
      if (targetModel.cloudInfraModel.targetSshKey) {
        parseString['targetSshKey'] = targetModel.cloudInfraModel.targetSshKey;
      }
      if (targetModel.cloudInfraModel.targetVNet) {
        parseString['targetVNet'] = targetModel.cloudInfraModel.targetVNet;
      }
      if (targetModel.cloudInfraModel.targetOsImageList) {
        parseString['targetOsImageList'] =
          targetModel.cloudInfraModel.targetOsImageList;
      }
      if (targetModel.cloudInfraModel.targetSpecList) {
        parseString['targetSpecList'] =
          targetModel.cloudInfraModel.targetSpecList;
      }
    }
    console.log('Processed infra model data:', parseString);
  } else if (isSoftwareModel && (targetModel as any)?.targetSoftwareModel) {
    // Handle software model data - use targetSoftwareModel
    const targetSoftwareModel = (targetModel as any).targetSoftwareModel;
    console.log(
      'Processing software model with targetSoftwareModel:',
      targetSoftwareModel,
    );

    if (parseString) {
      // Set the targetSoftwareModel data directly
      parseString['targetSoftwareModel'] = targetSoftwareModel;

      // Also set other related software data if available
      if (targetSoftwareModel.softwareList) {
        parseString['softwareList'] = targetSoftwareModel.softwareList;
      }
      if (targetSoftwareModel.targetSpecList) {
        parseString['targetSpecList'] = targetSoftwareModel.targetSpecList;
      }
      if (targetSoftwareModel.targetOsImageList) {
        parseString['targetOsImageList'] =
          targetSoftwareModel.targetOsImageList;
      }
      if (targetSoftwareModel.targetSecurityGroupList) {
        parseString['targetSecurityGroupList'] =
          targetSoftwareModel.targetSecurityGroupList;
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
        zone: targetModel.zone,
      };
    }
    console.log('Processed software model data:', parseString);
  }

  // Set path_params and query_params from task component with nsId default value.
  // ★ A schema property's description is *explanatory text (a placeholder)*, not a value. Leave the
  //   value empty so the auto-generated task uses the backend default (for optional params) or the
  //   user fills it in. (Previously the description was put in as the value, e.g. cm-beetle migration
  //   ending up with nameSeed=<explanatory text>, which caused a 400.)
  const pathParamsKeyValue = taskComponent?.data.path_params?.properties
    ? Object.entries(taskComponent.data.path_params.properties).reduce(
        (acc, [key]) => {
          acc[key] = '';
          return acc;
        },
        {} as Record<string, string>,
      )
    : {};

  const queryParamsKeyValue = taskComponent?.data.query_params?.properties
    ? Object.entries(taskComponent.data.query_params.properties).reduce(
        (acc, [key]) => {
          acc[key] = '';
          return acc;
        },
        {} as Record<string, string>,
      )
    : {};

  // Set nsId to DEFAULT_NAMESPACE if it exists in path_params or query_params
  let pathParams =
    Object.keys(pathParamsKeyValue).length > 0 ? pathParamsKeyValue : null;
  let queryParams =
    Object.keys(queryParamsKeyValue).length > 0 ? queryParamsKeyValue : null;

  if (pathParams && 'nsId' in pathParams) {
    pathParams = { ...pathParams, nsId: DEFAULT_NAMESPACE };
  }
  if (queryParams && 'nsId' in queryParams) {
    queryParams = { ...queryParams, nsId: DEFAULT_NAMESPACE };
  }

  const task: ITaskResponse = {
    dependencies: [],
    name: taskComponentName,
    path_params: pathParams,
    query_params: queryParams,
    request_body: JSON.stringify(parseString),
    id: '',
    task_component: taskComponentName,
  };

  const step = workflowToolModel.convertToDesignerTask(task, task.request_body);

  // ❌ CRITICAL FIX: Do NOT overwrite step.properties.model with schema!
  // step.properties.model should contain actual DATA (from parseString), not SCHEMA
  // TaskComponentEditor will get schema from step.properties.taskComponentData (set in editorProviders)
  //
  // Previously this was causing schema to be saved in request_body instead of actual data:
  // if (taskComponent.data.body_params && Object.keys(taskComponent.data.body_params).length > 0) {
  //   step.properties.model = taskComponent.data.body_params;  // ❌ This overwrites DATA with SCHEMA!
  // }

  console.log('✅ step.properties.model contains actual data (not schema):', {
    modelKeys: Object.keys(step.properties.model || {}),
    modelSample: JSON.stringify(step.properties.model).substring(0, 200),
  });

  taskGroup.sequence?.push(step);
  sequentialSequence.value = [taskGroup];

  console.log('Created workflow sequence with task:', {
    taskGroup,
    step,
    sequence: sequentialSequence.value,
  });
}

/*
  The paths into this editor, and whether **the workflow must be read from the engine** at that point

  | Entry path | toolType | Drawn from | Wait |
  |---|---|---|---|
  | Run state → Edit (unexecuted original) | edit | store (already received from the list) → engine if absent | needed |
  | Run state → Clone & Edit | edit | store (the clone response is placed in immediately) | effectively instant |
  | Open a JSON-created workflow later | edit | store → engine if absent | needed |
  | Entering from a target model | add | template | not needed |
  | Create new from the list (currently blocked) | add | template | not needed |

  The only one that needs to wait is **`edit`** — `add` does not read an existing workflow but draws
  from a template, so it is independent of engine state. That is why the wait lives only in this branch.
*/
async function loadWorkflow() {
  if (props.toolType === 'edit') {
    // If not in the cache, the store fetches and fills it. A workflow opened without going through
    // the list screen (e.g. a just-created clone) also loads correctly via this path.
    workflowData.value = await fetchWorkflowForEdit();
    workflowLoadState.value = workflowData.value ? 'ok' : 'failed';
    if (!workflowData.value) return;
    // If there is run history, only display it. The normal path (the run state screen) never sends a
    // workflow with history here in the first place, so this is a safety net that stays intact even if
    // some other entry path is added later.
    isRunLocked.value = await hasWorkflowRunHistory(props.wftId);
  } else if (props.toolType === 'add') {
    workflowData.value = workflowToolModel.getWorkflowTemplateData(
      workflowToolModel.dropDownModel.selectedItemId,
    );
  }

  // Set workflow name and description
  if (props.toolType === 'add') {
    // For add mode, set default name based on migrationType
    const defaultName =
      props.migrationType === 'infra'
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
    workflowDataName: workflowData.value?.name,
  });
}

function loadSequence() {
  if (workflowData.value) {
    const loaded = workflowToolModel.convertCicadaToDesignerFormData(
      workflowData.value,
      resTaskComponentList.data.value?.responseData!,
    );
    sequentialSequence.value = loaded.sequence;
    // If the shape cannot be drawn, surface the reason instead of a blank screen. Forcibly flattening
    // it to display would, on save, create dependencies that did not exist and silently change the workflow.
    isUneditable.value = loaded.representable === false;
    loadWarnings.value = loaded.warnings ?? [];
    // When entering from a target model, inject the target model id into the lookup task and the literal
    // body into the migration task. Injected right after the sequence is built (before designer render),
    // so it is reflected as-is on save.
    if (props.targetModel) {
      injectTargetModelIntoSequence();
    }
  }
}

/**
 * Injection specific to the target model flow — in the loaded template sequence:
 *  ① fill the lookup task (damselfly_task_get_cloud_infra_model / _get_target_software_model)'s
 *     path_params.id with the selected target model id, and
 *  ② overwrite the migration task (beetle_task_infra_migration / grasshopper_task_software_migration)'s
 *     body (model) with the target model's literal value, so the actual value is saved rather than a reference.
 * The remaining tasks (sleep/install_docker/email, etc.) are left as the template.
 *
 * Since ② is literal, ①'s lookup result is not actually used, but the template structure requires ① to
 * succeed for the run to complete, so we put in a valid target model id (this also resolves the issue
 * where a hardcoded example id was being saved as-is).
 */
function injectTargetModelIntoSequence() {
  const tm = props.targetModel;
  if (!tm) return;
  const isInfra =
    tm.migrationType === 'infra' ||
    (!!tm.cloudInfraModel && tm.migrationType !== 'software');
  const lookupComponent = isInfra
    ? 'damselfly_task_get_cloud_infra_model'
    : 'damselfly_task_get_target_software_model';
  const migrationComponent = isInfra
    ? 'beetle_task_infra_migration'
    : 'grasshopper_task_software_migration';
  /*
    The two migrations have different body shapes — they must not be filled in the same way.
     - Infra (beetle): the *contents* of cloudInfraModel (targetInfra/targetVNet, etc.) are the body itself.
     - Software (grasshopper): the body is received *wrapped* one level in `targetSoftwareModel`
       (smdl `TargetSoftwareModel{ TargetSoftwareModel ... json:"targetSoftwareModel" }`).
    Putting in only the inner object ({servers:[...]}) makes grasshopper bind servers to an empty value
    and return 200 + execution_id without processing any software. The task then looks successful while
    the result (target_mappings) is empty, making the cause hard to find.
  */
  const softwareModel = (tm as any).targetSoftwareModel;
  const literalBody = isInfra
    ? tm.cloudInfraModel
    : softwareModel
      ? { targetSoftwareModel: softwareModel }
      : undefined;

  const visit = (steps: any[] | undefined) => {
    for (const step of steps ?? []) {
      const component = step?.properties?.originalData?.task_component;
      if (component === lookupComponent) {
        step.properties.fixedModel = step.properties.fixedModel ?? {
          path_params: {},
          query_params: {},
        };
        step.properties.fixedModel.path_params = {
          ...(step.properties.fixedModel.path_params ?? {}),
          id: tm.id,
        };
      } else if (component === migrationComponent && literalBody) {
        // Put in the target model's literal value instead of a reference body (the right-hand table is filled with this value too).
        step.properties.model = { ...literalBody };
      }
      if (step?.sequence) visit(step.sequence);
    }
  };
  visit(sequentialSequence.value);
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
      console.log('=== getCicadaData Debug ===');
      console.log('Definition sequence:', definition.sequence);
      console.log('Sequence length:', definition.sequence.length);

      // Detailed step analysis
      definition.sequence.forEach((step: any, index: number) => {
        console.log(`Step ${index}:`, {
          name: step.name,
          type: step.type,
          properties: step.properties,
          'properties.model': step.properties?.model,
          'properties.fixedModel': step.properties?.fixedModel,
          'properties.originalData': step.properties?.originalData,
        });

        // Check nested sequences (like TaskGroup)
        if (step.sequence && step.sequence.length > 0) {
          console.log(`  Nested sequence (${step.sequence.length} items):`);
          step.sequence.forEach((nestedStep: any, nestedIndex: number) => {
            console.log(`    Nested step ${nestedIndex}:`, {
              name: nestedStep.name,
              type: nestedStep.type,
              'properties.model': nestedStep.properties?.model,
              'properties.fixedModel': nestedStep.properties?.fixedModel,
              'properties.originalData': nestedStep.properties?.originalData,
              'fixedModel.request_body':
                nestedStep.properties?.fixedModel?.request_body,
            });

            // Log request_body if exists
            if (nestedStep.properties?.fixedModel?.request_body) {
              try {
                const requestBody =
                  typeof nestedStep.properties.fixedModel.request_body ===
                  'string'
                    ? JSON.parse(nestedStep.properties.fixedModel.request_body)
                    : nestedStep.properties.fixedModel.request_body;
                console.log('    Request body parsed:', requestBody);
                console.log('    Request body keys:', Object.keys(requestBody));
              } catch (e) {
                console.log(
                  '    Request body (raw):',
                  nestedStep.properties.fixedModel.request_body,
                );
              }
            }
          });
        }
      });

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

      console.log('Converted workflow data:', workflow.data);
      console.log('Task groups:', workflow.data.task_groups);
      console.log('===========================');
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
    workflowDescription: workflow.description,
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
        emit('update:close-modal', false); // close the modal after a successful save
        // What usually happens after saving is running it. Tell it which workflow was saved so the
        // screen can move to that workflow's run state.
        emit('update:saved', props.wftId);
      })
      .catch(err => {
        showErrorMessage(
          'Error',
          toErrorMessage(err, 'Failed to process the workflow.'),
        );
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
        emit('update:close-modal', false); // close the modal after a successful save
        // The id of a newly created workflow can only be learned from the response. It returns the whole
        // workflow in the same shape as the clone API. **If there is no id, do not move** — it is better to
        // stay on the current screen than to show the run state of the wrong workflow.
        const createdId = res?.data?.responseData?.id;
        if (createdId) emit('update:saved', createdId);
      })
      .catch(err => {
        showErrorMessage(
          'Error',
          toErrorMessage(err, 'Failed to process the workflow.'),
        );
      });
  }
}

function handleSaveCallback(designer: Designer | null) {
  trigger.value = false;
  try {
    const definition = designer?.getDefinition();
    const problems = workflowToolModel.validateDesignerSequence(
      (definition?.sequence ?? []) as Step[],
    );
    if (problems.length) {
      showErrorMessage('Cannot save', problems.join('\n'));
      return;
    }

    // A state that is not wrong but looks half-finished is still saved, with a note. Because once the
    // screen is closed the diagram is gone and only the saved connections remain.
    const notices = workflowToolModel.reviewDesignerSequence(
      (definition?.sequence ?? []) as Step[],
    );
    if (notices.length) {
      showInfoMessage('Check the parallel steps', notices.join('\n'));
    }

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
  if (isUneditable.value || isRunLocked.value) return;
  // Saving while it has not been read would overwrite with an empty definition
  if (workflowLoadState.value !== 'ok') return;
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
                data-testid="workflow-name-input"
                block
              />
            </PFieldGroup>
            <PFieldGroup class="flex-1" :label="'Description'">
              <p-text-input v-model="workflowDescription.value.value" block />
            </PFieldGroup>
            <!--
              Parallelism must be pulled explicitly from the palette, and side-by-side placement only
              works inside a parallel box. A first-time user has no way to learn that rule from the
              screen, so we link to the guide.
            -->
            <PFieldGroup class="flex-1" :label="'Workflow Template'" required>
              <p-select-dropdown
                class="w-full"
                data-testid="workflow-template-select"
                :menu="workflowToolModel.dropDownModel.data"
                :disabled="props.toolType !== 'add'"
                @select="handleSelectTemplate"
              />
            </PFieldGroup>
            <button
              type="button"
              class="workflow-tool-help"
              data-testid="workflow-parallel-guide-link"
              @click="openDocLink(DOC_LINKS.workflowParallelSteps)"
            >
              How to run tasks in parallel
            </button>
          </header>
          <div
            v-if="loadWarnings.length"
            class="workflow-tool-notice mb-[12px]"
          >
            <p class="workflow-tool-notice__title">
              {{
                isUneditable
                  ? 'This workflow cannot be opened in the graphical editor'
                  : 'Check this workflow'
              }}
            </p>
            <ul>
              <li v-for="(warning, i) in loadWarnings" :key="i">
                {{ warning }}
              </li>
            </ul>
          </div>
          <!--
            When a workflow that has been run is opened via any path. Tells the user both that it
            cannot be edited and what to do instead.
          -->
          <div
            v-if="isRunLocked"
            class="workflow-tool-notice workflow-tool-notice--locked mb-[12px]"
            data-testid="workflow-run-locked-notice"
          >
            <p class="workflow-tool-notice__title">
              View only — this workflow has been run
            </p>
            <ul>
              <li>
                Editing it in place would change what its past runs appear to
                have used, and that cannot be undone.
              </li>
              <li>
                To work on it, go to Run Status and use Clone &amp; Edit. The
                copy keeps a link back to this workflow.
              </li>
            </ul>
          </div>
          <!--
            State where it has not been read yet. **We do not state why it is slow** — there are many
            paths to get here (clone, target model, create new, opening a JSON-created one), so the
            screen cannot pin down the cause. It only says it is waiting, and draws once it is ready.
          -->
          <div
            v-if="workflowLoadState === 'waiting'"
            class="workflow-tool-loading"
            data-testid="workflow-load-notice"
          >
            <p-spinner size="md" />
            <p>Getting this workflow ready…</p>
          </div>
          <div
            v-else-if="workflowLoadState === 'failed'"
            class="workflow-tool-notice mb-[12px]"
            data-testid="workflow-load-notice"
          >
            <p class="workflow-tool-notice__title">
              This workflow could not be read
            </p>
            <ul>
              <li>
                Nothing is shown rather than an empty canvas, because saving an
                empty canvas would wipe the workflow. Close this and open it
                again in a moment.
              </li>
            </ul>
          </div>
          <section
            v-if="!isUneditable && workflowLoadState === 'ok'"
            class="workflow-tool-body"
          >
            <SequentialDesigner
              :sequence="sequentialSequence"
              :readonly="isRunLocked"
              :trigger="trigger.value"
              :task-component-list="
                resTaskComponentList.data.value?.responseData
              "
              @getDesigner="handleSaveCallback"
            />
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
          data-testid="workflow-designer-save"
          :loading="resUpdateWorkflow.isLoading.value"
          :disabled="isUneditable || isRunLocked || workflowLoadState !== 'ok'"
          @click="handleSave"
        >
          Save
        </p-button>
      </template>
    </create-form>
  </div>
</template>

<style scoped lang="postcss">
.workflow-tool-help {
  align-self: center;
  white-space: nowrap;
  text-decoration: underline;
  font-size: 0.8125rem;
  color: #6b7280;
}
.workflow-tool-help:hover {
  color: #1f2937;
}
.workflow-tool-notice {
  border-left: 4px solid #f0a020;
  background: #fff8e6;
  padding: 12px 16px;
  border-radius: 4px;
}
/* Being uneditable is a state, not a warning — use a different color from the yellow warning */
.workflow-tool-notice--locked {
  border-left-color: #6b7280;
  background: #f3f4f6;
}
.workflow-tool-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 240px;
  color: #4b5563;
  font-size: 0.875rem;
}
.workflow-tool-notice__title {
  font-weight: 600;
  margin-bottom: 4px;
}
.workflow-tool-notice ul {
  list-style: disc;
  padding-left: 20px;
}

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
