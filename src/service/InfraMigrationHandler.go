package service

import (
	"encoding/json"
	"fmt"

	"log"
	"net/http"

	"github.com/cloud-barista/cm-butterfly/src/model"
	
	beetlecommon "github.com/cloud-barista/cm-butterfly/src/model/beetle/common"
	beetle "github.com/cloud-barista/cm-butterfly/src/model/beetle/migrate"

	util "github.com/cloud-barista/cm-butterfly/src/util"
)

func GetMigrationInfraList() ([]beetle.MigrateInfraInfo, model.WebStatus) {
	var originalUrl = "/migration/infra"

	var paramMapper = make(map[string]string)	
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)

	url := util.BEETLE + urlParam
	
	resp, err := util.CommonHttp(url, nil, http.MethodGet)
	
	if err != nil {
		fmt.Println(err)
		return nil, model.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode

	migrateInfraList := []beetle.MigrateInfraInfo{}
	returnStatus := model.WebStatus{}

	if respStatus != 200 && respStatus != 201 { // 호출은 정상이나, 가져온 결과값이 200, 201아닌 경우 message에 담겨있는 것을 WebStatus에 set
		failResultInfo := beetlecommon.SimpleMsg{}
		json.NewDecoder(respBody).Decode(&failResultInfo)
		return nil, model.WebStatus{StatusCode: respStatus, Message: failResultInfo.Message}
	}
	json.NewDecoder(respBody).Decode(&migrateInfraList)
	
	returnStatus.StatusCode = respStatus
	log.Println(respBody)
	// util.DisplayResponse(resp) // 수신내용 확인

	return migrateInfraList, returnStatus
}

func GetMigrationInfraData(infraID string) (beetle.MigrateInfraInfo, model.WebStatus) {
	var originalUrl = "/migration/infra/{infraId}"

	var paramMapper = make(map[string]string)
	paramMapper["{infraId}"] = infraID
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)

	url := util.BEETLE + urlParam
	
	resp, err := util.CommonHttp(url, nil, http.MethodGet)
	
	migrateInfraInfo := beetle.MigrateInfraInfo{}
	returnStatus := model.WebStatus{}

	if err != nil {
		fmt.Println(err)
		return migrateInfraInfo, model.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode
	if respStatus != 200 && respStatus != 201 { // 호출은 정상이나, 가져온 결과값이 200, 201아닌 경우 message에 담겨있는 것을 WebStatus에 set
		failResultInfo := beetlecommon.SimpleMsg{}
		json.NewDecoder(respBody).Decode(&failResultInfo)
		return migrateInfraInfo, model.WebStatus{StatusCode: respStatus, Message: failResultInfo.Message}
	}
	json.NewDecoder(respBody).Decode(&migrateInfraInfo)
	
	returnStatus.StatusCode = respStatus
	log.Println(respBody)
	// util.DisplayResponse(resp) // 수신내용 확인

	return migrateInfraInfo, returnStatus
}
