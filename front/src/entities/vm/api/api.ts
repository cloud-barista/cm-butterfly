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
} from '@/entities/workspace/model/types';
import {
  ILoadTestScenarioCatalog,
  ILoadTestScenarioCatalogsResponse,
  ICreateLoadTestScenarioCatalogRequest,
  IUpdateLoadTestScenarioCatalogRequest,
} from '@/entities/vm/model/types';

const RUN_LOAD_TEST = 'Runloadtest';
const GET_LAST_LOAD_TEST_CONFIG = 'Getlastloadtestexecutionstate';
const GET_LOAD_TEST_EVALUATION_DATA = 'Getlastloadtestresult';
const GET_LOAD_TEST_RESOURCE_METRIC = 'Getlastloadtestmetrics';

// Load Test Scenario Catalog API endpoints
const GET_ALL_LOAD_TEST_SCENARIO_CATALOGS = 'GetAllLoadTestScenarioCatalogs';
const GET_LOAD_TEST_SCENARIO_CATALOG = 'GetLoadTestScenarioCatalog';
const CREATE_LOAD_TEST_SCENARIO_CATALOG = 'CreateLoadTestScenarioCatalog';
const UPDATE_LOAD_TEST_SCENARIO_CATALOG = 'UpdateLoadTestScenarioCatalog';
const DELETE_LOAD_TEST_SCENARIO_CATALOG = 'DeleteLoadTestScenarioCatalog';

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

// Load Test Scenario Catalog API Functions

/**
 * Get all load test scenario catalogs
 * 모든 로드 테스트 시나리오 카탈로그를 조회합니다.
 */
export function useGetAllLoadTestScenarioCatalogs() {
  return useAxiosPost<IAxiosResponse<ILoadTestScenarioCatalogsResponse>, null>(
    GET_ALL_LOAD_TEST_SCENARIO_CATALOGS,
    null,
  );
}

/**
 * Get a specific load test scenario catalog by ID
 * ID로 특정 로드 테스트 시나리오 카탈로그를 조회합니다.
 */
export function useGetLoadTestScenarioCatalog(catalogId: number | null) {
  const requestBodyWrapper: Required<
    Pick<RequestBodyWrapper<{ id: string | null }>, 'pathParams'>
  > = {
    pathParams: {
      id: catalogId?.toString() || null,
    },
  };

  return useAxiosPost<
    IAxiosResponse<ILoadTestScenarioCatalog>,
    Required<Pick<RequestBodyWrapper<{ id: string | null }>, 'pathParams'>>
  >(GET_LOAD_TEST_SCENARIO_CATALOG, requestBodyWrapper);
}

/**
 * Create a new load test scenario catalog
 * 새로운 로드 테스트 시나리오 카탈로그를 생성합니다.
 */
export function useCreateLoadTestScenarioCatalog(
  data: ICreateLoadTestScenarioCatalogRequest | null,
) {
  const requestBodyWrapper: Required<
    Pick<
      RequestBodyWrapper<ICreateLoadTestScenarioCatalogRequest | null>,
      'request'
    >
  > = {
    request: data,
  };

  return useAxiosPost<
    IAxiosResponse<ILoadTestScenarioCatalog>,
    Required<
      Pick<
        RequestBodyWrapper<ICreateLoadTestScenarioCatalogRequest | null>,
        'request'
      >
    >
  >(CREATE_LOAD_TEST_SCENARIO_CATALOG, requestBodyWrapper);
}

/**
 * Update a load test scenario catalog
 * 로드 테스트 시나리오 카탈로그를 업데이트합니다.
 */
export function useUpdateLoadTestScenarioCatalog(
  catalogId: number | null,
  data: IUpdateLoadTestScenarioCatalogRequest | null,
) {
  const requestBodyWrapper: Required<
    Pick<
      RequestBodyWrapper<{
        id: string | null;
      }>,
      'pathParams'
    > &
      Pick<
        RequestBodyWrapper<IUpdateLoadTestScenarioCatalogRequest | null>,
        'request'
      > &
      Pick<RequestBodyWrapper<any>, 'queryParams'>
  > = {
    pathParams: {
      id: catalogId?.toString() || null,
    },
    queryParams: {},
    request: data,
  };

  return useAxiosPost<
    IAxiosResponse<ILoadTestScenarioCatalog>,
    Required<
      Pick<
        RequestBodyWrapper<{
          id: string | null;
        }>,
        'pathParams'
      > &
        Pick<
          RequestBodyWrapper<IUpdateLoadTestScenarioCatalogRequest | null>,
          'queryParams'
        > &
        Pick<RequestBodyWrapper<any>, 'request'>
    >
  >(UPDATE_LOAD_TEST_SCENARIO_CATALOG, requestBodyWrapper);
}

/**
 * Delete a load test scenario catalog
 * 로드 테스트 시나리오 카탈로그를 삭제합니다.
 */
export function useDeleteLoadTestScenarioCatalog(catalogId: number | null) {
  const requestBodyWrapper: Required<
    Pick<RequestBodyWrapper<{ id: string | null }>, 'pathParams'> &
      Pick<RequestBodyWrapper<any>, 'queryParams' | 'request'>
  > = {
    pathParams: {
      id: catalogId?.toString() || null,
    },
    queryParams: {},
    request: null,
  };

  return useAxiosPost<
    IAxiosResponse<any>,
    Required<
      Pick<RequestBodyWrapper<{ id: string | null }>, 'pathParams'> &
        Pick<RequestBodyWrapper<any>, 'queryParams' | 'request'>
    >
  >(DELETE_LOAD_TEST_SCENARIO_CATALOG, requestBodyWrapper);
}
