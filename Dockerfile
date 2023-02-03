FROM node:alpine

RUN mkdir -p /usr/src/node-app && chown -R node:node /usr/src/node-app

WORKDIR /usr/src/node-app

COPY package.json yarn.lock ./

RUN apk --no-cache --virtual build-dependencies add \
        python \
        make \
        g++ \
&& yarn install --production \
&& apk del build-dependencies

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 8080

CMD [ "npm", "run", "dev" ]