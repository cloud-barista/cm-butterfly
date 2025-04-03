import { Step as _Step } from 'sequential-workflow-model';

interface Step extends _Step {
  sequence?: Step[];
  branches?: { true: Step[]; false: Step[] };
}

export function getSequencePath(
  sequence: Step[],
  targetId: string,
): string | undefined {
  const stepStack: { step: Step; path: string }[] = [];
  sequence.forEach(step => {
    stepStack.push({ step, path: step.type });
  });

  while (stepStack.length > 0) {
    const { step, path } = stepStack.pop() as (typeof stepStack)[0];

    if (step.id === targetId) {
      return path;
    }

    if (step.sequence) {
      step.sequence.forEach((step: Step) => {
        stepStack.push({ step, path: `${path}/${step.name}` });
      });
    }

    if (step.branches) {
      if (step.branches.true) {
        step.branches.true.forEach((step: Step) => {
          stepStack.push({ step, path: `${path}/[true]${step.name}` });
        });
      }

      if (step.branches.false) {
        step.branches.false.forEach((step: Step) => {
          stepStack.push({ step, path: `${path}/[false]${step.name}` });
        });
      }
    }
  }

  return undefined;
}
