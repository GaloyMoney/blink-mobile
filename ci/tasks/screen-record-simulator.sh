#!/bin/bash

while ! xcrun simctl list devices | grep "(Booted)"; do
  sleep 1
  echo "Waiting for Simulator device to come online..."
done

xcrun simctl io booted recordVideo screenRecord.mov
