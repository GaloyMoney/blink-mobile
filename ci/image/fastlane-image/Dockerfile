FROM ruby:2.7.6

RUN gem install bundler

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
  && apt-get install -y \
  tzdata curl make git build-essential lsb-release rename \
  libtool autotools-dev autoconf libssl-dev libboost-all-dev \
  apt-transport-https ca-certificates \
  gnupg software-properties-common \
  vim jq rsync wget netcat kafkacat \
  && apt-get clean all


ARG YQ_VERSION=v4.21.1
ARG YQ_BINARY=yq_linux_amd64
ARG YQ_SHASUM=50778261e24c70545a3ff8624df8b67baaff11f759e6e8b2e4c9c781df7ea8dc
RUN wget https://github.com/mikefarah/yq/releases/download/${YQ_VERSION}/${YQ_BINARY} -O /usr/bin/yq \
  && echo $YQ_SHASUM /usr/bin/yq | sha256sum --check \
  && chmod +x /usr/bin/yq

RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | gpg --dearmor -o /usr/share/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
  | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
  && apt update && apt install gh

RUN wget https://raw.githubusercontent.com/Ariel-Rodriguez/sh-semversion-2/main/semver2.sh \
  && chmod +x semver2.sh && mv semver2.sh /usr/local/bin/semver-compare
