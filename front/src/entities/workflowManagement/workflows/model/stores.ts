import { defineStore } from 'pinia';
import type { IWorkflowList } from './types';
import { formatDate } from '@/shared/utils';

export const useWorkflowsStore = defineStore('WORKFLOWS', {
  state: () => ({
    workflows: [] as IWorkflowList[],
  }),
  getters: {
    getWorkflowById: state => (id: string) => {
      return state.workflows.find(workflow => workflow.id === id);
    },
  },
  actions: {
    setWorkflows(workflows: IWorkflowList[]) {
      this.workflows = workflows;
    },
  },
});
