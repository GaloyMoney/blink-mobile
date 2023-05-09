FROM node:18-alpine

RUN apk update \
  && apk add bash curl wget tar git jq make \
  && apk add yq --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community

ENV GH_CLI_VERSION 2.23.0
RUN mkdir ghcli && cd ghcli \
  && wget https://github.com/cli/cli/releases/download/v${GH_CLI_VERSION}/gh_${GH_CLI_VERSION}_linux_386.tar.gz -O ghcli.tar.gz \
  && tar --strip-components=1 -xf ghcli.tar.gz \
  && mv bin/gh /usr/local/bin && cd ../ && rm -rf ./ghcli

ARG TERRAFORM_VERSION=1.4.5
RUN curl -L -O "https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip" && \
  unzip "terraform_${TERRAFORM_VERSION}_linux_amd64.zip" -d /usr/local/bin && \
  rm -f "terraform_${TERRAFORM_VERSION}_linux_amd64.zip"
