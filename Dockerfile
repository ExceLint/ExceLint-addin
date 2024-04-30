# Dockerfile to run ExceLint

# git clone https://github.com/plasma-umass/ExceLint-addin

# Also take hints from https://towardsdev.com/writing-a-docker-file-for-your-node-js-typescript-micro-service-c5170b957893

# Build with: docker build -t excelint-addin-local .
#   Run with: docker run -p 3000:3000 --rm excelint-addin-local
#              (wait ~60 seconds for "Compiled with warnings" message)

# This specific version of node works
FROM node:16.4-alpine3.11

# Get the container ready - install the necessary software
RUN apk add git
# Copy the data from the home directory into the container
RUN mkdir /home/node/app
COPY . /home/node/app
WORKDIR /home/node/app

# cd into the home directory and install and build the packages
RUN cd /home/node/app
RUN npm install
RUN npm run build
EXPOSE 3000

# Issue this command when people use "docker run..."
CMD [ "npm", "run", "run-in-docker" ]
