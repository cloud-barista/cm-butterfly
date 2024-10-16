import { defineStore } from 'pinia';
import {
  IWorkflow,
  IWorkflowResponse,
} from '@/entities/workflow/model/types.ts';
import { ref } from 'vue';
import { ITaskComponent } from '@/entities';

const NAMESPACE = 'WORKFLOW';

export const useWorkflowStore = defineStore(NAMESPACE, () => {
  // const workflows = ref<Record<string, IWorkflow>>({});
  const workflows = ref<IWorkflow[]>([]);
  // const workflowTemplates = ref<Record<string, IWorkflow>>({});
  const workflowTemplates = ref<IWorkflow[]>([]);
  const taskComponents = ref<ITaskComponent[]>([]);

  function getWorkflowById(workflowId: string | null | undefined) {
    return workflows.value.find(workflow => workflow.id === workflowId);
  }

  function setWorkFlows(_workflows: IWorkflowResponse[]) {
    workflows.value = _workflows.map(workflow => ({
      created_at: workflow.created_at,
      data: workflow.data,
      name: workflow.name,
      updated_at: workflow.updated_at,
      id: workflow.id,
      description: '',
    }));
  }

  function getWorkflowTemplateById(templateId: string | null | undefined) {
    return workflowTemplates.value.find(template => template.id === templateId);
  }

  function setWorkflowTemplates(_workflowTemplates: IWorkflowResponse[]) {
    workflowTemplates.value = _workflowTemplates.map(template => ({
      created_at: template.created_at,
      data: template.data,
      name: template.name,
      updated_at: template.updated_at,
      id: template.id,
      description: '',
    }));
  }

  function getTaskComponentById(taskComponentId: string | null | undefined) {
    return taskComponents.value.find(
      taskComponent => taskComponent.id === taskComponentId,
    );
  }

  function setTaskComponents(_taskComponents: ITaskComponent[]) {
    taskComponents.value = _taskComponents.map(taskComponent => ({
      created_at: taskComponent.created_at,
      data: taskComponent.data,
      id: taskComponent.id,
      name: taskComponent.name,
      description: '',
      updated_at: taskComponent.updated_at,
    }));
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
    taskComponents,
    setWorkFlows,
    getWorkflowById,
    setWorkflowTemplates,
    getWorkflowTemplateById,
    setTaskComponents,
    getTaskComponentById,
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
