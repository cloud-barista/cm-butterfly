package migrate

type MigrateInfraInfo struct {
	InfraId string `json:"id"`	
	InfraName string `json:"name"`	
	Description string `json:"description"`	
	InstallMonAgent string `json:"installMonAgent"`	
	Label string `json:"label"`	
	
	ConfigureCloudAdaptiveNetwork string `json:"configureCloudAdaptiveNetwork"`	
	NewVmList []string `json:"newVmList"`

	PlacementAlgo string `json:"placementAlgo"`	
	Status string `json:"status"`	
	StatusCount StatusCount `json:"statusCount"`
	
	SystemLabel string `json:"systemLabel"`
	SystemMessage string `json:"systemMessage"`
	TargetAction string `json:"targetAction"`
	TargetStatus string `json:"targetStatus"`

	Vm []TbVmInfo `json:"vm"`
}


type StatusCount struct {
	CountCreating int `json:"countCreating"`	
	CountFailed int `json:"countFailed"`	
	CountRebooting int `json:"countRebooting"`	
	CountResuming int `json:"countResuming"`	
	CountRunning int `json:"countRunning"`	
	CountSuspended int `json:"countSuspended"`	
	CountSuspending int `json:"countSuspending"`	
	CountTerminated int `json:"countTerminated"`	
	CountTerminating int `json:"countTerminating"`	
	CountTotal int `json:"countTotal"`	
	CountUndefined int `json:"countUndefined"`
}