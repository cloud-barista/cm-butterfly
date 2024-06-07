const placeholder = document.getElementById('workflowplaceholder');
const localStorageKey = 'sqdMngScreen';
const confState = readOnlyState();
let designer;
let selectedWorkflowId = "";

document.addEventListener('DOMContentLoaded', function() {
    
    console.log("DOMContentLoaded ")
    
    // console.log("workflow definition ", confState.definition)

    // console.log("workflow configuration ", confState.configuration)
    // console.log("placeholder ", placeholder)
    // console.log("workflow designer created ")

    // workflow 목록 조회
    order_type = "name"
    getWorkflowList(order_type);
});


$(document).ready(function () {
    
    //checkbox all
    $("#th_chall").click(function () {
        if ($("#th_chall").prop("checked")) {
            $("input[name=chk]").prop("checked", true);
        } else {
            $("input[name=chk]").prop("checked", false);
        }
    })

    //table 스크롤바 제한
    $(window).on("load resize", function () {
        var vpwidth = $(window).width();
        if (vpwidth > 768 && vpwidth < 1800) {
            $(".dashboard_cont .dataTable").addClass("scrollbar-inner");
            $(".dataTable.scrollbar-inner").scrollbar();
        } else {
            $(".dashboard_cont .dataTable").removeClass("scrollbar-inner");
        }

        setTableHeightForScroll('workflowListTable', 300);
    });
    
});

// 저장 된 workflow 실행.
function runWorkflow(){
    console.log("runWorkflow")    
    console.log("selectedWorkflowId ", selectedWorkflowId)
    //
    if( selectedWorkflowId == undefined || selectedWorkflowId == ""){
        commonAlert("Please a Workflow save first");
        return;
    }

    // cicada api 호출
    try{
        var url = "/operation/migrations/workflowmng/workflow/run/" + selectedWorkflowId;
        axios.post(url,
        ).then(result=>{
            console.log("data : ",result);
            console.log("Result Status : ",result.status); 

            var statusCode = result.data.status;
            var message = result.data.message;
            console.log("Result Status : ",statusCode); 
            console.log("Result message : ",message); 

            if(result.status == 201 || result.status == 200){
                commonResultAlert("The workflow has run successfully")
            
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

}

function deleteWorkflow() {
    var workflowId = "";
    var count = 0;

    $("input[name='chk']:checked").each(function () {
        count++;
        workflowId = workflowId + $(this).val() + ",";
    });
    workflowId = workflowId.substring(0, workflowId.lastIndexOf(","));

    console.log("workflowId : ", workflowId);
    console.log("count : ", count);

    if (workflowId == '') {
        commonAlert("삭제할 대상을 선택하세요.");
        return false;
    }

    if (count != 1) {
        commonAlert("삭제할 대상을 하나만 선택하세요.");
        return false;
    }

    var url = "/operation/migrations/workflowmng/workflow/del/" + workflowId
    console.log("del workflow url : ", url);

    axios.delete(url, {
        headers: {
            'Content-Type': "application/json"
        }
    }).then(result => {
        var data = result.data;
        console.log(result);
        console.log(data);
        if (result.status == 200 || result.status == 201) {
            commonAlert(data.message)
            displayWorkflowInfo("DEL_SUCCESS")
        } else {
            commonAlert(result.data.error)
        }
    }).catch((error) => {
        console.warn(error);
        console.log(error.response)
        var errorMessage = error.response.data.error;
        var statusCode = error.response.status;
        commonErrorAlert(statusCode, errorMessage);
    });
}

// workflow 목록 조회
function getWorkflowList(sort_type) {
    console.log(sort_type);
    var url = "/operation/migrations/workflowmng/workflow/list";
    axios.get(url, {
        headers: {
            'Content-Type': "application/json"
        }
    }).then(result => {
        console.log("get Workflow List : ", result.data);
        
        var data = result.data.WorkflowList;

        var html = ""
        var cnt = 0;

        if (data == null) {
            html += '<tr><td class="overlay hidden" data-th="" colspan="5">No Data</td></tr>'

            $("#workflowList").empty()
            $("#workflowList").append(html)
            //ModalDetail()
        } else {
            if (data.length) {
                if (sort_type) {
                    cnt++;
                    
                    data.filter(list => list.Name !== "").sort((a, b) => (a[sort_type] < b[sort_type] ? - 1 : a[sort_type] > b[sort_type] ? 1 : 0)).map((item, index) => (
                        html += addWorkflowRow(item, index)                        
                    ))
                } else {
                    data.filter((list) => list.Name !== "").map((item, index) => (
                        html += addWorkflowRow(item, index)
                    ))
                }
                
                $("#workflowList").empty()
                $("#workflowList").append(html)

                //ModalDetail()
            }
        }

    }).catch((error) => {
        console.warn(error);
        console.log(error.response)
        var errorMessage = error.response.data.error;
        var statusCode = error.response.status;
        commonErrorAlert(statusCode, errorMessage);
    });
}

// Workflow 목록에 Item 추가
function addWorkflowRow(item, index) {
    console.log("addWorkflowRow " + index);
    console.log(item)
    var createdAt = formatYyyyMmDdHh24MiSs(item.created_at);
    var updatedAt = formatYyyyMmDdHh24MiSs(item.updated_at);

    var html = ""
    html += '<tr onclick="showWorkflowInfo(\'' + item.id + '\');">'
        + '<td class="overlay hidden column-50px" data-th="">'
        + '<input type="hidden" id="wf_info_' + index + '" value="' + item.id + '"/>'
        + '<input type="checkbox" name="chk" value="' + item.id + '" id="raw_' + index + '" title="" /><label for="td_ch1"></label> <span class="ov off"></span>'
        + '</td>'
        + '<td class="btn_mtd ovm" data-th="name">' + item.name + '<span class="ov"></span></td>'
        + '<td class="btn_mtd ovm" data-th="createdAt">' + createdAt + '</td>'
        + '<td class="btn_mtd ovm" data-th="updatedAt">' + updatedAt + '</td>'
        + '</tr>'
    return html;
}

function ModalDetail() {
    $(".dashboard .status_list tbody tr").each(function () {
        var $td_list = $(this),
            $status = $(".server_status"),
            $detail = $(".server_info");
        $td_list.off("click").click(function () {
            $td_list.addClass("on");
            $td_list.siblings().removeClass("on");
            $status.addClass("view");
            $status.siblings().removeClass("on");
            $(".dashboard.register_cont").removeClass("active");
            $td_list.off("click").click(function () {
                if ($(this).hasClass("on")) {
                    console.log("reg ok button click")
                    $td_list.removeClass("on");
                    $status.removeClass("view");
                    $detail.removeClass("active");
                } else {
                    $td_list.addClass("on");
                    $td_list.siblings().removeClass("on");
                    $status.addClass("view");

                    $status.siblings().removeClass("view");
                    $(".dashboard.register_cont").removeClass("active");
                }
            });
        });
    });
}

function displayWorkflowInfo(targetAction) {
    if (targetAction == "REG") {
        // workflow 등록 화면 호출( popup 또는 이동)
        changePage('WorkflowRegForm')
    } else if (targetAction == "REG_SUCCESS") {
        
        getWorkflowList("name");// 등록 성공시 workflow 조회
    } else if (targetAction == "DEL") {
        $('#workflowCreateBox').removeClass("active");
        $('#workflowInfoBox').addClass("view");
        $('#workflowListDiv').removeClass("on");

        var offset = $("#vNetInfoBox").offset();
        $("#TopWrap").animate({ scrollTop: offset.top }, 300);

    } else if (targetAction == "DEL_SUCCESS") {
        $('#workflowCreateBox').removeClass("active");
        $('#workflowInfoBox').removeClass("view");
        $('#workflowListDiv').addClass("on");

        var offset = $("#workflowInfoBox").offset();
        $("#TopWrap").animate({ scrollTop: offset.top }, 0);

        getVpcList("name");
    } else if (targetAction == "CLOSE") {
        $('#workflowCreateBox').removeClass("active");
        $('#workflowInfoBox').removeClass("view");
        $('#workflowListDiv').addClass("on");

        var offset = $("#workflowInfoBox").offset();
        $("#TopWrap").animate({ scrollTop: offset.top }, 0);
    }

}

// workflow 조회 : 특정 workflow 를 조회하여 화면에 표시
function showWorkflowInfo(workflowId) {               
    var url = "/operation/migrations/workflowmng/workflow/id/" + workflowId;
    console.log("workflow detail URL : ", url)

    return axios.get(url, {

    }).then(result => {
        console.log(result);
        console.log(result.data);
        var workflowInfo = result.data.WorkflowInfo
        console.log("Show workflowInfo : ", workflowInfo);

        var workflowId = workflowInfo.id;
        var workflowCreatedAt = workflowInfo.created_at;
        var workflowUpdatedAt = workflowInfo.updated_at;
        var workflowName = workflowInfo.data.name;        
        var workspaceDescription = workflowInfo.data.description
        $("#workflow_info_txt").empty();
        $("#dtlDescription").empty();
        
        $("#workflow_info_txt").text(workflowName);
        $("#dtlDescription").val(workspaceDescription);

        // 최상위는 taskGroup의 sequence임.
        var sequenceList = [];// 
        var cicadaTaskGroups = workflowInfo.data.task_groups;
        cicadaTaskGroups.forEach(aCicadaTaskGroup => {
            var sequence = convertTaskGroupToSequentialWorkflow(aCicadaTaskGroup)
            sequenceList.push(sequence);
        })
        console.log("after sequenceList ", sequenceList)
        
        var workflowProperty = {}
        workflowProperty.workflowId = workflowId;
        workflowProperty.name = workflowName;
        workflowProperty.created_at = workflowCreatedAt
        workflowProperty.updated_at = workflowUpdatedAt;
        workflowProperty.description = workspaceDescription;
            
        var templateDefinition = {
            properties: workflowProperty,
            sequence: sequenceList,
            //sequence: [
                // templateId가 없으면 edit 불가하므로 taskId 까지 입력한다.
                //defineTaskStepDynamicMcis(taskId, taskName, taskProperties )
            //    defineTaskStepInfraMigration(taskId, taskName, taskProperties)
            //]
        }
        console.log("templateDefinition : ", templateDefinition)
        resetDesigner(templateDefinition)
        
        selectedWorkflowId = workflowId;// 선택한 workflowId를 저장 (for run )
    }).catch(function (error) {
        console.log("Network detail error : ", error);
    });
}

function convertTaskGroupToSequentialWorkflow(cicadaTaskGroup){
    console.log("cicadaTaskGroup ", cicadaTaskGroup)

    var taskGroupProperties = {};    
    var cicadaTasks = cicadaTaskGroup.tasks;    
    taskGroupProperties.tasks = cicadaTasks;

    var sequenceTaskGroup = defineTaskGroupStep(cicadaTaskGroup.id, cicadaTaskGroup.name, taskGroupProperties )
    
    return sequenceTaskGroup;
}

// cicada task를 변경
function convertTaskToSequentialWorkflow(cicadaTask){
    console.log("cicadaTask ", cicadaTask)
    var sequenceTask = {};
    if( cicadaTask.task_component == "beetle_task_infra_migration"){
    
        var taskProperties = {body: cicadaTask.request_body};
        sequenceTask = defineTaskStepInfraMigration(cicadaTask.id, cicadaTask.name, taskProperties )
    }
    console.log("sequenceTask ", sequenceTask)
    return sequenceTask;
}


///////////////////////////////////////// Workflow Editor 정의영역 start ///////////////////////////////////
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
// mng는 id로 조회해여 보여준다.
// 최초에는 defaultDefinition()

//////////////////////////



// workflowId로 조회
function loadWorkflow(workflowId) {
    console.log("loadState ")
	// const state = localStorage[localStorageKey];
	// if (state) {
	// 	return JSON.parse(state);
	// }
	// return {
	// 	definition: getStartDefinition()
	// }
    alert("Workflow loaded")
}

function resetDesigner(definition, configuration) {
    console.log("redrawDesigner")
	if (designer) {
        console.log("designer.destroy() ")
		designer.destroy();
	}
    console.log("designer destroy")
    if(!definition ){
        definition = getStartDefinition();
    }
    console.log("designer definition ", definition)
    //sequence : request_body
    if(!configuration ){
        configuration = confState.configuration
    }    
    console.log("designer configuration ", configuration)

    designer = sequentialWorkflowDesigner.Designer.create(placeholder, definition, configuration);
    
    console.log("created")
}

function refreshValidationStatus() {
	validationStatusText.innerText = designer.isValid() ? 'Definition is valid' : 'Definition is invalid';
}









///////////////////
// TODO : readonly인데 toolbox가 필요있나?-> 없음
function toolboxGroup(name) {
	return {
		name,
		steps: [
			createTaskStep(null, 'save', 'Save file'),
			createTaskStep(null, 'text', 'Send email'),
			createTaskStep(null, 'task', 'Create task'),
			createIfStep(null, [], []),
			createContainerStep(null, [])
		]
	};
}

function reloadChangeReadonlyButtonText() {
	changeReadonlyButton.innerText = 'Readonly: ' + (designer.isReadonly() ? 'ON' : 'OFF');
}

