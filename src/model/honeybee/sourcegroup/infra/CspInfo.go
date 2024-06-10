package infra

type Csp struct {
	Name          string          `json:"name"`
	Nlb           []Nlb           `json:"nlb"`
	SecurityGroup []SecurityGroup `json:"security_group"`
	Vpc           Vpc             `json:"vpc"`
}
