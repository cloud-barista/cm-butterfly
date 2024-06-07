//////////////////////// Config 정의 영역 ////////////////////
// ToolBox 정의
function getToolBoxGroups(){
	return { groups : [
		toolboxGroup('BuiltIn'),// if, loop			
		toolboxGroup('Components')// custom components
	]};
}

//toolboxGroup('BuiltIn'),// if, loop, parellel	
//추가되는 taskComponent는 Main아래로
function toolboxGroup(name) {    
    if( name == "BuiltIn"){
        return {
            name,
            steps: [
                createIfStep(null, [], []),
                createContainerStep(null, [])
				// parellel
            ]
        }
    
    }else if( name == "Components") {
        return {
            name,
            steps: [
				// 현재 정의된 TaskComponent
				defineTaskGroupStep(null, 'Task Group'),
                //createTaskStepDynamicMcis(null, 'task', 'Dynamic Mcis'),	
				
				defineTaskStepInfraMigration(null, 'Dynamic Mcis')
            ]
        };
    }
}

// Step 기본 속성 정의
function getStepConf(){

	return {
		isDuplicable: () => true,
		iconUrlProvider: (_, type) => {
			console.log("getStep Conf ", type)
			//return `/assets/js/sequential-workflow-designer/ico/icon-${type}.svg`
			return `/assets/js/sequential-workflow-designer/ico/icon-task.svg`
		}
}

	
//     // all properties in this section are optional

//     iconUrlProvider: (componentType, type) => {
//     return `icon-${componentType}-${type}.svg`;
//     },

//     isDraggable: (step, parentSequence) => {
//     return step.name !== 'y';
//     },
//     isDeletable: (step, parentSequence) => {
//     return step.properties['isDeletable'];
//     },
//     isDuplicable: (step, parentSequence) => {
//         return true;
//     },
//     canInsertStep: (step, targetSequence, targetIndex) => {
//     return targetSequence.length < 5;
//     },
//     canMoveStep: (sourceSequence, step, targetSequence, targetIndex) => {
//     return !step.properties['isLocked'];
//     },
//     canDeleteStep: (step, parentSequence) => {
//     return step.name !== 'x';
//     }

};

// Validator 기본 속성 정의 : step의 properties['isInvalid'] 여부로 판단.
const validatorConf = {
	step: (step) => {
		return !step.properties['isInvalid'];
	}

	
};



//////////////////////// Canvas 정의 영역 ////////////////////
function readOnlyState() {
	return {
		undoStackSize : 20,
		undoStack : 0,// optional, default: 0 - disabled, 1+ - enabled
		definition: getEmptyDefinition(),// 기본으로 보여질 workflow
		configuration: getReadOnlyConfiguration()		
	}   
}
function editableState() {
	return {
		undoStackSize : 20,
		undoStack : 0,//1,// optional, default: 0 - disabled, 1+ - enabled
		definition: getEmptyDefinition(),// 기본으로 보여질 workflow
		configuration: getEditableConfiguration()		
	}   
}

// undo를 위한 상태저장
function saveState(localStorageKey) {
	console.log("save definition ", designer.getDefinition())
	localStorage[localStorageKey] = JSON.stringify({
		definition: designer.getDefinition(),
		undoStack: designer.dumpUndoStack()
	});
}
function loadState(localStorageKey) {
	localStorage[localStorageKey] = JSON.stringify({
		definition: designer.getDefinition(),
		undoStack: designer.dumpUndoStack()
	});
}

// workflow 기본 정의 : 비어있는 workflow
function getEmptyDefinition() {
	return {
		properties: {
            'workflow': 'myworkflow',
        },
		sequence: [	]
	};
}

// sample workflow
function getStartDefinition() {
	var startProperties = {provider: 'defaultProvider'}
	//sequence : request_body
	return {
		properties: {},
		sequence: [
			//createTaskStepDynamicMcis('00000000000000000000000000000001', 'McisDynamic', 'mig01', startProperties )
			defineTaskStepDynamicMcis('00000000000000000000000000000001', 'mig01', startProperties )
		]
	};
}


// workflowmng 에서는 readonly만.
function getReadOnlyConfiguration(){
	return {
		isReadonly: true,
		
		//toolbox: {}, // toolbox가 false가 아닌 경우에는 비어있으면 안됨.
		toolbox: false,
		//contextMenu: false,
		controlBar: false,
		steps: {
			isDuplicable: () => true,
			iconUrlProvider: (_, type) => {
				return `/assets/js/sequential-workflow-designer/ico/icon-${type}.svg`
			},
		},

		validator: {
			step: (step) => {
				return !step.properties['isInvalid'];
			}
		},

		// root와 step provider를 지정하며 parameter에서 isReadonly 속성으로 구분가능.    
		editors : {
			//isCollapsed: true,
			// isCollapsed: false,
			// rootEditorProvider:(definition, _context, isReadonly) => {
			// 	const root = document.createElement('div');
			// 	root.className = 'definition-json';
			// 	root.innerHTML = '<textarea style="width: 100%; border: 0;" rows="50"></textarea>';
			// 	const textarea = root.getElementsByTagName('textarea')[0];
			// 	textarea.setAttribute('readonly', 'readonly');			
			// 	textarea.value = JSON.stringify(definition, null, 2);
			// 	return root;
			// },
			// stepEditorProvider: (step, editorContext, _definition, isReadonly) => {
			// 	const root = document.createElement('div');

			// 	appendStepEdit(root, step, isReadonly, editorContext);
				
			// 	appendPath(root, step);
			// 	return root;
			// }

			//defaultRootEditorProvider,
			rootEditorProvider: (definition, editorContext, isReadonly) => {
				return defaultRootEditorProvider(definition, editorContext, isReadonly);
			},
			// defaultStepEditorProvider,
			stepEditorProvider: (step, editorContext, _definition, isReadonly) => {
				// step 종류에 따라 Editor Provider를 달리 한다.
				console.log("stepEditorProvider ", step)
				
				return defaultStepEditorProvider(step, editorContext, _definition, isReadonly);
			}
		},
	}
};

// 수정가능한 환경
const startDefinition = {
	properties: {},
	sequence: []
};

// 기본 rootEditor 영역 정의 : definition 내용 전체 표시
function defaultRootEditorProvider(definition, editorContext, isReadonly){

	const rootEditorContainer = document.createElement('div');
	rootEditorContainer.className = 'definition-json';
	rootEditorContainer.innerHTML = '<textarea style="width: 100%; border: 0;" rows="50"></textarea>';
	const textarea = rootEditorContainer.getElementsByTagName('textarea')[0];
	textarea.setAttribute('readonly', 'readonly');			
	textarea.value = JSON.stringify(definition, null, 2);

	// TODO : definition을 cicada에서 보는 형태로 변환하여 표시
	return rootEditorContainer;

}
// stepEditor 선택 영역 정의
function defaultStepEditorProvider(step, editorContext, _definition, isReadonly){
	console.log("in defaultStepEditorProvider")
	console.log("step ", step)
	console.log("editorContext ", editorContext)
	console.log("isReadonly", isReadonly)
	console.log("_definition ", _definition)

	const stepEditorContainer = document.createElement('div');
	
	appendStepEdit(stepEditorContainer, step, isReadonly, editorContext);
	const parents = designer.getStepParents(step);
	appendPath(stepEditorContainer, parents, step);// parents 있고 없고의 차이를 모르겠음.	

	return stepEditorContainer;
}

// custom task edit provider 정의

// TASK Group

// TASK : infraMigration 
function infraMigrationStepEditorProvider(step, editorContext, _definition, isReadonly){
	console.log("in infraMigrationStepEditorProvider")
	console.log("step ", step)
	console.log("editorContext ", editorContext)
	console.log("isReadonly", isReadonly)
	console.log("_definition ", _definition)

	const stepEditorContainer = document.createElement('div');
	
	appendStepEdit(stepEditorContainer, step, isReadonly, editorContext);
	const parents = designer.getStepParents(step);
	appendPath(stepEditorContainer, parents, step);// parents 있고 없고의 차이를 모르겠음.	

	return stepEditorContainer;
}
// 
function getEditableConfiguration(){
	console.log("in getEditableConfiguration")
	return {
		toolbox: getToolBoxGroups(),	
		steps: getStepConf(),

		undoStackSize: 20,
		undoStack: 0,// optional, default: 0 - disabled, 1+ - enabled

		editors: {
			// rootEditorProvider: defaultRootEditorProvider(),
			// stepEditorProvider: defaultStepEditorProvider()
			isCollapsed: true,
			rootEditorProvider: (definition, editorContext, isReadonly) => {
				return defaultRootEditorProvider(definition, editorContext, isReadonly);
			},
			stepEditorProvider: (step, editorContext, _definition, isReadonly) => {
				// step 종류에 따라 Editor Provider를 달리 한다.
				console.log("stepEditorProvider ", step)
				return defaultStepEditorProvider(step, editorContext, _definition, isReadonly);
			}
			
		},

		controlBar: true
	}
};


/////////////////// Task Component 정의 영역 end  //////////////////////



///////////////////////////////////////////////////////////////////////

var request_body = {
	name: "recommended-infra01",    
	installMonAgent: "no",    
	label: "DynamicVM",    
	systemLabel: "",    
	description: "Made in CB-TB",    
	vm: [
		    {
				name: "recommended-vm01",
				subGroupSize: "3",            
				label: "DynamicVM",            
				description: "Description",            
				commonSpec: "azure-koreacentral-standard-b4ms",            
				commonImage: "ubuntu22-04",            
				rootDiskType: "default",            
				rootDiskSize: "default",            
				vmUserPassword: "test",            
				connectionName: "azure-koreacentral"        
			}    
		]}
///////////////////////////





// // TASK Group 은 이름만 변경.
// // TASK 는 이름 변경, properties 변경
// // IF 는 이름 변경, true조건, false 조건
// // ...

// // 상세 창에 inputbox 표시
// function appendInputbox(root, label, isReadonly, textValue) {
// 	const item = document.createElement('div');	
	
// 	const childTitle = document.createElement('h2');
// 	//childTitle.innerText = label;

// 	const childParamInput = document.createElement('input');
// 	childParamInput.type = 'text';
// 	childParamInput.name = 'inputParam';
// 	childParamInput.value = textValue;
// 	if (isReadonly) {
// 		childParamInput.setAttribute('disabled', 'disabled');
// 	}

// 	const childParamLabel = document.createElement('label');
// 	childParamLabel.textContent = label;
// 	childParamLabel.htmlFor = childParamInput.name;
	
// 	item.append(childTitle);
// 	item.append(childParamLabel);
// 	item.append(childParamInput);

// 	root.appendChild(item);
// }

// // parallel 에서 사용
// function createButton(text, clickHandler) {
// 	const button = document.createElement('button');
// 	button.innerText = text;
// 	button.addEventListener('click', clickHandler, false);
// 	return button;
// }

// // parallel 에서 사용
// function appendPropertyTitle(root, title) {
// 	const h3 = document.createElement('h3');
// 	h3.innerText = title;
// 	root.appendChild(h3);
// }

// // parallel 에서 사용
// function appendConditionEditor(root, value, onChange) {
// 	const input = document.createElement('input');
// 	input.type = 'text';
// 	input.value = value;
// 	input.addEventListener(
// 		'input',
// 		() => {
// 			onChange(input.value);
// 		},
// 		false
// 	);
// 	root.appendChild(input);
// }

// ///////////// end of private functions //////////////////

// ///////////// export functions //////////////////////////
// // ToolBox 표시할 때 Group 정의
// // toolbox : category별로 group을 다르게 설정
// export function getToolboxGroup(category) {
// 	console.log("getToolBox ", category)
// 	switch (category) {
// 		case "logic" :
// 			return {
// 				name: 'logic',
// 				steps: [
// 					createIfStep(null,[], []),
// 					createParallelStep(null, "parallels", []),					
// 				]
// 			};
// 		case "step" :
// 			return {
// 				name: 'step',
// 				steps: [
// 					createContainerStep(null,'task group', []),					
// 					createAirflowTaskStep(null, 'write', 'task'),
// 				]
// 			};
// 	}	
// }


// // STEP 편집 
// // 편집한 내용을 반영하려면 editorContext에 notify...() 를 호출해야한다.
// // step의 이름 변경 : notifyNameChanged()
// // step내 property 변경 : notifyPropertiesChanged()
// export function appendStepEdit(root, step, isReadonly, editorContext) {
// 	console.log("appendStepEdit ", step)
// 	// title set & change 설정
// 	appendTitlebox(root, step, isReadonly, editorContext);

// 	// Task Group은 property 수정이 없음.
// 	if (step.componentType === 'container' && step.type === 'loop') {
// 		return;
// 	}

// 	// 기본 task 설정
// 	if (step.componentType === 'task' && step.type === 'task') {
// 		appendTaskPropertiesbox(root, step, isReadonly, editorContext);
//         return;
// 	}

// 	if (step.componentType === 'task' && step.type === 'write') {
// 		appendTaskPropertiesbox(root, step, isReadonly, editorContext);
//         return;
// 	}

// 	if (step.componentType === 'switch' && step.type === 'if') {
// 		appendIfbox(root, step, isReadonly, editorContext);
//         return;
// 	}

// 	if (step.componentType === 'switch' && step.type === 'parallel') {
// 		appendParallelbox(root, step, isReadonly, editorContext);
//         return;
// 	}

// }

// // 현재 step까지의 path 표시.
// export function appendPath(root, parents, step) {
// 	// console.log("appendPath")
// 	// console.log(root)
// 	// console.log(step)	
// 	const path = document.createElement('div');
// 	path.className = 'step-path';
// 	path.innerText = 'Step path: ' + parents.map((parent) => {
// 		console.log("parent ", parent)
// 		return typeof parent === 'string' ? parent : parent.name;
// 	}).join('/');
// 	root.appendChild(path);
// }

// // 기본 workflowsequence
// export function getDefaultWorkflowSequence(){
//     return createContainerStep(
//             [createTaskStep('task', 'task1')]
//         );
// }


// /*

// {
//   "properties": {},
//   "sequence": [
//     {
//       "id": "0ce635e0a81b52bcf227107202424cb1",
//       "componentType": "switch",
//       "type": "if",
//       "name": "If1a",
//       "branches": {
//         "true": [
//           {
//             "id": "e48a5bb71915602657a9bcb25c08ba1c",
//             "componentType": "task",
//             "type": "write",
//             "name": "task true",
//             "properties": {
//               "provider": "defaultProvider",
//               "options": "{}"
//             }
//           }
//         ],
//         "false": [
//           {
//             "id": "a70f2bc432454e3b0e01be4982eb4c0e",
//             "componentType": "task",
//             "type": "write",
//             "name": "task false1",
//             "properties": {
//               "provider": "defaultProvider",
//               "options": "{}"
//             }
//           }
//         ]
//       },
//       "properties": {}
//     },
// */
// // root에서 step id로 조회
// export function findStepById(stepId, rootJson) {
// 	const element = rootJson.sequence.find(item => item.id === stepId);
	
// 	// 요소를 찾지 못한 경우 null을 반환
// 	if (!element) {
// 	  return null;
// 	}
// 	console.log(element)
// 	// 요소를 찾은 경우 해당 요소를 반환
// 	return element;
// }