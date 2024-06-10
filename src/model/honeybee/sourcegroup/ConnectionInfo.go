package sourcegroup

type ConnectionInfo struct {
	Description   string `json:"description"`
	FailedMessage string `json:"failed_message"`
	Id            string `json:"id"`
	IpAddress     string `json:"ip_address"`
	Name          string `json:"name"`
	Password      string `json:"password"`
	PrivateKey    string `json:"private_key"`
	PublicKey     string `json:"public_key"`
	SourceGroupId string `json:"source_group_id"`
	SshPort       int    `json:"ssh_port"`
	Status        string `json:"status"`
	User          string `json:"user"`
}

type ConnectionInfos []ConnectionInfo