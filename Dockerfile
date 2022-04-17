FROM node:latest
WORKDIR /app
ADD package.json .
ADD yarn.lock .
RUN yarn
ADD . .
RUN yarn build
