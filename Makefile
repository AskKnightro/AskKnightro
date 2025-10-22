PROJECT ?= askknightro
COMPOSE := docker compose -p $(PROJECT) -f docker-compose.yml -f milvus.yml 

# Defaults for convenience
SERVICE ?= backend   # used by `logs` and `sh`
TAIL    ?= 100

.PHONY: up build rebuild ps logs sh stop restart down down-v

up:         ## Start/refresh containers
	$(COMPOSE) up -d

build:      ## Build images
	$(COMPOSE) build

rebuild:    ## Rebuild images and recreate containers
	$(COMPOSE) up -d --build --force-recreate 

ps:         ## Show status
	$(COMPOSE) ps

logs:       ## Tail logs for a service (SERVICE=name, default: backend)
	$(COMPOSE) logs -f --tail=$(TAIL) $(SERVICE)

sh:         ## Shell into a service (SERVICE=name)
	@$(COMPOSE) exec $(SERVICE) sh -lc 'command -v bash >/dev/null && exec bash || exec sh'

stop:       ## Stop containers
	$(COMPOSE) stop

restart:    ## Restart containers
	$(COMPOSE) restart

down:       ## Stop & remove containers (keep data)
	$(COMPOSE) down

down-v:     ## Stop & remove containers + VOLUMES (DELETES DATA)
	$(COMPOSE) down -v

migrate-milvus:
	$(COMPOSE) run --rm milvus-migrate

