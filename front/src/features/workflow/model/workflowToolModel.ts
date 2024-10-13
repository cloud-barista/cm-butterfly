import { useWorkflowStore } from '@/entities/workflow/model/stores.ts';
import {
  IWorkFlowDesignerFormData,
  Step,
} from '@/features/workflow/model/types.ts';
import {
  ITaskGroupResponse,
  ITaskResponse,
  IWorkflow,
} from '@/entities/workflow/model/types.ts';
import getRandomId from '@/shared/utils/uuid';

export function useWorkflowToolModel() {
  const workflowStore = useWorkflowStore();

  function getWorkflowToolData(workflowId: string) {
    const workflow = workflowStore.getWorkFlowById(workflowId);
    if (workflow) {
      setWorkflowSequenceModel(workflow);
    }
  }

  function setWorkflowSequenceModel(
    workflow: IWorkflow,
  ): IWorkFlowDesignerFormData {
    const sequence = processTaskGroups(workflow.data.task_groups);

    function processTaskGroups(taskGroups: ITaskGroupResponse[]): Step[] {
      const sequence: Step[] = [];
      for (let i = 0; i < taskGroups.length; i++) {
        const steps: Step[] = [];
        const currentSequence = convertToDesignerTaskGroup(taskGroups[i]);
        steps.push(currentSequence);

        if (taskGroups[i].task_groups) {
          steps.push(...processTaskGroups(taskGroups[i].task_groups));
        }
        sequence.push(...steps);
      }

      return sequence;
    }

    function convertToDesignerTask(task: ITaskResponse): Step {
      return {
        id: getRandomId(),
        name: task.name,
        componentType: 'task',
        type: 'bettle_task',
        properties: {
          isDeletable: true,
          mci: {
            name: task.request_body.name,
            description: task.request_body.description,
            vms: task.request_body.vm.map(vm => ({
              id: vm.label,
              name: vm.name,
              serverQuantity: vm.subGroupSize,
              commonSpec: vm.commonSpec,
              osImage: vm.commonImage,
              diskType: vm.rootDiskType,
              diskSize: vm.rootDiskSize,
              password: vm.vmUserPassword,
              connectionName: vm.connectionName,
            })),
          },
        },
      };
    }

    function convertToDesignerTaskGroup(taskGroup: ITaskGroupResponse): Step {
      return {
        id: getRandomId(),
        name: taskGroup.name,
        componentType: 'container',
        type: 'MCI',
        properties: {
          isDeletable: true,
        },
        sequence: taskGroup.tasks.map(task => convertToDesignerTask(task)),
      };
    }
    return { sequence };
  }
  return { getWorkflowToolData, setWorkflowSequenceModel };
}
