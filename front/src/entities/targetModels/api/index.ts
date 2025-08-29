import {
  IAxiosResponse,
  RequestBodyWrapper,
  useAxiosPost,
} from '@/shared/libs';
import { IRecommendModelResponse } from '@/entities/recommendedModel/model/types.ts';
import { ITargetModelResponse } from '@/entities';
import { ISourceConnectionResponse } from '@/entities/sourceConnection/model/types.ts';

const CREATE_TARGET_MODEL = 'CreateCloudModel';
const CREATE_TARGET_SOFTWARE_MODEL = 'CreateTargetSoftwareModel';
const GET_SOURCE_MODEL_LIST = 'GetModels';
const UPDATE_TARGET_MODEL = 'UpdateCloudModel';

interface ICreateTargetModelPayload {
  cloudInfraModel: IRecommendModelResponse['targetInfra'];
  csp: string;
  description: string;
  isInitUserModel: boolean;
  isTargetModel: true;
  region: string;
  userId: string;
  userModelName: string;
  userModelVersion: string;
  zone: string;
}

interface ICreateTargetSoftwareModelPayload {
  description: string;
  isInitUserModel: boolean;
  targetSoftwareModel: any;
  userId: string;
  userModelName: string;
  userModelVersion: string;
}

export function createTargetModel(data: ICreateTargetModelPayload | null) {
  const requestWrapper: Required<
    Pick<RequestBodyWrapper<ICreateTargetModelPayload | null>, 'request'>
  > = {
    request: data,
  };
  return useAxiosPost<
    IAxiosResponse<any>,
    Required<
      Pick<RequestBodyWrapper<ICreateTargetModelPayload | null>, 'request'>
    >
  >(CREATE_TARGET_MODEL, requestWrapper);
}

export function createTargetSoftwareModel(data: ICreateTargetSoftwareModelPayload | null) {
  const requestWrapper: Required<
    Pick<RequestBodyWrapper<ICreateTargetSoftwareModelPayload | null>, 'request'>
  > = {
    request: data,
  };
  return useAxiosPost<
    IAxiosResponse<any>,
    Required<
      Pick<RequestBodyWrapper<ICreateTargetSoftwareModelPayload | null>, 'request'>
    >
  >(CREATE_TARGET_SOFTWARE_MODEL, requestWrapper);
}

export function useGetTargetModelList() {
  const requestWrapper: Required<Pick<RequestBodyWrapper<any>, 'pathParams'>> =
    {
      pathParams: { isTargetModel: 'true' },
    };
  return useAxiosPost<
    IAxiosResponse<ITargetModelResponse[]>,
    Required<Pick<RequestBodyWrapper<any>, 'pathParams'>>
  >(GET_SOURCE_MODEL_LIST, requestWrapper);
}

export function useUpdateTargetModel(
  modelId: string | null,
  requestData: ICreateTargetModelPayload | null,
) {
  const requestBodyWrapper: Pick<
    RequestBodyWrapper<
      Partial<{
        id: string | null;
        requestData: ICreateTargetModelPayload | null;
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
          requestData: ICreateTargetModelPayload | null;
        }>
      >,
      'pathParams' | 'request'
    >
  >(UPDATE_TARGET_MODEL, requestBodyWrapper);
}
