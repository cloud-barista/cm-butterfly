package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	// "os"

	// "cm_butterfly/frameworkmodel/spider"

	fwmodel "cm_butterfly/frameworkmodel"
	tbcommon "cm_butterfly/frameworkmodel/tumblebug/common"

	// tbmcir "cm_butterfly/frameworkmodel/tumblebug/mcir"
	tbmcis "cm_butterfly/frameworkmodel/tumblebug/mcis"

	util "cm_butterfly/util"
)

// List all MCIS Policys
func GetMcisPolicyList(nameSpaceID string) ([]tbmcis.RestGetAllMcisPolicyResponse, fwmodel.WebStatus) {
	var originalUrl = "/ns/{nsId}/policy/mcis"

	var paramMapper = make(map[string]string)
	paramMapper["{nsId}"] = nameSpaceID
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)

	url := util.TUMBLEBUG + urlParam
	// url := util.TUMBLEBUG + "/ns/" + nameSpaceID + "/policy/mcis"

	// resp, err := util.CommonHttp(url, nil, http.MethodGet)
	resp, err := util.CommonHttpWithoutParam(url, http.MethodGet)

	if err != nil {
		fmt.Println(err)
		return nil, fwmodel.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode

	mcisPolicyList := map[string][]tbmcis.RestGetAllMcisPolicyResponse{}
	json.NewDecoder(respBody).Decode(&mcisPolicyList)
	fmt.Println(mcisPolicyList["mcisPolicy"])
	log.Println(respBody)
	util.DisplayResponse(resp) // 수신내용 확인

	return mcisPolicyList["mcisPolicy"], fwmodel.WebStatus{StatusCode: respStatus}
}

// Get McisPolish Data
func GetMcisPolicyInfoData(nameSpaceID string, mcisID string) (*tbmcis.RestGetAllMcisPolicyResponse, fwmodel.WebStatus) {
	var originalUrl = "/ns/{nsId}/policy/mcis/{mcisId}"

	var paramMapper = make(map[string]string)
	paramMapper["{nsId}"] = nameSpaceID
	paramMapper["{mcisId}"] = mcisID
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)

	url := util.TUMBLEBUG + urlParam
	// url := util.TUMBLEBUG + "/ns/" + nameSpaceID + "/policy/mcis/" + mcisID

	resp, err := util.CommonHttpWithoutParam(url, http.MethodGet)

	// defer body.Close()
	mcisPolicyInfo := tbmcis.RestGetAllMcisPolicyResponse{}
	if err != nil {
		fmt.Println(err)
		return &mcisPolicyInfo, fwmodel.WebStatus{StatusCode: 500, Message: err.Error()}
	}
	// util.DisplayResponse(resp) // 수신내용 확인

	respBody := resp.Body
	respStatus := resp.StatusCode

	json.NewDecoder(respBody).Decode(&mcisPolicyInfo)
	fmt.Println(mcisPolicyInfo)

	return &mcisPolicyInfo, fwmodel.WebStatus{StatusCode: respStatus}
}

func RegMcisPolicy(nameSpaceID string, mcisID string, mcisPolicyInfo *tbmcis.McisPolicyInfo) (*tbmcis.McisPolicyInfo, fwmodel.WebStatus) {
	var originalUrl = "/ns/{nsId}/policy/mcis/{mcisId}"

	var paramMapper = make(map[string]string)
	paramMapper["{nsId}"] = nameSpaceID
	paramMapper["{mcisId}"] = mcisID
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)

	url := util.TUMBLEBUG + urlParam
	// url := util.TUMBLEBUG + "/ns/" + nameSpaceID + "/policy/mcis" + mcisID

	pbytes, _ := json.Marshal(mcisPolicyInfo)
	resp, err := util.CommonHttp(url, pbytes, http.MethodPost)

	returnMcisPolicyInfo := tbmcis.McisPolicyInfo{}
	returnStatus := fwmodel.WebStatus{}

	respBody := resp.Body
	respStatus := resp.StatusCode

	if err != nil {
		fmt.Println(err)
		return &returnMcisPolicyInfo, fwmodel.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	if respStatus != 200 && respStatus != 201 { // 호출은 정상이나, 가져온 결과값이 200, 201아닌 경우 message에 담겨있는 것을 WebStatus에 set
		errorInfo := fwmodel.ErrorInfo{}
		json.NewDecoder(respBody).Decode(&errorInfo)
		fmt.Println("respStatus != 200 reason ", errorInfo)
		returnStatus.Message = errorInfo.Message
	} else {
		json.NewDecoder(respBody).Decode(&returnMcisPolicyInfo)
		fmt.Println(returnMcisPolicyInfo)
	}
	returnStatus.StatusCode = respStatus

	return &returnMcisPolicyInfo, returnStatus
}

func DelAllMcisPolicy(nameSpaceID string) (tbcommon.TbSimpleMsg, fwmodel.WebStatus) {
	var originalUrl = "/ns/{nsId}/policy/mcis"

	var paramMapper = make(map[string]string)
	paramMapper["{nsId}"] = nameSpaceID
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)

	url := util.TUMBLEBUG + urlParam

	resp, err := util.CommonHttpWithoutParam(url, http.MethodDelete)

	resultInfo := tbcommon.TbSimpleMsg{}

	if err != nil {
		return resultInfo, fwmodel.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode

	json.NewDecoder(respBody).Decode(&resultInfo)
	log.Println(resultInfo)
	log.Println("ResultMessage : " + resultInfo.Message)

	if respStatus != 200 && respStatus != 201 {
		return resultInfo, fwmodel.WebStatus{StatusCode: respStatus, Message: resultInfo.Message}
	}

	return resultInfo, fwmodel.WebStatus{StatusCode: respStatus}
}

func DelMcisPolicy(nameSpaceID string, mcisID string) (io.ReadCloser, fwmodel.WebStatus) {
	var originalUrl = "/ns/{nsId}/policy/mcis/{mcisId}"

	var paramMapper = make(map[string]string)
	paramMapper["{nsId}"] = nameSpaceID
	paramMapper["{mcisId}"] = mcisID
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)

	url := util.TUMBLEBUG + urlParam
	// url := util.TUMBLEBUG + "/ns/" + nameSpaceID + "/policy/mcis/" + mcisID

	if mcisID == "" {
		return nil, fwmodel.WebStatus{StatusCode: 500, Message: "MCIS ID is required"}
	}

	// 경로안에 parameter가 있어 추가 param없이 호출 함.
	resp, err := util.CommonHttp(url, nil, http.MethodDelete)
	if err != nil {
		fmt.Println(err)
		return nil, fwmodel.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode
	return respBody, fwmodel.WebStatus{StatusCode: respStatus}
}
