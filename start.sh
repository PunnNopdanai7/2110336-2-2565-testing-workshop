#!/bin/bash

echo "Copying .env files..."
cp ./src/env.example ./src/.env
cp ./env.example .env

echo "Starting docker-compose..."
sudo docker-compose --env-file .env up -d