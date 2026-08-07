package handler

import (
	"bytes"
	"crypto/tls"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"path/filepath"
	"strings"

	"api/internal/util/response"

	"github.com/labstack/echo/v4"
	"github.com/spf13/viper"
)

// Context key for authorization (to avoid import cycle with middleware)
const contextKeyAuthorization = "Authorization"

// CommonRequest represents the standard request format
type CommonRequest struct {
	PathParams  map[string]string `json:"pathParams"`
	QueryParams map[string]string `json:"queryParams"`
	Request     interface{}       `json:"request"`
}

// Auth represents authentication configuration
type Auth struct {
	Type     string `mapstructure:"type"`
	Username string `mapstructure:"username"`
	Password string `mapstructure:"password"`
}

// Service represents a service configuration
type Service struct {
	BaseURL string `mapstructure:"baseurl"`
	Auth    Auth   `mapstructure:"auth"`
}

// Spec represents an API specification
type Spec struct {
	Method       string `mapstructure:"method"`
	ResourcePath string `mapstructure:"resourcePath"`
	Description  string `mapstructure:"description"`
}

// ApiYaml represents the API configuration
type ApiYaml struct {
	CLISpecVersion string                     `mapstructure:"cliSpecVersion"`
	Services       map[string]Service         `mapstructure:"services"`
	ServiceActions map[string]map[string]Spec `mapstructure:"serviceActions"`
}

var ApiYamlSet ApiYaml

// InitAPISpec initializes the API specification from api.yaml
func InitAPISpec() error {
	log.Println("DEBUG: Initializing ApiYamlSet...")

	exePath, err := os.Executable()
	if err != nil {
		log.Printf("ERROR: Failed to get executable path: %v", err)
		return err
	}

	exeDir := filepath.Dir(exePath)

	viper.SetConfigName("api")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(filepath.Join(exeDir, "conf"))
	viper.AddConfigPath("conf")

	log.Printf("DEBUG: exePath: %s", exePath)
	log.Printf("DEBUG: exeDir: %s", exeDir)
	log.Printf("DEBUG: conf path: %s", filepath.Join(exeDir, "conf"))

	if err := viper.ReadInConfig(); err != nil {
		log.Printf("ERROR: Failed to read config: %v", err)
		return fmt.Errorf("fatal error reading conf/api.yaml file: %s", err)
	}

	log.Printf("DEBUG: Config file loaded successfully")

	if err := viper.Unmarshal(&ApiYamlSet); err != nil {
		log.Printf("ERROR: Failed to unmarshal config: %v", err)
		return fmt.Errorf("unable to decode into struct: %v", err)
	}

	log.Printf("DEBUG: ApiYamlSet initialized successfully")
	log.Printf("DEBUG: - CLISpecVersion: %s", ApiYamlSet.CLISpecVersion)
	log.Printf("DEBUG: - Services count: %d", len(ApiYamlSet.Services))
	log.Printf("DEBUG: - ServiceActions count: %d", len(ApiYamlSet.ServiceActions))

	for serviceName, service := range ApiYamlSet.Services {
		log.Printf("DEBUG: - Service: %s -> %+v", serviceName, service)
	}

	return nil
}

// AnyCaller — proxy call without a specified subsystem.
//
// This no longer relays actual calls. An operationId alone cannot pin down
// which subsystem's API is meant — the same name exists in multiple subsystems
// (e.g. getinfra is defined by both cb-tumblebug and cm-beetle). It used to scan
// everything and use the first match, but Go's map iteration order is random, so
// the same call could reach a different service on each run.
//
// Calls must go through POST /api/{subsystem}/{operationId} (SubsystemAnyCaller).
// cm-butterfly's own APIs are registered as separate native routes and do not
// take this path.
func AnyCaller(c echo.Context, operationId string, commonRequest *CommonRequest, auth bool) (*response.CommonResponse, error) {
	err := fmt.Errorf("operationId %q must be called as {subsystem}/%s", operationId, operationId)
	log.Printf("ERROR: AnyCaller rejected a call without a subsystem: %v", err)
	return response.CommonResponseStatusNotFound(err.Error()), err
}

// GetApiSpec — no longer used.
//
// An operationId is unique only within a subsystem. The same name exists in
// multiple subsystems (e.g. get-infra-info is defined by cm-honeybee, while
// getinfra is defined by both cb-tumblebug and cm-beetle), so name collisions
// are unavoidable when looking across all of them. This function scanned every
// subsystem's map and returned the first match, but Go's map iteration order is
// random, so the same call could reach a different service on each run.
//
// Therefore calls must specify the subsystem — POST /api/{subsystem}/{operationId}.
// The front-end's operationId constants are all declared in that form too.
//
// func GetApiSpec(requestOpertinoId string) (string, Service, Spec, error) {
// 	for framework, api := range ApiYamlSet.ServiceActions {
// 		for opertinoId, spec := range api {
// 			if opertinoId == strings.ToLower(requestOpertinoId) {
// 				return framework, ApiYamlSet.Services[framework], spec, nil
// 			}
// 		}
// 	}
// 	return "", Service{}, Spec{}, fmt.Errorf("getApiSpec not found")
// }

// SubsystemAnyCaller routes requests to a specific subsystem
func SubsystemAnyCaller(c echo.Context, subsystemName, operationId string, commonRequest *CommonRequest, auth bool) (*response.CommonResponse, error) {
	targetFrameworkInfo, targetApiSpec, err := getApiSpecBySubsystem(subsystemName, operationId)
	if err != nil || targetFrameworkInfo == (Service{}) || targetApiSpec == (Spec{}) {
		return response.CommonResponseStatusNotFound(operationId + "-" + err.Error()), err
	}

	var authString string
	if auth {
		authString, err = getAuth(c, targetFrameworkInfo)
		if err != nil {
			return response.CommonResponseStatusBadRequest(err.Error()), err
		}
	} else {
		authString = ""
	}

	// Pass the incoming X-Request-Id straight through to the subsystem. cm-beetle
	// tracks the request by this id (Handling before the handler runs, then
	// Success/Error when it finishes), so even if the front-end times out waiting
	// on a long delete, it can poll progress via GET /request/{id}. If absent it's
	// an empty string and simply ignored.
	reqID := c.Request().Header.Get(echo.HeaderXRequestID)

	// Forwarded the same way, and for the same reason: only the caller knows whether it wants
	// to wait for the work or take a request id and follow it. A delete that takes minutes is
	// the case this exists for — see the Prefer handling in CommonHttpToCommonResponse.
	prefer := c.Request().Header.Get("Prefer")

	commonResponse, err := CommonCaller(strings.ToUpper(targetApiSpec.Method), targetFrameworkInfo.BaseURL, targetApiSpec.ResourcePath, commonRequest, authString, reqID, prefer)
	if err != nil {
		return commonResponse, err
	}
	return commonResponse, err
}

func getApiSpecBySubsystem(subsystemName, requestOpertinoId string) (Service, Spec, error) {
	apis := ApiYamlSet.ServiceActions[strings.ToLower(subsystemName)]
	for opertinoId, spec := range apis {
		if strings.EqualFold(strings.ToLower(opertinoId), strings.ToLower(requestOpertinoId)) {
			return ApiYamlSet.Services[strings.ToLower(subsystemName)], spec, nil
		}
	}
	return Service{}, Spec{}, fmt.Errorf("getApiSpec not found")
}

func getAuth(c echo.Context, service Service) (string, error) {
	log.Printf("DEBUG: getAuth called with service.Auth.Type: %s", service.Auth.Type)

	switch service.Auth.Type {
	case "basic":
		if apiUserInfo := service.Auth.Username + ":" + service.Auth.Password; service.Auth.Username != "" && service.Auth.Password != "" {
			encA := base64.StdEncoding.EncodeToString([]byte(apiUserInfo))
			log.Printf("DEBUG: Basic auth generated: Basic %s", encA)
			return "Basic " + encA, nil
		}
		log.Printf("ERROR: username or password is empty")
		return "", fmt.Errorf("username or password is empty")

	case "bearer":
		if authValue, ok := c.Get(contextKeyAuthorization).(string); ok {
			log.Printf("DEBUG: Bearer auth from context: %s", authValue)
			return authValue, nil
		}
		log.Printf("ERROR: authorization key does not exist or is not a string")
		return "", fmt.Errorf("authorization key does not exist or is not a string")

	default:
		log.Printf("DEBUG: No auth required (type: %s)", service.Auth.Type)
		return "", nil
	}
}

// CommonCaller makes HTTP calls to subsystems
func CommonCaller(callMethod string, targetFwUrl string, endPoint string, commonRequest *CommonRequest, auth string, reqID string, prefer string) (*response.CommonResponse, error) {
	log.Printf("DEBUG: CommonCaller called")
	log.Printf("DEBUG: - callMethod: %s", callMethod)
	log.Printf("DEBUG: - targetFwUrl: %s", targetFwUrl)
	log.Printf("DEBUG: - endPoint: %s", endPoint)
	log.Printf("DEBUG: - commonRequest: %+v", commonRequest)
	log.Printf("DEBUG: - auth: %s", auth)

	pathParamsUrl := mappingUrlPathParams(endPoint, commonRequest)
	log.Printf("DEBUG: - pathParamsUrl: %s", pathParamsUrl)

	queryParamsUrl := mappingQueryParams(pathParamsUrl, commonRequest)
	log.Printf("DEBUG: - queryParamsUrl: %s", queryParamsUrl)

	requestUrl := targetFwUrl + queryParamsUrl
	log.Printf("DEBUG: - final requestUrl: %s", requestUrl)

	log.Printf("DEBUG: About to call CommonHttpToCommonResponse")
	commonResponse, err := CommonHttpToCommonResponse(requestUrl, commonRequest.Request, callMethod, auth, reqID, prefer)

	if err != nil {
		log.Printf("ERROR: CommonHttpToCommonResponse failed: %v", err)
	} else {
		log.Printf("DEBUG: CommonHttpToCommonResponse succeeded")
		if commonResponse != nil {
			log.Printf("DEBUG: - response status: %+v", commonResponse.Status)
		}
	}

	return commonResponse, err
}

// CommonCallerWithoutToken makes HTTP calls without authentication
func CommonCallerWithoutToken(callMethod string, targetFwUrl string, endPoint string, commonRequest *CommonRequest) (*response.CommonResponse, error) {
	pathParamsUrl := mappingUrlPathParams(endPoint, commonRequest)
	queryParamsUrl := mappingQueryParams(pathParamsUrl, commonRequest)
	requestUrl := targetFwUrl + queryParamsUrl
	commonResponse, err := CommonHttpToCommonResponse(requestUrl, commonRequest.Request, callMethod, "", "", "")
	return commonResponse, err
}

func mappingUrlPathParams(endPoint string, commonRequest *CommonRequest) string {
	u := endPoint
	for k, r := range commonRequest.PathParams {
		u = strings.Replace(u, "{"+k+"}", r, -1)
	}
	return u
}

func mappingQueryParams(targeturl string, commonRequest *CommonRequest) string {
	u, err := url.Parse(targeturl)
	if err != nil {
		return ""
	}
	q := u.Query()
	for k, v := range commonRequest.QueryParams {
		q.Set(string(k), v)
	}
	u.RawQuery = q.Encode()
	return u.String()
}

// CommonHttpToCommonResponse makes HTTP request and converts response
func CommonHttpToCommonResponse(url string, s interface{}, httpMethod string, auth string, reqID string, prefer string) (*response.CommonResponse, error) {
	log.Printf("DEBUG: CommonHttpToCommonResponse called")
	log.Printf("DEBUG: - METHOD: %s", httpMethod)
	log.Printf("DEBUG: - URL: %s", url)
	log.Printf("DEBUG: - Auth: %s", auth)
	log.Printf("DEBUG: - Request Data: %+v", s)

	jsonData, err := json.Marshal(s)
	if err != nil {
		log.Printf("ERROR: json.Marshal failed: %v", err)
		return nil, err
	}
	log.Printf("DEBUG: - JSON Data: %s", string(jsonData))

	req, err := http.NewRequest(httpMethod, url, bytes.NewBuffer(jsonData))
	if err != nil {
		log.Printf("ERROR: Failed to create HTTP request: %v", err)
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	if auth != "" {
		req.Header.Add("Authorization", auth)
		log.Printf("DEBUG: - Authorization header added: %s", auth)
	}
	if reqID != "" {
		req.Header.Set(echo.HeaderXRequestID, reqID)
		log.Printf("DEBUG: - X-Request-Id forwarded: %s", reqID)
	}
	// Pass Prefer through so a caller can ask the subsystem to answer without finishing the
	// work first (RFC 7240 "respond-async": cm-beetle replies 202 with a request id and runs
	// the job behind it). Only forwarded when the browser asked for it; absent, the subsystem
	// behaves exactly as before.
	if prefer != "" {
		req.Header.Set("Prefer", prefer)
		log.Printf("DEBUG: - Prefer forwarded: %s", prefer)
	}

	log.Printf("DEBUG: - Request Headers:")
	for name, values := range req.Header {
		for _, value := range values {
			log.Printf("DEBUG:   %s: %s", name, value)
		}
	}

	requestDump, err := httputil.DumpRequest(req, true)
	if err != nil {
		log.Printf("ERROR: Failed to dump request: %v", err)
	} else {
		log.Printf("DEBUG: - Full Request Dump:\n%s", string(requestDump))
	}

	customTransport := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	client := &http.Client{Transport: customTransport}

	log.Printf("DEBUG: - Sending HTTP request...")
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("ERROR: HTTP request failed: %v", err)
		return response.CommonResponseStatusInternalServerError(err), err
	}
	defer resp.Body.Close()

	log.Printf("DEBUG: - HTTP Response received")
	log.Printf("DEBUG: - Response Status: %s", resp.Status)
	log.Printf("DEBUG: - Response Status Code: %d", resp.StatusCode)

	log.Printf("DEBUG: - Response Headers:")
	for name, values := range resp.Header {
		for _, value := range values {
			log.Printf("DEBUG:   %s: %s", name, value)
		}
	}

	respBody, ioerr := io.ReadAll(resp.Body)
	if ioerr != nil {
		log.Printf("ERROR: Failed to read response body: %v", ioerr)
	} else {
		log.Printf("DEBUG: - Response Body: %s", string(respBody))
	}

	commonResponse := &response.CommonResponse{}
	commonResponse.Status.Message = resp.Status
	commonResponse.Status.StatusCode = resp.StatusCode
	// Carry Retry-After back out. A subsystem that turns a request away because it is briefly
	// at capacity says how long to wait, and that value is dropped if we only copy the status
	// and the body — leaving the caller to guess. The handler puts it on our own response too.
	commonResponse.Status.RetryAfter = resp.Header.Get("Retry-After")

	jsonerr := json.Unmarshal(respBody, &commonResponse.ResponseData)
	if jsonerr != nil {
		log.Printf("DEBUG: - Response is not valid JSON, treating as plain text")
		commonResponse.ResponseData = strings.TrimSpace(string(respBody))
	} else {
		log.Printf("DEBUG: - Response parsed as JSON successfully")
	}

	log.Printf("DEBUG: - Final CommonResponse: %+v", commonResponse)
	return commonResponse, nil
}
