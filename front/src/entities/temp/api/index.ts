import {
  useAxiosPost,
  IAxiosResponse,
  RequestBodyWrapper,
} from '@/shared/libs';
import type { ISourceGroup, ISourceConnection } from '../model';

const REGISTER_SOURCE_GROUP = 'cm-honeybee/register-source-group';
const CREATE_SOURCE_CONNECTION = 'create-connection-info';

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

export function useCreateConnectionInfo(sgId: string, requestData: null | any) {
  // const requestBodyWrapper: Required<
  //   Pick<RequestBodyWrapper<Pick<any, 'sgId'>>, 'pathParams'>
  // >
  console.log(requestData);
  const requestBodyWrapper = {
    pathParams: {
      sgId: sgId || null,
    },
    request: requestData,
  };

  return useAxiosPost(CREATE_SOURCE_CONNECTION, requestBodyWrapper);
}
