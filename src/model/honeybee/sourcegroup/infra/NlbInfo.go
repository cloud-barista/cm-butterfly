package infra

type Nlb struct {
	Description   string `json:"description"`
	HealthChecker string `json:"health_checker"`
	Id            string `json:"id"`
	Listener      string `json:"listener"`
	Name          string `json:"name"`
	TargetGroup   string `json:"target_group"`
}
