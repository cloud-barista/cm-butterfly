package infra

type Vpc []struct {
	AddressSpace []string    `json:"address_space"`
	DnsServer    []DnsServer `json:"dns_server"`
	Id           string      `json:"id"`
	Region       string      `json:"region"`
	Subnet       []Subnet    `json:"subnet"`
}
