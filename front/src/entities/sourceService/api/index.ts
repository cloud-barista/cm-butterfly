import {
  IAxiosResponse,
  RequestBodyWrapper,
  useAxiosPost,
} from '@/shared/libs';
import {
  IInfraSourceGroupResponse,
  ISourceAgentAndConnectionStatusResponse,
} from '@/entities/sourceService/model/types.ts';
import { axiosInstance } from '@/shared/libs/api/instance.ts';
import type { ISourceGroup } from '@/entities/sourceService/model/types.ts';

const REGISTER_SOURCE_GROUP = 'cm-honeybee/register-source-group';
const UPDATE_SOURCE_GROUP = 'Update-Source-Group';
const GET_SOURCE_SERVICE_LIST = 'list-source-group';
const GET_SOURCE_SERVICE = 'get-source-group';
const GET_SOURCE_SERVICE_STATUS = 'agent-and-connection-check';
const DELETE_SOURCE_SERVICE = 'delete-source-group';
const GET_INFRA_SOURCE_GROUP = 'import-infra-source-group';
const GET_INFRA_INFO_SOURCE_GROUP_REFINE =
  'get-infra-info-source-group-refined';

export function useRegisterSourceGroup<T, D>(
  sourceGroupData: D | ISourceGroup,
) {
  const requestBodyWrapper: Required<
    Pick<RequestBodyWrapper<D | ISourceGroup>, 'request'>
  > = {
    request: sourceGroupData,
  };

  return useAxiosPost<IAxiosResponse<T>, RequestBodyWrapper<D | ISourceGroup>>(
    REGISTER_SOURCE_GROUP,
    requestBodyWrapper,
  );
}

export function useUpdateSourceGroup(
  sourceGroupId: string | null,
  sourceGroupData: { name: string; description: string } | null,
) {
  const requestBodyWrapper = {
    pathParams: {
      sgId: sourceGroupId,
    },
    request: sourceGroupData,
  };

  return useAxiosPost(UPDATE_SOURCE_GROUP, requestBodyWrapper);
}

export function useGetSourceServiceList() {
  return useAxiosPost<IAxiosResponse<any>, null>(GET_SOURCE_SERVICE_LIST, null);
}

export function useGetSourceService(sgId: string | null) {
  const requestBodyWrapper: Required<
    Pick<RequestBodyWrapper<{ sgId: string | null }>, 'pathParams'>
  > = {
    pathParams: {
      sgId: sgId,
    },
  };
  return useAxiosPost<IAxiosResponse<any>, RequestBodyWrapper<any>>(
    GET_SOURCE_SERVICE,
    requestBodyWrapper,
  );
}

// deprecated
export function useGetSourceGroupStatus(sourceGroupId: string | null) {
  const requestWrapper: Required<
    Pick<RequestBodyWrapper<{ sgId: string | null }>, 'pathParams'>
  > = {
    pathParams: { sgId: sourceGroupId },
  };

  return useAxiosPost<
    IAxiosResponse<ISourceAgentAndConnectionStatusResponse>,
    Required<Pick<RequestBodyWrapper<{ sgId: string | null }>, 'pathParams'>>
  >(GET_SOURCE_SERVICE_STATUS, requestWrapper);
}

export function useBulkDeleteSourceGroup(sourceGroupIds: string[]) {
  const promiseArr = sourceGroupIds.map(sourceGroupId => {
    return axiosInstance.post(DELETE_SOURCE_SERVICE, {
      pathParams: {
        sgId: sourceGroupId,
      },
    });
  });

  return Promise.all(promiseArr);
}

export function useGetInfraSourceGroup(sourceGroupId: string | null) {
  const requestWrapper: Required<
    Pick<RequestBodyWrapper<{ sgId: string | null }>, 'pathParams'>
  > = {
    pathParams: { sgId: sourceGroupId },
  };

  return useAxiosPost<
    IAxiosResponse<IInfraSourceGroupResponse>,
    Required<Pick<RequestBodyWrapper<{ sgId: string | null }>, 'pathParams'>>
  >(GET_INFRA_SOURCE_GROUP, requestWrapper);
}

export function useGetInfraSourceGroupInfraRefine(
  sourceGroupId: string | null,
) {
  const requestWrapper: Required<
    Pick<RequestBodyWrapper<{ sgId: string | null }>, 'pathParams'>
  > = {
    pathParams: { sgId: sourceGroupId },
  };

  return useAxiosPost<
    IAxiosResponse<any>,
    Required<Pick<RequestBodyWrapper<{ sgId: string | null }>, 'pathParams'>>
  >(GET_INFRA_INFO_SOURCE_GROUP_REFINE, requestWrapper);
}
