import { Step as _Step } from 'sequential-workflow-model';
import { ITaskResponse } from '@/entities';

export interface Step extends _Step {
  sequence?: Step[];
  branches?: { true: Step[]; false: Step[] };
  componentType: 'switch' | 'container' | 'task';
  type: string;
  properties: {
    isDeletable: boolean;
    model?: object;
    originalData?: ITaskResponse;
    fixedModel?: object;
  };
}

export interface IWorkFlowDesignerFormData {
  sequence: Step[];
}
