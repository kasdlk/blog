package utils

import (
	"gopkg.in/yaml.v3"
	"log"
	"os"
)

type Config struct {
	Server struct {
		Port int `yaml:"port"`
	} `yaml:"server"`

	Database struct {
		Type   string `yaml:"type"`
		Path   string `yaml:"path"`
		DBName string `yaml:"dbname"`
	} `yaml:"database"`

	JWT struct {
		Secret          string `yaml:"secret"`
		Issuer          string `yaml:"issuer"`
		Audience        string `yaml:"audience"`
		ExpirationHours int    `yaml:"expiration_hours"`
	} `yaml:"jwt"`

	CORS struct {
		AllowOrigins     string `yaml:"allow_origins"`
		AllowMethods     string `yaml:"allow_methods"`
		AllowHeaders     string `yaml:"allow_headers"`
		AllowCredentials bool   `yaml:"allow_credentials"`
	} `yaml:"cors"`

	FilePaths struct {
		HTMLIndex string `yaml:"html_index"`
	} `yaml:"file_paths"`
}

var AppConfig Config

func LoadConfig(configPath string) {
	file, err := os.Open(configPath)
	if err != nil {
		log.Fatalf("Error opening config file: %v\n", err)
	}
	defer file.Close()

	decoder := yaml.NewDecoder(file)
	err = decoder.Decode(&AppConfig)
	if err != nil {
		log.Fatalf("Error decoding config file: %v", err)
	}
}
