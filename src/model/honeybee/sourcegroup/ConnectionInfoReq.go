package sourcegroup

type ConnectionInfoReq struct {
	Description string `json:"description"`
	IpAddress   string `json:"ip_address"`
	Name        string `json:"name"`
	Password    string `json:"password"`
	PrivateKey  string `json:"private_key"`
	SshPort     int    `json:"ssh_port"`
	User        string `json:"user"`
}
