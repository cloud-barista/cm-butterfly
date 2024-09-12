package actions

import (
	"api/handler"

	"github.com/gobuffalo/buffalo"
)

func DiskLookup(c buffalo.Context) error {
	lookupDiskInfo, err := handler.DiskLookup(c)
	if err != nil {
		commonResponse := handler.CommonResponseStatusBadRequest(err.Error())
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	commonResponse := handler.CommonResponseStatusOK(lookupDiskInfo)
	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}

func AvailableDiskTypeByProviderRegion(c buffalo.Context) error {
	availableDiskInfo, err := handler.AvailableDiskTypeByProviderRegion(c)
	if err != nil {
		commonResponse := handler.CommonResponseStatusBadRequest(err.Error())
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	commonResponse := handler.CommonResponseStatusOK(availableDiskInfo)
	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}
