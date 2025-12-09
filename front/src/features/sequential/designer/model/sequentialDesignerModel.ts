import {
  Designer,
  DesignerConfiguration,
  Sequence,
} from 'sequential-workflow-designer';
import { Definition, Step } from 'sequential-workflow-model';
import getRandomId from '@/shared/utils/uuid';
import { toolboxSteps } from '@/features/sequential/designer/toolbox/model/toolboxSteps';
import { editorProviders } from '@/features/sequential/designer/editor/model/editorProviders';
import testSvg from '@/shared/asset/image/testSvg.svg';

export function useSequentialDesignerModel(refs: any) {
  let designer: Designer | null = null;
  const placeholder = refs.placeholder;
  const designerOptionsState: any = {
    id: '',
    name: '',
    sequence: [],
    others: {
      theme: 'light',
      isReadonly: false, // optional, default: false
      undoStackSize: 10, // optional, default: 0 - disabled, 1+ - enabled
      controlBar: true,
      contextMenu: true,
    },
    toolbox: {
      isCollapsed: false,
    },
    editors: {
      isCollapsed: true,
    },
  };
  let definition: Definition;
  let configuration: DesignerConfiguration<Definition>;
  let toolBoxGroup: Array<{ name: string; steps: Step[] }> = [
    {
      name: 'Tool',
      steps: [],
    },
    {
      name: 'taskGroup',
      steps: [],
    },
    {
      name: 'Components',
      steps: [],
    },
  ];

  function defineDefaultDefinition(workflowName: string, sequence: Step[]) {
    return {
      properties: {
        workflow: workflowName,
      },
      sequence: sequence,
    };
  }

  function defineStepEvent() {
    return {
      // all properties in this section are optional
      iconUrlProvider: (componentType: any, type: any) => {
        return testSvg;
      },
      //
      // isDraggable: (step, parentSequence) => {
      //   return step.name !== 'y';
      // },
      isDeletable: (step, parentSequence) => {
        return step.properties['isDeletable'];
      },
      isDuplicable: (step, parentSequence) => {
        return true;
      },
      canInsertStep: (step, targetSequence, targetIndex) => {
        if (step.componentType === 'container') {
          step.name = `${step.name}_${getRandomId().substring(0, 4)}`;
          console.log('🏷️ Container name set to:', step.name);
        } else if (step.componentType === 'launchPad') {
          step.name = `${step.name}_${getRandomId().substring(0, 4)}`;
          console.log('🏷️ Launch Pad name set to:', step.name);
        } else if (step.componentType === 'task') {
          // step.name이 step.type과 같을 때만 고유한 이름 생성
          // 저장된 workflow의 경우 이미 고유한 이름(예: beetle_task_a3f2)을 가지고 있으므로 유지
          if (step.name === step.type) {
            const newName = `${step.type}_${getRandomId().substring(0, 4)}`;
            step.name = newName;
            console.log('🏷️ Task name auto-generated:', newName);
            console.log('   step.type:', step.type);
          } else {
            console.log('🏷️ Task name preserved (from saved workflow):', step.name);
          }
        }
        return true;
      },
      // canMoveStep: (sourceSequence, step, targetSequence, targetIndex) => {
      //   return !step.properties['isLocked'];
      // },
      // canDeleteStep: (step, parentSequence) => {
      //   return confirm('Are you sure?');
      // },
    };
  }

  function defineStepValidate() {
    return {
      step: (step, parentSequence, definition) => {
        // console.log('parentSequence');
        // console.log(parentSequence);
        // console.log(definition);
        return true;
      },
      root: definition => {
        return true;
      },
    };
  }

  function setToolboxGroupsSteps(
    toolSteps: Step[] | null,
    taskGroupSteps: Step[] | null,
    componentSteps: Step[],
  ) {
    toolBoxGroup = [
      {
        name: 'Tool',
        steps: toolSteps ?? [],
      },
      {
        name: 'TaskGroup',
        steps: taskGroupSteps ?? [
          toolboxSteps().defineTaskGroupStep(
            getRandomId(),
            'TaskGroup',
            'taskGroup',
            { model: {} },
          ),
          toolboxSteps().defineLaunchPadStep(
            getRandomId(),
            'Launch Pad',
            { model: {} },
          ),
          toolboxSteps().defineIfStep(
            getRandomId(),
            [],
            [],
          ),
        ],
      },
      {
        name: 'Components',
        steps: componentSteps,
      },
    ];
    // console.log(toolBoxGroup);
  }

  function loadConfiguration() {
    return {
      steps: defineStepEvent(),
      validator: defineStepValidate(),
      toolbox: {
        isCollapsed: designerOptionsState.toolbox.isCollapsed,
        groups: toolBoxGroup,
      },

      editors: {
        isCollapsed: designerOptionsState.editors.isCollapsed,
        rootEditorProvider: (definition, rootContext, isReadonly) => {
          designer?.setIsEditorCollapsed(true);
          return editorProviders().defaultRootEditorProvider(
            definition,
            rootContext,
            isReadonly,
          );
        },
        stepEditorProvider: (step, stepContext, definition, isReadonly) => {
          designer?.setIsEditorCollapsed(false);
          return editorProviders().defaultStepEditorProvider(
            step,
            stepContext,
            definition,
            isReadonly,
          );
        },
      },
      ...designerOptionsState.others,
    };
  }

  function setDefaultSequence(sequence: Sequence) {
    designerOptionsState.sequence = [...sequence];
  }

  function initDesigner() {
    if (designer) {
      designer.destroy();
    }
    definition = defineDefaultDefinition(
      designerOptionsState.name,
      designerOptionsState.sequence,
    );
    configuration = loadConfiguration();
  }

  function draw() {
    designer = Designer.create(placeholder, definition, configuration);
    designer.onDefinitionChanged.subscribe(newDefinition => {});
  }

  function getDesigner(): Designer | null {
    return designer;
  }

  return {
    designer,
    designerOptionsState,
    setDefaultSequence,
    setToolboxGroupsSteps,
    initDesigner,
    draw,
    getDesigner,
  };
}
