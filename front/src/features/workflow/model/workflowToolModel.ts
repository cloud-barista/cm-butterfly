import { useWorkflowStore } from '@/entities/workflow/model/stores.ts';
import {
  IWorkFlowDesignerFormData,
  IWorkflowTool,
  Step,
} from '@/features/workflow/model/types.ts';
import {
  ITaskGroupResponse,
  ITaskResponse,
  ITaskVmResponse,
  IWorkflow,
  IWorkflowResponse,
} from '@/entities/workflow/model/types.ts';
import { Sequence } from 'sequential-workflow-designer';

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
    // const sequence: Step[] = {};
    //
    // //TODO workflow template에 맞게 가공하는 작업이 있어야함.
    // const taskGroupStack: Array<ITaskGroupResponse> = [];
    // workflow.data.task_groups.forEach(task_group => {
    //   taskGroupStack.push(task_group);
    // });
    //
    // //taskGroup안에 taskGroup이 있다면?
    // while (taskGroupStack.length > 0) {
    //   const taskGroup = taskGroupStack.pop();
    //   const taskStack: Array<ITaskResponse> = [];
    //
    //   taskGroup?.tasks.forEach(task => {
    //     taskStack.push(task);
    //   });
    //
    //   while (taskStack.length > 0) {
    //     const task = taskStack.pop();
    //   }
    // }

    function processTaskGroup(taskGroup: ITaskGroupResponse): Step {
      const taskSteps: Step[] = taskGroup.tasks.map(task => ({
        id: '',
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
      }));

      return {
        id: '',
        name: taskGroup.name,
        componentType: 'container',
        type: 'MCI',
        properties: {
          isDeletable: true,
        },
        sequence: taskSteps,
      };
    }

    function processTaskGroups(taskGroups: ITaskGroupResponse[]): Step[] {
      const result: Step[] = [];
      const stack: ITaskGroupResponse[] = [...taskGroups];

      while (stack.length > 0) {
        const currentTaskGroup = stack.pop();
        const taskGroupStep = processTaskGroup(currentTaskGroup!);

        result.push(taskGroupStep);

        if (currentTaskGroup?.task_groups) {
          stack.push(...currentTaskGroup!.task_groups);
        }
      }

      return result;
    }
  }
}
