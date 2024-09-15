import { IVm } from '../../vm/model';

export interface IMci extends IVm, IMciStatus {
  id: string;
  name: string;
  alias: string;
  type: string;
  deploymentAlgorithm: string;
  action: string;
  vm: IVm[];
}

export interface IMciStatus {
  status: string;
  statusCount: {
    countTotal: number;
    countRunning: number;
    countSuspended: number;
    countTerminated: number;
  };
}

export type McisTableType =
  | 'name'
  | 'alias'
  | 'status'
  | 'provider'
  | 'countTotal'
  | 'countRunning'
  | 'countTerminated'
  | 'countSuspended'
  | 'description'
  | 'deploymentAlgorithm'
  | 'type'
  | 'action';
