package mcir

import (
	tbcommon "github.com/cloud-barista/cm-butterfly/src/model/tumblebug/common"
)

type SpiderSubnetReqInfo struct {
	Name         string                `json:"name"`
	Ipv4_CIDR    string                `json:"ipv4_CIDR"`
	KeyValueList []tbcommon.TbKeyValue `json:"keyValueList"`
}
