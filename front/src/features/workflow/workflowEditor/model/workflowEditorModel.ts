import { useWorkflowStore } from '@/entities/workflow/model/stores';
import {
  fixedModel,
  IWorkFlowDesignerFormData,
  Step,
} from '@/features/workflow/workflowEditor/model/types';
import {
  ITaskGroupResponse,
  ITaskResponse,
  IWorkflow,
  IWorkflowResponse,
} from '@/entities/workflow/model/types';
import getRandomId from '@/shared/utils/uuid';
import { toolboxSteps } from '@/features/sequential/designer/toolbox/model/toolboxSteps';
import { parseRequestBody } from '@/shared/utils/stringToObject';
import { ITaskComponentInfoResponse } from '@/features/sequential/designer/toolbox/model/api';
import { isNullOrUndefined } from '@/shared/utils';
import { reactive } from 'vue';
import { useSequentialToolboxModel } from '@/features/sequential/designer/toolbox/model/toolboxModel';
import { encodeBase64, decodeBase64 } from '@/shared/utils/base64';

type dropDownType = {
  name: string;
  label: string;
  type: 'item';
};

export function useWorkflowToolModel() {
  const workflowStore = useWorkflowStore();
  const { defineTaskGroupStep, defineBettleTaskStep } = toolboxSteps();
  const sequentialToolboxModel = useSequentialToolboxModel();
  const taskComponentList: Array<ITaskComponentInfoResponse> = [];
  const dropDownModel = reactive<{
    state: any;
    data: dropDownType[];
    selectedItemId: string;
  }>({
    state: { disabled: false },
    data: [],
    selectedItemId: '',
  });

  function setTaskComponent(
    _taskComponentList: Array<ITaskComponentInfoResponse>,
  ) {
    console.log('=== setTaskComponent called ===');
    console.log('Task components to add:', _taskComponentList.length);
    
    _taskComponentList.forEach(component => {
      taskComponentList.push(component);
    });
    
    // Workflow Store에도 저장
    workflowStore.setTaskComponents(_taskComponentList);
    console.log('✅ Task components saved to workflow store');
    console.log('Current store task components count:', workflowStore.taskComponents.length);
  }

  function setDropDownData(workspaceResponse: IWorkflowResponse[]) {
    workspaceResponse.forEach(workspace => {
      dropDownModel.data.push({
        name: workspace.id,
        label: workspace.name,
        type: 'item',
      });
    });
  }

  function getWorkflowData(workflowId: string) {
    return workflowStore.getWorkflowById(workflowId);
  }

  function getWorkflowTemplateData(workflowTemplateId: string) {
    return workflowStore.getWorkflowTemplateById(workflowTemplateId);
  }

  function convertCicadaToDesignerFormData(
    workflow: IWorkflow,
    taskComponentList: Array<ITaskComponentInfoResponse>,
  ): IWorkFlowDesignerFormData {
    const sequence: Step[] = [];

    // 스택에 부모 taskGroup과 현재 taskGroup을 함께 저장
    const stack: {
      parentTaskGroup: Step | null;
      currentTaskGroup: ITaskGroupResponse;
    }[] = workflow.data.task_groups.map(taskGroup => ({
      parentTaskGroup: null,
      currentTaskGroup: taskGroup,
    }));

    while (stack.length) {
      const { parentTaskGroup, currentTaskGroup } = stack.pop()!;

      const currentDesignerTaskGroup =
        convertToDesignerTaskGroup(currentTaskGroup);

      if (currentTaskGroup.tasks) {
        for (const task of currentTaskGroup.tasks) {
          const requestBody = getMappingWorkflowTaskComponentRequestBody(
            task,
            taskComponentList,
            currentTaskGroup.tasks,
          );
          const currentDesignerTask = convertToDesignerTask(task, requestBody);
          currentDesignerTaskGroup.sequence!.push(currentDesignerTask);
        }
      }

      if (parentTaskGroup) {
        parentTaskGroup.sequence!.push(currentDesignerTaskGroup);
      } else {
        sequence.push(currentDesignerTaskGroup);
      }

      if (currentTaskGroup.task_groups) {
        for (const subTaskGroups of currentTaskGroup.task_groups) {
          stack.push({
            parentTaskGroup: currentDesignerTaskGroup,
            currentTaskGroup: subTaskGroups,
          });
        }
      }
    }

    return { sequence };
  }

  function createFixedModel(task: ITaskResponse): fixedModel {
    const fixedModel: fixedModel = {
      path_params: task.path_params,
      query_params: task.query_params,
    };
    if (
      isNullOrUndefined(fixedModel.path_params) ||
      isNullOrUndefined(fixedModel.query_params)
    ) {
      const taskComponent = taskComponentList.find(
        taskComponent => taskComponent.name === task.task_component,
      );

      if (taskComponent) {
        const { path_params, query_params } =
          sequentialToolboxModel.getFixedModel(taskComponent);

        if (isNullOrUndefined(fixedModel.path_params)) {
          fixedModel.path_params = path_params;
        }
        if (isNullOrUndefined(fixedModel.query_params)) {
          fixedModel.query_params = query_params;
        }
      }
    }
    return fixedModel;
  }

  function convertToDesignerTask(
    task: ITaskResponse,
    requestBody: string,
  ): Step {
    const parsedString: any = parseRequestBody(requestBody);
    
    // Base64 decode content field for cicada_task_script
    // cicada_task_script 태스크의 content 필드를 base64로 디코딩
    if (task.task_component === 'cicada_task_script' && parsedString.content) {
      console.log('🔓 Decoding content field for cicada_task_script');
      console.log('   Encoded content:', parsedString.content);
      parsedString.content = decodeBase64(parsedString.content);
      console.log('   Decoded content:', parsedString.content);
    }
    
    // Task component 정보 찾기
    const taskComponent = taskComponentList.find(
      tc => tc.name === task.task_component
    );
    
    // Task component를 캔버스에 추가할 때 모델 정보를 콘솔에 출력
    console.log('=== Task Component Added to Canvas ===');
    console.log(`Task Name: ${task.name}`);
    console.log(`Task Component: ${task.task_component}`);
    console.log('Task Component Found:', !!taskComponent);
    if (taskComponent) {
      console.log('Task Component Schema (body_params):', taskComponent.data.body_params);
    }
    console.log('Model Information:', {
      requestBody: requestBody,
      parsedModel: parsedString,
      pathParams: task.path_params,
      queryParams: task.query_params,
      dependencies: task.dependencies
    });
    console.log('=====================================');
    
    // Step properties에 taskComponentData 추가
    const stepProperties: any = {
      model: parsedString,
      originalData: task,
      fixedModel: createFixedModel(task),
    };
    
    // Task component data 추가 (schema 정보)
    if (taskComponent) {
      stepProperties.taskComponentData = taskComponent.data;
    }
    
    return defineBettleTaskStep(getRandomId(), task.name, task.task_component, stepProperties);
  }

  function convertToDesignerTaskGroup(taskGroup: ITaskGroupResponse): Step {
    return defineTaskGroupStep(getRandomId(), taskGroup.name, 'MCI', {
      model: { description: taskGroup.description },
    });
  }

  function convertDesignerSequenceToCicada(sequence: Step[]) {
    if (!validationSequence(sequence)) {
      throw new Error('task must have at least one taskGroup as its parent.');
    }
    const cicadaObject: ITaskGroupResponse[] = [];

    const stack: {
      parentNode: ITaskGroupResponse | null;
      currentNode: Step;
    }[] = sequence.map((step: Step) => ({
      parentNode: null,
      currentNode: step,
    }));

    while (stack.length) {
      const { parentNode, currentNode } = stack.shift()!;

      const taskGroup: ITaskGroupResponse = {
        description: '',
        name: '',
        tasks: [],
      };

      if (currentNode.componentType === 'container') {
        const tasks: any = [];

        currentNode.sequence?.forEach(step => {
          if (step.componentType === 'container') {
            stack.push({ parentNode: taskGroup, currentNode: step });
          } else if (step.componentType === 'task') {
            tasks.push(convertToCicadaTask(step, tasks[tasks.length - 1]));
          }
        });

        taskGroup.description =
          currentNode.properties.model?.['description'] ?? '';
        taskGroup.name = currentNode.name;
        taskGroup.tasks = tasks;
      }

      if (parentNode === null) {
        cicadaObject.push(taskGroup);
      } else {
        parentNode.task_groups = parentNode.task_groups || [];
        parentNode.task_groups.push(taskGroup);
      }
    }
    return cicadaObject;
  }

  function convertToCicadaTask(step: Step, dependenciesStep: Step) {
    if (step.componentType === 'task') {
      console.log('\n');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('🔄 convertToCicadaTask - Converting Step to Task');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('Step name:', step.name);
      console.log('Step type:', step.type);
      
      // Base64 encode content field for cicada_task_script
      // cicada_task_script 태스크의 content 필드를 base64로 인코딩
      const modelToSend: any = { ...step.properties.model };
      const taskComponent = step.properties.originalData?.task_component;
      
      if (taskComponent === 'cicada_task_script' && modelToSend.content) {
        console.log('🔐 Encoding content field for cicada_task_script');
        console.log('   Original content:', modelToSend.content);
        modelToSend.content = encodeBase64(modelToSend.content);
        console.log('   Encoded content:', modelToSend.content);
      }
      
      // Current data (what will be sent)
      const currentRequestBody = JSON.stringify(modelToSend);
      const currentPathParams = step.properties.fixedModel?.path_params;
      const currentQueryParams = step.properties.fixedModel?.query_params;
      
      console.log('\n📦 Current Data (will be sent to API):');
      console.log('  request_body:', currentRequestBody);
      console.log('  path_params:', currentPathParams);
      console.log('  query_params:', currentQueryParams);
      console.log('  task_component:', step.properties.originalData?.task_component);
      
      // Original data comparison
      const originalData = step.properties.originalData;
      if (originalData) {
        console.log('\n🔍 Comparing with originalData:');
        
        // Name comparison
        const nameMatch = step.name === originalData.name;
        console.log('\n  Task Name:');
        console.log('    Original:', originalData.name);
        console.log('    Current:', step.name);
        console.log('    Match:', nameMatch ? '✅ YES' : '❌ NO');
        
        // Request body comparison
        const originalRequestBody = originalData.request_body || '{}';
        const requestBodyMatch = currentRequestBody === originalRequestBody;
        console.log('\n  Request Body:');
        console.log('    Original:', originalRequestBody.substring(0, 200) + (originalRequestBody.length > 200 ? '...' : ''));
        console.log('    Current:', currentRequestBody.substring(0, 200) + (currentRequestBody.length > 200 ? '...' : ''));
        console.log('    Match:', requestBodyMatch ? '✅ YES' : '❌ NO');
        
        // Path params comparison
        const originalPathParams = JSON.stringify(originalData.path_params || {});
        const currentPathParamsStr = JSON.stringify(currentPathParams || {});
        const pathParamsMatch = originalPathParams === currentPathParamsStr;
        console.log('\n  Path Params:');
        console.log('    Original:', originalPathParams);
        console.log('    Current:', currentPathParamsStr);
        console.log('    Match:', pathParamsMatch ? '✅ YES' : '❌ NO');
        
        // Query params comparison
        const originalQueryParams = JSON.stringify(originalData.query_params || {});
        const currentQueryParamsStr = JSON.stringify(currentQueryParams || {});
        const queryParamsMatch = originalQueryParams === currentQueryParamsStr;
        console.log('\n  Query Params:');
        console.log('    Original:', originalQueryParams);
        console.log('    Current:', currentQueryParamsStr);
        console.log('    Match:', queryParamsMatch ? '✅ YES' : '❌ NO');
        
        // Overall comparison
        const allMatch = nameMatch && requestBodyMatch && pathParamsMatch && queryParamsMatch;
        console.log('\n📊 Overall Comparison:');
        if (allMatch) {
          console.log('  ✅ ALL DATA MATCHES: No modifications detected');
          console.log('  ✅ Data integrity preserved - originalData === currentData');
        } else {
          console.log('  ⚠️ DATA WAS MODIFIED: Some fields differ from originalData');
          console.log('  Changed fields:', [
            !nameMatch && 'name',
            !requestBodyMatch && 'request_body',
            !pathParamsMatch && 'path_params',
            !queryParamsMatch && 'query_params'
          ].filter(Boolean).join(', '));
        }
      } else {
        console.log('\n⚠️ No originalData found for comparison');
      }
      
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('\n');
      
      return {
        name: step.name,
        request_body: currentRequestBody,
        path_params: currentPathParams,
        query_params: currentQueryParams,
        task_component: step.properties.originalData?.task_component,
        dependencies:
          dependenciesStep && dependenciesStep.name
            ? [dependenciesStep.name]
            : [],
      };
    }
  }

  function validationSequence(sequence: Step[]): boolean {
    return !sequence.some(step => {
      return step.componentType === 'task';
    });
  }

  function getMappingWorkflowTaskComponentRequestBody(
    task: ITaskResponse,
    taskComponentList: Array<ITaskComponentInfoResponse>,
    taskList: Array<ITaskResponse>,
  ): string {
    //request_body가 공백인 경우, 다른 task의 이름인 경우
    const condition =
      taskList.findIndex(el => el.name === task.request_body) !== -1 ||
      task.request_body === '';

    if (condition) {
      const taskInstance = taskComponentList.find(
        taskComponent => taskComponent.name === task.task_component,
      );
      return taskInstance?.data.options.request_body ?? '';
    }
    return task.request_body;
  }

  function designerFormDataReordering(sequence: Step[]) {
    const newSequence: Step[] = [];
    const taskGroupQueue: Step[] = [];

    sequence.forEach(step => {
      if (step.componentType === 'container') {
        taskGroupQueue.push(step);
      }
    });

    while (taskGroupQueue.length > 0) {
      const rootTaskGroup = taskGroupQueue.pop()!;
      const newTaskGroupSequence: Step[] = [];
      const queue: Step[] = [];

      const rootStep = rootTaskGroup.sequence?.find(step => {
        return (
          step.properties.originalData?.dependencies === null ||
          step.properties.originalData?.dependencies.length === 0
        );
      });

      if (rootStep) {
        queue.push(rootStep);
        newTaskGroupSequence.push(rootStep);
      }

      //dependency 를 기준으로 정렬하기 위한 while
      while (queue.length > 0) {
        const dependencyTask = queue.pop()!;

        const targetTask = rootTaskGroup.sequence?.find(step => {
          if (Array.isArray(step.properties.originalData?.dependencies)) {
            return (
              dependencyTask.name ===
              step.properties.originalData?.dependencies[0]
            );
          }
        });

        if (targetTask) {
          queue.push(targetTask);
          newTaskGroupSequence.push(targetTask);
        }

        const taskGroup = rootTaskGroup.sequence?.find(
          step => step.componentType === 'container',
        );

        if (taskGroup) {
          taskGroupQueue.push(taskGroup);
        }
      }
      rootTaskGroup.sequence = newTaskGroupSequence;
      newSequence.push(rootTaskGroup);
    }

    return newSequence;
  }

  return {
    workflowStore,
    dropDownModel,
    taskComponentList,
    toolboxSteps,
    setTaskComponent,
    setDropDownData,
    convertToDesignerTask,
    getWorkflowTemplateData,
    getWorkflowData,
    convertCicadaToDesignerFormData,
    convertDesignerSequenceToCicada,
    designerFormDataReordering,
  };
}
