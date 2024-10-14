import { defineStore } from 'pinia';
import type { IWorkflowModel } from './types';
import { formatDate } from '@/shared/utils';

export const useWorkflowsStore = defineStore('WORKFLOWS', {
  state: () => ({
    workflows: [
      {
        name: 'targetservice01-wf01',
        id: '10001',
        description: 'workflow1 description',
        data: {},
        createdDatetime: formatDate(new Date('2024-02-03')),
        updatedDatetime: formatDate(new Date('2024-02-23')),
        workflowTool: {},
        workflowJson: {},
      },
      {
        name: 'targetservice01-wf02',
        id: '10002',
        description: 'workflow2 description',
        data: {},
        createdDatetime: formatDate(new Date('2024-02-03')),
        updatedDatetime: formatDate(new Date('2024-02-23')),
        workflowTool: {},
        workflowJson: {},
      },
      {
        name: 'targetservice01-wf03',
        id: '10003',
        description: 'workflow3 description',
        data: {},
        createdDatetime: formatDate(new Date('2024-02-03')),
        updatedDatetime: formatDate(new Date('2024-02-23')),
        workflowTool: {},
        workflowJson: {},
      },
    ] as IWorkflowModel[],
  }),
  getters: {
    getWorkflowById: state => (id: string) => {
      return state.workflows.find(workflow => workflow.id === id);
    },
  },
  actions: {
    setWorkflows(workflows: IWorkflowModel[]) {
      this.workflows = workflows;
    },
  },
});
