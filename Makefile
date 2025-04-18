.DEFAULT_GOAL := compile

CMD_DIR = $(CURDIR)/cmd

compile:
	go build -o $(CMD_DIR)/notes-web $(CMD_DIR)/notes-web.go

build-image:
	docker build -t notes-api/web .

.PHONY: compile build-image
