import { defineStore } from 'pinia';
import {
  IWorkflow,
  IWorkflowResponse,
} from '@/entities/workflow/model/types.ts';
import { ref } from 'vue';

const NAMESPACE = 'WORKFLOW';

export const useWorkflowStore = defineStore(NAMESPACE, () => {
  const workflows = ref<Record<string, IWorkflow>>({});
  const workflowTemplates = ref<Record<string, IWorkflow>>({});

  function getWorkFlowById(
    state: Record<string, IWorkflow>,
    workflowId: string,
  ): IWorkflow | null {
    return state[workflowId] || null;
  }

  function setWorkFlows(
    state: Record<string, IWorkflow>,
    res: IWorkflowResponse[],
  ) {
    res.forEach(el => {
      setWorkFlow(state, el);
    });
  }

  function setWorkFlow(
    state: Record<string, IWorkflow>,
    res: IWorkflowResponse,
  ) {
    const defaultWorkFlow: IWorkflow = {
      description: '',
      createdDatetime: '',
      data: res.data,
      name: '',
      updateDatetime: '',
      id: '',
    };

    const existingWorkflow = state[res.id];
    if (!existingWorkflow) {
      state[res.id] = {
        ...defaultWorkFlow,
        ...res,
      };
    }
  }

  return {
    getWorkFlowById: (workflowId: string) =>
      getWorkFlowById(workflows.value, workflowId),
    getTemplateById: (templateId: string) =>
      getWorkFlowById(workflowTemplates.value, templateId),
    setWorkFlow: (res: IWorkflowResponse) => setWorkFlow(workflows.value, res),
    setTemplate: (res: IWorkflowResponse) =>
      setWorkFlow(workflowTemplates.value, res),
    setWorkFlows: (res: IWorkflowResponse[]) =>
      setWorkFlows(workflows.value, res),
    setTemplates: (res: IWorkflowResponse[]) =>
      setWorkFlows(workflowTemplates.value, res),
  };
});
