import { Step } from '@/features/workflow/workflowEditor/model/types';

export function toolboxSteps() {
  return {
    defineIfStep(id: string, trueSteps: Step[], falseSteps: Step[]) {
      return {
        componentType: 'switch',
        id,
        type: 'if',
        name: 'If',
        properties: {
          isDeletable: true,
        },
        branches: {
          true: trueSteps,
          false: falseSteps,
        },
      };
    },

    defineTaskGroupStep(
      id: string,
      name: string,
      type: string,
      properties: { model: object },
    ): Step {
      return {
        componentType: 'container',
        id,
        type,
        name,
        properties: {
          isDeletable: true,
          ...properties,
        },
        sequence: [
          //task
        ],
      };
    },
    defineBettleTaskStep(
      id: string,
      name: string,
      type: string,
      properties: {
        model: object;
        fixedModel: {
          path_params: Record<string, string>;
          query_params: Record<string, string>;
        };
        originalData: any;
      },
    ): Step {
      return {
        componentType: 'task',
        id,
        type,
        name,
        properties: {
          isDeletable: true,
          ...properties,
        },
        sequence: [
          // 없어야함.
        ],
      };
    },
  };
}
