FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-12

WORKDIR /usr/src/app

COPY ["package.json", "yarn.lock", "./"]
RUN yarn install --fornze-lockfile

COPY . .
RUN yarn build

CMD node build/index.js