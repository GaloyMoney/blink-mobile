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
### codepush_ios
```
fastlane codepush_ios
```

### codepush_android
```
fastlane codepush_android
```

### codepush
```
fastlane codepush
```


----

## iOS
### ios increment_version
```
fastlane ios increment_version
```
Increment version minor number for the iOS application.
### ios increment_build
```
fastlane ios increment_build
```
Increment build number for the iOS application.
### ios build
```
fastlane ios build
```
Build the iOS application.
### ios beta
```
fastlane ios beta
```
Release On TestFlight
### ios release
```
fastlane ios release
```


----

## Android
### android beta
```
fastlane android beta
```
Setup Android build and release to beta
### android release
```
fastlane android release
```


----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
