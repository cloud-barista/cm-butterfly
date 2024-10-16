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

// interface ITaskOptionResponse {
//   options: {
//     api_connection_id: string;
//     endpoint: string;
//     method: string;
//     request_body: string;
//   };
//   param_option: {
//     params: {
//       properties: {
//         description: {};
//         installMonAgent: {};
//         label: {};
//         name: {};
//         systemLabel: {};
//         vm: {}
//       };
//       required: string[]
//     };
//     path_params: {
//       properties: any;
//       required: any;
//     };
//   };
// }

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
