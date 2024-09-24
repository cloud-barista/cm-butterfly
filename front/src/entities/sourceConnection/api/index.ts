import {
  IAxiosResponse,
  RequestBodyWrapper,
  useAxiosPost,
} from '@/shared/libs';
import {
  ISourceConnectionResponse,
  ISourceInfraInfoResponse,
} from '@/entities/sourceConnection/model/types.ts';

const GET_SOURCE_CONNECTION_LIST = 'list-connection-info';
const COLLECT_INFRA = 'import-infra';

export function useGetSourceConnectionList(sourceGroupId: string | null) {
  const requestWrapper: Required<
    Pick<RequestBodyWrapper<{ sgId: string | null }>, 'pathParams'>
  > = {
    pathParams: { sgId: sourceGroupId },
  };

  return useAxiosPost<
    IAxiosResponse<ISourceConnectionResponse[]>,
    Required<Pick<RequestBodyWrapper<{ sgId: string | null }>, 'pathParams'>>
  >(GET_SOURCE_CONNECTION_LIST, requestWrapper);
}

interface params {
  sgId: string | null;
  connId: string | null;
}

export function useCollectInfra(id: params | null) {
  const requestWrapper: Required<
    Pick<RequestBodyWrapper<params | null>, 'pathParams'>
  > = {
    pathParams: { sgId: id?.sgId || null, connId: id?.connId || null },
  };

  return useAxiosPost<
    IAxiosResponse<ISourceInfraInfoResponse>,
    Required<Pick<RequestBodyWrapper<params | null>, 'pathParams'>>
  >(COLLECT_INFRA, requestWrapper);
}
