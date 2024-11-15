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
import {
  IGetlastloadtestmetricsResponse,
  IGetLoadTestEvaluationDataResponse,
  ILoadTestResultAggregateResponse,
} from '@/entities/workspace/model/types.ts';
const RUN_LOAD_TEST = 'Runloadtest';
const GET_LAST_LOAD_TEST_CONFIG = 'Getlastloadtestexecutionstate';
const GET_LOAD_TEST_EVALUATION_DATA = 'Getlastloadtestresult';
const GET_LOAD_TEST_RESOURCE_METRIC = 'Getlastloadtestmetrics';

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

interface IMetricParams extends IMciRequestParams {
  vmId: string;
  format: 'normal';
}

interface IMetricParamsBase extends IMciRequestParams {
  vmId: string;
}

type FormatType = 'normal' | 'aggregate';

export function useGetLoadTestEvaluationData<T extends FormatType>(
  params: (IMetricParamsBase & { format: T }) | null,
) {
  const requestBodyWrapper: Required<
    Pick<
      RequestBodyWrapper<(IMetricParamsBase & { format: T }) | null>,
      'queryParams'
    >
  > = {
    queryParams: params,
  };

  type ResponseType = T extends 'normal'
    ? IGetLoadTestEvaluationDataResponse
    : ILoadTestResultAggregateResponse;

  return useAxiosPost<
    IAxiosResponse<ResponseType>,
    Required<
      Pick<
        RequestBodyWrapper<(IMetricParamsBase & { format: T }) | null>,
        'queryParams'
      >
    >
  >(GET_LOAD_TEST_EVALUATION_DATA, requestBodyWrapper);
}

export function useGetLoadTestResourceMetric(params: IMetricParams | null) {
  const requestBodyWrapper: Required<
    Pick<RequestBodyWrapper<IMetricParams | null>, 'queryParams'>
  > = {
    queryParams: params,
  };

  return useAxiosPost<
    IAxiosResponse<IGetlastloadtestmetricsResponse>,
    Required<Pick<RequestBodyWrapper<IMetricParams | null>, 'queryParams'>>
  >(GET_LOAD_TEST_RESOURCE_METRIC, requestBodyWrapper);
}
