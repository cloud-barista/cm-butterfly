package handler

import (
	"api/utils"
	"errors"
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
