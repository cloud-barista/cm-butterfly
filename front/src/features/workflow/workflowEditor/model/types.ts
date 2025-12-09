import { Step as _Step } from 'sequential-workflow-model';
import { ITaskResponse } from '@/entities';
export interface fixedModel {
  path_params: Record<string, string>;
  query_params: Record<string, string>;
}

export interface Step extends _Step {
  sequence?: Step[];
  branches?: { true: Step[]; false: Step[] };
  componentType: 'switch' | 'container' | 'task' | 'launchPad';
  type: string;
  properties: {
    isDeletable: boolean;
    isParallel?: boolean;
    isEnabled?: boolean;
    model?: object;
    originalData?: ITaskResponse;
    fixedModel?: fixedModel;
  };
}

export interface IWorkFlowDesignerFormData {
  sequence: Step[];
}
