import { ComponentType, Designer } from 'sequential-workflow-designer';
import Vue from 'vue';
import { Step } from 'sequential-workflow-model';

export function useFlowChart(refs: any) {
  const placeholder = refs.placeholder;

  function initDesigner() {
    const definition = {
      properties: {
        myProperty: 'my-value',
        // root properties...
      },
      sequence: [
        // steps...
      ],
    };
    const configuration = {
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
          return step.name !== 'x';
        },
      },

      validator: {
        // all validators are optional

        step: (step, parentSequence, definition) => {
          return /^[a-z]+$/.test(step.name);
        },
        root: definition => {
          return definition.properties['memory'] > 256;
        },
      },

      toolbox: {
        isCollapsed: false,
        groups: [
          {
            name: 'Group 1',
            steps: [
              {
                componentType: 'task',
                type: 'sendEmail',
                name: 'Save e-mail',
                properties: {
                  /* ... */
                },
              },
              // ...
            ],
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
          const editor = document.createElement('div');
          // ...
          const testCompo = Vue.extend();
          console.log(new testCompo());

          new testCompo().$mount(editor);

          return editor;
        },
        stepEditorProvider: (step, stepContext, definition, isReadonly) => {
          const editor = document.createElement('input');
          // ...
          return editor;
        },
      },

      controlBar: true,
      contextMenu: true,
    };

    const designer = Designer.create(placeholder, definition, configuration);
    designer.onDefinitionChanged.subscribe(newDefinition => {
      // ...
      console.log(newDefinition);
    });
  }

  return { initDesigner };
}
