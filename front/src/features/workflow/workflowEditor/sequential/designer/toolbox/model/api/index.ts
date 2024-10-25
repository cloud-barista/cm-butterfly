import { IAxiosResponse, useAxiosPost } from '@/shared/libs';

const GET_TASK_COMPONENT_LIST = 'list-task-component';
export interface ITaskInfoResponse {
  created_at: string;
  updated_at: string;
  id: string;
  name: string;
  data: {
    options: {
      request_body: string;
    };
  };
}

export function getTaskComponentList() {
  return useAxiosPost<IAxiosResponse<Array<ITaskInfoResponse>>, null>(
    GET_TASK_COMPONENT_LIST,
    null,
  );
}
