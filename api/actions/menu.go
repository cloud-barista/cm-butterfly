package actions

import (
	"api/handler"

	"github.com/gobuffalo/buffalo"
)

func GetmenuTree(c buffalo.Context) error {
	commonResponse := handler.CommonResponseStatusOK(handler.CmigMenuTree.Menus)
	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}
