import {
  Designer,
  DesignerConfiguration,
  Sequence,
} from 'sequential-workflow-designer';
import { Definition, Step } from 'sequential-workflow-model';
import getRandomId from '@/shared/utils/uuid';
import { toolboxSteps } from '@/features/workflow/workflowDesigner/model/toolboxSteps.ts';
import { editorProviders } from '@/features/workflow/workflowDesigner/model/editorProviders.ts';

export function useFlowChartModel(refs: any) {
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
      isCollapsed: false,
    },
  };
  let definition: Definition;
  let configuration: DesignerConfiguration<Definition>;

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
        return true;
      },
      canMoveStep: (sourceSequence, step, targetSequence, targetIndex) => {
        return !step.properties['isLocked'];
      },
      canDeleteStep: (step, parentSequence) => {
        return confirm('Are you sure?');
      },
    };
  }

  function defineStepValidate() {
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

  function defineToolboxGroups() {
    return [
      {
        name: 'Tool',
        steps: [toolboxSteps().defineIfStep(getRandomId(), [], [])],
      },
      {
        name: 'Components',
        steps: [
          toolboxSteps().defineTaskGroupStep(getRandomId()),
          toolboxSteps().defineBettleTaskStep(getRandomId()),
        ],
      },
    ];
  }

  function loadConfiguration() {
    return {
      steps: defineStepEvent(),
      validator: defineStepValidate(),
      toolbox: {
        isCollapsed: designerOptionsState.toolbox.isCollapsed,
        groups: defineToolboxGroups(),
      },

      editors: {
        isCollapsed: designerOptionsState.editors.isCollapsed,
        rootEditorProvider: (definition, rootContext, isReadonly) => {
          return editorProviders().defaultRootEditorProvider(
            definition,
            rootContext,
            isReadonly,
          );
        },
        stepEditorProvider: (step, stepContext, definition, isReadonly) => {
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
    designer.onDefinitionChanged.subscribe(newDefinition => {
      // ...
      // console.log(newDefinition);
    });
  }

  return {
    designer,
    designerOptionsState,
    setDefaultSequence,
    initDesigner,
    draw,
  };
}
