import {
  IAxiosResponse,
  RequestBodyWrapper,
  useAxiosPost,
} from '@/shared/libs';
import { ISourceConnectionResponse } from '@/entities/sourceConnection/model/types.ts';

const GET_SOURCE_CONNECTION_LIST = 'list-connection-info';

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
