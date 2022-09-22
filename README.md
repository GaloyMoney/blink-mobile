# GaloyMobile

<img src=".readme/galoy-logo.png" alt="Galoy Logo" width="300">

## Goal

This repository is the Bitcoin Beach Wallet mobile application. The goal is to make a mobile application compatible with Galoy's backend that can be customized and used by any community or organization. It is built with [React Native](https://reactnative.dev/), and runs on both iOS and Android.

## Screenshots

<img src=".readme/screenshot-1.png" alt="Screenshot 1" width="150"> <img src=".readme/screenshot-2.png" alt="Screenshot 2" width="150"> <img src=".readme/screenshot-3.png" alt="Screenshot 3" width="150"> <img src=".readme/screenshot-4.png" alt="Screenshot 4" width="150">

## Contributing

If you wish to contribute see [CONTRIBUTING.MD](./CONTRIBUTING.MD)

## Start

Prerequisite -- [Set up React Native](https://reactnative.dev/docs/environment-setup) by following the instructions in the **React Native CLI Quickstart** tab

Clone into the project

cd into the directory

type `yarn install`

type `yarn start`

In another window
type `yarn ios` or `yarn android` to run locally.

The app is built and pushed to the App Store and Play Store on demand with CircleCI.

To run the app fully locally the backend must also be set up by following the instructions at https://github.com/GaloyMoney/galoy.

---

### _Notes for Running on M1 Mac:_

The app currently only builds for x86_64 simulators. Simulators prior to IOS 13.7 are x86_64 by default, however starting with 13.7 they become platform specific. In order to get an x86_64 simulator of a newer IOS version, one must set XCode to open in [emulation using Rosetta](https://www.macworld.com/article/338843/how-to-force-a-native-m1-mac-app-to-run-as-an-intel-app-instead.html). To run the project, open [GaloyApp.xcworkspace](./ios/GaloyApp.xcworkspace/) in XCode, choose an x86_64 simulator, and click the play button. This should start the Metro bundler in a new terminal as well as launch the simulator with the app.

---

## Running Storybook

From the command line in your generated app's root directory, enter `yarn storybook`
This starts up the storybook server.

In `index.js`, change `SHOW_STORYBOOK` to `true` and reload the app and run `yarn storybook`.

For Visual Studio Code users, there is a handy extension that makes it easy to load Storybook use cases into a running emulator via tapping on items in the editor sidebar. Install the `React Native Storybook` extension by `Orta`, hit `cmd + shift + P` and select "Reconnect Storybook to VSCode". Expand the STORYBOOK section in the sidebar to see all use cases for components that have `.story.tsx` files in their directories.

## Local development with galoy-client

The mobile app uses the [galoy-client](https://github.com/GaloyMoney/galoy-client) for communication with the galoy API and translations. If you want to make changes to the galoy-client locally to test changes in the app e.g. you want to add a key to the translations file this is the steps you should take. Since the metro bundler [does not support](https://github.com/facebook/metro/issues/68) `yarn link`, we have to use [yalc](https://www.npmjs.com/package/yalc).

**Before you run these commands the client will need to be published using `yalc`. Instructions for this are included in the readme for the client.**

`npx yalc add @galoymoney/client`

When you are finished developing locally and are ready to push to github you will need to remove the yalc dependency using the following command.

`npx yalc remove @galoymoney/client`

There is a husky pre-push hook which will check for yalc references in the `package.json` file.

## Adding new fonts

**These instructions are correct as of react-native 0.69. If you are using a different version, you may need to adjust the instructions.**

1. Add the new fonts to the `assets/fonts` directory.
2. Run `yarn fonts` to link the font files to the native projects.
3. You should see the new font in the `ios/GaloyApp/Info.plist` file and the `android/app/src/main/assets/fonts` directory.
