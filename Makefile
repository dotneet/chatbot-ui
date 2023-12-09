include .env

.PHONY: all

build:
	docker build -t open-gpt .

run:
	export $(cat .env | xargs)
	docker stop open-gpt || true && docker rm open-gpt || true
	docker run --name open-gpt --rm -e OPENAI_API_KEY=${OPENAI_API_KEY} -p 3000:3000 open-gpt

logs:
	docker logs -f open-gpt

push:
	docker tag open-gpt:latest ${DOCKER_USER}/open-gpt:${DOCKER_TAG}
	docker push ${DOCKER_USER}/open-gpt:${DOCKER_TAG}