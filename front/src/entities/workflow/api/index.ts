import { IAxiosResponse, useAxiosPost } from '@/shared/libs';
import { IWorkflowResponse } from '@/entities/workflow/model/types.ts';

// const GET_DISK_TYPE = 'GET_DISK_TYPE';
const GET_WORKFLOW_LIST = 'GET_WORKFLOW_LIST';
const GET_WORKFLOW_TEMPLATE_LIST = 'GET_WORKFLOW_TEMPLATE_LIST';

export function getWorkFlowList() {
  return useAxiosPost<IAxiosResponse<IWorkflowResponse[]>, null>(
    GET_WORKFLOW_LIST,
    null,
  );
}

export function getWorkflowTemplateList() {
  return useAxiosPost<IAxiosResponse<IWorkflowResponse>, null>(
    GET_WORKFLOW_TEMPLATE_LIST,
    null,
  );
}
