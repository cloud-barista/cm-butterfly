package migrate

import beecommon "github.com/cloud-barista/cm-butterfly/src/model/beetle/common"

type TbRegion struct {
	ProviderName     string       `json:"providerName"`
	RegionName       string       `regionName:"regionName"`
	KeyValueInfoList []beecommon.KeyValue `json:"keyValueInfoList"`
}

type TbRegions []TbRegion
