

//
// div 설정 : workflowplaceholder
// workflow 저장
//      불러오기 : loadState()
//      저장하기 : saveState()
//      // 
// 설정 : toolbox, controlBar, steps, validator, editor

// workflow event
//      onDefinitionChaged -> refreshValidationStatus(); saveState();
//      changeReadonlyButton : click -> setIsReadonly(), reloadChangeReadonlyButtonText()

//  validation
//      refreshValidationStatus()


//////////////////////////

//////////////////////////

// 워크flowId를 가지고 조회하여 data를 표시.

const placeholder = document.getElementById('workflowplaceholder');
const localStorageKey = 'sqdCreateScreen';
const confState = editableState();
let designer;

let workflowTemplateList = [];//

// designer를 다시 설정할 때
// 기존에 designer가 정의되어 있으면 destroy 후 새로 set.
function resetDesigner(definition, configuration) {
    console.log("redrawDesigner")
	if (designer) {
        console.log("designer.destroy() ")
		designer.destroy();
	}
    
    if(!definition ){
        definition = getStartDefinition();
    }
    //sequence : request_body
    if(!configuration ){
        configuration = confState.configuration
    }    
    
    designer = sequentialWorkflowDesigner.Designer.create(placeholder, definition, configuration);
    designer.onDefinitionChanged.subscribe((newDefinition) => {
        refreshValidationStatus();
        saveState();
        console.log('the definition has changed 222222 ', newDefinition);
    });
    console.log("created")
}

// validation 결과 표시
function refreshValidationStatus() {
    console.log("refreshValidationStatus called ")
	//validationStatusText.innerText = designer.isValid() ? 'Definition is valid' : 'Definition is invalid';
}

document.addEventListener('DOMContentLoaded', function() {    //     
    console.log("Dom Loaded")
    console.log("confState.definition", confState.definition)
    console.log("confState.configuration", confState.configuration)
    designer = sequentialWorkflowDesigner.Designer.create(placeholder, confState.definition, confState.configuration);
    designer.onDefinitionChanged.subscribe((newDefinition) => {
        refreshValidationStatus();
        saveState();
        console.log('the definition has changed', newDefinition);
    });
    console.log(" designer init")
    
    // resetDesigner(null, null)
    // console.log("workflow designer created ")

    getWorkflowTemplateList();
});


function reloadChangeReadonlyButtonText() {
	changeReadonlyButton.innerText = 'Readonly: ' + (designer.isReadonly() ? 'ON' : 'OFF');
}

/////////////


// cicada의 workflowData를 canvas에 그릴 수 있게 definition으로 추출    
function convertToDiagram(workflowData){	
    // task 순서 => sequence로 변경

	// json에서 요소 추출
	// task_groups

	// tasks

	// 순번에 따라 workflow 정의
	// task를 돌면서 task group이 있으면 -> task group 생성.
	//				dependencies 가 있으면 순번을 앞으로

	// task의 task_group_name이 없으면 단독 task.
	// task의 depencencies가 없는게 2개 이상이면 parallel
	// task의 dependencies가 있으면 자기 앞 순번으로 

	// 각 task를 map으로 넣고 단계별로 합친다????
	// if task.task_group_name >>> task_group에 append(  --> 안에 요소가 없으면 add, 있으면 dependencies를 비교하여 순번)
		// taskgroup의 요소를 비교해서 dependence 자체가 없으면 0번째, dependencies가 있으면 dependencies에 속한 task의 index 찾고
		// 해당 index + 1로 insert.

	//var taskGroup = []
	var rootObj = {};
	var root = new Map();
	var taskGroup = [];
	
	// 모든 Task는 기본적으로 sequence라는 array의 한 요소이다.

	// dependency가 없는 task들만 추출한다.
	//	parallel로 설정한다.

	// taskGroup을 만든다.
	
	// taskGroup 속한 task들을 추출해 넣는다. // jsonTask에서 제거.

	// taskGroup에 upstream에 따라 계층구조 및 순서를 만든다.
	
	// 남은 Task들은 모두 root의 항목이므로 dependency에 따라 순서대로 정렬시킨다.

	
    ///// TODO : TOBE 만들어야할 형상.
    // properties : workflow에 설정할 요소들
    // sequence : task들이 순서대로 array에 담겨있음.
    // definition : properties, sequence 정의 후 resetDesigner 호출하면 됨.
    // template 조회

    // ex) 
    // var taskProperties = {body: request_body};
    // // getWorkflowTemplateInfo(templateId)

    // // 가져온 data 변환
    // var templateDefinition = {
    //     properties: {},
    //     sequence: [
    //         // templateId가 없으면 edit 불가하므로 taskId 까지 입력한다.
    //         defineTaskStepDynamicMcis('00000000000000000000000000000002', 'tem-mig01', taskProperties )
    //     ]
    // }
    // console.log("templateDefinition : ", templateDefinition)
    
    // // 가져온 template을 canvas에 표시.
    // resetDesigner(templateDefinition)

	var sequenceTaskGroupMap = new Map();// 가장 바깥의 TaskGroup들의 sequence로 key는 index, value는 taskGroup
	
	
	
}

// 선택한 Target Model 정보를 set
// Task에서 필요시 참고하기 위한 용도.
function setTargetModel(selectedOption){
    console.log("TargetModel ", selectedOption)
}

// workflow template 선택시 해당 workflow template 정보를 canvas에 그린다.
function setWorkflowTemplate(selectedOption){    
    
    var templateId = selectedOption.value;

    if(templateId){
        console.log("templateId", templateId)
        var workflowSequence = []// 전체( taskGroup의 array)
        var taskSequence = [];
        try{
            for(var i in workflowTemplateList){
                //console.log("workflowTemplateList[i].id", workflowTemplateList[i].id)
                if( templateId == workflowTemplateList[i].id){
                    var templateData = workflowTemplateList[i].data
                    var templateTaskGroups = templateData.task_groups
                    for(var j in templateTaskGroups){
                        var aTaskGroup = templateTaskGroups[j]
                        console.log("taskgroup ", aTaskGroup)
                        if( aTaskGroup.id == ""){ aTaskGroup.id = "tg" + i}
                        var taskGroupProperties = {};
                        taskGroupProperties.tasks = aTaskGroup.tasks;
                        workflowSequence.push(defineTaskGroupStep(aTaskGroup.id, aTaskGroup.name, taskGroupProperties ))

                    }
                    break;//task component set
                }
            }

        }catch(e){
            console.log("templateDefinition Err : ", e)
        }

        // 가져온 data 변환
        var templateDefinition = {
            properties: {},
            sequence: workflowSequence
        }
        console.log("templateDefinition : ", templateDefinition)

        // 가져온 template을 canvas에 표시.
        resetDesigner(templateDefinition)

    }
}

// workflow template 목록 조회
function getWorkflowTemplateList(){
    var url = "/migration/workflowmng/workflowtemplate";
    console.log("WorkflowTemplateList URL : ", url)

    return axios.get(url, {
        
    }).then(result => {
        console.log("getWorkflowTemplateList");
        //console.log(result);
        console.log(result.data);
        workflowTemplateList = result.data.WorkflowTemplateList;
        
        var addWorkflowTemplate = "";
        addWorkflowTemplate += '<option>Choose a Workflow Template</option>';
        if(!isEmpty(workflowTemplateList) && workflowTemplateList.length > 0 ){
            
            for(var i in workflowTemplateList){                
                var workflowName = "";
                if (workflowTemplateList[i].data.name != undefined){
                    workflowName = workflowTemplateList[i].data.name
                }else{
                    workflowName = workflowTemplateList[i].id
                }
                addWorkflowTemplate +='<option value="'+workflowTemplateList[i].id+'">'+ workflowName + '</option>';
            }
            $("#selWorkflowTemplate").empty()
            $("#selWorkflowTemplate").append(addWorkflowTemplate)
            
        }
        
    }).catch(function (error) {
        console.log("getWorkflowTemplateList error : ", error);
    });
}

// workflow 조회.
function getWorkflow(){
    var selectedWorkflowId = document.getElementById("workflowId").value;

    if( selectedWorkflowId == undefined || selectedWorkflowId == ""){
        commonAlert("Please a Workflow save first");
        return;
    }

    var url = "/migration/workflowmng/workflow/id/{workflowId}";
    console.log("getWorkflow URL : ", url)

    return axios.get(url, {
        
    }).then(result => {
        console.log(result);
        console.log(result.data);
        
    }).catch(function (error) {
        console.log("getWorkflow error : ", error);
    });
}

// 해당 step을 cicada에서 사용하는 taskGroup으로 변경
function convertTaskGroup(step){
    var cicadaTaskGroup = {}    

    switch (step.type) {
        case 'TaskGroup':
            
            cicadaTaskGroup.id = step.id;
            cicadaTaskGroup.name = step.properties.name;
            cicadaTaskGroup.description = step.properties.name;// TODO : description으로 수정할 것
            var tasks = []

            if( step.sequence ){
                var dependency = "";
                step.sequence.forEach(childStep => {
                    console.log("convertTaskGroup ", childStep)
                    var cicadaTask = convertTask(childStep)
                    tasks.push(cicadaTask)
                    dependency = cicadaTask.id;
                })
            }
            cicadaTaskGroup.tasks = tasks;
            
            break
        
    }
    return cicadaTaskGroup;
}

// 해당 step을 cicada에서 사용하는 task로 변경
function convertTask(step){    
    var cicadaTask = {};
    //id:"", options:"", task_component:"", dependencies:""};
    //console.log("convertTask ", step)
    switch (step.type) {
        
        case 'InfraMigration':
            //if( validateTask(taskType, step) ){
                cicadaTask.id = step.id;
                cicadaTask.name = step.id;
                cicadaTask.task_component = step.name;//"beetle_task_infra_migration";
                //cicadaTask.request_body = step.properties.body;
                let strRequestBody = JSON.stringify(step.properties.body);
                cicadaTask.request_body = strRequestBody;
                
            // }else{
            //     // validation is false.
            // }
            break;
    }
    return cicadaTask;
}

// workflow 저장
// sequentialWorkflow의 값을 cicada의 workflow로 변경하여 저장 호출.
function saveWorkflow(){
    var cicadaWorkflow = {}    
    var cicadaData = {}// data안에 taskGroups가 있음
    var cicadaTaskGroups = []

    var workflowDefinition = designer.getDefinition()
    console.log("save workflow definition ", designer.getDefinition())

    //validateWorkflow()
    
    // request 객체에 Set.
    // sequence가 workflow 전체의 순서임.

    var workflowDependency = "";//cicada 용으로 재정렬
    workflowDefinition.sequence.forEach(step => {
        console.log("step ", step)
        
		switch (step.type) {
            case 'TaskGroup':
                console.log("goto taskGroup")
                var aCicadaTaskGroup = convertTaskGroup(step);
                aCicadaTaskGroup.dependency = workflowDependency;
                cicadaTaskGroups.push(aCicadaTaskGroup)
                workflowDependency = aCicadaTaskGroup.id;
                break
            // taskGroup 없이 사용 불가. 모든 task는 taskGroup 안에 있어야 함.
            // case 'InfraMigration':
            //     //if( validateTask(taskType, step) ){
                    
                
            //     cicadaTask = convertTask(step);
            //         // var tasks = []
            //         // var aTask = {id:"", options:"", task_component:"", dependencies:""};

            //         // aTask.id = step.id;
            //         // aTask.request_body = step.properties.body;
            //         // tasks.push(aTask)
            //         // aTaskGroup.tasks = tasks;
            //     // }else{
            //     //     // validation is false.
            //     // }
            //     break;
        }
    });

    
    cicadaData.task_groups = cicadaTaskGroups;
    cicadaData.description = "data desc"

    cicadaWorkflow.name = "my01"
    cicadaWorkflow.data = cicadaData;

    console.log("cicadaWorkflow ", cicadaWorkflow)  
	
    // cicada api 호출
    try{
        var url = "/migration/workflowmng/workflow";// /proc 추가할 것
        axios.post(url,cicadaWorkflow,{
            headers :{
                },
        }).then(result=>{
            console.log("data : ",result);
            console.log("Result Status : ",result.status); 

            var statusCode = result.data.status;
            var message = result.data.message;
            console.log("Result Status : ",statusCode); 
            console.log("Result message : ",message); 

            if(result.status == 201 || result.status == 200){
                commonResultAlert("The workflow has been saved successfully")
            
            }else{
                commonErrorAlert(statusCode, message) 
            }
        }).catch((error) => {
            console.log(error);
            console.log(error.response)
            var errorMessage = error.response.data.error;
            var statusCode = error.response.status;
            commonErrorAlert(statusCode, errorMessage) 
        })
    }finally{
        
    }
    // 결과 return.
}

// workflow validation check
function validateWorkflow(){
    return true;
}

// TASK validation check
function validateTask(taskType, step){
    switch (taskType) {
        case "DynamicMcis":
            // step 필수값 check
            break;
    }
    return true
}