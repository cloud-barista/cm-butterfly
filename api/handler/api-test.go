package handler

import (
	"log"

	"github.com/gobuffalo/buffalo"
)

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
func ApiTestController(c buffalo.Context) error {
	log.Println("#### ApiTestController")

	var request ApiTestRequest
	if err := c.Bind(&request); err != nil {
		log.Printf("ERROR: Failed to bind request: %v", err)
		response := ApiTestResponse{
			Success:      false,
			ErrorMessage: "Failed to parse request: " + err.Error(),
		}
		return c.Render(200, r.JSON(response))
	}

	log.Printf("== ApiTestRequest ==\n%+v\n==\n", request)

	// Validate required fields
	if request.OperationId == "" {
		response := ApiTestResponse{
			Success:      false,
			ErrorMessage: "operationId is required",
		}
		return c.Render(200, r.JSON(response))
	}

	if request.ServiceName == "" {
		response := ApiTestResponse{
			Success:      false,
			ErrorMessage: "serviceName is required",
		}
		return c.Render(200, r.JSON(response))
	}

	// Create CommonRequest from ApiTestRequest
	commonRequest := &CommonRequest{
		PathParams:  request.PathParams,
		QueryParams: request.QueryParams,
		Request:     request.Body,
	}

	// Use existing AnyCaller logic with authentication
	commonResponse, err := AnyCaller(c, request.OperationId, commonRequest, true)

	// Prepare response
	response := ApiTestResponse{
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
		response.Success = false
		response.ErrorMessage = err.Error()
		log.Printf("ERROR: API call failed: %v", err)
		return c.Render(200, r.JSON(response)) // Return 200 with error in response body
	}

	if commonResponse.Status.StatusCode >= 400 {
		response.Success = false
		response.ErrorMessage = commonResponse.Status.Message
		log.Printf("ERROR: API returned error status: %d - %s", commonResponse.Status.StatusCode, commonResponse.Status.Message)
		return c.Render(200, r.JSON(response)) // Return 200 with error in response body
	}

	log.Printf("SUCCESS: API call completed successfully")
	return c.Render(200, r.JSON(response))
}

// GetApiListController returns the list of available APIs from api.yaml
func GetApiListController(c buffalo.Context) error {
	log.Println("#### GetApiListController")

	// Check if ApiYamlSet is initialized
	if ApiYamlSet.ServiceActions == nil {
		log.Printf("ERROR: ApiYamlSet.ServiceActions is nil")
		return c.Render(200, r.JSON(map[string]interface{}{
			"success":      false,
			"errorMessage": "API configuration not loaded",
		}))
	}

	// Get the API list from the loaded configuration
	var apiList []struct {
		ServiceName string `json:"serviceName"`
		Actions     []struct {
			Name         string `json:"name"`
			Method       string `json:"method"`
			ResourcePath string `json:"resourcePath"`
			Description  string `json:"description"`
		} `json:"actions"`
	}

	// Convert ApiYamlSet.ServiceActions to the response format
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
	return c.Render(200, r.JSON(map[string]interface{}{
		"success": true,
		"data":    apiList,
	}))
}
