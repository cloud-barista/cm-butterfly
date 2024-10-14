import { TWorkflowTableType, Workflow } from '../../workflows';

export interface IWorkflowTemplate extends Workflow {
  workflowTemplateJSON: any;
}

export type WorkflowTemplateTableType =
  | TWorkflowTableType
  | 'workflowTemplateJSON';
