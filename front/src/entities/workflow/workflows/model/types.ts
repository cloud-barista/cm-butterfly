export interface Workflow {
  name: string;
  id: string;
  description: string;
  data: object | any;
  createdDatetime: string | Date;
  updatedDatetime: string | Date;
}
export interface IWorkflow extends Workflow {
  run: string;
  workflowTool: any;
  workflowJSON: any;
}

export type TWorkflowTableType =
  | 'name'
  | 'id'
  | 'description'
  | 'data'
  | 'createdDatetime'
  | 'updatedDatetime';

export type WorkflowTableType =
  | TWorkflowTableType
  | 'run'
  | 'workflowTool'
  | 'workflowJSON';
