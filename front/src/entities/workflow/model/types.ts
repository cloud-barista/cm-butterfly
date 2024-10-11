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
  tasks: Array<ITaskResponse>;
  task_groups: Array<ITaskGroupResponse>;
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
}

// export interface IWorkFlowResponse {
//   data: {
//     description: 'Create Server';
//     task_groups: [
//       {
//         description: 'Migrate Server';
//         name: 'migrate_infra';
//         tasks: [
//           {
//             dependencies: [];
//             name: 'infra_create';
//             path_params: null;
//             request_body: {
//               name: 'recommended-infra01';
//               installMonAgent: 'no';
//               label: 'DynamicVM';
//               systemLabel: '';
//               description: 'Made in CB-TB';
//               vm: [
//                 {
//                   name: 'recommended-vm01';
//                   subGroupSize: '3';
//                   label: 'DynamicVM';
//                   description: 'Description';
//                   commonSpec: 'azure-koreacentral-standard-b4ms';
//                   commonImage: 'ubuntu22-04';
//                   rootDiskType: 'default';
//                   rootDiskSize: 'default';
//                   vmUserPassword: 'test';
//                   connectionName: 'azure-koreacentral';
//                 },
//               ];
//             };
//             task_component: 'beetle_task_infra_migration';
//           },
//         ];
//       },
//     ];
//   };
//   name: 'create_infra_workflow';
// }
