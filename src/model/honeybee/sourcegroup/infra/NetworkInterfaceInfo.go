package infra

type NetworkInterface struct {
	Address    []string `json:"address"`
	Gateway    []string `json:"gateway"`
	Interface  string   `json:"interface"`
	MacAddress string   `json:"mac_address"`
	Mtu        int      `json:"mtu"`
}
