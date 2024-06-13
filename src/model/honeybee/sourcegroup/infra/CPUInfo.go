package infra

type CPU struct {
	Cache    int    `json:"cache"`
	Cores    int    `json:"cores"`
	Cpus     int    `json:"cpus"`
	MaxSpeed int    `json:"max_speed"`
	Model    string `json:"model"`
	Threads  int    `json:"threads"`
	Vendor   string `json:"vendor"`
}
