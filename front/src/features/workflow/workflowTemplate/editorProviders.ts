import { insertDynamicComponent } from '@/shared/utils';
import TestCompo from '@/features/workflow/workflowTemplate/ui/TestCompo.vue';

export function editorProviders() {
  const editor = document.createElement('div');
  editor.style.width = '100%';
  editor.style.height = '100%';
  editor.style.overflow = 'scroll';
  return {
    defaultRootEditorProvider: function (definition, rootContext, isReadonly) {
      const textArea = document.createElement('textarea');
      textArea.style.width = '100%';
      textArea.style.height = '95%';
      textArea.setAttribute('readonly', 'readonly');
      textArea.value = JSON.stringify(definition, null, 2);

      editor.appendChild(textArea);
      return editor;
    },
    defaultStepEditorProvider: function (
      step,
      stepContext,
      definition,
      isReadonly,
    ) {
      if (step.componentType === 'container' && step.type === 'loop') {
      }

      if (step.componentType === 'task' && step.type === 'task') {
      }

      if (step.componentType === 'task' && step.type === 'write') {
      }

      if (step.componentType === 'switch' && step.type === 'if') {
      }

      if (step.componentType === 'switch' && step.type === 'parallel') {
      }

      if (step.componentType === 'task' && step.type == 'InfraMigration') {
      }
      //instance, id와 value로 값저장 하는 방법도 있고 store에서 저장하는 방법도 있을듯

      insertDynamicComponent(
        TestCompo,
        { id: 'tst' },
        {
          'button-click': () => {
            console.log('event 발생');
          },
        },
        editor,
      );
      return editor;
    },
  };
}
