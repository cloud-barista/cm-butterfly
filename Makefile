SHELL := /bin/bash

.PHONY: build
build:
	@go build -o ./bin/butterfly main.go
	@echo "CM-Butterfly build complete."

.PHONY: config
config:
	@source ./conf/setup.env
	@echo "CM-Butterfly is configured."

.PHONY: build-run
build-run: build config
	@./bin/butterfly 

.PHONY: run
run: config
	@go run main.go