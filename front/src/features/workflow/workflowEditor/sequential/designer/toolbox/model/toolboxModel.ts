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
  const loadStepsFunc = toolboxSteps();

  function getTaskComponentStep(
    taskComponentList: ITaskComponentInfoResponse[],
  ): Step[] {
    const convertedTackComponentList: Array<Step> = [];
    const taskComponentSteps: Step[] = [];
    taskComponentList.forEach((res: ITaskComponentInfoResponse) => {
      const parsedString: object = parseRequestBody(
        res.data.options.request_body,
      );

      taskComponentSteps.push(
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

    taskComponentSteps.forEach(step => {
      convertedTackComponentList.push(step);
    });

    return convertedTackComponentList;
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
    const pathParamsKeyValue = task?.data.path_params?.properties
      ? Object.entries(task.data.path_params?.properties).reduce(
          (acc, [key, value]) => {
            acc[key] = value.description;
            return acc;
          },
          {},
        )
      : {};

    const queryParamsKeyValue = task?.data.query_params?.properties
      ? Object.entries(task.data.query_params?.properties).reduce(
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

  return {
    getTaskComponentStep,
    getFixedModel,
  };
}
