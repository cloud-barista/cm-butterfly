import { useWorkflowStore } from '@/entities/workflow/model/stores.ts';
import {
  IWorkFlowDesignerFormData,
  Step,
} from '@/features/workflow/workflowEditor/model/types.ts';
import {
  ITaskGroupResponse,
  ITaskResponse,
  IWorkflow,
} from '@/entities/workflow/model/types.ts';
import getRandomId from '@/shared/utils/uuid';
import { toolboxSteps } from '@/features/workflow/workflowEditor/sequential/designer/toolbox/model/toolboxSteps.ts';
import { parseRequestBody } from '@/shared/utils/stringToObject';

export function useWorkflowToolModel() {
  const workflowStore = useWorkflowStore();
  const { defineTaskGroupStep, defineBettleTaskStep } = toolboxSteps();

  function getWorkflowData(workflowId: string) {
    return workflowStore.getWorkflowById(workflowId);
  }

  function getWorkflowTemplateData(workflowTemplateId: string) {
    return workflowStore.getWorkflowTemplateById(workflowTemplateId);
  }

  function convertCicadaToDesignerFormData(
    workflow: IWorkflow,
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

  function convertToDesignerTask(task: ITaskResponse): Step {
    const parsedString: object = parseRequestBody(task.request_body);
    return defineBettleTaskStep(getRandomId(), task.name, 'task', {
      model: parsedString,
      originalData: task,
    });
  }

  function convertToDesignerTaskGroup(taskGroup: ITaskGroupResponse): Step {
    return defineTaskGroupStep(getRandomId(), taskGroup.name, 'MCI', {
      model: { description: taskGroup.description },
    });
  }

  function convertDesignerSequenceToCicada(sequence: Step[]) {
    if (!validationSequence(sequence)) {
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
            tasks.push(convertToCicadaTask(step));
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

  function convertToCicadaTask(step: Step) {
    console.log(step);
    if (step.componentType === 'task') {
      return {
        name: step.name,
        request_body: JSON.stringify(step.properties.model),
        path_params: step.properties.originalData?.path_params,
        task_component: step.properties.originalData?.task_component,
        dependencies: step.properties.originalData?.dependencies,
      };
    }
  }

  function validationSequence(sequence: Step[]): boolean {
    return !sequence.some(step => {
      return step.componentType === 'task';
    });
  }

  return {
    getWorkflowTemplateData,
    getWorkflowData,
    convertCicadaToDesignerFormData,
    convertDesignerSequenceToCicada,
  };
}
