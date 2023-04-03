#!/bin/bash

echo "Copying .env files..."
./init-config.sh

echo "Starting docker-compose..."
docker-compose --env-file .env up -d --build