import {
  getTaskComponentList,
  ITaskComponentInfoResponse,
} from '@/features/workflow/workflowEditor/sequential/designer/toolbox/model/api';
import { parseRequestBody } from '@/shared/utils/stringToObject';
import getRandomId from '@/shared/utils/uuid';
import {
  fixedModel,
  Step,
} from '@/features/workflow/workflowEditor/model/types.ts';
import { toolboxSteps } from '@/features/workflow/workflowEditor/sequential/designer/toolbox/model/toolboxSteps.ts';
import { ITaskResponse } from '@/entities';

export function useSequentialToolboxModel() {
  const resGetTaskComponentList = getTaskComponentList();
  const loadStepsFunc = toolboxSteps();

  async function getTaskComponents() {
    const res = await resGetTaskComponentList.execute();
    return processToolBoxTaskListResponse(res.data.responseData!);
  }

  function processToolBoxTaskListResponse(res: ITaskComponentInfoResponse[]) {
    const taskStepsModels: Step[] = [];
    res.forEach((res: ITaskComponentInfoResponse) => {
      const parsedString: object = parseRequestBody(
        res.data.options.request_body,
      );

      taskStepsModels.push(
        loadStepsFunc.defineBettleTaskStep(
          getRandomId(),
          res.name ?? 'undefined',
          res.name,
          {
            model: parsedString,
            originalData: mappingTaskInfoResponseITaskResponse(res),
            fixedModel: getFixedModel(res),
          },
        ),
      );
    });

    return taskStepsModels;
  }

  function mappingTaskInfoResponseITaskResponse(
    taskInfoResponse: ITaskComponentInfoResponse,
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

  function getFixedModel(task: ITaskComponentInfoResponse): fixedModel {
    const pathParamsKeyValue = task?.data.param_option.path_params?.properties
      ? Object.entries(task.data.param_option.path_params.properties).reduce(
          (acc, [key, value]) => {
            acc[key] = value.description;
            return acc;
          },
          {},
        )
      : {};

    const queryParamsKeyValue = task?.data.param_option?.query_params
      ?.properties
      ? Object.entries(task.data.param_option.query_params.properties).reduce(
          (acc, [key, value]) => {
            acc[key] = value.description;
            return acc;
          },
          {},
        )
      : {};

    return {
      path_params: pathParamsKeyValue,
      query_params: queryParamsKeyValue,
    };
  }

  return getTaskComponents();
}
