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
import { Definition, Step } from 'sequential-workflow-model';
import Uuid from '@/shared/utils/uuid';
import getRandomId from '@/shared/utils/uuid';
import { toolboxSteps } from '@/features/workflow/workflowTemplate/toolboxSteps.ts';
import { editorProviders } from '@/features/workflow/workflowTemplate/editorProviders.ts';

export function useFlowChartModel(refs: any) {
  let designer: any = null;

  const placeholder = refs.placeholder;
  const steps: Record<string, Step> = {};
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

  function defineDefaultDefinition(workflowName: string) {
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

  function initDesigner() {
    if (designer) {
      designer.destroy();
    }
    definition = defineDefaultDefinition('test');
    configuration = loadConfiguration();
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
