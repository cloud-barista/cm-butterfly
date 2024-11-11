import {
  IAxiosResponse,
  RequestBodyWrapper,
  useAxiosPost,
} from '@/shared/libs';
import { ISourceConnectionResponse } from '@/entities/sourceConnection/model/types.ts';
import { IRecommendModelResponse } from '@/entities/recommendedModel/model/types.ts';
import { ISourceModelResponse } from '@/entities';

const GET_SOURCE_MODEL_LIST = 'GetUserModel';
const UPDATE_SOURCE_MODEL = 'UpdateOnpremmodel';
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
    request: { ...requestData },
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
