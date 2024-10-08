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
import { axiosInstance } from '@/shared/libs/api/instance.ts';

const CREATE_SOURCE_CONNECTION = 'create-connection-info';
const GET_SOURCE_CONNECTION_LIST = 'list-connection-info';
const COLLECT_INFRA = 'import-infra';
const COLLECT_SW = 'import-software';
const DELETE_SOURCE_CONNECTION = 'delete-connection-info';

export function useCreateConnectionInfo(sgId: string, requestData: null | any) {
  const requestBodyWrapper = {
    pathParams: {
      sgId: sgId || null,
    },
    request: requestData,
  };

  return useAxiosPost(CREATE_SOURCE_CONNECTION, requestBodyWrapper);
}
export function useGetSourceConnectionList(sourceGroupId: string | null) {
  const requestWrapper: Required<
    Pick<RequestBodyWrapper<{ sgId: string | null }>, 'pathParams'>
  > = {
    pathParams: { sgId: sourceGroupId },
  };

  return useAxiosPost<
    IAxiosResponse<ISourceConnectionResponse>,
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

export function useBulkDeleteSourceConnection(params: params[]) {
  const promiseArr = params.map(param => {
    return axiosInstance.post(DELETE_SOURCE_CONNECTION, {
      pathParams: {
        sgId: param.sgId,
        connId: param.connId,
      },
    });
  });

  return Promise.all(promiseArr);
}
