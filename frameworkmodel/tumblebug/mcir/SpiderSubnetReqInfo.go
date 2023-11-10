package mcir

import (
	tbcommon "cm_butterfly/frameworkmodel/tumblebug/common"
)

type SpiderSubnetReqInfo struct {
	Name         string                `json:"name"`
	Ipv4_CIDR    string                `json:"ipv4_CIDR"`
	KeyValueList []tbcommon.TbKeyValue `json:"keyValueList"`

	ProviderID   string `json:"providerId"`
	ProviderName string `json:"providerName"`
	RegionName   string `json:"regionName"`
	ZoneName     string `json:"zoneName"`
}
