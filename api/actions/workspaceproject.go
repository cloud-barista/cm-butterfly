package actions

import (
	"api/handler"

	"github.com/gobuffalo/buffalo"
)

func GetWPmappingListByWorkspaceId(c buffalo.Context) error {
	res, err := handler.GetWPmappingList(c)
	if err != nil {
		commonRes := handler.CommonResponseStatusBadRequest(nil)
		return c.Render(commonRes.Status.StatusCode, r.JSON(commonRes))
	}
	commonRes := handler.CommonResponseStatusOK(res)
	return c.Render(commonRes.Status.StatusCode, r.JSON(commonRes))
}

func GetWorkspaceUserRoleMappingListByUserId(c buffalo.Context) error {
	res, err := handler.GetWorkspaceUserRoleMappingList(c)
	if err != nil {
		commonRes := handler.CommonResponseStatusBadRequest(nil)
		return c.Render(commonRes.Status.StatusCode, r.JSON(commonRes))
	}
	commonRes := handler.CommonResponseStatusOK(res)
	return c.Render(commonRes.Status.StatusCode, r.JSON(commonRes))
}

func CreateProject(c buffalo.Context) error {
	commonRequest := &handler.CommonRequest{}
	err := c.Bind(commonRequest)
	if err != nil {
		commonRes := handler.CommonResponseStatusBadRequest(nil)
		return c.Render(commonRes.Status.StatusCode, r.JSON(commonRes))
	}
	project, err := handler.PostNs(c, commonRequest)
	if err != nil {
		commonRes := handler.CommonResponseStatusBadRequest(nil)
		return c.Render(commonRes.Status.StatusCode, r.JSON(commonRes))
	}
	commonRes := handler.CommonResponseStatusOK(project)
	return c.Render(commonRes.Status.StatusCode, r.JSON(commonRes))
}

func GetProjectById(c buffalo.Context) error {
	commonRequest := &handler.CommonRequest{}
	err := c.Bind(commonRequest)
	if err != nil {
		commonRes := handler.CommonResponseStatusBadRequest(nil)
		return c.Render(commonRes.Status.StatusCode, r.JSON(commonRes))
	}
	project, err := handler.GetNs(c, commonRequest)
	if err != nil {
		commonRes := handler.CommonResponseStatusBadRequest(nil)
		return c.Render(commonRes.Status.StatusCode, r.JSON(commonRes))
	}
	commonRes := handler.CommonResponseStatusOK(project)
	return c.Render(commonRes.Status.StatusCode, r.JSON(commonRes))
}

func GetProjectList(c buffalo.Context) error {
	projects, err := handler.GetAllNs(c)
	if err != nil {
		commonRes := handler.CommonResponseStatusBadRequest(nil)
		return c.Render(commonRes.Status.StatusCode, r.JSON(commonRes))
	}
	commonRes := handler.CommonResponseStatusOK(projects)
	return c.Render(commonRes.Status.StatusCode, r.JSON(commonRes))
}

func UpdateProjectById(c buffalo.Context) error {
	commonRequest := &handler.CommonRequest{}
	err := c.Bind(commonRequest)
	if err != nil {
		commonRes := handler.CommonResponseStatusBadRequest(nil)
		return c.Render(commonRes.Status.StatusCode, r.JSON(commonRes))
	}
	project, err := handler.PutNs(c, commonRequest)
	if err != nil {
		commonRes := handler.CommonResponseStatusBadRequest(nil)
		return c.Render(commonRes.Status.StatusCode, r.JSON(commonRes))
	}
	commonRes := handler.CommonResponseStatusOK(project)
	return c.Render(commonRes.Status.StatusCode, r.JSON(commonRes))
}

func DeleteProjectById(c buffalo.Context) error {
	commonRequest := &handler.CommonRequest{}
	err := c.Bind(commonRequest)
	if err != nil {
		commonRes := handler.CommonResponseStatusBadRequest(nil)
		return c.Render(commonRes.Status.StatusCode, r.JSON(commonRes))
	}
	err = handler.DelNs(c, commonRequest)
	if err != nil {
		commonRes := handler.CommonResponseStatusBadRequest(err.Error())
		return c.Render(commonRes.Status.StatusCode, r.JSON(commonRes))
	}
	commonRes := handler.CommonResponseStatusOK(nil)
	return c.Render(commonRes.Status.StatusCode, r.JSON(commonRes))
}
