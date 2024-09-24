package actions

import (
	"api/handler"

	"github.com/gobuffalo/buffalo"
)

func AgentAndConnectionCheck(c buffalo.Context) error {

	commonRequest := &handler.CommonRequest{}
	err := c.Bind(commonRequest)
	if err != nil {
		commonRes := handler.CommonResponseStatusBadRequest(nil)
		return c.Render(commonRes.Status.StatusCode, r.JSON(commonRes))
	}
	result, err := handler.AgentAndConnectionCheck(c, commonRequest)
	if err != nil {
		commonRes := handler.CommonResponseStatusInternalServerError(nil)
		return c.Render(commonRes.Status.StatusCode, r.JSON(commonRes))
	}

	commonRes := handler.CommonResponseStatusOK(result)
	return c.Render(commonRes.Status.StatusCode, r.JSON(commonRes))
}
