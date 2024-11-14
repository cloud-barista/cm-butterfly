import {
  IAxiosResponse,
  RequestBodyWrapper,
  useAxiosPost,
} from '../../../shared/libs';
import {
  ILastloadtestStateResponse,
  IMci,
  IRunLoadTestRequest,
  MciResponseData,
} from '@/entities/mci/model';

export interface IMciRequestParams {
  nsId: string | null;
  mciId: string | null;
  option?: string | null;
}

const GET_ALL_MCI = 'GetAllMci';
const GET_MCI_INFO = 'GetMci';
const RUN_LOAD_TEST = 'Runloadtest';
const GET_LAST_LOAD_TEST_CONFIG = 'Getlastloadtestexecutionstate';

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

export function useRunLoadTest(requestPayload: IRunLoadTestRequest | null) {
  const requestBodyWrapper: Required<
    Pick<RequestBodyWrapper<IRunLoadTestRequest | null>, 'request'>
  > = {
    request: requestPayload,
  };

  return useAxiosPost<
    IAxiosResponse<IRunLoadTestRequest>,
    Required<Pick<RequestBodyWrapper<IMciRequestParams | null>, 'request'>>
  >(RUN_LOAD_TEST, requestBodyWrapper);
}

interface ILastloadtestStateResponseWrapper {
  result: ILastloadtestStateResponse;
}

export function useGetLastLoadTestState(
  params: IMciRequestParams | { vmId: string } | null,
) {
  const requestBodyWrapper: Required<
    Pick<
      RequestBodyWrapper<IMciRequestParams | { vmId: string } | null>,
      'request'
    >
  > = {
    request: params,
  };

  return useAxiosPost<
    IAxiosResponse<ILastloadtestStateResponseWrapper>,
    Required<
      Pick<
        RequestBodyWrapper<IMciRequestParams | { vmId: string } | null>,
        'request'
      >
    >
  >(GET_LAST_LOAD_TEST_CONFIG, requestBodyWrapper);
}
