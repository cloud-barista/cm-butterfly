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
