// Task Component 전용 js
// createXxxStep
// appendXxxBox
// step 안에서  appendTitlebox, appendPath

function createTaskStep(id, type, name, properties) {
	return {
		id,
		componentType: 'task',
		type,
		name,
		properties: properties || {}
	};
}

function createIfStep(id, _true, _false) {
	return {
		id,
		componentType: 'switch',
		type: 'if',
		name: 'If',
		branches: {
			'true': _true,
			'false': _false
		},
		properties: {}
	};
}

function createContainerStep(id, steps) {
	return {
		id,
		componentType: 'container',
		type: 'loop',
		name: 'Loop',
		properties: {},
		sequence: steps
	};
}

function appendTaskPropertiesbox(root, step, isReadonly, editorContext){

	const item = document.createElement('div');

	// console.log("appendTaskPropertiesbox")
	// console.log(step)

	// // 기본 상항으로 사용할 provider와 option

	// // task 별 edit 화면이 정의되어 있음.
	// // 

	// // provider : input
	// const providerInput = document.createElement('input');
	// providerInput.type = 'text';
	// providerInput.name = 'inputParam';
	// providerInput.value = step.properties.provider;
	// if (isReadonly) {
	// 	providerInput.setAttribute('disabled', 'disabled');
	// }

	// const providerLabel = document.createElement('label');
	// providerLabel.textContent = "Provider";
	// providerLabel.htmlFor = providerInput.name;
		
	// item.append(providerLabel);
	// item.append(providerInput);

	// // options : text area => json format
	// const options = document.createElement('textarea');
	// options.name = 'optionParams';
	// options.rows = 4;
	// options.cols = 10
	// options.value = step.properties.options;
	// if (isReadonly) {
	// 	options.setAttribute('disabled', 'disabled');
	// }

	// const optionsLabel = document.createElement('label');
	// optionsLabel.textContent = "Options";
	// optionsLabel.htmlFor = options.name;
	
	
	// item.append(optionsLabel);
	// item.append(options);

	//var item = dynamicMcisEditor(step, isReadonly, editorContext)

	root.appendChild(item)
}

// // IF 는 이름 변경, true조건, false 조건
// // branches 아래에 true:[], false[] 가 들어있고 properties: {} 가 있음.
function appendIfbox(root, step, isReadonly, editorContext){
	const item = document.createElement('div');

	console.log("appendIfbox")
	console.log(step)

	// true
	const trueInput = document.createElement('input');
	trueInput.type = 'text';
	trueInput.name = 'trueParam';
	//trueInput.value = step.properties.provider;
	if (isReadonly) {
		trueInput.setAttribute('disabled', 'disabled');
	}

	const trueLabel = document.createElement('label');
	trueLabel.textContent = "True";
	trueLabel.htmlFor = trueInput.name;

	item.append(trueLabel);
	item.append(trueInput);

	item.append(document.createElement('br'));
	
	// false
	const falseInput = document.createElement('input');
	falseInput.type = 'text';
	falseInput.name = 'trueParam';
	//trueInput.value = step.properties.provider;

	const falseLabel = document.createElement('label');
	falseLabel.textContent = "False";
	falseLabel.htmlFor = falseInput.name;

	item.append(falseLabel);
	item.append(falseInput);


	root.appendChild(item)
}

// // branch를 삭제할 수 있는 delete branch
// // 새로운 branch를 추가할 수 있는 add branch 
function appendParallelbox(root, step, isReadonly, editorContext){

	function deleteBranch(branch, name) {
		root.removeChild(branch);
		delete step.branches[name];
		editorContext.notifyChildrenChanged();
	}

	// parallel 안에서 branch 추가
	function appendBranch(name) {
		const newBranch = document.createElement('div');
		newBranch.className = 'switch-branch';

		const newBranchTitle = document.createElement('h4');
		newBranchTitle.innerText = name;

		const newBranchLabel = document.createElement('label');
		newBranchLabel.innerText = 'Condition: ';

		newBranch.appendChild(newBranchTitle);
		newBranch.appendChild(newBranchLabel);
		console.log("addBranch " , step.properties)
		appendConditionEditor(newBranch, step.properties.conditions[name], value => {
			step.properties.conditions[name] = value;
			editorContext.notifyPropertiesChanged();
		});

		const deleteButton = createButton('Delete branch', () => {
			if (Object.keys(step.branches).length <= 1) {
				window.alert('You cannot delete the last branch.');
				return;
			}
			if (!window.confirm('Are you sure?')) {
				return;
			}
			deleteBranch(newBranch, name);
		});
		newBranch.appendChild(deleteButton);
		root.appendChild(newBranch);
	}

	function addBranch(name) {
		step.properties.conditions[name] = "add condition";
		step.branches[name] = [];
		editorContext.notifyChildrenChanged();
		appendBranch(name);
	}

	const item = document.createElement('div');

	if (!isReadonly) {// 수정mode일 때, branch 추가버튼		
		const addBranchButton = createButton('Add branch', () => {
			const branchName = window.prompt('Enter branch name');
			if (branchName) {
				addBranch(branchName);
			}
		});	

		appendPropertyTitle(root, 'Branches');
		root.appendChild(addBranchButton);
	}

	for (const initialBranchName of Object.keys(step.branches)) {
		appendBranch(initialBranchName);
	}

	console.log("appendParallelbox")
	console.log(step)
}

// Step 수정 시
function appendStepEdit(root, step, isReadonly, editorContext) {
	console.log("appendStepEdit ", step)
	console.log("appendStepEdit editorContext ", editorContext)
	// title set & change 설정
	appendTitlebox(root, step, isReadonly, editorContext);

	// Task Group은 property 수정이 없음.
	if (step.componentType === 'container' && step.type === 'loop') {
		return;
	}

	// 기본 task component( task, write, if, parallel ) 영역 ////////////////////////////////
	if (step.componentType === 'task' && step.type === 'task') {
		appendTaskPropertiesbox(root, step, isReadonly, editorContext);
		return;
	}

	if (step.componentType === 'task' && step.type === 'write') {
		appendTaskPropertiesbox(root, step, isReadonly, editorContext);
		return;
	}

	if (step.componentType === 'switch' && step.type === 'if') {
		appendIfbox(root, step, isReadonly, editorContext);
		return;
	}

	if (step.componentType === 'switch' && step.type === 'parallel') {
		appendParallelbox(root, step, isReadonly, editorContext);
		return;
	}

    /////////// 추가 task component 영역 //////////////////////////////
    if( step.componentType === 'task' && step.type == "InfraMigration"){
		//dynamicMcisEditor(step, isReadonly, editorContext);
        //appendDynamicMcisTaskPropertiesbox(root, step, isReadonly, editorContext)
		appendInfraMigrationTaskPropertiesbox(root, step, isReadonly, editorContext)
        return;
	}

	// if( step.type == 'InfraMigration'){
	// 	return infraMigrationStepEditorProvider(step, editorContext, _definition, isReadonly);
	// }

}

// Step: task의 Title 표시 
function appendTitlebox(root, step, isReadonly, editorContext) {	
	const item = document.createElement('div');	

	let titleLabel = ""
	let titleText = step.name
	if (step.componentType === 'container' && step.type === 'loop') {
		titleLabel = "Task Group"		
	}else if (step.componentType === 'task'){
		titleLabel = "Task"
	}else if (step.componentType === 'switch' && step.type === 'if'){
		titleLabel = "IF"
	}else if (step.componentType === 'switch' && step.type === 'parallel'){
		titleLabel = "Parallel"
	}else{
		titleLabel = step.componentType + " : " + step.type
	}

	const childTitle = document.createElement('h2');
	childTitle.innerText = titleLabel + " Component";

	const childParamInput = document.createElement('input');
	childParamInput.type = 'text';
	childParamInput.name = 'titleParam';
	childParamInput.value = titleText;

	//if (isReadonly) {
		childParamInput.setAttribute('disabled', 'disabled');// task 명은 수정불가(?) : 사용자가 입력하도록 해야하나? attribute를 별도로 가져가야겠지?
	// }else{
	// 	// 수정 모드일 때 event listener 설정
	// 	childParamInput.addEventListener('input', () => {
	// 		console.log("eventListener ", childParamInput.value)
	// 			step.name = childParamInput.value;
	// 			editorContext.notifyNameChanged();
	// 	});
	// }	

	item.append(childTitle);
	item.append(childParamInput);

	root.appendChild(item);
}

// Step : 현재 step까지의 path 표시.
function appendPath(root, parents, step) {
	// console.log("appendPath")
	// console.log(root)
	// console.log(step)	
	const path = document.createElement('div');
	path.className = 'step-path';
	path.innerText = 'Step path: ' + parents.map((parent) => {
		console.log("parent ", parent)
		return typeof parent === 'string' ? parent : parent.name;
	}).join('/');
	root.appendChild(path);
}

////////////////////////////// custom task component //////////////////////////////////////
// createXxxStep
// appendXxxBox
// step 안에서  appendTitlebox, appendPath

// custom task component

// Task Group 정의 : Loop를 수정하여 껍데기만 있는 TaskGroup을 만든다.
// TaskGroup의 task들이 있으면 내부 sequence에 추가한다.
function defineTaskGroupStep(id, name, taskGroupProperties){
	var taskSequence = []
	//console.log("defineTaskGroupStep ", id)
	//console.log("defineTaskGroupStep name", name)
	//console.log("defineTaskGroupStep taskGroupProperties", taskGroupProperties)	
	
	if( taskGroupProperties ){
		var tasks = taskGroupProperties.tasks;
		for(var k in tasks){
			console.log("task ", tasks[k])
			var taskId = tasks[k].id ? "" : "temp_wf_task_" + k;// taskId가 없으면 readonly이기 때문에 임시 taskId를 넣음.
			var taskComponent = tasks[k].task_component;
			//console.log("taskId ", taskId)
			//console.log("taskComponent ", taskComponent)
			if( taskComponent == "beetle_task_infra_migration"){
				var taskName = tasks[k].id ? "" : "tem-mig01"
				// json객체로 한번 더 형변환 : "request_body": "{\n   \"name\": \"recommended-infra01\", 형태임
				var request_body_str = tasks[k].request_body
				const requestBody = JSON.parse(request_body_str);
				var taskProperties = {body: requestBody};
				
				var task = defineTaskStepInfraMigration(taskId, taskName, taskProperties )
				
				taskSequence.push(task);
			}
		}
	}
	console.log("return taskSequence ", taskSequence)
	return {
		id,
		componentType: 'container',
		type: 'TaskGroup',
		name: 'Task Group',
		properties: {
			provider: 'defaultProvider',
			name: name
		},
		sequence: taskSequence
	};
}


function defineTaskStepInfraMigration(id, name, properties) {
	console.log("defineTaskStepInfraMigration id", id)
	console.log("defineTaskStepInfraMigration name", name)
	console.log("defineTaskStepInfraMigration ", properties)
	
	return {
		id,
		componentType: 'task',
		type: 'InfraMigration', // Toolbox 에 표시되는 이름
		name: 'beetle_task_infra_migration', // task의 이름 - cancas에 display되는 이름. 속성 form에는 실제 task의 name 을 주면 되는가?
		properties: properties || {
			provider: 'defaultProvider',
			options: '{}',
            body: request_body
		}
	};
}

// 기존 예제의 function 명이 createTaskXXX여서 남겨 둠.
// function createTaskStepDynamicMcis(id, type, name, properties) {
// 	console.log("createTaskStepDynamicMcis id", id)
// 	console.log("createTaskStepDynamicMcis type", type)
// 	console.log("createTaskStepDynamicMcis name", name)
// 	console.log("createTaskStepDynamicMcis ", properties)
	
// 	return {
// 		id: id,
// 		componentType: 'task',
// 		type,
// 		name,
// 		properties: properties || {
// 			provider: 'defaultProvider',
// 			options: '{}'

// 		}
// 	};
// }


// 오른쪽 task의 상세정보 표시 영역
function appendInfraMigrationTaskPropertiesbox(root, step, isReadonly, editorContext){
    
    console.log("in appendInfraMigrationTaskPropertiesbox step ", step)
    console.log("in appendInfraMigrationTaskPropertiesbox editorContext ", editorContext)
    
	//const stepBody = JSON.parse(step.properties.body);
	const stepBody = step.properties.body;
	console.log("stepBody ", stepBody)
    //var stepVm = step.properties.body.vm[0];
	var stepVms = stepBody.vm;
	// Editor 정의
	// Mcis는 여러개의 VM을 가질 수 있으므로 id는 순번을 붙인다.(addVM 하면서 순번 추가할 수 있음)
	const item = document.createElement('div');

    // MCIS 영력
    const mcisItem = document.createElement('div');
    var addMcis = "";
    addMcis += '<ul>';
	
	addMcis += '<li>';
	addMcis += '	<label>MCIS Label</label>';
	addMcis += '	<input type="text" name="mcisLabel" value="' + stepBody.label + '" title="" id="mcisLabel" />';
	addMcis += '</li>';
    addMcis += '</ul>';
    mcisItem.innerHTML = addMcis;
    item.appendChild(mcisItem);

	// 변경사항 반영 event 정의 : mcisLabel
	var inputMcisLabel = item.querySelector('input[name="mcisLabel"]');	
	inputMcisLabel.addEventListener('change', function(event) {            
		step.properties.body.label = inputMcisLabel.value;            
		editorContext.notifyNameChanged();
		console.log('mcis label 값이 변경되었습니다.', step);
	});

    const hr = document.createElement('hr');
    item.appendChild(hr);


    // VM 영역 정의
	const vmsItem = document.createElement('div');
	vmsItem.id = "InfraMigrationTask_VMS"
	vmsItem.style.overflowY = "scroll";
	vmsItem.style.height = "400px";

	item.appendChild(vmsItem);
	for( var i =0; i < stepVms.length; i++){

		var vmVirtualId = "InfraMigrationTask_vm_" + i
		console.log("append vmStep ", i)
		console.log("before  vmStep ", stepVms[i])
		addedVmItem = definitionVMArea(vmsItem, stepVms[i], isReadonly, i)

		
		if( !isReadonly){
			var delVmButton = document.createElement('button');
			delVmButton.id = "delVm_" + i;
			delVmButton.textContent = "Delete VM" + i;
			delVmButton.addEventListener("click", function() {
				//console.log("delVM addEventListener ", i)
				delVM(stepVms, vmVirtualId);
			})
			addedVmItem.appendChild(delVmButton);
			
		}
	}
	
	
	if( !isReadonly){
		var addVmButton = document.createElement('button');
		addVmButton.textContent = "Add VM";
		addVmButton.addEventListener("click", function() {
			addVM(stepVms, (stepVms.length) );
		})
		item.appendChild(addVmButton);
	}
	root.appendChild(item)
    
}

// vm 정의 추가
function addVM(stepVms, addIndex) {
	const vmsArea = document.querySelector('#InfraMigrationTask_VMS');

	console.log("stepVMs ", stepVms)

	// 빈 stepVM을 추가해야 함. 
	// const definition = designer.getDefinition();
	// for (let step of definition.sequence) {
	// 	if (step.type === 'readUserInput') {
	// 		register = prompt(step.properties['question']);
	// 	} else if (step.type === 'sendEmail') {
	// 		if (step.properties['ifReqisterEquals'] === register) {
	// 			alert(`E-mail sent to ${step.properties['email']}`);
	// 		}
	// 	}
	// }

	//designer.getSelectedStepId()// ID로 할 게 없네...

	var newVm = {
		commonSpec : "",
		commonImage : "",
		connectionName : "", 
		description : "", 
		label : "", 
		name : "", 
		rootDiskSize : "", 
		rootDiskType : "", 
		subGroupSize : 1, 
		vmUserPassword : ""
	}
	stepVms.push(newVm);
	//definitionVMArea(vmsArea, stepVm, isReadonly)
	definitionVMArea(vmsArea, newVm, false, addIndex);
    // 이 부분에 addVM 함수의 내용을 작성
    console.log('addVM 함수를 호출했습니다.');
}

//vm 정의 삭제
// 
function delVM(stepVms, vmVirtualId){
	console.log("delVM ", vmVirtualId)
	const vmArea = document.querySelector('#' + vmVirtualId);
	
	if (vmArea) {
		if(stepVms.length == 1){			
			console.log("at least 1 vm is required")// 마지막 1개는 못 지움
			return
		}
		for( var i =0; i < stepVms.length; i++){
			var stepVm = stepVms[i]
			//var vmVirtualId = "InfraMigrationTask_vm_" + vmIndex
			if ( stepVm.virtualId == vmVirtualId){
				console.log("slice~~~~")
				stepVms.splice(i, 1)
				break;
			}
		}
		console.log("after stepVms ", stepVms)
		vmArea.remove();
	}	
}

// vm 영역 정의. addVM()을 통해 여러개 추가 가능
// item은 parentDiv, stepVm 는 data binding 값. 없으면 skip, isReadOnly면 event 제거
function definitionVMArea(item, stepVm, isReadonly, addIndex){
	//var virtualId = "InfraMigrationTask_vm_" + i
	// const vms = item.querySelectorAll('input[name="vmName"]');
	// console.log("vms length ", vms.length)
	// const ids = Array.from(vms).map(vm => parseInt(vm.id.replace('vmName_', ''), 10));
	// // 최댓값 찾기
	// const maxId = ids.length > 0 ? Math.max(...ids) : 0;

	// const eleNames = ["vmName","vmLabel","subGroupSize","vmSpec","vmImage", "rootDiskType", "rootDiskSize"]
	// var addIndex = maxId+1;
	// console.log("addIndex = ", addIndex)
	
	const vmItem = document.createElement('div');
	vmItem.id = "InfraMigrationTask_vm_" + addIndex	
	stepVm.virtualId= "InfraMigrationTask_vm_" + addIndex;// ui에서 내부 index찾기를 위해 추가

	// const serverUl = document.createElement('ul');
	// item.appendChild(serverUl);

	// const eleLi = document.createElement('li');
	// serverUl.appendChild(eleLi);

	// const eleLiLabel = document.createElement('label');
	// eleLiLabel.textContent = "my label"
	// const eleLiInput = document.createElement('input');
	// eleLiInput.name = "myInput";
	// eleLiInput.id = "myInput_"+addIndex
	
	// eleLi.appendChild(eleLiLabel)
	// eleLi.appendChild(eleLiInput)

	// var vmNameObj = item.querySelector('#myInput_' + addIndex);
	// if(vmNameObj){
	// 	vmNameObj.value = stepVm.name;
	// }else{
	// 	console.error('Element with ID "myInput_' + addIndex + '" not found.');
	// }
	
	
	

	var addServer = "";
	addServer += '<ul>';
	//
	addServer += '<li>';
	addServer += '	<label>VM Label</label>';
	addServer += '	<input type="text" name="vmLabel" id="vmLabel_' + addIndex + '" />';
	addServer += '</li>';

	addServer += '<li>';
	addServer += '	<label><span class="ch">*</span>VM Name</label>';
	addServer += '	<span class="sbox"><input type="text" name="vmName" id="vmName_' + addIndex + '" /></span>';
	addServer += '</li>';

	addServer += '<li>';
	addServer += '	<label><span class="ch">*</span>VM Size</label>';
	addServer += '	<input type="text" name="subGroupSize" id="subGroupSize_' + addIndex + '" />';
	addServer += '</li>';

	addServer += '<li>';
	addServer += '	<label><span class="ch">*</span>Spec</label>';
	addServer += '	<input type="text" name="vmSpec" id="vmSpec_' + addIndex + '" />';
	addServer += '</li>';

	addServer += '<li>';
	addServer += '	<label><span class="ch">*</span>OS Image</label>';
	addServer += '	<input type="text" name="vmImage" id="vmImage_' + addIndex + '" />';
	addServer += '</li>';


	addServer += '<li>';
	addServer += '	<label><span class="ch">*</span>Root Disk Type</label>';
	addServer += '	<input type="text" name="rootDiskType" id="rootDiskType_' + addIndex + '" />';
	addServer += '</li>';

	addServer += '<li>';
	addServer += '	<label><span class="ch">*</span>Root Disk Size</label>';
	addServer += '	<input type="text" name="rootDiskSize" id="rootDiskSize_' + addIndex + '" />';
	addServer += '</li>';

	addServer += '<li>';
	addServer += '	<label><span class="ch">*</span>Connection</label>';
	addServer += '	<input type="text" name="connectionName" id="connectionName_' + addIndex + '" />';
	addServer += '</li>';

	addServer += '</ul>';
	vmItem.innerHTML = addServer;
	item.appendChild(vmItem);
	
	if(stepVm){// data가 있으면 값 mapping
		try{
			// var vmNameObj = item.querySelector('#vmName_' + addIndex);
			// if(vmNameObj){
			// 	vmNameObj.value = stepVm.name;
			// }else{
			// 	console.error('Element with ID "vmName_' + addIndex + '" not found.');
			// }

			// document에는 아직 추가 안되었으므로 item에서 조회해야 함.
			item.querySelector('#vmName_' + addIndex).value = stepVm.name;
			item.querySelector('#vmLabel_' + addIndex).value = stepVm.label;
			item.querySelector('#subGroupSize_' + addIndex).value = stepVm.subGroupSize;
			item.querySelector('#vmSpec_' + addIndex).value = stepVm.commonSpec;
			item.querySelector('#vmImage_' + addIndex).value = stepVm.commonImage;
			item.querySelector('#rootDiskType_' + addIndex).value = stepVm.rootDiskType;
			item.querySelector('#rootDiskSize_' + addIndex).value = stepVm.rootDiskSize;
			item.querySelector('#connectionName_' + addIndex).value = stepVm.connectionName;
		}catch(e){
			console.log(e);
		}
	}
    
    if( !isReadonly){
		console.log("stepVM ", stepVm)
		item.addEventListener('change', function(event) {
			console.log(`Input value: ${event.target.value}`);
			// 이벤트가 발생한 요소가 input[name="vmLabel"]인지 확인
			var vmLabelId = "vmLabel_"+addIndex;
			//if (event.target.matches('input[name="vmLabel"]')) {
			if (event.target.matches(`input#${vmLabelId}`)) {
				stepVm.label = event.target.value;
			}
			var vmNameId = "vmName_"+addIndex;
			if (event.target.matches(`input#${vmNameId}`)) {
				stepVm.name = event.target.value;			
			}
			var subGroupSizeId = "subGroupSize_"+addIndex;
			if (event.target.matches(`input#${subGroupSizeId}`)) {			
				stepVm.subGroupSize = event.target.value;			
			}
			var vmSpecId = "vmSpec_"+addIndex;
			if (event.target.matches(`input#${vmSpecId}`)) {	
				stepVm.commonSpec = event.target.value;			
			}
			var vmImageId = "vmImage_"+addIndex;
			if (event.target.matches(`input#${vmImageId}`)) {
				stepVm.commonImage = event.target.value;			
			}
			var rootDiskTypeId = "rootDiskType_"+addIndex;
			if (event.target.matches(`input#${rootDiskTypeId}`)) {
				stepVm.rootDiskType = event.target.value;			
			}
			var rootDiskSizeId = "rootDiskSize_"+addIndex;
			if (event.target.matches(`input#${rootDiskSizeId}`)) {			
				stepVm.rootDiskSize = event.target.value;			
			}
			var connectionNameId = "connectionName_"+addIndex;
			if (event.target.matches(`input#${connectionNameId}`)) {
				stepVm.connectionName = event.target.value;			
			}
		});		
    }
	return item;
}


////// 전체 workflow에 대한 내용 확인. 
// appendTitle, appendTextField 정의
function customRootEditorProvider(definition, editorContext, isReadonly){
    const rootEditorContainer = document.createElememt('span');
    appendTitlebox(rootEditorContainer, 'Workflow overview');
    appendTextField(rootEditorContainer, 'Speed(ms)', isReadonly, definition.properties['speed'], v => {
        definition.properties['speed'] = parseInt(v,10);
        editorContext.notifyPropertiesChanged();
    });
    return rootEditorContainer
}