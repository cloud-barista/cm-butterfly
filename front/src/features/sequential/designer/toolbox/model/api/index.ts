import { IAxiosResponse, useAxiosPost } from '@/shared/libs';

const GET_TASK_COMPONENT_LIST = 'list-task-component';

export interface ITaskComponentInfoResponse {
  created_at: string;
  updated_at: string;
  id: string;
  name: string;
  // cm-cicada Type/Spec schema (kept alongside the legacy `data` shape that the
  // adapter fills in — see entities/workflow/lib/schemaAdapter.ts).
  type?: string;
  spec?: Record<string, any>;
  data: {
    options: {
      request_body: string;
      path_params: object;
    };
    body_params?: {
      properties: Record<string, any>;
      required?: string[];
    };
    path_params: {
      properties: Record<
        string,
        {
          description: string;
          type: string;
        }
      > | null;
    };
    query_params: {
      properties: Record<
        string,
        {
          description: string;
          type: string;
        }
      > | null;
    };
  };
}

export function getTaskComponentList() {
  return useAxiosPost<IAxiosResponse<Array<ITaskComponentInfoResponse>>, null>(
    GET_TASK_COMPONENT_LIST,
    null,
  );
}
