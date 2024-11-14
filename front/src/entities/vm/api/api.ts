import {
  ILastloadtestStateResponse,
  IRunLoadTestRequest,
} from '@/entities/mci/model';
import {
  IAxiosResponse,
  RequestBodyWrapper,
  useAxiosPost,
} from '@/shared/libs';
import { IMciRequestParams } from '@/entities/mci/api';
const RUN_LOAD_TEST = 'Runloadtest';
const GET_LAST_LOAD_TEST_CONFIG = 'Getlastloadtestexecutionstate';
const GET_LOAD_TEST_EVALUATION_DATA = 'Getlastloadtestresult';
const GET_LOAD_TEST_RESULT_METRIC = 'Getloadtestmetrics';

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

// export function useGetLoadTestEvaluationData
