package migrate

import (
	beetlecommon "github.com/cloud-barista/cm-butterfly/src/model/beetle/common"
)

type SpiderVMInfo struct {
	CspId            string                `json:"cspid"`
	IID              beetlecommon.IID        `json:"iid"`
	ImageIID         beetlecommon.IID        `json:"imageIId"`
	KeyPairIID       beetlecommon.IID        `json:"keyPairIId"`
	KeyPairName      string                `json:"keyPairName"`
	KeyValueList     []beetlecommon.KeyValue `json:"keyValueList"`
	Name             string                `json:"name"`
	NetworkInterface string                `json:"networkInterface"`

	PrivateDns         string           `json:"networkInterface"`
	PrivateIP          string           `json:"privateIP"`
	PublicDns          string           `json:"publicDns"`
	PublicIP           string           `json:"publicIP"`
	//Region             RegionInfo       `json:"region"`
	Region             string       `json:"region"`
	SecurityGroupIIds  []beetlecommon.IID `json:"securityGroupIIds"`
	SecurityGroupNames []string         `json:"securityGroupNames"`

	SshaccessPoint string `json:"sshaccessPoint"`
	StartTime      string `json:"startTime"`

	SubnetIID  beetlecommon.IID `json:"subnetIID"`
	SubnetName string         `json:"subnetName"`

	VmblockDisk  string `json:"vmblockDisk"`
	VmbootDisk   string `json:"vmbootDisk"`
	VmspecName   string `json:"vmspecName"`
	VmuserId     string `json:"vmuserId"`
	VmuserPasswd string `json:"vmuserPasswd"`

	RootDeviceName string `json:"rootDeviceName"`
	RootDiskSize   string `json:"rootDiskSize"`
	RootDiskType   string `json:"rootDiskType"`

	VpcIID  beetlecommon.IID `json:"vpcIID"`
	VpcName string         `json:"vpcName"`
}
