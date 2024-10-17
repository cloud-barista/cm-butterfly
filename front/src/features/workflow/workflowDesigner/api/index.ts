import { IAxiosResponse, useAxiosPost } from '@/shared/libs';
import { ITaskVmResponse } from '@/entities/workflow/model/types.ts';

const GET_TASK_COMPONENT_LIST = 'list-task-component';
export interface ITaskInfoResponse {
  created_at: string;
  updated_at: string;
  id: string;
  name: string;
  data: {
    options: {
      request_body: string | ITaskRequestBody | any;
    };
  };
}

export interface ITaskRequestBody {
  description: string;
  installMonAgent: string;
  name: string;
  label: string;
  systemLabel: string;
  vm: Array<ITaskVmResponse>;
}

export function getTaskComponentList() {
  return useAxiosPost<IAxiosResponse<Array<ITaskInfoResponse>>, null>(
    GET_TASK_COMPONENT_LIST,
    null,
  );
}
