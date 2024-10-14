import { defineStore } from 'pinia';
import type { IWorkflow, IWorkflowTemplate } from './types';
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
        workflowJSON: {},
      },
      {
        name: 'targetservice01-wf02',
        id: '10002',
        description: 'workflow2 description',
        data: {},
        createdDatetime: formatDate(new Date('2024-02-03')),
        updatedDatetime: formatDate(new Date('2024-02-23')),
        workflowTool: {},
        workflowJSON: {},
      },
      {
        name: 'targetservice01-wf03',
        id: '10003',
        description: 'workflow3 description',
        data: {},
        createdDatetime: formatDate(new Date('2024-02-03')),
        updatedDatetime: formatDate(new Date('2024-02-23')),
        workflowTool: {},
        workflowJSON: {},
      },
    ] as IWorkflow[],
    workflowTemplates: [
      {
        name: 'workflow-template-01',
        id: '20001',
        description: 'workflow template 1 description',
        data: {},
        createdDatetime: formatDate(new Date('2023-12-03')),
        updatedDatetime: formatDate(new Date('2024-01-03')),
        workflowTemplateJSON: {},
      },
      {
        name: 'workflow-template-02',
        id: '20002',
        description: 'workflow template 2 description',
        data: {},
        createdDatetime: formatDate(new Date('2023-12-03')),
        updatedDatetime: formatDate(new Date('2024-01-03')),
        workflowTemplateJSON: {},
      },
      {
        name: 'workflow-template-03',
        id: '20003',
        description: 'workflow template 3 description',
        data: {},
        createdDatetime: formatDate(new Date('2023-12-03')),
        updatedDatetime: formatDate(new Date('2024-01-03')),
        workflowTemplateJSON: {},
      },
    ] as IWorkflowTemplate[],
  }),
  getters: {
    getWorkflowById: state => (id: string) => {
      return state.workflows.find(workflow => workflow.id === id);
    },
    getWorkflowTemplateById: state => (id: string) => {
      return state.workflowTemplates.find(
        workflowTemplate => workflowTemplate.id === id,
      );
    },
  },
  actions: {
    setWorkflows(workflows: IWorkflow[]) {
      this.workflows = workflows;
    },
    setWorkflowTemplates(workflowTemplates: IWorkflowTemplate[]) {
      this.workflowTemplates = workflowTemplates;
    },
  },
});
