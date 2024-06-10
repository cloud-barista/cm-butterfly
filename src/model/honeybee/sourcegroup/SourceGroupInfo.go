package sourcegroup

type SourceGroupInfo struct {
	Description string `json:"description"`
	Id          string `json:"id"`
	Name        string `json:"name"`
}

type sourceGroupInfos []SourceGroupInfo
