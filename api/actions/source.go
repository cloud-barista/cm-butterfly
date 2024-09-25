package actions

import (
	"api/handler"
	"log"

	"github.com/gobuffalo/buffalo"
)

func AgentAndConnectionCheck(c buffalo.Context) error {

	commonRequest := &handler.CommonRequest{}
	err := c.Bind(commonRequest)
	if err != nil {
		commonRes := handler.CommonResponseStatusBadRequest(err.Error())
		return c.Render(commonRes.Status.StatusCode, r.JSON(commonRes))
	}
	result, err := handler.AgentAndConnectionCheck(c, commonRequest)
	if err != nil {
		commonRes := handler.CommonResponseStatusInternalServerError(err.Error())
		return c.Render(commonRes.Status.StatusCode, r.JSON(commonRes))
	}

	commonRes := handler.CommonResponseStatusOK(result)
	return c.Render(commonRes.Status.StatusCode, r.JSON(commonRes))
}

func RegisterSourceGroup(c buffalo.Context) error {

	commonRequest := &handler.CommonRequest{}
	err := c.Bind(commonRequest)
	if err != nil {
		commonRes := handler.CommonResponseStatusBadRequest(err.Error())
		return c.Render(commonRes.Status.StatusCode, r.JSON(commonRes))
	}
	result, err := handler.RegisterSourceGroup(c, commonRequest)
	if err != nil {
		log.Println(err)
		commonRes := handler.CommonResponseStatusInternalServerError(err.Error())
		return c.Render(commonRes.Status.StatusCode, r.JSON(commonRes))
	}

	commonRes := handler.CommonResponseStatusOK(result)
	return c.Render(commonRes.Status.StatusCode, r.JSON(commonRes))
}
