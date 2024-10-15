export interface IWorkflow {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  data: IWorkflowResponse['data'];
}
export interface ITaskGroupResponse {
  description: string;
  id: string;
  name: string;
  tasks: Array<ITaskResponse>;
  task_groups?: Array<ITaskGroupResponse>;
}
export interface ITaskResponse {
  dependencies: any[];
  name: string;
  path_params: any;
  request_body: {
    name: string;
    installMonAgent: string;
    label: string;
    systemLabel: string;
    description: string;
    vm: Array<ITaskVmResponse>;
  };
  task_component: string;
}
export interface ITaskVmResponse {
  name: string;
  subGroupSize: string;
  label: string;
  description: string;
  commonSpec: string;
  commonImage: string;
  rootDiskType: string;
  rootDiskSize: string;
  vmUserPassword: string;
  connectionName: string;
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
