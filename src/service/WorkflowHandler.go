package service

import (
	"encoding/json"
	"fmt"

	//"github.com/labstack/echo"
	//"github.com/davecgh/go-spew/spew"
	// "io"
	"log"
	"net/http"

	// "os"
	// model "github.com/cloud-barista/cm-butterfly/src/model"
	"github.com/cloud-barista/cm-butterfly/src/model"
	// spider "github.com/cloud-barista/cm-butterfly/src/model/spider"	
	cicada_common "github.com/cloud-barista/cm-butterfly/src/model/cicada/common"
	workflow "github.com/cloud-barista/cm-butterfly/src/model/cicada/workflow"

	//butterfly "github.com/cloud-barista/cm-butterfly/src/model/butterfly"
	// "github.com/cloud-barista/cm-butterfly/src/model/tumblebug"

	util "github.com/cloud-barista/cm-butterfly/src/util"
)



// Workflow 등록
func RegWorkflow(workflowInfoReq *workflow.WorkflowReqInfo)(model.WebStatus){
	var originalUrl = "/workflow"

	url := util.CICADA + originalUrl

	pbytes, _ := json.Marshal(workflowInfoReq)
	
	resp, err := util.CommonHttp(url, pbytes, http.MethodPost)

	returnWorkflowInfo := workflow.WorkflowInfo{}
	returnStatus := model.WebStatus{}

	if err != nil {
		fmt.Println(err)
		return model.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode

	if respStatus != 200 && respStatus != 201 { // 호출은 정상이나, 가져온 결과값이 200, 201아닌 경우 message에 담겨있는 것을 WebStatus에 set
		errorInfo := model.ErrorInfo{}
		json.NewDecoder(respBody).Decode(&errorInfo)
		fmt.Println("respStatus != 200 reason ", errorInfo)
		returnStatus.Message = errorInfo.Message
	} else {
		json.NewDecoder(respBody).Decode(&returnWorkflowInfo)
		fmt.Println(returnWorkflowInfo)
	}
	returnStatus.StatusCode = respStatus

	return returnStatus
}

// Workflow 실행
func RunWorkflow(workflowID string)(model.WebStatus){
	var originalUrl = "/workflow/{wfId}/run"

	var paramMapper = make(map[string]string)
	paramMapper["{wfId}"] = workflowID
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)

	url := util.CICADA + urlParam
	
	resp, err := util.CommonHttp(url, nil, http.MethodPost)

	returnSimpleMsg := cicada_common.SimpleMsg{}
	returnStatus := model.WebStatus{}

	if err != nil {
		fmt.Println(err)
		return model.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode

	if respStatus != 200 && respStatus != 201 { // 호출은 정상이나, 가져온 결과값이 200, 201아닌 경우 message에 담겨있는 것을 WebStatus에 set
		errorInfo := model.ErrorInfo{}
		json.NewDecoder(respBody).Decode(&errorInfo)
		fmt.Println("respStatus != 200 reason ", errorInfo)
		returnStatus.Message = errorInfo.Message
	} else {
		json.NewDecoder(respBody).Decode(&returnSimpleMsg)
		fmt.Println(returnSimpleMsg)
	}
	returnStatus.StatusCode = respStatus
	returnStatus.Message = returnSimpleMsg.Message
	return returnStatus
}

// Workflow 목록 조회
func GetWorkflowList(page string, row string) ([]workflow.WorkflowInfo, model.WebStatus) {
	var originalUrl = "/workflow"

	url := util.CICADA + originalUrl
	fmt.Println("Call url ", url )
	log.Println("Call url ", url )
	resp, err := util.CommonHttp(url, nil, http.MethodGet)
	
	if err != nil {
		fmt.Println(err)
		return nil, model.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode
	
	workflowList := []workflow.WorkflowInfo{}
	json.NewDecoder(respBody).Decode(&workflowList)
	log.Println(respBody)
	fmt.Println(workflowList)
	
	
	return workflowList, model.WebStatus{StatusCode: respStatus}
}
// func GetWorkflowList(nameSpaceID string, optionParam string, filterKeyParam string, filterValParam string) ([]cicada.WorkflowInfo, model.WebStatus) {
// 	var originalUrl = "/ns/{namespace}/workflow"

// 	var paramMapper = make(map[string]string)
// 	paramMapper["{namespace}"] = nameSpaceID
// 	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)

// 	url := util.CICADA + urlParam
// 	// url := util.LADYBUG + "/ns/" + nameSpaceID + "/clusters"
// 	resp, err := util.CommonHttp(url, nil, http.MethodGet)
// 	// resp, err := util.CommonHttpWithoutParam(url, http.MethodGet)

// 	if err != nil {
// 		fmt.Println(err)
// 		return nil, model.WebStatus{StatusCode: 500, Message: err.Error()}
// 	}

// 	respBody := resp.Body
// 	respStatus := resp.StatusCode
// 	// 원래는 items 와 kind 가 들어오는데
// 	// kind에는 clusterlist 라는 것만 있고 실제로는 items 에 cluster 정보들이 있음.
// 	// 그래서 굳이 kind까지 처리하지 않고 item만 return
// 	workflowList := map[string][]cicada.WorkflowInfo{}
// 	json.NewDecoder(respBody).Decode(&workflowList)
// 	fmt.Println(workflowList["items"])
// 	log.Println(respBody)
// 	// util.DisplayResponse(resp) // 수신내용 확인

// 	return workflowList["items"], model.WebStatus{StatusCode: respStatus}
// }

// 특정 Workflow 조회
func GetWorkflowData(workflowID string) (*workflow.WorkflowInfo, model.WebStatus) {
	var originalUrl = "/workflow/{workflowId}"
	
	var paramMapper = make(map[string]string)
	paramMapper["{workflowId}"] = workflowID
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)

	url := util.CICADA + urlParam

	resp, err := util.CommonHttpWithoutParam(url, http.MethodGet)

	// defer body.Close()
	workflowInfo := workflow.WorkflowInfo{}
	if err != nil {
		fmt.Println(err)
		return &workflowInfo, model.WebStatus{StatusCode: 500, Message: err.Error()}
	}
	// util.DisplayResponse(resp) // 수신내용 확인

	respBody := resp.Body
	respStatus := resp.StatusCode

	json.NewDecoder(respBody).Decode(&workflowInfo)
	fmt.Println(workflowInfo)

	return &workflowInfo, model.WebStatus{StatusCode: respStatus}
}


// Workflow 수정
// 수정된 workflow내용이 return되나 상태값만 return.
func UpdateWorkflow(workflowID string, workflowInfoReq *workflow.WorkflowReqInfo)(model.WebStatus){
	var originalUrl = "/workflow/{wfId}"

	var paramMapper = make(map[string]string)
	paramMapper["{wfId}"] = workflowID
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)
	url := util.CICADA + urlParam

	pbytes, _ := json.Marshal(workflowInfoReq)
	
	resp, err := util.CommonHttp(url, pbytes, http.MethodPut)

	returnWorkflowInfo := workflow.WorkflowInfo{}
	returnStatus := model.WebStatus{}

	if err != nil {
		fmt.Println(err)
		return model.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode

	if respStatus != 200 && respStatus != 201 { // 호출은 정상이나, 가져온 결과값이 200, 201아닌 경우 message에 담겨있는 것을 WebStatus에 set
		errorInfo := model.ErrorInfo{}
		json.NewDecoder(respBody).Decode(&errorInfo)
		fmt.Println("respStatus != 200 reason ", errorInfo)
		returnStatus.Message = errorInfo.Message
	} else {
		json.NewDecoder(respBody).Decode(&returnWorkflowInfo)
		fmt.Println(returnWorkflowInfo)
	}
	returnStatus.StatusCode = respStatus

	return returnStatus
}

// Workflow 삭제
func DelWorkflow(workflowID string) (*cicada_common.SimpleMsg, model.WebStatus) {
	var originalUrl = "/workflow/{wfId}"

	var paramMapper = make(map[string]string)
	paramMapper["{wfId}"] = workflowID
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)
	url := util.CICADA + urlParam

	if workflowID == "" {
		return nil, model.WebStatus{StatusCode: 500, Message: "workflow is required"}
	}

	// 경로안에 parameter가 있어 추가 param없이 호출 함.
	resp, err := util.CommonHttp(url, nil, http.MethodDelete)

	returnSimpleMsg := cicada_common.SimpleMsg{}
	if err != nil {
		fmt.Println("DelWorkflow ", err)
		return &returnSimpleMsg, model.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode

	json.NewDecoder(respBody).Decode(&returnSimpleMsg)
	fmt.Println(returnSimpleMsg)

	if respStatus != 200 && respStatus != 201 {
		fmt.Println(respBody)
		return &returnSimpleMsg, model.WebStatus{StatusCode: respStatus, Message: returnSimpleMsg.Message}
	}
	return &returnSimpleMsg, model.WebStatus{StatusCode: respStatus}
}



// custom task component 목록 조회
func GetTaskComponentList()([]workflow.TaskComponentInfo, model.WebStatus){
	
	var originalUrl = "/task_component"
	
	url := util.CICADA + originalUrl

	resp, err := util.CommonHttpWithoutParam(url, http.MethodGet)

	// defer body.Close()
	taskComponentList := []workflow.TaskComponentInfo{}
	if err != nil {
		fmt.Println(err)
		return taskComponentList, model.WebStatus{StatusCode: 500, Message: err.Error()}
	}
	// util.DisplayResponse(resp) // 수신내용 확인

	respBody := resp.Body
	respStatus := resp.StatusCode

	json.NewDecoder(respBody).Decode(&taskComponentList)
	fmt.Println(taskComponentList)

	return taskComponentList, model.WebStatus{StatusCode: respStatus}
}

func GetTaskComponentData(taskComponentId string)(workflow.TaskComponentInfo, model.WebStatus){
	var originalUrl = "/task_component/{tcId}"
	
	var paramMapper = make(map[string]string)
	paramMapper["{tcId}"] = taskComponentId
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)

	url := util.CICADA + urlParam

	resp, err := util.CommonHttpWithoutParam(url, http.MethodGet)

	// defer body.Close()
	taskComponentInfo := workflow.TaskComponentInfo{}
	if err != nil {
		fmt.Println(err)
		return taskComponentInfo, model.WebStatus{StatusCode: 500, Message: err.Error()}
	}
	// util.DisplayResponse(resp) // 수신내용 확인

	respBody := resp.Body
	respStatus := resp.StatusCode

	json.NewDecoder(respBody).Decode(&taskComponentInfo)
	fmt.Println(taskComponentInfo)

	return taskComponentInfo, model.WebStatus{StatusCode: respStatus}
}


// WorkflowTemplate 목록 조회
func GetWorkflowTemplateList()([]workflow.WorkflowTemplateInfo, model.WebStatus){
	var originalUrl = "/workflow_template"
	
	url := util.CICADA + originalUrl

	resp, err := util.CommonHttpWithoutParam(url, http.MethodGet)

	// defer body.Close()
	workflowTemplateList := []workflow.WorkflowTemplateInfo{}
	if err != nil {
		fmt.Println(err)
		return workflowTemplateList, model.WebStatus{StatusCode: 500, Message: err.Error()}
	}
	// util.DisplayResponse(resp) // 수신내용 확인

	respBody := resp.Body
	respStatus := resp.StatusCode

	json.NewDecoder(respBody).Decode(&workflowTemplateList)
	fmt.Println(workflowTemplateList)

	return workflowTemplateList, model.WebStatus{StatusCode: respStatus}
}

// WorkflowTemplate 조회
func GetWorkflowTemplateData(workflowTemplateID string)(workflow.WorkflowTemplateInfo, model.WebStatus){
	var originalUrl = "/workflow_template/{wftId}"
	
	var paramMapper = make(map[string]string)
	paramMapper["{wftId}"] = workflowTemplateID
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)

	url := util.CICADA + urlParam

	resp, err := util.CommonHttpWithoutParam(url, http.MethodGet)

	// defer body.Close()
	workflowTemplateInfo := workflow.WorkflowTemplateInfo{}
	if err != nil {
		fmt.Println(err)
		return workflowTemplateInfo, model.WebStatus{StatusCode: 500, Message: err.Error()}
	}
	// util.DisplayResponse(resp) // 수신내용 확인

	respBody := resp.Body
	respStatus := resp.StatusCode

	json.NewDecoder(respBody).Decode(&workflowTemplateInfo)
	fmt.Println(workflowTemplateInfo)

	return workflowTemplateInfo, model.WebStatus{StatusCode: respStatus}
}

// TODO : Cicada 의 workflow를 Butterfly 의 workflow 형태로 변경
func ConvertCicadaToButterfly(workflowList []workflow.WorkflowInfo) string{
	// taskGroupSequenceList := []butterfly.ButterflyTaskGroup{}
	// taskSequenceList := []butterfly.ButterflyTask{}
	
	// sequenc에 맞게 정렬
	for _, workflowInfo := range workflowList {
		workflowData := workflowInfo.WorkflowData
		
		for _, taskGroupInfo := range workflowData.TaskGroups {

	// 		groupDependencyList := taskGroupInfo.DependencyList
	// 		// group의 dependency로 정렬
			for _, taskInfo := range taskGroupInfo.Tasks {
				//dependencyList := taskInfo.DependencyList // 현재 Task가 1개이므로 정렬 skip
				// task의 dependency로 정렬
				
				fmt.Println(taskInfo)
			}
		}
	
	}
	
	return ""
}