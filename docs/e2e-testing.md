# E2E Testing

```mermaid
  flowchart TD;
      A[E2E Test]-->B{Cloud CI or Local?};
      B -- Cloud --> C[Browserstack]
      B -- Local --> D[Appium]
      C -- Test On --> E[Cloud Device]
      D -- Test On --> G[Local Simulator/Emulator/Phone]
```

## To Test locally with Appium and Webdriver:

1. run the debug version of the app `yarn android` or `yarn ios`
2. In a new terminal run `yarn start:appium`
3. In a new terminal run `yarn test:e2e:android` or `yarn test:e2e:ios`

## To Test with Browserstack (cloud devices):

\*\* this will eventually be integrated into CI, but for now you can test locally if you have
access to browserstack.com

```
export BROWSERSTACK_USER=YOURUSER
export BROWSERSTACK_ACCESS_KEY=YOURKEY
export BROWSERSTACK_APP_ID=bs://YOURAPPID
```

run `yarn test:browserstack:android`

## To Test Locally

### Getting the Name of an Android or IOS device

There is a script in `bin/get-testing-device.sh` that will automatically get the name of the android or ios device and set the env vars `TEST_DEVICE_ANDROID` and `TEST_DEVICE_IOS`

You can also manually set the environment variable for the test device like this:

Android

```
TEST_DEVICE_ANDROID="Pixel 3 API 29" yarn test:e2e:android
```

IOS

```
TEST_DEVICE_IOS="iPhone 13" yarn test:e2e:ios
```

Here are the other env variables you need to set

```
GALOY_TOKEN={YOUR_TOKEN}
GALOY_TOKEN_2={SECOND_WALLET_TOKEN}
E2E_DEVICE={ios or android}
```

## Authenticated Tests

To run the authenticated tests you need to set the env variable `GALOY_TOKEN`. The e2e test will navigate to the settings/build version page and input the token

Then you can run one test at a time:

```
TEST="03" yarn test:e2e:ios:auth
```

## Troubleshooting

If you have any issues with appium then run `yarn appium-doctor`

## Finding Elements

Appium uses `Accessibility Labels` to locate components, such as buttons.

```ts
// This is used for E2E tests to apply id's to a <Component/>
// Usage:
//  <Button {...testProps("testID")} />
export const testProps = (testID: string) => {
  return {
    testID,
    accessible: true,
    accessibilityLabel: testID,
  }
}
```

You can install `appium inspector` https://github.com/appium/appium-inspector to find elements in the GUI. It can be configured by setting the `remote path` to `/wd/hub` and then using the `Desired Capabilities JSON repesentation`, example below. (make sure to input your simulator or android emulator settings):

ios

```
{
  "platformName": "iOS",
  "appium:deviceName": "iPhone 13",
  "appium:bundleId": "io.galoy.bitcoinbeach",
  "appium:automationName": "XCUITest",
  "appium:platformVersion": "15.4"
}
```

android

```
{
  "app": "/path/to/code/galoy-mobile/android/app/build/outputs/apk/debug/app-debug.apk",
  "platformName": "Android",
  "deviceName": "generic_x86",
  "automationName": "UiAutomator2"
}
```

ios on browserstack - choose 'select cloud providers' then 'browserstack'

```
{
  "appium:deviceName": "iPhone 13",
  "appium:automationName": "XCUITest",
  "appium:platformVersion": "15.1",
  "appium:app": "bs://{YOUR_BROWSERSTACK_ID_FROM_CIRCLE_CI}"
}
```
