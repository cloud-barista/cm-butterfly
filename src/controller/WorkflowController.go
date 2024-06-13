package controller

import (
	// "encoding/json"
	//"fmt"
	"log"
	"net/http"

	//"github.com/cloud-barista/cm-butterfly/src/model/tumblebug/mcis"

	// model "github.com/cloud-barista/cm-butterfly/src/model"
	//"github.com/cloud-barista/cm-butterfly/src/model"
	//"github.com/cloud-barista/cm-butterfly/src/model/dragonfly"
	workflow "github.com/cloud-barista/cm-butterfly/src/model/cicada/workflow"

	
	//webtool "github.com/cloud-barista/cm-butterfly/src/model/webtool"

	service "github.com/cloud-barista/cm-butterfly/src/service"
	//util "github.com/cloud-barista/cm-butterfly/src/util"

	
	echotemplate "github.com/foolin/echo-template"
	"github.com/labstack/echo"
	// echosession "github.com/go-session/echo-session"
)

// type SecurityGroup struct {
// 	Id []string `form:"sg"`
// }

func WorkflowRegForm(c echo.Context) error {

	taskComponentList, _ := service.GetTaskComponentList()
	//workflowList, _ := service.GetWorkflowList(defaultNameSpaceID)

	return echotemplate.Render(c, http.StatusOK,
		"migration/workflow/workflowmng/WorkflowCreate", // 파일명
		map[string]interface{}{
			"TaskComponentList": taskComponentList,
		})
}

// 
func WorkflowMngForm(c echo.Context) error {
	
	//workflowList, _ := service.GetWorkflowList(defaultNameSpaceID, "", "", "")
	return echotemplate.Render(c, http.StatusOK,
		"migration/workflow/workflowmng/WorkflowMng", // 파일명
		
		map[string]interface{}{
			//"WorkflowList": workflowList,
		})
}

// Workflow 목록 조회
func GetWorkflowList(c echo.Context) error {
	log.Println("GetWorkflowList controller : ")
	// loginInfo := service.CallLoginInfo(c)
	// log.Println("loginInfo : ", loginInfo)
	// if loginInfo.UserID == "" {
	// 	return c.Redirect(http.StatusTemporaryRedirect, "/login")
	// }

	//defaultNameSpaceID := loginInfo.DefaultNameSpaceID
	// optionParam := c.QueryParam("option")
	// filterKeyParam := c.QueryParam("filterKey")
	// filterValParam := c.QueryParam("filterVal")

	workflowList, respStatus := service.GetWorkflowList("", "")
	//workflowList, respStatus := service.GetWorkflowList(defaultNameSpaceID, optionParam, filterKeyParam, filterValParam)
	if respStatus.StatusCode != 200 && respStatus.StatusCode != 201 {
		return c.JSON(respStatus.StatusCode, map[string]interface{}{
			"error":  respStatus.Message,
			"status": respStatus.StatusCode,
		})
	}

	// cicada의 workflow 를 webconsole로 변환.: 여기서 ? 아니면 front에서?

	// tasks의 dependency -> sequence로 : TODO : 우선은 받아온 그대로 사용한다. 향후 backend에서 매핑	
	service.ConvertCicadaToButterfly(workflowList);


	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":            "success",
		"status":             respStatus.StatusCode,
		"WorkflowList":       workflowList,
	})

}

// GetWorkflowInfoData
func GetWorkflowInfoData(c echo.Context) error {
	log.Println("GetWorkflowInfoData")
	// loginInfo := service.CallLoginInfo(c)
	// if loginInfo.UserID == "" {
	// 	return c.Redirect(http.StatusTemporaryRedirect, "/login") // 조회기능에서 바로 login화면으로 돌리지말고 return message로 하는게 낫지 않을까?
	// }
	// defaultNameSpaceID := loginInfo.DefaultNameSpaceID

	workflowID := c.Param("workflowID")
	log.Println("workflowID= " + workflowID)
	// optionParam := c.QueryParam("option")
	// log.Println("optionParam= " + optionParam)

	resultWorkflowInfo, _ := service.GetWorkflowData(workflowID)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":      "success",
		"status":       200,
		"WorkflowInfo": resultWorkflowInfo,
	})
}

// Workflow 등록
func WorkflowRegProc(c echo.Context) error {
	log.Println("WorkflowRegProc : ")
	
	workflowReqInfo := &workflow.WorkflowReqInfo{}
	if err := c.Bind(workflowReqInfo); err != nil {
		log.Println(err)
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"message": "fail",
			"status":  "5001",
		})
	}
	log.Println(workflowReqInfo)	
	
	respStatus := service.RegWorkflow(workflowReqInfo)

	log.Println("before return")
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": respStatus.Message,
		"status":  respStatus.StatusCode,
	})

}

// Workflow 실행
func WorkflowExecute(c echo.Context) error {
	log.Println("WorkflowExecute : ")
	
	workflowID := c.Param("workflowID")
	log.Println("workflowID= " + workflowID)
	
	respStatus := service.RunWorkflow(workflowID)

	log.Println("before return")
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": respStatus.Message,
		"status":  respStatus.StatusCode,
	})
}


// Workflow 수정
func WorkflowUpdateProc(c echo.Context) error {
	log.Println("WorkflowUpdateProc : ")
	
	workflowReqInfo := &workflow.WorkflowReqInfo{}
	if err := c.Bind(workflowReqInfo); err != nil {
		log.Println(err)
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"message": "fail",
			"status":  "5001",
		})
	}
	log.Println(workflowReqInfo)
	workflowID := c.Param("workflowID")
	log.Println("workflowID= " + workflowID)
	
	respStatus := service.UpdateWorkflow(workflowID, workflowReqInfo)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": respStatus.Message,
		"status":  respStatus.StatusCode,
	})

}

// Workflow 삭제
func WorkflowDelProc(c echo.Context) error {
	log.Println("WorkflowDelProc : ")
	
	workflowID := c.Param("workflowID")
	log.Println("workflowID= " + workflowID)
	_, respStatus := service.DelWorkflow(workflowID)
	log.Println("WorkflowDelProc service returned")
	if respStatus.StatusCode != 200 && respStatus.StatusCode != 201 {
		return c.JSON(respStatus.StatusCode, map[string]interface{}{
			"error":  respStatus.Message,
			"status": respStatus.StatusCode,
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "success",
		"status":  respStatus.StatusCode,
	})
}

// WorkflowTemplate 목록 조회
func GetWorkflowTemplateList(c echo.Context) error {
	log.Println("GetWorkflowTemplateList")
	
	
	resultWorkflowTemplateList, _ := service.GetWorkflowTemplateList()

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":      "success",
		"status":       200,
		"WorkflowTemplateList": resultWorkflowTemplateList,
	})
}

// WorkflowTemplate 단건 조회
func GetWorkflowTemplateData(c echo.Context) error {
	log.Println("GetWorkflowTemplateData")
	
	workflowTemplateID := c.Param("workflowTemplateID")
	log.Println("workflowTemplateID= " + workflowTemplateID)
	resultWorkflowTemplateData, _ := service.GetWorkflowTemplateData(workflowTemplateID)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":      "success",
		"status":       200,
		"WorkflowTemplat": resultWorkflowTemplateData,
	})
}


// TaskComponent 목록 조회
func GetTaskComponentList(c echo.Context) error {
	log.Println("GetTaskComponentList")
		
	resultTaskComponentList, _ := service.GetTaskComponentList()

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":      "success",
		"status":       200,
		"TaskComponentList": resultTaskComponentList,
	})
}

// TaskComponent 단건 조회
func GetTaskComponentData(c echo.Context) error {
	log.Println("GetTaskComponentData")
	
	taskcomponentID := c.Param("taskcomponentID")
	log.Println("taskcomponentID= " + taskcomponentID)
	resultTaskComponentData, _ := service.GetTaskComponentData(taskcomponentID)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":      "success",
		"status":       200,
		"TaskComponent": resultTaskComponentData,
	})
}


/////////////////////////////////
// Sample Form 1
func WorkflowDefaultMngForm(c echo.Context) error {
	loginInfo := service.CallLoginInfo(c)
	if loginInfo.UserID == "" {
		return c.Redirect(http.StatusTemporaryRedirect, "/login")
	}
	return echotemplate.Render(c, http.StatusOK,
		"operation/workflow/SequentialWorkflowDesigner",
		map[string]interface{}{
			"LoginInfo": loginInfo,
		})
}

// Sample form 2
func WorkflowFullscreenMngForm(c echo.Context) error {
	loginInfo := service.CallLoginInfo(c)
	if loginInfo.UserID == "" {
		return c.Redirect(http.StatusTemporaryRedirect, "/login")
	}
	return echotemplate.Render(c, http.StatusOK,
		"operation/workflow/fullscreen",
		map[string]interface{}{
			"LoginInfo": loginInfo,
		})
}

// Sample form 3 : from org site.
func WorkflowDemoMngForm(c echo.Context) error {
	loginInfo := service.CallLoginInfo(c)
	if loginInfo.UserID == "" {
		return c.Redirect(http.StatusTemporaryRedirect, "/login")
	}

	targetFile := c.Param("targetFile")

	return echotemplate.Render(c, http.StatusOK,
		"operation/workflow/"+targetFile,
		map[string]interface{}{
			"LoginInfo": loginInfo,
		})
}

