package actions

import (
	"api/handler"
	"api/handler/self"
	"api/models"
	"net/http"

	"log"

	"github.com/gobuffalo/buffalo"
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

	tokenSet, err := self.GetUserToken(id, password)
	if err != nil {
		commonResponse := handler.CommonResponseStatusBadRequest(err)
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	tx := c.Value("tx").(*pop.Connection)
	userSess := &models.Usersess{
		UserID:           id,
		AccessToken:      tokenSet.Accresstoken,
		ExpiresIn:        float64(tokenSet.ExpiresIn),
		RefreshToken:     tokenSet.RefreshToken,
		RefreshExpiresIn: float64(tokenSet.RefreshExpiresIn),
	}
	_, err = self.CreateUserSess(tx, userSess)
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
	sess, err := self.GetUserByUserId(tx, userId)
	if err != nil {
		app.Logger.Error(err.Error())
		commonResponse := handler.CommonResponseStatusBadRequest(err.Error())
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	tokenSet, err := self.RefreshAccessToken(sess.RefreshToken)
	if err != nil {
		app.Logger.Error(err.Error())
		commonResponse := handler.CommonResponseStatusBadRequest(err.Error())
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	sess.AccessToken = tokenSet.Accresstoken
	sess.ExpiresIn = float64(tokenSet.ExpiresIn)
	sess.RefreshToken = tokenSet.Accresstoken
	sess.RefreshExpiresIn = float64(tokenSet.RefreshExpiresIn)

	_, err = self.UpdateUserSess(tx, sess)
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
	_, err := self.DestroyUserSessByAccesstokenforLogout(tx, c.Value("UserId").(string))
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
		"userid":   c.Value("UserId").(string),
		"username": c.Value("UserName").(string),
		"email":    c.Value("Email").(string),
		"role":     c.Value("Role").(string),
	})
	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}

func AuthValidate(c buffalo.Context) error {
	commonResponse := handler.CommonResponseStatusOK(nil)
	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}
