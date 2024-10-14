import { Step as _Step } from 'sequential-workflow-model';

export interface IMci {
  name: string;
  description: string;
  vms: IVm[];
}

interface IVm {
  id: string;
  name: string;
  serverQuantity: string;
  commonSpec: string;
  osImage: string;
  diskType: string;
  diskSize: string;
  password: string;
  connectionName: string;
}

export interface Step extends _Step {
  sequence?: Step[];
  branches?: { true: Step[]; false: Step[] };
  componentType: 'switch' | 'container' | 'task';
  type: 'if' | 'MCI' | 'bettle_task';
  properties: {
    isDeletable: boolean;
    mci?: IMci;
  };
}

export interface IWorkFlowDesignerFormData {
  sequence: Step[];
}
