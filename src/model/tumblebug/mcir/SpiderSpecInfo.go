package mcir

import (
	tbcommon "github.com/cloud-barista/cm-butterfly/src/model/tumblebug/common"
)

type SpiderSpecInfo struct {
	Gpu          SpiderGpuInfo       `json:"gpu"`
	KeyValueList tbcommon.TbKeyValue `json:"keyValueList"`
	Mem          string              `json:"mem"`
	Name         string              `json:"name"`
	Region       string              `json:"region"`
	Vcpu         SpiderVCpuInfo      `json:"vCpu"`
}

type SpiderSpecInfos []SpiderSpecInfo
