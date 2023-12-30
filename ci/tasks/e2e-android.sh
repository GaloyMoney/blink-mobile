#!/bin/bash

adb devices

yarn start &

METRO_BUNDLER_PID=$!

yarn e2e:test android.emu.debug --headless -d -R 3

DETOX_EXIT_CODE=$?

kill $METRO_BUNDLER_PID

exit $DETOX_EXIT_CODE
