fastlane documentation
================
# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```
xcode-select --install
```

Install _fastlane_ using
```
[sudo] gem install fastlane -NV
```
or alternatively using `brew install fastlane`

# Available Actions
## Android
### android test
```
fastlane android test
```
Runs all the tests
### android increment_build
```
fastlane android increment_build
```
Increment Build Number
### android build
```
fastlane android build
```
Submit a new Beta Build to Crashlytics Beta
### android beta
```
fastlane android beta
```
Deploy a new version to both Play Store and Huawei Store
### android play_store_release
```
fastlane android play_store_release
```
Deploy a new version to the Google Play
### android build_apk
```
fastlane android build_apk
```
Create Release APK
### android distribute_firebase
```
fastlane android distribute_firebase
```
Deploy a new version to Firebase

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
