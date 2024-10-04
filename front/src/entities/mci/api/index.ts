import {
  IAxiosResponse,
  RequestBodyWrapper,
  useAxiosPost,
} from '../../../shared/libs';
import { IMci } from '../model';

export interface IMciRequestParams {
  nsId: string | null;
  mciId: string | null;
}

const GET_ALL_MCI = 'GetAllMci';
const GET_MCI_INFO = 'GetMci';

export function useGetMciList(projectId: string | null) {
  const requestBodyWrapper: Required<
    Pick<RequestBodyWrapper<Pick<IMciRequestParams, 'nsId'>>, 'pathParams'>
  > = {
    pathParams: {
      nsId: projectId,
    },
  };

  return useAxiosPost<
    IAxiosResponse<IMci[]>,
    Required<
      Pick<RequestBodyWrapper<Pick<IMciRequestParams, 'nsId'>>, 'pathParams'>
    >
  >(GET_ALL_MCI, requestBodyWrapper);
}

export function useGetMciInfo(params: IMciRequestParams | null) {
  const requestBodyWrapper: Required<
    Pick<RequestBodyWrapper<IMciRequestParams>, 'pathParams'>
  > = {
    pathParams: {
      nsId: params?.nsId || null,
      mciId: params?.mciId || null,
    },
  };

  return useAxiosPost<
    IAxiosResponse<IMci>,
    Required<Pick<RequestBodyWrapper<IMciRequestParams>, 'pathParams'>>
  >(GET_MCI_INFO, requestBodyWrapper);
}
