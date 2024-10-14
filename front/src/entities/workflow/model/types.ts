export interface IWorkflow {
  name: string;
  id: string;
  description: string;
  data: object | any;
  createdDatetime: string | Date;
  updatedDatetime: string | Date;
  workflowTool: any;
  workflowJSON: any;
}

export type WorkflowTableType =
  | 'name'
  | 'id'
  | 'description'
  | 'data'
  | 'createdDatetime'
  | 'updatedDatetime'
  | 'workflowTool'
  | 'workflowJSON';
