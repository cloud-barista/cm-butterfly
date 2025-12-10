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

    console.log(`📥 Loading workflow...`);
    console.log(`   Total TaskGroups: ${workflow.data.task_groups.length}`);
    
    if (!workflow.data.task_groups || workflow.data.task_groups.length === 0) {
      console.warn('⚠️  No task groups found in workflow');
      return { sequence: [] };
    }
    
    // 각 TaskGroup을 순회
    for (const taskGroup of workflow.data.task_groups) {
      console.log(`📦 Processing TaskGroup: ${taskGroup.name}`);
      
      // __root_task_group_*__ 패턴인 경우 unwrap (root-level task)
      if (taskGroup.name.startsWith('__root_task_group_') && taskGroup.name.endsWith('__')) {
        console.log(`  🔓 Unwrapping virtual group: ${taskGroup.name}`);
        
        if (taskGroup.tasks && taskGroup.tasks.length === 1) {
          const task = taskGroup.tasks[0];
          const requestBody = getMappingWorkflowTaskComponentRequestBody(
            task,
            taskComponentList,
            taskGroup.tasks,
          );
          const currentDesignerTask = convertToDesignerTask(task, requestBody);
          sequence.push(currentDesignerTask);
          console.log(`    └─ Root task restored: ${task.name}`);
        }
      } else {
        // 일반 TaskGroup 복원
        const designerTaskGroup = convertToDesignerTaskGroup(taskGroup);
        
        if (taskGroup.tasks) {
          for (const task of taskGroup.tasks) {
            const requestBody = getMappingWorkflowTaskComponentRequestBody(
              task,
              taskComponentList,
              taskGroup.tasks,
            );
            const currentDesignerTask = convertToDesignerTask(task, requestBody);
            designerTaskGroup.sequence!.push(currentDesignerTask);
            console.log(`    ├─ Task: ${task.name}`);
          }
        }
        
        sequence.push(designerTaskGroup);
        console.log(`  ✅ TaskGroup restored: ${taskGroup.name} (${taskGroup.tasks?.length || 0} tasks)`);
      }
    }
    
    console.log(`\n✅ Loaded ${sequence.length} items`);
    console.log('📋 Sequence:', sequence.map(s => ({
      name: s.name,
      type: s.componentType,
      children: s.sequence?.length || 0
    })));

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
    
    // Base64 decode content field for cicada_task_run_script
    // cicada_task_run_script 태스크의 content 필드를 base64로 디코딩
    if (task.task_component === 'cicada_task_run_script' && parsedString.content) {
      console.log('🔓 Decoding content field for cicada_task_run_script');
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
    // Option 2: 여러 개의 TaskGroup 지원 테스트
    // Backend가 실제로 multiple TaskGroups를 처리할 수 있는지 확인
    
    const result: ITaskGroupResponse[] = [];
    const containerLastTasksMap = new Map<string, string[]>();
    
    console.log('\n🔄 Converting sequence to Cicada format (Multiple TaskGroups)...');
    
    sequence.forEach((step, index) => {
      // 이전 형제의 마지막 task 가져오기
      const previousSiblingLastTasks: string[] = [];
      if (index > 0) {
        const prevSibling = sequence[index - 1];
        const lastTasks = containerLastTasksMap.get(prevSibling.id);
        if (lastTasks && lastTasks.length > 0) {
          previousSiblingLastTasks.push(...lastTasks);
        }
      }
      
      if (step.componentType === 'container' || step.componentType === 'launchPad') {
        // TaskGroup 생성
        const taskGroup: ITaskGroupResponse = {
          name: step.name,
          description: step.properties.model?.['description'] ?? '',
          tasks: [],
        };
        
        const tasks: any[] = [];
        const lastTasksInContainer: string[] = [];
        const isParallel = step.componentType === 'launchPad';
        
        // Container 내부의 task들 처리
        if (step.sequence) {
          step.sequence.forEach((innerStep, innerIndex) => {
            if (innerStep.componentType === 'task') {
              let taskDeps: string[] = [];
              
              if (isParallel) {
                // Parrel: 모든 task가 같은 dependency 가짐
                if (innerIndex === 0) {
                  taskDeps = previousSiblingLastTasks;
                } else {
                  taskDeps = previousSiblingLastTasks;
                }
                lastTasksInContainer.push(innerStep.name);
              } else {
                // TaskGroup: 순차 실행
                if (innerIndex === 0) {
                  taskDeps = previousSiblingLastTasks;
                } else {
                  // 이전 task에 의존
                  taskDeps = [tasks[tasks.length - 1].name];
                }
                lastTasksInContainer.length = 0;
                lastTasksInContainer.push(innerStep.name);
              }
              
              const task = convertToCicadaTaskWithDependencies(innerStep, taskDeps);
              tasks.push(task);
              console.log(`  ├─ ${step.name}.${innerStep.name}, deps: [${taskDeps.join(', ')}]`);
            }
          });
        }
        
        taskGroup.tasks = tasks;
        
        // 마지막 task(들) 기록
        if (lastTasksInContainer.length > 0) {
          containerLastTasksMap.set(step.id, lastTasksInContainer);
        }
        
        result.push(taskGroup);
        console.log(`📦 TaskGroup added: ${step.name} (${tasks.length} tasks)`);
        
      } else if (step.componentType === 'task') {
        // Root-level task를 개별 TaskGroup으로 감싸기
        const task = convertToCicadaTaskWithDependencies(step, previousSiblingLastTasks);
        
        const virtualTaskGroup: ITaskGroupResponse = {
          name: `__root_task_group_${step.name}__`,
          description: 'Virtual task group for root-level task',
          tasks: [task],
        };
        
        result.push(virtualTaskGroup);
        containerLastTasksMap.set(step.id, [step.name]);
        
        console.log(`📝 Root task wrapped: ${step.name} → __root_task_group_${step.name}__, deps: [${previousSiblingLastTasks.join(', ')}]`);
      }
    });
    
    console.log(`\n✅ Total TaskGroups: ${result.length}`);
    result.forEach((tg, i) => console.log(`   [${i}] ${tg.name} (${tg.tasks.length} tasks)`));
    
    return result;
  }

  function convertToCicadaTaskWithDependencies(step: Step, dependencies: string[]) {
    if (step.componentType === 'task') {
      // Base64 encode content field for cicada_task_run_script
      const modelToSend: any = { ...step.properties.model };
      const taskComponent = step.properties.originalData?.task_component;
      
      if (taskComponent === 'cicada_task_run_script' && modelToSend.content) {
        modelToSend.content = encodeBase64(modelToSend.content);
      }
      
      const currentRequestBody = JSON.stringify(modelToSend);
      const currentPathParams = step.properties.fixedModel?.path_params;
      const currentQueryParams = step.properties.fixedModel?.query_params;
      
      console.log('\n=== Task Conversion ===');
      console.log('Task:', step.name);
      console.log('Dependencies:', dependencies);
      console.log('Task Component:', taskComponent);
      
      return {
        name: step.name,
        request_body: currentRequestBody,
        path_params: currentPathParams,
        query_params: currentQueryParams,
        task_component: step.properties.originalData?.task_component,
        dependencies: dependencies,
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
      if (step.componentType === 'container' || step.componentType === 'launchPad') {
        taskGroupQueue.push(step);
      } else if (step.componentType === 'task') {
        // Root-level task는 그대로 유지 (reordering 불필요)
        newSequence.push(step);
      }
    });

    while (taskGroupQueue.length > 0) {
      const rootTaskGroup = taskGroupQueue.pop()!;
      const newTaskGroupSequence: Step[] = [];
      const queue: Step[] = [];

      // parallel 컨테이너인 경우 정렬하지 않고 그대로 유지 (병렬 실행이므로 순서 무관)
      const isParallel = rootTaskGroup.componentType === 'launchPad' ||
                        rootTaskGroup.type === 'parallelGroup' || 
                        rootTaskGroup.properties.isParallel === true;
      
      if (isParallel) {
        const layoutType = rootTaskGroup.componentType === 'launchPad' ? 'horizontal' : 'vertical';
        console.log(`🔀 Skipping reordering for parallel container (${layoutType}):`, rootTaskGroup.name);
        newSequence.push(rootTaskGroup);
        continue;
      }

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
          step => step.componentType === 'container' || step.componentType === 'launchPad',
        );

        if (taskGroup) {
          taskGroupQueue.push(taskGroup);
        }
      }
      rootTaskGroup.sequence = newTaskGroupSequence;
      newSequence.push(rootTaskGroup);
    }

    console.log(`🔄 Reordering complete: ${newSequence.length} steps (${newSequence.filter(s => s.componentType === 'task').length} root tasks, ${newSequence.filter(s => s.componentType === 'container' || s.componentType === 'launchPad').length} containers)`);

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
