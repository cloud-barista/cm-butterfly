import { ITaskComponentInfoResponse } from '@/features/sequential/designer/toolbox/model/api';
import { parseRequestBody } from '@/shared/utils/stringToObject';
import getRandomId from '@/shared/utils/uuid';
import {
  fixedModel,
  Step,
} from '@/features/workflow/workflowEditor/model/types';
import { toolboxSteps } from '@/features/sequential/designer/toolbox/model/toolboxSteps';
import { ITaskResponse } from '@/entities';

export function useSequentialToolboxModel() {
  const loadStepsFunc = toolboxSteps();

  function getTaskComponentStep(
    taskComponentList: ITaskComponentInfoResponse[],
  ): Step[] {
    const convertedTackComponentList: Array<Step> = [];
    const taskComponentSteps: Step[] = [];
    taskComponentList.forEach((res: ITaskComponentInfoResponse) => {
      // body_params가 있으면 JSON Schema로 사용, 없으면 request_body 파싱한 객체 사용
      console.log(`Processing ${res.name} - body_params check:`, {
        hasBodyParams: !!res.data.body_params,
        bodyParams: res.data.body_params,
        hasRequestBody: !!res.data.options.request_body,
        requestBody: res.data.options.request_body
      });
      
      const modelData = res.data.body_params || parseRequestBody(
        res.data.options.request_body,
      );
      
      console.log(`Final modelData for ${res.name}:`, modelData);

      // Task component를 toolbox에서 캔버스로 드래그할 때 모델 정보를 콘솔에 출력
      console.log('=== Task Component Dragged from Toolbox ===');
      console.log(`Task Name: ${res.name}`);
      console.log(`Task ID: ${res.id}`);
      console.log('Model Information:', {
        bodyParams: res.data.body_params,
        requestBody: res.data.options.request_body,
        parsedModel: modelData,
        pathParams: res.data.path_params,
        queryParams: res.data.query_params,
        originalData: res
      });
      
      // Body params 모델 정보 상세 출력
      if (res.data.body_params && res.data.body_params.properties) {
        console.log(`📋 ${res.name} Body Params Properties:`, res.data.body_params.properties);
        if (res.data.body_params.required) {
          console.log(`🔒 ${res.name} Required Fields:`, res.data.body_params.required);
        }
      }
      
      console.log('==========================================');

      taskComponentSteps.push(
        loadStepsFunc.defineBettleTaskStep(
          getRandomId(),
          res.name ?? 'undefined',
          res.name,
          {
            model: modelData,
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
