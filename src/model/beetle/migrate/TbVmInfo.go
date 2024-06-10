package migrate

// import (
// 	beecommon "github.com/cloud-barista/cm-butterfly/src/model/beetle/common"
// )

type TbVmInfo struct {
	ConnectionConfig ConnConfig `json:"connectionConfig"`
	ConnectionName    string `json:"connectionName"`
	CreatedTime    string `json:"createdTime"`

	CspViewVmDetail SpiderVMInfo `json:"cspViewVmDetail"`

	Description string                 `json:"description"`
	ID          string                 `json:"id"`
	IdByCSP     string                 `json:"idByCSP"`
	ImageID     string                 `json:"imageId"`

	DataDiskIds    []string `json:"dataDiskIds"`

	Label       string                 `json:"label"`
	
	MonAgentStatus string `json:"monAgentStatus"`

	Name               string     `json:"name"`
	NetworkAgentStatus string     `json:"networkAgentStatus"`
	PrivateDns         string     `json:"privateDns"`
	PrivateIP          string     `json:"privateIP"`
	PublicDNS          string     `json:"publicDNS"`
	PublicIP           string     `json:"publicIP"`
	//Region             RegionInfo `json:"region"`
	Region             string `json:"region"`

	RootDeviceName string   `json:"rootDeviceName"`
	RootDiskSize   string   `json:"rootDiskSize"`
	RootDiskType   string   `json:"rootDiskType"`
	

	SecurityGroupIDs []string `json:"securityGroupIds"`

	SpecID         string `json:"specId"`
	SshKeyID       string `json:"sshKeyId"`
	SshPort        string `json:"sshPort"`
	Status         string `json:"status"`
	SubnetID       string `json:"subnetId"`
	SystemMessage  string `json:"systemMessage"`
	TargetAction   string `json:"targetAction"`
	TargetStatus   string `json:"targetStatus"`
	VNetID         string `json:"vNetId"`
	VmBlockDisk    string `json:"vmBlockDisk"`
	VmBootDisk     string `json:"vmBootDisk"`
	SubGroupID     string `json:"subGroupId"`
	VmUserAccount  string `json:"vmUserAccount"`
	VmUserPassword string `json:"vmUserPassword"`
}


type ConnConfig struct {
	ConfigName string `json:"configName"`
	CredentialName string `json:"credentialName"`
	DriverName string `json:"driverName"`
	ProviderName string `json:"providerName"`
	RegionName string `json:"regionName"`
	location TbLocation `json:"location"`
}

// deprecated : changed to TbLocation
type GeoLocation struct {
	BriefAddr string `json:"briefAddr"`
	CloudType string `json:"cloudType"`
	Latitude string `json:"latitude"`
	Longitude string `json:"longitude"`
	NativeRegion string `json:"nativeRegion"`
}

type TbLocation struct {
	Display     string `json:"display"`
	Latitude      string `json:"latitude"`
	Longitude     string `json:"longitude"`	
}