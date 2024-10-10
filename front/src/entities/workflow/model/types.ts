export interface IWorkFlow {
  name: string;
  id: string;
  Description: string;
  createdDatetime: string;
  updateDatetime: string;
  data: string;
}

export interface IWorkFlowDesignerData {
  targetModelId: string;
}
export interface IMci {
  id: string;
  description: string;
}

export interface IVm {
  name: string;
}
