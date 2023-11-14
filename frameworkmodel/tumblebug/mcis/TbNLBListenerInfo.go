package mcis

import tbcommon "cm_butterfly/frameworkmodel/tumblebug/common"

type TbNLBListenerInfo struct {
	CspID   string `json:"cspID"`
	DnsName string `json:"dnsName"`

	Ip string `json:"ip"`

	Protocol string `json:"protocol"`
	Port     string `json:"port"`

	KeyValueList []tbcommon.TbKeyValue `json:"keyValueList"`
}
