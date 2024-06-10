package sourcegroup

type SavedInfraInfo struct {
	ConnectionId string `json:"connection_id"`
	InfraData    string `json:"infra_data"`
	SavedTime    string `json:"saved_time"`
	Status       string `json:"status"`
}
