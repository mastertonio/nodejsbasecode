FROM node:alpine

RUN mkdir -p /usr/src/node-app && chown -R node:node /usr/src/node-app

WORKDIR /usr/src/node-app

COPY package.json yarn.lock ./

RUN apk add --no-cache python2 g++ make
USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 8080

CMD [ "npm", "run", "dev" ]