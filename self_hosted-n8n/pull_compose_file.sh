#! /bin/bash

# Required variables

HOME_DIR=$(pwd)
FILE_SOURCES_DIR="${HOME_DIR}/../n8n-hosting/docker-compose/withPostgresAndWorker";

DOCKER_COMPOSE_SRC="${FILE_SOURCES_DIR}/docker-compose.yml";
DOCKER_COMPOSE_DST="${HOME_DIR}/docker-compose.updated.yml";

ENV_SRC="${FILE_SOURCES_DIR}/.env";
ENV_DST="${HOME_DIR}/.n8n-env";

PULUMI_SRC="https://get.pulumi.com";

# Execution
echo "Updating project sdk...";
curl -sSL "${PULUMI_SRC}" | sh;

echo "Starting sync with source...";
cd "${FILE_SOURCES_DIR}";
git fetch --all --prune && git gc && git pull --all && git status
cd "${HOME_DIR}";

echo "Copying docker-compose.yml and .n8n-env to current directory...";
rm -f "${DOCKER_COMPOSE_DST}" "${ENV_DST}";
scp "${DOCKER_COMPOSE_SRC}" "${DOCKER_COMPOSE_DST}";
scp "${ENV_SRC}" "${ENV_DST}";

echo "Sync with source completed!";
