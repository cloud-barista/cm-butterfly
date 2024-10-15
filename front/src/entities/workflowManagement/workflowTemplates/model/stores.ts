import { defineStore } from 'pinia';
import { formatDate } from '@/shared/utils';
import { IWorkflowTemplate } from './types';

export const useWorkflowTemplatesStore = defineStore('WORKFLOW_TEMPLATES', {
  state: () => ({
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
    getWorkflowTemplateById: state => (id: string) => {
      return state.workflowTemplates.find(
        workflowTemplate => workflowTemplate.id === id,
      );
    },
  },
  actions: {
    setWorkflowTemplates(workflowTemplates: IWorkflowTemplate[]) {
      this.workflowTemplates = workflowTemplates;
    },
  },
});
