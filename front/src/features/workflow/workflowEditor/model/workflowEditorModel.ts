import { useWorkflowStore } from '@/entities/workflow/model/stores.ts';
import {
  fixedModel,
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
import { ITaskComponentInfoResponse } from '@/features/workflow/workflowEditor/sequential/designer/toolbox/model/api';
import { isNullOrUndefined, showErrorMessage } from '@/shared/utils';
import { reactive } from 'vue';
import { useSequentialToolboxModel } from '@/features/workflow/workflowEditor/sequential/designer/toolbox/model/toolboxModel.ts';

type dropDownType = {
  name: string;
  label: string;
  type: 'item';
};

export function useWorkflowToolModel() {
  const workflowStore = useWorkflowStore();
  const { defineTaskGroupStep, defineBettleTaskStep } = toolboxSteps();
  const sequentialToolboxModel = useSequentialToolboxModel();
  const taskComponentList: Array<ITaskComponentInfoResponse> = [];
  const dropDownModel = reactive<{
    state: any;
    data: dropDownType[];
    selectedItemId: string;
  }>({
    state: { disabled: false },
    data: [],
    selectedItemId: '',
  });

  function setTaskComponent(
    _taskComponentList: Array<ITaskComponentInfoResponse>,
  ) {
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
    taskComponentList: Array<ITaskComponentInfoResponse>,
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
          const requestBody = getMappingWorkflowTaskComponentRequestBody(
            task,
            taskComponentList,
            currentTaskGroup.tasks,
          );
          const currentDesignerTask = convertToDesignerTask(task, requestBody);
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
    if (
      isNullOrUndefined(fixedModel.path_params) ||
      isNullOrUndefined(fixedModel.query_params)
    ) {
      const taskComponent = taskComponentList.find(
        taskComponent => taskComponent.name === task.task_component,
      );

      if (taskComponent) {
        const { path_params, query_params } =
          sequentialToolboxModel.getFixedModel(taskComponent);

        if (isNullOrUndefined(fixedModel.path_params)) {
          fixedModel.path_params = path_params;
        }
        if (isNullOrUndefined(fixedModel.query_params)) {
          fixedModel.query_params = query_params;
        }
      }
    }
    console.log(fixedModel);
    return fixedModel;
  }

  function convertToDesignerTask(
    task: ITaskResponse,
    requestBody: string,
  ): Step {
    const parsedString: object = parseRequestBody(requestBody);
    return defineBettleTaskStep(getRandomId(), task.name, task.task_component, {
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
      throw new Error('task must have at least one taskGroup as its parent.');
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
        path_params: step.properties.fixedModel?.path_params,
        query_params: step.properties.fixedModel?.query_params,
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

  function getMappingWorkflowTaskComponentRequestBody(
    task: ITaskResponse,
    taskComponentList: Array<ITaskComponentInfoResponse>,
    taskList: Array<ITaskResponse>,
  ): string {
    //request_body가 공백인 경우, 다른 task의 이름인 경우
    const condition =
      taskList.findIndex(el => el.name === task.request_body) !== -1 ||
      task.request_body === '';

    if (condition) {
      const taskInstance = taskComponentList.find(
        taskComponent => taskComponent.name === task.task_component,
      );
      return taskInstance?.data.options.request_body ?? '';
    }
    return task.request_body;
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
