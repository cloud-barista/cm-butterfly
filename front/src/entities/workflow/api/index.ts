import { IAxiosResponse, useAxiosPost } from '@/shared/libs';
import {
  IWorkflow,
  IWorkflowResponse,
} from '@/entities/workflow/model/types.ts';

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

export function getWorkflowTemplateList2() {
  return {
    responseData: {
      data: {
        description: 'Create Server',
        task_groups: [
          {
            description: 'Migrate Server',
            name: 'migrate_infra',
            tasks: [
              {
                dependencies: [],
                name: 'infra_create',
                path_params: null,
                request_body: {
                  name: 'recommended-infra01',
                  installMonAgent: 'no',
                  label: 'DynamicVM',
                  systemLabel: '',
                  description: 'Made in CB-TB',
                  vm: [
                    {
                      name: 'recommended-vm01',
                      subGroupSize: '3',
                      label: 'DynamicVM',
                      description: 'Description',
                      commonSpec: 'azure-koreacentral-standard-b4ms',
                      commonImage: 'ubuntu22-04',
                      rootDiskType: 'default',
                      rootDiskSize: 'default',
                      vmUserPassword: 'test',
                      connectionName: 'azure-koreacentral',
                    },
                  ],
                },
                task_component: 'beetle_task_infra_migration',
              },
            ],
          },
        ],
      },
      name: 'create_infra_workflow',
    },
  };
}

let t: IWorkflow = {
  createdDatetime: '',
  data: {
    description: 'Create Server',
    task_groups: [
      {
        description: 'Migrate Server',
        name: 'migrate_infra',
        tasks: [
          {
            dependencies: [],
            name: 'infra_create',
            path_params: 's',
            request_body: {
              name: 'recommended-infra01',
              installMonAgent: 'no',
              label: 'DynamicVM',
              systemLabel: '',
              description: 'Made in CB-TB',
              vm: [
                {
                  name: 'recommended-vm01',
                  subGroupSize: '3',
                  label: 'DynamicVM',
                  description: 'Description',
                  commonSpec: 'azure-koreacentral-standard-b4ms',
                  commonImage: 'ubuntu22-04',
                  rootDiskType: 'default',
                  rootDiskSize: 'default',
                  vmUserPassword: 'test',
                  connectionName: 'azure-koreacentral',
                },
              ],
            },
            task_component: 'beetle_task_infra_migration',
          },
        ],
      },
    ],
  },
  description: '',
  id: '',
  name: '',
  updateDatetime: '',
};

let t2: IWorkflow = {
  createdDatetime: '',
  data: {
    description: '',
    task_groups: [
      {
        description: 'string',
        name: 'Task Group',
        tasks: [
          {
            dependencies: ['any[]'],
            name: 'bettle_task',
            path_params: 'any',
            request_body: {
              name: 'bettle_task',
              installMonAgent: 'string',
              label: 'string',
              systemLabel: 'string',
              description: 'string',
              vm: [],
            },
            task_component: 'string',
          },
        ],
        task_groups: [
          {
            description: 'string',
            name: 'Task Group',
            tasks: [
              {
                dependencies: ['any[]'],
                name: 'bettle_task',
                path_params: 'any',
                request_body: {
                  name: 'string',
                  installMonAgent: 'string',
                  label: 'string',
                  systemLabel: 'string',
                  description: 'string',
                  vm: [],
                },
                task_component: 'string',
              },
            ],
            task_groups: [],
          },
        ],
      },
    ],
  },
  description: '',
  id: '',
  name: '',
  updateDatetime: '',
};
