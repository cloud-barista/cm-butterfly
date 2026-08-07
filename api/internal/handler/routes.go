package handler

import (
	"log"
	"net/http"
	"strings"

	"api/internal/util/response"

	"github.com/labstack/echo/v4"
)

// AnyController handles generic API routing by operationId
func AnyController(c echo.Context) error {
	log.Println("#### AnyController")
	operationId := strings.ToLower(c.Param("operationId"))
	if operationId == "" {
		commonResponse := response.CommonResponseStatusNotFound("no operationId is provided")
		return c.JSON(commonResponse.Status.StatusCode, commonResponse)
	}

	commonRequest := &CommonRequest{}
	if err := c.Bind(commonRequest); err != nil {
		log.Printf("Error binding request: %v", err)
	}

	log.Printf("== operationId\t:[ %s ]\n== commonRequest\t:\n%+v\n==\n", operationId, commonRequest)
	commonResponse, _ := AnyCaller(c, operationId, commonRequest, true)

	return c.JSON(commonResponse.Status.StatusCode, commonResponse)
}

// SubsystemAnyController handles API routing for specific subsystems
func SubsystemAnyController(c echo.Context) error {
	log.Println("#### SubsystemAnyController")
	subsystemName := strings.ToLower(c.Param("subsystemName"))
	operationId := strings.ToLower(c.Param("operationId"))

	if subsystemName == "" {
		commonResponse := response.CommonResponseStatusNotFound("no subsystemName is provided")
		return c.JSON(commonResponse.Status.StatusCode, commonResponse)
	}

	if operationId == "" {
		commonResponse := response.CommonResponseStatusNotFound("no operationId is provided")
		return c.JSON(commonResponse.Status.StatusCode, commonResponse)
	}

	commonRequest := &CommonRequest{}
	if err := c.Bind(commonRequest); err != nil {
		log.Printf("Error binding request: %v", err)
	}

	log.Printf("==subsystemName\t:[ %s ]\n== operationId\t:[ %s ]\n== commonRequest\t:\n%+v\n==\n", subsystemName, operationId, commonRequest)
	commonResponse, _ := SubsystemAnyCaller(c, subsystemName, operationId, commonRequest, true)

	relayRetryAfter(c, commonResponse)
	return c.JSON(commonResponse.Status.StatusCode, commonResponse)
}

// relayRetryAfter puts the subsystem's Retry-After on our own response.
//
// A subsystem that declines a request because it is momentarily at capacity says how long to
// wait. That is the only number the caller has; without it the wait is a guess, and guessing
// short turns one refusal into several. The value is in the body as well — this sets the
// header so anything reading the response the standard way finds it where it expects.
//
// Only Retry-After is relayed. Passing the subsystem's headers through wholesale would carry
// its Set-Cookie and auth headers to the browser along with them.
func relayRetryAfter(c echo.Context, commonResponse *response.CommonResponse) {
	if commonResponse == nil || commonResponse.Status.RetryAfter == "" {
		return
	}
	c.Response().Header().Set("Retry-After", commonResponse.Status.RetryAfter)
}

// ApiTestRequest represents the request structure for API testing
type ApiTestRequest struct {
	OperationId  string            `json:"operationId"`
	ServiceName  string            `json:"serviceName"`
	Method       string            `json:"method"`
	ResourcePath string            `json:"resourcePath"`
	PathParams   map[string]string `json:"pathParams"`
	QueryParams  map[string]string `json:"queryParams"`
	Body         interface{}       `json:"body"`
}

// ApiTestResponse represents the response structure for API testing
type ApiTestResponse struct {
	Success      bool        `json:"success"`
	Data         interface{} `json:"data"`
	ErrorMessage string      `json:"errorMessage,omitempty"`
	RequestInfo  struct {
		OperationId  string            `json:"operationId"`
		ServiceName  string            `json:"serviceName"`
		Method       string            `json:"method"`
		ResourcePath string            `json:"resourcePath"`
		PathParams   map[string]string `json:"pathParams"`
		QueryParams  map[string]string `json:"queryParams"`
		Body         interface{}       `json:"body"`
	} `json:"requestInfo"`
}

// ApiTestController handles API testing requests
func ApiTestController(c echo.Context) error {
	log.Println("#### ApiTestController")

	var request ApiTestRequest
	if err := c.Bind(&request); err != nil {
		log.Printf("ERROR: Failed to bind request: %v", err)
		resp := ApiTestResponse{
			Success:      false,
			ErrorMessage: "Failed to parse request: " + err.Error(),
		}
		return c.JSON(http.StatusOK, resp)
	}

	log.Printf("== ApiTestRequest ==\n%+v\n==\n", request)

	if request.OperationId == "" {
		resp := ApiTestResponse{
			Success:      false,
			ErrorMessage: "operationId is required",
		}
		return c.JSON(http.StatusOK, resp)
	}

	if request.ServiceName == "" {
		resp := ApiTestResponse{
			Success:      false,
			ErrorMessage: "serviceName is required",
		}
		return c.JSON(http.StatusOK, resp)
	}

	commonRequest := &CommonRequest{
		PathParams:  request.PathParams,
		QueryParams: request.QueryParams,
		Request:     request.Body,
	}

	commonResponse, err := AnyCaller(c, request.OperationId, commonRequest, true)

	resp := ApiTestResponse{
		Success: err == nil && commonResponse.Status.StatusCode < 400,
		Data:    commonResponse,
		RequestInfo: struct {
			OperationId  string            `json:"operationId"`
			ServiceName  string            `json:"serviceName"`
			Method       string            `json:"method"`
			ResourcePath string            `json:"resourcePath"`
			PathParams   map[string]string `json:"pathParams"`
			QueryParams  map[string]string `json:"queryParams"`
			Body         interface{}       `json:"body"`
		}{
			OperationId:  request.OperationId,
			ServiceName:  request.ServiceName,
			Method:       request.Method,
			ResourcePath: request.ResourcePath,
			PathParams:   request.PathParams,
			QueryParams:  request.QueryParams,
			Body:         request.Body,
		},
	}

	if err != nil {
		resp.Success = false
		resp.ErrorMessage = err.Error()
		log.Printf("ERROR: API call failed: %v", err)
		return c.JSON(http.StatusOK, resp)
	}

	if commonResponse.Status.StatusCode >= 400 {
		resp.Success = false
		resp.ErrorMessage = commonResponse.Status.Message
		log.Printf("ERROR: API returned error status: %d - %s", commonResponse.Status.StatusCode, commonResponse.Status.Message)
		return c.JSON(http.StatusOK, resp)
	}

	log.Printf("SUCCESS: API call completed successfully")
	return c.JSON(http.StatusOK, resp)
}

// GetApiListController returns the list of available APIs
func GetApiListController(c echo.Context) error {
	log.Println("#### GetApiListController")

	if ApiYamlSet.ServiceActions == nil {
		log.Printf("ERROR: ApiYamlSet.ServiceActions is nil")
		return c.JSON(http.StatusOK, map[string]interface{}{
			"success":      false,
			"errorMessage": "API configuration not loaded",
		})
	}

	var apiList []struct {
		ServiceName string `json:"serviceName"`
		Actions     []struct {
			Name         string `json:"name"`
			Method       string `json:"method"`
			ResourcePath string `json:"resourcePath"`
			Description  string `json:"description"`
		} `json:"actions"`
	}

	for serviceName, actions := range ApiYamlSet.ServiceActions {
		serviceData := struct {
			ServiceName string `json:"serviceName"`
			Actions     []struct {
				Name         string `json:"name"`
				Method       string `json:"method"`
				ResourcePath string `json:"resourcePath"`
				Description  string `json:"description"`
			} `json:"actions"`
		}{
			ServiceName: serviceName,
			Actions: []struct {
				Name         string `json:"name"`
				Method       string `json:"method"`
				ResourcePath string `json:"resourcePath"`
				Description  string `json:"description"`
			}{},
		}

		for actionName, spec := range actions {
			actionData := struct {
				Name         string `json:"name"`
				Method       string `json:"method"`
				ResourcePath string `json:"resourcePath"`
				Description  string `json:"description"`
			}{
				Name:         actionName,
				Method:       spec.Method,
				ResourcePath: spec.ResourcePath,
				Description:  spec.Description,
			}
			serviceData.Actions = append(serviceData.Actions, actionData)
		}

		apiList = append(apiList, serviceData)
	}

	log.Printf("SUCCESS: Returning %d services with total actions", len(apiList))
	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    apiList,
	})
}
