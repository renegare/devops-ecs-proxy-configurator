VERSION=$(shell git rev-parse --short HEAD)
DOCKER_REPO=renegare
APP_NAME=consul-proxy-gen


build:
	echo $(VERSION) > VERSION
	docker-compose build app
	docker-compose build app
	docker-compose -p $(APP_NAME)$(VERSION) build app
	docker tag $(APP_NAME)$(VERSION)_app $(DOCKER_REPO)/$(APP_NAME):$(VERSION)
	docker tag $(APP_NAME)$(VERSION)_app $(DOCKER_REPO)/$(APP_NAME):latest
	-docker ps -af status=exited | xargs docker rm
	-docker rmi $(APP_NAME)$(VERSION)_app
	-docker images -qa -f dangling=true | xargs docker rmi
	docker images | grep $(DOCKER_REPO)/$(APP_NAME)

push:
	docker push $(DOCKER_REPO)/$(APP_NAME):latest
	docker push $(DOCKER_REPO)/$(APP_NAME):$(VERSION)
