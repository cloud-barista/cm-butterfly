import {
  useAxiosPost,
  IAxiosResponse,
  RequestBodyWrapper,
} from '@/shared/libs';
import type { ISourceGroup } from '../model';

const REGISTER_SOURCE_GROUP = 'register-source-group';

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
