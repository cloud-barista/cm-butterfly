import { defineStore } from 'pinia';
import {
  IWorkflow,
  IWorkflowResponse,
} from '@/entities/workflow/model/types.ts';
import { ref } from 'vue';

const NAMESPACE = 'WORKFLOW';

export const useWorkflowStore = defineStore(NAMESPACE, () => {
  // const workflows = ref<Record<string, IWorkflow>>({});
  const workflows = ref<IWorkflow[]>([]);
  const workflowTemplates = ref<Record<string, IWorkflow>>({});

  function getWorkflowById(workflowId: string) {
    return workflows.value.find(workflow => workflow.id === workflowId);
  }

  // function getWorkFlowById(
  //   state: Record<string, IWorkflow>,
  //   workflowId: string,
  // ): IWorkflow | null {
  //   return state[workflowId] || null;
  // }

  // function setWorkFlows(
  //   state: Record<string, IWorkflow>,
  //   res: IWorkflowResponse[],
  // ) {
  //   res.forEach(el => {
  //     setWorkFlow(state, el);
  //   });
  // }

  function setWorkFlows(_workflows: IWorkflowResponse[]) {
    workflows.value = _workflows.map(workflow => ({
      created_at: workflow.created_at,
      data: workflow.data,
      name: workflow.name,
      updated_at: workflow.updated_at,
      id: workflow.id,
      description: '',
    }));
    // workflows.value = [
    //   ...workflows.value,
    //   {
    //     created_at: _workflows.created_at,
    //     data: _workflows.data,
    //     name: _workflows.name,
    //     updated_at: _workflows.updated_at,
    //     id: _workflows.id,
    //     description: '',
    //   },
    // ];
  }

  function setWorkFlow(
    state: Record<string, IWorkflow>,
    res: IWorkflowResponse,
  ) {
    const defaultWorkFlow: IWorkflow = {
      description: '',
      created_at: '',
      data: res.data,
      name: '',
      updated_at: '',
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
    workflows,
    workflowTemplates,
    setWorkFlows,
    getWorkflowById,
    // getWorkFlowById: (workflowId: string) =>
    //   getWorkFlowById(workflows.value, workflowId),
    // getTemplateById: (templateId: string) =>
    //   getWorkFlowById(workflowTemplates.value, templateId),
    // setWorkFlow: (res: IWorkflowResponse) => setWorkFlow(workflows.value, res),
    // setTemplate: (res: IWorkflowResponse) =>
    //   setWorkFlow(workflowTemplates.value, res),
    // setWorkFlows: (res: IWorkflowResponse[]) =>
    //   setWorkFlows(workflows.value, res),
    // setTemplates: (res: IWorkflowResponse[]) =>
    //   setWorkFlows(workflowTemplates.value, res),
  };
});
