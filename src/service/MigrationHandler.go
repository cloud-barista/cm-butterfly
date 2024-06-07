package service

import (
	"encoding/json"
	"fmt"

	//"github.com/cloud-barista/cb-webtool/src/model/tumblebug/mcir"
	//tbmcir "github.com/cloud-barista/cb-webtool/src/model/tumblebug/mcir"
	//"github.com/cloud-barista/cb-webtool/src/model/tumblebug/mcis"

	//tbmcir "github.com/cloud-barista/cb-webtool/src/model/tumblebug/mcir"
	//"io"
	//"log"
	"net/http"

	// "github.com/davecgh/go-spew/spew"

	model "github.com/cloud-barista/cb-webtool/src/model"
	
	
	beetle "github.com/cloud-barista/cb-webtool/src/model/beetle/migrate"
	beecommon "github.com/cloud-barista/cb-webtool/src/model/beetle/common"

	//webtool "github.com/cloud-barista/cb-webtool/src/model/webtool"

	// "github.com/go-session/echo-session"

	
	util "github.com/cloud-barista/cb-webtool/src/util"
)

func GetInfrastructureList(infraID string) ([]beetle.MigrateInfraInfo, model.WebStatus) {
	var originalUrl = "/migration/infra/{infraId}"

	var paramMapper = make(map[string]string)
	paramMapper["{infraId}"] = infraID
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)

	url := util.TUMBLEBUG + urlParam
	
	resp, err := util.CommonHttp(url, nil, http.MethodGet)
	
	if err != nil {
		fmt.Println(err)
		return nil, model.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode

	migInfraList := []beetle.MigrateInfraInfo{}
	returnStatus := model.WebStatus{}

	if respStatus != 200 && respStatus != 201 { // 호출은 정상이나, 가져온 결과값이 200, 201아닌 경우 message에 담겨있는 것을 WebStatus에 set
		
		failResultInfo := beecommon.SimpleMsg{}
		json.NewDecoder(respBody).Decode(&failResultInfo)
		return nil, model.WebStatus{StatusCode: respStatus, Message: failResultInfo.Message}
	}
	json.NewDecoder(respBody).Decode(&migInfraList)

	returnStatus.StatusCode = respStatus

	return migInfraList, returnStatus
}
