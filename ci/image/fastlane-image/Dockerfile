FROM ruby:alpine

RUN apk update \
  && apk add bash curl wget tar git jq ruby-bundler \
  && apk add yq --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community
