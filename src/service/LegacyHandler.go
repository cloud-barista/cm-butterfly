package service

import (
	"encoding/json"
	"fmt"
	"github.com/cloud-barista/cm-butterfly/src/model"
	"github.com/cloud-barista/cm-butterfly/src/model/honeybee/common"
	honeybeecommon "github.com/cloud-barista/cm-butterfly/src/model/honeybee/common"
	honeybeesourcegroup "github.com/cloud-barista/cm-butterfly/src/model/honeybee/sourcegroup"
	honeybeeinfra "github.com/cloud-barista/cm-butterfly/src/model/honeybee/sourcegroup/infra"
	honeybeesoftware "github.com/cloud-barista/cm-butterfly/src/model/honeybee/sourcegroup/software"
	"github.com/cloud-barista/cm-butterfly/src/util"
	"log"
	"net/http"
)

/**
HoneyBee Api Manage Handler - 2024.06.05
*/

func GetSourceConnectionInfoDataById(connectionId string) ([]honeybeesourcegroup.SourceConnectionInfo, model.WebStatus) {
	var originalUrl = "/connection_info/{connId}"

	var paramMapper = make(map[string]string)
	paramMapper["{connId}"] = connectionId
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)

	url := util.HONEYBEE + urlParam

	resp, err := util.CommonHttp(url, nil, http.MethodGet)

	if err != nil {
		fmt.Println(err)
		return nil, model.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode
	connectionInfo := []honeybeesourcegroup.SourceConnectionInfo{}

	returnStatus := model.WebStatus{}

	if respStatus != 200 && respStatus != 201 { // 호출은 정상이나, 가져온 결과값이 200, 201아닌 경우 message에 담겨있는 것을 WebStatus에 set
		failResultInfo := honeybeecommon.SimpleMsg{}
		json.NewDecoder(respBody).Decode(&failResultInfo)
		return nil, model.WebStatus{StatusCode: respStatus, Message: failResultInfo.Message}
	}
	decordErr := json.NewDecoder(respBody).Decode(&connectionInfo)
	if decordErr != nil {
		fmt.Println(decordErr)
	}
	fmt.Println(connectionInfo)

	returnStatus.StatusCode = respStatus
	log.Println(respBody)
	util.DisplayResponse(resp) // 수신내용 확인

	return connectionInfo, returnStatus
}

func GetSourceConnectionInfoListBySourceId(sourceGroupId string) (*[]honeybeesourcegroup.SourceConnectionInfo, model.WebStatus) {
	var originalUrl = "/source_group/{sgId}/connection_info"

	var paramMapper = make(map[string]string)
	paramMapper["{sgId}"] = sourceGroupId
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)

	url := util.HONEYBEE + urlParam

	resp, err := util.CommonHttp(url, nil, http.MethodGet)

	if err != nil {
		fmt.Println(err)
		return nil, model.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode
	connectionInfoList := &[]honeybeesourcegroup.SourceConnectionInfo{}

	returnStatus := model.WebStatus{}

	if respStatus != 200 && respStatus != 201 { // 호출은 정상이나, 가져온 결과값이 200, 201아닌 경우 message에 담겨있는 것을 WebStatus에 set
		failResultInfo := honeybeecommon.SimpleMsg{}
		json.NewDecoder(respBody).Decode(&failResultInfo)
		return nil, model.WebStatus{StatusCode: respStatus, Message: failResultInfo.Message}
	}
	json.NewDecoder(respBody).Decode(&connectionInfoList)
	fmt.Println(connectionInfoList)

	returnStatus.StatusCode = respStatus
	log.Println(respBody)
	util.DisplayResponse(resp) // 수신내용 확인

	return connectionInfoList, returnStatus
}

func RegSourceConnectionInfo(sourceGroupId string, connectionInfo *honeybeesourcegroup.SourceConnectionInfoReq) (*honeybeesourcegroup.SourceConnectionInfo, model.WebStatus) {
	var originalUrl = "/source_group/{sgId}/connection_info"

	var paramMapper = make(map[string]string)
	paramMapper["{sgId}"] = sourceGroupId
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)

	url := util.HONEYBEE + urlParam

	pbytes, _ := json.Marshal(connectionInfo)
	resp, err := util.CommonHttp(url, pbytes, http.MethodPost)

	returnConnectionInfo := honeybeesourcegroup.SourceConnectionInfo{}
	returnStatus := model.WebStatus{}

	respBody := resp.Body
	respStatus := resp.StatusCode

	if err != nil {
		fmt.Println(err)
		return &returnConnectionInfo, model.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	if respStatus != 200 && respStatus != 201 { // 호출은 정상이나, 가져온 결과값이 200, 201아닌 경우 message에 담겨있는 것을 WebStatus에 set
		failResultInfo := honeybeecommon.SimpleMsg{}
		json.NewDecoder(respBody).Decode(&failResultInfo)
		return &returnConnectionInfo, model.WebStatus{StatusCode: respStatus, Message: failResultInfo.Message}
	}

	json.NewDecoder(respBody).Decode(&returnConnectionInfo)
	fmt.Println(returnConnectionInfo)

	returnStatus.StatusCode = respStatus

	return &returnConnectionInfo, returnStatus
}

func GetSourceConnectionDataBysgIdAndconnId(sourceGroupId string, connectionId string) (*honeybeesourcegroup.SourceConnectionInfo, model.WebStatus) {
	var originalUrl = "/source_group/{sgId}/connection_info/{connId}"

	var paramMapper = make(map[string]string)	
	paramMapper["{sgId}"] = sourceGroupId
	paramMapper["{connId}"] = connectionId
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)

	url := util.HONEYBEE + urlParam

	resp, err := util.CommonHttp(url, nil, http.MethodGet)

	if err != nil {
		fmt.Println(err)
		return nil, model.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode
	connectionInfo := &honeybeesourcegroup.SourceConnectionInfo{}

	returnStatus := model.WebStatus{}

	if respStatus != 200 && respStatus != 201 { // 호출은 정상이나, 가져온 결과값이 200, 201아닌 경우 message에 담겨있는 것을 WebStatus에 set
		failResultInfo := honeybeecommon.SimpleMsg{}
		json.NewDecoder(respBody).Decode(&failResultInfo)
		return nil, model.WebStatus{StatusCode: respStatus, Message: failResultInfo.Message}
	}
	json.NewDecoder(respBody).Decode(&connectionInfo)
	fmt.Println(connectionInfo)

	returnStatus.StatusCode = respStatus
	log.Println(respBody)
	util.DisplayResponse(resp) // 수신내용 확인

	return connectionInfo, returnStatus
}

// put /honeybee/source_group/{sgId}/connection_info/{connId}
func UpdateLegacySourceConnectionInfo(connectionId string, sourceGroupId string, connectionInfo honeybeesourcegroup.SourceConnectionInfoReq) (*honeybeesourcegroup.SourceConnectionInfo, model.WebStatus) {
	var originalUrl = "/source_group/{sgId}/connection_info/{connId}"

	var paramMapper = make(map[string]string)
	paramMapper["{connId}"] = connectionId
	paramMapper["{sgId}"] = sourceGroupId
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)

	url := util.HONEYBEE + urlParam
	pbytes, _ := json.Marshal(connectionInfo)
	resp, err := util.CommonHttp(url, pbytes, http.MethodPut)

	if err != nil {
		fmt.Println(err)
		return nil, model.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode
	returnConnectionInfo := &honeybeesourcegroup.SourceConnectionInfo{}

	returnStatus := model.WebStatus{}

	if respStatus != 200 && respStatus != 201 { // 호출은 정상이나, 가져온 결과값이 200, 201아닌 경우 message에 담겨있는 것을 WebStatus에 set
		failResultInfo := honeybeecommon.SimpleMsg{}
		json.NewDecoder(respBody).Decode(&failResultInfo)
		return nil, model.WebStatus{StatusCode: respStatus, Message: failResultInfo.Message}
	}
	json.NewDecoder(respBody).Decode(&returnConnectionInfo)
	fmt.Println(returnConnectionInfo)

	returnStatus.StatusCode = respStatus
	log.Println(respBody)
	util.DisplayResponse(resp) // 수신내용 확인

	return returnConnectionInfo, returnStatus
}

// put /honeybee/source_group/{sgId}/connection_info/{connId}
func DeleteLegacySourceConnectionInfo(connectionId string, sourceGroupId string) (*common.SimpleMsg, model.WebStatus) {
	var originalUrl = "/source_group/{sgId}/connection_info/{connId}"

	var paramMapper = make(map[string]string)
	paramMapper["{sgId}"] = sourceGroupId
	paramMapper["{connId}"] = connectionId
	
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)

	url := util.HONEYBEE + urlParam

	resp, err := util.CommonHttp(url, nil, http.MethodDelete)

	if err != nil {
		fmt.Println(err)
		return nil, model.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode
	message := &common.SimpleMsg{}

	returnStatus := model.WebStatus{}

	if respStatus != 200 && respStatus != 201 { // 호출은 정상이나, 가져온 결과값이 200, 201아닌 경우 message에 담겨있는 것을 WebStatus에 set
		failResultInfo := honeybeecommon.SimpleMsg{}
		json.NewDecoder(respBody).Decode(&failResultInfo)
		return nil, model.WebStatus{StatusCode: respStatus, Message: failResultInfo.Message}
	}
	json.NewDecoder(respBody).Decode(&message)
	fmt.Println(message)

	returnStatus.StatusCode = respStatus
	log.Println(respBody)
	util.DisplayResponse(resp) // 수신내용 확인

	return message, returnStatus
}

// /honeybee/readyz move to Commonhandler
// func CheckReadyHoneybee() (*common.SimpleMsg, model.WebStatus) {
// 	var originalUrl = "/readyz"

// 	url := util.HONEYBEE + originalUrl

// 	resp, err := util.CommonHttp(url, nil, http.MethodGet)

// 	if err != nil {
// 		fmt.Println(err)
// 		return nil, model.WebStatus{StatusCode: 500, Message: err.Error()}
// 	}

// 	respBody := resp.Body
// 	respStatus := resp.StatusCode

// 	returnStatus := model.WebStatus{}
// 	returnModel := common.SimpleMsg{}
// 	if respStatus != 200 && respStatus != 201 { // 호출은 정상이나, 가져온 결과값이 200, 201아닌 경우 message에 담겨있는 것을 WebStatus에 set
// 		failResultInfo := honeybeecommon.SimpleMsg{}
// 		json.NewDecoder(respBody).Decode(&failResultInfo)
// 		return nil, model.WebStatus{StatusCode: respStatus, Message: failResultInfo.Message}
// 	}
// 	json.NewDecoder(respBody).Decode(&returnModel)
// 	fmt.Println(returnModel)

// 	returnStatus.StatusCode = respStatus
// 	log.Println(respBody)
// 	util.DisplayResponse(resp) // 수신내용 확인

// 	return &returnModel, returnStatus
// }

// //////////////////////////////////////SourceGroup
// /honeybee/source_group get
func GetLegacySourceGroupList() ([]honeybeesourcegroup.SourceGroupInfo, model.WebStatus) {
	var originalUrl = "/source_group"

	url := util.HONEYBEE + originalUrl

	resp, err := util.CommonHttp(url, nil, http.MethodGet)

	if err != nil {
		fmt.Println(err)
		return nil, model.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode
	sourceGroupInfoList := []honeybeesourcegroup.SourceGroupInfo{}

	returnStatus := model.WebStatus{}

	if respStatus != 200 && respStatus != 201 { // 호출은 정상이나, 가져온 결과값이 200, 201아닌 경우 message에 담겨있는 것을 WebStatus에 set
		failResultInfo := honeybeecommon.SimpleMsg{}
		json.NewDecoder(respBody).Decode(&failResultInfo)
		return nil, model.WebStatus{StatusCode: respStatus, Message: failResultInfo.Message}
	}
	fmt.Println(respBody)
	decordErr := json.NewDecoder(respBody).Decode(&sourceGroupInfoList)
	if decordErr != nil {
		fmt.Println("Decode Error : ", decordErr)
	}

	fmt.Println("sourceGroupInfoList")
	fmt.Println(sourceGroupInfoList)
	fmt.Println("sourceGroupInfoList end")

	returnStatus.StatusCode = respStatus
	log.Println(respBody)
	util.DisplayResponse(resp) // 수신내용 확인

	return sourceGroupInfoList, returnStatus
}

// /honeybee/source_group post
func RegLegacySourceGroup(sourceGroupReq honeybeesourcegroup.SourceGroupReq) (*honeybeesourcegroup.SourceGroupInfo, model.WebStatus) {
	var originalUrl = "/source_group"

	url := util.HONEYBEE + originalUrl
	pbytes, _ := json.Marshal(sourceGroupReq)
	resp, err := util.CommonHttp(url, pbytes, http.MethodPost)

	if err != nil {
		fmt.Println(err)
		return nil, model.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode
	sourceGroupInfo := &honeybeesourcegroup.SourceGroupInfo{}

	returnStatus := model.WebStatus{}

	if respStatus != 200 && respStatus != 201 { // 호출은 정상이나, 가져온 결과값이 200, 201아닌 경우 message에 담겨있는 것을 WebStatus에 set
		failResultInfo := honeybeecommon.SimpleMsg{}
		json.NewDecoder(respBody).Decode(&failResultInfo)
		return nil, model.WebStatus{StatusCode: respStatus, Message: failResultInfo.Message}
	}
	json.NewDecoder(respBody).Decode(&sourceGroupInfo)
	fmt.Println(sourceGroupInfo)

	returnStatus.StatusCode = respStatus
	log.Println(respBody)
	util.DisplayResponse(resp) // 수신내용 확인

	return sourceGroupInfo, returnStatus
}

// /honeybee/source_group/{sgId} get
func GetLegacySourceGroupDataById(sourceGroupId string) (*honeybeesourcegroup.SourceGroupInfo, model.WebStatus) {
	var originalUrl = "/source_group/{sgId}"

	var paramMapper = make(map[string]string)
	paramMapper["{sgId}"] = sourceGroupId
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)

	url := util.HONEYBEE + urlParam

	resp, err := util.CommonHttp(url, nil, http.MethodGet)

	if err != nil {
		fmt.Println(err)
		return nil, model.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode
	sourceGroupInfo := &honeybeesourcegroup.SourceGroupInfo{}

	returnStatus := model.WebStatus{}

	if respStatus != 200 && respStatus != 201 { // 호출은 정상이나, 가져온 결과값이 200, 201아닌 경우 message에 담겨있는 것을 WebStatus에 set
		failResultInfo := honeybeecommon.SimpleMsg{}
		json.NewDecoder(respBody).Decode(&failResultInfo)
		return nil, model.WebStatus{StatusCode: respStatus, Message: failResultInfo.Message}
	}
	json.NewDecoder(respBody).Decode(&sourceGroupInfo)
	fmt.Println(sourceGroupInfo)

	returnStatus.StatusCode = respStatus
	log.Println(respBody)
	util.DisplayResponse(resp) // 수신내용 확인

	return sourceGroupInfo, returnStatus
}


func UpdateLegacySourceGroupData(sourceGroupId string, updateSourceGroupInfo honeybeesourcegroup.SourceGroupReq) (*honeybeesourcegroup.SourceGroupInfo, model.WebStatus) {
	var originalUrl = "/source_group/{sgId}"

	var paramMapper = make(map[string]string)
	paramMapper["{sgId}"] = sourceGroupId
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)

	url := util.HONEYBEE + urlParam

	pbytes, _ := json.Marshal(updateSourceGroupInfo)
	resp, err := util.CommonHttp(url, pbytes, http.MethodPut)

	if err != nil {
		fmt.Println(err)
		return nil, model.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode
	sourceGroupInfo := &honeybeesourcegroup.SourceGroupInfo{}

	returnStatus := model.WebStatus{}

	if respStatus != 200 && respStatus != 201 { // 호출은 정상이나, 가져온 결과값이 200, 201아닌 경우 message에 담겨있는 것을 WebStatus에 set
		failResultInfo := honeybeecommon.SimpleMsg{}
		json.NewDecoder(respBody).Decode(&failResultInfo)
		return nil, model.WebStatus{StatusCode: respStatus, Message: failResultInfo.Message}
	}
	json.NewDecoder(respBody).Decode(&sourceGroupInfo)
	fmt.Println(sourceGroupInfo)

	returnStatus.StatusCode = respStatus
	log.Println(respBody)
	util.DisplayResponse(resp) // 수신내용 확인

	return sourceGroupInfo, returnStatus
}

// /honeybee/source_group/{sgId} delete
func DeleteLegacySourceGroupData(sourceGroupId string) (*common.SimpleMsg, model.WebStatus) {
	var originalUrl = "/source_group/{sgId}"

	var paramMapper = make(map[string]string)
	paramMapper["{sgId}"] = sourceGroupId
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)

	url := util.HONEYBEE + urlParam

	resp, err := util.CommonHttp(url, nil, http.MethodDelete)

	if err != nil {
		fmt.Println(err)
		return nil, model.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode
	message := &common.SimpleMsg{}

	returnStatus := model.WebStatus{}

	if respStatus != 200 && respStatus != 201 { // 호출은 정상이나, 가져온 결과값이 200, 201아닌 경우 message에 담겨있는 것을 WebStatus에 set
		failResultInfo := honeybeecommon.SimpleMsg{}
		json.NewDecoder(respBody).Decode(&failResultInfo)
		return nil, model.WebStatus{StatusCode: respStatus, Message: failResultInfo.Message}
	}
	json.NewDecoder(respBody).Decode(&message)
	fmt.Println(message)

	returnStatus.StatusCode = respStatus
	log.Println(respBody)
	util.DisplayResponse(resp) // 수신내용 확인

	return message, returnStatus
}

// /honeybee/source_group/{sgId}/connection_check get
func CheckLegacySourceGroupConnection(sourceGroupId string) ([]honeybeesourcegroup.SourceConnectionInfo, model.WebStatus) {
	var originalUrl = "/source_group/{sgId}/connection_check"

	var paramMapper = make(map[string]string)
	paramMapper["{sgId}"] = sourceGroupId
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)

	url := util.HONEYBEE + urlParam
	resp, err := util.CommonHttp(url, nil, http.MethodGet)

	if err != nil {
		fmt.Println(err)
		return nil, model.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode
	sourceGroupConnectionInfo := []honeybeesourcegroup.SourceConnectionInfo{}

	returnStatus := model.WebStatus{}

	if respStatus != 200 && respStatus != 201 { // 호출은 정상이나, 가져온 결과값이 200, 201아닌 경우 message에 담겨있는 것을 WebStatus에 set
		failResultInfo := honeybeecommon.SimpleMsg{}
		json.NewDecoder(respBody).Decode(&failResultInfo)
		return nil, model.WebStatus{StatusCode: respStatus, Message: failResultInfo.Message}
	}
	json.NewDecoder(respBody).Decode(&sourceGroupConnectionInfo)
	fmt.Println(sourceGroupConnectionInfo)

	returnStatus.StatusCode = respStatus
	log.Println(respBody)
	util.DisplayResponse(resp) // 수신내용 확인

	return sourceGroupConnectionInfo, returnStatus
}

//[Import] Import source info


func GetImportLegacyInfraInfoBySourceIdAndConnId(sourceGroupId string, connectionId string) (*honeybeesourcegroup.SavedInfraInfo, model.WebStatus) {
	var originalUrl = "/source_group/{sgId}/connection_info/{connId}/import/infra"

	var paramMapper = make(map[string]string)
	paramMapper["{sgId}"] = sourceGroupId
	paramMapper["{connId}"] = connectionId
	
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)

	url := util.HONEYBEE + urlParam

	resp, err := util.CommonHttp(url, nil, http.MethodGet)

	if err != nil {
		fmt.Println(err)
		return nil, model.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode
	saveInfraInfo := &honeybeesourcegroup.SavedInfraInfo{}

	returnStatus := model.WebStatus{}

	if respStatus != 200 && respStatus != 201 { // 호출은 정상이나, 가져온 결과값이 200, 201아닌 경우 message에 담겨있는 것을 WebStatus에 set
		failResultInfo := honeybeecommon.SimpleMsg{}
		json.NewDecoder(respBody).Decode(&failResultInfo)
		return nil, model.WebStatus{StatusCode: respStatus, Message: failResultInfo.Message}
	}
	decodeErr := json.NewDecoder(respBody).Decode(&saveInfraInfo)
	if decodeErr != nil {
		fmt.Println(decodeErr)
		fmt.Println(respBody)
	}
	fmt.Println(saveInfraInfo)

	returnStatus.StatusCode = respStatus
	log.Println(respBody)
	util.DisplayResponse(resp) // 수신내용 확인

	return saveInfraInfo, returnStatus
}


func GetImportLegacySoftwareInfoBySourceIdAndConnId(sourceGroupId string, connectionId string ) (*honeybeesourcegroup.SavedSoftwareInfo, model.WebStatus) {
	var originalUrl = "/source_group/{sgId}/connection_info/{connId}/import/infra"

	var paramMapper = make(map[string]string)
	paramMapper["{sgId}"] = sourceGroupId
	paramMapper["{connId}"] = connectionId
	
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)

	url := util.HONEYBEE + urlParam

	resp, err := util.CommonHttp(url, nil, http.MethodGet)

	if err != nil {
		fmt.Println(err)
		return nil, model.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode
	softwareInfraInfo := &honeybeesourcegroup.SavedSoftwareInfo{}

	returnStatus := model.WebStatus{}

	if respStatus != 200 && respStatus != 201 { // 호출은 정상이나, 가져온 결과값이 200, 201아닌 경우 message에 담겨있는 것을 WebStatus에 set
		failResultInfo := honeybeecommon.SimpleMsg{}
		json.NewDecoder(respBody).Decode(&failResultInfo)
		return nil, model.WebStatus{StatusCode: respStatus, Message: failResultInfo.Message}
	}
	json.NewDecoder(respBody).Decode(&softwareInfraInfo)
	fmt.Println(softwareInfraInfo)

	returnStatus.StatusCode = respStatus
	log.Println(respBody)
	util.DisplayResponse(resp) // 수신내용 확인

	return softwareInfraInfo, returnStatus
}

// [Get] Get source info
// /honeybee/source_group/{sgId}/connection_info/{connId}/infra
func GetLegacyInfraInfoBySourceIdAndConnId(sourceGroupId string, connectionId string) (honeybeeinfra.InfraInfo, model.WebStatus) {
	var originalUrl = "/source_group/{sgId}/connection_info/{connId}/import/infra"

	var paramMapper = make(map[string]string)
	paramMapper["{sgId}"] = sourceGroupId
	paramMapper["{connId}"] = connectionId
	
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)

	url := util.HONEYBEE + urlParam

	resp, err := util.CommonHttp(url, nil, http.MethodGet)

	if err != nil {
		fmt.Println(err)
		return honeybeeinfra.InfraInfo{}, model.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode
	infraInfo := honeybeeinfra.InfraInfo{}

	returnStatus := model.WebStatus{}

	if respStatus != 200 && respStatus != 201 { // 호출은 정상이나, 가져온 결과값이 200, 201아닌 경우 message에 담겨있는 것을 WebStatus에 set
		failResultInfo := honeybeecommon.SimpleMsg{}
		json.NewDecoder(respBody).Decode(&failResultInfo)
		return honeybeeinfra.InfraInfo{}, model.WebStatus{StatusCode: respStatus, Message: failResultInfo.Message}
	}

	decodeErr := json.NewDecoder(respBody).Decode(&infraInfo)
	if decodeErr != nil {
		fmt.Println(respBody)
		fmt.Println(decodeErr)
	}
	fmt.Println(infraInfo)

	returnStatus.StatusCode = respStatus
	log.Println(respBody)
	util.DisplayResponse(resp) // 수신내용 확인

	return infraInfo, returnStatus
}

func GetLegacySoftwareInfoBySourceIdAndConnId(sourceGroupId string, connectionId string)  (*honeybeesoftware.SoftwareInfo, model.WebStatus) {
	var originalUrl = "/source_group/{sgId}/connection_info/{connId}/software"

	var paramMapper = make(map[string]string)
	paramMapper["{sgId}"] = sourceGroupId
	paramMapper["{connId}"] = connectionId
	
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)

	url := util.HONEYBEE + urlParam

	resp, err := util.CommonHttp(url, nil, http.MethodGet)

	if err != nil {
		fmt.Println(err)
		return nil, model.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode

	softwareInfo := &honeybeesoftware.SoftwareInfo{}	
	returnStatus := model.WebStatus{}

	if respStatus != 200 && respStatus != 201 { // 호출은 정상이나, 가져온 결과값이 200, 201아닌 경우 message에 담겨있는 것을 WebStatus에 set
		failResultInfo := honeybeecommon.SimpleMsg{}
		json.NewDecoder(respBody).Decode(&failResultInfo)
		return nil, model.WebStatus{StatusCode: respStatus, Message: failResultInfo.Message}
	}
	decodeErr := json.NewDecoder(respBody).Decode(&softwareInfo)
	if decodeErr != nil {
		fmt.Println(respBody)
		fmt.Println(decodeErr)
	}

	returnStatus.StatusCode = respStatus
	util.DisplayResponse(resp) // 수신내용 확인

	return softwareInfo, returnStatus
}
