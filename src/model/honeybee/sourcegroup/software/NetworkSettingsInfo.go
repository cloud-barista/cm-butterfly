package software

type NetworkSettings struct {
	Networks struct {
		AdditionalProp1 AdditionalProp `json:"additionalProp1"`
		AdditionalProp2 AdditionalProp `json:"additionalProp2"`
		AdditionalProp3 AdditionalProp `json:"additionalProp3"`
	} `json:"networks"`
}
