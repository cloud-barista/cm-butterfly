package mcis

import (
	tbcommon "cm_butterfly/frameworkmodel/tumblebug/common"
)

type RegisterResourceResult struct {
	ConnectionName        string                `json:"connectionName"`
	ElapsedTime           int                   `json:"elapsedTime"`
	RegisterationOutputs  tbcommon.TbIdList     `json:"registerationOutputs"`
	RegisterationOverview RegisterationOverview `json:"registerationOverview"`
	SystemMessage         string                `json:"systemMessage"`
}
