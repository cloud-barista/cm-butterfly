import { ComponentType, Designer } from 'sequential-workflow-designer';
import Vue, { CreateElement, h, ref, RenderContext, VNode } from 'vue';
import { Step } from 'sequential-workflow-model';
import TestCompo from '@/features/workflow/workflowTemplate/ui/TestCompo.vue';
import { insertDynamicComponent } from '@/shared/utils';
import { DefaultProps } from 'vue/types/options';

export function useFlowChart(refs: any) {
  let designer: any = null;

  const placeholder = refs.placeholder;
  const testId = ref<string>('');

  function initDesigner() {
    if (designer) {
      designer.destroy();
    }

    const definition = getDefinition();

    const configuration = getConfigulation();
    designer = Designer.create(placeholder, definition, configuration);
    designer.onDefinitionChanged.subscribe(newDefinition => {
      // ...
      console.log(newDefinition);
    });
  }

  function getDefinition() {
    return {
      properties: {
        myProperty: 'my-value',
        // root properties...
      },
      sequence: [
        // steps...
      ],
    };
  }

  function getConfigulation() {
    return {
      theme: 'light', // optional, default: 'light'
      isReadonly: false, // optional, default: false
      undoStackSize: 10, // optional, default: 0 - disabled, 1+ - enabled

      steps: {
        // all properties in this section are optional

        iconUrlProvider: (componentType: ComponentType, type) => {
          return `/src/shared/asset/image/testSvg.svg`;
        },

        isDraggable: (step: Step, parentSequence) => {
          return step.name !== 'y';
        },
        isDeletable: (step: Step, parentSequence) => {
          return step.properties['isDeletable'];
        },
        isDuplicable: (step: Step, parentSequence) => {
          return true;
        },
        canInsertStep: (step: Step, targetSequence, targetIndex) => {
          return targetSequence.length < 5;
        },
        canMoveStep: (
          sourceSequence,
          step: Step,
          targetSequence,
          targetIndex,
        ) => {
          console.log(step);
          console.log(sourceSequence);
          return !step.properties['isLocked'];
        },
        canDeleteStep: (step: Step, parentSequence) => {
          return confirm('Are you sure?');
        },
        isAutoSelectDisabled: true,
      },

      validator: {
        // all validators are optional

        step: (step, parentSequence, definition) => {
          return true;
        },
        root: definition => {
          return true;
        },
      },

      toolbox: {
        isCollapsed: false,
        groups: [
          {
            name: 'Group 1',
            steps: [],
          },
          {
            name: 'Notification',
            steps: [
              // steps for the toolbox's group
            ],
          },
        ],
      },

      editors: {
        isCollapsed: false,
        rootEditorProvider: (definition, rootContext, isReadonly) => {
          console.log(definition);
          console.log(rootContext);
          const editor = document.createElement('div');

          //instance, id와 value로 값저장 하는 방법도 있고 store에서 저장하는 방법도 있을듯
          let e = insertDynamicComponent(
            TestCompo,
            { id: testId.value },
            {
              'button-click': () => (testId.value = '변경됨'),
            },
            editor,
          );
          return editor;
        },
        stepEditorProvider: (step, stepContext, definition, isReadonly) => {
          console.log(step);
          console.log(stepContext);
          console.log(definition);
          const editor = document.createElement('div');
          // ...
          return editor;
        },
      },

      controlBar: true,
      contextMenu: true,
    };
  }

  return { initDesigner };
}
