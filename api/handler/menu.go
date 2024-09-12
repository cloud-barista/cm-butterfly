package handler

import (
	"log"
	"os"
	"strings"

	"github.com/spf13/viper"
	"gopkg.in/yaml.v2"
)

var (
	MENU_CONF_DATA_PATH = os.Getenv("MENU_CONF_DATA_PATH")
)

func init() {
	err := createMenuResource()
	if err != nil {
		log.Fatal("create menu fail : ", err.Error())
	}
	log.Println("Menu init success")
}

type Menu struct {
	Id          string `json:"id", yaml:"id"` // for routing
	ParentId    string `json:"parentid", yaml:"parentid"`
	DisplayName string `json:"displayname", yaml:"displayname"` // for display
	Restype     string `json:"restype", yaml:"restype"`         // maybe need type assertion..?
	IsAction    string `json:"isaction", yaml:"isaction"`
	Priority    string `json:"priority", yaml:"priority"`
	Menus       Menus  `json:"menus", yaml:"menus"`
}

type Menus []Menu

var CmigMenuTree Menu

func buildMenuTree(menus Menus, parentID string) Menus {
	var tree Menus

	for _, menu := range menus {
		if menu.ParentId == parentID {
			menu.Menus = buildMenuTree(menus, menu.Id)
			tree = append(tree, menu)
		}
	}
	return tree
}

func createMenuResource() error {
	data, err := os.ReadFile(MENU_CONF_DATA_PATH)
	if err != nil {
		return err
	}

	var cmigMenus Menu
	err = yaml.Unmarshal(data, &cmigMenus)
	if err != nil {
		return err
	}

	CmigMenuTree.Menus = buildMenuTree(cmigMenus.Menus, "home")

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
