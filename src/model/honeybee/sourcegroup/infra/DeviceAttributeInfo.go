package infra

type DeviceAttribute struct {
	CudaVersion         string `json:"cuda_version"`
	DriverVersion       string `json:"driver_version"`
	GpuUuid             string `json:"gpu_uuid"`
	ProductArchitecture string `json:"product_architecture"`
	ProductBrand        string `json:"product_brand"`
	ProductName         string `json:"product_name"`
}
