import { insertDynamicComponent } from '@/shared/utils';
import { getSequencePath } from '@/features/sequential/designer/editor/model/utils';
import TaskComponentEditor from '@/features/sequential/designer/editor/ui/TaskComponentEditor.vue';

export function editorProviders() {
  const editor = document.createElement('div');
  editor.style.width = '100%';
  editor.style.height = '100%';

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
      //각각에 만들어야할 Vue component 정의
      if (step.componentType === 'switch' && step.type == 'if') {
        const ifEditor = document.createElement('div');
        ifEditor.className = 'sqd-editor-wrapper';
        ifEditor.innerHTML = `
          <div class="sqd-editor-header">If Step Settings</div>
          <div class="sqd-editor-body">
            <div class="sqd-editor-field">
              <label>Name:</label>
              <input type="text" id="if-name" value="${step.name}" style="width: 100%; padding: 8px; margin-top: 4px;" />
            </div>
            <p style="margin-top: 16px; color: #666;">조건에 따라 true 또는 false 브랜치로 분기합니다.</p>
          </div>
        `;

        const nameInput = ifEditor.querySelector('#if-name') as HTMLInputElement;
        nameInput?.addEventListener('input', (e) => {
          step.name = (e.target as HTMLInputElement).value;
          stepContext.notifyNameChanged();
        });

        editor.appendChild(ifEditor);
      }
      if (step.componentType === 'launchPad') {
        const launchPadEditor = document.createElement('div');
        launchPadEditor.className = 'sqd-editor-wrapper';
        launchPadEditor.innerHTML = `
          <div class="sqd-editor-header">Launch Pad Settings</div>
          <div class="sqd-editor-body">
            <div class="sqd-editor-field">
              <label>Name:</label>
              <input type="text" id="launchpad-name" value="${step.name}" style="width: 100%; padding: 8px; margin-top: 4px;" />
            </div>
            <div style="margin-top: 16px; padding: 12px; background: #e8f5e9; border-left: 4px solid #4caf50; border-radius: 4px;">
              <strong style="color: #2e7d32;">🚀 수평 병렬 실행</strong>
              <p style="margin-top: 8px; color: #424242; font-size: 13px;">이 Launch Pad 내의 모든 task가 수평으로 배치되며 동시에 실행됩니다.</p>
            </div>
          </div>
        `;

        const nameInput = launchPadEditor.querySelector('#launchpad-name') as HTMLInputElement;
        nameInput?.addEventListener('input', (e) => {
          step.name = (e.target as HTMLInputElement).value;
          stepContext.notifyNameChanged();
        });

        editor.appendChild(launchPadEditor);
      }
      if (step.componentType === 'container' && step.type === 'parallelGroup') {
        const parallelEditor = document.createElement('div');
        parallelEditor.className = 'sqd-editor-wrapper';
        parallelEditor.innerHTML = `
          <div class="sqd-editor-header">Parallel Group Settings</div>
          <div class="sqd-editor-body">
            <div class="sqd-editor-field">
              <label>Name:</label>
              <input type="text" id="parallel-name" value="${step.name}" style="width: 100%; padding: 8px; margin-top: 4px;" />
            </div>
            <div class="sqd-editor-field" style="margin-top: 12px;">
              <label>Description:</label>
              <textarea id="parallel-description" style="width: 100%; padding: 8px; margin-top: 4px; min-height: 60px;">${step.properties.model?.['description'] || ''}</textarea>
            </div>
            <div style="margin-top: 16px; padding: 12px; background: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 4px;">
              <strong style="color: #1976d2;">🔀 수직 병렬 실행</strong>
              <p style="margin-top: 8px; color: #424242; font-size: 13px;">이 그룹 내의 모든 task가 수직으로 배치되며 동시에 실행됩니다.</p>
            </div>
          </div>
        `;

        const nameInput = parallelEditor.querySelector('#parallel-name') as HTMLInputElement;
        const descInput = parallelEditor.querySelector('#parallel-description') as HTMLTextAreaElement;
        
        nameInput?.addEventListener('input', (e) => {
          step.name = (e.target as HTMLInputElement).value;
          stepContext.notifyNameChanged();
        });
        
        descInput?.addEventListener('input', (e) => {
          if (!step.properties.model) {
            step.properties.model = {};
          }
          (step.properties.model as any).description = (e.target as HTMLTextAreaElement).value;
          stepContext.notifyPropertiesChanged();
        });

        editor.appendChild(parallelEditor);
      }
      if (step.componentType === 'container') {
      }
      if (step.componentType === 'task') {
        // 🎯 모든 task에 대해 범용 TaskComponentEditor 사용
        const TaskEditorComponent: any = TaskComponentEditor;
        
        // 디버깅을 위한 로그 추가
        console.log('=== Task Editor Selection Debug ===');
        console.log('Step name:', step.name);
        console.log('Step type:', step.type);
        console.log('Step properties:', step.properties);
        console.log('Step fixedModel:', step.properties?.fixedModel);
        console.log('Task component from fixedModel:', step.properties?.fixedModel?.task_component);
        console.log('Selected TaskComponentEditor for', step.name || step.type);
        console.log('Final TaskEditorComponent:', TaskEditorComponent.name || TaskEditorComponent);
        console.log('=====================================');
        
        //toolboxModel에서 가공하는곳 참고
        insertDynamicComponent(
          TaskEditorComponent,
          { step },
          {
            saveComponentName: e => {
              step.name = e;
              stepContext.notifyNameChanged();
            },
            saveContext: e => {
              console.log('\n');
              console.log('💾💾💾 editorProviders.saveContext CALLED 💾💾💾');
              console.log('   Step name:', step.name);
              console.log('   Received model type:', typeof e);
              console.log('   Received model keys:', Object.keys(e || {}));
              
              // Deep inspection
              if (e && typeof e === 'object') {
                if (e.targetSoftwareModel && e.targetSoftwareModel.servers) {
                  console.log(`   Received model.targetSoftwareModel.servers: array[${e.targetSoftwareModel.servers.length}]`);
                  if (e.targetSoftwareModel.servers.length > 0) {
                    console.log('   First server.source_connection_info_id:', e.targetSoftwareModel.servers[0].source_connection_info_id);
                  }
                }
              }
              
              console.log('   Received model JSON (first 500 chars):', JSON.stringify(e).substring(0, 500));
              console.log('   BEFORE: step.properties.model JSON (first 500 chars):', JSON.stringify(step.properties.model).substring(0, 500));
              
              step.properties.model = e;
              
              console.log('   AFTER: step.properties.model JSON (first 500 chars):', JSON.stringify(step.properties.model).substring(0, 500));
              console.log('   ✅ step.properties.model updated');
              
              stepContext.notifyPropertiesChanged();
              console.log('   ✅ stepContext.notifyPropertiesChanged() called');
              console.log('💾💾💾 editorProviders.saveContext COMPLETE 💾💾💾');
              console.log('\n');
            },
            saveFixedModel: e => {
              step.properties.fixedModel = e;
              stepContext.notifyPropertiesChanged();
            },
          },
          editor,
        );
      }

      const label = document.createElement('label');
      label.innerText = getSequencePath(definition.sequence, step.id) ?? '';
      editor.appendChild(label);

      return editor;
    },
  };
}
