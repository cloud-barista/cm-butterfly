import { toolboxSteps } from '@/features/workflow/workflowDesigner/model/toolboxSteps.ts';
import {
  ITaskInfoResponse,
  ITaskRequestBody,
} from '@/features/workflow/workflowDesigner/api';
import { Step } from '@/features/workflow/model/types.ts';
import { parseRequestBody } from '@/shared/utils/stringToObject';
import getRandomId from '@/shared/utils/uuid';

export function useWorkflowDesignerModel() {
  const loadStepsFunc = toolboxSteps();
  const taskStepsModels: Step[] = [];

  function processToolBoxTaskListResponse(res: ITaskInfoResponse[]) {
    res.forEach((res: ITaskInfoResponse) => {
      res.data.options.request_body = parseRequestBody(
        res.data.options.request_body,
      );
      const taskRequestData: ITaskRequestBody = res.data.options.request_body;
      taskStepsModels.push(
        loadStepsFunc.defineBettleTaskStep(
          getRandomId(),
          res.name ?? 'undefined',
          'task',
          {
            mci: {
              name: taskRequestData.name,
              description: taskRequestData.description,
              vms: taskRequestData.vm
                ? taskRequestData.vm.map(vm => ({
                    id: getRandomId(),
                    name: vm.name,
                    serverQuantity: vm.subGroupSize,
                    commonSpec: vm.commonSpec,
                    osImage: vm.commonImage,
                    diskType: vm.rootDiskType,
                    diskSize: vm.rootDiskSize,
                    password: vm.vmUserPassword,
                    connectionName: vm.connectionName,
                  }))
                : [],
            },
          },
        ),
      );
    });
  }

  function getTaskStepsModels() {
    return taskStepsModels;
  }
  return { processToolBoxTaskListResponse, getTaskStepsModels };
}
