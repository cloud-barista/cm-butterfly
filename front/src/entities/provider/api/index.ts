import {
  IAxiosResponse,
  RequestBodyWrapper,
  useAxiosPost,
} from '@/shared/libs';
import {
  IProviderResponse,
  IRegionOfProviderResponse,
} from '@/entities/provider/model/types';

const GET_PROVIDER_LIST = 'GetProviderList';
const GET_REGION_LIST = 'GetRegions';

export function useGetProviderList() {
  return useAxiosPost<IAxiosResponse<IProviderResponse>, null>(
    GET_PROVIDER_LIST,
    null,
  );
}

export function useGetRegionList(provider: string | null) {
  const requestBodyWrapper: Pick<
    RequestBodyWrapper<{ providerName: string | null }>,
    'pathParams'
  > = {
    pathParams: { providerName: provider },
  };

  return useAxiosPost<
    IAxiosResponse<IRegionOfProviderResponse>,
    Pick<RequestBodyWrapper<{ providerName: string | null }>, 'pathParams'>
  >(GET_REGION_LIST, requestBodyWrapper);
}
