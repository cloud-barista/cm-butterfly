import {
  IAxiosResponse,
  RequestBodyWrapper,
  useAxiosPost,
} from '@/shared/libs';
import {
  IEsimateCostSpecResponse,
  IRecommendModelResponse,
} from '@/entities/recommendedModel/model/types.ts';

const CREATE_TARGET_MODEL = 'CreateCloudModel';

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
