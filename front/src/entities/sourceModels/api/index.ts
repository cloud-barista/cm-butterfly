import {
  IAxiosResponse,
  RequestBodyWrapper,
  useAxiosPost,
} from '@/shared/libs';
import { ISourceConnectionResponse } from '@/entities/sourceConnection/model/types';
import { IOnpremModelPayload, ISourceModelResponse } from '@/entities';
import { axiosInstance } from '@/shared/libs/api/instance';

const GET_SOURCE_MODEL_LIST = 'GetModels';
const UPDATE_SOURCE_MODEL = 'UpdateOnPremModel';
const CREATE_ONPREMMODEL = 'CreateOnPremModel';
const DELETE_ONPREMMODEL = 'DeleteOnPremModel';
const DELETE_CLOUD_MODEL = 'DeleteCloudModel';
const DELETE_SOURCE_SOFTWARE_MODEL = 'DeleteSourceSoftwareModel';
const CREATE_SOURCE_SOFTWARE_MODEL = 'CreateSourceSoftwareModel';

export function useGetSourceModelList() {
  const requestWrapper: Required<Pick<RequestBodyWrapper<any>, 'pathParams'>> =
    {
      pathParams: { isTargetModel: 'false' },
    };
  return useAxiosPost<
    IAxiosResponse<ISourceModelResponse[]>,
    Required<Pick<RequestBodyWrapper<any>, 'pathParams'>>
  >(GET_SOURCE_MODEL_LIST, requestWrapper);
}

interface ICreateSourceModelPayload {
  onpremiseInfraModel: ISourceModelResponse['onpremiseInfraModel'];
  description: string;
  isInitUserModel: true;
  userId: string;
  userModelName: string;
  userModelVersion: string;
}
export function useUpdateSourceModel(
  modelId: string | null,
  requestData: ICreateSourceModelPayload | null,
) {
  const requestBodyWrapper: Pick<
    RequestBodyWrapper<
      Partial<{
        id: string | null;
        requestData: ICreateSourceModelPayload | null;
      }>
    >,
    'pathParams' | 'request'
  > = {
    pathParams: {
      id: modelId,
    },
    request: { requestData },
  };

  return useAxiosPost<
    IAxiosResponse<ISourceConnectionResponse>,
    Pick<
      RequestBodyWrapper<
        Partial<{
          id: string | null;
          requestData: ICreateSourceModelPayload | null;
        }>
      >,
      'pathParams' | 'request'
    >
  >(UPDATE_SOURCE_MODEL, requestBodyWrapper);
}

export function useCreateOnpremmodel(data: IOnpremModelPayload | null) {
  const requestWrapper: Required<
    Pick<RequestBodyWrapper<IOnpremModelPayload | null>, 'request'>
  > = {
    request: data,
  };
  return useAxiosPost<
    IAxiosResponse<any>,
    Required<Pick<RequestBodyWrapper<IOnpremModelPayload | null>, 'request'>>
  >(CREATE_ONPREMMODEL, requestWrapper);
}

interface ICreateSourceSoftwareModelPayload {
  description: string;
  isInitUserModel: boolean;
  sourceSoftwareModel: any;
  userId: string;
  userModelName: string;
  userModelVersion: string;
}

export function useCreateSourceSoftwareModel(data: ICreateSourceSoftwareModelPayload | null) {
  const requestWrapper: Required<
    Pick<RequestBodyWrapper<ICreateSourceSoftwareModelPayload | null>, 'request'>
  > = {
    request: data,
  };
  return useAxiosPost<
    IAxiosResponse<any>,
    Required<Pick<RequestBodyWrapper<ICreateSourceSoftwareModelPayload | null>, 'request'>>
  >(CREATE_SOURCE_SOFTWARE_MODEL, requestWrapper);
}

/**
 * Delete source software models in bulk
 * 소스 소프트웨어 모델들을 일괄 삭제합니다.
 * 
 * @param {string[]} modelIds - Array of model IDs to delete / 삭제할 모델 ID 배열
 * @returns {Promise<any[]>} Promise resolving to array of delete responses / 삭제 응답 배열을 반환하는 Promise
 * 
 * @example
 * const result = await useBulkDeleteSourceSoftwareModel(['model1', 'model2']);
 */
export function useBulkDeleteSourceSoftwareModel(modelIds: string[]) {
  const promiseArr = modelIds.map(modelId => {
    return axiosInstance.post(DELETE_SOURCE_SOFTWARE_MODEL, {
      pathParams: {
        id: modelId,
      },
    });
  });

  return Promise.all(promiseArr);
}

/**
 * Delete source infra models in bulk (legacy function)
 * 소스 인프라 모델들을 일괄 삭제합니다. (기존 함수)
 * 
 * @param {string[]} modelIds - Array of model IDs to delete / 삭제할 모델 ID 배열
 * @returns {Promise<any[]>} Promise resolving to array of delete responses / 삭제 응답 배열을 반환하는 Promise
 * 
 * @example
 * const result = await useBulkDeleteSourceInfraModel(['model1', 'model2']);
 */
export function useBulkDeleteSourceInfraModel(modelIds: string[]) {
  const promiseArr = modelIds.map(modelId => {
    return axiosInstance.post(DELETE_ONPREMMODEL, {
      pathParams: {
        id: modelId,
      },
    });
  });

  return Promise.all(promiseArr);
}

/**
 * Delete source cloud models in bulk
 * 소스 클라우드 모델들을 일괄 삭제합니다.
 * 
 * @param {string[]} modelIds - Array of model IDs to delete / 삭제할 모델 ID 배열
 * @returns {Promise<any[]>} Promise resolving to array of delete responses / 삭제 응답 배열을 반환하는 Promise
 * 
 * @example
 * const result = await useBulkDeleteSourceCloudModel(['model1', 'model2']);
 */
export function useBulkDeleteSourceCloudModel(modelIds: string[]) {
  const promiseArr = modelIds.map(modelId => {
    return axiosInstance.post(DELETE_CLOUD_MODEL, {
      pathParams: {
        id: modelId,
      },
    });
  });

  return Promise.all(promiseArr);
}

// Legacy function name for backward compatibility
export function useBulkAddWorkspaceList(modelIds: string[]) {
  return useBulkDeleteSourceInfraModel(modelIds);
}
