package controller

import (
	"fmt"
	"log"
	"net/http"

	honeybeesourcegroup "github.com/cloud-barista/cm-butterfly/src/model/honeybee/sourcegroup"
	//infra "github.com/cloud-barista/cm-butterfly/src/model/honeybee/sourcegroup/infra"
	//software "github.com/cloud-barista/cm-butterfly/src/model/honeybee/sourcegroup/software"
	"github.com/cloud-barista/cm-butterfly/src/service"
	
	echotemplate "github.com/foolin/echo-template"
	"github.com/labstack/echo"

	
)

func LegacySourceGroupMngForm(c echo.Context) error {
	fmt.Println("LegacySourceGroupMngForm ************ : ")

	selectedSourceGroupID := c.QueryParam("sourceGroupId")

	return echotemplate.Render(c, http.StatusOK,
		"migration/legacy/sourcegroupmng/SourceGroupMng", // 파일명
		map[string]interface{}{
			"sourceGroupId": selectedSourceGroupID,
		})
}

func LegacySourceConnectionMngForm(c echo.Context) error {
	fmt.Println("LegacySourceConnectionMngForm ************ : ")

	selectedSourceGroupID := c.QueryParam("sourceGroupId")

	return echotemplate.Render(c, http.StatusOK,
		"migration/legacy/sourceconnectionmng/LegacySourceConnectionMng", // 파일명
		map[string]interface{}{
			"sourceGroupId": selectedSourceGroupID,
		})
}

// Legacy SourceGroup 목록 조회
func GetLegacySourceGroupList(c echo.Context) error {

	sourceGroupList, respStatus := service.GetLegacySourceGroupList()
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":         "success",
		"status":          respStatus,
		"sourceGroupList": sourceGroupList,
	})
}

// Legacy SourceGroup 등록
func LegacySourceGroupRegProc(c echo.Context) error {

	sourceGroupReq := &honeybeesourcegroup.SourceGroupReq{}
	if err := c.Bind(sourceGroupReq); err != nil {
		log.Println(err)
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"message": "fail",
			"status":  "5001",
		})
	}

	sourceGroupInfo, respStatus := service.RegLegacySourceGroup(*sourceGroupReq)
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":        "success",
		"status":         respStatus,
		"sourceGroupInfo": sourceGroupInfo,
	})
}

// Legacy SourceGroup 단건 조회
func GetLegacySourceGroupData(c echo.Context) error {

	sourceGroupId := c.Param("sgID")
	fmt.Print("sgID : %s", sourceGroupId)
	sourceGroupInfo, respStatus := service.GetLegacySourceGroupDataById(sourceGroupId)
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":        "success",
		"status":         respStatus,
		"sourceGroupInfo": sourceGroupInfo,
	})
}

// Source Group 수정
func LegacySourceGroupUpdateProc(c echo.Context) error {
	sourceGroupId := c.Param("sgID")

	sourceGroupReq := &honeybeesourcegroup.SourceGroupReq{}
	if err := c.Bind(sourceGroupReq); err != nil {
		log.Println(err)
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"message": "fail",
			"status":  "5001",
		})
	}

	sourceGroupInfo, respStatus := service.UpdateLegacySourceGroupData(sourceGroupId, *sourceGroupReq)
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":        "success",
		"status":         respStatus,
		"sourceGroupInfo": sourceGroupInfo,
	})
}

// SourceGroup 삭제
func LegacySourceGroupDelProc(c echo.Context) error {
	sourceGroupId := c.Param("sgID")

	honeybeeMessage, respStatus := service.DeleteLegacySourceGroupData(sourceGroupId)
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":         "success",
		"status":          respStatus,
		"honeybeeMessage": honeybeeMessage,
	})
}

// Legacy Connection 목록 조회
func GetLegacySourceConnectionList(c echo.Context) error {

	sourceGroupId := c.Param("sgID")

	connectionInfoList, respStatus := service.GetSourceConnectionInfoListBySourcGroupId(sourceGroupId)
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":        "success",
		"status":         respStatus,
		"sourceConnectionList": connectionInfoList,
	})
}

// Legacy Connection 단건 조회
func GetLegacySourceConnectionData(c echo.Context) error {

	sourceGroupId := c.Param("sgID")
	connectionId := c.Param("connectionID")

	connectionInfo, respStatus := service.GetSourceConnectionDataBysgIdAndconnId(sourceGroupId, connectionId)
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":        "success",
		"status":         respStatus,
		"sourceConnectionInfo": connectionInfo,
	})
}

// Connection 조회. connection은 sourceGroup 아래에 있으나 sourceGroup 무관하게 connectionID로 조회.
func GetLegacySourceConnectionDataByID(c echo.Context) error {

	connectionId := c.Param("connId")

	connectionInfo, respStatus := service.GetSourceConnectionInfoDataById(connectionId)
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":        "success",
		"status":         respStatus,
		"sourceConnectionInfo": connectionInfo,
	})
}
// Legacy Connection 등록
func LegacySourceConnectionRegProc(c echo.Context) error {

	sourceGroupId := c.Param("sgID")

	connectionInfoReq := &honeybeesourcegroup.SourceConnectionInfoReq{}
	if err := c.Bind(connectionInfoReq); err != nil {
		log.Println("bindErr", err)
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"message": err.Error(),
			"status":  "5001",
		})
	}
	log.Println(connectionInfoReq)

	connectionInfo, respStatus := service.RegSourceConnectionInfo(sourceGroupId, connectionInfoReq)
	log.Println("response ", connectionInfo)
	log.Println("respStatus ", respStatus)

	if respStatus.StatusCode != 200 && respStatus.StatusCode != 201 {
		return c.JSON(respStatus.StatusCode, map[string]interface{}{
			"error":  respStatus.Message,
			"status": respStatus.StatusCode,
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":        "success",
		"status":         respStatus,
		"sourceConnectionInfo": connectionInfo,
	})
}


// Legacy Connection update
func LegacySourceConnectionUpdateProc(c echo.Context) error {

	sourceGroupId := c.Param("sgID")
	connectionId := c.Param("connectionID")

	connectionInfoReq := &honeybeesourcegroup.SourceConnectionInfoReq{}
	if err := c.Bind(connectionInfoReq); err != nil {
		log.Println(err)
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"message": "fail",
			"status":  "5001",
		})
	}

	connectionInfo, respStatus := service.UpdateLegacySourceConnectionInfo(connectionId, sourceGroupId, *connectionInfoReq)
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":        "success",
		"status":         respStatus,
		"sourceConnectionInfo": connectionInfo,
	})
}

// Legacy SourceConnection delete
func LegacySourceConnectionDelProc(c echo.Context) error {

	sourceGroupId := c.Param("sgID")
	connectionId := c.Param("connectionID")

	connectionInfo, respStatus := service.DeleteLegacySourceConnectionInfo(sourceGroupId, connectionId)
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":        "success",
		"status":         respStatus,
		"sourceConnectionInfo": connectionInfo,
	})
}


// Honeybee Ready 여부 
func CheckReadyHoneybee(c echo.Context) error {
	respStatus := service.GetHoneyBeeReadyz()
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":         respStatus.Message,
		"status":          respStatus.StatusCode,
	})
}

// Connection check
func GetLegacySourceGroupConnectionCheck(c echo.Context) error {
	sourceGroupId := c.Param("sgID")

	connectionInfo, respStatus := service.CheckLegacySourceGroupConnection(sourceGroupId)
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":        "success",
		"status":         respStatus,
		"sourceConnectionInfo": connectionInfo,
	})
}

// Infra 정보 수집
func ImportLegacySourceInfraInfo(c echo.Context) error {
	sourceGroupId := c.Param("sgID")
	connectionId := c.Param("connectionID")
	

	infraInfo, respStatus := service.GetImportLegacyInfraInfoBySourceIdAndConnId(sourceGroupId, connectionId)
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":       "success",
		"status":        respStatus,
		"infraInfo": infraInfo,
	})
}

// Software 정보 수집
func ImportLegacySourceSoftwareInfo(c echo.Context) error {
	sourceGroupId := c.Param("sgID")
	connectionId := c.Param("connectionID")	

	softwareInfo, respStatus := service.GetImportLegacySoftwareInfoBySourceIdAndConnId(sourceGroupId, connectionId)
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":      "success",
		"status":       respStatus,
		"softwareInfo": softwareInfo,
	})
}

// 저장된 Infra 정보 조회
func GetLegacySourceInfraInfo(c echo.Context) error {
	
	sourceGroupId := c.Param("sgID")
	connectionId := c.Param("connectionID")	

	infraInfo, respStatus := service.GetLegacyInfraInfoBySourceIdAndConnId(sourceGroupId, connectionId)
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":   "success",
		"status":    respStatus,
		"infraInfo": infraInfo,
	})
}

// 저장된 Software 정보 조회
func GetLegacySourceSoftwareInfo(c echo.Context) error {
	sourceGroupId := c.Param("sgID")
	connectionId := c.Param("connectionID")	

	softwareInfo, respStatus := service.GetLegacySoftwareInfoBySourceIdAndConnId(sourceGroupId, connectionId)
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":      "success",
		"status":       respStatus,
		"softwareInfo": softwareInfo,
	})
}
