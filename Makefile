.PHONY: all

start-dev:
	docker-compose -f docker-compose.dev.yml up -d

build-dev:
	docker-compose -f docker-compose.dev.yml up --build -d

destroy-dev:
	docker-compose -f docker-compose.dev.yml down -v

format:
	cd webapp && npm run format && cd ..

lint:
	cd webapp && npm run lint && cd ..
