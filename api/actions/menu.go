package actions

import (
	"api/handler"
	"api/handler/self"

	"github.com/gobuffalo/buffalo"
)

func GetmenuTree(c buffalo.Context) error {
	commonResponse := handler.CommonResponseStatusOK(self.CmigMenuTree.Menus)
	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}
