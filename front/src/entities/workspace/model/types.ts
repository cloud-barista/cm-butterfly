export interface IWorkspaceDeleteData {
  userId: string;
  workspaceId: string;
}

export interface IWorkspaceDetailData {
  role: {
    created_at: string;
    description: string;
    id: string;
    name: string;
    policy: string;
    updated_at: string;
  };
  workspaceProject: {
    projects: Array<{
      created_at: string;
      description: string | null;
      id: string;
      name: string;
      ns_id: string;
      updated_at: string;
    }>;
    workspace: IWorkspaceData;
  };
}

export interface IWorkspaceData {
  created_at: string;
  description: string;
  id: string;
  name: string;
  updated_at: string;
}

export interface IEditWorkspaceData {
  name: string;
  workspaceId: string;
  roleId: string;
}

export interface IWorkspaceRoleResponse {
  roles: [
    {
      name: string;
      id: string;
    },
  ];
}

interface IResourceMetric {
  IsError: boolean;
  Timestamp: string;
  Unit: string;
  Value: string;
}

export interface IResourceMetricData {
  Label: string;
  Metrics: IResourceMetric[];
}

export interface IGetlastloadtestmetricsResponse {
  result: IResourceMetricData[];
}

interface IEvaluateMetric {
  Bytes: number;
  Connection: number;
  Elapsed: number;
  IdleTime: number;
  IsError: boolean;
  Latency: number;
  No: number;
  SentBytes: number;
  Timestamp: string;
  URL: string;
}

export interface IEvaluateMetricData {
  Label: string;
  Results: IEvaluateMetric[];
}

export interface IGetLoadTestEvaluationDataResponse {
  result: IEvaluateMetricData[];
}

export interface ILoadTestResultAggregateResponse {
  average: number;
  errorPercent: number;
  label: string;
  maxTime: number;
  median: number;
  minTime: number;
  ninetyFive: number;
  ninetyNine: number;
  ninetyPercent: number;
  receivedKB: number;
  requestCount: number;
  sentKB: number;
  throughput: number;
}

export type LoadTestResultAggregateTableType =
  | 'average'
  | 'errorPercent'
  | 'label'
  | 'maxTime'
  | 'median'
  | 'minTime'
  | 'ninetyFive'
  | 'ninetyNine'
  | 'ninetyPercent'
  | 'receivedKB'
  | 'requestCount'
  | 'sentKB'
  | 'throughput';
