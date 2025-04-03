package actions

import (
	"api/handler"
	"api/models"
	"net/http"

	"log"

	"github.com/gobuffalo/buffalo"
	"github.com/gobuffalo/buffalo/render"
	"github.com/gobuffalo/pop/v6"
)

func AuthLogin(c buffalo.Context) error {
	commonRequest := &handler.CommonRequest{}
	if err := c.Bind(commonRequest); err != nil {
		commonResponse := handler.CommonResponseStatusBadRequest(err)
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}
	id := commonRequest.Request.(map[string]interface{})["id"].(string)
	password := commonRequest.Request.(map[string]interface{})["password"].(string)

	tokenSet, err := handler.GetUserToken(id, password)
	if err != nil {
		commonResponse := handler.CommonResponseStatusBadRequest(err)
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	tx := c.Value("tx").(*pop.Connection)
	userSess := &models.Usersess{
		UserID:           id,
		AccessToken:      tokenSet.Accesstoken,
		ExpiresIn:        float64(tokenSet.ExpiresIn),
		RefreshToken:     tokenSet.RefreshToken,
		RefreshExpiresIn: float64(tokenSet.RefreshExpiresIn),
	}
	_, err = handler.CreateUserSess(tx, userSess)
	if err != nil {
		commonResponse := handler.CommonResponseStatusBadRequest(err)
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	commonResponse := handler.CommonResponseStatusOK(tokenSet)
	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}

func AuthLoginRefresh(c buffalo.Context) error {
	tx := c.Value("tx").(*pop.Connection)
	userId := c.Value("UserId").(string)
	sess, err := handler.GetUserByUserId(tx, userId)
	if err != nil {
		app.Logger.Error(err.Error())
		commonResponse := handler.CommonResponseStatusBadRequest(err.Error())
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	refreshToken := c.Value("refreshToken").(string)
	if refreshToken != sess.RefreshToken {
		return c.Render(http.StatusForbidden, render.JSON(map[string]interface{}{"error": http.StatusText(http.StatusForbidden)}))
	}

	tokenSet, err := handler.RefreshAccessToken(sess.RefreshToken)
	if err != nil {
		app.Logger.Error(err.Error())
		commonResponse := handler.CommonResponseStatusForbidden(err.Error())
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	sess.AccessToken = tokenSet.Accesstoken
	sess.ExpiresIn = float64(tokenSet.ExpiresIn)
	sess.RefreshToken = tokenSet.RefreshToken
	sess.RefreshExpiresIn = float64(tokenSet.RefreshExpiresIn)

	_, err = handler.UpdateUserSess(tx, sess)
	if err != nil {
		app.Logger.Error(err.Error())
		commonResponse := handler.CommonResponseStatusBadRequest(err.Error())
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	commonResponse := handler.CommonResponseStatusOK(tokenSet)

	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}

func AuthLogout(c buffalo.Context) error {
	tx := c.Value("tx").(*pop.Connection)
	_, err := handler.DestroyUserSessByAccesstokenforLogout(tx, c.Value("UserId").(string))
	if err != nil {
		log.Println("AuthLogout err : ", err.Error())
		commonResponse := handler.CommonResponseStatusBadRequest("no user session")
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}
	commonResponse := handler.CommonResponseStatusNoContent(nil)
	return c.Render(http.StatusOK, r.JSON(commonResponse))
}

func AuthUserinfo(c buffalo.Context) error {
	commonResponse := handler.CommonResponseStatusOK(map[string]interface{}{
		"userid":      c.Value("UserId").(string),
		"username":    c.Value("UserName").(string),
		"roles":       c.Value("Roles").([]string),
		"email":       c.Value("Email").(string),
		"description": c.Value("Description").(string),
		"company":     c.Value("Company").(string),
	})
	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}

func AuthValidate(c buffalo.Context) error {
	commonResponse := handler.CommonResponseStatusOK(nil)
	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}
