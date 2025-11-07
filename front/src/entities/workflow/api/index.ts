import {
  IAxiosResponse,
  RequestBodyWrapper,
  useAxiosPost,
} from '@/shared/libs';
import {
  ITaskComponentResponse,
  ITaskInstance,
  IWorkflowResponse,
  IWorkflowRun,
  ISoftwareMigrationStatusResponse,
} from '@/entities/workflow/model/types';
import { axiosInstance } from '@/shared/libs/api/instance';

const GET_WORKFLOW_LIST = 'list-workflow';
const GET_WORKFLOW = 'get-workflow';
const CREATE_WORKFLOW = 'create-workflow';
const UPDATE_WORKFLOW = 'update-workflow';
const RUN_WORKFLOW = 'run-workflow';
const DELETE_WORKFLOW = 'delete-workflow';
const GET_WORKFLOW_RUNS = 'get-workflow-runs';
const GET_TASK_INSTANCES = 'get-task-instances';
const GET_TASK_LOGS = 'get-task-logs';
const GET_SOFTWARE_MIGRATION_STATUS = 'get-software-migration-status';

// const GET_DISK_TYPE = 'GET_DISK_TYPE';
const GET_WORKFLOW_TEMPLATE_LIST = 'list-workflow-template';

const GET_TASK_COMPONENT_LIST = 'list-task-component';
const GET_TASK_COMPONENT = 'get-task-component';
const CREATE_TASK_COMPONENT = 'cm-cicada/create-task-component';
const UPDATE_TASK_COMPONENT = 'update-task-component';
const DELETE_TASK_COMPONENT = 'delete-task-component';

// 1. workflow
export function useGetWorkflowList() {
  return useAxiosPost<IAxiosResponse<IWorkflowResponse[]>, null>(
    GET_WORKFLOW_LIST,
    null,
  );
}

export function useGetWorkflow(wfId: string | null) {
  return useAxiosPost<IAxiosResponse<IWorkflowResponse>, any>(GET_WORKFLOW, {
    pathParams: {
      wfId,
    },
  });
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

export function useUpdateWorkflowV2(
  wfId: string | null,
  workflowData: IWorkflowResponse['data'] | null,
  name: string | null,
) {
  const requestBodyWrapper: Required<
    Pick<
      RequestBodyWrapper<
        | {
            wfId: string | null;
          }
        | {
            data: IWorkflowResponse['data'] | null;
            name: string | null;
            spec_version?: string;
            nsId?: string;
          }
      >,
      'pathParams' | 'request'
    >
  > = {
    pathParams: {
      wfId: wfId,
    },
    request: {
      data: workflowData,
      name: name,
    },
  };

  return useAxiosPost<
    IAxiosResponse<IWorkflowResponse>,
    Required<
      Pick<
        RequestBodyWrapper<
          | {
              wfId: string | null;
            }
          | {
              data: IWorkflowResponse['data'] | null;
              name: string | null;
              spec_version?: string;
              nsId?: string;
            }
        >,
        'pathParams' | 'request'
      >
    >
  >(UPDATE_WORKFLOW, requestBodyWrapper);
}

// Required<
//     Pick<RequestBodyWrapper<Pick<IMciRequestParams, 'nsId'>>, 'pathParams'>
// >
export function useRunWorkflow(wfId: string) {
  return useAxiosPost<IAxiosResponse<IWorkflowResponse>, any>(RUN_WORKFLOW, {
    pathParams: {
      wfId,
    },
  });
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

// 2. workflow template
export function useGetWorkflowTemplateList() {
  return useAxiosPost<IAxiosResponse<IWorkflowResponse[]>, null>(
    GET_WORKFLOW_TEMPLATE_LIST,
    null,
  );
}

// export function useUpdateWorkflowTemplate<T, D>(
//   wfId: string | null,
//   workflowData: D | null,
// ) {
//   const requestBodyWrapper = {
//     pathParams: {
//       wfId: wfId || null,
//     },
//     request: {
//       data: workflowData,
//     },
//   };

//   return useAxiosPost<IAxiosResponse<IWorkflowResponse>, any>(
//     UPDATE_WORKFLOW,
//     requestBodyWrapper,
//   );
// }

// 3. task component
export function useGetTaskComponentList() {
  return useAxiosPost<IAxiosResponse<IWorkflowResponse[]>, null>(
    GET_TASK_COMPONENT_LIST,
    null,
  );
}

export function useGetTaskComponent(tcId: string | null) {
  return useAxiosPost<IAxiosResponse<IWorkflowResponse>, any>(
    GET_TASK_COMPONENT,
    {
      pathParams: {
        tcId,
      },
    },
  );
}

export function useCreateTaskComponent<T, D>(taskComponentData: D | null) {
  const requestBodyWrapper = {
    request: {
      data: taskComponentData,
    },
  };

  return useAxiosPost<IAxiosResponse<IWorkflowResponse>, any>(
    CREATE_TASK_COMPONENT,
    requestBodyWrapper,
  );
}

export function useUpdateTaskComponent<T, D>(
  tcId: string | null,
  taskComponentData: D | null,
) {
  const requestBodyWrapper = {
    pathParams: {
      tcId: tcId || null,
    },
    request: {
      data: taskComponentData,
    },
  };

  return useAxiosPost<IAxiosResponse<ITaskComponentResponse>, any>(
    UPDATE_TASK_COMPONENT,
    requestBodyWrapper,
  );
}

export function useBulkDeleteTaskComponent(tcIds: string[]) {
  const promiseArr = tcIds.map(tcId => {
    return axiosInstance.post(DELETE_TASK_COMPONENT, {
      pathParams: {
        tcId,
      },
    });
  });

  return Promise.all(promiseArr);
}

export function useCreateWorkflow(data: IWorkflowResponse['data'] | null) {
  const requestBodyWrapper: Required<
    Pick<
      RequestBodyWrapper<{
        data: IWorkflowResponse['data'] | null;
        name?: string;
        spec_version?: string;
        nsId?: string;
      }>,
      'request'
    >
  > = {
    request: {
      data,
    },
  };

  return useAxiosPost<
    IAxiosResponse<any>,
    Required<
      Pick<
        RequestBodyWrapper<{
          data: IWorkflowResponse['data'] | null;
          name?: string;
          spec_version?: string;
          nsId?: string;
        }>,
        'request'
      >
    >
  >(CREATE_WORKFLOW, requestBodyWrapper);
}

export function useGetWorkflowRuns(wfId: string | null) {
  return useAxiosPost<IAxiosResponse<IWorkflowRun[]>, any>(GET_WORKFLOW_RUNS, {
    pathParams: {
      wfId,
    },
  });
}

export function useGetTaskInstances(
  wfId: string | null,
  wfRunId: string | null,
) {
  return useAxiosPost<IAxiosResponse<ITaskInstance[]>, any>(
    GET_TASK_INSTANCES,
    {
      pathParams: {
        wfId,
        wfRunId: wfRunId ? encodeURIComponent(wfRunId) : wfRunId,
      },
    },
  );
}

export function useGetTaskLogs(
  wfId: string | null,
  wfRunId: string | null,
  taskId: string | null,
  taskTryNum: string | null,
) {
  return useAxiosPost<IAxiosResponse<any>, any>(GET_TASK_LOGS, {
    pathParams: {
      wfId,
      wfRunId: wfRunId ? encodeURIComponent(wfRunId) : wfRunId,
      taskId,
      taskTryNum,
    },
  });
}

export function useGetSoftwareMigrationStatus(executionId: string | null) {
  return useAxiosPost<IAxiosResponse<ISoftwareMigrationStatusResponse>, any>(
    GET_SOFTWARE_MIGRATION_STATUS,
    {
      pathParams: {
        executionId,
      },
    },
  );
}
