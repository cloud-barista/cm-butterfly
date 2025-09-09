import { ISourceModelResponse } from '@/entities';
import {
  IAxiosResponse,
  RequestBodyWrapper,
  useAxiosPost,
} from '@/shared/libs';
import {
  IEsimateCostSpecResponse,
  IRecommendModelResponse,
} from '@/entities/recommendedModel/model/types';

//const GET_RECOMMEND_MODEL = 'RecommendInfra';
const GET_RECOMMEND_MODEL = 'RecommendVMInfra';
const GET_RECOMMEND_COST = 'Updateandgetestimatecost';

export function useGetRecommendModelListBySourceModel(
  sourceModelInfo: ISourceModelResponse['onpremiseInfraModel'] | null,
  provider: string | null,
  region: string | null,
) {
  const requestWrapper: Required<
    Pick<
      RequestBodyWrapper<{
        desiredProvider: string | null;
        desiredRegion: string | null;
        onpremiseInfraModel: ISourceModelResponse['onpremiseInfraModel'] | null;
      }>,
      'request'
    >
  > = {
    request: {
      desiredProvider: provider,
      desiredRegion: region,
      onpremiseInfraModel: sourceModelInfo,
    },
  };
  return useAxiosPost<
    IAxiosResponse<IRecommendModelResponse>,
    Required<
      Pick<
        RequestBodyWrapper<{
          desiredProvider: string | null;
          desiredRegion: string | null;
          onpremiseInfraModel:
            | ISourceModelResponse['onpremiseInfraModel']
            | null;
        }>,
        'request'
      >
    >
  >(GET_RECOMMEND_MODEL, requestWrapper);
}

interface ISpecFormat {
  commonSpec: string;
  commonImage: string;
}

export function getRecommendCost(specsWithFormat: ISpecFormat[] | null) {
  const requestWrapper: Required<
    Pick<
      RequestBodyWrapper<{ specsWithFormat: ISpecFormat[] | null }>,
      'request'
    >
  > = {
    request: {
      specsWithFormat: specsWithFormat,
    },
  };
  return useAxiosPost<
    IAxiosResponse<IEsimateCostSpecResponse>,
    Required<
      Pick<
        RequestBodyWrapper<{ specsWithFormat: ISpecFormat[] | null }>,
        'request'
      >
    >
  >(GET_RECOMMEND_COST, requestWrapper);
}
