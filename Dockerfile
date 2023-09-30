FROM node:18-alpine

WORKDIR /usr/src/app

ARG VERDACCIO_HOST=http://host.docker.internal:4873
ARG NPM_TOKEN
ENV NPM_TOKEN=${NPM_TOKEN}

RUN npm config set registry ${VERDACCIO_HOST}
RUN echo "//host.docker.internal:4873/:_authToken=${NPM_TOKEN}" >> ./.npmrc
RUN cat ./.npmrc
COPY package.json ./
COPY index.js ./
RUN ls -a
RUN npm install --only=production

EXPOSE 8080

CMD [ "npm", "start" ]