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
      // body_params는 스키마로 사용, options.request_body는 초기값으로 파싱
      console.log(`Processing ${res.name} - body_params check:`, {
        hasBodyParams: !!res.data.body_params,
        bodyParams: res.data.body_params,
        hasRequestBody: !!res.data.options.request_body,
        requestBody: res.data.options.request_body
      });
      
      // body_params 존재 여부와 관계없이 항상 options.request_body를 파싱하여 초기값으로 사용
      const modelData = parseRequestBody(
        res.data.options.request_body || '{}'
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
          res.name ?? 'undefined',  // name: toolbox에서는 원본 이름 표시, canvas 드롭 시 자동으로 고유 이름 생성
          res.name,                  // type: task component 식별자
          {
            model: modelData,
            originalData: mappingTaskInfoResponseITaskResponse(res),
            fixedModel: getFixedModel(res),
            taskType: res.type ?? 'http', // cm-cicada task type (per-type editor 선택용)
            taskComponentData: { ...res.data, spec: res.spec, type: res.type },
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
      type: taskInfoResponse.type ?? 'http',
      spec: taskInfoResponse.spec,
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
