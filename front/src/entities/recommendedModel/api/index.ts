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
const GET_RECOMMEND_CANDIDATES = 'RecommendVmInfraCandidates';
const GET_RECOMMEND_COST = 'Updateandgetestimatecost';

export function useGetRecommendModelListBySourceModel(
  sourceModelInfo: ISourceModelResponse['onpremiseInfraModel'] | null,
  provider: string | null,
  region: string | null,
) {
  const requestWrapper: Required<
    Pick<
      RequestBodyWrapper<{
        desiredCspAndRegionPair: {
          csp: string | null;
          region: string | null;
        };
        onpremiseInfraModel: ISourceModelResponse['onpremiseInfraModel'] | null;
      }>,
      'request'
    >
  > = {
    request: {
      desiredCspAndRegionPair: {
        csp: provider,
        region: region,
      },
      onpremiseInfraModel: sourceModelInfo,
    },
  };
  return useAxiosPost<
    IAxiosResponse<IRecommendModelResponse>,
    Required<
      Pick<
        RequestBodyWrapper<{
          desiredCspAndRegionPair: {
            csp: string | null;
            region: string | null;
          };
          onpremiseInfraModel:
            | ISourceModelResponse['onpremiseInfraModel']
            | null;
        }>,
        'request'
      >
    >
  >(GET_RECOMMEND_MODEL, requestWrapper);
}

export function useGetRecommendModelCandidates(
  sourceModelInfo: ISourceModelResponse['onpremiseInfraModel'] | null,
  provider: string | null,
  region: string | null,
  limit?: number | null,
  minMatchRate?: number | string | null,
) {
  // Query parameters 구성 - 모두 문자열로 변환 (backend의 map[string]string)
  const queryParams: Record<string, string> = {};
  if (provider) queryParams.desiredCsp = provider;
  if (region) queryParams.desiredRegion = region;
  if (limit !== null && limit !== undefined) queryParams.limit = String(limit);
  if (minMatchRate !== null && minMatchRate !== undefined) {
    queryParams.minMatchRate = String(minMatchRate);
  }

  const requestWrapper = {
    request: {
      desiredCspAndRegionPair: {
        csp: provider,
        region: region,
      },
      onpremiseInfraModel: sourceModelInfo,
    },
    queryParams: queryParams, // body에 queryParams 포함
  };

  return useAxiosPost<
    IAxiosResponse<{ data: IRecommendModelResponse[] }>,
    typeof requestWrapper
  >(GET_RECOMMEND_CANDIDATES, requestWrapper);
}

interface ISpecFormat {
  specId: string;
  imageId: string;
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
