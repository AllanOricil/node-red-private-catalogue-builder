FROM node:18-alpine

WORKDIR /usr/src/app

ARG REGISTRY=http://host.docker.internal:4873

RUN npm config set registry ${REGISTRY}
COPY package.json ./
COPY index.js ./
RUN npm install --only=production --ignore-scripts

EXPOSE 8080

CMD [ "npm", "start" ]