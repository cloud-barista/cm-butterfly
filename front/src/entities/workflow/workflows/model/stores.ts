import { defineStore } from 'pinia';
import type { IWorkflow } from './types';
import { formatDate } from '@/shared/utils';

export const useWorkflowsStore = defineStore('WORKFLOWS', {
  state: () => ({
    workflows: [] as IWorkflow[],
  }),
  getters: {
    getWorkflowById: state => (id: string) => {
      return state.workflows.find(workflow => workflow.id === id);
    },
  },
  actions: {
    setWorkflows(workflows: IWorkflow[]) {
      this.workflows = workflows;
    },
  },
});
