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
## iOS
### ios beta
```
fastlane ios beta
```
Push a new beta build to TestFlight
### ios browserstack
```
fastlane ios browserstack
```
End to end testing on browserstack
### ios increment
```
fastlane ios increment
```
increment path version
### ios build_ipa
```
fastlane ios build_ipa
```
build ipa
### ios build_e2e
```
fastlane ios build_e2e
```
Build for end to end tests

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
