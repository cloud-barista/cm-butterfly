package software

type AdditionalPropInfo struct {
	Aliases             []string   `json:"aliases"`
	Dnsnames            []string   `json:"dnsnames"`
	DriverOpts          DriverOpts `json:"driverOpts"`
	EndpointID          string     `json:"endpointID"`
	Gateway             string     `json:"gateway"`
	GlobalIPv6Address   string     `json:"globalIPv6Address"`
	GlobalIPv6PrefixLen int        `json:"globalIPv6PrefixLen"`
	Ipaddress           string     `json:"ipaddress"`
	Ipamconfig          Ipamconfig `json:"ipamconfig"`
	IpprefixLen         int        `json:"ipprefixLen"`
	Ipv6Gateway         string     `json:"ipv6Gateway"`
	Links               []string   `json:"links"`
	MacAddress          string     `json:"macAddress"`
	NetworkID           string     `json:"networkID"`
}