import { defineStore } from 'pinia';
import {
  IWorkflow,
  IWorkflowResponse,
  ITaskComponent,
} from '@/entities/workflow/model/types';
import { ref } from 'vue';

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
    
    // 각 task component의 model 정보를 콘솔에 출력
    console.log('=== Task Components Model Information ===');
    _taskComponents.forEach(taskComponent => {
      console.log(`Task: ${taskComponent.name}`, {
        id: taskComponent.id,
        model: taskComponent.data,
        created_at: taskComponent.created_at,
        updated_at: taskComponent.updated_at
      });
      
      // Task component의 body_params 모델 정보 상세 출력
      if (taskComponent.data && (taskComponent.data as any).body_params) {
        console.log(`📋 ${taskComponent.name} Body Params Model:`, (taskComponent.data as any).body_params);
      }
    });
    console.log('==========================================');
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
