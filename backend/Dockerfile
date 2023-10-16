# NODE IMAGE
FROM node:lts-alpine3.17 AS builder

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci

# Bundle app source
COPY . .

ARG DATABASE_URL

RUN npm run postinstall

RUN npm run build

ENTRYPOINT npm run migration:apply && node dist/main.js

