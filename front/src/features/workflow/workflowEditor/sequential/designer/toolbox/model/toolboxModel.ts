import {
  getTaskComponentList,
  ITaskInfoResponse,
} from '@/features/workflow/workflowEditor/sequential/designer/toolbox/model/api';
import { parseRequestBody } from '@/shared/utils/stringToObject';
import getRandomId from '@/shared/utils/uuid';
import { Step } from '@/features/workflow/workflowEditor/model/types.ts';
import { toolboxSteps } from '@/features/workflow/workflowEditor/sequential/designer/toolbox/model/toolboxSteps.ts';
import { ITaskResponse } from '@/entities';

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
      const parsedString: object = parseRequestBody(
        res.data.options.request_body,
      );

      taskStepsModels.push(
        loadStepsFunc.defineBettleTaskStep(
          getRandomId(),
          res.name ?? 'undefined',
          'task',
          {
            model: parsedString,
            originalData: mappingTaskInfoResponseITaskResponse(res),
          },
        ),
      );
    });

    return taskStepsModels;
  }

  function mappingTaskInfoResponseITaskResponse(
    taskInfoResponse: ITaskInfoResponse,
  ): ITaskResponse {
    return {
      dependencies: [],
      name: taskInfoResponse.name,
      path_params: taskInfoResponse.data.options.path_params,
      request_body: taskInfoResponse.data.options.request_body,
      query_params: '',
      task_component: taskInfoResponse.name,
    };
  }

  return getTaskComponents();
}
