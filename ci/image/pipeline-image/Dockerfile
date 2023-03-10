FROM node:18-alpine

RUN apk update \
  && apk add bash curl wget tar git jq \
  && apk add yq --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community

ENV GH_CLI_VERSION 2.23.0
RUN mkdir ghcli && cd ghcli \
  && wget https://github.com/cli/cli/releases/download/v${GH_CLI_VERSION}/gh_${GH_CLI_VERSION}_linux_386.tar.gz -O ghcli.tar.gz \
  && tar --strip-components=1 -xf ghcli.tar.gz \
  && mv bin/gh /usr/local/bin && cd ../ && rm -rf ./ghcli
