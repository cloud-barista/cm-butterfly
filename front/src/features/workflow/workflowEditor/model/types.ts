import { Step as _Step } from 'sequential-workflow-model';

//TODO MCI to Entities로
export interface IMci {
  name: string;
  description: string;
  vms: IVm[];
}

export interface IVm {
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
  type: string;
  properties: {
    isDeletable: boolean;
    mci?: IMci;
  };
}

export interface IWorkFlowDesignerFormData {
  sequence: Step[];
}
