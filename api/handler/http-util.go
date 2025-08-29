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

	"github.com/gobuffalo/buffalo"
	"github.com/spf13/viper"
)

// ////////////////////////////////////////////////////////////////
type CommonRequest struct {
	PathParams  map[string]string `json:"pathParams"`
	QueryParams map[string]string `json:"queryParams"`
	Request     interface{}       `json:"request"`
}

// 모든 응답을 CommonResponse로 한다.
type CommonResponse struct {
	ResponseData interface{} `json:"responseData"`
	Status       WebStatus   `json:"status"`
}

type WebStatus struct {
	StatusCode int    `json:"code"`
	Message    string `json:"message"`
}

// ////////////////////////////////////////////////////////////////

type Auth struct {
	Type     string `mapstructure:"type"`
	Username string `mapstructure:"username"`
	Password string `mapstructure:"password"`
}

type Service struct {
	BaseURL string `mapstructure:"baseurl"`
	Auth    Auth   `mapstructure:"auth"`
}

type Spec struct {
	Method       string `mapstructure:"method"`
	ResourcePath string `mapstructure:"resourcePath"`
	Description  string `mapstructure:"description"`
}

type ApiYaml struct {
	CLISpecVersion string                     `mapstructure:"cliSpecVersion"`
	Services       map[string]Service         `mapstructure:"services"`
	ServiceActions map[string]map[string]Spec `mapstructure:"serviceActions"`
}

// ////////////////////////////////////////////////////////////////

var (
	ApiYamlSet ApiYaml
)

func init() {
	log.Println("DEBUG: Initializing ApiYamlSet...")

	exePath, err := os.Executable()
	if err != nil {
		log.Printf("ERROR: Failed to get executable path: %v", err)
		panic(err)
	}

	// 실행 파일의 경로를 기준으로 conf 경로를 설정
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
		panic(fmt.Errorf("fatal error reading actions/conf/api.yaml file: %s", err))
	}

	log.Printf("DEBUG: Config file loaded successfully")

	if err := viper.Unmarshal(&ApiYamlSet); err != nil {
		log.Printf("ERROR: Failed to unmarshal config: %v", err)
		panic(fmt.Errorf("unable to decode into struct: %v", err))
	}

	log.Printf("DEBUG: ApiYamlSet initialized successfully")
	log.Printf("DEBUG: - CLISpecVersion: %s", ApiYamlSet.CLISpecVersion)
	log.Printf("DEBUG: - Services count: %d", len(ApiYamlSet.Services))
	log.Printf("DEBUG: - ServiceActions count: %d", len(ApiYamlSet.ServiceActions))

	// 각 서비스와 액션 정보 출력
	for serviceName, service := range ApiYamlSet.Services {
		log.Printf("DEBUG: - Service: %s -> %+v", serviceName, service)
	}

	for serviceName, actions := range ApiYamlSet.ServiceActions {
		log.Printf("DEBUG: - ServiceActions: %s -> %d actions", serviceName, len(actions))
		for actionName, spec := range actions {
			log.Printf("DEBUG:   - Action: %s -> %+v", actionName, spec)
		}
	}
}

// AnyCaller는 buffalo.Context, operationId, commonRequest, auth유무 를 받아 conf/api.yaml 정보를 바탕으로 commonCaller를 호출합니다.
// 모든 error 는 기본적으로 commonResponse 에 담아져 반환됩니다.
func AnyCaller(c buffalo.Context, operationId string, commonRequest *CommonRequest, auth bool) (*CommonResponse, error) {
	log.Printf("DEBUG: AnyCaller called with operationId: %s", operationId)
	log.Printf("DEBUG: - commonRequest: %+v", commonRequest)
	log.Printf("DEBUG: - auth: %v", auth)

	// GetApiSpec 호출 전
	log.Printf("DEBUG: About to call GetApiSpec with operationId: %s", operationId)

	_, targetFrameworkInfo, targetApiSpec, err := GetApiSpec(strings.ToLower(operationId))

	// GetApiSpec 호출 후 결과 확인
	if err != nil {
		log.Printf("ERROR: GetApiSpec failed: %v", err)
		log.Printf("ERROR: - operationId: %s", operationId)
		commonResponse := CommonResponseStatusNotFound(operationId + "-" + err.Error())
		return commonResponse, err
	}

	log.Printf("DEBUG: GetApiSpec succeeded")
	log.Printf("DEBUG: - targetFrameworkInfo: %+v", targetFrameworkInfo)
	log.Printf("DEBUG: - targetApiSpec: %+v", targetApiSpec)

	// targetFrameworkInfo와 targetApiSpec이 비어있는지 확인
	if targetFrameworkInfo == (Service{}) {
		log.Printf("ERROR: targetFrameworkInfo is empty Service{}")
		commonResponse := CommonResponseStatusNotFound(operationId + "-" + "targetFrameworkInfo is empty")
		return commonResponse, fmt.Errorf("targetFrameworkInfo is empty")
	}

	if targetApiSpec == (Spec{}) {
		log.Printf("ERROR: targetApiSpec is empty Spec{}")
		commonResponse := CommonResponseStatusNotFound(operationId + "-" + "targetApiSpec is empty")
		return commonResponse, fmt.Errorf("targetApiSpec is empty")
	}

	var authString string
	if auth {
		log.Printf("DEBUG: About to call getAuth")
		authString, err = getAuth(c, targetFrameworkInfo)
		if err != nil {
			log.Printf("ERROR: getAuth failed: %v", err)
			commonResponse := CommonResponseStatusBadRequest(err.Error())
			return commonResponse, err
		}
		log.Printf("DEBUG: getAuth succeeded: %s", authString)
	} else {
		authString = ""
		log.Printf("DEBUG: No auth required, authString: %s", authString)
	}

	log.Printf("DEBUG: About to call CommonCaller")
	log.Printf("DEBUG: - method: %s", strings.ToUpper(targetApiSpec.Method))
	log.Printf("DEBUG: - baseURL: %s", targetFrameworkInfo.BaseURL)
	log.Printf("DEBUG: - resourcePath: %s", targetApiSpec.ResourcePath)

	commonResponse, err := CommonCaller(strings.ToUpper(targetApiSpec.Method), targetFrameworkInfo.BaseURL, targetApiSpec.ResourcePath, commonRequest, authString)
	if err != nil {
		log.Printf("ERROR: CommonCaller failed: %v", err)
		return commonResponse, err
	}

	log.Printf("DEBUG: CommonCaller succeeded")
	return commonResponse, err
}

// getApiSpec은 OpertinoId를 받아 conf/api.yaml에 정의된 Service, Spec 을 반환합니다.
// 없을경우 not found error를 반환합니다.
func GetApiSpec(requestOpertinoId string) (string, Service, Spec, error) {
	log.Printf("DEBUG: GetApiSpec called with requestOpertinoId: %s", requestOpertinoId)
	log.Printf("DEBUG: - ApiYamlSet.ServiceActions: %+v", ApiYamlSet.ServiceActions)

	for framework, api := range ApiYamlSet.ServiceActions {
		log.Printf("DEBUG: - checking framework: %s", framework)
		log.Printf("DEBUG: - framework api: %+v", api)

		for opertinoId, spec := range api {
			log.Printf("DEBUG: - checking opertinoId: %s vs request: %s", opertinoId, requestOpertinoId)

			if opertinoId == strings.ToLower(requestOpertinoId) {
				log.Printf("DEBUG: - MATCH FOUND!")
				log.Printf("DEBUG: - framework: %s", framework)
				log.Printf("DEBUG: - service: %+v", ApiYamlSet.Services[framework])
				log.Printf("DEBUG: - spec: %+v", spec)

				return framework, ApiYamlSet.Services[framework], spec, nil
			}
		}
	}

	log.Printf("ERROR: No matching API spec found for operationId: %s", requestOpertinoId)
	log.Printf("ERROR: Available ServiceActions: %+v", ApiYamlSet.ServiceActions)
	return "", Service{}, Spec{}, fmt.Errorf("getApiSpec not found")
}

// SubsystemAnyCaller buffalo.Context, subsystemName, operationId, commonRequest, auth유무 를 받아 conf/api.yaml 정보를 바탕으로 commonCaller를 호출합니다.
// AnyCaller 와 동일한 방식으로 작동하며, subsystemName, operationId 로 호출할 서브시스템의 함수를 특정합니다.
// 모든 응답과 error 는 commonResponse 내 설정되어 반환됩니다.
func SubsystemAnyCaller(c buffalo.Context, subsystemName, operationId string, commonRequest *CommonRequest, auth bool) (*CommonResponse, error) {
	targetFrameworkInfo, targetApiSpec, err := getApiSpecBySubsystem(subsystemName, operationId)
	if (err != nil || targetFrameworkInfo == Service{} || targetApiSpec == Spec{}) {
		commonResponse := CommonResponseStatusNotFound(operationId + "-" + err.Error())
		return commonResponse, err
	}

	var authString string
	if auth {
		authString, err = getAuth(c, targetFrameworkInfo)
		if err != nil {
			commonResponse := CommonResponseStatusBadRequest(err.Error())
			return commonResponse, err
		}
	} else {
		authString = ""
	}

	commonResponse, err := CommonCaller(strings.ToUpper(targetApiSpec.Method), targetFrameworkInfo.BaseURL, targetApiSpec.ResourcePath, commonRequest, authString)
	if err != nil {
		return commonResponse, err
	}
	return commonResponse, err
}

// getApiSpecBySubsystem 은 subsystemName, OpertinoId 를 받아 conf/api.yaml에 정의된 Service, Spec 을 반환합니다.
// 없을경우 not found error를 반환합니다.
func getApiSpecBySubsystem(subsystemName, requestOpertinoId string) (Service, Spec, error) {
	apis := ApiYamlSet.ServiceActions[strings.ToLower(subsystemName)]
	for opertinoId, spec := range apis {
		if strings.EqualFold(strings.ToLower(opertinoId), strings.ToLower(requestOpertinoId)) {
			return ApiYamlSet.Services[strings.ToLower(subsystemName)], spec, nil
		}
	}
	return Service{}, Spec{}, fmt.Errorf("getApiSpec not found")
}

// getAuth는 컨텍스트 및 대상 서비스 정보를 받아, 옳바른 Authorization 값을 반환합니다.
// 오류의 경우 각 경우, 해당하는 오류가 반환됩니다.
// Auth 방식이 없을경우, 아무것도 반환되지 않습니다.
func getAuth(c buffalo.Context, service Service) (string, error) {
	switch service.Auth.Type {
	case "basic":
		if apiUserInfo := service.Auth.Username + ":" + service.Auth.Password; service.Auth.Username != "" && service.Auth.Password != "" {
			encA := base64.StdEncoding.EncodeToString([]byte(apiUserInfo))
			return "Basic " + encA, nil
		} else {
			return "", fmt.Errorf("username or password is empty")
		}

	case "bearer":
		if authValue, ok := c.Value("Authorization").(string); ok {
			return authValue, nil
		} else {
			return "", fmt.Errorf("authorization key does not exist or is not a string")
		}

	default:
		return "", nil
	}
}

////////////////////////////////////////////////////////////////

func CommonCaller(callMethod string, targetFwUrl string, endPoint string, commonRequest *CommonRequest, auth string) (*CommonResponse, error) {
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
	commonResponse, err := CommonHttpToCommonResponse(requestUrl, commonRequest.Request, callMethod, auth)

	if err != nil {
		log.Printf("ERROR: CommonHttpToCommonResponse failed: %v", err)
	} else {
		log.Printf("DEBUG: CommonHttpToCommonResponse succeeded")
		if commonResponse != nil {
			log.Printf("DEBUG: - response status: %+v", commonResponse.Status)
			log.Printf("DEBUG: - response data: %+v", commonResponse.ResponseData)
		} else {
			log.Printf("WARNING: commonResponse is nil")
		}
	}

	return commonResponse, err
}

func CommonCallerWithoutToken(callMethod string, targetFwUrl string, endPoint string, commonRequest *CommonRequest) (*CommonResponse, error) {
	pathParamsUrl := mappingUrlPathParams(endPoint, commonRequest)
	queryParamsUrl := mappingQueryParams(pathParamsUrl, commonRequest)
	requestUrl := targetFwUrl + queryParamsUrl
	commonResponse, err := CommonHttpToCommonResponse(requestUrl, commonRequest.Request, callMethod, "")
	return commonResponse, err
}

////////////////////////////////////////////////////////////////

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

func CommonHttpToCommonResponse(url string, s interface{}, httpMethod string, auth string) (*CommonResponse, error) {
	log.Println("CommonHttp - METHOD:" + httpMethod + " => url:" + url)
	log.Println("isauth:", auth)

	jsonData, err := json.Marshal(s)
	if err != nil {
		log.Println("commonPostERR : json.Marshal : ", err.Error())
		return nil, err
	}

	req, err := http.NewRequest(httpMethod, url, bytes.NewBuffer(jsonData))
	if err != nil {
		log.Println("Error CommonHttp creating request:", err)
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	if auth != "" {
		req.Header.Add("Authorization", auth)
	}

	requestDump, err := httputil.DumpRequest(req, true)
	if err != nil {
		log.Println("Error CommonHttp creating httputil.DumpRequest:", err)
	}
	log.Println("\n", string(requestDump))

	// TODO : TLSClientConfig InsecureSkipVerify 해제 v0.2.0 이후 작업예정
	customTransport := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	client := &http.Client{Transport: customTransport}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("Error CommonHttp request:", err)
		return CommonResponseStatusInternalServerError(err), err
	}
	defer resp.Body.Close()

	respBody, ioerr := io.ReadAll(resp.Body)
	if ioerr != nil {
		log.Println("Error CommonHttp reading response:", ioerr)
	}

	commonResponse := &CommonResponse{}
	commonResponse.Status.Message = resp.Status
	commonResponse.Status.StatusCode = resp.StatusCode

	jsonerr := json.Unmarshal(respBody, &commonResponse.ResponseData)
	if jsonerr != nil {
		commonResponse.ResponseData = strings.TrimSpace(string(respBody))
		return commonResponse, nil
	}

	return commonResponse, nil
}

func isJSONResponse(body []byte) bool {
	var js map[string]interface{}
	return json.Unmarshal(body, &js) == nil
}

////////////////////////////////////////////////////////////////

func CommonResponseStatusOK(responseData interface{}) *CommonResponse {
	webStatus := WebStatus{
		StatusCode: http.StatusOK,
		Message:    http.StatusText(http.StatusOK),
	}
	return &CommonResponse{
		ResponseData: responseData,
		Status:       webStatus,
	}
}

func CommonResponseStatusNoContent(responseData interface{}) *CommonResponse {
	webStatus := WebStatus{
		StatusCode: http.StatusNoContent,
		Message:    http.StatusText(http.StatusNoContent),
	}
	return &CommonResponse{
		ResponseData: responseData,
		Status:       webStatus,
	}
}

func CommonResponseStatusNotFound(responseData interface{}) *CommonResponse {
	webStatus := WebStatus{
		StatusCode: http.StatusNotFound,
		Message:    http.StatusText(http.StatusNotFound),
	}
	return &CommonResponse{
		ResponseData: responseData,
		Status:       webStatus,
	}
}

func CommonResponseStatusStatusUnauthorized(responseData interface{}) *CommonResponse {
	webStatus := WebStatus{
		StatusCode: http.StatusUnauthorized,
		Message:    http.StatusText(http.StatusUnauthorized),
	}
	return &CommonResponse{
		ResponseData: responseData,
		Status:       webStatus,
	}
}

func CommonResponseStatusBadRequest(responseData interface{}) *CommonResponse {
	webStatus := WebStatus{
		StatusCode: http.StatusBadRequest,
		Message:    http.StatusText(http.StatusBadRequest),
	}
	return &CommonResponse{
		ResponseData: responseData,
		Status:       webStatus,
	}
}

func CommonResponseStatusForbidden(responseData interface{}) *CommonResponse {
	webStatus := WebStatus{
		StatusCode: http.StatusForbidden,
		Message:    http.StatusText(http.StatusForbidden),
	}
	return &CommonResponse{
		ResponseData: responseData,
		Status:       webStatus,
	}
}

func CommonResponseStatusInternalServerError(responseData interface{}) *CommonResponse {
	webStatus := WebStatus{
		StatusCode: http.StatusInternalServerError,
		Message:    http.StatusText(http.StatusInternalServerError),
	}
	return &CommonResponse{
		ResponseData: responseData,
		Status:       webStatus,
	}
}
