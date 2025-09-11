import {
  IAxiosResponse,
  RequestBodyWrapper,
  useAxiosPost,
} from '@/shared/libs';
import {
  ISourceConnectionInfo,
  ISourceConnectionResponse,
  ISourceInfraInfoResponse,
  ISourceSoftwareCollectResponse,
} from '@/entities/sourceConnection/model/types';
import { axiosInstance } from '@/shared/libs/api/instance';

const CREATE_SOURCE_CONNECTION = 'create-connection-info';
const UPDATE_SOURCE_CONNECTION = 'update-connection-info';
const GET_SOURCE_CONNECTION_LIST = 'list-connection-info';
const COLLECT_INFRA = 'import-infra';
const COLLECT_SW = 'import-software';
const COLLECT_SW_SOURCE_GROUP = 'import-software-source-group';
const DELETE_SOURCE_CONNECTION = 'delete-connection-info';
const REFRESH_SOURCE_GROUP_CONNECTION_INFO_STATUS =
  'Refresh-Source-Group-Connection-Info-Status';
const GET_INFRA_INFO_REFINED = 'get-infra-info-refined';
const GET_SOFTWARE_INFO_REFINED = 'get-software-info-refined';

export function useCreateConnectionInfo(
  sgId: string | null,
  requestData: null | ISourceConnectionInfo,
) {
  const requestBodyWrapper: Pick<
    RequestBodyWrapper<{
      sgId: string | null;
      requestData: null | ISourceConnectionInfo;
    }>,
    'pathParams' & 'request'
  > = {
    pathParams: {
      sgId: sgId || null,
    },
    request: requestData,
  };

  return useAxiosPost<
    IAxiosResponse<ISourceConnectionResponse>,
    Pick<
      RequestBodyWrapper<{
        sgId: string | null;
        connId: string | null;
      }>,
      'pathParams' & 'request'
    >
  >(CREATE_SOURCE_CONNECTION, requestBodyWrapper);
}

export function useUpdateConnectionInfo(
  sgId: string | null,
  connId: string | null,
  requestData: null | any,
) {
  const requestBodyWrapper: Pick<
    RequestBodyWrapper<{
      sgId: string | null;
      connId: string | null;
    }>,
    'pathParams' & 'request'
  > = {
    pathParams: {
      sgId: sgId || null,
      connId: connId || null,
    },
    request: requestData,
  };

  return useAxiosPost<
    IAxiosResponse<ISourceConnectionResponse>,
    Pick<
      RequestBodyWrapper<{
        sgId: string | null;
        connId: string | null;
      }>,
      'pathParams' & 'request'
    >
  >(UPDATE_SOURCE_CONNECTION, requestBodyWrapper);
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

export function useCollectSWSourceGroup(sgId: string | null) {
  const requestWrapper: Required<
    Pick<RequestBodyWrapper<{ sgId: string | null }>, 'pathParams'>
  > = {
    pathParams: { sgId: sgId || null },
  };

  return useAxiosPost<
    IAxiosResponse<ISourceSoftwareCollectResponse>,
    Required<Pick<RequestBodyWrapper<{ sgId: string | null }>, 'pathParams'>>
  >(COLLECT_SW_SOURCE_GROUP, requestWrapper);
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

export function useRefreshSourceGroupConnectionInfoStatus(sgId: string | null) {
  const requestWrapper: Required<
    Pick<RequestBodyWrapper<{ sgId: string | null }>, 'pathParams'>
  > = {
    pathParams: { sgId: sgId || null },
  };

  return useAxiosPost<
    IAxiosResponse<{ message: string }>,
    Required<Pick<RequestBodyWrapper<{ sgId: string | null }>, 'pathParams'>>
  >(REFRESH_SOURCE_GROUP_CONNECTION_INFO_STATUS, requestWrapper);
}

export function useGetInfraInfoRefined(
  sgId: string | null,
  connId: string | null,
) {
  const requestWrapper: Required<
    Pick<
      RequestBodyWrapper<{
        sgId: string | null;
        connId: string | null;
      }>,
      'pathParams'
    >
  > = {
    pathParams: {
      sgId,
      connId,
    },
  };
  return useAxiosPost<
    IAxiosResponse<any>,
    Required<
      Pick<
        RequestBodyWrapper<{
          sgId: string | null;
          connId: string | null;
        }>,
        'pathParams'
      >
    >
  >(GET_INFRA_INFO_REFINED, requestWrapper);
}

export function useGetSoftwareInfoRefined(
  sgId: string | null,
  connId: string | null,
) {
  const requestWrapper: Required<
    Pick<
      RequestBodyWrapper<{
        sgId: string | null;
        connId: string | null;
      }>,
      'pathParams'
    >
  > = {
    pathParams: {
      sgId,
      connId,
    },
  };
  return useAxiosPost<
    IAxiosResponse<any>,
    Required<
      Pick<
        RequestBodyWrapper<{
          sgId: string | null;
          connId: string | null;
        }>,
        'pathParams'
      >
    >
  >(GET_SOFTWARE_INFO_REFINED, requestWrapper);
}
