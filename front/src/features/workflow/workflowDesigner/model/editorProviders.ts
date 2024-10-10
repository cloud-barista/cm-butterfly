import { insertDynamicComponent } from '@/shared/utils';
import TestCompo from '@/features/workflow/workflowDesigner/ui/TestCompo.vue';
import { getSequencePath } from '@/features/workflow/workflowEditor/model/utils.ts';

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
      console.log(step);
      console.log(definition);
      //각각에 만들어야할 Vue component 정의
      if (step.componentType === 'switch' && step.type == 'if') {
      }
      if (step.componentType === 'container' && step.type == 'MCI') {
      }
      if (step.componentType === 'task' && step.type == 'bettle_task') {
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
      }
      //instance, id와 value로 값저장 하는 방법도 있고 store에서 저장하는 방법도 있을듯

      const label = document.createElement('label');
      label.innerText = getSequencePath(definition.sequence, step.id) ?? '';
      editor.appendChild(label);

      return editor;
    },
  };
}
