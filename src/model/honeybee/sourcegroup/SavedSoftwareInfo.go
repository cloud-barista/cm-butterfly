package sourcegroup

type SavedSoftwareInfo struct {
	ConnectionId string `json:"connection_id"`
	SavedTime    string `json:"saved_time"`
	SoftwareData string `json:"software_data"`
	Status       string `json:"status"`
}
