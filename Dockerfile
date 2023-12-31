FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY index.js ./
RUN npm install --only=production --ignore-scripts

EXPOSE 8080

CMD [ "npm", "start" ]