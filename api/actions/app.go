package actions

import (
	"os"
	"sync"

	"github.com/gobuffalo/buffalo"
	"github.com/gobuffalo/buffalo-pop/v3/pop/popmw"
	contenttype "github.com/gobuffalo/mw-contenttype"
	"github.com/gobuffalo/x/sessions"
	"github.com/rs/cors"

	i18n "github.com/gobuffalo/mw-i18n/v2"
	paramlogger "github.com/gobuffalo/mw-paramlogger"

	"api/models"
)

var (
	app     *buffalo.App
	appOnce sync.Once
	T       *i18n.Translator
)

func App() *buffalo.App {
	appOnce.Do(func() {
		app = buffalo.New(buffalo.Options{
			SessionStore: sessions.Null{},
			PreWares: []buffalo.PreWare{
				cors.AllowAll().Handler, // disable require, when front proxy done.
			},
			SessionName: "cm-buttergly",
			Addr:        os.Getenv("API_ADDR") + ":" + os.Getenv("API_PORT"),
		})

		app.Use(paramlogger.ParameterLogger)
		app.Use(contenttype.Set("application/json"))
		app.Use(popmw.Transaction(models.DB))
		app.Use(SetContextMiddleware)

		app.Middleware.Skip(SetContextMiddleware, readyz)
		app.ANY("/readyz", readyz)

		apiPath := "/api"

		auth := app.Group(apiPath + "/auth")
		auth.Middleware.Skip(SetContextMiddleware, AuthLogin)
		auth.POST("/login", AuthLogin)
		auth.POST("/refresh", AuthLoginRefresh)
		auth.POST("/validate", AuthValidate)
		auth.POST("/logout", AuthLogout)
		auth.POST("/userinfo", AuthUserinfo)

		api := app.Group(apiPath)
		api.POST("/disklookup", DiskLookup)
		api.POST("/availabledisktypebyproviderregion", AvailableDiskTypeByProviderRegion)
		api.POST("/getmenutree", GetmenuTree)

		// Projects Manage
		api.POST("/createproject", CreateProject)
		api.POST("/getprojectlist", GetProjectList)
		api.POST("/getprojectbyid", GetProjectById)
		api.POST("/updateprojectbyid", UpdateProjectById)
		api.POST("/deleteprojectbyid", DeleteProjectById)

		// Projects and Workspace Get
		api.POST("/getwpmappinglistbyworkspaceid", GetWPmappingListByWorkspaceId)
		api.POST("/getworkspaceuserrolemappinglistbyuserid", GetWorkspaceUserRoleMappingListByUserId)

		api.POST("/{operationId}", AnyController)
		api.POST("/{subsystemName}/{operationId}", SubsystemAnyController)
	})

	return app

}

func readyz(c buffalo.Context) error {
	return c.Render(200, r.JSON(map[string]interface{}{"status": "OK"}))
}
