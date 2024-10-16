import { IAxiosResponse, useAxiosPost } from '@/shared/libs';
import { IWorkflowResponse } from '@/entities/workflow/model/types';
import { axiosInstance } from '@/shared/libs/api/instance';

const GET_WORKFLOW_LIST = 'list-workflow';
const UPDATE_WORKFLOW = 'update-workflow';
const DELETE_WORKFLOW = 'delete-workflow';

export function useGetWorkFlowList() {
  return useAxiosPost<IAxiosResponse<IWorkflowResponse[]>, null>(
    GET_WORKFLOW_LIST,
    null,
  );
}

export function useUpdateWorkflow<T, D>(
  wfId: string | null,
  workflowData: D | null,
) {
  const requestBodyWrapper = {
    pathParams: {
      wfId: wfId || null,
    },
    request: {
      data: workflowData,
    },
  };

  return useAxiosPost<IAxiosResponse<IWorkflowResponse>, any>(
    UPDATE_WORKFLOW,
    requestBodyWrapper,
  );
}

export function useBulkDeleteWorkflow(wfIds: string[]) {
  const promiseArr = wfIds.map(wfId => {
    return axiosInstance.post(DELETE_WORKFLOW, {
      pathParams: {
        wfId,
      },
    });
  });

  return Promise.all(promiseArr);
}
