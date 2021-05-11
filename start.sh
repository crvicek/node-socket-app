#!/bin/bash

# Install dependencies
npm i
wait


# Pull and start redis
docker pull redis
docker stop redis
docker rm redis
docker run -d -p "127.0.0.1:6379:6379/tcp" --restart always --name redis redis
wait

# Run tests
npm run test
wait

# Build and start the app
docker build -t node-socket-app .
docker stop node-socket-app
docker rm node-socket-app

docker run -d \
 --name node-socket-app \
 --net host \
 -p "127.0.0.1:3000:3000" \
 node-socket-app
