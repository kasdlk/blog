package init

import (
	"blog/api"
	"blog/utils"
	"path/filepath"
)

func init() {
	configPath := filepath.Join("config", "config.yaml")
	utils.LoadConfig(configPath)
	r := api.SetupRouter()
	err := r.Run(":8089")
	if err != nil {
		return
	}
}
