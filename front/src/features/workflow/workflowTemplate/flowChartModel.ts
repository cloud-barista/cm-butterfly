import { Designer, DesignerConfiguration } from 'sequential-workflow-designer';
import Vue, {
  CreateElement,
  h,
  reactive,
  ref,
  RenderContext,
  VNode,
} from 'vue';
import TestCompo from '@/features/workflow/workflowTemplate/ui/TestCompo.vue';
import { insertDynamicComponent } from '@/shared/utils';
import { Definition } from 'sequential-workflow-model';
import Uuid from '@/shared/utils/uuid';
import getRandomId from '@/shared/utils/uuid';

export function useFlowChartModel(refs: any) {
  let designer: any = null;

  const placeholder = refs.placeholder;
  let test2Id = ref('');
  const designerOptionsState = {
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
      isCollapsed: false,
    },
  };
  let definition: Definition;
  let configuration: DesignerConfiguration<Definition>;

  function getDefinition(workflowName: string) {
    return {
      properties: {
        workflow: workflowName,
      },
      sequence: setDefaultSequence([]),
    };
  }

  function setDefaultSequence(serverData: any): Array<any> {
    return [...serverData];
  }

  function getStepEvent() {
    return {
      // all properties in this section are optional
      iconUrlProvider: (componentType, type) => {
        return `/src/shared/asset/image/testSvg.svg`;
      },

      isDraggable: (step, parentSequence) => {
        return step.name !== 'y';
      },
      isDeletable: (step, parentSequence) => {
        return step.properties['isDeletable'];
      },
      isDuplicable: (step, parentSequence) => {
        return true;
      },
      canInsertStep: (step, targetSequence, targetIndex) => {
        console.log('can insert@@@@@@');
        console.log(step);
        console.log(JSON.parse(JSON.stringify(targetSequence)));
        console.log(targetIndex);
        console.log('can insert#####');
        return true;
      },
      canMoveStep: (sourceSequence, step, targetSequence, targetIndex) => {
        console.log(sourceSequence);
        console.log(targetSequence);
        return !step.properties['isLocked'];
      },
      canDeleteStep: (step, parentSequence) => {
        return confirm('Are you sure?');
      },
    };
  }

  function getStepValidate() {
    return {
      // all validators are optional

      step: (step, parentSequence, definition) => {
        return true;
      },
      root: definition => {
        return true;
      },
    };
  }

  function getEditorsSetting() {
    return {
      rootEditorProvider: function (definition, rootContext, isReadonly) {
        const editor = document.createElement('div');
        console.log(definition);
        //instance, id와 value로 값저장 하는 방법도 있고 store에서 저장하는 방법도 있을듯
        let e = insertDynamicComponent(
          TestCompo,
          { id: test2Id },
          {
            'button-click': () => {
              console.log('event 발생');
              // test2Id.id = '변경됨';
              // e.$props.id = 'test!';
              test2Id.value = 'asd';
            },
          },
          editor,
        );
        return editor;
      },
      stepEditorProvider: function (step, stepContext, definition, isReadonly) {
        const editor = document.createElement('div');
        return editor;
      },
    };
  }

  function getToolboxGroups() {
    return [
      {
        name: 'Components',
        steps: [
          {
            componentType: 'container',
            id: getRandomId(),
            type: 'foreach',
            name: 'Task Group',
            properties: {
              isDeletable: true,
            },
            sequence: [
              //task
            ],
          },
          {
            componentType: 'task',
            id: getRandomId(),
            type: 'task',
            name: 'bettle_task',
            properties: {
              isDeletable: true,
            },
            sequence: [
              // 없어야함.
            ],
          },
        ],
      },
    ];
  }

  function getConfiguration() {
    return {
      steps: getStepEvent(),
      validator: getStepValidate(),
      toolbox: {
        isCollapsed: designerOptionsState.toolbox.isCollapsed,
        groups: getToolboxGroups(),
      },

      editors: {
        isCollapsed: designerOptionsState.editors.isCollapsed,
        rootEditorProvider: (definition, rootContext, isReadonly) => {
          return getEditorsSetting().rootEditorProvider(
            definition,
            rootContext,
            isReadonly,
          );
        },
        stepEditorProvider: (step, stepContext, definition, isReadonly) => {
          return getEditorsSetting().stepEditorProvider(
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

  function initDesigner(readOnly: boolean = false) {
    if (designer) {
      designer.destroy();
    }
    definition = getDefinition('test');
    configuration = getConfiguration();
  }

  function draw() {
    designer = Designer.create(placeholder, definition, configuration);
    designer.onDefinitionChanged.subscribe(newDefinition => {
      // ...
      // console.log(newDefinition);
    });
  }

  return { designerOptionsState, initDesigner, draw };
}
