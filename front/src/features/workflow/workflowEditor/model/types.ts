import { Step as _Step } from 'sequential-workflow-model';

export interface Step extends _Step {
  sequence?: Step[];
  branches?: { true: Step[]; false: Step[] };
  componentType: 'switch' | 'container' | 'task';
  type: string;
  properties: {
    isDeletable: boolean;
    model?: object;
  };
}

export interface IWorkFlowDesignerFormData {
  sequence: Step[];
}
