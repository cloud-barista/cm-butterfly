package infra

type Subnet struct {
	Ipv4Cidr string `json:"ipv4_cidr"`
	Ipv6Cidr string `json:"ipv6_cidr"`
	Name     string `json:"name"`
}
