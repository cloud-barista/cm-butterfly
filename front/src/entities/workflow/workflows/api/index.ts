import {
  IAxiosResponse,
  RequestBodyWrapper,
  useAxiosPost,
} from '@/shared/libs';
import { IWorkflowResponse } from '../model/types';

const GET_WORKFLOW_LIST = 'list-workflow';

export function useGetWorkflowList() {
  return useAxiosPost<IAxiosResponse<IWorkflowResponse[]>, null>(
    GET_WORKFLOW_LIST,
    null,
  );
}
