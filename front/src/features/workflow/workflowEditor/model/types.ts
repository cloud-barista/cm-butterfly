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
    // cm-cicada task type (http | http_xcom | bash | ssh | trigger_workflow),
    // used to pick the per-type editor and to build the save-time spec.
    taskType?: string;
    // Normalized task component (`data` + `type`/`spec`) for schema-driven UI.
    taskComponentData?: any;
  };
}

export interface IWorkFlowDesignerFormData {
  sequence: Step[];
}
