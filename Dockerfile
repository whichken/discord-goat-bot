FROM node:12.14.0-alpine

WORKDIR /usr/src/app

COPY ["package.json", "yarn.lock", "./"]
RUN yarn install --fornze-lockfile

COPY . .
RUN yarn build

CMD node build/index.js