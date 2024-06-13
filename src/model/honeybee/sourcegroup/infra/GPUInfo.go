package infra

type Gpu struct {
	Drm    Drm    `json:"drm"`
	Nvidia Nvidia `json:"nvidia"`
}
