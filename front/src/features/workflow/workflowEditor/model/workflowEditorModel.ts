import { useWorkflowStore } from '@/entities/workflow/model/stores.ts';
import {
  IWorkFlowDesignerFormData,
  Step,
} from '@/features/workflow/workflowEditor/model/types.ts';
import {
  ITaskComponentResponse,
  ITaskGroupResponse,
  ITaskResponse,
  IWorkflow,
  IWorkflowResponse,
} from '@/entities/workflow/model/types.ts';
import getRandomId from '@/shared/utils/uuid';
import { toolboxSteps } from '@/features/workflow/workflowEditor/sequential/designer/toolbox/model/toolboxSteps.ts';
import { parseRequestBody } from '@/shared/utils/stringToObject';
import { ITaskInfoResponse } from '@/features/workflow/workflowEditor/sequential/designer/toolbox/model/api';
import { showErrorMessage } from '@/shared/utils';
import { reactive } from 'vue';

type dropDownType = {
  name: string;
  label: string;
  type: 'item';
};

interface fixedModel {
  path_params: Record<string, string>;
  query_params: Record<string, string>;
}

export function useWorkflowToolModel() {
  const workflowStore = useWorkflowStore();
  const { defineTaskGroupStep, defineBettleTaskStep } = toolboxSteps();
  const taskComponentList: Array<ITaskInfoResponse> = [];
  const dropDownModel = reactive<{
    state: any;
    data: dropDownType[];
    selectedItemId: string;
  }>({
    state: { disabled: false },
    data: [],
    selectedItemId: '',
  });

  function setTaskComponent(_taskComponentList: Array<ITaskInfoResponse>) {
    _taskComponentList.forEach(component => {
      taskComponentList.push(component);
    });
  }

  function setDropDownData(workspaceResponse: IWorkflowResponse[]) {
    workspaceResponse.forEach(workspace => {
      dropDownModel.data.push({
        name: workspace.id,
        label: workspace.name,
        type: 'item',
      });
    });
  }

  function getWorkflowData(workflowId: string) {
    return workflowStore.getWorkflowById(workflowId);
  }

  function getWorkflowTemplateData(workflowTemplateId: string) {
    return workflowStore.getWorkflowTemplateById(workflowTemplateId);
  }

  function convertCicadaToDesignerFormData(
    workflow: IWorkflow,
    taskComponentList: Array<ITaskInfoResponse>,
  ): IWorkFlowDesignerFormData {
    const sequence: Step[] = [];

    // 스택에 부모 taskGroup과 현재 taskGroup을 함께 저장
    const stack: {
      parentTaskGroup: Step | null;
      currentTaskGroup: ITaskGroupResponse;
    }[] = workflow.data.task_groups.map(taskGroup => ({
      parentTaskGroup: null,
      currentTaskGroup: taskGroup,
    }));

    while (stack.length) {
      const { parentTaskGroup, currentTaskGroup } = stack.pop()!;

      const currentDesignerTaskGroup =
        convertToDesignerTaskGroup(currentTaskGroup);

      if (currentTaskGroup.tasks) {
        for (const task of currentTaskGroup.tasks) {
          mappingWorkflowTaskComponent(task, taskComponentList);
          const currentDesignerTask = convertToDesignerTask(task);
          currentDesignerTaskGroup.sequence!.push(currentDesignerTask);
        }
      }

      if (parentTaskGroup) {
        parentTaskGroup.sequence!.push(currentDesignerTaskGroup);
      } else {
        sequence.push(currentDesignerTaskGroup);
      }

      if (currentTaskGroup.task_groups) {
        for (const subTaskGroups of currentTaskGroup.task_groups) {
          stack.push({
            parentTaskGroup: currentDesignerTaskGroup,
            currentTaskGroup: subTaskGroups,
          });
        }
      }
    }

    return { sequence };
  }

  function createFixedModel(task: ITaskResponse): fixedModel {
    const fixedModel: fixedModel = {
      path_params: task.path_params,
      query_params: task.query_params,
    };

    if (task.path_params === null || task.query_params === null) {
      const taskComponent = taskComponentList.find(
        component => task.name === component.name,
      );

      const pathParamsKeyValue = taskComponent?.data.param_option.path_params
        .properties
        ? Object.entries(
            taskComponent.data.param_option.path_params.properties,
          ).reduce((acc, [key, value]) => {
            acc[key] = value.description;
            return acc;
          }, {})
        : {};

      const queryParamsKeyValue = taskComponent?.data.param_option.query_params
        .properties
        ? Object.entries(
            taskComponent?.data.param_option.query_params.properties,
          ).reduce((acc, [key, value]) => {
            acc[key] = value.description;
            return acc;
          }, {})
        : {};

      if (task.path_params === null) {
        fixedModel.path_params = pathParamsKeyValue;
      }
      if (task.query_params === null) {
        fixedModel.query_params = queryParamsKeyValue;
      }
    }
    console.log(fixedModel);
    return fixedModel;
  }

  function convertToDesignerTask(task: ITaskResponse): Step {
    const parsedString: object = parseRequestBody(task.request_body);
    return defineBettleTaskStep(getRandomId(), task.name, 'task', {
      model: parsedString,
      originalData: task,
      fixedModel: createFixedModel(task),
    });
  }

  function convertToDesignerTaskGroup(taskGroup: ITaskGroupResponse): Step {
    return defineTaskGroupStep(getRandomId(), taskGroup.name, 'MCI', {
      model: { description: taskGroup.description },
    });
  }

  function convertDesignerSequenceToCicada(sequence: Step[]) {
    if (!validationSequence(sequence)) {
      showErrorMessage(
        'Error',
        'task must have at least one taskGroup as its parent.',
      );
      throw new Error();
    }

    const cicadaObject: ITaskGroupResponse[] = [];

    const stack: {
      parentNode: ITaskGroupResponse | null;
      currentNode: Step;
    }[] = sequence.map((step: Step) => ({
      parentNode: null,
      currentNode: step,
    }));

    while (stack.length) {
      const { parentNode, currentNode } = stack.pop()!;

      const taskGroup: ITaskGroupResponse = {
        description: '',
        name: '',
        tasks: [],
      };

      if (currentNode.componentType === 'container') {
        const tasks: any = [];

        currentNode.sequence?.forEach(step => {
          if (step.componentType === 'container') {
            stack.push({ parentNode: taskGroup, currentNode: step });
          } else if (step.componentType === 'task') {
            tasks.push(convertToCicadaTask(step, tasks[tasks.length - 1]));
          }
        });

        taskGroup.description =
          currentNode.properties.model?.['description'] ?? '';
        taskGroup.name = currentNode.name;
        taskGroup.tasks = tasks;
      }

      if (parentNode === null) {
        cicadaObject.push(taskGroup);
      } else {
        parentNode.task_groups = parentNode.task_groups || [];
        parentNode.task_groups.push(taskGroup);
      }
    }

    return cicadaObject;
  }

  function convertToCicadaTask(step: Step, dependenciesStep: Step) {
    console.log(step);
    console.log(dependenciesStep);
    if (step.componentType === 'task') {
      return {
        name: step.name,
        request_body: JSON.stringify(step.properties.model),
        path_params: step.properties.originalData?.path_params,
        task_component: step.properties.originalData?.task_component,
        dependencies:
          dependenciesStep && dependenciesStep.name
            ? [dependenciesStep.name]
            : [],
      };
    }
  }

  function validationSequence(sequence: Step[]): boolean {
    return !sequence.some(step => {
      return step.componentType === 'task';
    });
  }

  function mappingWorkflowTaskComponent(
    task: ITaskResponse,
    taskComponentList: Array<ITaskInfoResponse>,
  ) {
    if (task.request_body === '') {
      task.request_body =
        taskComponentList.find(
          taskComponent => task.task_component === taskComponent.name,
        )?.data.options.request_body ?? '';
    }
  }

  function designerFormDataReordering(sequence: Step[]) {
    console.log(sequence);
    const newSequence: Step[] = [];
    const taskGroupQueue: Step[] = [];

    sequence.forEach(step => {
      if (step.componentType === 'container') {
        taskGroupQueue.push(step);
      }
    });

    while (taskGroupQueue.length > 0) {
      const rootTaskGroup = taskGroupQueue.pop()!;
      const newTaskGroupSequence: Step[] = [];
      const queue: Step[] = [];

      const rootStep = rootTaskGroup.sequence?.find(step => {
        return (
          step.properties.originalData?.dependencies === null ||
          step.properties.originalData?.dependencies.length === 0
        );
      });

      if (rootStep) {
        queue.push(rootStep);
        newTaskGroupSequence.push(rootStep);
      }

      //dependency 를 기준으로 정렬하기 위한 while
      while (queue.length > 0) {
        const dependencyTask = queue.pop()!;

        const targetTask = rootTaskGroup.sequence?.find(step => {
          if (Array.isArray(step.properties.originalData?.dependencies)) {
            return (
              dependencyTask.name ===
              step.properties.originalData?.dependencies[0]
            );
          }
        });

        if (targetTask) {
          queue.push(targetTask);
          newTaskGroupSequence.push(targetTask);
        }

        const taskGroup = rootTaskGroup.sequence?.find(
          step => step.componentType === 'container',
        );

        if (taskGroup) {
          taskGroupQueue.push(taskGroup);
        }
      }
      rootTaskGroup.sequence = newTaskGroupSequence;
      newSequence.push(rootTaskGroup);
    }

    return newSequence;
  }

  return {
    workflowStore,
    dropDownModel,
    setTaskComponent,
    setDropDownData,
    getWorkflowTemplateData,
    getWorkflowData,
    convertCicadaToDesignerFormData,
    convertDesignerSequenceToCicada,
    designerFormDataReordering,
  };
}
