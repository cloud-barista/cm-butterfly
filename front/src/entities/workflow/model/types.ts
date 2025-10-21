export interface IWorkflow {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  data: IWorkflowResponse['data'];
}

export interface IWorkflowResponse {
  data: {
    description: string;
    task_groups: Array<ITaskGroupResponse>;
  };
  name: string;
  id: string;
  created_at: any;
  updated_at: any;
}

export interface ITaskGroupResponse {
  description: string;
  name: string;
  id?: string;
  tasks: Array<ITaskResponse>;
  task_groups?: Array<ITaskGroupResponse>;
}

export interface ITaskResponse {
  dependencies: any[];
  name: string;
  path_params?: any;
  request_body: string;
  task_component: string;
  query_params?: any;
  id?: string;
}

export interface ITaskComponentResponse {
  created_at: any;
  data: {
    option: any;
    param_option: any;
  };
  id: string;
  name: string;
  updated_at: any;
}

export interface ITaskComponent {
  created_at: any;
  updated_at: any;
  data: object;
  id: string;
  name: string;
}

export type TWorkflowTableType = 'name' | 'id' | 'description';

export type WorkflowTableType =
  | TWorkflowTableType
  | 'run'
  | 'created_at'
  | 'updated_at'
  | 'workflowTool'
  | 'workflowJSON';

export type WorkflowTemplateTableType =
  | TWorkflowTableType
  | 'workflowTemplateJSON';

export type TaskComponentTableType =
  | TWorkflowTableType
  | 'taskComponentJSON'
  | 'created_at'
  | 'updated_at';

export interface IWorkflowRun {
  data_interval_end: string;
  data_interval_start: string;
  duration_date: number;
  end_date: string;
  execution_date: string;
  last_scheduling_decision: string;
  run_type: string;
  start_date: string;
  state: string;
  workflow_id: string;
  workflow_run_id: string;
}

export interface IWorkflowRunsResponse {
  runs: IWorkflowRun[];
}

export interface ITaskInstance {
  task_id: string;
  task_name: string;
  state: string;
  start_date: string;
  end_date: string;
  duration_date: number;
  execution_date: string;
  try_number: number;
  workflow_id: string;
  workflow_run_id: string;
  error_message?: string;
}

export interface ITaskInstancesResponse {
  taskInstances: ITaskInstance[];
}
