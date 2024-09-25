import {
  IAxiosResponse,
  RequestBodyWrapper,
  useAxiosPost,
} from '@/shared/libs';
import {
  ISourceAgentAndConnectionStatusResponse,
  ISourceServiceResponse,
} from '@/entities/sourceService/model/types.ts';

const GET_SOURCE_SERVICE_LIST = 'list-source-group';
const GET_SOURCE_SERVICE_STATUS = 'GET_SOURCE_SERVICE_STATUS';
const DELETE_SOURCE_SERVICE = 'delete-source-group';

export function useGetSourceServiceList() {
  return useAxiosPost<IAxiosResponse<ISourceServiceResponse>, null>(
    GET_SOURCE_SERVICE_LIST,
    null,
  );
}

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

export function useDeleteSourceGroup(sourceGroupId: string | null) {
  const requestWrapper: Required<
    Pick<RequestBodyWrapper<{ sgId: string | null }>, 'pathParams'>
  > = {
    pathParams: { sgId: sourceGroupId },
  };

  return useAxiosPost<
    IAxiosResponse<null>,
    Required<Pick<RequestBodyWrapper<{ sgId: string | null }>, 'pathParams'>>
  >(DELETE_SOURCE_SERVICE, requestWrapper);
}
