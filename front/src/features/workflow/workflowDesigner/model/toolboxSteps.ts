import { Step } from 'sequential-workflow-model';

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
    defineTaskGroupStep(id: string) {
      return {
        componentType: 'container',
        id,
        type: 'MCI',
        name: 'Task Group',
        properties: {
          isDeletable: true,
        },
        sequence: [
          //task
        ],
      };
    },
    defineBettleTaskStep(id: string) {
      return {
        componentType: 'task',
        id,
        type: 'bettle_task',
        name: 'bettle_task',
        properties: {
          isDeletable: true,
        },
        sequence: [
          // 없어야함.
        ],
      };
    },
  };
}
