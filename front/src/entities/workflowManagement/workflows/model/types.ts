export interface IWorkflowListResponse {
  createdAt: any;
  updatedAt: any;
  id: string;
  name: string;
  description: string;
  data: {
    description: string;
    // TODO: workflow tool로 넘어가는 데이터 (추후에 타입 정의 필요)
    task_groups: any[];
  };
}

export interface Workflow {
  name: string;
  id: string;
  description: string;
  data: object | any;
  createdDatetime: string | Date;
  updatedDatetime: string | Date;
}
export interface IWorkflowList extends Workflow {
  run: string;
  workflowTool: any;
  workflowJSON: any;
}

export type TWorkflowTableType =
  | 'name'
  | 'id'
  | 'description'
  | 'data'
  | 'created_at'
  | 'updated_at';

export type WorkflowTableType =
  | TWorkflowTableType
  | 'run'
  | 'workflowTool'
  | 'workflowJSON';
