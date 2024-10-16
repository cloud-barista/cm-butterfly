// export interface Workflow {
//   name: string;
//   id: string;
//   description: string;
//   data: object | any;
//   createdDatetime: string | Date;
//   updatedDatetime: string | Date;
// }
// export interface IWorkflowList extends Workflow {
//   run: string;
//   workflowTool: any;
//   workflowJSON: any;
// }

export type TWorkflowTableType =
  | 'name'
  | 'id'
  | 'description'
  | 'data'
  | 'created_at'
  | 'updated_at';

export type WorkflowTableType =
  | TWorkflowTableType
  | 'run'
  | 'workflowTool'
  | 'workflowJSON';
