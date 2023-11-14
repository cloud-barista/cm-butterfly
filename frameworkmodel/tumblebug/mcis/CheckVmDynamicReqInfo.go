package mcis

import (
	tbcommon "cm_butterfly/frameworkmodel/tumblebug/common"
	tbmcir "cm_butterfly/frameworkmodel/tumblebug/mcir"
)

type CheckVmDynamicReqInfo struct {
	ConnectionConfigCandidates []string          `json:"connectionConfigCandidates"`
	Region                     tbcommon.TbRegion `json:"region"`
	SystemMessage              string            `json:"systemMessage"`
	VmSpec                     tbmcir.TbSpecInfo `json:"vmSpec"`
}
