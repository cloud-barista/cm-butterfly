import { insertDynamicComponent } from '@/shared/utils';
import { getSequencePath } from '@/features/workflow/workflowEditor/sequential/designer/editor/model/utils.ts';
import BeetleTaskEditor from '@/features/workflow/workflowEditor/sequential/designer/editor/ui/BeetleTaskEditor.vue';

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
      console.log('step !');
      console.log(step.properties);
      //각각에 만들어야할 Vue component 정의
      if (step.componentType === 'switch' && step.type == 'if') {
      }
      if (step.componentType === 'container') {
      }
      if (step.componentType === 'task') {
        //toolboxModel에서 가공하는곳 참고

        insertDynamicComponent(BeetleTaskEditor, { step }, {}, editor);
      }
      //instance, id와 value로 값저장 하는 방법도 있고 store에서 저장하는 방법도 있을듯

      const label = document.createElement('label');
      label.innerText = getSequencePath(definition.sequence, step.id) ?? '';
      editor.appendChild(label);

      return editor;
    },
  };
}
