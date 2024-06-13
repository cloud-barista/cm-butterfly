package controller

import (
	// "encoding/json"
	"fmt"

	// "github.com/cloud-barista/cm-butterfly/src/model/tumblebug"
	
	//beetlecommon "github.com/cloud-barista/cm-butterfly/src/model/beetle/common"
	beetle "github.com/cloud-barista/cm-butterfly/src/model/beetle/migrate"
	
	service "github.com/cloud-barista/cm-butterfly/src/service"

	//util "github.com/cloud-barista/cm-butterfly/src/util"

	"github.com/labstack/echo"
	// "io/ioutil"
	"log"
	"net/http"

	//"github.com/davecgh/go-spew/spew"
	echotemplate "github.com/foolin/echo-template"
	//echosession "github.com/go-session/echo-session"
)

func InfraMigrationMngForm(c echo.Context) error {
	fmt.Println("InfraMigrationMngForm ************ : ")

	return echotemplate.Render(c, http.StatusOK,
		"operation/migrations/migrationmng/InfraMigrationMng", // 파일명
		map[string]interface{}{	},
		)
}


func GetMigrationInfraList(c echo.Context) error {
	fmt.Println("GetMigrationInfraList ************ : ")

	migrationInfraInfoList, respStatus := service.GetMigrationInfraList()
	if respStatus.StatusCode != 200 && respStatus.StatusCode != 201 {
		return c.JSON(respStatus.StatusCode, map[string]interface{}{
			"error":  respStatus.Message,
			"status": respStatus.StatusCode,
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":            "success",
		"status":             respStatus.StatusCode,
		"MigrationInfraList":           migrationInfraInfoList,
	})
}

// MigrationInfra 상세정보
func GetMigrationInfraData(c echo.Context) error {
	
	paramVNetID := c.Param("infraID")
	migrationInfraInfo, respStatus := service.GetMigrationInfraData(paramVNetID)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":  "success",
		"status":   respStatus,
		"MigrationInfraInfo": migrationInfraInfo,
	})
}

// VMigrationInfra 등록 :
func MigrationInfraRegProc(c echo.Context) error {
	log.Println("MigrationInfraRegProc : ")
	
	migrateInfraReq := new(beetle.MigrateInfraReq)
	log.Println("migrateInfraReq : ", migrateInfraReq)
	if err := c.Bind(migrateInfraReq); err != nil {
		log.Println(err)
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"message": "fail",
			"status":  "fail",
		})
	}
	
	// resultInfo, respStatus := service.RegMigrationInfra(migrationInfraReq)
	
	// if respStatus.StatusCode != 200 && respStatus.StatusCode != 201 {
	// 	return c.JSON(respStatus.StatusCode, map[string]interface{}{
	// 		"error":  respStatus.Message,
	// 		"status": respStatus.StatusCode,
	// 	})
	// }

	// return c.JSON(http.StatusOK, map[string]interface{}{
	// 	"message":  "success",
	// 	"status":   respStatus.StatusCode,
	// 	"MigrationInfraInfo": resultInfo,
	// })
	return c.JSON(http.StatusOK, map[string]interface{}{
		"error":  "not yet implimented",
		"status":   "500",
		
	})
}

// MigrationInfra 삭제
func MigrationInfraDelProc(c echo.Context) error {
	log.Println("MigrationInfraDelProc : ")

	//paramInfraID := c.Param("infraID")

	// respMessage, respStatus := service.DelMigrationInfra(paramInfraID)
	// if respStatus.StatusCode != 200 && respStatus.StatusCode != 201 {
	// 	return c.JSON(respStatus.StatusCode, map[string]interface{}{
	// 		"error":  respStatus.Message,
	// 		"status": respStatus.StatusCode,
	// 	})
	// }

	// return c.JSON(http.StatusOK, map[string]interface{}{
	// 	"message": respMessage.Message,
	// 	"status":  respMessage.StatusCode,
	// })

	return c.JSON(http.StatusOK, map[string]interface{}{
		"error":  "not yet implimented",
		"status":   "500",
		
	})
}
