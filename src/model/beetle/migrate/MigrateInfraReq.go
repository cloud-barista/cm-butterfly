package migrate

type MigrateInfraReq struct {
	InfraName string `json:"name"`	
	Description string `json:"description"`	
	Label string `json:"label"`	
	SystemLabel string `json:"systemLabel"`
	
	Vm []TbVmInfo `json:"vm"`
}
