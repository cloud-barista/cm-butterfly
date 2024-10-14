interface Workflow {
  name: string;
  id: string;
  description: string;
  data: object | any;
  createdDatetime: string | Date;
  updatedDatetime: string | Date;
}
export interface IWorkflow extends Workflow {
  workflowTool: any;
  workflowJSON: any;
}
export interface IWorkflowTemplate extends Workflow {
  workflowTemplateJSON: any;
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
  | 'workflowTool'
  | 'workflowJSON';

export type WorkflowTemplateTableType =
  | TWorkflowTableType
  | 'workflowTemplateJSON';
