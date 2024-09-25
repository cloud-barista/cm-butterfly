import {
  IAxiosResponse,
  RequestBodyWrapper,
  useAxiosPost,
} from '@/shared/libs';
import {
  ISourceConnectionResponse,
  ISourceInfraInfoResponse,
  ISourceSoftwareCollectResponse,
} from '@/entities/sourceConnection/model/types.ts';

const GET_SOURCE_CONNECTION_LIST = 'list-connection-info';
const COLLECT_INFRA = 'import-infra';
const COLLECT_SW = 'import-software';
const DELETE_SOURCE_CONNECTION = 'delete-connection-info';
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

export function useCollectSW(id: params | null) {
  const requestWrapper: Required<
    Pick<RequestBodyWrapper<params | null>, 'pathParams'>
  > = {
    pathParams: { sgId: id?.sgId || null, connId: id?.connId || null },
  };

  return useAxiosPost<
    IAxiosResponse<ISourceSoftwareCollectResponse>,
    Required<Pick<RequestBodyWrapper<params | null>, 'pathParams'>>
  >(COLLECT_SW, requestWrapper);
}

export function useDeleteSourceConnection(params: params | null) {
  const requestWrapper: Required<
    Pick<RequestBodyWrapper<params | null>, 'pathParams'>
  > = {
    pathParams: {
      sgId: params?.sgId || null,
      connId: params?.connId || null,
    },
  };

  return useAxiosPost<
    IAxiosResponse<null>,
    Required<Pick<RequestBodyWrapper<params | null>, 'pathParams'>>
  >(DELETE_SOURCE_CONNECTION, requestWrapper);
}
