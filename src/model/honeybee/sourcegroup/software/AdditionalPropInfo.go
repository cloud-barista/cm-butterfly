package software

type AdditionalProp struct {
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

type DriverOpts struct {
	AdditionalProp1 string `json:"additionalProp1"`
	AdditionalProp2 string `json:"additionalProp2"`
	AdditionalProp3 string `json:"additionalProp3"`
}

type Ipamconfig struct {
	Ipv4Address  string   `json:"ipv4Address"`
	Ipv6Address  string   `json:"ipv6Address"`
	LinkLocalIPs []string `json:"linkLocalIPs"`
}
