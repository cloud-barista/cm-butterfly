package handler

import (
	"api/utils"
	"errors"
	"log"
	"net/http"
	"strings"

	"github.com/gobuffalo/buffalo"
)

type AgentConnectionCheck struct {
	AgentConnectionStatus  Status                  `json:"agentConnectionStatus"`
	AgentConnectionDetails []AgentConnectionDetail `json:"agentConnectionDetails"`
}

type AgentConnectionDetail struct {
	ConnectionDescription   string `json:"connectionDescription"`
	ConnectionFailedMessage string `json:"connectionFailedMessage"`
	ConnectionId            string `json:"connectionId"`
	ConnectionName          string `json:"connectionName"`
	AgentStatus             Status `json:"agentStatus"`
	ConnectionStatus        Status `json:"connectionStatus"`
}

func AgentAndConnectionCheck(c buffalo.Context, commonRequest *CommonRequest) (interface{}, error) {
	operationId := strings.ToLower("check-agent-source-group")
	commonResponse, err := SubsystemAnyCaller(c, "cm-honeybee", operationId, commonRequest, true)
	if err != nil {
		return nil, err
	}

	if commonResponse.Status.StatusCode >= http.StatusBadRequest {
		return nil, errors.New("agent check request has got error from sub-system: cm-honeybee")
	}

	agents := commonResponse.ResponseData.([]interface{})
	ac := make(map[string]string)

	for _, v := range agents {
		e, ok := v.(map[string]interface{})
		if !ok {
			continue
		}

		result := strings.ToLower(utils.PtrToStr(e["result"]))
		connectionName := utils.PtrToStr(e["connection_name"])

		ac[connectionName] = result
	}

	operationId = strings.ToLower("check-connection-source-group")
	commonResponse, err = SubsystemAnyCaller(c, "cm-honeybee", operationId, commonRequest, true)
	if err != nil {
		return nil, err
	}

	if commonResponse.Status.StatusCode >= http.StatusBadRequest {
		return nil, errors.New("connection check request has got error from sub-system: cm-honeybee")
	}

	connections := commonResponse.ResponseData.([]interface{})
	totalCount := 0
	successCount := 0
	failedCount := 0

	acds := make([]AgentConnectionDetail, 0)
	for _, v := range connections {
		failed := false
		e, ok := v.(map[string]interface{})
		if !ok {
			continue
		}

		totalCount++

		connectionName := utils.PtrToStr(e["name"])

		v, ok := ac[connectionName]
		agentStatus := Success
		if !ok || v != "success" {
			agentStatus = Failed
			failed = true
		}

		description := utils.PtrToStr(e["description"])
		connectionCheckFailedMessage := utils.PtrToStr(e["failed_message"])
		connectionId := utils.PtrToStr(e["id"])
		s := strings.ToLower(utils.PtrToStr(e["status"]))
		connectionStatus := Success
		if s != "success" {
			connectionStatus = Failed
			failed = true
		}

		acds = append(acds, AgentConnectionDetail{
			ConnectionDescription:   description,
			ConnectionFailedMessage: connectionCheckFailedMessage,
			ConnectionId:            connectionId,
			ConnectionName:          connectionName,
			AgentStatus:             agentStatus,
			ConnectionStatus:        connectionStatus,
		})

		if failed {
			failedCount++
		} else {
			successCount++
		}

	}

	agentConnectionStatus := Success
	if successCount > 0 && failedCount > 0 {
		agentConnectionStatus = PartialSuccess
	} else if totalCount == failedCount {
		agentConnectionStatus = Failed
	}

	res := AgentConnectionCheck{
		AgentConnectionStatus:  agentConnectionStatus,
		AgentConnectionDetails: acds,
	}

	return &res, nil
}

/*
{
	"description": "the first source group",
	"id": "9801a0f0-4d93-4e03-9a42-4e303a55e860",
	"name": "noway",
	"target_info": {
		"mci_id": "",
		"ns_id": ""
	},
	"connections": [
		{
			"description": "id pass login",
			"failed_message": "",
			"id": "c023f4ab-e104-4922-9a41-482a6772da35",
			"ip_address": "43.200.102.43",
			"name": "tell me",
			"password": "xxxx",
			"private_key": "yyyy",
			"public_key": "",
			"source_group_id": "9801a0f0-4d93-4e03-9a42-4e303a55e860",
			"ssh_port": 22,
			"status": "",
			"user": "ubuntu"
		}
	]
}
*/

type SourceGroupRes struct {
	Description string        `json:"description"`
	ID          string        `json:"id"`
	Name        string        `json:"name"`
	TargetInfo  TargetInfoRes `json:"target_info"`
	Connections []interface{} `json:"connections"`
	Stage       string        `json:"stage"`
}

type TargetInfoRes struct {
	MciID string `json:"mci_id"`
	NsID  string `json:"ns_id"`
}

type ConnectionRes struct {
	Description   string `json:"description"`
	FailedMessage string `json:"failed_message"`
	ID            string `json:"id"`
	IPAddress     string `json:"ip_address"`
	Name          string `json:"name"`
	Password      string `json:"password"`
	PrivateKey    string `json:"private_key"`
	PublicKey     string `json:"public_key"`
	SourceGroupID string `json:"source_group_id"`
	SSHPort       int    `json:"ssh_port"`
	Status        string `json:"status"`
	User          string `json:"user"`
}

func RegisterSourceGroup(c buffalo.Context, commonRequest *CommonRequest) (interface{}, error) {

	originalRequest, err := utils.InterToMapInter(commonRequest.Request)

	if err != nil {
		return nil, err
	}

	operationId := strings.ToLower("register-source-group")

	var sourceGroupCommonRequest CommonRequest

	sourceGroupCommonRequest.Request = map[string]interface{}{
		"name":        originalRequest["name"],
		"description": originalRequest["description"],
	}

	commonResponse, err := SubsystemAnyCaller(c, "cm-honeybee", operationId, &sourceGroupCommonRequest, false)
	if err != nil {
		return nil, err
	}

	log.Println("this is response data", commonResponse.ResponseData)
	res, ok := commonResponse.ResponseData.(map[string]interface{})

	if !ok {
		return nil, errors.New("convert error for source group response")
	}

	if em := utils.PtrToStr(res["error"]); em != "" {
		log.Println("error from honeybee while create source group: ", em)
		return nil, errors.New(em)
	}

	sgId := utils.PtrToStr(res["id"])
	description := utils.PtrToStr(res["description"])
	name := utils.PtrToStr(res["name"])
	targetInfo, ok := res["target_info"].(map[string]interface{})
	mciId := ""
	nsId := ""

	if ok {
		mciId = utils.PtrToStr(targetInfo["mci_id"])
		nsId = utils.PtrToStr(targetInfo["ns_id"])
	}

	log.Printf("source group %s is created\n", name)

	sgRes := SourceGroupRes{
		Description: description,
		ID:          sgId,
		Name:        name,
		TargetInfo: TargetInfoRes{
			MciID: mciId,
			NsID:  nsId,
		},
		Connections: make([]interface{}, 0),
	}

	registerConnection(c, commonRequest, &sgRes)

	return &sgRes, nil
}

func registerConnection(c buffalo.Context, commonRequest *CommonRequest, res *SourceGroupRes) {

	originalRequest, err := utils.InterToMapInter(commonRequest.Request)

	if err != nil {
		res.Connections = append(res.Connections, err.Error())
		return
	}

	connectionsCommonRequest, ok := originalRequest["connections"].([]interface{}) // []interface{}
	if !ok {
		res.Connections = append(res.Connections, errors.New("parsing error while creating connections"))
		return
	}

	operationId := strings.ToLower("create-connection-info")
	for _, connInter := range connectionsCommonRequest {

		cr := ConnectionRes{}

		connectionCommonRequest := CommonRequest{
			PathParams: map[string]string{"sgId": res.ID},
			Request:    connInter,
		}

		commonResponse, err := SubsystemAnyCaller(c, "cm-honeybee", operationId, &connectionCommonRequest, false)
		if err != nil {
			res.Connections = append(res.Connections, err.Error())
			return
		}

		resData, err := utils.InterToMapInter(commonResponse.ResponseData)

		if err != nil {
			res.Connections = append(res.Connections, err.Error())
			return
		}

		if em := utils.PtrToStr(resData["error"]); em != "" {
			log.Println("error from honeybee while create connections: ", em)
			res.Connections = append(res.Connections, em)
		} else {
			cr.Name = utils.PtrToStr(resData["name"])

			cr.Description = utils.PtrToStr(resData["description"])
			cr.FailedMessage = utils.PtrToStr(resData["failed_message"])
			cr.ID = utils.PtrToStr(resData["id"])
			cr.IPAddress = utils.PtrToStr(resData["ip_address"])
			cr.Password = utils.PtrToStr(resData["password"])
			cr.PrivateKey = utils.PtrToStr(resData["private_key"])
			cr.PublicKey = utils.PtrToStr(resData["public_key"])
			cr.SSHPort = int(utils.PtrToFloat(resData["ssh_port"]))
			cr.Status = utils.PtrToStr(resData["status"])
			cr.User = utils.PtrToStr(resData["user"])
			res.Connections = append(res.Connections, cr)

			log.Println("Source Group: ", res.Name, " / connection", cr.Name, " is created ")
		}

	}

}
