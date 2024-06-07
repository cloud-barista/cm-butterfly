package controller

import (
	// "encoding/json"
	//"fmt"
	"log"
	"net/http"

	service "github.com/cloud-barista/cb-webtool/src/service"
	
	echotemplate "github.com/foolin/echo-template"
	"github.com/labstack/echo"
	// echosession "github.com/go-session/echo-session"
)

// 소스모델 등록 화면
func SourceModelRegForm(c echo.Context) error {

	loginInfo := service.CallLoginInfo(c)
	if loginInfo.UserID == "" {
		return c.Redirect(http.StatusTemporaryRedirect, "/login")
	}
	defaultNameSpaceID := loginInfo.DefaultNameSpaceID

	optionParam := c.QueryParam("option")

	nsList, _ := service.GetStoredNameSpaceList(c)
	log.Println(" nsList  ", nsList)

	sourceModelList, _ := service.GetSourceModelList(defaultNameSpaceID, optionParam)
	
	return echotemplate.Render(c, http.StatusOK,
		"operation/migrations/sourcemodelmng/SourceModelCreate", // 파일명
		map[string]interface{}{
			"DefaultNameSpaceID": defaultNameSpaceID,
			"NameSpaceList":      nsList,
			"SourceModelList": sourceModelList,
		})
}

// 소스모델 관련화면
func SourceModelMngForm(c echo.Context) error {
	loginInfo := service.CallLoginInfo(c)
	if loginInfo.UserID == "" {
		return c.Redirect(http.StatusTemporaryRedirect, "/login")
	}
	return echotemplate.Render(c, http.StatusOK,
		"operation/migrations/sourcemodelmng/SourceModelMng",
		map[string]interface{}{
			"LoginInfo": loginInfo,
		})
}