import { ISourceModelResponse } from '@/entities';
import {
  IAxiosResponse,
  RequestBodyWrapper,
  useAxiosPost,
} from '@/shared/libs';
import { IRecommendModelResponse } from '@/entities/recommendedModel/model/types.ts';

const GET_RECOMMAND_MODEL = 'RecommendInfra';
export function useGetRecommendModelListBySourceModel(
  sourceModelInfo: ISourceModelResponse['onpremiseInfraModel'] | null,
) {
  const requestWrapper: Required<
    Pick<
      RequestBodyWrapper<{
        desiredProvider: string;
        desiredRegion: string;
        onpremiseInfraModel: ISourceModelResponse['onpremiseInfraModel'] | null;
      }>,
      'request'
    >
  > = {
    request: {
      desiredProvider: 'aws',
      desiredRegion: 'ap-northeast-2',
      onpremiseInfraModel: sourceModelInfo,
    },
  };
  return useAxiosPost<
    IAxiosResponse<IRecommendModelResponse>,
    Required<
      Pick<
        RequestBodyWrapper<{
          desiredProvider: string;
          desiredRegion: string;
          onpremiseInfraModel:
            | ISourceModelResponse['onpremiseInfraModel']
            | null;
        }>,
        'request'
      >
    >
  >(GET_RECOMMAND_MODEL, requestWrapper);
}
