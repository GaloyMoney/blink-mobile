# search for android device
if [ "$TEST_DEVICE_ANDROID" ]; then
  echo "android exists"
else
  TEST_DEVICE_ANDROID=$(adb devices -l | grep model | awk -F':' '{print $3}' | awk '{split($0,a," "); print a[1]}')
fi
echo $TEST_DEVICE_ANDROID


# search for ios simulator
if [ "$TEST_DEVICE_IOS" ]; then
  echo "ios exists"
else
  TEST_DEVICE_IOS=$(xcrun simctl list devices booted | grep Booted | awk -F'(' '{print $1}' )
fi
echo $TEST_DEVICE_IOS

# TODO - TO SEARCH FOR A PHYSICAL DEVICE
# xcrun xctrace list devices

export TEST_DEVICE_ANDROID=$TEST_DEVICE_ANDROID
export TEST_DEVICE_IOS=$TEST_DEVICE_IOS

