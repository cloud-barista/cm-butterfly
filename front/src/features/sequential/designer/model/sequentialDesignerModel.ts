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
        // 중복 이름 체크 함수 (재귀적으로 전체 workflow 검사)
        function isNameDuplicate(sequence: any[], name: string, excludeId?: string): boolean {
          for (const s of sequence) {
            if (s.id !== excludeId && s.name === name) {
              return true;
            }
            if (s.sequence && s.sequence.length > 0) {
              if (isNameDuplicate(s.sequence, name, excludeId)) {
                return true;
              }
            }
          }
          return false;
        }

        // 고유한 이름 생성 함수
        function generateUniqueName(baseName: string): string {
          let newName = `${baseName}_${getRandomId().substring(0, 4)}`;
          // definition이 존재하면 중복 체크
          if (definition && definition.sequence) {
            while (isNameDuplicate(definition.sequence, newName)) {
              newName = `${baseName}_${getRandomId().substring(0, 4)}`;
            }
          }
          return newName;
        }

        if (step.componentType === 'container') {
          const baseName = step.name.replace(/_[a-z0-9]{4}$/i, ''); // 기존 suffix 제거
          step.name = generateUniqueName(baseName);
          console.log('🏷️ Container name set to:', step.name);
        } else if (step.componentType === 'launchPad') {
          const baseName = step.name.replace(/_[a-z0-9]{4}$/i, ''); // 기존 suffix 제거
          step.name = generateUniqueName(baseName);
          console.log('🏷️ Parrel name set to:', step.name);
          console.log('🚀 Parrel created - tasks will run in parallel (horizontal layout)');
        } else if (step.componentType === 'task') {
          // Toolbox에서 추가하는 경우 (step.name === step.type)
          if (step.name === step.type) {
            step.name = generateUniqueName(step.type);
            console.log('🏷️ Task name auto-generated:', step.name);
            console.log('   step.type:', step.type);
          } 
          // Duplicate하는 경우 또는 저장된 workflow 로드하는 경우
          else {
            // 중복 체크: definition이 있고 이름이 중복되면 새로운 이름 생성
            if (definition && definition.sequence && isNameDuplicate(definition.sequence, step.name, step.id)) {
              const baseName = step.name.replace(/_[a-z0-9]{4}$/i, ''); // 기존 suffix 제거
              step.name = generateUniqueName(baseName);
              console.log('🏷️ Task name regenerated (duplicate detected):', step.name);
            } else {
              console.log('🏷️ Task name preserved:', step.name);
            }
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
          // Parrel과 If는 현재 지원하지 않으므로 숨김
          // toolboxSteps().defineParrelStep(
          //   getRandomId(),
          //   'Parrel',
          //   { model: {} },
          // ),
          // toolboxSteps().defineIfStep(
          //   getRandomId(),
          //   [],
          //   [],
          // ),
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
