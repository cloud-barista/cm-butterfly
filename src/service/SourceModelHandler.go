package service

import (
	"encoding/json"
	"fmt"

	"log"
	"net/http"

	"github.com/cloud-barista/cm-butterfly/src/model"
	
	tbcommon "github.com/cloud-barista/cm-butterfly/src/model/tumblebug/common"
	tbmcis "github.com/cloud-barista/cm-butterfly/src/model/tumblebug/mcis"

	util "github.com/cloud-barista/cm-butterfly/src/util"
)

func GetSourceModelList(nameSpaceID string, optionParam string) ([]tbmcis.TbMcisInfo, model.WebStatus) {
	var originalUrl = "/ns/{nsId}/mcis"

	var paramMapper = make(map[string]string)
	paramMapper["{nsId}"] = nameSpaceID
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)

	optionParamVal := ""

	if optionParam == "" {
		optionParam = "status"
	}
	
	if optionParam == "all" {
		optionParamVal = "" // all 은 optionParam값이 없는 경우임.
	} else {
		optionParamVal = "?option=" + optionParam
	}

	url := util.TUMBLEBUG + urlParam + optionParamVal
	
	resp, err := util.CommonHttp(url, nil, http.MethodGet)
	
	if err != nil {
		fmt.Println(err)
		return nil, model.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode

	mcisList := map[string][]tbmcis.TbMcisInfo{}
	returnStatus := model.WebStatus{}

	if respStatus != 200 && respStatus != 201 { // 호출은 정상이나, 가져온 결과값이 200, 201아닌 경우 message에 담겨있는 것을 WebStatus에 set
		failResultInfo := tbcommon.TbSimpleMsg{}
		json.NewDecoder(respBody).Decode(&failResultInfo)
		return nil, model.WebStatus{StatusCode: respStatus, Message: failResultInfo.Message}
	}
	json.NewDecoder(respBody).Decode(&mcisList)
	fmt.Println(mcisList["mcis"])

	returnStatus.StatusCode = respStatus
	log.Println(respBody)
	// util.DisplayResponse(resp) // 수신내용 확인

	return mcisList["mcis"], returnStatus
}

