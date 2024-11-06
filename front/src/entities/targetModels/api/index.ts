import {
  IAxiosResponse,
  RequestBodyWrapper,
  useAxiosPost,
} from '@/shared/libs';
import { IRecommendModelResponse } from '@/entities/recommendedModel/model/types.ts';
import { ITargetModelResponse } from '@/entities';

const CREATE_TARGET_MODEL = 'CreateCloudModel';
const GET_SOURCE_MODEL_LIST = 'GetUserModel';

interface ICreateTargetModelPayload {
  cloudInfraModel: IRecommendModelResponse['targetInfra'];
  csp: string;
  description: string;
  isInitUserModel: true;
  isTargetModel: true;
  region: string;
  userId: string;
  userModelName: string;
  userModelVersion: string;
  zone: string;
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
