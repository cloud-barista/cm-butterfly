package mcis

import tbcommon "github.com/cloud-barista/cm-butterfly/src/model/tumblebug/common"

type TbNLBListenerInfo struct {
	CspID   string `json:"cspID"`
	DnsName string `json:"dnsName"`

	Ip string `json:"ip"`

	Protocol string `json:"protocol"`
	Port     string `json:"port"`

	KeyValueList []tbcommon.TbKeyValue `json:"keyValueList"`
}
