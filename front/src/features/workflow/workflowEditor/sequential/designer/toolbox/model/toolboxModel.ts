import {
  getTaskComponentList,
  ITaskInfoResponse,
  ITaskRequestBody,
} from '@/features/workflow/temp/workflowEditor/sequential/designer/toolbox/model/api';
import { useFlowChartModel } from '@/features/workflow/temp/workflowEditor/sequential/designer/model/sequentialDesignerModel.ts';
import { parseRequestBody } from '@/shared/utils/stringToObject';
import getRandomId from '@/shared/utils/uuid';
import { Step } from '@/features/workflow/temp/workflowEditor/model/types.ts';
import { toolboxSteps } from '@/features/workflow/temp/workflowEditor/sequential/designer/toolbox/model/toolboxSteps.ts';

export function useSequentialToolboxModel() {
  const resGetTaskComponentList = getTaskComponentList();
  const loadStepsFunc = toolboxSteps();

  async function getTaskComponents() {
    const res = await resGetTaskComponentList.execute();
    return processToolBoxTaskListResponse(res.data.responseData!);
  }

  function processToolBoxTaskListResponse(res: ITaskInfoResponse[]) {
    const taskStepsModels: Step[] = [];
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

    return taskStepsModels;
  }

  return getTaskComponents();
}
