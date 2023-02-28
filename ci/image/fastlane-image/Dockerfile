# Extract the neccesary files from the iTMSTransporter Windows installer
FROM debian:stretch-slim as itms_transporter

RUN apt-get update \
  && apt-get install --yes p7zip-full curl \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* \
  && curl https://itunesconnect.apple.com/transporter/1.9.8/iTMSTransporterToolInstaller_1.9.8.exe > installer.exe \
  && 7z x installer.exe -oitms \
  && chmod +x itms/bin/iTMSTransporter

FROM ruby:2.7.6

RUN gem install bundler
RUN gem install fastlane

COPY --from=itms_transporter /itms /itms
ENV FASTLANE_ITUNES_TRANSPORTER_PATH=/itms
ENV FASTLANE_ITUNES_TRANSPORTER_USE_SHELL_SCRIPT=1
