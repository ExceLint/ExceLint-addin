# Dockerfile to run ExceLint

# git clone https://github.com/plasma-umass/ExceLint-addin

# Also take hints from https://towardsdev.com/writing-a-docker-file-for-your-node-js-typescript-micro-service-c5170b957893

# Build with: docker build -t excelint-addin-local .
# Debug with: docker run -it  -p 3000:3000  excelint-addin-local /bin/sh
# Run with:   docker run ?????

# This specific version of node works
FROM node:16.4-alpine3.11

RUN apk add git
RUN mkdir /home/node/app
COPY . /home/node/app
WORKDIR /home/node/app

RUN cd /home/node/app
# RUN export NODE_OPTIONS=--no-experimental-fetch
RUN npm install
RUN npm run build

# And issue this command when people use "docker run..."
EXPOSE 3000
CMD ["npm","run","start-local"]
