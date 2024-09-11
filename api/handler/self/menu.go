package self

import (
	"log"
	"os"
	"strings"

	"github.com/spf13/viper"
	"gopkg.in/yaml.v2"
)

func init() {
	err := createMenuResource()
	if err != nil {
		log.Fatal("create menu fail : ", err.Error())
	}
	log.Println("Self Menu init success")
}

type Menu struct {
	Id           string `json:"id"` // for routing
	ParentMenuId string `json:"parentMenuId"`
	DisplayName  string `json:"displayName"` // for display
	IsAction     string `json:"isAction"`    // maybe need type assertion..?
	Priority     string `json:"priority"`
	Menus        Menus  `json:"menus"`
}

type Menus []Menu

var CmigMenuTree Menu

func buildMenuTree(menus Menus, parentID string) Menus {
	var tree Menus

	for _, menu := range menus {
		if menu.ParentMenuId == parentID {
			menu.Menus = buildMenuTree(menus, menu.Id)
			tree = append(tree, menu)
		}
	}

	return tree
}

func createMenuResource() error {
	yamlFile := "../conf/selfiammenu.yaml"

	data, err := os.ReadFile(yamlFile)
	if err != nil {
		return err
	}

	var cmigMenus Menu
	err = yaml.Unmarshal(data, &cmigMenus)
	if err != nil {
		return err
	}

	CmigMenuTree.Menus = buildMenuTree(cmigMenus.Menus, "")
	return nil
}

func GetMenuTree(menuList Menus) (*Menus, error) {
	menuTree := buildMenuTree(menuList, "")
	return &menuTree, nil
}

func getCreateWebMenuByYamlEndpoint() string {
	viper.SetConfigName("api")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./conf")
	if err := viper.ReadInConfig(); err != nil {
		log.Fatalf("Error reading config file, %s", err)
	}
	baseUrl := viper.Get("services.mc-iam-manager.baseurl").(string)
	createwebmenubyyamlUri := viper.Get("serviceActions.mc-iam-manager.Createmenuresourcesbymenuyaml.resourcePath").(string)
	urlModified := strings.ReplaceAll(baseUrl+createwebmenubyyamlUri, "{framework}", "web")
	return urlModified
}
