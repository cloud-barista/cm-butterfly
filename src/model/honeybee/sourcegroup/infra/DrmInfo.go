package infra

type Drm []struct {
	DriverDate        string `json:"driver_date"`
	DriverDescription string `json:"driver_description"`
	DriverName        string `json:"driver_name"`
	DriverVersion     string `json:"driver_version"`
}
