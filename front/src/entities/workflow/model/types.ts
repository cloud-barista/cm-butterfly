export interface IWorkflow {
  id: string;
  name: string;
  description: string;
  createdDatetime: string;
  updateDatetime: string;
  data: IWorkflowResponse['data'];
}
export interface ITaskGroupResponse {
  description: string;
  name: string;
  id?: string;
  tasks: Array<ITaskResponse>;
  task_groups?: Array<ITaskGroupResponse>;
}
export interface ITaskResponse {
  dependencies: any;
  name: string;
  path_params: any;
  request_body: string;
  task_component: string;
  query_params?: any;
  id?: string;
}

export interface IWorkflowResponse {
  data: {
    description: string;
    task_groups: Array<ITaskGroupResponse>;
  };
  name: string;
  id: string;
}
