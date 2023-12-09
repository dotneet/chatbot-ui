#!/bin/bash

set -euo pipefail

# Create a dump from the MongoDB container running in local docker environment.

mongo_user=$(cat .env.local|grep MONGO_INITDB_ROOT_USERNAME|cut -d '=' -f 2)
mongo_pass=$(cat .env.local|grep MONGO_INITDB_ROOT_PASSWORD|cut -d '=' -f 2)
mongo_db=$(cat .env.local|grep MONGODB_DB|cut -d '=' -f 2)
mongo_host=localhost
mongo_port=27017
output="./${mongo_db}.gz"
while getopts "h:p:d:o:" opt; do
    case $opt in
        h) mongo_host=$OPTARG;;
        p) mongo_port=$OPTARG;;
        d) mongo_db=$OPTARG;;
        o) output=$OPTARG;;
        *) echo "Invalid option: -$OPTARG" >&2;;
    esac
done

docker-compose exec mongo mongodump --authenticationDatabase admin \
    -u "$mongo_user" -p "$mongo_pass" \
    --host="${mongo_host}" --port="${mongo_port}" \
    --db="${mongo_db}" --gzip --archive=/tmp/opengpt.tar.gz
docker-compose cp mongo:/tmp/opengpt.tar.gz "${output}"

