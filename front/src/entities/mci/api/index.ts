import {
  IAxiosResponse,
  RequestBodyWrapper,
  useAxiosPost,
} from '@/shared/libs';
import { IMci, MciResponseData } from '@/entities/mci/model/types';

export interface IMciRequestParams {
  nsId: string | null;
  mciId: string | null;
  option?: string | null;
}

export interface IDeleteMciParams {
  nsId: string;
  mciId: string;
  option?: string;
}

const GET_ALL_MCI = 'GetAllMci';
const GET_MCI_INFO = 'GetMci';
const DELETE_INFRA = 'DeleteInfra';

export function useGetMciList(projectId: string | null, option: string | null) {
  const requestBodyWrapper: Required<
    Pick<
      RequestBodyWrapper<{ nsId: string | null } | { option: string | null }>,
      'pathParams' | 'queryParams'
    >
  > = {
    pathParams: {
      nsId: projectId,
    },
    queryParams: {
      option: option,
    },
  };

  return useAxiosPost<
    IAxiosResponse<MciResponseData>,
    Required<
      Pick<
        RequestBodyWrapper<{ nsId: string | null } | { option: string | null }>,
        'pathParams' | 'queryParams'
      >
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

export function useDeleteMci(params: IDeleteMciParams) {
  const requestBodyWrapper: any = {
    pathParams: {
      nsId: params.nsId,
      mciId: params.mciId,
    },
  };

  if (params.option) {
    requestBodyWrapper.queryParams = {
      option: params.option,
    };
  }

  return useAxiosPost<IAxiosResponse<any>, any>(
    DELETE_INFRA,
    requestBodyWrapper,
  );
}
