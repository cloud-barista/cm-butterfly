package handler

import (
	"encoding/json"
	"strings"

	// "errors"
	"fmt"
	"log"
	"net/http"

	fwmodel "cm_butterfly/frameworkmodel"
	tbcommon "cm_butterfly/frameworkmodel/tumblebug/common"
	"cm_butterfly/frameworkmodel/webtool"
	"cm_butterfly/models"

	// tbmcir "cm_butterfly/frameworkmodel/tumblebug/mcir"
	// tbmcis "cm_butterfly/frameworkmodel/tumblebug/mcis"

	util "cm_butterfly/util"

	"github.com/davecgh/go-spew/spew"
	"github.com/gobuffalo/pop/v6"
	"github.com/gofrs/uuid"
	"github.com/pkg/errors"
)

// var NameSpaceUrl = "http://15.165.16.67:1323"
// var NameSpaceUrl = os.Getenv("TUMBLE_URL")

// type NSInfo struct {
// 	ID          string `json:"id"`
// 	Name        string `json:"name"`
// 	Description string `json:"description"`
// }

// 저장된 namespace가 없을 때 최초 1개 생성하고 해당 namespace 정보를 return  : 검증 필요(TODO : 이미 namespace가 있어서 확인 못함)
func CreateDefaultNamespace() (*tbcommon.TbNsInfo, fwmodel.WebStatus) {
	// nsInfo := new(fwmodel.NSInfo)
	nameSpaceInfo := tbcommon.TbNsInfo{}

	// 사용자의 namespace 목록조회
	nsList, nsStatus := GetNameSpaceList()
	if nsStatus.StatusCode == 500 {
		log.Println(" nsStatus  ", nsStatus)
		return nil, nsStatus
	}

	if len(nsList) > 0 {
		nsStatus.StatusCode = 101
		nsStatus.Message = "Namespace already exists"
		//return &nameSpaceInfo, errors.New(101, "Namespace already exists. size="+len(nsList))
		return &nameSpaceInfo, nsStatus
	}

	// create default namespace
	nameSpaceInfo.Name = "NS-01" // default namespace name
	//nameSpaceInfo.ID = "NS-01"
	nameSpaceInfo.Description = "default name space name"
	respBody, respStatus := RegNameSpace(&nameSpaceInfo)
	log.Println(" respBody  ", respBody) // respBody에 namespace Id가 있으면 할당해서 사용할 것
	if respStatus.StatusCode != 200 && respStatus.StatusCode != 201 {
		log.Println(" nsCreateErr  ", respStatus)
		return &nameSpaceInfo, respStatus
	}
	// respBody := resp.Body
	// respStatus := resp.StatusCode

	return &nameSpaceInfo, respStatus
}

// 사용자의 namespace 목록 조회
func GetNameSpaceList() ([]tbcommon.TbNsInfo, fwmodel.WebStatus) {
	fmt.Println("GetNameSpaceList start")
	var originalUrl = "/ns"
	urlParam := util.MappingUrlParameter(originalUrl, nil)

	url := util.TUMBLEBUG + urlParam
	// url := util.TUMBLEBUG + "/ns"

	resp, err := util.CommonHttp(url, nil, http.MethodGet)
	//body := HttpGetHandler(url)

	if err != nil {
		// 	// Tumblebug 접속 확인하라고
		// fmt.Println(err)
		// panic(err)
		return nil, fwmodel.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode

	nameSpaceInfoList := map[string][]tbcommon.TbNsInfo{}
	// defer body.Close()
	json.NewDecoder(respBody).Decode(&nameSpaceInfoList)
	//spew.Dump(body)
	fmt.Println(nameSpaceInfoList["ns"])

	return nameSpaceInfoList["ns"], fwmodel.WebStatus{StatusCode: respStatus}
}

// Namespace 조회 시 Option에 해당하는 값만 조회. GetNameSpaceList와 TB 호출은 동일하나 option 사용으로 받아오는 param이 다름. controller에서 분기
func GetNameSpaceListByOption(optionParam string) ([]tbcommon.TbNsInfo, fwmodel.WebStatus) {
	fmt.Println("GetNameSpaceList start")
	var originalUrl = "/ns"
	urlParam := util.MappingUrlParameter(originalUrl, nil)

	url := util.TUMBLEBUG + urlParam
	if optionParam != "" {
		url = url + "?option=" + optionParam
	}
	// url := util.TUMBLEBUG + "/ns"

	resp, err := util.CommonHttp(url, nil, http.MethodGet)
	//body := HttpGetHandler(url)

	if err != nil {
		// 	// Tumblebug 접속 확인하라고
		// fmt.Println(err)
		// panic(err)
		return nil, fwmodel.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode

	nameSpaceInfoList := map[string][]tbcommon.TbNsInfo{}
	// defer body.Close()
	json.NewDecoder(respBody).Decode(&nameSpaceInfoList)
	//spew.Dump(body)
	fmt.Println(nameSpaceInfoList["ns"])

	return nameSpaceInfoList["ns"], fwmodel.WebStatus{StatusCode: respStatus}
}

// Namespace 조회 시 Option에 해당하는 값만 조회. GetNameSpaceList와 TB 호출은 동일하나 option 사용으로 받아오는 param이 다름
func GetNameSpaceListByOptionID(optionParam string) ([]string, fwmodel.WebStatus) {
	fmt.Println("GetNameSpaceList start")
	var originalUrl = "/ns"
	urlParam := util.MappingUrlParameter(originalUrl, nil)

	url := util.TUMBLEBUG + urlParam
	if optionParam == "id" {
		url = url + "?option=" + optionParam
	} else {
		return nil, fwmodel.WebStatus{StatusCode: 500, Message: "option param is not ID"}
	}
	// url := util.TUMBLEBUG + "/ns"

	resp, err := util.CommonHttp(url, nil, http.MethodGet)
	//body := HttpGetHandler(url)

	if err != nil {
		// 	// Tumblebug 접속 확인하라고
		// fmt.Println(err)
		// panic(err)
		return nil, fwmodel.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode

	//nameSpaceInfoList := map[string][]string{}
	nameSpaceInfoList := tbcommon.TbIdList{}
	// defer body.Close()
	json.NewDecoder(respBody).Decode(&nameSpaceInfoList)
	//spew.Dump(body)
	//fmt.Println(nameSpaceInfoList["idList"])
	//
	//return nameSpaceInfoList["idList"], fwmodel.WebStatus{StatusCode: respStatus}
	//fmt.Println(nameSpaceInfoList["output"])
	//return nameSpaceInfoList["output"], fwmodel.WebStatus{StatusCode: respStatus}
	fmt.Println(nameSpaceInfoList.IDList)
	return nameSpaceInfoList.IDList, fwmodel.WebStatus{StatusCode: respStatus}
}

// Get namespace
func GetNameSpaceData(nameSpaceID string) (tbcommon.TbNsInfo, fwmodel.WebStatus) {
	fmt.Println("GetNameSpaceData start")
	var originalUrl = "/ns/{nsId}"
	var paramMapper = make(map[string]string)
	paramMapper["{nsId}"] = nameSpaceID
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)

	url := util.TUMBLEBUG + urlParam
	// url := util.TUMBLEBUG + "/ns/" + nameSpaceID

	resp, err := util.CommonHttp(url, nil, http.MethodGet)

	nameSpaceInfo := tbcommon.TbNsInfo{}
	if err != nil {
		return nameSpaceInfo, fwmodel.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	respBody := resp.Body
	respStatus := resp.StatusCode

	// defer body.Close()
	json.NewDecoder(respBody).Decode(&nameSpaceInfo)
	fmt.Println(nameSpaceInfo)

	return nameSpaceInfo, fwmodel.WebStatus{StatusCode: respStatus}
}

// NameSpace 등록.  등록 후 생성된 Namespace 정보를 return
func RegNameSpace(nameSpaceInfo *tbcommon.TbNsInfo) (tbcommon.TbNsInfo, fwmodel.WebStatus) {
	// buff := bytes.NewBuffer(pbytes)
	var originalUrl = "/ns"
	urlParam := util.MappingUrlParameter(originalUrl, nil)
	url := util.TUMBLEBUG + urlParam
	// url := util.TUMBLEBUG + "/ns"

	//body, err := util.CommonHttpPost(url, nameSpaceInfo)
	pbytes, _ := json.Marshal(nameSpaceInfo)
	resp, err := util.CommonHttp(url, pbytes, http.MethodPost)

	// return body, err
	respBody := resp.Body
	respStatus := resp.StatusCode

	resultNameSpaceInfo := tbcommon.TbNsInfo{}
	if err != nil {
		log.Println(err)
		failResultInfo := tbcommon.TbSimpleMsg{}
		json.NewDecoder(respBody).Decode(&failResultInfo)
		return resultNameSpaceInfo, fwmodel.WebStatus{StatusCode: 500, Message: failResultInfo.Message}
	}

	json.NewDecoder(respBody).Decode(&resultNameSpaceInfo)
	return resultNameSpaceInfo, fwmodel.WebStatus{StatusCode: respStatus}
	//return respBody, fwmodel.WebStatus{StatusCode: respStatus}
}

// NameSpace 수정
func UpdateNameSpace(nameSpaceID string, nameSpaceInfo *tbcommon.TbNsReq) (tbcommon.TbNsInfo, fwmodel.WebStatus) {
	var originalUrl = "/ns/{nsId}"
	var paramMapper = make(map[string]string)
	paramMapper["{nsId}"] = nameSpaceID
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)
	url := util.TUMBLEBUG + urlParam
	// url := util.TUMBLEBUG + "/ns"

	pbytes, _ := json.Marshal(nameSpaceInfo)
	resp, err := util.CommonHttp(url, pbytes, http.MethodPut)

	// return body, err
	respBody := resp.Body
	respStatus := resp.StatusCode

	resultNameSpaceInfo := tbcommon.TbNsInfo{}
	if err != nil {
		fmt.Println(err)
		failResultInfo := tbcommon.TbSimpleMsg{}
		json.NewDecoder(respBody).Decode(&failResultInfo)
		return resultNameSpaceInfo, fwmodel.WebStatus{StatusCode: 500, Message: failResultInfo.Message}
	}

	json.NewDecoder(respBody).Decode(&resultNameSpaceInfo)

	return resultNameSpaceInfo, fwmodel.WebStatus{StatusCode: respStatus}
}

// NameSpace 삭제
func DelNameSpace(nameSpaceID string) (tbcommon.TbSimpleMsg, fwmodel.WebStatus) {
	var originalUrl = "/ns/{nsId}"
	var paramMapper = make(map[string]string)
	paramMapper["{nsId}"] = nameSpaceID
	urlParam := util.MappingUrlParameter(originalUrl, paramMapper)
	url := util.TUMBLEBUG + urlParam
	// url := util.TUMBLEBUG + "/ns/" + nameSpaceID

	// 경로안에 parameter가 있어 추가 param없이 호출 함.
	resp, err := util.CommonHttp(url, nil, http.MethodDelete)

	// return body, err
	respBody := resp.Body
	respStatus := resp.StatusCode

	resultInfo := tbcommon.TbSimpleMsg{}
	json.NewDecoder(respBody).Decode(&resultInfo)
	if err != nil {
		fmt.Println(err)
		//return resultInfo, fwmodel.WebStatus{StatusCode: 500, Message: err.Error()}
		json.NewDecoder(respBody).Decode(&resultInfo)
		return resultInfo, fwmodel.WebStatus{StatusCode: 500, Message: resultInfo.Message}
	}

	return resultInfo, fwmodel.WebStatus{StatusCode: respStatus}
}

// NameSpace 삭제
func DelAllNameSpace() (tbcommon.TbSimpleMsg, fwmodel.WebStatus) {
	var originalUrl = "/ns"
	urlParam := util.MappingUrlParameter(originalUrl, nil)
	url := util.TUMBLEBUG + urlParam
	// url := util.TUMBLEBUG + "/ns/" + nameSpaceID

	// 경로안에 parameter가 있어 추가 param없이 호출 함.
	resp, err := util.CommonHttp(url, nil, http.MethodDelete)

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

func UserNameSpaceListFromDB(userId uuid.UUID, tx *pop.Connection) ([]tbcommon.TbNsInfo, fwmodel.WebStatus) {
	nsList := &models.Namespaces{}
	//nsList := []models.Namespace{}

	q := tx.Eager().Where("user_id = ?", userId)

	err := q.All(nsList)

	if err != nil {
		//return errors.WithStack(err)
		return nil, fwmodel.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	returnNsList := []tbcommon.TbNsInfo{}
	for _, ns := range *nsList {
		//for _, ns := range nsList {
		returnNsList = append(returnNsList, tbcommon.TbNsInfo{ID: ns.ID, Name: ns.NsName})
	}

	return returnNsList, fwmodel.WebStatus{StatusCode: 200}
}

func CheckExistsUserNamespace(userId uuid.UUID, nsId string, tx *pop.Connection) (bool, *models.UserNamespace) {
	un := &models.UserNamespace{}
	q := tx.Where("user_id = ?", userId).Where("ns_id = ?", nsId)
	b, err := q.Exists(un)
	if b {
		err2 := q.First(un)
		if err2 != nil {
			errors.WithStack(err2)
		}
	}
	if err != nil {
		errors.WithStack(err)
	}

	return b, un
}
func RegUserNamespace(un *webtool.UserNamespaceReq, tx *pop.Connection) error {
	spew.Dump("=====================")
	spew.Dump(un)
	spew.Dump("=====================")
	us_arr := un.Us
	ns_arr := un.Ns

	for _, user := range us_arr {

		user_id := uuid.Must(uuid.FromString(user))
		for _, ns := range ns_arr {
			b, _ := CheckExistsUserNamespace(user_id, ns, tx)
			un := &models.UserNamespace{}
			if !b {
				un.NamespaceID = ns
				un.UserID = user_id
				verr, err := un.ValidateCreate(tx)
				if verr.HasAny() {
					spew.Dump("user_namespace at verr", *verr)
					return errors.WithStack(verr)
				}
				if err != nil {
					spew.Dump("user_namespace at err", un)
					spew.Dump(err)
					return errors.WithStack(err)
				}

			}

		}
	}
	return nil
}

func DelUserNamespace(un *webtool.UserNamespaceReq, tx *pop.Connection) error {
	spew.Dump("=====================")
	spew.Dump(un)
	spew.Dump("=====================")
	us_arr := un.Us
	ns_arr := un.Ns

	for _, user := range us_arr {

		user_id := uuid.Must(uuid.FromString(user))
		for _, ns := range ns_arr {
			b, un := CheckExistsUserNamespace(user_id, ns, tx)
			//un := &models.UserNamespace{}
			if b {
				// un.NamespaceID = ns
				// un.UserID = user_id
				err := tx.Destroy(un)
				// if verr.HasAny() {
				// 	spew.Dump("user_namespace at verr", *verr)
				// 	return errors.WithStack(verr)
				// }
				if err != nil {
					spew.Dump("user_namespace delete at err", un)
					spew.Dump(err)
					return errors.WithStack(err)
				}

			}

		}
	}
	return nil
}

// UserNamespace table 조회
func GetAssignUserNamespaces(user_id uuid.UUID, tx *pop.Connection) (*models.UserNamespaces, error) {
	un := &models.UserNamespaces{}
	q := tx.Eager().Where("user_id = ?", user_id)
	err := q.All(un)
	if err != nil {
		return un, errors.WithStack(err)
	}
	return un, err
}

func AssignedUserNamespaceList(user_id uuid.UUID) ([]models.Namespace, fwmodel.WebStatus) {

	nsList := models.Namespaces{}

	db := models.DB

	sb := strings.Builder{}

	sb.WriteString(" 	select ns.id, ns.ns_name, ns.description, ns.users_id ")
	sb.WriteString(" 	from namespaces ns ")
	sb.WriteString(" 	join user_namespaces un ")
	sb.WriteString(" 	on ns.id = un.ns_id ")
	sb.WriteString(" 	where un.user_id =  cast(' " + user_id.String() + "' as uuid) ")
	//user_id
	//sb.WriteString(" 	where un.user_id = cast('404a85a2-e769-47fc-aa06-4532ccd715ea' as uuid) ")

	q := db.RawQuery(sb.String())
	err := q.All(nsList)
	if err != nil {
		log.Println("nsList err", err)
		return nil, fwmodel.WebStatus{StatusCode: 500, Message: err.Error()}
	}

	log.Println("nsList", nsList)
	return nsList, fwmodel.WebStatus{StatusCode: 200}
}

// func GetNamespaceById(ns_id string, tx *pop.Connection) (error, *models.Namespace) {
func GetNamespaceById(nsId string) (*models.Namespace, error) {
	ns := &models.Namespace{}
	//err := tx.Find(ns, ns_id)
	query := models.DB.Q()
	err := query.Find(ns, nsId)
	if err != nil {
		return ns, errors.WithStack(err)
	}
	return ns, err
}

// 사용자에게 공유된 모든 namespace 목록 조회
func SharedNamespaceList(userId uuid.UUID) ([]models.Namespace, error) {

	sharedNamespaceList := []models.Namespace{}
	query := models.DB.Q()
	query = query.Join("user_namespaces un", "namespaces.id = un.ns_id")
	query = query.Where("un.user_id = ? ", userId)

	err := query.All(&sharedNamespaceList)
	if err != nil {
		return sharedNamespaceList, errors.WithStack(err)
	}

	return sharedNamespaceList, nil
}
