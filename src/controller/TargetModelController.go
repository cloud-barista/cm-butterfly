package controller

import (
	// "encoding/json"
	//"fmt"
	"log"
	"net/http"

	//webtool "github.com/cloud-barista/cm-butterfly/src/model/webtool"

	service "github.com/cloud-barista/cm-butterfly/src/service"
	
	echotemplate "github.com/foolin/echo-template"
	"github.com/labstack/echo"
	// echosession "github.com/go-session/echo-session"
)

// TargetModel 등록화면
func TargetModelRegForm(c echo.Context) error {

	loginInfo := service.CallLoginInfo(c)
	if loginInfo.UserID == "" {
		return c.Redirect(http.StatusTemporaryRedirect, "/login")
	}
	defaultNameSpaceID := loginInfo.DefaultNameSpaceID

	optionParam := c.QueryParam("option")

	nsList, _ := service.GetStoredNameSpaceList(c)
	log.Println(" nsList  ", nsList)

	targetModelList, _ := service.GetTargetModelList(defaultNameSpaceID, optionParam)
	
	return echotemplate.Render(c, http.StatusOK,
		"operation/migrations/targetmodelmng/TargetModelCreate", // 파일명
		map[string]interface{}{
			"DefaultNameSpaceID": defaultNameSpaceID,
			"NameSpaceList":      nsList,
			"TargetModelList": targetModelList,
		})
}

// TargetModel 관리화면
func TargetModelMngForm(c echo.Context) error {
	loginInfo := service.CallLoginInfo(c)
	if loginInfo.UserID == "" {
		return c.Redirect(http.StatusTemporaryRedirect, "/login")
	}
	return echotemplate.Render(c, http.StatusOK,
		"operation/migrations/targetmodelmng/TargetModelMng",
		map[string]interface{}{
			"LoginInfo": loginInfo,
		})
}